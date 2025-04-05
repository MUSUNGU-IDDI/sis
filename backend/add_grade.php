<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'db_connection.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    // Validate required fields
    if (empty($data['student_id']) || empty($data['subject']) || empty($data['grade'])) {
        throw new Exception('Missing required fields');
    }

    $stmt = $conn->prepare("
        INSERT INTO grades (student_id, subject, grade)
        VALUES (:student_id, :subject, :grade)
    ");
    
    $success = $stmt->execute([
        ':student_id' => $data['student_id'],
        ':subject' => $data['subject'],
        ':grade' => $data['grade']
    ]);

    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Grade added successfully' : 'Failed to add grade',
        'grade_id' => $conn->lastInsertId()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>