<?php
if (isset($_GET['username'])) {
    $username = $_GET['username'];
    
    require_once 'config.php'; // Include the configuration file

    $sql = "SELECT username, status FROM users WHERE username='$username'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['username' => $user['username'], 'status' => $user['status']]);
    } else {
        echo json_encode(['username' => $username, 'status' => 'Status not available']);
    }
    $conn->close();
} else {
    echo json_encode(['username' => 'Unknown', 'status' => '']);
}
?>