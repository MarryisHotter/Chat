<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

require_once 'config.php'; // Include the configuration file

$currentUsername = $_SESSION['username'];

$stmt = $conn->prepare("SELECT username FROM users WHERE username != ?");
$stmt->bind_param("s", $currentUsername);
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = ['username' => $row['username']];
}

$stmt->close();
$conn->close();

echo json_encode(['users' => $users]);
?>