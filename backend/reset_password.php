<?php
header("Content-Type: application/json");
require 'db_config.php';

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

// Check inputs
if (empty($input['email']) || empty($input['new_password'])) {
    echo json_encode(["message" => "Email and new password are required"]);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
$new_password = $input['new_password'];

// Step 1: Check if email exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["message" => "Email not found"]);
    exit;
}

// Step 2: Hash the new password
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

// Step 3: Update password in the database
$update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$update->bind_param("ss", $hashed_password, $email);

if ($update->execute()) {
    echo json_encode(["message" => "Password reset successful"]);
} else {
    echo json_encode(["message" => "Failed to reset password"]);
}

$stmt->close();
$update->close();
$conn->close();
?>
