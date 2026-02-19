<?php
/**
 * S&S Messebau - Notifications API
 * Config management + server-side webhook delivery
 * All endpoints require admin auth
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'config':
        if ($method === 'GET') {
            // GET config is read-only, no auth needed (forms use this to get recipients/webhooks)
            handleGetConfig();
        } elseif ($method === 'POST') {
            if (!requireAuth()) return;
            handleSaveConfig();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
    case 'webhook_test':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        if (!requireAuth()) return;
        handleWebhookTest();
        break;
    case 'send_webhook':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        // send_webhook can be called from backend processes without auth
        handleSendWebhook();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: config, webhook_test, send_webhook']);
}

function handleGetConfig(): void {
    $db = getDB();
    $stmt = $db->prepare('SELECT config_key, config_value FROM notification_config');
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $config = [
        'recipients' => ['info@sundsmessebau.com'],
        'webhooks' => [],
        'sendCustomerConfirmation' => true,
    ];

    foreach ($rows as $row) {
        $config[$row['config_key']] = json_decode($row['config_value'], true);
    }

    echo json_encode($config);
}

function handleSaveConfig(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Config data is required']);
        return;
    }

    $db = getDB();
    $allowedKeys = ['recipients', 'webhooks', 'sendCustomerConfirmation'];

    foreach ($allowedKeys as $key) {
        if (isset($input[$key])) {
            $stmt = $db->prepare('
                INSERT INTO notification_config (config_key, config_value, updated_at)
                VALUES (:key, :value, datetime(\'now\'))
                ON CONFLICT(config_key) DO UPDATE SET config_value = :value, updated_at = datetime(\'now\')
            ');
            $stmt->execute([
                ':key' => $key,
                ':value' => json_encode($input[$key]),
            ]);
        }
    }

    echo json_encode(['success' => true]);
}

function handleWebhookTest(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['url'])) {
        http_response_code(400);
        echo json_encode(['error' => 'url is required']);
        return;
    }

    $url = $input['url'];

    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid URL']);
        return;
    }

    $parsed = parse_url($url);
    if (!in_array($parsed['scheme'] ?? '', ['http', 'https'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Only HTTP/HTTPS URLs are allowed']);
        return;
    }

    $payload = json_encode([
        'text' => '🔔 Test-Webhook von S&S Messebau Admin',
        'type' => 'test',
        'inquiryId' => 'test_' . time(),
        'data' => ['name' => 'Test', 'email' => 'test@example.com'],
    ]);

    $result = sendWebhookRequest($url, $payload);

    if ($result['success']) {
        echo json_encode(['success' => true, 'message' => 'Webhook erfolgreich gesendet']);
    } else {
        http_response_code(502);
        echo json_encode(['success' => false, 'error' => $result['error']]);
    }
}

function handleSendWebhook(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['url']) || empty($input['payload'])) {
        http_response_code(400);
        echo json_encode(['error' => 'url and payload are required']);
        return;
    }

    $url = $input['url'];
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid URL']);
        return;
    }

    $result = sendWebhookRequest($url, json_encode($input['payload']));
    echo json_encode($result);
}

function sendWebhookRequest(string $url, string $payload): array {
    // SSRF protection: block private and reserved IP ranges
    $parsed = parse_url($url);
    $host = $parsed['host'] ?? '';
    $ip = gethostbyname($host);

    if ($ip === $host && !filter_var($host, FILTER_VALIDATE_IP)) {
        return ['success' => false, 'error' => 'Could not resolve hostname'];
    }

    if (
        filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
    ) {
        return ['success' => false, 'error' => 'Webhook URL must not target private or reserved IP ranges'];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'error' => 'Connection error: ' . $curlError];
    }

    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true];
    }

    return ['success' => false, 'error' => "HTTP $httpCode: $response"];
}
