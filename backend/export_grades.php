<?php
require 'db_config.php';
require 'auth_guard.php';

authorize_role(['admin']);

header('Content-Type: text/csv');
header('Content-Disposition: attachment;filename=grades_export.csv');

$output = fopen('php://output', 'w');
fputcsv($output, ['Grade ID', 'Student ID', 'Subject', 'Grade', 'Date Entered']);

$sql = "SELECT grade_id, student_id, subject, grade, created_at FROM grades";
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}

fclose($output);
$conn->close();
exit;
