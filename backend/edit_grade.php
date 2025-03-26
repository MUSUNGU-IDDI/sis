<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['grade_id']) || empty($input['subject']) || empty($input['grade'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$grade_id = intval($input['grade_id']);
$subject = htmlspecialchars($input['subject']);
$grade = htmlspecialchars($input['grade']);

$stmt = $conn->prepare("UPDATE grades SET subject = ?, grade = ? WHERE grade_id = ?");
$stmt->bind_param("ssi", $subject, $grade, $grade_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Grade updated successfully"]);
} else {
    echo json_encode(["message" => "Grade update failed"]);
}

$stmt->close();
$conn->close();
?>
