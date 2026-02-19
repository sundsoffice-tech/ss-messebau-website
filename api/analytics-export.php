<?php
/**
 * S&S Messebau - Analytics Export & KPIs Endpoint (Enterprise)
 * GET ?action=kpis - Returns comprehensive KPI data with period comparison
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

/* ================================================================== */
/*  Helper: count events by type within a date range                   */
/* ================================================================== */
function countEventsByType(PDO $db, string $from, string $toEnd, string $type): int {
    $stmt = $db->prepare("SELECT COUNT(*) FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = :evt");
    $stmt->execute([':from' => $from, ':to' => $toEnd, ':evt' => $type]);
    return (int)$stmt->fetchColumn();
}

function countSessions(PDO $db, string $from, string $toEnd): int {
    $stmt = $db->prepare("SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE ts >= :from AND ts <= :to");
    $stmt->execute([':from' => $from, ':to' => $toEnd]);
    return (int)$stmt->fetchColumn();
}

function countVisitors(PDO $db, string $from, string $toEnd): int {
    $stmt = $db->prepare("SELECT COUNT(DISTINCT visitor_id) FROM analytics_events WHERE ts >= :from AND ts <= :to AND visitor_id != '' AND visitor_id IS NOT NULL");
    $stmt->execute([':from' => $from, ':to' => $toEnd]);
    return (int)$stmt->fetchColumn();
}

function countTotal(PDO $db, string $from, string $toEnd): int {
    $stmt = $db->prepare("SELECT COUNT(*) FROM analytics_events WHERE ts >= :from AND ts <= :to");
    $stmt->execute([':from' => $from, ':to' => $toEnd]);
    return (int)$stmt->fetchColumn();
}

/* ================================================================== */
/*  KPI Handler - Enterprise Grade                                      */
/* ================================================================== */
function handleKPIs(PDO $db, string $from, string $to, ?string $eventType): void {
    $toEnd = $to . ' 23:59:59';
    $baseParams = [':from' => $from, ':to' => $toEnd];

    // --- Calculate comparison period (same duration, previous period) ---
    $fromTs = strtotime($from);
    $toTs = strtotime($to);
    $rangeDays = max(1, ($toTs - $fromTs) / 86400);
    $prevFrom = date('Y-m-d', $fromTs - ($rangeDays * 86400));
    $prevTo = date('Y-m-d', $fromTs - 86400);
    $prevToEnd = $prevTo . ' 23:59:59';

    // --- Core metrics ---
    $totalEvents = countTotal($db, $from, $toEnd);
    $uniqueSessions = countSessions($db, $from, $toEnd);
    $uniqueVisitors = countVisitors($db, $from, $toEnd);
    $pageViews = countEventsByType($db, $from, $toEnd, 'page_view');
    $ctaClicks = countEventsByType($db, $from, $toEnd, 'cta_click');
    $formSubmits = countEventsByType($db, $from, $toEnd, 'form_submit');
    $phoneClicks = countEventsByType($db, $from, $toEnd, 'phone_click');
    $whatsappClicks = countEventsByType($db, $from, $toEnd, 'whatsapp_click');
    $downloads = countEventsByType($db, $from, $toEnd, 'download');
    $exitIntents = countEventsByType($db, $from, $toEnd, 'exit_intent');

    // --- Period comparison ---
    $prevTotalEvents = countTotal($db, $prevFrom, $prevToEnd);
    $prevSessions = countSessions($db, $prevFrom, $prevToEnd);
    $prevVisitors = countVisitors($db, $prevFrom, $prevToEnd);
    $prevPageViews = countEventsByType($db, $prevFrom, $prevToEnd, 'page_view');
    $prevFormSubmits = countEventsByType($db, $prevFrom, $prevToEnd, 'form_submit');
    $prevCtaClicks = countEventsByType($db, $prevFrom, $prevToEnd, 'cta_click');

    $comparison = [
        'total_events' => makePeriodComparison($totalEvents, $prevTotalEvents),
        'unique_sessions' => makePeriodComparison($uniqueSessions, $prevSessions),
        'page_views' => makePeriodComparison($pageViews, $prevPageViews),
        'unique_visitors' => makePeriodComparison($uniqueVisitors, $prevVisitors),
        'form_submits' => makePeriodComparison($formSubmits, $prevFormSubmits),
        'cta_clicks' => makePeriodComparison($ctaClicks, $prevCtaClicks),
    ];

    // --- Bounce rate ---
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM (
            SELECT session_id FROM analytics_events
            WHERE ts >= :from AND ts <= :to AND event NOT IN ('heartbeat','tab_visibility','performance','error')
            GROUP BY session_id HAVING COUNT(*) = 1
        )
    ");
    $stmt->execute($baseParams);
    $singleEventSessions = (int)$stmt->fetchColumn();
    $bounceRate = $uniqueSessions > 0 ? round(($singleEventSessions / $uniqueSessions) * 100, 1) : 0;

    // Average events per session
    $avgSessionEvents = $uniqueSessions > 0 ? round($totalEvents / $uniqueSessions, 1) : 0;

    // --- Conversion rate ---
    $conversionRate = $uniqueSessions > 0 ? round(($formSubmits / $uniqueSessions) * 100, 2) : 0;

    // --- Conversion funnel ---
    $funnelSteps = buildConversionFunnel($db, $baseParams);

    // --- Engagement metrics ---
    $engagement = calculateEngagement($db, $baseParams, $uniqueSessions, $uniqueVisitors);

    // --- Session quality ---
    $sessionQuality = calculateSessionQuality($db, $baseParams, $uniqueSessions);

    // --- Visitor segments (new vs returning) ---
    $visitorSegments = calculateVisitorSegments($db, $baseParams, $uniqueVisitors);

    // --- Events by day (enriched with sessions, page_views, conversions) ---
    $stmt = $db->prepare("
        SELECT date(ts) as date,
               COUNT(*) as cnt,
               COUNT(DISTINCT session_id) as sessions,
               SUM(CASE WHEN event='page_view' THEN 1 ELSE 0 END) as pvs,
               SUM(CASE WHEN event='form_submit' THEN 1 ELSE 0 END) as convs
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to
        GROUP BY date(ts) ORDER BY date(ts) ASC
    ");
    $stmt->execute($baseParams);
    $eventsByDay = array_map(fn($r) => [
        'date' => $r['date'],
        'count' => (int)$r['cnt'],
        'sessions' => (int)$r['sessions'],
        'page_views' => (int)$r['pvs'],
        'conversions' => (int)$r['convs'],
    ], $stmt->fetchAll());

    // --- Events by hour ---
    $stmt = $db->prepare("
        SELECT CAST(strftime('%H', ts) AS INTEGER) as hour, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to
        GROUP BY hour ORDER BY hour ASC
    ");
    $stmt->execute($baseParams);
    $eventsByHour = array_map(fn($r) => ['hour' => (int)$r['hour'], 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Heatmap (day of week x hour) ---
    $heatmap = buildHeatmap($db, $baseParams);

    // --- Top pages ---
    $stmt = $db->prepare("
        SELECT url, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'page_view'
        GROUP BY url ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topPages = array_map(fn($r) => ['url' => $r['url'], 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Page performance ---
    $pagePerformance = calculatePagePerformance($db, $baseParams);

    // --- Navigation paths ---
    $navigationPaths = calculateNavigationPaths($db, $baseParams);

    // --- Top referrers ---
    $stmt = $db->prepare("
        SELECT referrer, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topReferrers = array_map(fn($r) => ['referrer' => $r['referrer'], 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Top UTM sources ---
    $stmt = $db->prepare("
        SELECT utm_source as source, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND utm_source IS NOT NULL AND utm_source != ''
        GROUP BY utm_source ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topSources = array_map(fn($r) => ['source' => $r['source'], 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Top campaigns ---
    $stmt = $db->prepare("
        SELECT utm_campaign as campaign, COUNT(*) as cnt FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND utm_campaign IS NOT NULL AND utm_campaign != ''
        GROUP BY utm_campaign ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $topCampaigns = array_map(fn($r) => ['campaign' => $r['campaign'], 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Device breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.device_type') as device_type, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.device_type') IS NOT NULL
        GROUP BY device_type ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $deviceBreakdown = array_map(fn($r) => ['device_type' => $r['device_type'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Browser breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.browser') as browser, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.browser') IS NOT NULL
        GROUP BY browser ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $browserBreakdown = array_map(fn($r) => ['browser' => $r['browser'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- OS breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.os') as os, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.os') IS NOT NULL
        GROUP BY os ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $osBreakdown = array_map(fn($r) => ['os' => $r['os'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Screen resolution breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.screen_resolution') as resolution, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.screen_resolution') IS NOT NULL
        GROUP BY resolution ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $screenResBreakdown = array_map(fn($r) => ['resolution' => $r['resolution'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Connection type breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.connection_type') as connection, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.connection_type') IS NOT NULL
        AND json_extract(props, '$.connection_type') != 'unknown'
        GROUP BY connection ORDER BY cnt DESC
    ");
    $stmt->execute($baseParams);
    $connectionBreakdown = array_map(fn($r) => ['connection' => $r['connection'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Country breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.geo_country') as country,
               json_extract(props, '$.geo_region') as region,
               COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.geo_country') IS NOT NULL
        GROUP BY country ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $countryBreakdown = array_map(fn($r) => [
        'country' => $r['country'] ?? 'unknown',
        'region' => $r['region'] ?? 'unknown',
        'count' => (int)$r['cnt'],
    ], $stmt->fetchAll());

    // --- Timezone breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.timezone') as timezone, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.timezone') IS NOT NULL
        GROUP BY timezone ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $timezoneBreakdown = array_map(fn($r) => ['timezone' => $r['timezone'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Language breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.language') as language, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.language') IS NOT NULL
        GROUP BY language ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $languageBreakdown = array_map(fn($r) => ['language' => $r['language'] ?? 'unknown', 'count' => (int)$r['cnt']], $stmt->fetchAll());

    // --- City breakdown ---
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.geo_city') as city,
               json_extract(props, '$.geo_country_name') as country,
               COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.geo_city') IS NOT NULL
        AND json_extract(props, '$.geo_city') != ''
        GROUP BY city, country ORDER BY cnt DESC LIMIT 20
    ");
    $stmt->execute($baseParams);
    $cityBreakdown = array_map(fn($r) => [
        'city' => $r['city'] ?? 'unknown',
        'country' => $r['country'] ?? 'unknown',
        'count' => (int)$r['cnt'],
    ], $stmt->fetchAll());

    // --- Form conversion by type ---
    $formConversion = calculateFormConversion($db, $baseParams);

    // --- Lead sources ---
    $stmt = $db->prepare("
        SELECT utm_source as source, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'form_submit'
        AND utm_source IS NOT NULL AND utm_source != ''
        GROUP BY utm_source ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($baseParams);
    $leadSources = array_map(fn($r) => ['source' => $r['source'], 'conversions' => (int)$r['cnt']], $stmt->fetchAll());

    // --- Performance metrics ---
    $perfMetrics = calculatePerformanceMetrics($db, $baseParams);

    // --- Top errors ---
    $topErrors = calculateTopErrors($db, $baseParams);

    echo json_encode([
        'total_events' => $totalEvents,
        'unique_sessions' => $uniqueSessions,
        'page_views' => $pageViews,
        'unique_visitors' => $uniqueVisitors,
        'cta_clicks' => $ctaClicks,
        'form_submits' => $formSubmits,
        'phone_clicks' => $phoneClicks,
        'whatsapp_clicks' => $whatsappClicks,
        'downloads' => $downloads,
        'comparison' => $comparison,
        'bounce_rate' => $bounceRate,
        'avg_session_events' => $avgSessionEvents,
        'engagement' => $engagement,
        'session_quality' => $sessionQuality,
        'visitor_segments' => $visitorSegments,
        'conversion_funnel' => $funnelSteps,
        'conversion_rate' => $conversionRate,
        'events_by_day' => $eventsByDay,
        'events_by_hour' => $eventsByHour,
        'heatmap' => $heatmap,
        'top_pages' => $topPages,
        'page_performance' => $pagePerformance,
        'navigation_paths' => $navigationPaths,
        'top_referrers' => $topReferrers,
        'top_sources' => $topSources,
        'top_campaigns' => $topCampaigns,
        'device_breakdown' => $deviceBreakdown,
        'browser_breakdown' => $browserBreakdown,
        'os_breakdown' => $osBreakdown,
        'screen_resolution_breakdown' => $screenResBreakdown,
        'connection_type_breakdown' => $connectionBreakdown,
        'country_breakdown' => $countryBreakdown,
        'timezone_breakdown' => $timezoneBreakdown,
        'language_breakdown' => $languageBreakdown,
        'city_breakdown' => $cityBreakdown,
        'form_conversion_by_type' => $formConversion,
        'lead_sources' => $leadSources,
        'exit_intents' => $exitIntents,
        'performance_metrics' => $perfMetrics,
        'top_errors' => $topErrors,
    ]);
}

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */

function makePeriodComparison(int $current, int $previous): array {
    $changePct = $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : ($current > 0 ? 100 : 0);
    return ['current' => $current, 'previous' => $previous, 'change_pct' => $changePct];
}

function buildConversionFunnel(PDO $db, array $params): array {
    $pageViews = countEventsByType($db, $params[':from'], $params[':to'], 'page_view');
    $ctaClicks = countEventsByType($db, $params[':from'], $params[':to'], 'cta_click');
    $formInteractions = countEventsByType($db, $params[':from'], $params[':to'], 'form_interaction');
    $formSubmits = countEventsByType($db, $params[':from'], $params[':to'], 'form_submit');

    $steps = [
        ['step' => 'page_view', 'label' => 'Seitenaufrufe', 'count' => $pageViews],
        ['step' => 'cta_click', 'label' => 'CTA-Klicks', 'count' => $ctaClicks],
        ['step' => 'form_interaction', 'label' => 'Formular-Interaktion', 'count' => $formInteractions],
        ['step' => 'form_submit', 'label' => 'Formular-Abschluss', 'count' => $formSubmits],
    ];

    $total = $steps[0]['count'] > 0 ? $steps[0]['count'] : 1;
    $prevCount = $total;
    $result = [];

    foreach ($steps as $i => $step) {
        $pctOfTotal = round(($step['count'] / $total) * 100, 1);
        $pctOfPrevious = $i === 0 ? 100 : ($prevCount > 0 ? round(($step['count'] / $prevCount) * 100, 1) : 0);
        $dropOff = $i === 0 ? 0 : max(0, $prevCount - $step['count']);

        $result[] = [
            'step' => $step['step'],
            'label' => $step['label'],
            'count' => $step['count'],
            'pct_of_total' => $pctOfTotal,
            'pct_of_previous' => $pctOfPrevious,
            'drop_off' => $dropOff,
        ];
        $prevCount = max(1, $step['count']);
    }

    return $result;
}

function calculateEngagement(PDO $db, array $params, int $sessions, int $visitors): array {
    // Avg session duration from session_end events
    $stmt = $db->prepare("
        SELECT AVG(CAST(json_extract(props, '$.session_duration_seconds') AS REAL)) as avg_dur
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_end'
        AND json_extract(props, '$.session_duration_seconds') IS NOT NULL
    ");
    $stmt->execute($params);
    $avgDuration = round((float)($stmt->fetchColumn() ?: 0), 1);

    // Avg pages per session from session_end events
    $stmt = $db->prepare("
        SELECT AVG(CAST(json_extract(props, '$.page_count') AS REAL)) as avg_pages
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'session_end'
        AND json_extract(props, '$.page_count') IS NOT NULL
    ");
    $stmt->execute($params);
    $avgPages = round((float)($stmt->fetchColumn() ?: 0), 1);

    // Avg scroll depth from page_engagement events
    $stmt = $db->prepare("
        SELECT AVG(CAST(json_extract(props, '$.max_scroll_depth') AS REAL)) as avg_scroll
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'page_engagement'
        AND json_extract(props, '$.max_scroll_depth') IS NOT NULL
    ");
    $stmt->execute($params);
    $avgScroll = round((float)($stmt->fetchColumn() ?: 0), 1);

    // Interaction rate: % of sessions with CTA or form interaction
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT session_id) FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event IN ('cta_click','form_interaction','form_submit')
    ");
    $stmt->execute($params);
    $interactiveSessions = (int)$stmt->fetchColumn();
    $interactionRate = $sessions > 0 ? round(($interactiveSessions / $sessions) * 100, 1) : 0;

    // Return rate: visitors with visit_count > 0 at session_start
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.is_returning') = 1
    ");
    $stmt->execute($params);
    $returningCount = (int)$stmt->fetchColumn();
    $totalStarts = countEventsByType($db, $params[':from'], $params[':to'], 'session_start');
    $returnRate = $totalStarts > 0 ? round(($returningCount / $totalStarts) * 100, 1) : 0;

    // Engagement score (0-100): composite
    $durationScore = min(30, ($avgDuration / 180) * 30); // max 30 points for 3+ min
    $pagesScore = min(20, ($avgPages / 4) * 20); // max 20 points for 4+ pages
    $scrollScore = min(15, ($avgScroll / 75) * 15); // max 15 points for 75%+ scroll
    $interactionScore = min(20, ($interactionRate / 30) * 20); // max 20 points for 30%+ interaction
    $returnScore = min(15, ($returnRate / 20) * 15); // max 15 points for 20%+ return
    $engagementScore = round($durationScore + $pagesScore + $scrollScore + $interactionScore + $returnScore, 0);

    return [
        'avg_session_duration_seconds' => $avgDuration,
        'avg_pages_per_session' => $avgPages,
        'avg_scroll_depth' => $avgScroll,
        'interaction_rate' => $interactionRate,
        'return_rate' => $returnRate,
        'engagement_score' => $engagementScore,
    ];
}

function calculateSessionQuality(PDO $db, array $params, int $totalSessions): array {
    // Bucketing by event count per session (excluding noise events)
    $stmt = $db->prepare("
        SELECT session_id, COUNT(*) as event_count
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event NOT IN ('heartbeat','tab_visibility','performance','error')
        GROUP BY session_id
    ");
    $stmt->execute($params);
    $sessions = $stmt->fetchAll();

    $buckets = ['bounce' => 0, 'low' => 0, 'medium' => 0, 'high' => 0, 'power_user' => 0];
    foreach ($sessions as $s) {
        $count = (int)$s['event_count'];
        if ($count <= 1) $buckets['bounce']++;
        elseif ($count <= 3) $buckets['low']++;
        elseif ($count <= 8) $buckets['medium']++;
        elseif ($count <= 20) $buckets['high']++;
        else $buckets['power_user']++;
    }

    $total = max(1, array_sum($buckets));
    return array_map(fn($quality, $count) => [
        'quality' => $quality,
        'count' => $count,
        'pct' => round(($count / $total) * 100, 1),
    ], array_keys($buckets), array_values($buckets));
}

function calculateVisitorSegments(PDO $db, array $params, int $totalVisitors): array {
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'session_start'
        AND json_extract(props, '$.is_returning') = 1
    ");
    $stmt->execute($params);
    $returning = (int)$stmt->fetchColumn();

    $totalStarts = countEventsByType($db, $params[':from'], $params[':to'], 'session_start');
    $newVisitors = max(0, $totalStarts - $returning);

    $total = max(1, $totalStarts);
    return [
        'new_visitors' => $newVisitors,
        'returning_visitors' => $returning,
        'new_pct' => round(($newVisitors / $total) * 100, 1),
        'returning_pct' => round(($returning / $total) * 100, 1),
    ];
}

function buildHeatmap(PDO $db, array $params): array {
    $stmt = $db->prepare("
        SELECT CAST(strftime('%w', ts) AS INTEGER) as dow,
               CAST(strftime('%H', ts) AS INTEGER) as hour,
               COUNT(*) as cnt
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event NOT IN ('heartbeat','tab_visibility','performance')
        GROUP BY dow, hour
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Find max for normalization
    $maxCount = 1;
    foreach ($rows as $r) {
        if ((int)$r['cnt'] > $maxCount) $maxCount = (int)$r['cnt'];
    }

    // SQLite strftime('%w') returns 0=Sunday, convert to 0=Monday
    return array_map(fn($r) => [
        'day' => ((int)$r['dow'] + 6) % 7, // Convert: 0=Sun->6, 1=Mon->0, etc.
        'hour' => (int)$r['hour'],
        'count' => (int)$r['cnt'],
        'intensity' => round((int)$r['cnt'] / $maxCount, 3),
    ], $rows);
}

function calculatePagePerformance(PDO $db, array $params): array {
    $stmt = $db->prepare("
        SELECT url,
               COUNT(*) as views,
               COUNT(DISTINCT session_id) as unique_sessions
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'page_view'
        GROUP BY url ORDER BY views DESC LIMIT 15
    ");
    $stmt->execute($params);
    $pages = $stmt->fetchAll();

    $result = [];
    foreach ($pages as $p) {
        $url = $p['url'];

        // Avg scroll depth for this page
        $stmt2 = $db->prepare("
            SELECT AVG(CAST(json_extract(props, '$.depth_pct') AS REAL)) as avg_depth
            FROM analytics_events
            WHERE ts >= :from AND ts <= :to AND event = 'scroll_depth'
            AND url = :url
        ");
        $stmt2->execute(array_merge($params, [':url' => $url]));
        $avgScroll = round((float)($stmt2->fetchColumn() ?: 0), 1);

        // Avg engagement for this page
        $stmt2 = $db->prepare("
            SELECT AVG(CAST(json_extract(props, '$.engagement_seconds') AS REAL)) as avg_eng
            FROM analytics_events
            WHERE ts >= :from AND ts <= :to AND event = 'page_engagement'
            AND json_extract(props, '$.page') = :url
        ");
        $stmt2->execute(array_merge($params, [':url' => $url]));
        $avgEng = round((float)($stmt2->fetchColumn() ?: 0), 1);

        // Conversions on this page
        $stmt2 = $db->prepare("
            SELECT COUNT(*) FROM analytics_events
            WHERE ts >= :from AND ts <= :to AND event = 'form_submit' AND url = :url
        ");
        $stmt2->execute(array_merge($params, [':url' => $url]));
        $conversions = (int)$stmt2->fetchColumn();

        $result[] = [
            'url' => $url,
            'views' => (int)$p['views'],
            'unique_sessions' => (int)$p['unique_sessions'],
            'avg_scroll_depth' => $avgScroll,
            'avg_engagement_time' => $avgEng,
            'bounce_rate' => 0, // Simplified
            'exit_rate' => 0,
            'conversions' => $conversions,
        ];
    }

    return $result;
}

function calculateNavigationPaths(PDO $db, array $params): array {
    // Get sequential page views per session to build paths
    $stmt = $db->prepare("
        SELECT session_id, url, ts FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'page_view'
        ORDER BY session_id, ts ASC
        LIMIT 5000
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $paths = [];
    $prevUrl = null;
    $prevSession = null;

    foreach ($rows as $r) {
        if ($r['session_id'] === $prevSession && $prevUrl !== null && $prevUrl !== $r['url']) {
            $key = $prevUrl . ' -> ' . $r['url'];
            $paths[$key] = ($paths[$key] ?? 0) + 1;
        }
        $prevUrl = $r['url'];
        $prevSession = $r['session_id'];
    }

    arsort($paths);
    $topPaths = array_slice($paths, 0, 10, true);
    $total = max(1, array_sum($topPaths));

    return array_map(fn($key, $count) => [
        'from_page' => explode(' -> ', $key)[0],
        'to_page' => explode(' -> ', $key)[1],
        'count' => $count,
        'pct' => round(($count / $total) * 100, 1),
    ], array_keys($topPaths), array_values($topPaths));
}

function calculateFormConversion(PDO $db, array $params): array {
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.form_type') as form_type, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'form_submit'
        AND json_extract(props, '$.form_type') IS NOT NULL
        GROUP BY form_type ORDER BY cnt DESC
    ");
    $stmt->execute($params);
    $submits = $stmt->fetchAll();

    $stmt = $db->prepare("
        SELECT json_extract(props, '$.form_type') as form_type, COUNT(*) as cnt
        FROM analytics_events WHERE ts >= :from AND ts <= :to AND event = 'form_abandon'
        AND json_extract(props, '$.form_type') IS NOT NULL
        GROUP BY form_type ORDER BY cnt DESC
    ");
    $stmt->execute($params);
    $abandons = $stmt->fetchAll();

    $submitsMap = [];
    foreach ($submits as $r) { $submitsMap[$r['form_type']] = (int)$r['cnt']; }
    $abandonsMap = [];
    foreach ($abandons as $r) { $abandonsMap[$r['form_type']] = (int)$r['cnt']; }

    $allTypes = array_unique(array_merge(array_keys($submitsMap), array_keys($abandonsMap)));
    $result = [];
    foreach ($allTypes as $ft) {
        $s = $submitsMap[$ft] ?? 0;
        $a = $abandonsMap[$ft] ?? 0;
        $total = $s + $a;
        $result[] = [
            'form_type' => $ft,
            'submits' => $s,
            'abandons' => $a,
            'rate' => $total > 0 ? round(($s / $total) * 100, 1) : 0,
        ];
    }
    return $result;
}

function calculatePerformanceMetrics(PDO $db, array $params): ?array {
    $stmt = $db->prepare("
        SELECT
            AVG(CAST(json_extract(props, '$.page_load_ms') AS REAL)) as avg_load,
            AVG(CAST(json_extract(props, '$.ttfb_ms') AS REAL)) as avg_ttfb,
            AVG(CAST(json_extract(props, '$.dom_interactive_ms') AS REAL)) as avg_dom
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'performance'
        AND json_extract(props, '$.page_load_ms') IS NOT NULL
    ");
    $stmt->execute($params);
    $row = $stmt->fetch();

    if (!$row || !$row['avg_load']) return null;

    // FCP
    $stmt = $db->prepare("
        SELECT AVG(CAST(json_extract(props, '$.value_ms') AS REAL)) as avg_fcp
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'performance'
        AND json_extract(props, '$.metric') = 'fcp'
    ");
    $stmt->execute($params);
    $fcpRow = $stmt->fetch();

    return [
        'avg_page_load_ms' => round((float)$row['avg_load']),
        'avg_ttfb_ms' => round((float)$row['avg_ttfb']),
        'avg_fcp_ms' => round((float)($fcpRow['avg_fcp'] ?? 0)),
        'avg_dom_interactive_ms' => round((float)$row['avg_dom']),
    ];
}

function calculateTopErrors(PDO $db, array $params): array {
    $stmt = $db->prepare("
        SELECT json_extract(props, '$.error_message') as error_message,
               COUNT(*) as cnt,
               MAX(ts) as last_seen
        FROM analytics_events
        WHERE ts >= :from AND ts <= :to AND event = 'error'
        AND json_extract(props, '$.error_message') IS NOT NULL
        GROUP BY error_message ORDER BY cnt DESC LIMIT 10
    ");
    $stmt->execute($params);
    return array_map(fn($r) => [
        'error_message' => $r['error_message'],
        'count' => (int)$r['cnt'],
        'last_seen' => $r['last_seen'],
    ], $stmt->fetchAll());
}

/* ================================================================== */
/*  Export Handler                                                      */
/* ================================================================== */
function handleExport(PDO $db, string $from, string $to, ?string $eventType, string $format, int $limit): void {
    $toEnd = $to . ' 23:59:59';
    $sql = "SELECT event, ts, session_id, visitor_id, url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, props
            FROM analytics_events WHERE ts >= :from AND ts <= :to";
    $params = [':from' => $from, ':to' => $toEnd];

    if ($eventType) {
        $sql .= " AND event = :event_type";
        $params[':event_type'] = $eventType;
    }

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
