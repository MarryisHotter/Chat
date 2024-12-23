<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

include 'config.php';
$conn = new mysqli($servername, $dbUsername, $dbPassword);

if ($conn->connect_error) {
    error_log('Database connection error: ' . $conn->connect_error);
    echo json_encode(['error' => 'Database connection error.']);
    exit;
}

$sql = "CREATE DATABASE IF NOT EXISTS chat_app";
if ($conn->query($sql) === FALSE) {
    error_log('Error creating database: ' . $conn->error);
    echo json_encode(['error' => 'Error creating database.']);
    exit;
}

if (!$conn->select_db("chat_app")) {
    error_log('Database selection error: ' . $conn->error);
    echo json_encode(['error' => 'Database selection error.']);
    exit;
}

$sql = "
CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('public', 'private') NOT NULL,
    creator_username VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS channel_users (
    channel_id VARCHAR(255),
    username VARCHAR(255),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL
);
";

if ($conn->multi_query($sql) === FALSE) {
    error_log('Error creating tables: ' . $conn->error);
    echo json_encode(['error' => 'Error creating tables.']);
    exit;
}

while ($conn->more_results() && $conn->next_result()) {}

$channelName = $_POST['channelName'] ?? null;
$channelType = $_POST['channelType'] ?? null;
$channelId = uniqid();
$users = isset($_POST['users']) ? json_decode($_POST['users'], true) : [];
$creatorUsername = $_SESSION['username'];

if (!$channelName || !$channelType) {
    echo json_encode(['error' => 'Channel name and type are required.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO channels (id, name, type, creator_username) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    error_log('Statement preparation error (insert): ' . $conn->error);
    echo json_encode(['error' => 'Database error during channel creation.']);
    exit;
}
$stmt->bind_param("ssss", $channelId, $channelName, $channelType, $creatorUsername);

if ($stmt->execute()) {
    if ($channelType === 'private') {
        $stmt_user = $conn->prepare("INSERT INTO channel_users (channel_id, username) VALUES (?, ?)");
        if (!$stmt_user) {
            error_log('Statement preparation error (user insert): ' . $conn->error);
            echo json_encode(['error' => 'Database error during user addition.']);
            exit;
        }
        // Add the creator to the private channel. Legacy code
        $stmt_user->bind_param("ss", $channelId, $creatorUsername);
        if (!$stmt_user->execute()) {
            error_log('Statement execution error (user insert): ' . $stmt_user->error);
            echo json_encode(['error' => 'Error adding creator to channel.']);
            exit;
        }
        // Add specified users to the private channel
        foreach ($users as $user) {
            $stmt_user->bind_param("ss", $channelId, $user);
            if (!$stmt_user->execute()) {
                error_log('Statement execution error (user insert): ' . $stmt_user->error);
                echo json_encode(['error' => 'Error adding user to channel.']);
                exit;
            }
        }
        $stmt_user->close();
    }
    echo json_encode([
        'success' => 'Channel created successfully',
        'channel' => [
            'id' => $channelId,
            'name' => $channelName,
            'type' => $channelType
        ]
    ]);
} else {
    error_log('Statement execution error (insert): ' . $stmt->error);
    echo json_encode(['error' => 'Error creating channel.']);
}

$stmt->close();
$conn->close();
?>