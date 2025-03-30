<?php
header("Content-Type: application/json");
require 'db_config.php';
//require 'auth_guard.php';

//authorize_role(['lecturer', 'admin']);

// Read and decode JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Input validation
if (empty($input['attendance_id']) || empty($input['student_id']) || empty($input['date']) || empty($input['status'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$attendance_id = intval($input['attendance_id']);
$student_id = intval($input['student_id']);
$date = $input['date']; // Format: YYYY-MM-DD
$status = htmlspecialchars($input['status']); // Present or Absent

// Update the attendance record
$stmt = $conn->prepare("UPDATE attendance SET student_id = ?, date = ?, status = ? WHERE attendance_id = ?");
$stmt->bind_param("issi", $student_id, $date, $status, $attendance_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Attendance updated successfully"]);
} else {
    echo json_encode(["message" => "Attendance update failed"]);
}

$stmt->close();
$conn->close();
?>
