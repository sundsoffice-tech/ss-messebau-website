<?php
/**
 * S&S Messebau - Email API
 * Endpoints: enqueue, send, list, status
 * SendGrid API key is stored server-side in config.php
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'enqueue':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleEnqueue();
        break;
    case 'send':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleSend();
        break;
    case 'list':
        handleList();
        break;
    case 'delete':
        if ($method !== 'DELETE') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleDeleteEmail();
        break;
    case 'status':
        handleStatus();
        break;
    case 'config':
        if ($method === 'GET') {
            if (!requireAuth()) return;
            handleGetEmailConfig();
        } elseif ($method === 'POST') {
            if (!requireAuth()) return;
            handleSaveEmailConfig();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: enqueue, send, list, delete, status, config']);
}

function handleEnqueue(): void {
    // Enqueue does NOT require auth – forms submit emails
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['queue_id']) || empty($input['to_email']) || empty($input['subject'])) {
        http_response_code(400);
        echo json_encode(['error' => 'queue_id, to_email, and subject are required']);
        return;
    }

    if (!filter_var($input['to_email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid to_email address']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT OR REPLACE INTO email_queue (queue_id, to_email, subject, html_body, text_body,
            customer_email, customer_subject, customer_html_body, customer_text_body,
            attachments, order_id, sent)
        VALUES (:queue_id, :to_email, :subject, :html_body, :text_body,
            :customer_email, :customer_subject, :customer_html_body, :customer_text_body,
            :attachments, :order_id, 0)
    ');

    $stmt->execute([
        ':queue_id' => $input['queue_id'],
        ':to_email' => $input['to_email'],
        ':subject' => $input['subject'],
        ':html_body' => $input['html_body'] ?? '',
        ':text_body' => $input['text_body'] ?? '',
        ':customer_email' => $input['customer_email'] ?? '',
        ':customer_subject' => $input['customer_subject'] ?? '',
        ':customer_html_body' => $input['customer_html_body'] ?? '',
        ':customer_text_body' => $input['customer_text_body'] ?? '',
        ':attachments' => json_encode($input['attachments'] ?? []),
        ':order_id' => $input['order_id'] ?? '',
    ]);

    echo json_encode([
        'success' => true,
        'queue_id' => $input['queue_id'],
    ]);
}

function handleSend(): void {
    if (!requireAuth()) return;

    $input = json_decode(file_get_contents('php://input'), true);
    $queueId = $input['queue_id'] ?? $_GET['queue_id'] ?? null;

    if (!$queueId) {
        http_response_code(400);
        echo json_encode(['error' => 'queue_id is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM email_queue WHERE queue_id = :queue_id');
    $stmt->execute([':queue_id' => $queueId]);
    $email = $stmt->fetch();

    if (!$email) {
        http_response_code(404);
        echo json_encode(['error' => 'Email not found in queue']);
        return;
    }

    // Send company email
    $companyResult = sendViaSendGrid($email['to_email'], $email['subject'], $email['html_body'], $email['text_body']);

    if (!$companyResult['success']) {
        // Mark error
        $updateStmt = $db->prepare("UPDATE email_queue SET error = :error WHERE queue_id = :queue_id");
        $updateStmt->execute([':error' => $companyResult['error'], ':queue_id' => $queueId]);

        echo json_encode(['success' => false, 'error' => 'Company email: ' . $companyResult['error']]);
        return;
    }

    // Send customer email if present
    if (!empty($email['customer_email']) && !empty($email['customer_html_body'])) {
        $customerResult = sendViaSendGrid(
            $email['customer_email'],
            $email['customer_subject'],
            $email['customer_html_body'],
            $email['customer_text_body']
        );

        if (!$customerResult['success']) {
            echo json_encode(['success' => false, 'error' => 'Customer email: ' . $customerResult['error']]);
            return;
        }
    }

    // Mark as sent
    $updateStmt = $db->prepare("UPDATE email_queue SET sent = 1, sent_at = datetime('now'), error = NULL WHERE queue_id = :queue_id");
    $updateStmt->execute([':queue_id' => $queueId]);

    echo json_encode(['success' => true]);
}

function handleList(): void {
    if (!requireAuth()) return;

    $db = getDB();
    $sentFilter = $_GET['sent'] ?? null;

    $sql = 'SELECT * FROM email_queue';
    $params = [];

    if ($sentFilter !== null) {
        $sql .= ' WHERE sent = :sent';
        $params[':sent'] = (int)$sentFilter;
    }
    $sql .= ' ORDER BY created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $emails = $stmt->fetchAll();

    foreach ($emails as &$email) {
        $email['attachments'] = json_decode($email['attachments'], true) ?: [];
    }

    echo json_encode(['emails' => $emails, 'total' => count($emails)]);
}

function handleDeleteEmail(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM email_queue WHERE id = :id OR queue_id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function handleStatus(): void {
    $apiKeySet = !empty(SENDGRID_API_KEY);

    echo json_encode([
        'provider' => $apiKeySet ? 'sendgrid' : 'test',
        'configured' => $apiKeySet,
        'ready' => $apiKeySet,
        'testMode' => !$apiKeySet,
    ]);
}

function sendViaSendGrid(string $to, string $subject, string $htmlBody, string $textBody): array {
    if (empty(SENDGRID_API_KEY)) {
        // Test mode: log and return success
        error_log("📧 [TEST MODE] Email to: $to, Subject: $subject");
        return ['success' => true];
    }

    $payload = [
        'personalizations' => [
            [
                'to' => [['email' => $to]],
                'subject' => $subject,
            ],
        ],
        'from' => [
            'email' => FROM_EMAIL,
            'name' => FROM_NAME,
        ],
        'content' => [
            ['type' => 'text/plain', 'value' => $textBody ?: strip_tags($htmlBody)],
            ['type' => 'text/html', 'value' => $htmlBody],
        ],
    ];

    $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . SENDGRID_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'error' => 'cURL Error: ' . $curlError];
    }

    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true];
    }

    return ['success' => false, 'error' => "SendGrid Error ($httpCode): $response"];
}

function handleGetEmailConfig(): void {
    $apiKeySet = !empty(SENDGRID_API_KEY);
    echo json_encode([
        'provider' => $apiKeySet ? 'sendgrid' : 'test',
        'fromEmail' => FROM_EMAIL,
        'fromName' => FROM_NAME,
    ]);
}

function handleSaveEmailConfig(): void {
    // SMTP config is managed via environment variables / config.php on the server.
    // This endpoint acknowledges the request but the actual key management
    // is done server-side through config.php or environment variables.
    echo json_encode([
        'success' => true,
        'message' => 'Email-Konfiguration wird serverseitig über Umgebungsvariablen verwaltet.',
    ]);
}
