<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

include 'config.php';
$dbUsername = "root";
$dbPassword = "";
$conn = new mysqli($servername, $dbUsername, $dbPassword);
$conn->select_db("chat_app");

$channelId = $_GET['channel'];

$stmt = $conn->prepare("SELECT username, message, timestamp FROM messages WHERE channel = ? ORDER BY timestamp ASC");
$stmt->bind_param("s", $channelId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = [
        'username' => $row['username'],
        'message' => $row['message'],
        'timestamp' => $row['timestamp']
    ];
}

$stmt->close();
$conn->close();

echo json_encode($messages);
?>