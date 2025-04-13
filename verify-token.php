<?php
/**
 * Token Verification Script
 * 
 * This script verifies that a sitemap token is valid, helping to authenticate
 * the JavaScript client's authorization to update the sitemap.
 */

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// CORS headers
header('Access-Control-Allow-Origin: https://orange-man.xyz');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

// Get the Authorization header
$auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
if (empty($auth_header)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing Authorization header']);
    exit;
}

// Extract the token
if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid Authorization header format']);
    exit;
}

$token = $matches[1];

// Get expected token (from environment variable or configuration)
$valid_token = getenv('SITEMAP_TOKEN');
if (!$valid_token) {
    // Fallback to hardcoded token
    $valid_token = 'YOUR_SECRET_TOKEN'; // Replace with your secure token
}

// Compare tokens
if ($token === $valid_token) {
    echo json_encode([
        'verified' => true,
        'message' => 'Token is valid',
        'expires' => time() + 3600 // Token valid for 1 hour
    ]);
} else {
    http_response_code(403);
    echo json_encode([
        'verified' => false,
        'message' => 'Invalid token'
    ]);
}