<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Suppress error reporting to prevent invalid JSON output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

require_once 'config.php'; // Include the configuration file

$username = $_SESSION['username'];

$stmt = $conn->prepare("
    SELECT id, name, type 
    FROM channels 
    WHERE type = 'public' 
    OR id IN (SELECT channel_id FROM channel_users WHERE username = ?)
");
if (!$stmt) {
    error_log('Statement preparation error: ' . $conn->error);
    echo json_encode(['error' => 'Database error during channel fetch.']);
    exit;
}
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$channels = [];
while ($row = $result->fetch_assoc()) {
    $channels[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode(['channels' => $channels]);
?>