<?php
session_start();
include 'config.php';

header('Content-Type: application/json');

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Check if the user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not logged in.']);
    exit;
}

$username = $_SESSION['username'];

$conn = new mysqli($servername, $dbUsername, $dbPassword, 'chat_app');

// Check the connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed.']);
    exit;
}

// Get the status from POST data
$status = isset($_POST['status']) ? $_POST['status'] : '';

// Prepare and execute the update statement
$stmt = $conn->prepare("UPDATE users SET status = ? WHERE username = ?");
$stmt->bind_param("ss", $status, $username);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Failed to update status.']);
}

$stmt->close();
$conn->close();
?>
