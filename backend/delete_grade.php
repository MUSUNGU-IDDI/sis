<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['grade_id'])) {
    echo json_encode(["message" => "Grade ID is required"]);
    exit;
}

$grade_id = intval($input['grade_id']);

// Delete grade from the database
$stmt = $conn->prepare("DELETE FROM grades WHERE grade_id = ?");
$stmt->bind_param("i", $grade_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade deleted successfully"]);
} else {
    echo json_encode(["message" => "Failed to delete grade"]);
}

$stmt->close();
$conn->close();
?>
