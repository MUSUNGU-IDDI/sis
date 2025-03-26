<?php
header("Content-Type: application/json");
require 'db_config.php';

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if (empty($input['name']) || empty($input['email']) || empty($input['password']) || empty($input['role'])) {
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$name = htmlspecialchars($input['name']);
$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
$password = $input['password'];
$role = $input['role'];

$course = isset($input['course']) ? htmlspecialchars($input['course']) : null;

$valid_roles = ['student', 'lecturer', 'admin'];
if (!in_array($role, $valid_roles)) {
    echo json_encode(["message" => "Invalid role"]);
    exit;
}

$stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["message" => "Email already exists"]);
    exit;
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert into users table
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $hashed_password, $role);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id; // Get the ID of the inserted user

    // If role is student, also insert into students table
    if ($role === 'student') {
        // ✅ DO NOT override $course here again!
        $studentStmt = $conn->prepare("INSERT INTO students (user_id, name, email, course) VALUES (?, ?, ?, ?)");
        $studentStmt->bind_param("isss", $user_id, $name, $email, $course);
        $studentStmt->execute();
        $studentStmt->close();
    }

    echo json_encode(["message" => "User registered successfully"]);
} else {
    echo json_encode(["message" => "Error registering user"]);
}

$stmt->close();
$conn->close();
