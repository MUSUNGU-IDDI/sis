<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['grade_id'])) {
    echo json_encode(["message" => "Grade ID is required"]);
    exit;
}

$grade_id = intval($input['grade_id']);

$stmt = $conn->prepare("DELETE FROM grades WHERE grade_id = ?");
$stmt->bind_param("i", $grade_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade deleted successfully"]);
} else {
    echo json_encode(["message" => "Grade deletion failed"]);
}

$stmt->close();
$conn->close();
?>
