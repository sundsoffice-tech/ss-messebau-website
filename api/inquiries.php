<?php
/**
 * S&S Messebau - Inquiries API
 * CRUD endpoints for contact inquiries
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetInquiries();
        break;
    case 'POST':
        handleCreateInquiry();
        break;
    case 'DELETE':
        handleDeleteInquiry();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGetInquiries(): void {
    if (!requireAuth()) return;

    $db = getDB();
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('SELECT * FROM inquiries WHERE id = :id OR inquiry_id = :inquiry_id');
        $stmt->execute([':id' => $id, ':inquiry_id' => $id]);
        $inquiry = $stmt->fetch();
        if ($inquiry) {
            $inquiry['form_data'] = json_decode($inquiry['form_data'], true);
            echo json_encode($inquiry);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Inquiry not found']);
        }
    } else {
        $type = $_GET['type'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = 'SELECT * FROM inquiries';
        $params = [];
        $conditions = [];

        if ($type) {
            $conditions[] = 'type = :type';
            $params[':type'] = $type;
        }
        if ($search) {
            $escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);
            $conditions[] = "(name LIKE :search OR email LIKE :search OR company LIKE :search) ESCAPE '\\'";
            $params[':search'] = '%' . $escapedSearch . '%';
        }

        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll();

        foreach ($inquiries as &$inq) {
            if ($inq['form_data']) {
                $inq['form_data'] = json_decode($inq['form_data'], true);
            }
        }

        echo json_encode(['inquiries' => $inquiries, 'total' => count($inquiries)]);
    }
}

function checkInquiryRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = __DIR__ . '/data/inquiry_limit_' . md5($ip) . '.json';
    $now = time();
    $maxRequests = 10;
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
        echo json_encode(['error' => 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.']);
        return false;
    }

    $timestamps[] = $now;
    @file_put_contents($rateLimitFile, json_encode($timestamps));
    return true;
}

function handleCreateInquiry(): void {
    // POST does NOT require auth – visitors submit inquiries
    if (!checkInquiryRateLimit()) return;
    enforceRequestBodyLimit();
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['inquiry_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'inquiry_id is required']);
        return;
    }

    $email = $input['email'] ?? '';
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        return;
    }

    // Validate allowed inquiry types
    $allowedTypes = ['inquiry', 'kontakt', 'banner'];
    $type = $input['type'] ?? 'inquiry';
    if (!in_array($type, $allowedTypes, true)) {
        $type = 'inquiry';
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO inquiries (inquiry_id, type, name, email, company, phone, message, form_data)
        VALUES (:inquiry_id, :type, :name, :email, :company, :phone, :message, :form_data)
    ');

    $stmt->execute([
        ':inquiry_id' => substr($input['inquiry_id'], 0, 100),
        ':type' => $type,
        ':name' => substr($input['name'] ?? '', 0, 255),
        ':email' => substr($email, 0, 255),
        ':company' => substr($input['company'] ?? '', 0, 255),
        ':phone' => substr($input['phone'] ?? '', 0, 50),
        ':message' => substr($input['message'] ?? '', 0, 10000),
        ':form_data' => json_encode($input['form_data'] ?? $input),
    ]);

    echo json_encode([
        'success' => true,
        'id' => $db->lastInsertId(),
        'inquiry_id' => $input['inquiry_id'],
    ]);
}

function handleDeleteInquiry(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM inquiries WHERE id = :id OR inquiry_id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}
