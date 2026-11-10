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
 *
 * Abschnitte: A IP-Bremse, B GET, C Tagesdeckel, D Eingaben, E Zähler nicht
 * nutzbar, F Dateisperre, G Sitzungsbremse, H IPv6, I health.php,
 * J Tageslimit je Adresse, K Tageszahlen (Verlauf), L health.php nennt den
 * Zustand des Chats, M Tageszahlen für den Admin und Aufräumen.
 * Die zweite Adresse in J ist 127.0.0.2 als Absender (unter Linux gehört das
 * ganze Netz 127.0.0.0/8 zum Loopback); der Server sieht sie als REMOTE_ADDR.
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

/**
 * Frische Kopie des API-Ordners samt eigenem Server. Bis zu fünf Versuche:
 * Zwischen dem Finden eines freien Ports und dem Start des Servers kann ein
 * anderer Prozess den Port nehmen (die Mutanten laufen zu mehreren zugleich);
 * der Server beendet sich dann sofort, und ein neuer Port wird versucht.
 * null ohne Wiederholung, wenn die Adresse hier gar nicht nutzbar ist (IPv6).
 */
function starte(string $apiQuelle, int $arbeiter = 1, string $adresse = '127.0.0.1'): ?array {
    for ($versuch = 1; $versuch <= 5; $versuch++) {
        if (freierPort($adresse) === 0) {
            return null;
        }
        $u = starteEinmal($apiQuelle, $arbeiter, $adresse);
        if ($u !== null) {
            if ($versuch > 1) {
                echo "HINWEIS Testserver erst im Versuch $versuch gestartet\n";
            }
            return $u;
        }
    }
    fwrite(STDERR, "Testserver auf $adresse ließ sich in 5 Versuchen nicht starten\n");
    return null;
}

function starteEinmal(string $apiQuelle, int $arbeiter, string $adresse): ?array {
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
        if (!proc_get_status($prozess)['running']) {
            break; // Port inzwischen vergeben: der Server hat sich beendet
        }
        $probe = @stream_socket_client('tcp://' . $verbinden, $nr, $text, 0.2);
        if ($probe) {
            fclose($probe);
            usleep(20000);
            // Antwortet auf dem Port ein fremder Server, ist der eigene schon beendet.
            if (!proc_get_status($prozess)['running']) {
                break;
            }
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

function curlGriff(string $url, string $methode, ?string $koerper, array $kopf, int $zeitgrenze = 20, ?string $absender = null): CurlHandle {
    $ch = curl_init($url);
    $zeilen = $kopf;
    if ($koerper !== null) {
        $zeilen[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $koerper);
    }
    if ($absender !== null) {
        // Absenderadresse der Verbindung festlegen: der Server sieht sie als REMOTE_ADDR
        curl_setopt($ch, CURLOPT_INTERFACE, $absender);
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
    // Das letzte Set-Cookie gilt: Die Anmeldung wechselt die Sitzungskennung
    // und kann deshalb zwei solche Zeilen schicken.
    if (preg_match_all('/^Set-Cookie:\s*([^;\r\n]+)/mi', substr($roh, 0, $kopfLaenge), $m) && $m[1] !== []) {
        $cookie = end($m[1]);
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
function anfrage(array $u, string $methode, string $pfad, ?string $koerper = null, array $kopf = [], int $zeitgrenze = 20, ?string $absender = null): array {
    $url = $u['basis'] . $pfad;
    $ch = curlGriff($url, $methode, $koerper, $kopf, $zeitgrenze, $absender);
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

function liesJson(string $datei): ?array {
    if (!is_file($datei)) {
        return null;
    }
    $stand = json_decode((string)file_get_contents($datei), true);
    return is_array($stand) ? $stand : null;
}

function tagesstand(array $u): ?array {
    return liesJson($u['daten'] . '/chat_tagesdeckel.json');
}

/** Minutenzähler aller Adressen löschen, damit nur noch die Tageszähler bremsen können. */
function ipZuruecksetzen(array $u): void {
    foreach (ipDateien($u) as $datei) {
        unlink($datei);
    }
}

/** Tageszähler je Adresse: Dateien und Pfad für einen Zählschlüssel (z. B. v4:127.0.0.1). */
function adressDateien(array $u): array {
    return glob($u['daten'] . '/chat_adresstag_*.json') ?: [];
}

function adressDatei(array $u, string $schluessel): string {
    return $u['daten'] . '/chat_adresstag_' . md5($schluessel) . '.json';
}

/** Verlauf der Tageszahlen (nur die Tage) oder null, wenn die Datei fehlt. */
function verlauf(array $u): ?array {
    $inhalt = liesJson($u['daten'] . '/chat_tageszahlen.json');
    return is_array($inhalt['tage'] ?? null) ? $inhalt['tage'] : null;
}

function schreibeJson(string $datei, array $inhalt, ?int $geaendert = null): void {
    file_put_contents($datei, json_encode($inhalt));
    if ($geaendert !== null) {
        touch($datei, $geaendert);
    }
}

function retryAfter(array $a): ?int {
    return preg_match('/^Retry-After:\s*(\d+)/mi', $a['kopf'], $m) ? (int)$m[1] : null;
}

/** Sekunden bis Mitternacht Europe/Berlin, so wie der Prüfling sie melden soll. */
function bisMitternacht(): int {
    return (new DateTimeImmutable('tomorrow', new DateTimeZone('Europe/Berlin')))->getTimestamp() - time();
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
$adrMax = konstante($chatQuelltext, 'CHAT_ADRESSE_TAGESLIMIT', 30);
$verlaufTage = konstante($chatQuelltext, 'CHAT_TAGESZAHLEN_TAGE', 90);
$berlin = new DateTimeZone('Europe/Berlin');
$heute = (new DateTimeImmutable('now', $berlin))->format('Y-m-d');
$gestern = (new DateTimeImmutable('yesterday', $berlin))->format('Y-m-d');
$vorTagen = fn(int $n): string => (new DateTimeImmutable('today', $berlin))->modify("-$n days")->format('Y-m-d');
echo "Grenzen laut Prüfling: IP $ipMax je Minute, je Adresse $adrMax je Tag, Tagesdeckel $deckel, Verlauf $verlaufTage Tage, Tag $heute\n\n";

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
pruefe('und kein Tageszähler je Adresse: ungültige Anfragen verbrauchen das Tageslimit der Adresse nicht',
    adressDateien($u) === [], implode(',', array_map('basename', adressDateien($u))));
stoppe($u);

// ─── E: Zähler nicht nutzbar ────────────────────────────────────────────────
echo "\nE  Zähler nicht nutzbar: Anfrage wird abgelehnt statt durchgelassen\n";
$u = starte($apiQuelle) ?? exit(2);
mkdir($u['daten'] . '/chat_tagesdeckel.json'); // Verzeichnis statt Datei: fopen scheitert
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Tageszähler nicht zu öffnen: 503 als JSON, nicht durchgelassen',
    $a['status'] === 503 && is_array($a['json']) && !durchgelassen($a), kurz($a));
stoppe($u);
$u = starte($apiQuelle) ?? exit(2);
mkdir($u['daten'] . '/rate_limit_chat_' . md5('v4:127.0.0.1') . '.json');
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('IP-Zähler nicht zu öffnen: 503 als JSON, nicht durchgelassen',
    $a['status'] === 503 && is_array($a['json']) && !durchgelassen($a), kurz($a));
pruefe('dabei ist nichts weiter gezählt: kein Tageszähler, kein Tageszähler je Adresse',
    tagesstand($u) === null && adressDateien($u) === [], json_encode(tagesstand($u)) . ' / ' . count(adressDateien($u)) . ' Adressdateien');
stoppe($u);
$u = starte($apiQuelle) ?? exit(2);
mkdir(adressDatei($u, 'v4:127.0.0.1'));
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Adress-Tageszähler nicht zu öffnen: 503 als JSON, nicht durchgelassen',
    $a['status'] === 503 && is_array($a['json']) && !durchgelassen($a), kurz($a));
pruefe('dabei ist der Tagesdeckel nicht angerührt', tagesstand($u) === null, json_encode(tagesstand($u)));
stoppe($u);

// ─── F: Dateisperre ─────────────────────────────────────────────────────────
echo "\nF  Dateisperre: Zähldatei von einem zweiten Prozess gesperrt\n";
$u = starte($apiQuelle) ?? exit(2);
pruefeSperre($u, $u['daten'] . '/rate_limit_chat_' . md5('v4:127.0.0.1') . '.json', 'IP-Zähldatei');
pruefeSperre($u, $u['daten'] . '/chat_tagesdeckel.json', 'Tageszähler');
$stand = tagesstand($u);
pruefe('alle 4 Anfragen sind gezählt, auch die beiden wartenden (Tageszähler 4)', ($stand['anzahl'] ?? null) === 4, json_encode($stand));
pruefeSperre($u, adressDatei($u, 'v4:127.0.0.1'), 'Adress-Tageszähler');
$stand = liesJson(adressDatei($u, 'v4:127.0.0.1'));
pruefe('Adress-Tageszähler zählt alle 6 Anfragen dieses Abschnitts, auch die wartenden', ($stand['anzahl'] ?? null) === 6, json_encode($stand));
stoppe($u);

echo "\nF  Dateisperre: 30 gleichzeitige Anfragen, der Adresse fehlen noch 5 bis zum Tageslimit\n";
$u = starte($apiQuelle, 8) ?? exit(2);
anfrage($u, 'GET', '/health.php'); // legt die Datenbank an, zählt im Chat nichts
schreibeJson(adressDatei($u, 'v4:127.0.0.1'), ['tag' => $heute, 'anzahl' => $adrMax - 5]);
$alle = gleichzeitig($u, '/chat.php', GUELTIG, 30);
$durch = count(array_filter($alle, 'durchgelassen'));
$brems = count(array_filter($alle, 'gebremst'));
pruefe('genau 5 von 30 durchgelassen, 25 gebremst (10 je Minute erreichen das Tageslimit, 5 davon passen noch)',
    $durch === 5 && $brems === 25, "$durch durch, $brems gebremst");
$stand = liesJson(adressDatei($u, 'v4:127.0.0.1'));
$tag = tagesstand($u);
pruefe("Adress-Tageszähler danach genau $adrMax, Tagesdeckel genau 5",
    ($stand['anzahl'] ?? null) === $adrMax && ($tag['anzahl'] ?? null) === 5, json_encode($stand) . ' / ' . json_encode($tag));
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
    $dateien = adressDateien($u);
    pruefe('und ihr Tageslimit ebenso je /64-Netz (chat_adresstag_<md5 von v6:0000000000000000>.json)',
        count($dateien) === 1 && $dateien[0] === adressDatei($u, 'v6:0000000000000000'),
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

// ─── J: Tageslimit je Adresse ───────────────────────────────────────────────
echo "\nJ  Tageslimit je Adresse ($adrMax je Kalendertag)\n";
$u = starte($apiQuelle) ?? exit(2);
$alleDurch = true;
$detail = '';
for ($i = 1; $i <= $adrMax; $i++) {
    if (($i - 1) % $ipMax === 0) {
        ipZuruecksetzen($u); // Minutenzähler leeren, damit nur das Tageslimit bremsen kann
    }
    $a = anfrage($u, 'POST', '/chat.php', GUELTIG);
    if (!durchgelassen($a)) {
        $alleDurch = false;
        $detail = "Anfrage $i: " . kurz($a);
    }
}
pruefe("Anfragen 1 bis $adrMax einer Adresse an einem Tag gehen durch (Minutenzähler nach je $ipMax geleert)", $alleDurch, $detail);
ipZuruecksetzen($u);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('Anfrage ' . ($adrMax + 1) . ' derselben Adresse am selben Tag: 429 mit der deutschen Meldung, obwohl der Minutenzähler leer ist',
    gebremst($a), kurz($a));
$soll = bisMitternacht();
pruefe('diese 429 trägt Retry-After bis Mitternacht Europe/Berlin (auf 5 s genau)',
    retryAfter($a) !== null && abs(retryAfter($a) - $soll) <= 5, 'Retry-After ' . json_encode(retryAfter($a)) . ", erwartet rund $soll");
$dateien = adressDateien($u);
$stand = liesJson(adressDatei($u, 'v4:127.0.0.1'));
pruefe('genau ein Tageszähler je Adresse, Name chat_adresstag_<md5 von v4:127.0.0.1>.json, Inhalt nur Datum und Zahl',
    count($dateien) === 1 && $dateien[0] === adressDatei($u, 'v4:127.0.0.1')
        && $stand === ['tag' => $heute, 'anzahl' => $adrMax],
    (implode(',', array_map('basename', $dateien)) ?: 'keine Datei') . ' ' . json_encode($stand));
pruefe('dieser Name passt in kein Stunden-Muster von analytics-cleanup.php (sonst stünde der Zähler nach einer Stunde Ruhe wieder auf null)',
    $dateien !== [] && $muster !== [] && !$trifft(basename($dateien[0])), 'Muster: ' . implode(' ', $muster));
$tag = tagesstand($u);
pruefe("der Tagesdeckel hat die abgewiesene Anfrage nicht gezählt: Stand $adrMax, 1 Adresse, 1 Adresse am Limit",
    ($tag['anzahl'] ?? null) === $adrMax && ($tag['adressen'] ?? null) === 1 && ($tag['adresslimit'] ?? null) === 1, json_encode($tag));
ipZuruecksetzen($u);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG, ['X-Forwarded-For: 203.0.113.9', 'X-Real-IP: 203.0.113.9', 'Client-IP: 203.0.113.9']);
pruefe('gefälschte Kopfzeilen öffnen kein neues Tageslimit: weiter 429', gebremst($a), kurz($a));
$b = anfrage($u, 'POST', '/chat.php', GUELTIG, [], 20, '127.0.0.2');
if ($b['status'] === 0 && !$ohneNetzPflicht) {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  Absender 127.0.0.2 lässt sich auf dieser Maschine nicht binden, zweite Adresse nicht geprüft\n";
} else {
    pruefe('eine zweite Adresse (127.0.0.2) geht zur selben Zeit durch', durchgelassen($b), kurz($b));
    $tag = tagesstand($u);
    pruefe('sie hat ihren eigenen Tageszähler (2 Dateien), der Tagesdeckel zählt jetzt 2 Adressen',
        count(adressDateien($u)) === 2 && (liesJson(adressDatei($u, 'v4:127.0.0.2'))['anzahl'] ?? null) === 1
            && ($tag['adressen'] ?? null) === 2,
        count(adressDateien($u)) . ' Dateien, ' . json_encode($tag));
}
// Voller Zähler von gestern
schreibeJson(adressDatei($u, 'v4:127.0.0.1'), ['tag' => $gestern, 'anzahl' => $adrMax]);
ipZuruecksetzen($u);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$stand = liesJson(adressDatei($u, 'v4:127.0.0.1'));
pruefe('voller Adresszähler von gestern sperrt heute nicht: Anfrage geht durch, Zähler steht auf heute und 1',
    durchgelassen($a) && $stand === ['tag' => $heute, 'anzahl' => 1], kurz($a) . ' / ' . json_encode($stand));
stoppe($u);

// Reihenfolge: Das Tageslimit der Adresse zählt vor dem Tagesdeckel
$u = starte($apiQuelle) ?? exit(2);
schreibeJson(adressDatei($u, 'v4:127.0.0.1'), ['tag' => $heute, 'anzahl' => $adrMax]);
schreibeJson($u['daten'] . '/chat_tagesdeckel.json', ['tag' => $heute, 'anzahl' => 5, 'deckel' => $deckel, 'adressen' => 2, 'adresslimit' => 1, 'abgewiesen' => 0]);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$tag = tagesstand($u);
pruefe('Adresse am Limit: 429, und der Tagesdeckel bleibt unberührt bei 5 (die Adresse verbraucht das Kontingent der anderen nicht)',
    gebremst($a) && ($tag['anzahl'] ?? null) === 5 && ($tag['abgewiesen'] ?? null) === 0, kurz($a) . ' / ' . json_encode($tag));
stoppe($u);

// ─── K: Tageszahlen bleiben erhalten ────────────────────────────────────────
echo "\nK  Tageszahlen: der Stand von gestern wird festgehalten statt überschrieben\n";
$u = starte($apiQuelle) ?? exit(2);
$tagDatei = $u['daten'] . '/chat_tagesdeckel.json';
$verlaufDatei = $u['daten'] . '/chat_tageszahlen.json';
schreibeJson($tagDatei, ['tag' => $gestern, 'anzahl' => 17, 'deckel' => $deckel, 'adressen' => 4, 'adresslimit' => 1, 'abgewiesen' => 0]);
// Verlauf mit 95 älteren Tagen (vor 96 bis vor 2 Tagen): mit gestern wären es 96
$alt = [];
for ($n = 96; $n >= 2; $n--) {
    $alt[$vorTagen($n)] = ['anzahl' => $n, 'adressen' => 1, 'adresslimit' => 0, 'abgewiesen' => 0, 'deckel' => $deckel];
}
schreibeJson($verlaufDatei, ['tage' => $alt]);
// Zwei verfallene und ein frischer Tageszähler fremder Adressen
$adr49 = adressDatei($u, 'v4:198.51.100.49');
$adr47 = adressDatei($u, 'v4:198.51.100.47');
schreibeJson($adr49, ['tag' => $vorTagen(2), 'anzahl' => 3], time() - 49 * 3600);
schreibeJson($adr47, ['tag' => $gestern, 'anzahl' => 3], time() - 47 * 3600);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$tage = verlauf($u);
$tag = tagesstand($u);
pruefe('erste Anfrage des neuen Tages geht durch, der Tageszähler steht auf heute und 1',
    durchgelassen($a) && ($tag['tag'] ?? null) === $heute && ($tag['anzahl'] ?? null) === 1, kurz($a) . ' / ' . json_encode($tag));
pruefe("Tageszahl von gestern bleibt lesbar: chat_tageszahlen.json trägt für $gestern 17 Anfragen von 4 Adressen, 1 am Limit",
    ($tage[$gestern] ?? null) === ['anzahl' => 17, 'adressen' => 4, 'adresslimit' => 1, 'abgewiesen' => 0, 'deckel' => $deckel],
    json_encode($tage[$gestern] ?? null));
pruefe("Verlauf hält höchstens $verlaufTage Tage: von 96 bleiben die jüngsten $verlaufTage, der Tag vor " . ($verlaufTage + 1) . ' Tagen ist heraus',
    is_array($tage) && count($tage) === $verlaufTage && !isset($tage[$vorTagen($verlaufTage + 1)]) && isset($tage[$vorTagen($verlaufTage)]),
    is_array($tage) ? count($tage) . ' Tage, ältester ' . (array_key_first($tage) ?? '') : 'kein Verlauf');
$nurZahlen = is_array($tage) && $tage !== [];
foreach ((array)$tage as $datum => $eintrag) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$datum)
        || !is_array($eintrag) || array_keys($eintrag) !== ['anzahl', 'adressen', 'adresslimit', 'abgewiesen', 'deckel']
        || array_filter($eintrag, 'is_int') !== $eintrag) {
        $nurZahlen = false;
    }
}
$verlaufText = is_file($verlaufDatei) ? (string)file_get_contents($verlaufDatei) : '';
pruefe('Verlauf enthält keine Adressen: je Tag nur ein Datum und fünf Zahlen, weder 127.0.0.1 noch ein Zählschlüssel',
    $nurZahlen && strpos($verlaufText, '127.0.0.1') === false && strpos($verlaufText, md5('v4:127.0.0.1')) === false,
    substr($verlaufText, 0, 120));
pruefe('analytics-cleanup.php lässt den Verlauf stehen (chat_tageszahlen.json passt in kein Muster)',
    $muster !== [] && !$trifft('chat_tageszahlen.json'), 'Muster: ' . implode(' ', $muster));
pruefe('beim Tageswechsel räumt chat.php selbst auf: Tageszähler einer Adresse, 49 Stunden alt, ist weg; 47 Stunden alt bleibt',
    !file_exists($adr49) && file_exists($adr47), (file_exists($adr49) ? '49 h noch da' : '49 h weg') . ', ' . (file_exists($adr47) ? '47 h da' : '47 h weg'));
$vorher = md5($verlaufText);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe('zweite Anfrage des Tages schreibt den Verlauf nicht noch einmal (Datei unverändert), Tageszähler 2',
    durchgelassen($a) && md5((string)@file_get_contents($verlaufDatei)) === $vorher && (tagesstand($u)['anzahl'] ?? null) === 2,
    kurz($a) . ' / ' . json_encode(tagesstand($u)));
stoppe($u);

// Stand im Format von main (vor dieser Fassung): nur tag und anzahl
$u = starte($apiQuelle) ?? exit(2);
schreibeJson($u['daten'] . '/chat_tagesdeckel.json', ['tag' => $gestern, 'anzahl' => 123]);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$tage = verlauf($u);
pruefe('Stand im alten Format (nur tag und anzahl, wie ihn main schreibt) wird beim Tageswechsel festgehalten: 123',
    durchgelassen($a) && ($tage[$gestern]['anzahl'] ?? null) === 123, kurz($a) . ' / ' . json_encode($tage));
stoppe($u);

// Nachzügler um Mitternacht: Eine Anfrage, die noch am alten Tag begann, kann
// den Zähler nach der ersten Anfrage des neuen Tages erreichen und stellt ihn
// kurz auf den alten Tag zurück. Der Rest, der dann für den alten Tag ankommt,
// darf die schon festgehaltene Zahl nicht ersetzen.
$u = starte($apiQuelle) ?? exit(2);
schreibeJson($u['daten'] . '/chat_tageszahlen.json', ['tage' => [$gestern => ['anzahl' => 17, 'adressen' => 4, 'adresslimit' => 1, 'abgewiesen' => 0, 'deckel' => $deckel]]]);
schreibeJson($u['daten'] . '/chat_tagesdeckel.json', ['tag' => $gestern, 'anzahl' => 1, 'deckel' => $deckel, 'adressen' => 1, 'adresslimit' => 0, 'abgewiesen' => 0]);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$tage = verlauf($u);
pruefe('ein Rest-Stand von gestern (1, wie ihn ein Nachzügler um Mitternacht hinterlässt) ersetzt die festgehaltene 17 nicht',
    durchgelassen($a) && ($tage[$gestern]['anzahl'] ?? null) === 17 && ($tage[$gestern]['adressen'] ?? null) === 4,
    kurz($a) . ' / ' . json_encode($tage));
stoppe($u);

// ─── L: health.php nennt den Zustand des Chats ──────────────────────────────
echo "\nL  health.php nennt den Zustand des Chats, nie die Zahl\n";
$u = starte($apiQuelle) ?? exit(2);
$tagDatei = $u['daten'] . '/chat_tagesdeckel.json';
$a = anfrage($u, 'GET', '/health.php');
pruefe('ohne Zähldatei: health.php meldet "chat": "frei"', strpos($a['text'], '"chat": "frei"') !== false, kurz($a));
schreibeJson($tagDatei, ['tag' => $heute, 'anzahl' => $deckel - 1]);
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
pruefe("die Anfrage, die den Deckel erreicht ($deckel von $deckel), geht noch durch", durchgelassen($a), kurz($a));
$a = anfrage($u, 'GET', '/health.php');
pruefe('Deckel erreicht: health.php meldet "chat": "deckel_erreicht"',
    $a['status'] === 200 && strpos($a['text'], '"chat": "deckel_erreicht"') !== false && strpos($a['text'], '"chat": "frei"') === false, kurz($a));
pruefe('"status": "ok" und "database": "ok" bleiben dabei stehen (der Wächter für API und Datenbank wird wegen des Chats nicht rot)',
    strpos($a['text'], '"status": "ok"') !== false && strpos($a['text'], '"database": "ok"') !== false, kurz($a));
$ohneZeit = preg_replace('/"timestamp":\s*"[^"]*"/', '', $a['text']);
pruefe('der Zustand steht ohne Zahl da: außer dem Zeitstempel keine Ziffer in der Antwort, Felder nur database, data_writable, chat, timestamp, bereinigung',
    !preg_match('/\d/', (string)$ohneZeit) && array_keys($a['json']['checks'] ?? []) === ['database', 'data_writable', 'chat', 'timestamp', 'bereinigung'],
    str_replace(["\r", "\n"], ' ', (string)$ohneZeit));
$a = anfrage($u, 'POST', '/chat.php', GUELTIG);
$b = anfrage($u, 'GET', '/health.php');
pruefe('nächste Anfrage 429, health.php bleibt bei "deckel_erreicht"',
    gebremst($a) && strpos($b['text'], '"chat": "deckel_erreicht"') !== false, kurz($a) . ' / ' . kurz($b));
$tag = tagesstand($u);
pruefe('die am Deckel abgewiesene Anfrage ist als Bedarf gezählt (abgewiesen 1), der Zähler bleibt beim Deckel',
    ($tag['anzahl'] ?? null) === $deckel && ($tag['abgewiesen'] ?? null) === 1, json_encode($tag));
schreibeJson($tagDatei, ['tag' => $gestern, 'anzahl' => $deckel, 'deckel' => $deckel]);
$a = anfrage($u, 'GET', '/health.php');
pruefe('voller Zähler von gestern: health.php meldet "chat": "frei"', strpos($a['text'], '"chat": "frei"') !== false, kurz($a));
// Der Wächter des Hauses sucht genau diese Zeichenkette (ops/sunds-hub/eintragen.py)
$waechter = (string)@file_get_contents(__DIR__ . '/../sunds-hub/eintragen.py');
pruefe('eintragen.py hat das Ziel "Messebau-Website KI-Chat" mit genau der Zeichenkette, die health.php im freien Zustand ausgibt',
    strpos($waechter, '"name": "Messebau-Website KI-Chat"') !== false
        && strpos($waechter, '"muss_enthalten": ["\\"chat\\": \\"frei\\""]') !== false
        && strpos($a['text'], '"chat": "frei"') !== false,
    $waechter === '' ? 'eintragen.py nicht gefunden' : 'Ziel oder Zeichenkette fehlt');
stoppe($u);

// ─── M: Tageszahlen für den Admin, Aufräumen ────────────────────────────────
echo "\nM  Tageszahlen nur für den angemeldeten Admin; Aufräumen der Zähldateien\n";
$u = starte($apiQuelle) ?? exit(2);
$tagDatei = $u['daten'] . '/chat_tagesdeckel.json';
schreibeJson($tagDatei, ['tag' => $gestern, 'anzahl' => 17, 'deckel' => $deckel, 'adressen' => 4, 'adresslimit' => 1, 'abgewiesen' => 0]);
schreibeJson($u['daten'] . '/chat_tageszahlen.json', ['tage' => [$vorTagen(2) => ['anzahl' => 9, 'adressen' => 2, 'adresslimit' => 0, 'abgewiesen' => 0, 'deckel' => $deckel]]]);
$a = anfrage($u, 'GET', '/chat.php?tageszahlen=1');
$sitzungen = glob($u['wurzel'] . '/sitzungen/sess_*') ?: [];
pruefe('Tageszahlen ohne Cookie: 401, keine Zahl in der Antwort, keine Sitzung angelegt',
    $a['status'] === 401 && !preg_match('/\d/', $a['text']) && $sitzungen === [], kurz($a) . ' / ' . count($sitzungen) . ' Sitzungen');
$gast = anfrage($u, 'GET', '/auth.php?action=me');
$a = anfrage($u, 'GET', '/chat.php?tageszahlen=1', null, ['Cookie: ' . $gast['cookie']]);
pruefe('Tageszahlen mit Sitzung ohne Anmeldung: 401, keine Zahl in der Antwort',
    $gast['cookie'] !== null && $a['status'] === 401 && !preg_match('/\d/', $a['text']), kurz($a));
// Anmeldung: Die leere Datenbank dieses Testservers hat keinen Admin, die Ersteinrichtung legt einen an.
$admin = anfrage($u, 'POST', '/auth.php?action=setup', json_encode(['username' => 'probe', 'password' => bin2hex(random_bytes(8)), 'displayName' => 'Probe']));
$kopf = ['Cookie: ' . $admin['cookie']];
$a = anfrage($u, 'GET', '/chat.php?tageszahlen=1', null, $kopf);
pruefe('angemeldeter Admin liest die Tageszahlen: 200, gestern 17 Anfragen (noch im Zähler), vor zwei Tagen 9 (im Verlauf), heute 0',
    ($admin['json']['success'] ?? null) === true && $a['status'] === 200
        && ($a['json']['tage'][$gestern]['anzahl'] ?? null) === 17 && ($a['json']['tage'][$gestern]['adressen'] ?? null) === 4
        && ($a['json']['tage'][$vorTagen(2)]['anzahl'] ?? null) === 9
        && ($a['json']['heute'] ?? null) === ['tag' => $heute, 'anzahl' => 0, 'adressen' => 0, 'adresslimit' => 0, 'abgewiesen' => 0, 'deckel' => $deckel],
    kurz($admin) . ' / ' . substr($a['text'], 0, 300));
pruefe('die Antwort nennt die geltenden Grenzen und keine Adresse',
    ($a['json']['grenzen'] ?? null) === ['tagesdeckel' => $deckel, 'je_adresse_und_tag' => $adrMax, 'je_adresse_und_minute' => $ipMax]
        && strpos($a['text'], '127.0.0.1') === false,
    json_encode($a['json']['grenzen'] ?? null));
pruefe('das Lesen hat nichts gezählt und nichts geschrieben: Tageszähler unverändert von gestern',
    (tagesstand($u)['tag'] ?? null) === $gestern && adressDateien($u) === [] && ipDateien($u) === [], json_encode(tagesstand($u)));
anfrage($u, 'POST', '/chat.php', GUELTIG);
$a = anfrage($u, 'GET', '/chat.php?tageszahlen=1', null, $kopf);
pruefe('nach einer Chat-Anfrage: heute 1 Anfrage von 1 Adresse, gestern weiter 17 (jetzt aus dem Verlauf)',
    ($a['json']['heute']['anzahl'] ?? null) === 1 && ($a['json']['heute']['adressen'] ?? null) === 1
        && ($a['json']['tage'][$gestern]['anzahl'] ?? null) === 17 && (verlauf($u)[$gestern]['anzahl'] ?? null) === 17,
    substr($a['text'], 0, 300));
$a = anfrage($u, 'GET', '/chat.php', null, $kopf);
pruefe('GET ohne den Parameter bleibt 405, auch für den Admin', $a['status'] === 405, kurz($a));

// Aufräumen über analytics-cleanup.php (braucht die Anmeldung)
$adr49 = adressDatei($u, 'v4:198.51.100.49');
$adr47 = adressDatei($u, 'v4:198.51.100.47');
$ipAlt = $u['daten'] . '/rate_limit_chat_' . md5('v4:198.51.100.2') . '.json';
schreibeJson($adr49, ['tag' => $vorTagen(2), 'anzahl' => 3], time() - 49 * 3600);
schreibeJson($adr47, ['tag' => $gestern, 'anzahl' => 3], time() - 47 * 3600);
schreibeJson($ipAlt, ['timestamps' => []], time() - 2 * 3600);
touch($tagDatei, time() - 49 * 3600);
touch($u['daten'] . '/chat_tageszahlen.json', time() - 49 * 3600);
$a = anfrage($u, 'POST', '/analytics-cleanup.php', '{}', $kopf);
pruefe('analytics-cleanup.php läuft für den Admin durch (200)', $a['status'] === 200 && is_array($a['json']), kurz($a));
pruefe('Aufräumen: Tageszähler einer Adresse, 49 Stunden alt ist weg', !file_exists($adr49), 'Datei noch da');
pruefe('Aufräumen: Tageszähler einer Adresse, 47 Stunden alt bleibt (er darf nicht nach einer Stunde Ruhe verschwinden)', file_exists($adr47), 'Datei weg');
pruefe('Aufräumen: Minutenzähler, 2 Stunden alt, ist weg (Bestand); Tageszähler und Verlauf, 49 Stunden alt, bleiben',
    !file_exists($ipAlt) && file_exists($tagDatei) && file_exists($u['daten'] . '/chat_tageszahlen.json'),
    (file_exists($ipAlt) ? 'Minutenzähler da' : 'Minutenzähler weg') . ', ' . (file_exists($tagDatei) ? 'Tageszähler da' : 'Tageszähler weg'));
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
