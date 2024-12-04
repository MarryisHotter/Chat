
<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

include 'config.php';
$conn = new mysqli($servername, $dbUsername, $dbPassword);
$conn->select_db("chat_app");

$currentUsername = $_SESSION['username'];
$query = isset($_GET['query']) ? $_GET['query'] : '';
$searchText = '%' . $conn->real_escape_string($query) . '%';
$startsWithText = $conn->real_escape_string($query) . '%';

$stmt = $conn->prepare("
    SELECT username,
        CASE
            WHEN username LIKE ? THEN 1
            ELSE 2
        END AS sort_order
    FROM users
    WHERE username != ? AND username LIKE ?
    ORDER BY sort_order, username ASC
    LIMIT 6
");
$stmt->bind_param("sss", $startsWithText, $currentUsername, $searchText);
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = ['username' => $row['username']];
}

$stmt->close();
$conn->close();

echo json_encode(['users' => $users]);
?>