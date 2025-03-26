<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['attendance_id'])) {
    echo json_encode(["message" => "Attendance ID is required"]);
    exit;
}

$attendance_id = intval($input['attendance_id']);

$stmt = $conn->prepare("DELETE FROM attendance WHERE attendance_id = ?");
$stmt->bind_param("i", $attendance_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Attendance record deleted successfully"]);
} else {
    echo json_encode(["message" => "Attendance deletion failed"]);
}

$stmt->close();
$conn->close();
?>
