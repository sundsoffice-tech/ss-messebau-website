<?php
/**
 * S&S Messebau - Orders API
 * CRUD endpoints for banner orders
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
        handleGetOrders();
        break;
    case 'POST':
        handleCreateOrder();
        break;
    case 'PATCH':
        handleUpdateOrder();
        break;
    case 'DELETE':
        handleDeleteOrder();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGetOrders(): void {
    // GET requires auth (admin only)
    if (!requireAuth()) return;

    $db = getDB();
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $db->prepare('SELECT * FROM orders WHERE id = :id OR config_id = :config_id');
        $stmt->execute([':id' => $id, ':config_id' => $id]);
        $order = $stmt->fetch();
        if ($order) {
            $order['order_data'] = json_decode($order['order_data'], true);
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
        }
    } else {
        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = 'SELECT * FROM orders';
        $params = [];
        $conditions = [];

        if ($status) {
            $conditions[] = 'status = :status';
            $params[':status'] = $status;
        }
        if ($search) {
            $escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);
            $conditions[] = "(customer_name LIKE :search OR customer_email LIKE :search OR company LIKE :search OR config_id LIKE :search) ESCAPE '\\'";
            $params[':search'] = '%' . $escapedSearch . '%';
        }

        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        foreach ($orders as &$order) {
            $order['order_data'] = json_decode($order['order_data'], true);
        }

        echo json_encode(['orders' => $orders, 'total' => count($orders)]);
    }
}

function checkOrderRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = __DIR__ . '/data/order_limit_' . md5($ip) . '.json';
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

function handleCreateOrder(): void {
    // POST does NOT require auth – customers submit orders
    if (!checkOrderRateLimit()) return;
    enforceRequestBodyLimit();
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['config_id']) || empty($input['order_data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'config_id and order_data are required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO orders (config_id, customer_email, customer_name, company, phone, status, order_data)
        VALUES (:config_id, :customer_email, :customer_name, :company, :phone, :status, :order_data)
    ');

    $orderData = $input['order_data'];
    $step6 = $orderData['step6'] ?? [];

    $stmt->execute([
        ':config_id' => substr($input['config_id'], 0, 100),
        ':customer_email' => substr($step6['email'] ?? $input['customer_email'] ?? '', 0, 255),
        ':customer_name' => substr($step6['ansprechpartner'] ?? $input['customer_name'] ?? '', 0, 255),
        ':company' => substr($step6['firmaKontakt'] ?? $input['company'] ?? '', 0, 255),
        ':phone' => substr($step6['telefon'] ?? $input['phone'] ?? '', 0, 50),
        ':status' => 'neu',
        ':order_data' => json_encode($orderData),
    ]);

    echo json_encode([
        'success' => true,
        'id' => $db->lastInsertId(),
        'config_id' => $input['config_id'],
    ]);
}

function handleUpdateOrder(): void {
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

    if (isset($input['status'])) {
        $sets[] = 'status = :status';
        $params[':status'] = $input['status'];
    }
    if (isset($input['customer_email'])) {
        $sets[] = 'customer_email = :customer_email';
        $params[':customer_email'] = $input['customer_email'];
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sets[] = "updated_at = datetime('now')";
    $sql = 'UPDATE orders SET ' . implode(', ', $sets) . ' WHERE id = :id OR config_id = :id';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function handleDeleteOrder(): void {
    if (!requireAuth()) return;

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('DELETE FROM orders WHERE id = :id OR config_id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}
