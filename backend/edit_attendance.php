<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['attendance_id']) || empty($input['date']) || empty($input['status'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$attendance_id = intval($input['attendance_id']);
$date = $input['date'];
$status = htmlspecialchars($input['status']);

$stmt = $conn->prepare("UPDATE attendance SET date = ?, status = ? WHERE attendance_id = ?");
$stmt->bind_param("ssi", $date, $status, $attendance_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Attendance updated successfully"]);
} else {
    echo json_encode(["message" => "Attendance update failed"]);
}

$stmt->close();
$conn->close();
?>
