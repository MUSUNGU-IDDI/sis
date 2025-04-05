<?php
session_start();
header("Content-Type: application/json");
require_once 'db_connection.php';
if (empty($_SESSION['user'])) {
    http_response_code(403);
    die(json_encode(['error' => 'Unauthorized']));
}

try {
    // Verify session exists
    if (!isset($_SESSION['user'])) {
        throw new Exception("Authentication required");
    }

    $user = $_SESSION['user'];
    $requested_student_id = $_GET['student_id'] ?? null;

    // Student: Only their grades (original functionality)
    if ($user['role'] === 'student') {
        if ($requested_student_id && $requested_student_id != $user['student_id']) {
            throw new Exception("You can only view your own grades");
        }
        $student_id = $user['student_id']; // Force their own ID
    }
    // Lecturer/Admin: All grades or specific student (new functionality)
    elseif ($user['role'] === 'lecturer' || $user['role'] === 'admin') {
        $student_id = $requested_student_id; // Use requested ID or null for all
    }
    else {
        throw new Exception("Unauthorized access");
    }

    // Base query
    $query = "
        SELECT g.subject, g.grade, s.name as student_name, s.student_id
        FROM grades g
        JOIN students s ON g.student_id = s.student_id
    ";

    // Add WHERE clause if specific student requested
    if ($student_id) {
        $query .= " WHERE g.student_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$student_id]);
    } else {
        // Lecturers/Admins get all grades when no ID specified
        $stmt = $conn->prepare($query);
        $stmt->execute();
    }
    
    echo json_encode([
        'success' => true,
        'data' => $stmt->fetchAll()
    ]);
    
} catch(Exception $e) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>