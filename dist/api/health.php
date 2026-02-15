<?php
/**
 * S&S Messebau - Health Check Endpoint
 * Returns system health status for monitoring
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$status = 'ok';
$checks = [];

// Check database connection
try {
    require_once __DIR__ . '/db.php';
    $db = getDB();
    $db->query('SELECT 1');
    $checks['database'] = 'ok';
} catch (Exception $e) {
    $checks['database'] = 'error';
    $status = 'degraded';
}

// Check data directory is writable
$dataDir = __DIR__ . '/data';
$checks['data_writable'] = is_writable($dataDir) ? 'ok' : 'error';
if ($checks['data_writable'] !== 'ok') {
    $status = 'degraded';
}

// Check PHP version
$checks['php_version'] = PHP_VERSION;

// Timestamp
$checks['timestamp'] = gmdate('c');

echo json_encode([
    'status' => $status,
    'checks' => $checks,
], JSON_PRETTY_PRINT);
