<?php
/**
 * S&S Messebau - Active Visitors Endpoint
 * GET: Returns currently active visitors (sessions with activity in last 90s)
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
$summaryDesktop = 0;
$summaryMobile = 0;
$summaryTablet = 0;
$summaryNew = 0;
$summaryReturning = 0;
$summaryPages = [];

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

    // Get session start info (device props from session_start event)
    $startStmt = $db->prepare("
        SELECT MIN(ts) as session_start, props, visitor_id
        FROM analytics_events
        WHERE session_id = :sid AND event = 'session_start'
    ");
    $startStmt->execute([':sid' => $sid]);
    $startRow = $startStmt->fetch();

    // Fallback: get first page_view time if no session_start
    if (!$startRow || !$startRow['session_start']) {
        $fallbackStmt = $db->prepare("
            SELECT MIN(ts) as session_start
            FROM analytics_events
            WHERE session_id = :sid AND event = 'page_view'
        ");
        $fallbackStmt->execute([':sid' => $sid]);
        $fallbackRow = $fallbackStmt->fetch();
        $sessionStart = $fallbackRow['session_start'] ?? $session['first_seen_in_window'];
        $deviceProps = [];
        $visitorId = '';
    } else {
        $sessionStart = $startRow['session_start'];
        $deviceProps = $startRow['props'] ? json_decode($startRow['props'], true) : [];
        $visitorId = $startRow['visitor_id'] ?? '';
    }

    // Get page count for this session
    $pageCountStmt = $db->prepare("
        SELECT COUNT(*) FROM analytics_events
        WHERE session_id = :sid AND event = 'page_view'
    ");
    $pageCountStmt->execute([':sid' => $sid]);
    $pageCount = (int)$pageCountStmt->fetchColumn();

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

    $deviceType = $deviceProps['device_type'] ?? 'unknown';
    $isReturning = !empty($deviceProps['is_returning']);

    // Summary counters
    if ($deviceType === 'desktop') $summaryDesktop++;
    elseif ($deviceType === 'mobile') $summaryMobile++;
    elseif ($deviceType === 'tablet') $summaryTablet++;

    if ($isReturning) $summaryReturning++;
    else $summaryNew++;

    $currentPage = $latest['url'] ?? '/';
    $summaryPages[$currentPage] = ($summaryPages[$currentPage] ?? 0) + 1;

    $visitors[] = [
        'session_id' => substr($sid, 0, 8),
        'session_id_hash' => md5($sid),
        'visitor_id_hash' => $visitorId ? md5($visitorId) : '',
        'current_page' => $currentPage,
        'last_event' => $latest['event'] ?? 'unknown',
        'last_seen' => $session['last_seen'],
        'first_seen_in_window' => $session['first_seen_in_window'],
        'session_start' => $sessionStart,
        'event_count' => (int)$session['event_count'],
        'page_count' => $pageCount,
        'is_returning' => $isReturning,
        'device_type' => $deviceType,
        'browser' => $deviceProps['browser'] ?? 'unknown',
        'os' => $deviceProps['os'] ?? 'unknown',
        'country' => $deviceProps['geo_country'] ?? '',
        'region' => $deviceProps['geo_region'] ?? '',
        'city' => $deviceProps['geo_city'] ?? '',
        'timeline' => array_map(fn($t) => [
            'event' => $t['event'],
            'ts' => $t['ts'],
            'url' => $t['url'],
        ], $timeline),
    ];
}

// Build summary top pages
arsort($summaryPages);
$topPages = [];
foreach (array_slice($summaryPages, 0, 5, true) as $url => $count) {
    $topPages[] = ['url' => $url, 'count' => $count];
}

echo json_encode([
    'active_visitors' => count($visitors),
    'window_seconds' => $windowSeconds,
    'server_time' => gmdate('Y-m-d\TH:i:s\Z'),
    'visitors' => $visitors,
    'summary' => [
        'desktop' => $summaryDesktop,
        'mobile' => $summaryMobile,
        'tablet' => $summaryTablet,
        'new_visitors' => $summaryNew,
        'returning_visitors' => $summaryReturning,
        'top_pages' => $topPages,
    ],
]);
