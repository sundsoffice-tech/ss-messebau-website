<?php
/**
 * S&S Messebau - External API Keys API
 * Secure server-side management of external API keys
 * All endpoints require admin auth
 * Keys are stored encrypted, only masked values returned to frontend
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
        handleGetApiKeys();
        break;
    case 'POST':
        handleAddApiKey();
        break;
    case 'PATCH':
        handleUpdateApiKey();
        break;
    case 'DELETE':
        handleDeleteApiKey();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function maskKey(string $key): string {
    if (strlen($key) <= 4) {
        return '••••••••';
    }
    return '••••••••' . substr($key, -4);
}

function encryptKey(string $key): string {
    // Use base64 encoding with a simple obfuscation
    // In production, use a proper encryption key from environment
    $encryptionKey = getenv('ENCRYPTION_KEY') ?: 'ss-messebau-default-key-2024';
    $iv = openssl_random_pseudo_bytes(16);
    $encrypted = openssl_encrypt($key, 'aes-256-cbc', $encryptionKey, 0, $iv);
    return base64_encode($iv . '::' . $encrypted);
}

function handleGetApiKeys(): void {
    $db = getDB();
    $stmt = $db->query('SELECT id, service_name, masked_key, description, created_at, updated_at FROM external_api_keys ORDER BY created_at DESC');
    $keys = $stmt->fetchAll();

    $result = [];
    foreach ($keys as $key) {
        $result[] = [
            'id' => (string)$key['id'],
            'serviceName' => $key['service_name'],
            'maskedKey' => $key['masked_key'],
            'description' => $key['description'] ?? '',
            'createdAt' => strtotime($key['created_at']) * 1000,
            'updatedAt' => strtotime($key['updated_at']) * 1000,
        ];
    }

    echo json_encode(['keys' => $result]);
}

function handleAddApiKey(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['serviceName']) || empty($input['key'])) {
        http_response_code(400);
        echo json_encode(['error' => 'serviceName and key are required']);
        return;
    }

    $serviceName = trim($input['serviceName']);
    $apiKey = trim($input['key']);
    $description = trim($input['description'] ?? '');

    $db = getDB();

    try {
        $stmt = $db->prepare('
            INSERT INTO external_api_keys (service_name, encrypted_key, masked_key, description)
            VALUES (:service_name, :encrypted_key, :masked_key, :description)
        ');
        $stmt->execute([
            ':service_name' => $serviceName,
            ':encrypted_key' => encryptKey($apiKey),
            ':masked_key' => maskKey($apiKey),
            ':description' => $description,
        ]);

        $id = $db->lastInsertId();
        $fetchStmt = $db->prepare('SELECT id, service_name, masked_key, description, created_at, updated_at FROM external_api_keys WHERE id = :id');
        $fetchStmt->execute([':id' => $id]);
        $record = $fetchStmt->fetch();

        echo json_encode([
            'success' => true,
            'key' => [
                'id' => (string)$record['id'],
                'serviceName' => $record['service_name'],
                'maskedKey' => $record['masked_key'],
                'description' => $record['description'] ?? '',
                'createdAt' => strtotime($record['created_at']) * 1000,
                'updatedAt' => strtotime($record['updated_at']) * 1000,
            ],
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save key']);
    }
}

function handleUpdateApiKey(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $sets = [];
    $params = [':id' => $id];

    if (isset($input['serviceName'])) {
        $sets[] = 'service_name = :service_name';
        $params[':service_name'] = trim($input['serviceName']);
    }

    if (isset($input['key']) && !empty(trim($input['key']))) {
        $apiKey = trim($input['key']);
        $sets[] = 'encrypted_key = :encrypted_key';
        $sets[] = 'masked_key = :masked_key';
        $params[':encrypted_key'] = encryptKey($apiKey);
        $params[':masked_key'] = maskKey($apiKey);
    }

    if (isset($input['description'])) {
        $sets[] = 'description = :description';
        $params[':description'] = trim($input['description']);
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE external_api_keys SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteApiKey(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM external_api_keys WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}
