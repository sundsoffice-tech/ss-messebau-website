<?php
/**
 * S&S Messebau - Analytics Cleanup Endpoint
 * POST: Delete old events based on retention settings
 * Requires auth.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!requireAuth()) exit;

$db = getDB();

// Get retention setting
$stmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'retention_days'");
$stmt->execute();
$row = $stmt->fetch();
$retentionDays = $row ? intval($row['config_value']) : 90;

// Delete events older than retention period
$cutoff = date('Y-m-d H:i:s', time() - ($retentionDays * 86400));

$stmt = $db->prepare("DELETE FROM analytics_events WHERE ts < :cutoff");
$stmt->execute([':cutoff' => $cutoff]);
$deleted = $stmt->rowCount();

// Clean up heartbeat events older than 24 hours (only useful for real-time, not historical analysis)
$heartbeatCutoff = date('Y-m-d H:i:s', time() - 86400);
$hbStmt = $db->prepare("DELETE FROM analytics_events WHERE event = 'heartbeat' AND ts < :hb_cutoff");
$hbStmt->execute([':hb_cutoff' => $heartbeatCutoff]);
$deleted += $hbStmt->rowCount();

// Store cleanup metadata
$updateStmt = $db->prepare("
    INSERT INTO analytics_config (config_key, config_value, updated_at)
    VALUES (:key, :value, datetime('now'))
    ON CONFLICT(config_key) DO UPDATE SET config_value = :value, updated_at = datetime('now')
");

$updateStmt->execute([':key' => 'last_cleanup', ':value' => gmdate('c')]);
$updateStmt->execute([':key' => 'last_cleanup_count', ':value' => (string)$deleted]);

// Also clean up old rate limit files (older than 1 hour)
$rateLimitDir = __DIR__ . '/data/';
$rateLimitPatterns = ['rate_limit_*.json', 'login_limit_*.json', 'email_limit_*.json', 'order_limit_*.json', 'inquiry_limit_*.json'];
foreach ($rateLimitPatterns as $pattern) {
    $files = glob($rateLimitDir . $pattern);
    if ($files) {
        foreach ($files as $file) {
            if (filemtime($file) < time() - 3600) {
                @unlink($file);
            }
        }
    }
}

// Clean up old geocache files (older than 7 days)
$geocacheDir = $rateLimitDir . 'geocache/';
if (is_dir($geocacheDir)) {
    $geoFiles = glob($geocacheDir . '*.json');
    if ($geoFiles) {
        foreach ($geoFiles as $file) {
            if (filemtime($file) < time() - 604800) {
                @unlink($file);
            }
        }
    }
}

echo json_encode([
    'deleted' => $deleted,
    'retention_days' => $retentionDays,
    'cutoff_date' => $cutoff,
    'timestamp' => gmdate('c'),
]);
