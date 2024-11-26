<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$servername = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbName = "chat_app";
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbName);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

if (isset($_GET['channel'])) {
    $channelId = $conn->real_escape_string($_GET['channel']);

    $stmt = $conn->prepare("
        SELECT users.username 
        FROM channel_users
        JOIN users ON channel_users.username = users.username
        WHERE channel_users.channel_id = ?
    ");
    $stmt->bind_param("s", $channelId);
    $stmt->execute();
    $result = $stmt->get_result();

    $users = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = ['username' => $row['username']];
        }
    }

    // Return an empty users array if no users are found
    echo json_encode(['users' => $users]);
} else {
    echo json_encode(['error' => 'Channel not specified']);
}

$stmt->close();
$conn->close();
?>