<?php
/**
 * S&S Messebau - Analytics Realtime Feed Endpoint
 * GET: Returns the latest N events for a live ticker display
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

$limit = min(50, max(1, intval($_GET['limit'] ?? 20)));

$stmt = $db->prepare("
    SELECT event, ts, url, referrer, utm_source
    FROM analytics_events
    ORDER BY ts DESC
    LIMIT :limit
");
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

echo json_encode(array_map(fn($r) => [
    'event' => $r['event'],
    'ts' => $r['ts'],
    'url' => $r['url'],
    'referrer' => $r['referrer'] ?: null,
    'utm_source' => $r['utm_source'] ?: null,
], $rows));
