<?php
/**
 * Sitemap Updater Script
 * 
 * This script updates the sitemap.xml file with content received via POST request.
 * It requires authentication to prevent unauthorized updates.
 */

// CORS headers to allow access from the blog domain
header('Access-Control-Allow-Origin: https://orange-man.xyz');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Basic authentication - use environment variable or configuration file in production
// This is a simple example, consider using more secure authentication in production
// First, try to get token from environment variable (more secure)
$valid_token = getenv('SITEMAP_TOKEN');

// Fallback to hardcoded token if environment variable not set
if (!$valid_token) {
    // In a real production environment, use a more secure approach
    // For example, store this in a .env file outside the web root
    $valid_token = 'YOUR_SECRET_TOKEN'; // Replace with a secure token in production
    
    // Note for administrators:
    // 1. Set this same token in your JavaScript code (sitemap-updater.js)
    // 2. OR set an environment variable SITEMAP_TOKEN
    // 3. Update the token in verify-token.php as well
}

// Get Authorization header
$auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
$is_authenticated = false;

// Check bearer token
if (!empty($auth_header) && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    $token = $matches[1];
    if ($token === $valid_token) {
        $is_authenticated = true;
    }
}

// Alternative: check query parameter token (less secure, but useful for testing)
if (!$is_authenticated && isset($_GET['token']) && $_GET['token'] === $valid_token) {
    $is_authenticated = true;
}

// Reject if not authenticated
if (!$is_authenticated) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

// Get the raw POST data
$sitemap_content = file_get_contents('php://input');

// Validate the input is valid XML
if (empty($sitemap_content) || !simplexml_load_string($sitemap_content)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid XML content']);
    exit;
}

// Path to sitemap.xml file - adjust as needed for your server configuration
// Make sure the directory is writable by the web server
$sitemap_path = __DIR__ . '/sitemap.xml';

// Save the previous sitemap as backup before overwriting
if (file_exists($sitemap_path)) {
    $backup_path = $sitemap_path . '.bak';
    copy($sitemap_path, $backup_path);
}

// Save a log of this update
$log_message = date('Y-m-d H:i:s') . " - Sitemap updated via API\n";
file_put_contents(__DIR__ . '/sitemap-updates.log', $log_message, FILE_APPEND);

// Attempt to write the file
$success = file_put_contents($sitemap_path, $sitemap_content);

// If successful, ping search engines about the update
if ($success !== false) {
    // Ping Google
    $google_ping_url = 'https://www.google.com/ping?sitemap=' . urlencode('https://orange-man.xyz/sitemap.xml');
    @file_get_contents($google_ping_url);
    
    // Ping Bing/Microsoft
    $bing_ping_url = 'https://www.bing.com/ping?sitemap=' . urlencode('https://orange-man.xyz/sitemap.xml');
    @file_get_contents($bing_ping_url);
}

if ($success === false) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'error' => 'Failed to write sitemap file',
        'details' => error_get_last()
    ]);
    exit;
}

// Success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Sitemap updated successfully',
    'bytes_written' => $success
]);