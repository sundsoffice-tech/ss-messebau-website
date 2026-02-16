<?php
/**
 * S&S Messebau - AI Keys API
 * Secure server-side management of AI API keys
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// All endpoints require admin authentication
if (!requireAuth()) {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetKeys();
        break;
    case 'POST':
        handleAddKey();
        break;
    case 'PATCH':
        handleRevokeKey();
        break;
    case 'DELETE':
        handleDeleteKey();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function maskKey(string $key): string {
    if (strlen($key) <= 4) {
        return '****';
    }
    return str_repeat('•', strlen($key) - 4) . substr($key, -4);
}

function handleGetKeys(): void {
    $db = getDB();
    $stmt = $db->query('SELECT id, key_id, provider, api_key, status, created_at, last_used_at FROM ai_keys ORDER BY created_at DESC');
    $keys = $stmt->fetchAll();

    $result = [];
    foreach ($keys as $key) {
        $result[] = [
            'id' => $key['key_id'],
            'provider' => $key['provider'],
            'maskedKey' => maskKey($key['api_key']),
            'status' => $key['status'],
            'createdAt' => strtotime($key['created_at']) * 1000,
            'lastUsedAt' => $key['last_used_at'] ? strtotime($key['last_used_at']) * 1000 : null,
        ];
    }

    echo json_encode(['keys' => $result]);
}

function handleAddKey(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['provider']) || empty($input['key'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Provider and key are required']);
        return;
    }

    $provider = trim($input['provider']);
    $apiKey = trim($input['key']);
    $keyId = uniqid('key_', true);

    $db = getDB();
    
    try {
        $stmt = $db->prepare('INSERT INTO ai_keys (key_id, provider, api_key, status) VALUES (:key_id, :provider, :api_key, :status)');
        $stmt->execute([
            ':key_id' => $keyId,
            ':provider' => $provider,
            ':api_key' => $apiKey,
            ':status' => 'active',
        ]);

        // Fetch the inserted record to get the actual timestamp
        $insertedId = $db->lastInsertId();
        $fetchStmt = $db->prepare('SELECT created_at FROM ai_keys WHERE id = :id');
        $fetchStmt->execute([':id' => $insertedId]);
        $record = $fetchStmt->fetch();

        echo json_encode([
            'success' => true,
            'key' => [
                'id' => $keyId,
                'provider' => $provider,
                'maskedKey' => maskKey($apiKey),
                'status' => 'active',
                'createdAt' => strtotime($record['created_at']) * 1000,
                'lastUsedAt' => null,
            ],
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save key: ' . $e->getMessage()]);
    }
}

function handleRevokeKey(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['keyId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'keyId is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('UPDATE ai_keys SET status = :status WHERE key_id = :key_id');
    $stmt->execute([
        ':status' => 'revoked',
        ':key_id' => $input['keyId'],
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Key not found']);
        return;
    }

    echo json_encode(['success' => true]);
}

function handleDeleteKey(): void {
    $keyId = $_GET['keyId'] ?? null;
    
    if (empty($keyId)) {
        http_response_code(400);
        echo json_encode(['error' => 'keyId is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM ai_keys WHERE key_id = :key_id');
    $stmt->execute([':key_id' => $keyId]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Key not found']);
        return;
    }

    echo json_encode(['success' => true]);
}
