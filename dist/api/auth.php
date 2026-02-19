<?php
/**
 * S&S Messebau - Auth API
 * Endpoints: login, logout, me, setup
 * Also provides requireAuth() + startSession() for other API files.
 */

require_once __DIR__ . '/db.php';

function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        $isSecure = isset($_SERVER['HTTPS']) || 
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'secure' => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function requireAuth(): bool {
    startSession();
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Nicht autorisiert']);
        return false;
    }
    return true;
}

// Only run routing when this file is called directly (not included)
if (basename($_SERVER['SCRIPT_FILENAME']) === 'auth.php') {
    header('Content-Type: application/json; charset=utf-8');
    setCorsHeaders();
    startSession();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'logout':
            handleLogout();
            break;
        case 'me':
            handleMe();
            break;
        case 'setup':
            handleSetup();
            break;
        case 'check_setup':
            handleCheckSetup();
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Unknown action']);
    }
}

function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Benutzername und Passwort erforderlich']);
        return;
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM admin_users WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Ungültige Anmeldedaten']);
        return;
    }

    // Regenerate session ID for security
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['display_name'] = $user['display_name'];

    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $user['username'],
            'displayName' => $user['display_name'],
        ],
    ]);
}

function handleLogout(): void {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
}

function handleMe(): void {
    if (!empty($_SESSION['user_id'])) {
        echo json_encode([
            'authenticated' => true,
            'user' => [
                'username' => $_SESSION['username'],
                'displayName' => $_SESSION['display_name'],
            ],
        ]);
    } else {
        echo json_encode([
            'authenticated' => false,
            'user' => null,
        ]);
    }
}

function handleSetup(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $db = getDB();

    // Check if any admin exists
    $count = $db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    if ($count > 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin already exists. Setup disabled.']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $displayName = trim($input['displayName'] ?? $username);

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Benutzername und Passwort erforderlich']);
        return;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Passwort muss mindestens 8 Zeichen lang sein']);
        return;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $db->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (:username, :hash, :displayName)');
    $stmt->execute([
        ':username' => $username,
        ':hash' => $hash,
        ':displayName' => $displayName,
    ]);

    // Auto-login after setup
    session_regenerate_id(true);
    $_SESSION['user_id'] = $db->lastInsertId();
    $_SESSION['username'] = $username;
    $_SESSION['display_name'] = $displayName;

    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $username,
            'displayName' => $displayName,
        ],
    ]);
}

function handleCheckSetup(): void {
    $db = getDB();
    $count = $db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    echo json_encode(['needsSetup' => (int)$count === 0]);
}
