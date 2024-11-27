<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');

require_once 'config.php'; 

$username = $_SESSION['username'];

$stmt = $conn->prepare("
    SELECT channels.id, channels.name, channels.type
    FROM channels
    LEFT JOIN channel_users ON channels.id = channel_users.channel_id
    WHERE channels.type = 'public' OR channel_users.username = ?
    GROUP BY channels.id
");
if (!$stmt) {
    error_log('Statement preparation error: ' . $conn->error);
    echo json_encode(['error' => 'Database error during channel retrieval.']);
    exit;
}
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$channels = [];
while ($row = $result->fetch_assoc()) {
    $channels[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'type' => $row['type']
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['channels' => $channels]);
?>