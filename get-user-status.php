
<?php
include 'config.php';

header('Content-Type: application/json');

if (isset($_GET['username'])) {
    $conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

    if ($conn->connect_error) {
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    $username = $conn->real_escape_string($_GET['username']);
    $sql = "SELECT status FROM users WHERE username='$username'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows == 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['username' => $username, 'status' => $user['status']]);
    } else {
        echo json_encode(['error' => 'User not found']);
    }

    $conn->close();
} else {
    echo json_encode(['error' => 'Username not provided']);
}
?>