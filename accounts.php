<?php
session_start();
include 'config.php';

// Create connection
$conn = new mysqli($servername, $dbUsername, $dbPassword);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Select the database
$conn->select_db("chat_app");

// Create 'users' table if it doesn't exist
$userTableSql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT NULL
)";
$conn->query($userTableSql);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $Username = $conn->real_escape_string($_POST['username']);
    $Password = $_POST['password'];

    if ($action === 'register') {
        // Registration logic
        if (strlen($Password) < 8) {
            echo "Password must be at least 8 characters.";
            exit;
        }
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (username, password) VALUES ('$Username', '$hashedPassword')";
        if ($conn->query($sql) === TRUE) {
            $_SESSION['username'] = $Username;
            header("Location: chat.html");
        } else {
            echo "Username already exists.";
        }
    } elseif ($action === 'login') {
        // Login logic
        $sql = "SELECT * FROM users WHERE username='$Username'";
        $result = $conn->query($sql);
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            if (password_verify($Password, $user['password'])) {
                $_SESSION['username'] = $Username;
                header("Location: chat.html");
            } else {
                echo "Invalid username or password.";
            }
        } else {
            echo "Invalid username or password.";
        }
    }
}
$conn->close();
?>