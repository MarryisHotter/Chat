<?php
session_start();

header('Content-Type: application/json'); // Ensure the response is JSON

if (isset($_SESSION['username'])) {
    require_once 'config.php'; // Include the configuration file

    $username = $_SESSION['username'];
    error_log("Session username: " . $username); // Debugging line

    $sql = "SELECT status FROM users WHERE username='$username'";
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