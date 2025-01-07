<?php
header('Content-Type: application/json');

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit(json_encode(['success' => false, 'message' => 'Invalid request method']));
}

try {
    // Get the JSON data from the request
    $jsonData = file_get_contents('php://input');
    $request = json_decode($jsonData);
    
    // Validate required fields
    if (empty($request->description) || empty($request->email)) {
        throw new Exception('Description and email are required');
    }
    
    // Path to the JSON file
    $filePath = dirname(dirname(__FILE__)) . '/calculator_requests.json';
    
    // Read existing requests or create empty array
    $existingRequests = [];
    if (file_exists($filePath)) {
        $fileContent = file_get_contents($filePath);
        $existingRequests = json_decode($fileContent, true) ?: [];
    }
    
    // Add new request to array
    $existingRequests[] = [
        'email' => $request->email,
        'calculator' => $request->calculator,
        'description' => $request->description,
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'userAgent' => $_SERVER['HTTP_USER_AGENT']
    ];
    
    // Save back to file with pretty printing
    if (file_put_contents($filePath, json_encode($existingRequests, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Request saved successfully']);
    } else {
        throw new Exception('Failed to write to file');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>