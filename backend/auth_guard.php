<?php
session_start();

/**
 * Checks if the current session user is logged in and has allowed role(s)
 * @param array $allowed_roles - roles allowed to access the endpoint
 */
function authorize_role($allowed_roles = []) {
    // Check if user session exists
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: Login required"]);
        exit;
    }

    // Get user's role from session
    $user_role = $_SESSION['user']['role'];

    // Check if role is allowed
    if (!in_array($user_role, $allowed_roles)) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden: You don't have permission"]);
        exit;
    }
}
