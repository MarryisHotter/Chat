
<?php
if (isset($_GET['username'])) {
    $dbUsername = $_GET['username'];
    include 'config.php';
    
    $conn = new mysqli($servername, $dbUsername, $dbPassword);
    $conn->select_db("chat_app");

    $sql = "SELECT username, status FROM users WHERE username='$dbUsername'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['username' => $user['username'], 'status' => $user['status']]);
    } else {
        echo json_encode(['username' => $dbUsername, 'status' => 'Status not available']);
    }
    $conn->close();
} else {
    echo json_encode(['username' => 'Unknown', 'status' => '']);
}
?>