<?php
session_start();

// Set the Content-Type header to application/json
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    // Return an error in JSON format instead of redirecting
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Suppress error reporting to prevent invalid JSON output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log'); // Adjust the path if necessary

include 'config.php';
$dbUsername = "root";
$dbPassword = "";
$conn = new mysqli($servername, $dbUsername, $dbPassword);

// Check for connection errors
if ($conn->connect_error) {
    error_log('Database connection error: ' . $conn->connect_error);
    echo json_encode(['error' => 'Database connection error.']);
    exit;
}

// Select the database
if (!$conn->select_db("chat_app")) {
    error_log('Database selection error: ' . $conn->error);
    echo json_encode(['error' => 'Database selection error.']);
    exit;
}

// Fetch the channels available to the user
$dbUsername = $_SESSION['username'];

// Prepare and execute the query to fetch channels
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
$stmt->bind_param("s", $dbUsername);
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

// Return the channels in JSON format
echo json_encode(['channels' => $channels]);
?>