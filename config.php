
<?php
$servername = "mysql";
$dbUsername = "mario";
$dbPassword = "zTUMGzNToCinAzEcdIlGWIOAu";
$dbname = "chat_app";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

if ($conn->connect_error) {
    error_log('Database connection error: ' . $conn->connect_error);
    die('Database connection error.');
}
?>
