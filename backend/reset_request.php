<?php
header("Content-Type: application/json");
require 'db_config.php';

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

// Step 1: Check if email is provided
if (empty($input['email'])) {
    echo json_encode(["message" => "Email is required"]);
    exit;
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);

// Step 2: Check if the email exists in the database
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["message" => "Email not found"]);
    exit;
}

// In a production app, you’d generate a reset token and email it.
// For now, just simulate and allow direct reset manually.
echo json_encode(["message" => "Email verified. You may now reset your password."]);
$stmt->close();
$conn->close();
?>
