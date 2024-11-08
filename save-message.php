<?php
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
} else {
    error_log("Connection successful");
}

// Create database if it doesn't exist
$dbSql = "CREATE DATABASE IF NOT EXISTS chat_app";
if ($conn->query($dbSql) === TRUE) {
    error_log("Database 'chat_app' checked/created successfully");
} else {
    error_log("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db("chat_app");

// Create table if it doesn't exist
$tableSql = "CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($tableSql) === TRUE) {
    error_log("Table 'messages' checked/created successfully");
} else {
    error_log("Error creating table: " . $conn->error);
}

// Check if POST data is received
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['channel']) && isset($_POST['username']) && isset($_POST['message'])) {
        $channel = $conn->real_escape_string($_POST['channel']);
        $username = $conn->real_escape_string($_POST['username']);
        $message = $conn->real_escape_string($_POST['message']);

        $sql = "INSERT INTO messages (channel, username, message) VALUES ('$channel', '$username', '$message')";

        if ($conn->query($sql) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "Error: Missing POST data";
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Retrieve messages for a specific channel
    if (isset($_GET['channel'])) {
        $channel = $conn->real_escape_string($_GET['channel']);
        $sql = "SELECT username, message, DATE_FORMAT(timestamp, '%e.%c.%Y %H:%i') as timestamp FROM messages WHERE channel='$channel' ORDER BY timestamp ASC";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $messages = [];
            while($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }
            echo json_encode($messages);
        } else {
            echo "No messages found";
        }
    } else {
        echo "Error: Missing GET data";
    }
}

$conn->close();
?>
