
<?php
session_start();
if (isset($_SESSION['username'])) {
    $dbUsername = $_SESSION['username'];
    include 'config.php';
    
    $conn = new mysqli($servername, $dbUsername, $dbPassword);
    $conn->select_db("chat_app");

    $sql = "SELECT email, status FROM users WHERE username='$dbUsername'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['email' => $user['email'], 'status' => $user['status']]);
    } else {
        echo json_encode(['email' => '', 'status' => '']);
    }
    $conn->close();
} else {
    echo json_encode(['email' => '', 'status' => '']);
}
?>