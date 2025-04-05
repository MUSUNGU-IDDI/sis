<?php
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");
header("Content-Type: application/json");
require_once 'db_connection.php';

if (empty($_SESSION['user'])) {
    http_response_code(401);
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

try {
    $user = $_SESSION['user'];
    
    // For LECTURERS/ADMINS: ALWAYS return array
    if ($user['role'] === 'lecturer' || $user['role'] === 'admin') {
        $stmt = $conn->query("SELECT student_id, name FROM students"); // Only fetch essential fields
        die(json_encode([
            'success' => true,
            'students' => $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [] // Ensure array
        ]));
    }
    // For STUDENTS: Return single student as array
    else {
        $stmt = $conn->prepare("SELECT student_id, name, email, course FROM students WHERE student_id = ?");
        $stmt->execute([$user['student_id']]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        die(json_encode([
            'success' => true,
            'students' => $student ? [$student] : [] // ← Single student wrapped in array
        ]));
    }
} catch(Exception $e) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]));
}
// Debugging tip: Add this to get_students.php
error_log("User role is: " . $_SESSION['user']['role']);
?>