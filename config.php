<?php
$local = true;
ini_set('display_errors', 1);
if ($local) {
    $servername = "localhost";
    $dbUsername = "root";
    $dbPassword = "";
    $dbname = "chat_app";
} else {
    $servername = "mysql";
    $dbUsername = "mario";
    $dbPassword = "zTUMGzNToCinAzEcdIlGWIOAu";
    $dbname = "chat_app";
}
?>