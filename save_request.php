<?php
header('Content-Type: application/json');

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['success' => false, 'message' => 'Invalid request method']));
}

// Get the request data
$description = isset($_POST['description']) ? trim($_POST['description']) : '';

if (empty($description)) {
    exit(json_encode(['success' => false, 'message' => 'Description is required']));
}

// File path for storing requests
$file = 'calculator_requests.txt';

// Format the request entry
$timestamp = date('Y-m-d H:i:s');
$entry = "Request Time: {$timestamp}\nDescription: {$description}\n" . str_repeat('-', 50) . "\n\n";

// Append to file
try {
    if (file_put_contents($file, $entry, FILE_APPEND | LOCK_EX)) {
        echo json_encode(['success' => true, 'message' => 'Request saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save request']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}
?>