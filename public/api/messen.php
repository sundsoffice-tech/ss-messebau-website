<?php
/**
 * S&S Messebau - Messen API
 * CRUD endpoints for messe events
 * GET: public (no auth), POST/PATCH/DELETE: admin auth required
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetEvents();
        break;
    case 'POST':
        handleCreateEvent();
        break;
    case 'PATCH':
        handleUpdateEvent();
        break;
    case 'DELETE':
        handleDeleteEvent();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGetEvents(): void {
    // GET is public – no auth required
    $db = getDB();
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('SELECT * FROM messe_events WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();
        if ($event) {
            echo json_encode(formatEvent($event));
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Event not found']);
        }
        return;
    }

    $category = $_GET['category'] ?? null;
    $sql = 'SELECT * FROM messe_events';
    $params = [];

    if ($category) {
        $sql .= ' WHERE category = :category';
        $params[':category'] = $category;
    }
    $sql .= ' ORDER BY start_date ASC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $events = $stmt->fetchAll();

    $result = array_map('formatEvent', $events);
    echo json_encode(['events' => $result, 'total' => count($result)]);
}

function handleCreateEvent(): void {
    if (!requireAuth()) return;

    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'name is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO messe_events (name, location, start_date, end_date, category, website, description, ss_present, image_url)
        VALUES (:name, :location, :start_date, :end_date, :category, :website, :description, :ss_present, :image_url)
    ');

    $stmt->execute([
        ':name' => $input['name'],
        ':location' => $input['location'] ?? '',
        ':start_date' => $input['startDate'] ?? '',
        ':end_date' => $input['endDate'] ?? '',
        ':category' => $input['category'] ?? 'allgemein',
        ':website' => $input['website'] ?? '',
        ':description' => $input['description'] ?? '',
        ':ss_present' => !empty($input['ssPresent']) ? 1 : 0,
        ':image_url' => $input['imageUrl'] ?? '',
    ]);

    $id = $db->lastInsertId();
    $fetchStmt = $db->prepare('SELECT * FROM messe_events WHERE id = :id');
    $fetchStmt->execute([':id' => $id]);
    $event = $fetchStmt->fetch();

    echo json_encode(['success' => true, 'event' => formatEvent($event)]);
}

function handleUpdateEvent(): void {
    if (!requireAuth()) return;

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

    $fieldMap = [
        'name' => 'name',
        'location' => 'location',
        'startDate' => 'start_date',
        'endDate' => 'end_date',
        'category' => 'category',
        'website' => 'website',
        'description' => 'description',
        'imageUrl' => 'image_url',
    ];

    foreach ($fieldMap as $inputKey => $dbCol) {
        if (isset($input[$inputKey])) {
            $sets[] = "$dbCol = :$dbCol";
            $params[":$dbCol"] = $input[$inputKey];
        }
    }

    if (isset($input['ssPresent'])) {
        $sets[] = 'ss_present = :ss_present';
        $params[':ss_present'] = $input['ssPresent'] ? 1 : 0;
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE messe_events SET ' . implode(', ', $sets) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteEvent(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM messe_events WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

function formatEvent(array $event): array {
    return [
        'id' => (string)$event['id'],
        'name' => $event['name'],
        'location' => $event['location'] ?? '',
        'startDate' => $event['start_date'] ?? '',
        'endDate' => $event['end_date'] ?? '',
        'category' => $event['category'] ?? 'allgemein',
        'website' => $event['website'] ?? '',
        'description' => $event['description'] ?? '',
        'ssPresent' => (bool)$event['ss_present'],
        'imageUrl' => $event['image_url'] ?? '',
        'createdAt' => strtotime($event['created_at']) * 1000,
        'updatedAt' => strtotime($event['updated_at']) * 1000,
    ];
}
