<?php
if (isset($_COOKIE['PHPSESSID'])) {
    header('Location: /chat.html');
} else {
    header('Location: /login.html');
    exit();
}
?>
