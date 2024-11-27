<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

include('config.php');

$conn = new mysqli($servername, $dbUsername, $dbPassword);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
} else {
    error_log("Connection successful");
}

$dbSql = "CREATE DATABASE IF NOT EXISTS chat_app";
if ($conn->query($dbSql) === TRUE) {
    error_log("Database 'chat_app' checked/created successfully");
} else {
    error_log("Error creating database: " . $conn->error);
}

$conn->select_db("chat_app");

$tableSql = "CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($tableSql) === TRUE) {
    error_log("Table 'messages' checked/created successfully");
} else {
    error_log("Error creating table: " . $conn->error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['channel']) && isset($_POST['message']) && isset($_SESSION['username'])) {
        $channel = $conn->real_escape_string($_POST['channel']);
        $username = $conn->real_escape_string($_SESSION['username']);
        $message = $conn->real_escape_string($_POST['message']);
        $timestamp = date('Y-m-d H:i:s');

        $stmt = $conn->prepare("INSERT INTO messages (channel, username, message, timestamp) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $channel, $username, $message, $timestamp);

        if ($stmt->execute()) {
            echo json_encode(['success' => 'Message saved successfully']);
        } else {
            echo json_encode(['error' => 'Error saving message']);
        }

        $stmt->close();
    } else {
        echo "Error: Missing data";
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['channel'])) {
        $channel = $conn->real_escape_string($_GET['channel']);
        $sql = "SELECT username, message, timestamp FROM messages WHERE channel='$channel' ORDER BY timestamp ASC";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $messages = [];
            while($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }
            echo json_encode($messages);
        } else {
            echo "No messages found";
        }
    } else {
        echo "Error: Missing GET data";
    }
}

$conn->close();
?>