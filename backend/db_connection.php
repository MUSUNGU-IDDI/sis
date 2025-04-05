<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'student_info_system';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = 'utf8mb4';

// Connection options
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false, // Important for security
    PDO::ATTR_TIMEOUT            => 5 // Set connection timeout
];

try {
    // Create connection
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, $options);
    
    // Verify connection works immediately
    $conn->query("SELECT 1")->fetch();
    
} catch (PDOException $e) {
    // More detailed error reporting
    $errorInfo = [
        'success' => false,
        'message' => 'Database connection failed',
        'error' => [
            'code' => $e->getCode(),
            'message' => $e->getMessage(),
            'host' => $host,
            'dbname' => $db
        ]
    ];
    
    die(json_encode($errorInfo));
}
register_shutdown_function(function() {
    if (http_response_code() === 500) {
        error_log("Database connection failed");
    }
});

// For debugging (remove in production)
// error_reporting(0);
?>