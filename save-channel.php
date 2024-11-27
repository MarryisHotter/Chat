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

require_once 'config.php';

$channelName = $_POST['channelName'] ?? null;
$channelType = $_POST['channelType'] ?? null;
$channelId = uniqid();
$users = isset($_POST['users']) ? json_decode($_POST['users'], true) : [];
$creatorUsername = $_SESSION['username'];

if (!$channelName || !$channelType) {
    echo json_encode(['error' => 'Channel name and type are required.']);
    exit;
}

$stmt_check = $conn->prepare("SELECT id FROM channels WHERE name = ?");
if (!$stmt_check) {
    error_log('Statement preparation error (check): ' . $conn->error);
    echo json_encode(['error' => 'Database error during channel name check.']);
    exit;
}
$stmt_check->bind_param("s", $channelName);
$stmt_check->execute();
$result = $stmt_check->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['error' => 'Channel name already exists. Please choose a different name.']);
    $stmt_check->close();
    $conn->close();
    exit;
}
$stmt_check->close();

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
        $stmt_user->bind_param("ss", $channelId, $creatorUsername);
        if (!$stmt_user->execute()) {
            error_log('Statement execution error (user insert): ' . $stmt_user->error);
            echo json_encode(['error' => 'Error adding creator to channel.']);
            exit;
        }
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