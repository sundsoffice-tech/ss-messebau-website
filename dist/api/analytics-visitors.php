<?php
/**
 * S&S Messebau - Active Visitors Endpoint
 * GET: Returns currently active visitors (sessions with activity in last 90s)
 * Requires auth.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

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

// "Active" = any event in the last N seconds (default 90s = 3x heartbeat interval)
$windowSeconds = intval($_GET['window'] ?? 90);
$windowSeconds = max(30, min(300, $windowSeconds));

$cutoff = gmdate('Y-m-d\TH:i:s\Z', time() - $windowSeconds);

// Get active sessions with their most recent event
$stmt = $db->prepare("
    SELECT
        session_id,
        MAX(ts) as last_seen,
        MIN(ts) as first_seen_in_window,
        COUNT(*) as event_count
    FROM analytics_events
    WHERE ts >= :cutoff
    GROUP BY session_id
    ORDER BY last_seen DESC
");
$stmt->execute([':cutoff' => $cutoff]);
$sessions = $stmt->fetchAll();

$visitors = [];
foreach ($sessions as $session) {
    $sid = $session['session_id'];

    // Get current page (latest event's URL)
    $urlStmt = $db->prepare("
        SELECT url, event, ts
        FROM analytics_events
        WHERE session_id = :sid AND ts >= :cutoff
        ORDER BY ts DESC
        LIMIT 1
    ");
    $urlStmt->execute([':sid' => $sid, ':cutoff' => $cutoff]);
    $latest = $urlStmt->fetch();

    // Get session start (first page_view ever for this session)
    $startStmt = $db->prepare("
        SELECT MIN(ts) as session_start
        FROM analytics_events
        WHERE session_id = :sid AND event = 'page_view'
    ");
    $startStmt->execute([':sid' => $sid]);
    $startRow = $startStmt->fetch();

    // Get recent activity timeline (last 10 events in window)
    $timelineStmt = $db->prepare("
        SELECT event, ts, url
        FROM analytics_events
        WHERE session_id = :sid AND ts >= :cutoff
        ORDER BY ts DESC
        LIMIT 10
    ");
    $timelineStmt->execute([':sid' => $sid, ':cutoff' => $cutoff]);
    $timeline = $timelineStmt->fetchAll();

    $visitors[] = [
        'session_id' => substr($sid, 0, 8),
        'session_id_hash' => md5($sid),
        'current_page' => $latest['url'] ?? '/',
        'last_event' => $latest['event'] ?? 'unknown',
        'last_seen' => $session['last_seen'],
        'first_seen_in_window' => $session['first_seen_in_window'],
        'session_start' => $startRow['session_start'] ?? $session['first_seen_in_window'],
        'event_count' => (int)$session['event_count'],
        'timeline' => array_map(fn($t) => [
            'event' => $t['event'],
            'ts' => $t['ts'],
            'url' => $t['url'],
        ], $timeline),
    ];
}

echo json_encode([
    'active_visitors' => count($visitors),
    'window_seconds' => $windowSeconds,
    'server_time' => gmdate('Y-m-d\TH:i:s\Z'),
    'visitors' => $visitors,
]);
