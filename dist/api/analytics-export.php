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

    // Top UTM campaigns
    $stmt = $db->prepare("
        SELECT utm_campaign as campaign, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND utm_campaign IS NOT NULL AND utm_campaign != ''
        GROUP BY utm_campaign ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topCampaigns = $stmt->fetchAll();

    // Events by hour (0-23)
    $stmt = $db->prepare("
        SELECT CAST(strftime('%H', ts) AS INTEGER) as hour, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to
        GROUP BY hour ORDER BY hour ASC
    ");
    $stmt->execute($baseParams);
    $eventsByHour = $stmt->fetchAll();

    // Bounce rate (sessions with only 1 event)
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM (
            SELECT session_id, COUNT(*) as event_count FROM analytics_events
            WHERE ts >= :from AND ts <= :to
            GROUP BY session_id HAVING event_count = 1
        )
    ");
    $stmt->execute($baseParams);
    $singleEventSessions = (int)$stmt->fetchColumn();
    $bounceRate = $uniqueSessions > 0 ? round(($singleEventSessions / $uniqueSessions) * 100, 1) : 0;

    // Average events per session
    $avgSessionEvents = $uniqueSessions > 0 ? round($totalEvents / $uniqueSessions, 1) : 0;

    // Device breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.device_type') as device_type, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.device_type') IS NOT NULL
        GROUP BY device_type ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $deviceBreakdown = $stmt->fetchAll();

    // Browser breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.browser') as browser, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.browser') IS NOT NULL
        GROUP BY browser ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $browserBreakdown = $stmt->fetchAll();

    // OS breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.os') as os, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.os') IS NOT NULL
        GROUP BY os ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $osBreakdown = $stmt->fetchAll();

    // Country breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.geo_country') as country,
               json_extract(props, '$.geo_region') as region,
               COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.geo_country') IS NOT NULL
        GROUP BY country ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $countryBreakdown = $stmt->fetchAll();

    // Timezone breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.timezone') as timezone, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.timezone') IS NOT NULL
        GROUP BY timezone ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $timezoneBreakdown = $stmt->fetchAll();

    // Language breakdown (from session_start events)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.language') as language, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.language') IS NOT NULL
        GROUP BY language ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $languageBreakdown = $stmt->fetchAll();

    // City breakdown (from session_start events, server-side geo)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.geo_city') as city,
               json_extract(props, '$.geo_country_name') as country,
               COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.geo_city') IS NOT NULL
        AND json_extract(props, '$.geo_city') != ''
        GROUP BY city, country ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $cityBreakdown = $stmt->fetchAll();

    // Form conversion by type (submits vs abandons)
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.form_type') as form_type, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'form_submit'
        AND json_extract(props, '$.form_type') IS NOT NULL
        GROUP BY form_type ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $formSubmitsByType = $stmt->fetchAll();

    $stmt = $db->prepare("
        SELECT json_extract(props, '$.form_type') as form_type, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'form_abandon'
        AND json_extract(props, '$.form_type') IS NOT NULL
        GROUP BY form_type ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $formAbandonsByType = $stmt->fetchAll();

    $submitsMap = [];
    foreach ($formSubmitsByType as $r) { $submitsMap[$r['form_type']] = (int)$r['cnt']; }
    $abandonsMap = [];
    foreach ($formAbandonsByType as $r) { $abandonsMap[$r['form_type']] = (int)$r['cnt']; }
    $allFormTypes = array_unique(array_merge(array_keys($submitsMap), array_keys($abandonsMap)));
    $formConversion = [];
    foreach ($allFormTypes as $ft) {
        $s = $submitsMap[$ft] ?? 0;
        $a = $abandonsMap[$ft] ?? 0;
        $total = $s + $a;
        $formConversion[] = [
            'form_type' => $ft,
            'submits' => $s,
            'abandons' => $a,
            'rate' => $total > 0 ? round(($s / $total) * 100, 1) : 0,
        ];
    }

    // Lead sources: which UTM sources led to form_submit
    $stmt = $db->prepare("
        SELECT utm_source as source, COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'form_submit'
        AND utm_source IS NOT NULL AND utm_source != ''
        GROUP BY utm_source ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $leadSources = $stmt->fetchAll();

    // Exit intent count
    $exitIntents = $countByType('exit_intent');

    echo json_encode([
        'total_events' => $totalEvents,
        'unique_sessions' => $uniqueSessions,
        'page_views' => $countByType('page_view'),
        'cta_clicks' => $countByType('cta_click'),
        'form_submits' => $countByType('form_submit'),
        'phone_clicks' => $countByType('phone_click'),
        'whatsapp_clicks' => $countByType('whatsapp_click'),
        'downloads' => $countByType('download'),
        'top_pages' => array_map(fn($r) => ['url' => $r['url'], 'count' => (int)$r['cnt']], $topPages),
        'top_referrers' => array_map(fn($r) => ['referrer' => $r['referrer'], 'count' => (int)$r['cnt']], $topReferrers),
        'top_sources' => array_map(fn($r) => ['source' => $r['source'], 'count' => (int)$r['cnt']], $topSources),
        'top_campaigns' => array_map(fn($r) => ['campaign' => $r['campaign'], 'count' => (int)$r['cnt']], $topCampaigns),
        'events_by_day' => array_map(fn($r) => ['date' => $r['date'], 'count' => (int)$r['cnt']], $eventsByDay),
        'events_by_hour' => array_map(fn($r) => ['hour' => (int)$r['hour'], 'count' => (int)$r['cnt']], $eventsByHour),
        'bounce_rate' => $bounceRate,
        'avg_session_events' => $avgSessionEvents,
        'device_breakdown' => array_map(fn($r) => ['device_type' => $r['device_type'] ?? 'unknown', 'count' => (int)$r['cnt']], $deviceBreakdown),
        'browser_breakdown' => array_map(fn($r) => ['browser' => $r['browser'] ?? 'unknown', 'count' => (int)$r['cnt']], $browserBreakdown),
        'os_breakdown' => array_map(fn($r) => ['os' => $r['os'] ?? 'unknown', 'count' => (int)$r['cnt']], $osBreakdown),
        'country_breakdown' => array_map(fn($r) => [
            'country' => $r['country'] ?? 'unknown',
            'region' => $r['region'] ?? 'unknown',
            'count' => (int)$r['cnt'],
        ], $countryBreakdown),
        'timezone_breakdown' => array_map(fn($r) => [
            'timezone' => $r['timezone'] ?? 'unknown',
            'count' => (int)$r['cnt'],
        ], $timezoneBreakdown),
        'language_breakdown' => array_map(fn($r) => [
            'language' => $r['language'] ?? 'unknown',
            'count' => (int)$r['cnt'],
        ], $languageBreakdown),
        'city_breakdown' => array_map(fn($r) => [
            'city' => $r['city'] ?? 'unknown',
            'country' => $r['country'] ?? 'unknown',
            'count' => (int)$r['cnt'],
        ], $cityBreakdown),
        'form_conversion_by_type' => $formConversion,
        'lead_sources' => array_map(fn($r) => ['source' => $r['source'], 'conversions' => (int)$r['cnt']], $leadSources),
        'exit_intents' => $exitIntents,
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
