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

    // Student: Only their attendance (original functionality)
    if ($user['role'] === 'student') {
        if ($requested_student_id && $requested_student_id != $user['student_id']) {
            throw new Exception("You can only view your own attendance");
        }
        $student_id = $user['student_id']; // Force their own ID
    }
    // Lecturer/Admin: All attendance or specific student (new functionality)
    elseif ($user['role'] === 'lecturer' || $user['role'] === 'admin') {
        $student_id = $requested_student_id; // Use requested ID or null for all
    }
    else {
        throw new Exception("Unauthorized access");
    }

    // Base query with student name join
    $query = "
        SELECT a.date, a.status, s.name as student_name, s.student_id
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
    ";

    // Add WHERE clause if specific student requested
    if ($student_id) {
        $query .= " WHERE a.student_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$student_id]);
    } else {
        // Lecturers/Admins get all attendance when no ID specified
        $stmt = $conn->prepare($query);
        $stmt->execute();
    }
    
    echo json_encode([
        'success' => true,
        'attendance' => $stmt->fetchAll()
    ]);
    
} catch(Exception $e) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>