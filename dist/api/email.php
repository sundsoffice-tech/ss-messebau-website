<?php
/**
 * S&S Messebau - Email API
 * Endpoints: enqueue, send, list, status
 * SendGrid API key is stored server-side in config.php
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
    case 'enqueue':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleEnqueue();
        break;
    case 'send':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleSend();
        break;
    case 'auto_send':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleAutoSend();
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
    case 'compose_send':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleComposeSend();
        break;
    case 'tracking':
        handleTracking();
        break;
    case 'tracking_detail':
        handleTrackingDetail();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: enqueue, auto_send, send, list, delete, status, config, compose_send, tracking, tracking_detail']);
}

/**
 * Rate limit public email endpoints to prevent abuse/email bombing.
 * Max 5 emails per 10 minutes per IP.
 */
function checkEmailRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = __DIR__ . '/data/email_limit_' . md5($ip) . '.json';
    $now = time();
    $maxRequests = 5;
    $windowSeconds = 600; // 10 minutes

    $timestamps = [];
    if (file_exists($rateLimitFile)) {
        $timestamps = json_decode(file_get_contents($rateLimitFile), true) ?: [];
        $timestamps = array_values(array_filter($timestamps, function($ts) use ($now, $windowSeconds) {
            return ($now - $ts) < $windowSeconds;
        }));
    }

    if (count($timestamps) >= $maxRequests) {
        http_response_code(429);
        echo json_encode(['error' => 'Zu viele E-Mail-Anfragen. Bitte versuchen Sie es später erneut.']);
        return false;
    }

    $timestamps[] = $now;
    @file_put_contents($rateLimitFile, json_encode($timestamps));
    return true;
}

/**
 * Sanitize and validate email input data, enforcing size limits.
 */
function sanitizeEmailInput(array &$input): ?string {
    // Validate customer_email if provided
    $customerEmail = $input['customer_email'] ?? '';
    if (!empty($customerEmail) && !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        return 'Invalid customer_email address';
    }

    // Enforce size limits on all text fields to prevent abuse
    $input['queue_id'] = substr($input['queue_id'] ?? '', 0, 100);
    $input['subject'] = substr($input['subject'] ?? '', 0, 500);
    $input['html_body'] = substr($input['html_body'] ?? '', 0, 100000);
    $input['text_body'] = substr($input['text_body'] ?? '', 0, 50000);
    $input['customer_email'] = $customerEmail;
    $input['customer_subject'] = substr($input['customer_subject'] ?? '', 0, 500);
    $input['customer_html_body'] = substr($input['customer_html_body'] ?? '', 0, 100000);
    $input['customer_text_body'] = substr($input['customer_text_body'] ?? '', 0, 50000);
    $input['order_id'] = substr($input['order_id'] ?? '', 0, 100);

    return null; // no error
}

function handleEnqueue(): void {
    // Rate limit to prevent email bombing
    if (!checkEmailRateLimit()) return;

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

    $sanitizeError = sanitizeEmailInput($input);
    if ($sanitizeError) {
        http_response_code(400);
        echo json_encode(['error' => $sanitizeError]);
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
        ':html_body' => $input['html_body'],
        ':text_body' => $input['text_body'],
        ':customer_email' => $input['customer_email'],
        ':customer_subject' => $input['customer_subject'],
        ':customer_html_body' => $input['customer_html_body'],
        ':customer_text_body' => $input['customer_text_body'],
        ':attachments' => json_encode($input['attachments'] ?? []),
        ':order_id' => $input['order_id'],
    ]);

    echo json_encode([
        'success' => true,
        'queue_id' => $input['queue_id'],
    ]);
}

function handleAutoSend(): void {
    // Rate limit to prevent email bombing
    if (!checkEmailRateLimit()) return;

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

    $sanitizeError = sanitizeEmailInput($input);
    if ($sanitizeError) {
        http_response_code(400);
        echo json_encode(['error' => $sanitizeError]);
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
        ':html_body' => $input['html_body'],
        ':text_body' => $input['text_body'],
        ':customer_email' => $input['customer_email'],
        ':customer_subject' => $input['customer_subject'],
        ':customer_html_body' => $input['customer_html_body'],
        ':customer_text_body' => $input['customer_text_body'],
        ':attachments' => json_encode($input['attachments'] ?? []),
        ':order_id' => $input['order_id'],
    ]);

    $queueId = $input['queue_id'];

    // Immediately send company email
    $companyResult = sendViaSendGrid($input['to_email'], $input['subject'], $input['html_body'] ?? '', $input['text_body'] ?? '');

    if (!$companyResult['success']) {
        $updateStmt = $db->prepare("UPDATE email_queue SET error = :error WHERE queue_id = :queue_id");
        $updateStmt->execute([':error' => $companyResult['error'], ':queue_id' => $queueId]);
        echo json_encode(['success' => false, 'queue_id' => $queueId, 'error' => 'Company email: ' . $companyResult['error']]);
        return;
    }

    // Send customer email if present
    $customerEmail = $input['customer_email'] ?? '';
    $customerHtmlBody = $input['customer_html_body'] ?? '';
    if (!empty($customerEmail) && !empty($customerHtmlBody)) {
        if (filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            $customerResult = sendViaSendGrid(
                $customerEmail,
                $input['customer_subject'] ?? '',
                $customerHtmlBody,
                $input['customer_text_body'] ?? ''
            );

            if (!$customerResult['success']) {
                echo json_encode(['success' => false, 'queue_id' => $queueId, 'error' => 'Customer email: ' . $customerResult['error']]);
                return;
            }
        }
    }

    // Mark as sent
    $updateStmt = $db->prepare("UPDATE email_queue SET sent = 1, sent_at = datetime('now'), error = NULL WHERE queue_id = :queue_id");
    $updateStmt->execute([':queue_id' => $queueId]);

    echo json_encode(['success' => true, 'queue_id' => $queueId]);
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

function getActiveSendGridKey(): string {
    // Check database first for persistently stored key
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT encrypted_key FROM external_api_keys WHERE service_name = :service ORDER BY updated_at DESC LIMIT 1');
        $stmt->execute([':service' => 'sendgrid']);
        $row = $stmt->fetch();
        if ($row && !empty($row['encrypted_key'])) {
            return $row['encrypted_key'];
        }
    } catch (\Throwable $e) {
        error_log('SendGrid key DB lookup failed: ' . $e->getMessage());
    }
    // Fallback to config.php / environment variable
    return SENDGRID_API_KEY;
}

function handleStatus(): void {
    $apiKey = getActiveSendGridKey();
    $apiKeySet = !empty($apiKey);

    echo json_encode([
        'provider' => $apiKeySet ? 'sendgrid' : 'test',
        'configured' => $apiKeySet,
        'ready' => $apiKeySet,
        'testMode' => !$apiKeySet,
    ]);
}

function sendViaSendGrid(string $to, string $subject, string $htmlBody, string $textBody): array {
    $apiKey = getActiveSendGridKey();
    if (empty($apiKey)) {
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
        'reply_to' => [
            'email' => COMPANY_EMAIL,
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
            'Authorization: Bearer ' . $apiKey,
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
    $apiKey = getActiveSendGridKey();
    $apiKeySet = !empty($apiKey);
    echo json_encode([
        'provider' => $apiKeySet ? 'sendgrid' : 'test',
        'fromEmail' => FROM_EMAIL,
        'fromName' => FROM_NAME,
        'hasApiKey' => $apiKeySet,
    ]);
}

function handleSaveEmailConfig(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $apiKey = $input['apiKey'] ?? '';

    if (!empty($apiKey)) {
        $db = getDB();
        $maskedKey = strlen($apiKey) > 9
            ? substr($apiKey, 0, 5) . '...' . substr($apiKey, -4)
            : str_repeat('*', strlen($apiKey));

        // Upsert: replace existing sendgrid key
        $stmt = $db->prepare("DELETE FROM external_api_keys WHERE service_name = 'sendgrid'");
        $stmt->execute();

        $stmt = $db->prepare("INSERT INTO external_api_keys (service_name, encrypted_key, masked_key, description) VALUES ('sendgrid', :key, :masked, 'SendGrid API Key')");
        $stmt->execute([
            ':key' => $apiKey,
            ':masked' => $maskedKey,
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'SendGrid API-Key gespeichert.',
        ]);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Email-Konfiguration wird serverseitig über Umgebungsvariablen verwaltet.',
    ]);
}

// ─── Compose Send ────────────────────────────────────────────

function handleComposeSend(): void {
    if (!requireAuth()) return;

    $input = json_decode(file_get_contents('php://input'), true);

    $to = trim($input['to'] ?? '');
    $subject = trim($input['subject'] ?? '');
    $htmlBody = $input['html_body'] ?? '';

    if (empty($to) || empty($subject)) {
        http_response_code(400);
        echo json_encode(['error' => 'to and subject are required']);
        return;
    }

    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        return;
    }

    $textBody = $input['text_body'] ?? strip_tags($htmlBody);

    // Enqueue the email
    $queueId = 'compose-' . bin2hex(random_bytes(8));
    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO email_queue (queue_id, to_email, subject, html_body, text_body, order_id, sent)
        VALUES (:queue_id, :to_email, :subject, :html_body, :text_body, :order_id, 0)
    ');

    $stmt->execute([
        ':queue_id' => $queueId,
        ':to_email' => $to,
        ':subject' => $subject,
        ':html_body' => $htmlBody,
        ':text_body' => $textBody,
        ':order_id' => $input['related_order_id'] ?? '',
    ]);

    // Create tracking record
    $trackingId = 'trk-' . bin2hex(random_bytes(8));
    try {
        $trackStmt = $db->prepare('
            INSERT INTO email_tracking (tracking_id, to_email, subject, status, order_id, inquiry_id)
            VALUES (:tracking_id, :to_email, :subject, :status, :order_id, :inquiry_id)
        ');
        $trackStmt->execute([
            ':tracking_id' => $trackingId,
            ':to_email' => $to,
            ':subject' => $subject,
            ':status' => 'queued',
            ':order_id' => $input['related_order_id'] ?? '',
            ':inquiry_id' => $input['related_inquiry_id'] ?? '',
        ]);

        $eventStmt = $db->prepare('
            INSERT INTO email_tracking_events (tracking_id, event, details)
            VALUES (:tracking_id, :event, :details)
        ');
        $eventStmt->execute([
            ':tracking_id' => $trackingId,
            ':event' => 'queued',
            ':details' => 'Email composed and queued for sending',
        ]);
    } catch (\Throwable $e) {
        error_log('Tracking insert failed: ' . $e->getMessage());
    }

    // Attempt immediate send
    $result = sendViaSendGrid($to, $subject, $htmlBody, $textBody);

    if ($result['success']) {
        $updateStmt = $db->prepare("UPDATE email_queue SET sent = 1, sent_at = datetime('now'), error = NULL WHERE queue_id = :queue_id");
        $updateStmt->execute([':queue_id' => $queueId]);

        // Update tracking
        try {
            $db->prepare("UPDATE email_tracking SET status = 'sent', updated_at = datetime('now') WHERE tracking_id = :tid")
               ->execute([':tid' => $trackingId]);
            $db->prepare("INSERT INTO email_tracking_events (tracking_id, event, details) VALUES (:tid, 'sent', 'Email sent successfully')")
               ->execute([':tid' => $trackingId]);
        } catch (\Throwable $e) {
            error_log('Tracking update failed: ' . $e->getMessage());
        }

        echo json_encode(['success' => true]);
    } else {
        $updateStmt = $db->prepare("UPDATE email_queue SET error = :error WHERE queue_id = :queue_id");
        $updateStmt->execute([':error' => $result['error'], ':queue_id' => $queueId]);

        // Update tracking
        try {
            $db->prepare("UPDATE email_tracking SET status = 'failed', updated_at = datetime('now') WHERE tracking_id = :tid")
               ->execute([':tid' => $trackingId]);
            $db->prepare("INSERT INTO email_tracking_events (tracking_id, event, details) VALUES (:tid, 'failed', :details)")
               ->execute([':tid' => $trackingId, ':details' => $result['error']]);
        } catch (\Throwable $e) {
            error_log('Tracking update failed: ' . $e->getMessage());
        }

        echo json_encode(['success' => false, 'error' => $result['error']]);
    }
}

// ─── Tracking ────────────────────────────────────────────────

function handleTracking(): void {
    if (!requireAuth()) return;

    $db = getDB();
    $status = $_GET['status'] ?? null;
    $orderId = $_GET['order_id'] ?? null;
    $inquiryId = $_GET['inquiry_id'] ?? null;

    $sql = 'SELECT * FROM email_tracking';
    $params = [];
    $conditions = [];

    if ($status) {
        $conditions[] = 'status = :status';
        $params[':status'] = $status;
    }
    if ($orderId) {
        $conditions[] = 'order_id = :order_id';
        $params[':order_id'] = $orderId;
    }
    if ($inquiryId) {
        $conditions[] = 'inquiry_id = :inquiry_id';
        $params[':inquiry_id'] = $inquiryId;
    }

    if (!empty($conditions)) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }
    $sql .= ' ORDER BY created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    $result = [];
    foreach ($records as $record) {
        $evtStmt = $db->prepare('SELECT * FROM email_tracking_events WHERE tracking_id = :tid ORDER BY created_at ASC');
        $evtStmt->execute([':tid' => $record['tracking_id']]);
        $events = $evtStmt->fetchAll();

        $result[] = formatTrackingRecord($record, $events);
    }

    echo json_encode(['records' => $result, 'total' => count($result)]);
}

function handleTrackingDetail(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM email_tracking WHERE id = :id OR tracking_id = :tid');
    $stmt->execute([':id' => $id, ':tid' => $id]);
    $record = $stmt->fetch();

    if (!$record) {
        http_response_code(404);
        echo json_encode(['error' => 'Tracking record not found']);
        return;
    }

    $evtStmt = $db->prepare('SELECT * FROM email_tracking_events WHERE tracking_id = :tid ORDER BY created_at ASC');
    $evtStmt->execute([':tid' => $record['tracking_id']]);
    $events = $evtStmt->fetchAll();

    echo json_encode(formatTrackingRecord($record, $events));
}

function formatTrackingRecord(array $record, array $events): array {
    $formattedEvents = [];
    foreach ($events as $event) {
        $formattedEvents[] = [
            'id' => (string)$event['id'],
            'emailId' => $event['tracking_id'],
            'event' => $event['event'],
            'timestamp' => strtotime($event['created_at']) * 1000,
            'details' => $event['details'] ?? '',
        ];
    }

    return [
        'id' => (string)$record['id'],
        'to' => $record['to_email'],
        'subject' => $record['subject'] ?? '',
        'status' => $record['status'] ?? 'queued',
        'orderId' => $record['order_id'] ?: null,
        'inquiryId' => $record['inquiry_id'] ?: null,
        'events' => $formattedEvents,
        'createdAt' => strtotime($record['created_at']) * 1000,
    ];
}
