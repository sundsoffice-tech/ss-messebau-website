<?php
/**
 * TEMPORAERES Einmal-Reset-Endpoint (wird nach Gebrauch entfernt).
 * Aufruf: pwreset-tmp.php?token=<TOKEN>&pw=<neues passwort>
 * Setzt das Passwort des aeltesten Admin-Users, gibt den Benutzernamen
 * zurueck und loescht sich danach selbst.
 */
header('Content-Type: application/json; charset=utf-8');

const RESET_TOKEN = 'k9Qz7-Rb3mP-2xVw8-Tn6Lh';

if (($_GET['token'] ?? '') !== RESET_TOKEN) {
    http_response_code(403);
    echo json_encode(['error' => 'forbidden']);
    exit;
}

$pw = $_GET['pw'] ?? '';
if (strlen($pw) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'pw too short (min 8)']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();
    $user = $db->query('SELECT id, username, display_name FROM admin_users ORDER BY id ASC LIMIT 1')->fetch();

    if (!$user) {
        echo json_encode(['ok' => false, 'reason' => 'no_admin_user']);
        @unlink(__FILE__);
        exit;
    }

    $hash = password_hash($pw, PASSWORD_BCRYPT);
    $stmt = $db->prepare("UPDATE admin_users SET password_hash = :h, updated_at = datetime('now') WHERE id = :id");
    $stmt->execute([':h' => $hash, ':id' => $user['id']]);

    $deleted = @unlink(__FILE__);

    echo json_encode([
        'ok' => true,
        'username' => $user['username'],
        'display_name' => $user['display_name'],
        'self_deleted' => $deleted,
    ]);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
