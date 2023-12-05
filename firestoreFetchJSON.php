<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");

// Get the URL parameter from the query string
if (isset($_GET['url'])) {
    $firebaseStorageUrl = $_GET['url'];

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $firebaseStorageUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    // Execute cURL session and get the content
    $data = curl_exec($ch);

    // Check for errors
    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
    } else {
        // Output the data
        echo $data;
    }

    // Close cURL session
    curl_close($ch);
} else {
    // If 'url' parameter is not provided, return an error
    echo 'Error: Missing "url" parameter';
}
?>
