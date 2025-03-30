<?php
header("Content-Type: application/json");
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['lecturer', 'admin']);

// Fetch all grades
$sql = "SELECT grades.grade_id, grades.student_id, students.name, grades.subject, grades.grade 
        FROM grades 
        JOIN students ON grades.student_id = students.student_id
        ORDER BY grades.grade_id DESC";

$result = $conn->query($sql);

$grades = [];
while ($row = $result->fetch_assoc()) {
    $grades[] = $row;
}

// Return JSON response
echo json_encode($grades);

$conn->close();
?>
