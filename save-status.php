<?php
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['username'])) {
    include 'config.php';

    $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    $dbUsername = $_SESSION['username'];
    $status = isset($_POST['status']) ? $_POST['status'] : null;

    $stmt = $conn->prepare("UPDATE users SET status = ? WHERE username = ?");
    $stmt->bind_param('ss', $status, $dbUsername);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Failed to update status']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['error' => 'User not logged in']);
}
?>
