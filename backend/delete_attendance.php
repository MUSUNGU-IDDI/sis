<?php
// Strict error reporting
error_reporting(0); // Disable error output to prevent corrupting JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connection.php';

// Initialize response array
$response = [
    'success' => false,
    'message' => 'Unknown error occurred'
];

try {
    // Verify request method
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Only GET requests are allowed');
    }

    // Validate ID parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('Attendance ID is required');
    }

    $attendance_id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($attendance_id === false || $attendance_id <= 0) {
        throw new Exception('Invalid attendance ID format');
    }

    // Prepare and execute delete statement
    $stmt = $conn->prepare("DELETE FROM attendance WHERE attendance_id = :id");
    $stmt->bindParam(':id', $attendance_id, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute database query');
    }

    $rowsAffected = $stmt->rowCount();
    if ($rowsAffected > 0) {
        $response = [
            'success' => true,
            'message' => 'Attendance record deleted successfully',
            'deleted_id' => $attendance_id
        ];
    } else {
        $response = [
            'success' => false,
            'message' => 'No attendance record found with that ID',
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

// Ensure no output before this
ob_clean(); // Clear any potential output buffers
echo json_encode($response);
exit;
?>