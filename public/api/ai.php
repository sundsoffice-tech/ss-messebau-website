<?php
/**
 * S&S Messebau - AI Admin API
 * Training data CRUD, audit log, and training context endpoint
 * All endpoints require admin auth except training context
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
    case 'training':
        handleTraining($method);
        break;
    case 'audit':
        handleAudit($method);
        break;
    case 'training_context':
        // Used by chat.php to get training data – internal use
        handleTrainingContext();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: training, audit, training_context']);
}

function handleTraining(string $method): void {
    switch ($method) {
        case 'GET':
            if (!requireAuth()) return;
            handleGetTrainingData();
            break;
        case 'POST':
            if (!requireAuth()) return;
            handleAddTrainingData();
            break;
        case 'PATCH':
            if (!requireAuth()) return;
            handleUpdateTrainingData();
            break;
        case 'DELETE':
            if (!requireAuth()) return;
            handleDeleteTrainingData();
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

function handleAudit(string $method): void {
    switch ($method) {
        case 'GET':
            if (!requireAuth()) return;
            handleGetAuditLog();
            break;
        case 'POST':
            if (!requireAuth()) return;
            handleAddAuditEntry();
            break;
        case 'DELETE':
            if (!requireAuth()) return;
            handleClearAuditLog();
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// ─── Training Data ───────────────────────────────────────────

function handleGetTrainingData(): void {
    $db = getDB();
    $stmt = $db->query('SELECT * FROM ai_training_data ORDER BY created_at DESC');
    $data = $stmt->fetchAll();

    $result = array_map('formatTrainingEntry', $data);
    echo json_encode(['data' => $result, 'total' => count($result)]);
}

function handleAddTrainingData(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['title']) || empty($input['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'title and content are required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO ai_training_data (title, content, category, active, created_by)
        VALUES (:title, :content, :category, :active, :created_by)
    ');

    $stmt->execute([
        ':title' => $input['title'],
        ':content' => $input['content'],
        ':category' => $input['category'] ?? 'faq',
        ':active' => isset($input['active']) ? ($input['active'] ? 1 : 0) : 1,
        ':created_by' => $input['createdBy'] ?? 'admin',
    ]);

    $id = $db->lastInsertId();
    $fetchStmt = $db->prepare('SELECT * FROM ai_training_data WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $entry = $fetchStmt->fetch();

    // Add audit log
    addAuditEntry('training_added', 'admin', "Wissensdatei \"{$input['title']}\" hinzugefügt", 'training');

    echo json_encode(['success' => true, 'entry' => formatTrainingEntry($entry)]);
}

function handleUpdateTrainingData(): void {
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

    if (isset($input['title'])) {
        $sets[] = 'title = :title';
        $params[':title'] = $input['title'];
    }
    if (isset($input['content'])) {
        $sets[] = 'content = :content';
        $params[':content'] = $input['content'];
    }
    if (isset($input['category'])) {
        $sets[] = 'category = :category';
        $params[':category'] = $input['category'];
    }
    if (isset($input['active'])) {
        $sets[] = 'active = :active';
        $params[':active'] = $input['active'] ? 1 : 0;
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE ai_training_data SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    addAuditEntry('training_updated', 'admin', "Wissensdatei ID $id aktualisiert", 'training');

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteTrainingData(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();

    // Get title for audit log
    $fetchStmt = $db->prepare('SELECT title FROM ai_training_data WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $entry = $fetchStmt->fetch();

    $stmt = $db->prepare('DELETE FROM ai_training_data WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($entry) {
        addAuditEntry('training_deleted', 'admin', "Wissensdatei \"{$entry['title']}\" gelöscht", 'training');
    }

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function handleTrainingContext(): void {
    // Returns active training data as context string for chat
    $db = getDB();
    $stmt = $db->query('SELECT title, content FROM ai_training_data WHERE active = 1 ORDER BY created_at DESC');
    $entries = $stmt->fetchAll();

    if (empty($entries)) {
        echo json_encode(['context' => '']);
        return;
    }

    $context = "\n\nZUSÄTZLICHES WISSEN (Admin-gepflegt):\n";
    foreach ($entries as $entry) {
        $context .= "[{$entry['title']}]\n{$entry['content']}\n\n";
    }

    echo json_encode(['context' => $context]);
}

// ─── Audit Log ───────────────────────────────────────────────

function handleGetAuditLog(): void {
    $db = getDB();
    $limit = min((int)($_GET['limit'] ?? 500), 1000);
    $stmt = $db->prepare('SELECT * FROM ai_audit_log ORDER BY created_at DESC LIMIT :limit');
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll();

    $result = [];
    foreach ($logs as $log) {
        $result[] = [
            'id' => (string)$log['id'],
            'timestamp' => strtotime($log['created_at']) * 1000,
            'action' => $log['action'],
            'actor' => $log['actor'] ?? 'admin',
            'details' => $log['details'] ?? '',
            'category' => $log['category'] ?? 'config',
        ];
    }

    echo json_encode(['logs' => $result, 'total' => count($result)]);
}

function handleAddAuditEntry(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'action is required']);
        return;
    }

    addAuditEntry(
        $input['action'],
        $input['actor'] ?? 'admin',
        $input['details'] ?? '',
        $input['category'] ?? 'config'
    );

    echo json_encode(['success' => true]);
}

function handleClearAuditLog(): void {
    $db = getDB();
    addAuditEntry('audit_cleared', 'admin', 'Audit-Log gelöscht', 'config');
    $db->exec('DELETE FROM ai_audit_log WHERE action != \'audit_cleared\'');
    echo json_encode(['success' => true]);
}

function addAuditEntry(string $action, string $actor, string $details, string $category): void {
    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO ai_audit_log (action, actor, details, category)
        VALUES (:action, :actor, :details, :category)
    ');
    $stmt->execute([
        ':action' => $action,
        ':actor' => $actor,
        ':details' => $details,
        ':category' => $category,
    ]);
}

function formatTrainingEntry(array $entry): array {
    return [
        'id' => (string)$entry['id'],
        'title' => $entry['title'],
        'content' => $entry['content'],
        'category' => $entry['category'] ?? 'faq',
        'active' => (bool)$entry['active'],
        'createdBy' => $entry['created_by'] ?? 'admin',
        'createdAt' => strtotime($entry['created_at']) * 1000,
        'updatedAt' => strtotime($entry['updated_at']) * 1000,
    ];
}
