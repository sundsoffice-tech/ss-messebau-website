<?php
/**
 * S&S Messebau - Automation Rules API
 * CRUD endpoints for automation rules
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

if (!requireAuth()) exit;

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'list':
        handleListRules();
        break;
    case 'get':
        handleGetRule();
        break;
    case 'create':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleCreateRule();
        break;
    case 'update':
        if ($method !== 'PATCH') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleUpdateRule();
        break;
    case 'delete':
        if ($method !== 'DELETE') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleDeleteRule();
        break;
    case 'toggle':
        if ($method !== 'PATCH') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleToggleRule();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: list, get, create, update, delete, toggle']);
}

function handleListRules(): void {
    $db = getDB();
    $stmt = $db->query('SELECT * FROM automation_rules ORDER BY created_at DESC');
    $rules = $stmt->fetchAll();

    $result = array_map('formatRule', $rules);
    echo json_encode(['rules' => $result, 'total' => count($result)]);
}

function handleGetRule(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM automation_rules WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $rule = $stmt->fetch();

    if (!$rule) {
        http_response_code(404);
        echo json_encode(['error' => 'Rule not found']);
        return;
    }

    echo json_encode(formatRule($rule));
}

function handleCreateRule(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'name is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO automation_rules (name, description, trigger_type, conditions, action, action_config, enabled, delay_minutes)
        VALUES (:name, :description, :trigger_type, :conditions, :action, :action_config, :enabled, :delay_minutes)
    ');

    $stmt->execute([
        ':name' => $input['name'],
        ':description' => $input['description'] ?? '',
        ':trigger_type' => $input['trigger'] ?? 'order_created',
        ':conditions' => json_encode($input['conditions'] ?? []),
        ':action' => $input['action'] ?? 'send_email',
        ':action_config' => json_encode($input['actionConfig'] ?? []),
        ':enabled' => !empty($input['enabled']) ? 1 : 0,
        ':delay_minutes' => (int)($input['delayMinutes'] ?? 0),
    ]);

    $id = $db->lastInsertId();
    $fetchStmt = $db->prepare('SELECT * FROM automation_rules WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $rule = $fetchStmt->fetch();

    echo json_encode(['success' => true, 'rule' => formatRule($rule)]);
}

function handleUpdateRule(): void {
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

    if (isset($input['name'])) {
        $sets[] = 'name = :name';
        $params[':name'] = $input['name'];
    }
    if (isset($input['description'])) {
        $sets[] = 'description = :description';
        $params[':description'] = $input['description'];
    }
    if (isset($input['trigger'])) {
        $sets[] = 'trigger_type = :trigger_type';
        $params[':trigger_type'] = $input['trigger'];
    }
    if (isset($input['conditions'])) {
        $sets[] = 'conditions = :conditions';
        $params[':conditions'] = json_encode($input['conditions']);
    }
    if (isset($input['action'])) {
        $sets[] = 'action = :action';
        $params[':action'] = $input['action'];
    }
    if (isset($input['actionConfig'])) {
        $sets[] = 'action_config = :action_config';
        $params[':action_config'] = json_encode($input['actionConfig']);
    }
    if (isset($input['enabled'])) {
        $sets[] = 'enabled = :enabled';
        $params[':enabled'] = $input['enabled'] ? 1 : 0;
    }
    if (isset($input['delayMinutes'])) {
        $sets[] = 'delay_minutes = :delay_minutes';
        $params[':delay_minutes'] = (int)$input['delayMinutes'];
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE automation_rules SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteRule(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM automation_rules WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function handleToggleRule(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $enabled = isset($input['enabled']) ? ($input['enabled'] ? 1 : 0) : null;
    if ($enabled === null) {
        http_response_code(400);
        echo json_encode(['error' => 'enabled field is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare("UPDATE automation_rules SET enabled = :enabled, updated_at = datetime('now') WHERE id = :id");
    $stmt->execute([':enabled' => $enabled, ':id' => $id]);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function formatRule(array $rule): array {
    return [
        'id' => (string)$rule['id'],
        'name' => $rule['name'],
        'description' => $rule['description'] ?? '',
        'trigger' => $rule['trigger_type'],
        'conditions' => json_decode($rule['conditions'], true) ?: [],
        'action' => $rule['action'],
        'actionConfig' => json_decode($rule['action_config'], true) ?: [],
        'enabled' => (bool)$rule['enabled'],
        'delayMinutes' => (int)$rule['delay_minutes'],
        'createdAt' => strtotime($rule['created_at']) * 1000,
        'updatedAt' => strtotime($rule['updated_at']) * 1000,
    ];
}
