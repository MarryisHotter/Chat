<?php
session_start();

header('Content-Type: application/json'); // Ensure the response is JSON
error_log("You messed up!", 3, "php-error.log");
if (isset($_SESSION['username'])) {
    include 'config.php';

    $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    $dbUsername = $_SESSION['username'];
    error_log("Session username: " . $dbUsername); // Debugging line

    $sql = "SELECT status FROM users WHERE username='$dbUsername'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows == 1) {
        $user = $result->fetch_assoc();
        $status = $user['status'];
        echo json_encode(['username' => $dbUsername, 'status' => $status]);
    } else {
        error_log("User not found or multiple users with the same username"); // Debugging line
        echo json_encode(['username' => $dbUsername, 'status' => 'unknown']);
    }

    $conn->close();
} else {
    error_log("Session username not set"); // Debugging line
    echo json_encode(['username' => 'Guest', 'status' => 'offline']);
}
?>