<?php
/**
 * Beleg für die Anmeldung am Admin-Bereich (public/api/auth.php): Sitzungsmarke in
 * requireAuth, me und analytics-config.php. Die Fälle stehen in den Dateien
 * anmeldung_faelle_<teil>.php daneben und werden hier eingebunden.
 *
 * Liegt unter ops/ und nicht unter public/, weil der Build alles aus public/
 * auf den Webserver kopiert; diese Datei soll dort nie liegen.
 *
 * Aufruf:  php ops/tests/anmeldung_test.php [--ohne-netz] [--teil=<name>] [<Pfad zu public/api>]
 * Exit:    0 = alle Prüfungen grün, 1 = mindestens eine rot, 2 = Umgebung ungeeignet
 *
 * Der Test kopiert den API-Ordner (ohne Inhalt von data/) je Fall in ein frisches
 * Verzeichnis, startet darauf den eingebauten Server (php -S) und fragt ihn über
 * curl ab. Er läuft nicht als root, weil root in ein gesperrtes Verzeichnis trotzdem
 * schreibt: docker run --user 65534:65534.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$ohneNetzPflicht = false;
$teile = [];
$apiQuelle = __DIR__ . '/../../public/api';
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--ohne-netz') {
        $ohneNetzPflicht = true;
    } elseif (strncmp($arg, '--teil=', 7) === 0) {
        $teile[] = substr($arg, 7);
    } else {
        $apiQuelle = $arg;
    }
}
$apiQuelle = realpath($apiQuelle);
if ($apiQuelle === false || !is_file($apiQuelle . '/auth.php')) {
    fwrite(STDERR, "auth.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}
if (!extension_loaded('curl') || !extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "Der Test braucht die PHP-Erweiterungen curl und pdo_sqlite\n");
    exit(2);
}
if (PHP_OS_FAMILY !== 'Linux') {
    fwrite(STDERR, "Der Test braucht Linux (mehrere Arbeiter von php -S, weitere Loopback-Adressen)\n");
    exit(2);
}
if (function_exists('posix_geteuid') && posix_geteuid() === 0) {
    fwrite(STDERR, "Der Test läuft als root; er braucht einen Nutzer ohne Sonderrechte (docker run --user 65534:65534)\n");
    exit(2);
}
if ($ohneNetzPflicht) {
    $schnittstellen = array_diff(array_keys(net_get_interfaces() ?: []), ['lo']);
    if ($schnittstellen !== []) {
        fwrite(STDERR, "--ohne-netz verlangt eine Maschine ohne Netz, gefunden: " . implode(',', $schnittstellen) . "\n");
        exit(2);
    }
}

const ALT = 'altes-passwort-0815';
const NEU = 'Neues-Passwort-fuer-den-Test-42';

$gruen = 0;
$rot = 0;
$umgebungen = [];

function pruefe(string $name, bool $ok, string $detail = ''): void {
    global $gruen, $rot;
    if ($ok) {
        $gruen++;
        echo "GRUEN  $name\n";
    } else {
        $rot++;
        echo "ROT    $name" . ($detail !== '' ? "  [$detail]" : '') . "\n";
    }
}

function kurz(array $a): string {
    return $a['status'] . ' ' . substr(str_replace("\n", ' ', $a['text']), 0, 160);
}

function kopiereApi(string $von, string $nach): void {
    mkdir($nach, 0755, true);
    foreach (scandir($von) as $eintrag) {
        if ($eintrag === '.' || $eintrag === '..') {
            continue;
        }
        $quelle = $von . '/' . $eintrag;
        if (is_dir($quelle)) {
            if ($eintrag === 'data') {
                mkdir($nach . '/data', 0755); // leer: keine echte Datenbank wird mitkopiert
            }
            continue;
        }
        copy($quelle, $nach . '/' . $eintrag);
    }
}

function freierPort(): int {
    $s = stream_socket_server('tcp://127.0.0.1:0', $nr, $text);
    if (!$s) {
        return 0;
    }
    $name = stream_socket_get_name($s, false);
    fclose($s);
    return (int)substr($name, strrpos($name, ':') + 1);
}

/**
 * Frische Kopie des API-Ordners samt eigenem Server und eigener Datenbank mit den genannten Admins.
 * $ersetzen: [Datei => [alt => neu]], wird in der Kopie angewandt, wenn "alt" dort steht
 * (für Schalter, die es nicht in jedem geprüften Stand gibt).
 */
function starte(string $apiQuelle, array $admins = ['chef'], int $arbeiter = 1, array $ersetzen = [], ?string $datenOrdner = null): array {
    global $umgebungen;
    $wurzel = sys_get_temp_dir() . '/anmeldung-' . bin2hex(random_bytes(6));
    kopiereApi($apiQuelle, $wurzel . '/api');
    $dbPfad = $wurzel . '/api/data/database.sqlite';
    if ($datenOrdner !== null) {
        // data/ liegt auf einem anderen Dateisystem (Verweis), die Datenbank daneben in der Instanz:
        // So lässt sich data/ füllen, ohne dass die Datenbank mit voll läuft.
        rmdir($wurzel . '/api/data');
        symlink($datenOrdner, $wurzel . '/api/data');
        mkdir($wurzel . '/datenbank', 0755);
        $dbPfad = $wurzel . '/datenbank/database.sqlite';
        $ersetzen['config.php'] = ($ersetzen['config.php'] ?? []) + ["__DIR__ . '/data/database.sqlite'" => var_export($dbPfad, true)];
    }
    foreach ($ersetzen as $datei => $paare) {
        $text = (string)file_get_contents($wurzel . '/api/' . $datei);
        file_put_contents($wurzel . '/api/' . $datei, strtr($text, $paare));
    }
    mkdir($wurzel . '/sitzungen', 0700);
    $port = freierPort();
    $umgebung = ['PATH' => getenv('PATH') ?: '/usr/local/bin:/usr/bin:/bin'];
    if ($arbeiter > 1) {
        $umgebung['PHP_CLI_SERVER_WORKERS'] = (string)$arbeiter;
    }
    $befehl = [
        PHP_BINARY,
        '-d', 'display_errors=1',
        '-d', 'error_reporting=-1',
        '-d', 'log_errors=1',
        '-d', 'error_log=' . $wurzel . '/php-fehler.log',
        '-d', 'disable_functions=curl_init,curl_exec,curl_multi_exec,mail',
        '-d', 'session.save_path=' . $wurzel . '/sitzungen',
        '-S', '127.0.0.1:' . $port,
        '-t', $wurzel . '/api',
    ];
    $rohre = [];
    $prozess = proc_open($befehl, [
        0 => ['file', '/dev/null', 'r'],
        1 => ['file', $wurzel . '/server.log', 'a'],
        2 => ['file', $wurzel . '/server.log', 'a'],
    ], $rohre, $wurzel, $umgebung);
    $u = ['basis' => 'http://127.0.0.1:' . $port, 'wurzel' => $wurzel, 'api' => $wurzel . '/api',
          'daten' => $wurzel . '/api/data', 'db' => $dbPfad, 'sitzungen' => $wurzel . '/sitzungen', 'prozess' => $prozess];
    $bereit = false;
    for ($i = 0; $i < 100 && !$bereit; $i++) {
        $probe = @stream_socket_client('tcp://127.0.0.1:' . $port, $nr, $text, 0.2);
        if ($probe) {
            fclose($probe);
            $bereit = true;
        } else {
            usleep(50000);
        }
    }
    if (!$bereit) {
        fwrite(STDERR, "Server startet nicht\n");
        exit(2);
    }
    $umgebungen[] = $u;
    // Schema mit dem Code des Prüflings anlegen, dann die Admins direkt eintragen (unabhängig von der Aktion setup).
    exec(escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg('require $argv[1]; getDB();') . ' ' . escapeshellarg($wurzel . '/api/db.php') . ' 2>&1', $zeilen, $rc);
    $erst = anfrage($u, 'GET', '/auth.php?action=check_setup');
    if ($rc !== 0 || $erst['status'] !== 200) {
        fwrite(STDERR, "Datenbank nicht anzulegen oder check_setup ohne 200: " . implode(' ', $zeilen) . ' ' . kurz($erst) . "\n");
        exit(2);
    }
    $db = db($u);
    foreach ($admins as $name) {
        $stmt = $db->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)');
        $stmt->execute([$name, password_hash(ALT, PASSWORD_BCRYPT, ['cost' => 4]), ucfirst($name)]);
    }
    return $u;
}

function stoppe(array $u): void {
    proc_terminate($u['prozess']);
    proc_close($u['prozess']);
}

function db(array $u): PDO {
    $db = new PDO('sqlite:' . $u['db'], null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $db->exec('PRAGMA busy_timeout=5000');
    return $db;
}

function hashVon(array $u, string $name): string {
    $stmt = db($u)->prepare('SELECT password_hash FROM admin_users WHERE username = ?');
    $stmt->execute([$name]);
    return (string)$stmt->fetchColumn();
}

/** Tauscht nur den gespeicherten Hash, so wie es jedes Werkzeug zum Neusetzen des Passworts tut. */
function tauscheHash(array $u, string $name, string $passwort): void {
    $stmt = db($u)->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?');
    $stmt->execute([password_hash($passwort, PASSWORD_BCRYPT, ['cost' => 4]), $name]);
}

function curlGriff(string $url, string $methode, ?string $koerper, array $kopf, int $zeitgrenze, ?string $von): CurlHandle {
    $ch = curl_init($url);
    if ($koerper !== null) {
        $kopf[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $koerper);
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $methode,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_HTTPHEADER => $kopf,
        CURLOPT_TIMEOUT => $zeitgrenze,
    ]);
    if ($von !== null) {
        curl_setopt($ch, CURLOPT_INTERFACE, $von);
    }
    return $ch;
}

function lies(CurlHandle $ch, $roh): array {
    $roh = is_string($roh) ? $roh : '';
    $kopfLaenge = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $text = substr($roh, $kopfLaenge);
    $cookie = null;
    if (preg_match('/^Set-Cookie:\s*([^;\r\n]+)/mi', substr($roh, 0, $kopfLaenge), $m)) {
        $cookie = $m[1];
    }
    $json = json_decode($text, true);
    return ['status' => (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE), 'text' => $text,
            'json' => is_array($json) ? $json : [], 'cookie' => $cookie];
}

function anfrage(array $u, string $methode, string $pfad, ?string $koerper = null, array $kopf = [], int $zeitgrenze = 20, ?string $von = null): array {
    $ch = curlGriff($u['basis'] . $pfad, $methode, $koerper, $kopf, $zeitgrenze, $von);
    return lies($ch, curl_exec($ch));
}

/** Anmeldung. Ohne $von kommt jede von einer eigenen Adresse, damit die Anmeldebremse (je Adresse) die Fälle nicht stört. */
function anmelden(array $u, string $name, string $passwort, ?string $von = null, int $zeitgrenze = 20): array {
    static $nr = 10;
    if ($von === null) {
        $nr++;
        $von = '127.0.' . (intdiv($nr, 200) + 1) . '.' . ($nr % 200 + 2);
    }
    return anfrage($u, 'POST', '/auth.php?action=login', json_encode(['username' => $name, 'password' => $passwort]), [], $zeitgrenze, $von);
}

/** Neue Sitzung eines Admins als Kopfzeile für weitere Anfragen. */
function sitzung(array $u, string $name = 'chef', string $passwort = ALT): array {
    $a = anmelden($u, $name, $passwort);
    if ($a['status'] !== 200 || $a['cookie'] === null) {
        pruefe("Vorbereitung: Anmeldung als $name", false, kurz($a));
        return ['Cookie: PHPSESSID=keine'];
    }
    return ['Cookie: ' . $a['cookie']];
}

/**
 * Mehrere Anfragen gleichzeitig: Liste aus [Pfad, Felder]. Mit $sperrdatei hält der Test diese Datei
 * 1,5 s lang gesperrt; Anfragen, die sie unter Sperre lesen, stehen dann alle an derselben Stelle
 * und laufen gemeinsam weiter. So überlappen sie sicher, auch unter Last.
 */
function gleichzeitig(array $u, array $liste, ?string $sperrdatei = null, ?string $von = null): array {
    $sperre = null;
    if ($sperrdatei !== null) {
        $sperre = fopen($sperrdatei, 'c+');
        flock($sperre, LOCK_EX);
    }
    $start = microtime(true);
    $mh = curl_multi_init();
    $griffe = [];
    foreach ($liste as $i => [$pfad, $felder]) {
        $griffe[$i] = curlGriff($u['basis'] . $pfad, 'POST', json_encode($felder), [], 60, $von);
        curl_multi_add_handle($mh, $griffe[$i]);
    }
    do {
        $stand = curl_multi_exec($mh, $laeuft);
        if ($sperre !== null && microtime(true) - $start > 1.5) {
            flock($sperre, LOCK_UN);
            fclose($sperre);
            $sperre = null;
        }
        if ($laeuft) {
            curl_multi_select($mh, 0.2);
        }
    } while ($laeuft && $stand === CURLM_OK);
    $ergebnis = [];
    foreach ($griffe as $i => $ch) {
        $ergebnis[$i] = lies($ch, curl_multi_getcontent($ch));
        curl_multi_remove_handle($mh, $ch);
    }
    curl_multi_close($mh);
    return $ergebnis;
}

$dateien = glob(__DIR__ . '/anmeldung_faelle_*.php') ?: [];
sort($dateien);
$gelaufeneTeile = [];
foreach ($dateien as $datei) {
    $teil = substr(basename($datei, '.php'), strlen('anmeldung_faelle_'));
    if ($teile !== [] && !in_array($teil, $teile, true)) {
        continue;
    }
    echo "\n#### Teil: $teil ####\n";
    // Eigener Geltungsbereich je Teil: Eine Variable dort kann keine dieses Läufers überschreiben
    // (etwa die Liste der gewählten Teile) und damit still weitere Teile auslassen.
    (static function (string $datei, string $apiQuelle): void {
        require $datei;
    })($datei, $apiQuelle);
    $gelaufeneTeile[] = $teil;
}

foreach ($umgebungen as $u) {
    stoppe($u);
    exec('rm -rf ' . escapeshellarg($u['wurzel']));
}
$erwartet = $teile !== [] ? $teile : array_map(fn($d) => substr(basename($d, '.php'), strlen('anmeldung_faelle_')), $dateien);
$fehlend = array_diff($erwartet, $gelaufeneTeile);
if ($gelaufeneTeile === [] || $fehlend !== []) {
    fwrite(STDERR, "Nicht gelaufen: " . ($fehlend !== [] ? implode(' ', $fehlend) : 'kein Teil') . "\n");
    exit(2);
}
echo "\nTEILE: " . implode(' ', $gelaufeneTeile) . "\n";
echo "ERGEBNIS: $gruen grün, $rot rot\n";
exit($rot === 0 ? 0 : 1);
