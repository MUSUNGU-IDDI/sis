<?php
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400, // 1 day
        'path' => '/',
        'secure' => false,    // Set to true if using HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

header("Access-Control-Allow-Origin: http://localhost/sis/backend/"); // Specific origin
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
require 'db_connection.php';

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$email = $input['email'];
$password = $input['password'];

try {
    $stmt = $conn->prepare("
        SELECT 
            u.user_id, 
            u.password, 
            u.role, 
            u.name,
            s.student_id,
            s.course
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        exit;
    }

    // Return all necessary student data
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "user_id" => $user['user_id'],
            "name" => $user['name'],
            "email" => $email,
            "role" => $user['role'],
            "student_id" => $user['student_id'],
            "course" => $user['course']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}
// After successful login verification:
    session_start();
    $_SESSION['user'] = [
        'user_id' => $user['user_id'],
        'email' => $email,
        'role' => $user['role'],
        // For students only:
        'student_id' => $user['role'] === 'student' ? $user['student_id'] : null
    ];
    
    // Set a session cookie
    setcookie('PHPSESSID', session_id(), [
        'expires' => time() + 86400, // 1 day
        'path' => '/',
        'secure' => true, // if using HTTPS
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
?>