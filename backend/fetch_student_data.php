<?php
session_start();
include 'db_config.php';

$student_id = 10; // TEMP for testing (replace later with $_SESSION['user_id'])

$response = ['success' => false];

// ✅ Student Profile (updated query to match your table structure)
$sqlProfile = "SELECT name, email, course, created_at FROM students WHERE student_id = ?";
$stmtProfile = $conn->prepare($sqlProfile);
$stmtProfile->bind_param("i", $student_id);
$stmtProfile->execute();
$resultProfile = $stmtProfile->get_result();
$profile = $resultProfile->fetch_assoc();

// ✅ Grades
$sqlGrades = "SELECT subject, grade FROM grades WHERE student_id = ?";
$stmtGrades = $conn->prepare($sqlGrades);
$stmtGrades->bind_param("i", $student_id);
$stmtGrades->execute();
$gradesResult = $stmtGrades->get_result();
$grades = [];
while ($row = $gradesResult->fetch_assoc()) {
    $grades[] = $row;
}

// ✅ Attendance
$sqlAttendance = "SELECT date, status FROM attendance WHERE student_id = ?";
$stmtAttendance = $conn->prepare($sqlAttendance);
$stmtAttendance->bind_param("i", $student_id);
$stmtAttendance->execute();
$attendanceResult = $stmtAttendance->get_result();
$attendance = [];
while ($row = $attendanceResult->fetch_assoc()) {
    $attendance[] = $row;
}

// ✅ Response
$response['success'] = true;
$response['profile'] = $profile;
$response['grades'] = $grades;
$response['attendance'] = $attendance;

echo json_encode($response);
?>
