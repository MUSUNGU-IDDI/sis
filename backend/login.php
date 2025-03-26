<?php
session_start();
header("Content-Type: application/json");

// Include the database configuration file
require 'db_config.php';

// Retrieve JSON input from the request body
$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

// Ensure both email and password are provided
if (empty($input['email']) || empty($input['password'])) {
    echo json_encode(["message" => "Email and Password are required"]);
    exit;
}

$email = $input['email'];
$password = $input['password'];

// Prepare the SQL statement to fetch the user by email
$stmt = $conn->prepare("SELECT user_id, name, email, password, role FROM users WHERE email = ?");
if (!$stmt) {
    echo json_encode(["message" => "Database error: " . $conn->error]);
    exit;
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if a user with the provided email exists
if ($result->num_rows === 0) {
    echo json_encode(["message" => "Invalid credentials"]);
    exit;
}

// Fetch the user data
$user = $result->fetch_assoc();

// Verify the password using password_verify
if (password_verify($password, $user['password'])) {
    // If verification is successful, store user data in the session
    $_SESSION['user'] = [
        "user_id" => $user['user_id'],
        "name"    => $user['name'],
        "email"   => $user['email'],
        "role"    => $user['role']
    ];
    echo json_encode(["message" => "Login successful", "user" => $_SESSION['user']]);
} else {
    echo json_encode(["message" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
?>
