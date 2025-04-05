<?php
// Disable error output to prevent corrupting JSON
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connection.php';

$response = [
    'success' => false,
    'message' => 'An error occurred'
];

try {
    // Verify request method
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Only GET requests are allowed');
    }

    // Validate grade ID
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('Grade ID is required');
    }

    $grade_id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($grade_id === false || $grade_id <= 0) {
        throw new Exception('Invalid grade ID');
    }

    // Prepare and execute delete statement
    $stmt = $conn->prepare("DELETE FROM grades WHERE grade_id = :grade_id");
    $stmt->bindParam(':grade_id', $grade_id, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute delete query');
    }

    $rowsAffected = $stmt->rowCount();
    if ($rowsAffected > 0) {
        $response = [
            'success' => true,
            'message' => 'Grade deleted successfully',
            'deleted_id' => $grade_id
        ];
    } else {
        $response = [
            'success' => false,
            'message' => 'No grade found with that ID',
            'deleted_id' => null
        ];
    }

} catch (PDOException $e) {
    $response = [
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ];
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// Clear any output buffers and send JSON
ob_clean();
echo json_encode($response);
exit;
?>