<?php
/**
 * S&S Messebau - Analytics Config Endpoint
 * GET: Read tracking configuration
 * POST: Update tracking configuration (requires auth)
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Public read - returns current tracking config
    echo json_encode(loadTrackingConfig($db));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!requireAuth()) exit;

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }

    // Save individual config keys
    $allowedKeys = [
        'enabled', 'enabled_events', 'utm_whitelist', 'domain_whitelist',
        'retention_days', 'aggregation_months', 'store_ip'
    ];

    $stmt = $db->prepare("
        INSERT INTO analytics_config (config_key, config_value, updated_at)
        VALUES (:key, :value, datetime('now'))
        ON CONFLICT(config_key) DO UPDATE SET config_value = :value, updated_at = datetime('now')
    ");

    // Map flat config to individual keys
    if (isset($input['enabled'])) {
        $stmt->execute([':key' => 'enabled', ':value' => $input['enabled'] ? '1' : '0']);
    }
    if (isset($input['events']) && is_array($input['events'])) {
        $stmt->execute([':key' => 'enabled_events', ':value' => json_encode($input['events'])]);
    }
    if (isset($input['utm_whitelist']) && is_array($input['utm_whitelist'])) {
        $stmt->execute([':key' => 'utm_whitelist', ':value' => json_encode($input['utm_whitelist'])]);
    }
    if (isset($input['domain_whitelist']) && is_array($input['domain_whitelist'])) {
        $stmt->execute([':key' => 'domain_whitelist', ':value' => json_encode($input['domain_whitelist'])]);
    }
    if (isset($input['retention_days'])) {
        $days = max(1, min(365, intval($input['retention_days'])));
        $stmt->execute([':key' => 'retention_days', ':value' => (string)$days]);
    }
    if (isset($input['aggregation_months'])) {
        $months = max(1, min(60, intval($input['aggregation_months'])));
        $stmt->execute([':key' => 'aggregation_months', ':value' => (string)$months]);
    }
    if (isset($input['store_ip'])) {
        $stmt->execute([':key' => 'store_ip', ':value' => $input['store_ip'] ? '1' : '0']);
    }

    echo json_encode(loadTrackingConfig($db));
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

function loadTrackingConfig(PDO $db): array {
    $rows = $db->query("SELECT config_key, config_value FROM analytics_config")->fetchAll();
    $map = [];
    foreach ($rows as $row) {
        $map[$row['config_key']] = $row['config_value'];
    }

    // Build config response with defaults
    $enabledEvents = isset($map['enabled_events']) ? json_decode($map['enabled_events'], true) : null;
    if (!$enabledEvents) {
        $enabledEvents = [
            'page_view' => true,
            'cta_click' => true,
            'form_submit' => true,
            'phone_click' => true,
            'whatsapp_click' => true,
            'download' => true,
            'scroll_depth' => true,
            'page_engagement' => true,
            'blog_article_read' => true,
        ];
    }

    return [
        'enabled' => ($map['enabled'] ?? '1') === '1',
        'events' => $enabledEvents,
        'utm_whitelist' => isset($map['utm_whitelist']) ? json_decode($map['utm_whitelist'], true) : ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
        'domain_whitelist' => isset($map['domain_whitelist']) ? json_decode($map['domain_whitelist'], true) : ['sunds-messebau.de', 'www.sunds-messebau.de', 'localhost'],
        'retention_days' => intval($map['retention_days'] ?? '90'),
        'aggregation_months' => intval($map['aggregation_months'] ?? '24'),
        'store_ip' => ($map['store_ip'] ?? '0') === '1',
        'last_cleanup' => $map['last_cleanup'] ?? null,
        'last_cleanup_count' => isset($map['last_cleanup_count']) ? intval($map['last_cleanup_count']) : null,
    ];
}
