<?php
session_start();
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS chat_app";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists";
} else {
    echo "Error creating database: " . $conn->error;
}


// Select the database
$conn->select_db("chat_app");

// Create 'users' table if it doesn't exist
$userTableSql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
)";
$conn->query($userTableSql);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $username = $conn->real_escape_string($_POST['username']);
    $password = $_POST['password'];

    if ($action === 'register') {
        // Registration logic
        if (strlen($password) < 8) {
            echo "Password must be at least 8 characters.";
            exit;
        }
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (username, password) VALUES ('$username', '$hashedPassword')";
        if ($conn->query($sql) === TRUE) {
            $_SESSION['username'] = $username;
            header("Location: chat.html");
        } else {
            echo "Username already exists.";
        }
    } elseif ($action === 'login') {
        // Login logic
        $sql = "SELECT * FROM users WHERE username='$username'";
        $result = $conn->query($sql);
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                $_SESSION['username'] = $username;
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