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

/**
 * Marke, die eine Sitzung an den Stand des Passworts bindet: Ändert sich der Hash in admin_users,
 * passt die Marke nicht mehr und die Sitzung gilt als abgemeldet.
 */
function sitzungsMarke(#[\SensitiveParameter] string $passwortHash): string {
    return substr(hash('sha256', $passwortHash), 0, 16);
}

/**
 * Admin-Zeile zur laufenden Sitzung oder null. Verlangt eine gestartete Sitzung.
 * Gilt nur, wenn es die Zeile noch gibt und die Marke der Sitzung zum heutigen Passwort-Hash passt.
 * Wirft, wenn die Datenbank nicht lesbar ist; der Aufrufer weist dann ab.
 */
function angemeldeterAdmin(): ?array {
    if (empty($_SESSION['user_id']) || !is_string($_SESSION['pw_marke'] ?? null)) {
        return null;
    }
    $stmt = getDB()->prepare('SELECT id, username, display_name, password_hash FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $zeile = $stmt->fetch();
    if (!$zeile || !hash_equals(sitzungsMarke((string)$zeile['password_hash']), $_SESSION['pw_marke'])) {
        unset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['display_name'], $_SESSION['pw_marke']);
        return null;
    }
    return ['id' => $zeile['id'], 'username' => $zeile['username'], 'display_name' => $zeile['display_name']];
}

function requireAuth(): bool {
    startSession();
    try {
        $admin = angemeldeterAdmin();
    } catch (\Throwable $e) {
        http_response_code(503);
        echo json_encode(['error' => 'Anmeldung derzeit nicht prüfbar']);
        return false;
    }
    if ($admin === null) {
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

/**
 * Bremse je Adresse: Zeitstempel der Fehlversuche in einer Datei unter data/, gelesen, geprüft und
 * geschrieben unter exklusiver Sperre, damit gleichzeitige Versuche nacheinander zählen.
 * $pruefung läuft unter der Sperre und liefert true (gelungen: Zähler leeren), false (Fehlversuch:
 * zählen) oder null (nicht zählen).
 * Rückgabe: [Stand, Sekunden bis zum nächsten Versuch]. Stand ist 'voll' (Grenze erreicht, $pruefung
 * lief nicht), 'ok', 'falsch', 'ungezaehlt' oder 'defekt' (Datei nicht zu öffnen, zu sperren oder
 * zu schreiben; der Aufrufer weist dann ab).
 */
function bremseVersuch(string $datei, int $max, int $fenster, callable $pruefung): array {
    $fp = @fopen($datei, 'c+');
    if ($fp === false) {
        return ['defekt', 0];
    }
    try {
        if (!flock($fp, LOCK_EX)) {
            return ['defekt', 0];
        }
        $jetzt = time();
        $stempel = json_decode((string)stream_get_contents($fp), true);
        $stempel = is_array($stempel) ? $stempel : [];
        $stempel = array_values(array_filter($stempel, fn($ts) => is_int($ts) && ($jetzt - $ts) < $fenster));
        if (count($stempel) >= $max) {
            return ['voll', $fenster - ($jetzt - min($stempel))];
        }
        $gelungen = $pruefung();
        if ($gelungen === null) {
            return ['ungezaehlt', 0];
        }
        if ($gelungen && $stempel === []) {
            return ['ok', 0];
        }
        $stempel = $gelungen ? [] : array_merge($stempel, [$jetzt]);
        $neu = json_encode($stempel);
        if (!ftruncate($fp, 0) || !rewind($fp) || fwrite($fp, $neu) !== strlen($neu) || !fflush($fp)) {
            return ['defekt', 0];
        }
        return [$gelungen ? 'ok' : 'falsch', 0];
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    // Bremse: höchstens 5 Fehlversuche je 15 Minuten und Adresse (bremseVersuch, unter Dateisperre).
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = __DIR__ . '/data/login_limit_' . md5($ip) . '.json';
    $maxAttempts = 5;
    $windowSeconds = 900; // 15 minutes

    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    $user = null;
    $eingabeFehler = null;
    [$stand, $warten] = bremseVersuch($rateLimitFile, $maxAttempts, $windowSeconds,
        function () use ($username, $password, &$user, &$eingabeFehler): ?bool {
            // Unvollständige oder überlange Eingaben zählen nicht als Fehlversuch.
            if (empty($username) || empty($password)) {
                $eingabeFehler = 'Benutzername und Passwort erforderlich';
                return null;
            }
            if (strlen($username) > 100 || strlen($password) > 256) {
                $eingabeFehler = 'Eingabe zu lang';
                return null;
            }
            $stmt = getDB()->prepare('SELECT * FROM admin_users WHERE username = :username LIMIT 1');
            $stmt->execute([':username' => $username]);
            $zeile = $stmt->fetch();
            if (!$zeile || !password_verify($password, $zeile['password_hash'])) {
                return false;
            }
            $user = $zeile;
            return true;
        });

    if ($stand === 'defekt') {
        // Lässt sich der Zähler nicht führen, gibt es keinen Versuch: Sonst liefe die Bremse leer.
        http_response_code(503);
        echo json_encode(['error' => 'Anmeldung derzeit nicht möglich']);
        return;
    }
    if ($stand === 'voll') {
        http_response_code(429);
        echo json_encode(['error' => 'Zu viele Anmeldeversuche. Bitte warten Sie ' . ceil($warten / 60) . ' Minuten.']);
        return;
    }
    if ($stand === 'ungezaehlt') {
        http_response_code(400);
        echo json_encode(['error' => $eingabeFehler]);
        return;
    }
    if ($stand !== 'ok' || $user === null) {
        // Der Fehlversuch ist gezählt. Zufällige Pause gegen Zeitmessung.
        usleep(random_int(100000, 300000));
        http_response_code(401);
        echo json_encode(['error' => 'Ungültige Anmeldedaten']);
        return;
    }

    // Regenerate session ID for security
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['display_name'] = $user['display_name'];
    $_SESSION['pw_marke'] = sitzungsMarke((string)$user['password_hash']);

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
    try {
        $konto = angemeldeterAdmin();
    } catch (\Throwable $e) {
        http_response_code(503);
        echo json_encode(['error' => 'Anmeldung derzeit nicht prüfbar']);
        return;
    }
    if ($konto !== null) {
        echo json_encode([
            'authenticated' => true,
            'user' => [
                'username' => $konto['username'],
                'displayName' => $konto['display_name'],
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
    $_SESSION['pw_marke'] = sitzungsMarke($hash);

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
