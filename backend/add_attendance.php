<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['student_id']) || empty($input['date']) || empty($input['status'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$student_id = intval($input['student_id']);
$date = $input['date']; // Format: YYYY-MM-DD
$status = htmlspecialchars($input['status']); // Present or Absent

// Insert into attendance table
$stmt = $conn->prepare("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $student_id, $date, $status);

if ($stmt->execute()) {
    echo json_encode(["message" => "Attendance entry successful"]);
} else {
    echo json_encode(["message" => "Attendance entry failed"]);
}

$stmt->close();
$conn->close();
?>
