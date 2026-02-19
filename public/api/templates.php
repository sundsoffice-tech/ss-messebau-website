<?php
/**
 * S&S Messebau - Email Templates API
 * CRUD endpoints for email templates with preview
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
        handleListTemplates();
        break;
    case 'get':
        handleGetTemplate();
        break;
    case 'create':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleCreateTemplate();
        break;
    case 'update':
        if ($method !== 'PATCH') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleUpdateTemplate();
        break;
    case 'delete':
        if ($method !== 'DELETE') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handleDeleteTemplate();
        break;
    case 'preview':
        if ($method !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }
        handlePreview();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use: list, get, create, update, delete, preview']);
}

function handleListTemplates(): void {
    $db = getDB();
    $category = $_GET['category'] ?? null;

    $sql = 'SELECT * FROM email_templates';
    $params = [];

    if ($category) {
        $sql .= ' WHERE category = :category';
        $params[':category'] = $category;
    }
    $sql .= ' ORDER BY created_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $templates = $stmt->fetchAll();

    $result = array_map('formatTemplate', $templates);
    echo json_encode(['templates' => $result, 'total' => count($result)]);
}

function handleGetTemplate(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM email_templates WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $template = $stmt->fetch();

    if (!$template) {
        http_response_code(404);
        echo json_encode(['error' => 'Template not found']);
        return;
    }

    echo json_encode(formatTemplate($template));
}

function handleCreateTemplate(): void {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['name']) || empty($input['subject'])) {
        http_response_code(400);
        echo json_encode(['error' => 'name and subject are required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO email_templates (name, subject, html_content, text_content, variables, category, version)
        VALUES (:name, :subject, :html_content, :text_content, :variables, :category, 1)
    ');

    $stmt->execute([
        ':name' => $input['name'],
        ':subject' => $input['subject'],
        ':html_content' => $input['htmlContent'] ?? '',
        ':text_content' => $input['textContent'] ?? '',
        ':variables' => json_encode($input['variables'] ?? []),
        ':category' => $input['category'] ?? 'custom',
    ]);

    $id = $db->lastInsertId();
    $fetchStmt = $db->prepare('SELECT * FROM email_templates WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $template = $fetchStmt->fetch();

    echo json_encode(['success' => true, 'template' => formatTemplate($template)]);
}

function handleUpdateTemplate(): void {
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
    if (isset($input['subject'])) {
        $sets[] = 'subject = :subject';
        $params[':subject'] = $input['subject'];
    }
    if (isset($input['htmlContent'])) {
        $sets[] = 'html_content = :html_content';
        $params[':html_content'] = $input['htmlContent'];
    }
    if (isset($input['textContent'])) {
        $sets[] = 'text_content = :text_content';
        $params[':text_content'] = $input['textContent'];
    }
    if (isset($input['variables'])) {
        $sets[] = 'variables = :variables';
        $params[':variables'] = json_encode($input['variables']);
    }
    if (isset($input['category'])) {
        $sets[] = 'category = :category';
        $params[':category'] = $input['category'];
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    // Increment version on each update
    $sets[] = 'version = version + 1';
    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE email_templates SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteTemplate(): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM email_templates WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function handlePreview(): void {
    $input = json_decode(file_get_contents('php://input'), true);
    $htmlContent = $input['htmlContent'] ?? '';
    $variables = $input['variables'] ?? [];

    // Replace {{variable}} placeholders with provided values
    $html = preg_replace_callback('/\{\{(\w+)\}\}/', function ($matches) use ($variables) {
        $key = $matches[1];
        return htmlspecialchars($variables[$key] ?? $matches[0], ENT_QUOTES, 'UTF-8');
    }, $htmlContent);

    echo json_encode(['html' => $html]);
}

function formatTemplate(array $template): array {
    return [
        'id' => (string)$template['id'],
        'name' => $template['name'],
        'subject' => $template['subject'],
        'htmlContent' => $template['html_content'] ?? '',
        'textContent' => $template['text_content'] ?? '',
        'variables' => json_decode($template['variables'], true) ?: [],
        'category' => $template['category'] ?? 'custom',
        'version' => (int)($template['version'] ?? 1),
        'createdAt' => strtotime($template['created_at']) * 1000,
        'updatedAt' => strtotime($template['updated_at']) * 1000,
    ];
}
