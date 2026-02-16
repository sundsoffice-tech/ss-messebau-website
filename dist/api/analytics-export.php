<?php
/**
 * S&S Messebau - Analytics Export & KPIs Endpoint
 * GET ?action=kpis - Returns aggregated KPI data
 * GET ?action=export - Returns raw event data as CSV or JSON
 * Requires auth for all actions.
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

$action = $_GET['action'] ?? 'kpis';
$from = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
$to = $_GET['to'] ?? date('Y-m-d');
$eventType = $_GET['event_type'] ?? null;

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || strtotime($from) === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid from date']);
    exit;
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $to) || strtotime($to) === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid to date']);
    exit;
}

$db = getDB();

if ($action === 'kpis') {
    handleKPIs($db, $from, $to, $eventType);
} elseif ($action === 'export') {
    $format = $_GET['format'] ?? 'json';
    $limit = min(10000, max(1, intval($_GET['limit'] ?? 1000)));
    handleExport($db, $from, $to, $eventType, $format, $limit);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown action. Use ?action=kpis or ?action=export']);
}

function handleKPIs(PDO $db, string $from, string $to, ?string $eventType): void {
    $toEnd = $to . ' 23:59:59';
    $params = [':from' => $from, ':to' => $toEnd];
    $eventFilter = '';
    if ($eventType) {
        $eventFilter = ' AND event = :event_type';
        $params[':event_type'] = $eventType;
    }

    // Total events
    $stmt = $db->prepare("SELECT COUNT(*) FROM analytics_events WHERE ts >= :from AND ts <= :to" . $eventFilter);
    $stmt->execute($params);
    $totalEvents = (int)$stmt->fetchColumn();

    // Unique sessions
    $stmt = $db->prepare("SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE ts >= :from AND ts <= :to" . $eventFilter);
    $stmt->execute($params);
    $uniqueSessions = (int)$stmt->fetchColumn();

    // Event counts by type
    $baseParams = [':from' => $from, ':to' => $toEnd];
    $countByType = function(string $type) use ($db, $baseParams): int {
        $stmt = $db->prepare("SELECT COUNT(*) FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = :evt");
        $stmt->execute(array_merge($baseParams, [':evt' => $type]));
        return (int)$stmt->fetchColumn();
    };

    // Top pages
    $stmt = $db->prepare("
        SELECT url, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'page_view'
        GROUP BY url ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topPages = $stmt->fetchAll();

    // Top referrers
    $stmt = $db->prepare("
        SELECT referrer, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topReferrers = $stmt->fetchAll();

    // Top UTM sources
    $stmt = $db->prepare("
        SELECT utm_source as source, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND utm_source IS NOT NULL AND utm_source != ''
        GROUP BY utm_source ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topSources = $stmt->fetchAll();

    // Events by day
    $stmt = $db->prepare("
        SELECT date(ts) as date, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to
        GROUP BY date(ts) ORDER BY date(ts) ASC
    ");
    $stmt->execute($baseParams);
    $eventsByDay = $stmt->fetchAll();

    echo json_encode([
        'total_events' => $totalEvents,
        'unique_sessions' => $uniqueSessions,
        'page_views' => $countByType('page_view'),
        'cta_clicks' => $countByType('cta_click'),
        'form_submits' => $countByType('form_submit'),
        'phone_clicks' => $countByType('phone_click'),
        'whatsapp_clicks' => $countByType('whatsapp_click'),
        'top_pages' => array_map(fn($r) => ['url' => $r['url'], 'count' => (int)$r['cnt']], $topPages),
        'top_referrers' => array_map(fn($r) => ['referrer' => $r['referrer'], 'count' => (int)$r['cnt']], $topReferrers),
        'top_sources' => array_map(fn($r) => ['source' => $r['source'], 'count' => (int)$r['cnt']], $topSources),
        'events_by_day' => array_map(fn($r) => ['date' => $r['date'], 'count' => (int)$r['cnt']], $eventsByDay),
    ]);
}

function handleExport(PDO $db, string $from, string $to, ?string $eventType, string $format, int $limit): void {
    $toEnd = $to . ' 23:59:59';
    $sql = "SELECT event, ts, session_id, url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, props
            FROM analytics_events WHERE ts >= :from AND ts <= :to";
    $params = [':from' => $from, ':to' => $toEnd];

    if ($eventType) {
        $sql .= " AND event = :event_type";
        $params[':event_type'] = $eventType;
    }

    // $limit is already validated via intval + min/max, safe for interpolation
    $sql .= " ORDER BY ts DESC LIMIT " . intval($limit);

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="analytics_export_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        if (!empty($rows)) {
            fputcsv($output, array_keys($rows[0]));
            foreach ($rows as $row) {
                // Sanitize CSV values to prevent formula injection
                $sanitized = array_map(function($v) {
                    if (is_string($v) && strlen($v) > 0 && in_array($v[0], ['=', '+', '-', '@'], true)) {
                        return "'" . $v;
                    }
                    return $v;
                }, $row);
                fputcsv($output, $sanitized);
            }
        }
        fclose($output);
    } else {
        header('Content-Disposition: attachment; filename="analytics_export_' . date('Y-m-d') . '.json"');
        echo json_encode($rows, JSON_PRETTY_PRINT);
    }
}
