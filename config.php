<?php
// Start the session if it's not already started
if (session_status() == PHP_SESSION_NONE) {
    session_name('chat_app_session');
    session_start();
}

$local = false;

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