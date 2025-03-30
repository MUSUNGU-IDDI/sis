<?php
header("Content-Type: application/json");
require 'db_config.php'; // Ensure this matches your actual file structure
require 'auth_guard.php';//

authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['student_id']) || empty($input['subject']) || empty($input['grade'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$student_id = intval($input['student_id']);
$subject = htmlspecialchars($input['subject']); // Prevent XSS
$grade = strtoupper(htmlspecialchars($input['grade'])); // Convert to uppercase (A-F)

// Insert into grades table
$stmt = $conn->prepare("INSERT INTO grades (student_id, subject, grade) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $student_id, $subject, $grade);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade added successfully"]);
} else {
    echo json_encode(["message" => "Failed to add grade"]);
}

$stmt->close();
$conn->close();
?>
