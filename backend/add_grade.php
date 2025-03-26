<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['student_id']) || empty($input['subject']) || empty($input['grade'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$student_id = intval($input['student_id']);
$subject = htmlspecialchars($input['subject']);
$grade = htmlspecialchars($input['grade']);

// Insert into grades table
$stmt = $conn->prepare("INSERT INTO grades (student_id, subject, grade) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $student_id, $subject, $grade);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade entry successful"]);
} else {
    echo json_encode(["message" => "Grade entry failed"]);
}

$stmt->close();
$conn->close();
?>
