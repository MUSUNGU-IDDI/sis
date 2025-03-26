<?php
// db_config.php
$host = 'localhost';  // Your MySQL host
$user = 'root';       // Default username for XAMPP MySQL is 'root'
$password = '';       // Default password is empty (unless you set one)
$database = 'student_info_system';

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// Uncomment the following line to debug connection
// echo "Connected successfully";
?>
