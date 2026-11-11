<?php
/**
 * S&S Messebau - Auth API
 * Endpoints: login, logout, me, setup
 * Also provides requireAuth() + startSession() for other API files.
 */

require_once __DIR__ . '/db.php';

// Ersteinrichtung (Aktion setup): legt den ersten Admin an, wenn die Tabelle leer ist.
// Im ausgelieferten Stand gesperrt: Geht die Datenbankdatei verloren, legt db.php eine leere an,
// und ohne diese Sperre würde der erste Aufrufer aus dem Netz Admin. Für eine neue Installation
// wird der Schalter mit einem eigenen Commit geöffnet und nach der Einrichtung wieder geschlossen.
const SETUP_ERLAUBT = false;

// Zähldatei der Anmeldebremse: Über dieser Größe (Byte) wird sie auf die gültigen Stempel gekürzt.
// Steht hier oben, weil die Verteilung der Aktionen weiter unten läuft, bevor spätere Zeilen gelten.
const BREMSE_DATEI_MAX = 4096;

// Kosten jedes neuen Passwort-Hashs: Ersteinrichtung, Neuberechnung bei der Anmeldung und das Werkzeug der
// Kommandozeile (admin-passwort-setzen.php nennt dieselbe Zahl). Fest statt der PHP-Vorgabe, weil diese mit
// der PHP-Fassung steigt (ab 8.4: 12) und ein echter Hash dann langsamer rechnete als der Platzhalter.
const BCRYPT_KOSTEN = 10;

// Platzhalter für die Anmeldung mit unbekanntem Benutzernamen: ein bcrypt-Hash eines verworfenen
// Zufallswerts mit den Kosten BCRYPT_KOSTEN.
// Gegen ihn wird geprüft, wenn es den Namen nicht gibt, damit die Antwort so lange braucht wie bei
// einem bekannten Namen mit falschem Passwort. Zu ihm gehört kein Konto; kein Passwort meldet damit an.
const ANMELDUNG_PLATZHALTER_HASH = '$2y$10$Kbaf0jELaT3AQb1wOGKwbeASrtUx86cIwu6rsjLVkf23dM0wmapLW';

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
 * Bremse je Adresse. Die Zähldatei unter data/ trägt je Versuch einen Zeitstempel (zehn Ziffern,
 * eine Zeile). Gelesen, gezählt und geprüft wird unter exklusiver Sperre, damit gleichzeitige
 * Versuche nacheinander zählen.
 *
 * Reihenfolge: erst zählen, dann prüfen. Der Stempel des Versuchs steht in der Datei, bevor
 * $pruefung läuft; lässt er sich nicht schreiben, läuft $pruefung nicht. Ein Versuch, dessen Ausgang
 * niemand zählen kann, verrät so nicht, ob das Passwort stimmt. Gelingt die Prüfung, wird der
 * Zähler geleert.
 *
 * $zaehlbar false: Der Versuch wird weder gezählt noch geprüft (unvollständige Eingabe).
 * Rückgabe: [Stand, Sekunden bis zum nächsten Versuch]. Stand ist 'voll' (Grenze erreicht),
 * 'ungezaehlt', 'ok', 'falsch' oder 'defekt'. 'defekt' heißt: Die Datei war nicht zu öffnen, zu
 * sperren oder zu schreiben ($pruefung lief nicht), oder $pruefung hat eine Ausnahme geworfen (der
 * Versuch zählt dann nicht). In beiden Fällen weist der Aufrufer ab.
 */
function bremseVersuch(string $datei, int $max, int $fenster, bool $zaehlbar, callable $pruefung): array {
    $vorher = null; // Länge der Zähldatei vor dem Stempel dieses Versuchs, sobald er geschrieben ist
    $fp = @fopen($datei, 'c+');
    if ($fp === false) {
        return ['defekt', 0];
    }
    try {
        if (!flock($fp, LOCK_EX)) {
            return ['defekt', 0];
        }
        $jetzt = time();
        $inhalt = (string)stream_get_contents($fp);
        // Zehn Ziffern am Stück sind ein Stempel. So zählt auch eine Datei im früheren Format
        // (JSON-Liste) weiter, und ein abgerissener Rest zählt nicht.
        preg_match_all('/(?<!\d)\d{10}(?!\d)/', $inhalt, $treffer);
        // abs(): Ein Stempel aus der Zukunft (Uhr zurückgestellt) zählt mit, aber nur, solange er
        // weniger als ein Fenster entfernt ist. Weiter entfernte zählen nicht; sie verschwinden,
        // sobald die Datei von vorn beginnt oder gekürzt wird (bremseStempeln).
        $stempel = array_values(array_filter(array_map('intval', $treffer[0]), fn($ts) => abs($jetzt - $ts) < $fenster));
        if (count($stempel) >= $max) {
            return ['voll', $fenster - ($jetzt - min($stempel))];
        }
        if (!$zaehlbar) {
            return ['ungezaehlt', 0];
        }
        // Erst zählen, dann prüfen.
        $vorher = bremseStempeln($fp, $inhalt, $stempel, $jetzt);
        if ($vorher === null) {
            return ['defekt', 0];
        }
        if (!$pruefung()) {
            return ['falsch', 0];
        }
        // Gelungen: Zähler leeren. Misslingt das, bleibt er stehen; das macht die Bremse strenger, nie lockerer.
        @ftruncate($fp, 0);
        return ['ok', 0];
    } catch (\Throwable $e) {
        // Die Prüfung selbst ist ausgefallen (etwa Datenbank nicht lesbar). Der Versuch zählt dann
        // nicht: Der eben geschriebene Stempel wird zurückgenommen. Ins Protokoll geht nur die Art
        // des Fehlers, nie sein Text oder seine Spur.
        if ($vorher !== null) {
            @ftruncate($fp, $vorher);
        }
        error_log('Anmeldung nicht prüfbar: ' . get_class($e));
        return ['defekt', 0];
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

/**
 * Hängt den Stempel dieses Versuchs an die Zähldatei an. Rückgabe: die Länge der Datei vor dem
 * Stempel, oder null, wenn er nicht vollständig geschrieben ist. Gültige Stempel aus dem Bestand
 * bleiben in jedem Ausgang stehen: Geschrieben wird hinter sie, nie über sie.
 */
function bremseStempeln($fp, string $inhalt, array $gueltig, int $jetzt): ?int {
    $laenge = strlen($inhalt);
    $trenner = ($laenge > 0 && substr($inhalt, -1) !== "\n") ? "\n" : '';
    if ($gueltig === []) {
        // Nichts Gültiges im Bestand: von vorn beginnen. Kürzen braucht keinen Platz.
        if (!@ftruncate($fp, 0)) {
            return null;
        }
        $laenge = 0;
        $trenner = '';
    } elseif ($laenge > BREMSE_DATEI_MAX) {
        // Datei gewachsen (viele verfallene Stempel): die gültigen an den Anfang, den Rest abschneiden.
        // Das überschreibt nur Platz, den die Datei schon belegt.
        $kopf = implode("\n", $gueltig) . "\n";
        if (!rewind($fp) || @fwrite($fp, $kopf) !== strlen($kopf) || !@ftruncate($fp, strlen($kopf))) {
            return null;
        }
        $laenge = strlen($kopf);
        $trenner = '';
    }
    $zeile = $trenner . $jetzt . "\n";
    if (fseek($fp, $laenge) !== 0 || @fwrite($fp, $zeile) !== strlen($zeile) || !@fflush($fp) || !bremseGesichert($fp)) {
        @ftruncate($fp, $laenge); // einen abgerissenen Rest wieder abschneiden
        return null;
    }
    return $laenge;
}

/**
 * Lässt den Stempel bis auf den Datenträger schreiben und meldet, ob das gelang. Manche Dateisysteme
 * melden einen vollen Speicher erst hier und nicht schon beim Schreiben; ohne diese Probe gälte der
 * Versuch dann als gezählt, obwohl der Stempel verloren gehen kann. fsync() gibt es ab PHP 8.1;
 * fehlt die Funktion, bleibt es beim Ergebnis des Schreibens.
 */
function bremseGesichert($fp): bool {
    return !function_exists('fsync') || @fsync($fp);
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

    // Benutzername und Passwort gelten nur als Text. Alles andere (Liste, Objekt, Zahl, kein
    // JSON-Objekt als Rumpf) zählt wie eine fehlende Eingabe.
    $input = json_decode(file_get_contents('php://input'), true);
    $username = is_string($input['username'] ?? null) ? trim($input['username']) : '';
    $password = is_string($input['password'] ?? null) ? $input['password'] : '';

    // Unvollständige oder überlange Eingaben zählen nicht als Versuch und werden nicht geprüft.
    $eingabeFehler = null;
    if (empty($username) || empty($password)) {
        $eingabeFehler = 'Benutzername und Passwort erforderlich';
    } elseif (strlen($username) > 100 || strlen($password) > 256) {
        $eingabeFehler = 'Eingabe zu lang';
    }

    $user = null;
    [$stand, $warten] = bremseVersuch($rateLimitFile, $maxAttempts, $windowSeconds, $eingabeFehler === null,
        function () use ($username, $password, &$user): bool {
            $stmt = getDB()->prepare('SELECT * FROM admin_users WHERE username = :username LIMIT 1');
            $stmt->execute([':username' => $username]);
            $zeile = $stmt->fetch();
            // Auch bei unbekanntem Namen einmal bcrypt rechnen (gegen den Platzhalter).
            $stimmt = password_verify($password, $zeile ? (string)$zeile['password_hash'] : ANMELDUNG_PLATZHALTER_HASH);
            if (!$zeile || !$stimmt) {
                return false;
            }
            $user = $zeile;
            return true;
        });

    if ($stand === 'defekt') {
        // Lässt sich der Versuch nicht zählen, wird er nicht geprüft: Sonst liefe die Bremse leer.
        // Dieselbe Antwort, wenn die Prüfung selbst ausfällt (Datenbank nicht lesbar).
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

    // Hat der gespeicherte Hash andere Kosten (etwa aus einer anderen PHP-Fassung), wird er nach der richtigen
    // Anmeldung mit BCRYPT_KOSTEN neu berechnet; danach braucht ein bekannter Name so lange wie ein unbekannter.
    // Der neue Hash gibt eine neue Sitzungsmarke: Anmeldungen auf anderen Geräten enden dabei einmalig.
    // Scheitert das Schreiben, bleibt der alte Hash und die Anmeldung gilt trotzdem.
    if (password_needs_rehash((string)$user['password_hash'], PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN])) {
        try {
            $neuerHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN]);
            $neu = getDB()->prepare("UPDATE admin_users SET password_hash = :hash, updated_at = datetime('now') WHERE id = :id AND password_hash = :alt");
            $neu->execute([':hash' => $neuerHash, ':id' => $user['id'], ':alt' => $user['password_hash']]);
            if ($neu->rowCount() === 1) {
                $user['password_hash'] = $neuerHash;
            }
        } catch (\Throwable $e) {
            error_log('Anmeldung: Neuberechnung des Passwort-Hashs gescheitert (' . get_class($e) . ')');
        }
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
    if (!SETUP_ERLAUBT) {
        http_response_code(403);
        echo json_encode(['error' => 'Die Ersteinrichtung ist gesperrt.']);
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

    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN]);

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
    if (!SETUP_ERLAUBT) {
        // Gesperrt: Die Anmeldeseite zeigt dann nie das Formular der Ersteinrichtung,
        // und die Antwort verrät nicht, ob die Tabelle leer ist.
        echo json_encode(['needsSetup' => false]);
        return;
    }
    $db = getDB();
    $count = $db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    echo json_encode(['needsSetup' => (int)$count === 0]);
}
