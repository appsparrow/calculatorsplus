//   // Feature Request Form functionality
//   document.addEventListener('DOMContentLoaded', function () {
//     const featureIcon = document.querySelector('.feature-request-icon');
//     const sidebar = document.querySelector('.feature-request-sidebar');
//     const closeBtn = document.querySelector('.close-sidebar');
//     const featureForm = document.getElementById('featureForm');

//     // Toggle sidebar
//     featureIcon.addEventListener('click', () => {
//         sidebar.classList.add('active');
//     });

//     closeBtn.addEventListener('click', () => {
//         sidebar.classList.remove('active');
//     });

//     // Handle form submission
//     featureForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const formData = {
//             email: document.getElementById('email').value,
//             calculator: document.getElementById('calculator').value,
//             description: document.getElementById('description').value,
//             timestamp: new Date().toISOString()
//         };

//         try {
//             // Send data to PHP script
//             const response = await fetch('/save-feature-request.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData)
//             });

//             const result = await response.json();

//             if (result.success) {
//                 // Reset form and close sidebar
//                 featureForm.reset();
//                 document.getElementById('calculator').value = 'Calorie Calculator';
//                 sidebar.classList.remove('active');
//                 alert('Feature request submitted successfully!');
//             } else {
//                 throw new Error(result.message || 'Failed to submit feature request');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Failed to submit feature request. Please try again later.');
//         }
//     });
// });






<?php
header('Content-Type: application/json');

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

try {
    // Get the JSON data from the request
    $jsonData = file_get_contents('php://input');
    $requestData = json_decode($jsonData);
    
    // Path to the JSON file (two levels up)
    $filePath = dirname(dirname(__FILE__)) . '/feature-requests.json';
    
    // Read existing requests or create empty array
    $existingRequests = [];
    if (file_exists($filePath)) {
        $fileContent = file_get_contents($filePath);
        $existingRequests = json_decode($fileContent, true) ?: [];
    }
    
    // Add new request to array
    $existingRequests[] = [
        'type' => $requestData->type, // Add the type (feature or issue)
        'email' => $requestData->email,
        'calculator' => $requestData->calculator,
        'description' => $requestData->description,
        'timestamp' => $requestData->timestamp,
        'ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    // Save back to file
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