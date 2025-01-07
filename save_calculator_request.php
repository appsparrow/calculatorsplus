<?php
header('Content-Type: application/json');

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['success' => false, 'message' => 'Invalid request method']));
}

try {
    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);
    
    // Validate input
    if (!isset($data['email']) || !isset($data['description'])) {
        throw new Exception('Email and description are required');
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // File path for storing requests
    $filePath = 'calculator_requests.json';
    
    // Read existing requests
    $requests = [];
    if (file_exists($filePath)) {
        $fileContent = file_get_contents($filePath);
        $requests = json_decode($fileContent, true) ?: [];
    }
    
    // Add new request
    $requests[] = [
        'email' => $data['email'],
        'description' => $data['description'],
        'timestamp' => date('Y-m-d H:i:s'),
        'userAgent' => $_SERVER['HTTP_USER_AGENT'],
        'ip' => $_SERVER['REMOTE_ADDR'],
        'searchTerm' => isset($data['searchTerm']) ? $data['searchTerm'] : ''
    ];
    
    // Save back to file with pretty printing
    if (file_put_contents($filePath, json_encode($requests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'Request saved successfully']);
    } else {
        throw new Exception('Failed to save request');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>