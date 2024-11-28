<?php
session_start();
include 'config.php';

header('Content-Type: application/json'); // Ensure the response is JSON

if (isset($_SESSION['username'])) {
    $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    $username = $_SESSION['username'];
    $usernameEscaped = $conn->real_escape_string($username);
    error_log("Session username: " . $username); // Debugging line

    $sql = "SELECT status FROM users WHERE username='$usernameEscaped'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows == 1) {
        $user = $result->fetch_assoc();
        $status = $user['status'];
        echo json_encode(['username' => $username, 'status' => $status]);
    } else {
        error_log("User not found or multiple users with the same username"); // Debugging line
        echo json_encode(['username' => $username, 'status' => 'unknown']);
    }

    $conn->close();
} else {
    error_log("Session username not set"); // Debugging line
    echo json_encode(['username' => 'Guest', 'status' => 'offline']);
}
?>