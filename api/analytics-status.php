<?php
/**
 * S&S Messebau - Analytics Status Endpoint
 * GET: Returns system status info (event counts, DB size, last cleanup)
 * Requires auth.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!requireAuth()) exit;

$db = getDB();

// Total events
$totalEvents = (int)$db->query("SELECT COUNT(*) FROM analytics_events")->fetchColumn();

// Oldest event
$oldest = $db->query("SELECT MIN(ts) FROM analytics_events")->fetchColumn();

// Newest event
$newest = $db->query("SELECT MAX(ts) FROM analytics_events")->fetchColumn();

// DB file size
$dbSize = 0;
if (file_exists(DB_PATH)) {
    $dbSize = filesize(DB_PATH);
}

// Unique sessions total
$uniqueSessionsTotal = (int)$db->query("SELECT COUNT(DISTINCT session_id) FROM analytics_events")->fetchColumn();

// Unique visitors total
$uniqueVisitorsTotal = (int)$db->query("SELECT COUNT(DISTINCT visitor_id) FROM analytics_events WHERE visitor_id != '' AND visitor_id IS NOT NULL")->fetchColumn();

// Events today
$today = date('Y-m-d');
$todayStmt = $db->prepare("SELECT COUNT(*) FROM analytics_events WHERE ts >= :today");
$todayStmt->execute([':today' => $today]);
$eventsToday = (int)$todayStmt->fetchColumn();

// Sessions today
$sessionsTodayStmt = $db->prepare("SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE ts >= :today");
$sessionsTodayStmt->execute([':today' => $today]);
$sessionsToday = (int)$sessionsTodayStmt->fetchColumn();

// Last cleanup info
$configStmt = $db->prepare("SELECT config_key, config_value FROM analytics_config WHERE config_key IN ('last_cleanup', 'last_cleanup_count')");
$configStmt->execute();
$configRows = $configStmt->fetchAll();
$configMap = [];
foreach ($configRows as $r) {
    $configMap[$r['config_key']] = $r['config_value'];
}

echo json_encode([
    'total_events' => $totalEvents,
    'oldest_event' => $oldest ?: null,
    'newest_event' => $newest ?: null,
    'db_size_bytes' => $dbSize,
    'last_cleanup' => $configMap['last_cleanup'] ?? null,
    'last_cleanup_count' => isset($configMap['last_cleanup_count']) ? (int)$configMap['last_cleanup_count'] : null,
    'unique_sessions_total' => $uniqueSessionsTotal,
    'unique_visitors_total' => $uniqueVisitorsTotal,
    'events_today' => $eventsToday,
    'sessions_today' => $sessionsToday,
]);
