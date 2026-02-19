<?php
/**
 * S&S Messebau - Analytics Event Collection Endpoint (Enterprise)
 * POST: Receives batched tracking events from the frontend
 * Rate-limited, no auth required (public endpoint)
 * Supports: visitor_id for cross-session tracking, new event types
 */

require_once __DIR__ . '/db.php';

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

// Simple rate limiting by IP (max 60 requests/minute)
$rateLimitFile = __DIR__ . '/data/rate_limit_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.json';
$now = time();

$rateData = ['timestamps' => []];
$rateLimited = false;

$fp = @fopen($rateLimitFile, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
    $raw = stream_get_contents($fp);
    if ($raw) {
        $rateData = json_decode($raw, true) ?: ['timestamps' => []];
    }

    // Remove timestamps older than 60 seconds
    $rateData['timestamps'] = array_values(array_filter(
        $rateData['timestamps'],
        function($ts) use ($now) { return ($now - $ts) < 60; }
    ));

    if (count($rateData['timestamps']) >= 60) {
        $rateLimited = true;
    } else {
        $rateData['timestamps'][] = $now;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($rateData));
    flock($fp, LOCK_UN);
    fclose($fp);
} else {
    if ($fp) fclose($fp);
}

if ($rateLimited) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['events']) || !is_array($input['events'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload: events array required']);
    exit;
}

$events = $input['events'];
if (count($events) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Too many events (max 50)']);
    exit;
}

// Check global tracking toggle
$db = getDB();
$configStmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'enabled'");
$configStmt->execute();
$enabledRow = $configStmt->fetch();
if ($enabledRow && $enabledRow['config_value'] === '0') {
    echo json_encode(['ok' => true, 'stored' => 0, 'message' => 'Tracking disabled']);
    exit;
}

// Get enabled events list
$enabledEventsStmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'enabled_events'");
$enabledEventsStmt->execute();
$enabledEventsRow = $enabledEventsStmt->fetch();
$enabledEvents = $enabledEventsRow ? json_decode($enabledEventsRow['config_value'], true) : null;

// Allowed event names (extended)
$validEvents = [
    'page_view', 'cta_click', 'form_submit', 'phone_click',
    'whatsapp_click', 'download', 'scroll_depth', 'page_engagement',
    'blog_article_read', 'heartbeat', 'session_start', 'session_end',
    'form_interaction', 'form_abandon', 'exit_intent', 'configurator_step',
    'outbound_click', 'video_play', 'error', 'performance',
    'search', 'tab_visibility'
];

$stmt = $db->prepare("
    INSERT INTO analytics_events (event, ts, session_id, visitor_id, url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, props)
    VALUES (:event, :ts, :session_id, :visitor_id, :url, :referrer, :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :props)
");

$stored = 0;
foreach ($events as $ev) {
    if (!is_array($ev)) continue;

    $eventName = $ev['event'] ?? '';
    if (!in_array($eventName, $validEvents, true)) continue;

    // Check per-event toggle
    if ($enabledEvents !== null && isset($enabledEvents[$eventName]) && !$enabledEvents[$eventName]) {
        continue;
    }

    // Sanitize: no PII allowed in url/referrer
    $url = substr($ev['url'] ?? '', 0, 2048);
    $referrer = substr($ev['referrer'] ?? '', 0, 2048);
    $sessionId = substr($ev['session_id'] ?? '', 0, 64);
    $visitorId = substr($ev['visitor_id'] ?? '', 0, 64);
    $ts = $ev['ts'] ?? gmdate('c');

    // Validate timestamp format
    if (!strtotime($ts)) {
        $ts = gmdate('c');
    }

    $propsArray = isset($ev['props']) && is_array($ev['props']) ? $ev['props'] : [];

    // Server-side geolocation for session_start events
    if ($eventName === 'session_start' && empty($propsArray['geo_city'])) {
        $geoConfigStmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'geo_enabled'");
        $geoConfigStmt->execute();
        $geoEnabledRow = $geoConfigStmt->fetch();
        $geoEnabled = $geoEnabledRow && $geoEnabledRow['config_value'] === '1';

        if ($geoEnabled) {
            $geoKeyStmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'geo_api_key'");
            $geoKeyStmt->execute();
            $geoKeyRow = $geoKeyStmt->fetch();
            $geoApiKey = $geoKeyRow ? trim($geoKeyRow['config_value']) : '';

            $geoData = resolveGeoFromIP($geoApiKey);
            if ($geoData) {
                $propsArray['geo_city'] = $geoData['city'];
                $propsArray['geo_region_name'] = $geoData['regionName'];
                $propsArray['geo_country_code'] = $geoData['countryCode'];
                $propsArray['geo_country_name'] = $geoData['country'];
            }
        }
    }

    $props = !empty($propsArray) ? json_encode($propsArray) : null;

    try {
        $stmt->execute([
            ':event' => $eventName,
            ':ts' => $ts,
            ':session_id' => $sessionId,
            ':visitor_id' => $visitorId,
            ':url' => $url,
            ':referrer' => $referrer,
            ':utm_source' => substr($ev['utm_source'] ?? '', 0, 255),
            ':utm_medium' => substr($ev['utm_medium'] ?? '', 0, 255),
            ':utm_campaign' => substr($ev['utm_campaign'] ?? '', 0, 255),
            ':utm_content' => substr($ev['utm_content'] ?? '', 0, 255),
            ':utm_term' => substr($ev['utm_term'] ?? '', 0, 255),
            ':props' => $props,
        ]);
        $stored++;
    } catch (Exception $e) {
        // Log error but continue
        error_log('Analytics collect error: ' . $e->getMessage());
    }
}

echo json_encode(['ok' => true, 'stored' => $stored]);

/**
 * Resolve approximate location from client IP using ip-api.com.
 * Without API key: http://ip-api.com (free, 45 req/min, HTTP only)
 * With API key: https://pro.ip-api.com (HTTPS, higher limits)
 * The IP is NOT stored — only the resolved geo data is returned.
 */
function resolveGeoFromIP(string $apiKey = ''): ?array {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (empty($ip) || $ip === '127.0.0.1' || $ip === '::1') return null;

    // File-based cache (24h TTL) using md5 hash of IP as filename
    $cacheDir = __DIR__ . '/data/geocache/';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);

    $cacheKey = md5($ip);
    $cacheFile = $cacheDir . $cacheKey . '.json';

    if (file_exists($cacheFile) && filemtime($cacheFile) > time() - 86400) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if ($cached) return $cached;
    }

    // Build API URL based on whether we have a key
    if (!empty($apiKey)) {
        $url = "https://pro.ip-api.com/json/{$ip}?key=" . urlencode($apiKey) . "&fields=status,country,countryCode,regionName,city";
    } else {
        $url = "http://ip-api.com/json/{$ip}?fields=status,country,countryCode,regionName,city";
    }

    $ctx = stream_context_create([
        'http' => ['timeout' => 2, 'ignore_errors' => true]
    ]);
    $response = @file_get_contents($url, false, $ctx);

    if (!$response) return null;

    $data = json_decode($response, true);
    if (!$data || ($data['status'] ?? '') !== 'success') return null;

    $result = [
        'country' => $data['country'] ?? '',
        'countryCode' => $data['countryCode'] ?? '',
        'regionName' => $data['regionName'] ?? '',
        'city' => $data['city'] ?? '',
    ];
    @file_put_contents($cacheFile, json_encode($result));

    return $result;
}
