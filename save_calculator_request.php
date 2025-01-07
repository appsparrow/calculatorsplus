<?php
header('Content-Type: application/json');

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['success' => false, 'message' => 'Invalid request method']));
}

// Get the request data
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';

// Validate inputs
if (empty($email) || empty($description)) {
    exit(json_encode(['success' => false, 'message' => 'All fields are required']));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit(json_encode(['success' => false, 'message' => 'Invalid email format']));
}

// File path for storing requests
$file = 'calculator_requests.json';

// Prepare the new request entry
$newRequest = [
    'timestamp' => date('Y-m-d H:i:s'),
    'email' => $email,
    'description' => $description
];

// Read existing requests or create empty array
$requests = [];
if (file_exists($file)) {
    $jsonContent = file_get_contents($file);
    if ($jsonContent) {
        $requests = json_decode($jsonContent, true) ?? [];
    }
}

// Add new request
$requests[] = $newRequest;

// Save back to file
try {
    if (file_put_contents($file, json_encode($requests, JSON_PRETTY_PRINT), LOCK_EX)) {
        echo json_encode(['success' => true, 'message' => 'Request saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save request']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}
?>