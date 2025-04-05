<?php
header("Content-Type: application/json");
require 'db_connection.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is authenticated
if (empty($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Get current user data
$user = $_SESSION['user'];

// For endpoints that require specific roles
function requireRole($requiredRole) {
    global $user;
    
    if ($user['role'] !== $requiredRole) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden: Insufficient privileges"]);
        exit;
    }
}

// For endpoints that require student access
function requireStudent() {
    global $user;
    
    if ($user['role'] !== 'student' || empty($user['student_id'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden: Student access required"]);
        exit;
    }
    
    return $user['student_id'];
}

// Make user data available to protected endpoints
$currentUser = [
    'user_id' => $user['user_id'],
    'email' => $user['email'],
    'role' => $user['role'],
    'name' => $user['name']
];

if ($user['role'] === 'student') {
    $currentUser['student_id'] = $user['student_id'];
}
?>