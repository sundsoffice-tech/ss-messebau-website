<?php
/**
 * Beleg für die Bremsen von public/api/chat.php und für public/api/health.php.
 *
 * Liegt unter ops/ und nicht unter public/, weil der Build alles aus public/
 * auf den Webserver kopiert; diese Datei soll dort nie liegen.
 *
 * Aufruf:  php ops/tests/chat_bremse_test.php [--ohne-netz] [<Pfad zu public/api>]
 * Exit:    0 = alle Prüfungen grün, 1 = mindestens eine rot, 2 = Umgebung ungeeignet
 *
 * Der Test kopiert den API-Ordner (ohne Inhalt von data/) in ein frisches
 * Verzeichnis, startet darauf je Fall den eingebauten Server (php -S) und fragt
 * ihn über curl ab. OpenAI wird nie angerufen:
 *   - der Server läuft ohne OPENAI_API_KEY und mit leerer Datenbank,
 *   - curl_init/curl_exec sind im Server abgeschaltet; erreichte chat.php den
 *     Aufruf doch, käme eine andere Fehlermeldung als die erwartete,
 *   - mit --ohne-netz verlangt der Test zusätzlich, dass die Maschine außer
 *     Loopback keine Netzschnittstelle hat (docker run --network none).
 * "Durchgelassen" heißt deshalb: Status 500 mit genau der Meldung
 * "No active OpenAI API key configured", also an allen Bremsen vorbei und
 * kontrolliert vor dem Aufruf beendet.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

const MELDUNG_OHNE_SCHLUESSEL = 'No active OpenAI API key configured';
const MELDUNG_ZU_VIELE = 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
const GUELTIG = '{"message":"Was kostet ein Messestand mit 20 qm?"}';

$ohneNetzPflicht = false;
$apiQuelle = __DIR__ . '/../../public/api';
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--ohne-netz') {
        $ohneNetzPflicht = true;
    } else {
        $apiQuelle = $arg;
    }
}
$apiQuelle = realpath($apiQuelle);
if ($apiQuelle === false || !is_file($apiQuelle . '/chat.php')) {
    fwrite(STDERR, "chat.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}
if (!extension_loaded('curl') || !extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "Der Test braucht die PHP-Erweiterungen curl und pdo_sqlite\n");
    exit(2);
}
if (getenv('OPENAI_API_KEY') !== false && getenv('OPENAI_API_KEY') !== '') {
    fwrite(STDERR, "OPENAI_API_KEY ist gesetzt; der Test läuft nur ohne Schlüssel\n");
    exit(2);
}

$gruen = 0;
$rot = 0;
$uebersprungen = 0;
$antworten = []; // jede Antwort, für die Schlussprüfung auf Fehlertext

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

function kopiereApi(string $von, string $nach): void {
    mkdir($nach, 0755, true);
    foreach (scandir($von) as $eintrag) {
        if ($eintrag === '.' || $eintrag === '..') {
            continue;
        }
        $quelle = $von . '/' . $eintrag;
        if (is_dir($quelle)) {
            if ($eintrag === 'data') {
                // data/ leer anlegen: eine echte Datenbank eines Entwicklers
                // (mit Schlüsseln) wird nie mitkopiert.
                mkdir($nach . '/data', 0755);
            }
            continue;
        }
        copy($quelle, $nach . '/' . $eintrag);
    }
}

function freierPort(string $adresse): int {
    $s = stream_socket_server('tcp://' . $adresse . ':0', $nr, $text);
    if (!$s) {
        return 0;
    }
    $name = stream_socket_get_name($s, false);
    fclose($s);
    return (int)substr($name, strrpos($name, ':') + 1);
}

/** Frische Kopie des API-Ordners samt eigenem Server. */
function starte(string $apiQuelle, int $arbeiter = 1, string $adresse = '127.0.0.1'): ?array {
    $wurzel = sys_get_temp_dir() . '/chat-bremse-' . bin2hex(random_bytes(6));
    kopiereApi($apiQuelle, $wurzel . '/api');
    mkdir($wurzel . '/sitzungen', 0700);
    $port = freierPort($adresse);
    if ($port === 0) {
        return null;
    }
    $umgebung = ['PATH' => getenv('PATH') ?: '/usr/local/bin:/usr/bin:/bin'];
    if (getenv('SystemRoot')) {
        $umgebung['SystemRoot'] = getenv('SystemRoot');
    }
    if ($arbeiter > 1) {
        $umgebung['PHP_CLI_SERVER_WORKERS'] = (string)$arbeiter;
    }
    $befehl = [
        PHP_BINARY,
        '-d', 'display_errors=1',
        '-d', 'error_reporting=-1',
        '-d', 'disable_functions=curl_init,curl_exec,curl_multi_exec',
        '-d', 'session.save_path=' . $wurzel . '/sitzungen',
        '-S', $adresse . ':' . $port,
        '-t', $wurzel . '/api',
    ];
    $rohre = [];
    $prozess = proc_open($befehl, [
        0 => ['file', PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null', 'r'],
        1 => ['file', $wurzel . '/server.log', 'a'],
        2 => ['file', $wurzel . '/server.log', 'a'],
    ], $rohre, $wurzel, $umgebung);
    if (!is_resource($prozess)) {
        return null;
    }
    $basis = 'http://' . $adresse . ':' . $port;
    $verbinden = (strpos($adresse, '[') === 0 ? $adresse : $adresse) . ':' . $port;
    for ($i = 0; $i < 100; $i++) {
        $probe = @stream_socket_client('tcp://' . $verbinden, $nr, $text, 0.2);
        if ($probe) {
            fclose($probe);
            return ['basis' => $basis, 'wurzel' => $wurzel, 'daten' => $wurzel . '/api/data',
                    'log' => $wurzel . '/server.log', 'prozess' => $prozess];
        }
        usleep(50000);
    }
    proc_terminate($prozess);
    proc_close($prozess);
    return null;
}

function stoppe(array $u): void {
    proc_terminate($u['prozess']);
    proc_close($u['prozess']);
}

function curlGriff(string $url, string $methode, ?string $koerper, array $kopf, int $zeitgrenze = 20): CurlHandle {
    $ch = curl_init($url);
    $zeilen = $kopf;
    if ($koerper !== null) {
        $zeilen[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $koerper);
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $methode,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_HTTPHEADER => $zeilen,
        CURLOPT_TIMEOUT => $zeitgrenze,
    ]);
    return $ch;
}

function lies(CurlHandle $ch, $roh, string $url): array {
    global $antworten;
    $roh = is_string($roh) ? $roh : '';
    $kopfLaenge = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $text = substr($roh, $kopfLaenge);
    $json = json_decode($text, true);
    $cookie = null;
    if (preg_match('/^Set-Cookie:\s*([^;\r\n]+)/mi', substr($roh, 0, $kopfLaenge), $m)) {
        $cookie = $m[1];
    }
    $antwort = [
        'status' => (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE),
        'text' => $text,
        'kopf' => substr($roh, 0, $kopfLaenge),
        'fehler' => is_array($json) ? ($json['error'] ?? null) : null,
        'json' => $json,
        'cookie' => $cookie,
        'url' => $url,
    ];
    $antworten[] = $antwort;
    return $antwort;
}

/** Eine Anfrage, ohne Cookie-Speicher: Jede Anfrage kommt wie von einem neuen Besucher. */
function anfrage(array $u, string $methode, string $pfad, ?string $koerper = null, array $kopf = [], int $zeitgrenze = 20): array {
    $url = $u['basis'] . $pfad;
    $ch = curlGriff($url, $methode, $koerper, $kopf, $zeitgrenze);
    return lies($ch, curl_exec($ch), $url);
}

/**
 * Hält die Zähldatei aus einem zweiten Prozess (diesem Test) exklusiv gesperrt
 * und prüft, dass eine Anfrage so lange wartet und danach normal zählt.
 * Ohne flock() im Prüfling käme die Antwort sofort.
 */
function pruefeSperre(array $u, string $datei, string $name): void {
    $fp = fopen($datei, 'c+');
    flock($fp, LOCK_EX);
    $wartend = anfrage($u, 'POST', '/chat.php', GUELTIG, [], 2);
    flock($fp, LOCK_UN);
    fclose($fp);
    pruefe("$name von außen gesperrt: die Anfrage wartet (keine Antwort in 2 s) statt ungezählt durchzulaufen",
        $wartend['status'] === 0, kurz($wartend));
    $danach = anfrage($u, 'POST', '/chat.php', GUELTIG);
    pruefe("$name wieder frei: die nächste Anfrage geht durch", durchgelassen($danach), kurz($danach));
}

/** $anzahl gleiche POST-Anfragen gleichzeitig. */
function gleichzeitig(array $u, string $pfad, string $koerper, int $anzahl): array {
    $url = $u['basis'] . $pfad;
    $mh = curl_multi_init();
    $griffe = [];
    for ($i = 0; $i < $anzahl; $i++) {
        $griffe[$i] = curlGriff($url, 'POST', $koerper, []);
        curl_multi_add_handle($mh, $griffe[$i]);
    }
    do {
        $status = curl_multi_exec($mh, $laeuft);
        if ($laeuft) {
            curl_multi_select($mh, 1.0);
        }
    } while ($laeuft && $status === CURLM_OK);
    $ergebnis = [];
    foreach ($griffe as $ch) {
        $ergebnis[] = lies($ch, curl_multi_getcontent($ch), $url);
        curl_multi_remove_handle($mh, $ch);
    }
    curl_multi_close($mh);
    return $ergebnis;
}

function durchgelassen(array $a): bool {
    return $a['status'] === 500 && $a['fehler'] === MELDUNG_OHNE_SCHLUESSEL;
}

function gebremst(array $a): bool {
    return $a['status'] === 429 && $a['fehler'] === MELDUNG_ZU_VIELE;
}

function kurz(array $a): string {
    return $a['status'] . ' ' . substr(str_replace(["\r", "\n"], ' ', $a['text']), 0, 90);
}

function ipDateien(array $u): array {
    return glob($u['daten'] . '/rate_limit_chat_*.json') ?: [];
}

function tagesstand(array $u): ?array {
    $datei = $u['daten'] . '/chat_tagesdeckel.json';
    if (!is_file($datei)) {
        return null;
    }
    $stand = json_decode((string)file_get_contents($datei), true);
    return is_array($stand) ? $stand : null;
}

function konstante(string $quelltext, string $name, int $ersatz): int {
    if (preg_match("/define\\('" . preg_quote($name, '/') . "',\\s*(\\d+)\\)/", $quelltext, $m)) {
        return (int)$m[1];
    }
    pruefe("Konstante $name steht in chat.php", false, "nicht gefunden, rechne mit $ersatz weiter");
    return $ersatz;
}

// ─── Vorbedingungen ─────────────────────────────────────────────────────────
echo "Prüfling: $apiQuelle\n";
echo 'PHP ' . PHP_VERSION . ', ' . date('Y-m-d H:i:s T') . "\n";

$fremdeSchnittstellen = [];
if (function_exists('net_get_interfaces')) {
    foreach ((array)net_get_interfaces() as $name => $s) {
        $istLoopback = $name === 'lo' || stripos($name, 'loopback') !== false;
        if (!$istLoopback && !empty($s['up'])) {
            $fremdeSchnittstellen[] = $name;
        }
    }
    if ($ohneNetzPflicht) {
        pruefe('Netz nach außen ist zu: außer Loopback keine aktive Schnittstelle',
            $fremdeSchnittstellen === [], implode(',', $fremdeSchnittstellen));
    } else {
        echo 'HINWEIS Netzschnittstellen außer Loopback: '
            . ($fremdeSchnittstellen === [] ? 'keine' : implode(',', $fremdeSchnittstellen)) . "\n";
    }
} elseif ($ohneNetzPflicht) {
    pruefe('Netz nach außen ist zu', false, 'net_get_interfaces fehlt, nicht messbar');
}

$chatQuelltext = (string)file_get_contents($apiQuelle . '/chat.php');
$ipMax = konstante($chatQuelltext, 'CHAT_IP_LIMIT_MAX', 10);
$deckel = konstante($chatQuelltext, 'CHAT_TAGESDECKEL', 300);
$berlin = new DateTimeZone('Europe/Berlin');
$heute = (new DateTimeImmutable('now', $berlin))->format('Y-m-d');
$gestern = (new DateTimeImmutable('yesterday', $berlin))->format('Y-m-d');
echo "Grenzen laut Prüfling: IP $ipMax je Minute, Tagesdeckel $deckel, Tag $heute\n\n";

// ─── A: IP-Bremse ohne Cookie ───────────────────────────────────────────────
echo "A  IP-Bremse ohne Cookie\n";
$u = starte($apiQuelle) ?? exit(2);
$cookies = [];
$alleDurch = true;
$detail = '';
for ($i = 1; $i <= $ipMax; $i++) {
    $a = anfrage($u, 'POST', '/chat.php', GUELTIG);
    if ($a['cookie'] !== null) {
        $cookies[$a['cookie']] = true;
    }
    if (!durchgelassen($a)) {
        $alleDurch = false;
        $detail = "Anfrage $i: " . kurz($a);
    }
}
pruefe("Anfragen 1 bis $ipMax ohne Cookie laufen bis zur Schlüsselprüfung und enden dort kontrolliert (500, kein Aufruf nach außen)", $alleDurch, $detail);
pruefe("jede dieser Anfragen bekam eine neue Sitzung ($ipMax verschiedene Cookies), die Sitzungsbremse greift also nicht",
    count($cookies) === $ipMax, count($cookies) . ' verschiedene');
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Anfrage ' . ($ipMax + 1) . ' in derselben Minute ohne Cookie: 429 mit der deutschen Meldung', gebremst($a), kurz($a));
pruefe('429 trägt Retry-After', (bool)preg_match('/^Retry-After:\s*\d+/mi', $a['kopf']), 'Kopfzeile fehlt');
$a = anfrage($u, 'POST', '/chat.php', GUELTIG, ['X-Forwarded-For: 203.0.113.9', 'X-Real-IP: 203.0.113.9', 'Client-IP: 203.0.113.9']);
pruefe('gefälschte Kopfzeilen X-Forwarded-For, X-Real-IP, Client-IP öffnen keinen neuen Zähler: weiter 429', gebremst($a), kurz($a));
$dateien = ipDateien($u);
pruefe('genau eine IP-Zähldatei, Name rate_limit_chat_<md5 von v4:127.0.0.1>.json',
    count($dateien) === 1 && basename($dateien[0]) === 'rate_limit_chat_' . md5('v4:127.0.0.1') . '.json',
    implode(',', array_map('basename', $dateien)) ?: 'keine Datei');
$stand = tagesstand($u);
pruefe("Tageszähler steht auf $ipMax (gebremste Anfragen zählen nicht mit)",
    ($stand['tag'] ?? null) === $heute && ($stand['anzahl'] ?? null) === $ipMax, json_encode($stand));

// Aufräum-Muster aus analytics-cleanup.php gegen die echten Dateinamen
$muster = [];
if (preg_match('/\$rateLimitPatterns\s*=\s*\[(.*?)\];/s', (string)file_get_contents($apiQuelle . '/analytics-cleanup.php'), $m)) {
    preg_match_all("/'([^']+)'/", $m[1], $alle);
    $muster = $alle[1];
}
$trifft = function (string $name) use ($muster): bool {
    foreach ($muster as $p) {
        if (fnmatch($p, $name)) {
            return true;
        }
    }
    return false;
};
pruefe('analytics-cleanup.php räumt die IP-Zähldatei auf (Name passt in ein Muster)',
    $dateien !== [] && $trifft(basename($dateien[0])), 'Muster: ' . implode(' ', $muster));
pruefe('analytics-cleanup.php lässt den Tageszähler stehen (chat_tagesdeckel.json passt in kein Muster)',
    $muster !== [] && !$trifft('chat_tagesdeckel.json'), 'Muster: ' . implode(' ', $muster));

// Fenster läuft ab: Stempel künstlich 61 Sekunden alt machen
if (count($dateien) === 1) {
    file_put_contents($dateien[0], json_encode(['timestamps' => array_fill(0, $ipMax, time() - 61)]));
    $a = anfrage($u, 'POST', '/chat.php', GUELTIG);
    pruefe('nach Ablauf des Fensters (Stempel 61 s alt) geht die nächste Anfrage wieder durch', durchgelassen($a), kurz($a));
} else {
    pruefe('nach Ablauf des Fensters geht die nächste Anfrage wieder durch', false, 'keine IP-Zähldatei zum Altern');
}
stoppe($u);

// ─── B: GET verbraucht nichts ───────────────────────────────────────────────
echo "\nB  GET verbraucht kein Kontingent\n";
$u = starte($apiQuelle) ?? exit(2);
$alle405 = true;
$detail = '';
for ($i = 1; $i <= 15; $i++) {
    $a = anfrage($u, 'GET', '/chat.php');
    if ($a['status'] !== 405) {
        $alle405 = false;
        $detail = "GET $i: " . kurz($a);
    }
}
pruefe('15 GET-Abrufe: jeder 405', $alle405, $detail);
pruefe('danach keine IP-Zähldatei und kein Tageszähler angelegt',
    ipDateien($u) === [] && tagesstand($u) === null,
    count(ipDateien($u)) . ' IP-Dateien, Tageszähler ' . json_encode(tagesstand($u)));
$alleDurch = true;
$detail = '';
for ($i = 1; $i <= $ipMax; $i++) {
    $a = anfrage($u, 'POST', '/chat.php', GUELTIG);
    if (!durchgelassen($a)) {
        $alleDurch = false;
        $detail = "POST $i: " . kurz($a);
    }
}
pruefe("nach den 15 GET gehen noch alle $ipMax POST durch", $alleDurch, $detail);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('und POST ' . ($ipMax + 1) . ' wird gebremst (429)', gebremst($a), kurz($a));
stoppe($u);

// ─── C: Tagesdeckel ─────────────────────────────────────────────────────────
echo "\nC  Tagesdeckel über alle Besucher\n";
$u = starte($apiQuelle) ?? exit(2);
$tagDatei = $u['daten'] . '/chat_tagesdeckel.json';
file_put_contents($tagDatei, json_encode(['tag' => $heute, 'anzahl' => $deckel - 1]));
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Stand ' . ($deckel - 1) . " von $deckel: die Anfrage geht noch durch", durchgelassen($a), kurz($a));
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe("Stand $deckel von $deckel: 429 mit der deutschen Meldung, obwohl die IP-Bremse erst bei 2 von $ipMax steht", gebremst($a), kurz($a));
pruefe('429 des Tagesdeckels trägt Retry-After', (bool)preg_match('/^Retry-After:\s*\d+/mi', $a['kopf']), 'Kopfzeile fehlt');
$stand = tagesstand($u);
pruefe("Tageszähler bleibt bei $deckel stehen (zählt nicht über den Deckel)", ($stand['anzahl'] ?? null) === $deckel, json_encode($stand));
pruefe('Erreichen des Deckels steht einmal im Fehlerprotokoll',
    substr_count((string)file_get_contents($u['log']), 'Tagesdeckel von ' . $deckel) === 1,
    'Zeilen: ' . substr_count((string)file_get_contents($u['log']), 'Tagesdeckel von'));
file_put_contents($tagDatei, json_encode(['tag' => $gestern, 'anzahl' => $deckel]));
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$stand = tagesstand($u);
pruefe('voller Zähler von gestern sperrt heute nicht: Anfrage geht durch, Zähler steht auf heute und 1',
    durchgelassen($a) && ($stand['tag'] ?? null) === $heute && ($stand['anzahl'] ?? null) === 1,
    kurz($a) . ' / ' . json_encode($stand));
stoppe($u);

// ─── D: Ungültige Eingaben ──────────────────────────────────────────────────
echo "\nD  Ungültige Eingaben: 400, kein Fehlertext, kein Verbrauch am Tagesdeckel\n";
$u = starte($apiQuelle) ?? exit(2);
$faelle = [
    'leeres Objekt' => '{}',
    'kein JSON' => 'das ist kein json',
    'message als Liste' => '{"message":["a","b"]}',
    'message als Objekt' => '{"message":{"a":1}}',
    'message als Zahl' => '{"message":12345}',
    'JSON ist eine Zahl' => '5',
    'message über 2000 Zeichen' => json_encode(['message' => str_repeat('a', 2001)]),
];
foreach ($faelle as $name => $koerper) {
    $a = anfrage($u, 'POST', '/chat.php', $koerper);
    pruefe("$name: 400 als JSON", $a['status'] === 400 && is_array($a['json']), kurz($a));
}
pruefe('nach ' . count($faelle) . ' ungültigen Anfragen ist kein Tageszähler angelegt', tagesstand($u) === null, json_encode(tagesstand($u)));
stoppe($u);

// ─── E: Zähler nicht nutzbar ────────────────────────────────────────────────
echo "\nE  Zähler nicht nutzbar: Anfrage wird abgelehnt statt durchgelassen\n";
$u = starte($apiQuelle) ?? exit(2);
mkdir($u['daten'] . '/chat_tagesdeckel.json'); // Verzeichnis statt Datei: fopen scheitert
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Tageszähler nicht zu öffnen: 503 als JSON, nicht durchgelassen',
    $a['status'] === 503 && is_array($a['json']) && !durchgelassen($a), kurz($a));
stoppe($u);

// ─── F: Dateisperre ─────────────────────────────────────────────────────────
echo "\nF  Dateisperre: Zähldatei von einem zweiten Prozess gesperrt\n";
$u = starte($apiQuelle) ?? exit(2);
pruefeSperre($u, $u['daten'] . '/rate_limit_chat_' . md5('v4:127.0.0.1') . '.json', 'IP-Zähldatei');
pruefeSperre($u, $u['daten'] . '/chat_tagesdeckel.json', 'Tageszähler');
$stand = tagesstand($u);
pruefe('alle 4 Anfragen sind gezählt, auch die beiden wartenden (Tageszähler 4)', ($stand['anzahl'] ?? null) === 4, json_encode($stand));
stoppe($u);

echo "\nF  Dateisperre: 30 gleichzeitige Anfragen auf einen Server mit 8 Arbeitern\n";
$u = starte($apiQuelle, 8) ?? exit(2);
anfrage($u, 'GET', '/health.php'); // legt die Datenbank an, zählt im Chat nichts
$alle = gleichzeitig($u, '/chat.php', GUELTIG, 30);
$durch = count(array_filter($alle, 'durchgelassen'));
$brems = count(array_filter($alle, 'gebremst'));
$andere = array_values(array_filter($alle, fn($a) => !durchgelassen($a) && !gebremst($a)));
pruefe("genau $ipMax von 30 durchgelassen, " . (30 - $ipMax) . ' gebremst, keine andere Antwort',
    $durch === $ipMax && $brems === 30 - $ipMax,
    "$durch durch, $brems gebremst, " . count($andere) . ' andere' . ($andere ? ': ' . kurz($andere[0]) : ''));
$stand = tagesstand($u);
pruefe("Tageszähler danach genau $ipMax", ($stand['anzahl'] ?? null) === $ipMax, json_encode($stand));
stoppe($u);

// ─── G: Sitzungsbremse bleibt ───────────────────────────────────────────────
echo "\nG  Sitzungsbremse bleibt (Bestand; diese Prüfung ist auch auf main grün)\n";
$u = starte($apiQuelle) ?? exit(2);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$cookie = $a['cookie'];
for ($i = 2; $i <= 10; $i++) {
    anfrage($u, 'POST', '/chat.php', GUELTIG, ['Cookie: ' . $cookie]);
}
foreach (ipDateien($u) as $datei) {
    unlink($datei); // IP-Zähler zurücksetzen, damit nur die Sitzung bremsen kann
}
$a = anfrage($u, 'POST', '/chat.php', GUELTIG, ['Cookie: ' . $cookie]);
pruefe('11. Anfrage mit demselben Cookie bei zurückgesetztem IP-Zähler: 429', $cookie !== null && gebremst($a), kurz($a));
stoppe($u);

// ─── H: IPv6 zählt je /64 ───────────────────────────────────────────────────
echo "\nH  IPv6-Adresse zählt je /64-Netz\n";
$u = @starte($apiQuelle, 1, '[::1]');
if ($u === null) {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  kein IPv6-Loopback auf dieser Maschine, Fall nicht geprüft\n";
} else {
    anfrage($u, 'POST', '/chat.php', GUELTIG);
    $dateien = ipDateien($u);
    pruefe('Anfrage von ::1 zählt unter dem Netz 0000:0000:0000:0000::/64',
        count($dateien) === 1 && basename($dateien[0]) === 'rate_limit_chat_' . md5('v6:0000000000000000') . '.json',
        implode(',', array_map('basename', $dateien)) ?: 'keine Datei');
    stoppe($u);
}

// ─── I: health.php ──────────────────────────────────────────────────────────
echo "\nI  health.php ohne PHP-Fassung\n";
$u = starte($apiQuelle) ?? exit(2);
$a = anfrage($u, 'GET', '/health.php');
pruefe('health.php: 200 als JSON', $a['status'] === 200 && is_array($a['json']), kurz($a));
pruefe('Feld php_version fehlt und die Fassung ' . PHP_VERSION . ' steht nirgends in der Antwort',
    is_array($a['json']) && !array_key_exists('php_version', $a['json']['checks'] ?? [])
        && strpos($a['text'], PHP_VERSION) === false && stripos($a['text'], 'php') === false,
    kurz($a));
pruefe('Wächter-Zeichenketten unverändert: "status": "ok" und "database": "ok"',
    strpos($a['text'], '"status": "ok"') !== false && strpos($a['text'], '"database": "ok"') !== false, kurz($a));
pruefe('data_writable und timestamp weiter vorhanden',
    ($a['json']['checks']['data_writable'] ?? null) === 'ok' && isset($a['json']['checks']['timestamp']), kurz($a));
stoppe($u);

// ─── Schluss: keine Antwort verrät Fehlertext oder Pfade ────────────────────
echo "\nSchluss\n";
$verraeter = [];
foreach ($antworten as $a) {
    if (preg_match('/Fatal error|Stack trace|Warning:|Notice:|Deprecated:|Uncaught|chat-bremse-|\.php on line/i', $a['text'])) {
        $verraeter[] = $a['url'] . ' ' . kurz($a);
    }
}
pruefe(count($antworten) . ' Antworten geprüft: keine enthält PHP-Fehlertext, Stacktrace oder Dateipfad',
    $verraeter === [], count($verraeter) . ' Treffer, erster: ' . ($verraeter[0] ?? ''));

echo "\nERGEBNIS: $gruen gruen, $rot rot, $uebersprungen uebersprungen\n";
exit($rot === 0 ? 0 : 1);
