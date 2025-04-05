<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['grade_id']) || empty($input['grade'])) {
    echo json_encode(["message" => "Grade ID and new grade are required"]);
    exit;
}

$grade_id = intval($input['grade_id']);
$grade = htmlspecialchars($input['grade']); // New grade (e.g., A, B, C, etc.)

// Update the grade in the database
$stmt = $conn->prepare("UPDATE grades SET grade = ? WHERE grade_id = ?");
$stmt->bind_param("si", $grade, $grade_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade updated successfully"]);
} else {
    echo json_encode(["message" => "Failed to update grade"]);
}

$stmt->close();
$conn->close();
?>
