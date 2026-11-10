<?php
/**
 * Beleg dafür, dass die Bereinigung der Statistik von selbst läuft
 * (public/api/bereinigung-anstoss.php, angestoßen aus health.php und collect.php).
 *
 * Liegt unter ops/ und nicht unter public/, weil der Build alles aus public/
 * auf den Webserver kopiert; diese Datei soll dort nie liegen.
 *
 * Aufruf:  php ops/tests/bereinigung_test.php [--ohne-netz] [<Pfad zu public/api>]
 * Exit:    0 = alle Prüfungen grün, 1 = mindestens eine rot, 2 = Umgebung ungeeignet
 *
 * Der Test kopiert den API-Ordner (ohne Inhalt von data/) je Fall in ein
 * frisches Verzeichnis, legt dort mit dem db.php des Prüflings eine leere
 * SQLite-Datenbank an, füllt alte und junge Messzeilen und Zähldateien ein,
 * startet den eingebauten Server (php -S) und fragt ihn über curl ab.
 * Nichts geht nach außen: Die Ortung in collect.php läuft nur bei
 * session_start, das der Test nie schickt; curl_init ist im Server abgeschaltet.
 *
 * Fälle:
 *   A  erster Abruf von health.php räumt Fälliges und lässt Junges stehen
 *   B  zweiter Abruf am selben Tag räumt nicht noch einmal
 *   C  am nächsten Tag (Marke von gestern) räumt auch collect.php
 *   D  ein Fehler in der Bereinigung ändert keine Antwort; Pause und Obergrenze
 *   E  die Zeitgrenze bricht einen hängenden Lauf ab
 *   F  gleichzeitige Abrufe: genau ein Lauf
 *   G  Türen: ohne Anmeldung 401, der Admin-Knopf wie bisher
 *   H  unter PHP-FPM ist die Antwort fertig, bevor geräumt ist (nur wenn
 *      php-fpm im Abbild liegt, etwa php:8.3-fpm)
 *
 * Gegen public/api von main ist der Test rot: Dort räumt kein Abruf.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

const TAG = 86400;
const LEERE_ANTWORT_COLLECT = '{"ok":true,"stored":1}';
const KAPUTT = "<?php\nfunction (((;\n";

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
if ($apiQuelle === false || !is_file($apiQuelle . '/analytics-cleanup.php') || !is_file($apiQuelle . '/health.php')) {
    fwrite(STDERR, "analytics-cleanup.php oder health.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}
if (!extension_loaded('curl') || !extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "Der Test braucht die PHP-Erweiterungen curl und pdo_sqlite\n");
    exit(2);
}

$gruen = 0;
$rot = 0;
$uebersprungen = 0;
$antworten = []; // jede Antwort, für die Schlussprüfung auf Fehlertext
$hatAnstoss = is_file($apiQuelle . '/bereinigung-anstoss.php');
$hatAdressRegel = strpos((string)file_get_contents($apiQuelle . '/analytics-cleanup.php'), 'chat_adresstag_*.json') !== false;

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

function freierPort(): int {
    $s = stream_socket_server('tcp://127.0.0.1:0', $nr, $text);
    if (!$s) {
        return 0;
    }
    $name = stream_socket_get_name($s, false);
    fclose($s);
    return (int)substr($name, strrpos($name, ':') + 1);
}

function wartePort(int $port): bool {
    for ($i = 0; $i < 100; $i++) {
        $probe = @stream_socket_client('tcp://127.0.0.1:' . $port, $nr, $text, 0.2);
        if ($probe) {
            fclose($probe);
            return true;
        }
        usleep(50000);
    }
    return false;
}

function umgebung(string $wurzel, string $apiQuelle): array {
    kopiereApi($apiQuelle, $wurzel . '/api');
    mkdir($wurzel . '/sitzungen', 0700);
    return ['wurzel' => $wurzel, 'api' => $wurzel . '/api', 'daten' => $wurzel . '/api/data',
            'log' => $wurzel . '/server.log'];
}

/** Frische Kopie des API-Ordners samt eigenem Server (php -S). */
function starte(string $apiQuelle, int $arbeiter = 1): ?array {
    $wurzel = sys_get_temp_dir() . '/bereinigung-test-' . bin2hex(random_bytes(6));
    $u = umgebung($wurzel, $apiQuelle);
    $port = freierPort();
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
        '-S', '127.0.0.1:' . $port,
        '-t', $wurzel . '/api',
    ];
    $rohre = [];
    $prozess = proc_open($befehl, [
        0 => ['file', PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null', 'r'],
        1 => ['file', $u['log'], 'a'],
        2 => ['file', $u['log'], 'a'],
    ], $rohre, $wurzel, $umgebung);
    if (!is_resource($prozess)) {
        return null;
    }
    if (!wartePort($port)) {
        proc_terminate($prozess);
        proc_close($prozess);
        return null;
    }
    return $u + ['basis' => 'http://127.0.0.1:' . $port, 'prozess' => $prozess];
}

/** Dieselbe Kopie hinter PHP-FPM, angesprochen über FastCGI. */
function starteFpm(string $apiQuelle, string $fpm): ?array {
    $wurzel = sys_get_temp_dir() . '/bereinigung-test-' . bin2hex(random_bytes(6));
    $u = umgebung($wurzel, $apiQuelle);
    $port = freierPort();
    if ($port === 0) {
        return null;
    }
    $alsRoot = function_exists('posix_geteuid') && posix_geteuid() === 0;
    $konf = "[global]\nerror_log = {$u['log']}\ndaemonize = no\n"
        . "[www]\nlisten = 127.0.0.1:$port\npm = static\npm.max_children = 2\n"
        . "catch_workers_output = yes\nphp_flag[display_errors] = on\nphp_value[error_reporting] = -1\n"
        . ($alsRoot ? "user = root\ngroup = root\n" : '');
    file_put_contents($wurzel . '/fpm.conf', $konf);
    $befehl = [$fpm, '-F', '-y', $wurzel . '/fpm.conf'];
    if ($alsRoot) {
        $befehl[] = '-R';
    }
    $rohre = [];
    $prozess = proc_open($befehl, [
        0 => ['file', '/dev/null', 'r'],
        1 => ['file', $wurzel . '/fpm.aus', 'a'],
        2 => ['file', $wurzel . '/fpm.aus', 'a'],
    ], $rohre, $wurzel);
    if (!is_resource($prozess)) {
        return null;
    }
    if (!wartePort($port)) {
        proc_terminate($prozess);
        proc_close($prozess);
        return null;
    }
    return $u + ['port' => $port, 'prozess' => $prozess];
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
    $cookie = null; // das zuletzt gesetzte: auth.php erneuert die Sitzung beim Anmelden
    if (preg_match_all('/^Set-Cookie:\s*([^;\r\n]+)/mi', substr($roh, 0, $kopfLaenge), $m)) {
        $cookie = end($m[1]);
    }
    $antwort = [
        'status' => (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE),
        'text' => $text,
        'fehler' => is_array($json) ? ($json['error'] ?? null) : null,
        'json' => $json,
        'cookie' => $cookie,
        'url' => $url,
        'dauer' => (float)curl_getinfo($ch, CURLINFO_TOTAL_TIME),
    ];
    $antworten[] = $antwort;
    return $antwort;
}

function anfrage(array $u, string $methode, string $pfad, ?string $koerper = null, array $kopf = [], int $zeitgrenze = 20): array {
    $url = $u['basis'] . $pfad;
    $ch = curlGriff($url, $methode, $koerper, $kopf, $zeitgrenze);
    return lies($ch, curl_exec($ch), $url);
}

/** $anzahl gleiche GET-Anfragen gleichzeitig. */
function gleichzeitig(array $u, string $pfad, int $anzahl): array {
    $url = $u['basis'] . $pfad;
    $mh = curl_multi_init();
    $griffe = [];
    for ($i = 0; $i < $anzahl; $i++) {
        $griffe[$i] = curlGriff($url, 'GET', null, []);
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

function liesGenau($s, int $laenge): ?string {
    $puffer = '';
    while (strlen($puffer) < $laenge) {
        $teil = fread($s, $laenge - strlen($puffer));
        if ($teil === false || $teil === '') {
            return null;
        }
        $puffer .= $teil;
    }
    return $puffer;
}

/**
 * Ein GET über FastCGI. 'dauer' ist die Zeit bis zum Satz END_REQUEST, also
 * bis PHP-FPM dem Webserver die fertige Antwort übergeben hat.
 */
function fcgi(array $u, string $skript): array {
    global $antworten;
    $s = @stream_socket_client('tcp://127.0.0.1:' . $u['port'], $nr, $text, 3);
    if (!$s) {
        return ['status' => 0, 'text' => '', 'dauer' => null, 'url' => 'fcgi:' . $skript];
    }
    stream_set_timeout($s, 20);
    $satz = function (int $typ, string $inhalt): string {
        return pack('CCnnCC', 1, $typ, 1, strlen($inhalt), 0, 0) . $inhalt;
    };
    $laenge = function (int $n): string {
        return $n < 128 ? chr($n) : pack('N', $n | 0x80000000);
    };
    $werte = [
        'GATEWAY_INTERFACE' => 'CGI/1.1',
        'SERVER_PROTOCOL' => 'HTTP/1.1',
        'REQUEST_METHOD' => 'GET',
        'SCRIPT_FILENAME' => $u['api'] . '/' . $skript,
        'SCRIPT_NAME' => '/' . $skript,
        'REQUEST_URI' => '/' . $skript,
        'QUERY_STRING' => '',
        'REMOTE_ADDR' => '127.0.0.1',
        'SERVER_NAME' => 'localhost',
        'SERVER_PORT' => '80',
    ];
    $paare = '';
    foreach ($werte as $k => $v) {
        $paare .= $laenge(strlen($k)) . $laenge(strlen($v)) . $k . $v;
    }
    $t0 = microtime(true);
    fwrite($s, $satz(1, pack('nCx5', 1, 0)) . $satz(4, $paare) . $satz(4, '') . $satz(5, ''));
    $aus = '';
    $dauer = null;
    while (($kopf = liesGenau($s, 8)) !== null) {
        $f = unpack('Cfassung/Ctyp/nnr/nlaenge/Cfuell/Crest', $kopf);
        $inhalt = $f['laenge'] > 0 ? (string)liesGenau($s, $f['laenge']) : '';
        if ($f['fuell'] > 0) {
            liesGenau($s, $f['fuell']);
        }
        if ($f['typ'] === 6) {
            $aus .= $inhalt;
        } elseif ($f['typ'] === 3) {
            $dauer = microtime(true) - $t0;
            break;
        }
    }
    fclose($s);
    $teile = explode("\r\n\r\n", $aus, 2);
    $status = preg_match('/^Status:\s*(\d+)/mi', $teile[0], $m) ? (int)$m[1] : 200;
    $antwort = ['status' => $status, 'text' => $teile[1] ?? '', 'dauer' => $dauer, 'url' => 'fcgi:' . $skript];
    $antworten[] = $antwort;
    return $antwort;
}

function kurz(array $a): string {
    return $a['status'] . ' ' . substr(str_replace(["\r", "\n"], ' ', $a['text']), 0, 110);
}

/** health.php ohne den Zeitstempel, zum Vergleich Wort für Wort. */
function normal(string $text): string {
    return (string)preg_replace('/"timestamp":\s*"[^"]*"/', '"timestamp": "X"', $text);
}

function heute(): string {
    return gmdate('Y-m-d');
}

// ─── Datenbank und Dateien des Prüflings ────────────────────────────────────

/** Legt die Datenbank mit dem Schema aus dem db.php des Prüflings an. */
function schema(array $u): bool {
    $aus = [];
    $rc = 1;
    exec(escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg('require $argv[1]; getDB();') . ' '
        . escapeshellarg($u['api'] . '/db.php') . ' 2>&1', $aus, $rc);
    return $rc === 0 && is_file($u['daten'] . '/database.sqlite');
}

function db(array $u): PDO {
    $p = new PDO('sqlite:' . $u['daten'] . '/database.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    return $p;
}

/** Messzeile, deren Zeitstempel so aussieht, wie der Browser ihn schickt. */
function zeile(PDO $p, string $ereignis, string $marke, int $alter): string {
    $s = $p->prepare('INSERT INTO analytics_events (event, ts, session_id, visitor_id, url) VALUES (?, ?, ?, ?, ?)');
    $s->execute([$ereignis, gmdate('Y-m-d\TH:i:s', time() - $alter) . '.000Z', $marke, 'probe', '/probe']);
    return $marke;
}

function datei(array $u, string $name, int $alter, string $inhalt = '{"timestamps":[]}'): string {
    $pfad = $u['daten'] . '/' . $name;
    if (!is_dir(dirname($pfad))) {
        mkdir(dirname($pfad), 0755, true);
    }
    file_put_contents($pfad, $inhalt);
    touch($pfad, time() - $alter);
    return $name;
}

function konfig(array $u, string $schluessel): ?string {
    $p = db($u);
    $s = $p->prepare('SELECT config_value FROM analytics_config WHERE config_key = ?');
    $s->execute([$schluessel]);
    $wert = $s->fetchColumn();
    return $wert === false ? null : (string)$wert;
}

function zeilenDa(array $u): array {
    return db($u)->query("SELECT session_id FROM analytics_events")->fetchAll(PDO::FETCH_COLUMN);
}

/**
 * Der Bestand, an dem jeder Fall misst: Fälliges ("weg") und Junges oder
 * Geschütztes ("bleibt"), je für Dateien und Messzeilen. Aufbewahrung 365 Tage
 * wie auf der Live-Seite.
 */
function fuelle(array $u): array {
    global $hatAdressRegel;
    $p = db($u);
    $p->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('retention_days', '365')");
    $zeilenWeg = [
        zeile($p, 'page_view', 'alt-seite-400-tage', 400 * TAG),
        zeile($p, 'heartbeat', 'alt-herzschlag-3-tage', 3 * TAG),
    ];
    $zeilenBleibt = [
        zeile($p, 'page_view', 'jung-seite-200-tage', 200 * TAG),
        zeile($p, 'page_view', 'jung-seite-10-tage', 10 * TAG),
        zeile($p, 'heartbeat', 'jung-herzschlag-1-stunde', 3600),
    ];
    $p = null;
    $a = md5('198.51.100.7');
    $b = md5('198.51.100.8');
    $weg = [
        datei($u, "rate_limit_$a.json", 7200),
        datei($u, "rate_limit_chat_$a.json", 7200),
        datei($u, "login_limit_$a.json", 7200, '[]'),
        datei($u, "email_limit_$a.json", 7200),
        datei($u, "order_limit_$a.json", 7200),
        datei($u, "inquiry_limit_$a.json", 7200),
        datei($u, "geocache/$a.json", 8 * TAG, '{"city":"Probe"}'),
    ];
    $bleibt = [
        datei($u, "rate_limit_$b.json", 600),
        datei($u, "inquiry_limit_$b.json", 600),
        datei($u, "geocache/$b.json", TAG, '{"city":"Probe"}'),
        datei($u, 'chat_tagesdeckel.json', 3 * TAG, '{"tag":"2000-01-01","anzahl":5,"deckel":300}'),
        datei($u, 'chat_tageszahlen.json', 3 * TAG, '{}'),
        datei($u, "chat_adresstag_$b.json", 3600, '{"tag":"2000-01-01","anzahl":1}'),
        datei($u, '.htaccess', 30 * TAG, "Require all denied\n"),
        'database.sqlite',
    ];
    // Die Regel für chat_adresstag_*.json (48 Stunden) kommt mit PR #238. Steht
    // sie im Prüfling, muss der Anstoß sie mit ausführen; sonst bleibt die Datei.
    $alteAdresse = datei($u, "chat_adresstag_$a.json", 3 * TAG, '{"tag":"2000-01-01","anzahl":1}');
    if ($hatAdressRegel) {
        $weg[] = $alteAdresse;
    } else {
        $bleibt[] = $alteAdresse;
    }
    return ['weg' => $weg, 'bleibt' => $bleibt, 'zeilenWeg' => $zeilenWeg, 'zeilenBleibt' => $zeilenBleibt];
}

function nochDa(array $u, array $dateien, array $zeilen): array {
    $da = [];
    foreach ($dateien as $name) {
        if (file_exists($u['daten'] . '/' . $name)) {
            $da[] = $name;
        }
    }
    return array_merge($da, array_values(array_intersect($zeilen, zeilenDa($u))));
}

function pruefeGeraeumt(array $u, array $soll, string $wann): void {
    $rest = nochDa($u, $soll['weg'], $soll['zeilenWeg']);
    pruefe("$wann: alles Fällige ist gelöscht (" . count($soll['weg']) . ' Dateien, ' . count($soll['zeilenWeg']) . ' Messzeilen)',
        $rest === [], 'noch da: ' . implode(', ', $rest));
    $erwartet = array_merge($soll['bleibt'], $soll['zeilenBleibt']);
    $fehlt = array_values(array_diff($erwartet, nochDa($u, $soll['bleibt'], $soll['zeilenBleibt'])));
    pruefe("$wann: alles Junge und Geschützte steht noch (" . count($soll['bleibt']) . ' Dateien, ' . count($soll['zeilenBleibt']) . ' Messzeilen)',
        $fehlt === [], 'fehlt: ' . implode(', ', $fehlt));
    pruefe("$wann: chat_tagesdeckel.json (drei Tage alt) steht noch", is_file($u['daten'] . '/chat_tagesdeckel.json'));
}

function pruefeUnberuehrt(array $u, array $soll, string $wann): void {
    $erwartet = array_merge($soll['weg'], $soll['bleibt'], $soll['zeilenWeg'], $soll['zeilenBleibt']);
    $da = nochDa($u, array_merge($soll['weg'], $soll['bleibt']), array_merge($soll['zeilenWeg'], $soll['zeilenBleibt']));
    $fehlt = array_values(array_diff($erwartet, $da));
    pruefe("$wann: nichts ist gelöscht (" . count($erwartet) . ' Dateien und Messzeilen)', $fehlt === [], 'fehlt: ' . implode(', ', $fehlt));
}

// ─── Marke und Eingriffe in die Kopie ───────────────────────────────────────

function marke(array $u): ?array {
    $datei = $u['daten'] . '/bereinigung_lauf.json';
    if (!is_file($datei)) {
        return null;
    }
    $stand = json_decode((string)file_get_contents($datei), true);
    return is_array($stand) ? $stand : null;
}

function setzeMarke(array $u, array $stand): void {
    file_put_contents($u['daten'] . '/bereinigung_lauf.json', json_encode($stand));
}

function markeIst(array $u, string $ergebnis, int $versuche): bool {
    $m = marke($u);
    return $m !== null && ($m['tag'] ?? null) === heute() && ($m['ergebnis'] ?? null) === $ergebnis
        && ($m['versuche'] ?? null) === $versuche;
}

function markeText(array $u): string {
    return 'Marke: ' . (is_file($u['daten'] . '/bereinigung_lauf.json')
        ? (string)file_get_contents($u['daten'] . '/bereinigung_lauf.json') : 'fehlt');
}

/** Wartet, bis die Marke heute eines der Ergebnisse trägt. Ohne Anstoß im Prüfling gibt es nichts zu warten. */
function warte(array $u, array $ergebnisse, float $sekunden = 6.0): void {
    global $hatAnstoss;
    if (!$hatAnstoss) {
        return;
    }
    $ende = microtime(true) + $sekunden;
    do {
        $m = marke($u);
        if ($m !== null && ($m['tag'] ?? null) === heute() && in_array($m['ergebnis'] ?? null, $ergebnisse, true)) {
            return;
        }
        usleep(50000);
    } while (microtime(true) < $ende);
}

/** Setzt Code an den Anfang einer PHP-Datei der Kopie. */
function vorneEin(array $u, string $datei, string $code): bool {
    $pfad = $u['api'] . '/' . $datei;
    $quelle = is_file($pfad) ? (string)file_get_contents($pfad) : '';
    if (strncmp($quelle, "<?php\n", 6) !== 0) {
        return false;
    }
    return file_put_contents($pfad, "<?php\n" . $code . "\n" . substr($quelle, 6)) !== false;
}

function ereignis(): string {
    return json_encode(['events' => [[
        'event' => 'page_view', 'session_id' => 'probe-sitzung', 'visitor_id' => 'probe-besucher',
        'url' => '/probe', 'ts' => gmdate('c'),
    ]]]);
}

function wieSonst(array $a, string $basis): bool {
    return $a['status'] === 200 && normal($a['text']) === $basis;
}

// ─── Vorbedingungen ─────────────────────────────────────────────────────────
echo "Prüfling: $apiQuelle\n";
echo 'PHP ' . PHP_VERSION . ', ' . gmdate('Y-m-d H:i:s') . " UTC\n";
echo 'Anstoß im Prüfling: ' . ($hatAnstoss ? 'bereinigung-anstoss.php vorhanden' : 'fehlt')
    . ', Regel chat_adresstag (PR #238): ' . ($hatAdressRegel ? 'vorhanden' : 'fehlt') . "\n";

if (function_exists('net_get_interfaces')) {
    $fremd = [];
    foreach ((array)net_get_interfaces() as $name => $s) {
        $istLoopback = $name === 'lo' || stripos($name, 'loopback') !== false;
        if (!$istLoopback && !empty($s['up'])) {
            $fremd[] = $name;
        }
    }
    if ($ohneNetzPflicht) {
        pruefe('Netz nach außen ist zu: außer Loopback keine aktive Schnittstelle', $fremd === [], implode(',', $fremd));
    } else {
        echo 'HINWEIS Netzschnittstellen außer Loopback: ' . ($fremd === [] ? 'keine' : implode(',', $fremd)) . "\n";
    }
} elseif ($ohneNetzPflicht) {
    pruefe('Netz nach außen ist zu', false, 'net_get_interfaces fehlt, nicht messbar');
}

// Vergleichsantwort: derselbe Stand, aber die Marke sagt "heute schon geräumt".
$u = starte($apiQuelle) ?? exit(2);
if (!schema($u)) {
    fwrite(STDERR, "Datenbank ließ sich mit db.php des Prüflings nicht anlegen\n");
    exit(2);
}
setzeMarke($u, ['tag' => heute(), 'versuche' => 1, 'zeit' => time(), 'ergebnis' => 'ok', 'geloescht' => 0]);
$a = anfrage($u, 'GET', '/health.php');
$basis = normal($a['text']);
$dauerBasis = $a['dauer'];
pruefe('Vergleichsantwort von health.php: 200 mit "status": "ok" und "database": "ok"',
    $a['status'] === 200 && strpos($a['text'], '"status": "ok"') !== false && strpos($a['text'], '"database": "ok"') !== false, kurz($a));
stoppe($u);
echo "\n";

// ─── A: erster Abruf von health.php räumt ───────────────────────────────────
echo "A  erster Abruf von health.php räumt Fälliges und lässt Junges stehen\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler']);
pruefe('health.php antwortet 200 und Wort für Wort wie ohne fälligen Lauf (bis auf timestamp)', wieSonst($a, $basis), kurz($a));
printf("HINWEIS Dauer des Abrufs mit Lauf %.0f ms, ohne Lauf %.0f ms (php -S kann die Antwort nicht vorab abschließen, siehe Fall H)\n",
    $a['dauer'] * 1000, $dauerBasis * 1000);
pruefeGeraeumt($u, $soll, 'nach dem ersten Abruf');
$m = marke($u);
pruefe('Marke data/bereinigung_lauf.json: heute, ok, 1 Versuch, 2 gelöschte Messzeilen',
    markeIst($u, 'ok', 1) && ($m['geloescht'] ?? null) === 2, markeText($u));
$letzter = konfig($u, 'last_cleanup');
pruefe('last_cleanup in der Datenbank trägt das heutige Datum (' . heute() . ')',
    $letzter !== null && strncmp($letzter, heute(), 10) === 0, (string)$letzter);
pruefe('last_cleanup_count ist 2', konfig($u, 'last_cleanup_count') === '2', (string)konfig($u, 'last_cleanup_count'));
$c = anfrage($u, 'GET', '/analytics-config.php');
pruefe('GET analytics-config.php ohne Anmeldung zeigt last_cleanup von heute (so wird nach dem Deploy gemessen)',
    $c['status'] === 200 && strncmp((string)($c['json']['last_cleanup'] ?? ''), heute(), 10) === 0, kurz($c));

// ─── B: zweiter Abruf am selben Tag ─────────────────────────────────────────
echo "\nB  zweiter Abruf am selben Tag räumt nicht noch einmal\n";
$p = db($u);
$c1 = md5('198.51.100.9');
$nachgelegt = [
    'weg' => [datei($u, "rate_limit_$c1.json", 7200), datei($u, "geocache/$c1.json", 8 * TAG)],
    'bleibt' => [],
    'zeilenWeg' => [zeile($p, 'page_view', 'alt-seite-500-tage', 500 * TAG), zeile($p, 'heartbeat', 'alt-herzschlag-5-tage', 5 * TAG)],
    'zeilenBleibt' => [],
];
$p = null;
sleep(2); // ein zweiter Lauf schriebe jetzt ein anderes last_cleanup
$b = anfrage($u, 'GET', '/health.php');
usleep(300000);
pruefe('health.php antwortet wie zuvor', wieSonst($b, $basis), kurz($b));
pruefeUnberuehrt($u, $nachgelegt, 'neu hingelegtes Altes nach dem zweiten Abruf');
pruefe('last_cleanup ist unverändert', $letzter !== null && konfig($u, 'last_cleanup') === $letzter,
    $letzter . ' / ' . konfig($u, 'last_cleanup'));
pruefe('Marke unverändert: heute, ok, 1 Versuch', markeIst($u, 'ok', 1), markeText($u));
$k = anfrage($u, 'POST', '/collect.php', ereignis());
usleep(300000);
pruefe('collect.php am selben Tag: ' . LEERE_ANTWORT_COLLECT, $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($k));
pruefeUnberuehrt($u, $nachgelegt, 'neu hingelegtes Altes nach collect.php');

// ─── C: nächster Tag, Anstoß über collect.php ───────────────────────────────
echo "\nC  am nächsten Tag (Marke von gestern) räumt auch collect.php\n";
setzeMarke($u, ['tag' => gmdate('Y-m-d', time() - TAG), 'versuche' => 1, 'zeit' => time() - TAG, 'ergebnis' => 'ok', 'geloescht' => 2]);
$k = anfrage($u, 'POST', '/collect.php', ereignis());
warte($u, ['ok', 'fehler']);
pruefe('collect.php antwortet unverändert ' . LEERE_ANTWORT_COLLECT, $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($k));
$rest = nochDa($u, $nachgelegt['weg'], $nachgelegt['zeilenWeg']);
pruefe('das eben hingelegte Alte ist jetzt gelöscht (2 Dateien, 2 Messzeilen)', $rest === [], 'noch da: ' . implode(', ', $rest));
pruefeGeraeumt($u, $soll, 'nach dem Lauf über collect.php');
pruefe('Marke: wieder heute, ok, 1 Versuch', markeIst($u, 'ok', 1), markeText($u));
$neuer = konfig($u, 'last_cleanup');
pruefe('last_cleanup ist neu geschrieben und von heute',
    $neuer !== null && $neuer !== $letzter && strncmp($neuer, heute(), 10) === 0, $letzter . ' / ' . $neuer);
stoppe($u);

// ─── D: Fehler in der Bereinigung ───────────────────────────────────────────
echo "\nD  ein Fehler in der Bereinigung ändert keine Antwort\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
vorneEin($u, 'analytics-cleanup.php', "if (isset(\$bereinigungIntern)) { throw new \\RuntimeException('Probe: Bereinigung kaputt'); }");
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler']);
pruefe('Bereinigung wirft: health.php antwortet 200 und Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
pruefeUnberuehrt($u, $soll, 'nach dem gescheiterten Lauf');
pruefe('Marke: heute, fehler, 1 Versuch', markeIst($u, 'fehler', 1), markeText($u));
pruefe('der Fehler steht im Protokoll des Servers, nicht in der Antwort',
    strpos((string)file_get_contents($u['log']), 'Probe: Bereinigung kaputt') !== false && strpos($a['text'], 'Probe') === false);
$k = anfrage($u, 'POST', '/collect.php', ereignis());
pruefe('collect.php antwortet unverändert ' . LEERE_ANTWORT_COLLECT, $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($k));
$a = anfrage($u, 'GET', '/health.php');
usleep(300000);
pruefe('sofort danach kein neuer Anlauf (Pause nach Fehlschlag): weiter 1 Versuch', markeIst($u, 'fehler', 1), markeText($u));
$versuche = [];
for ($i = 0; $i < 3; $i++) {
    $m = marke($u) ?? [];
    $m['zeit'] = time() - 601; // Pause abgelaufen
    setzeMarke($u, $m);
    $a = anfrage($u, 'GET', '/health.php');
    usleep(300000);
    $versuche[] = marke($u)['versuche'] ?? null;
}
pruefe('nach abgelaufener Pause zweiter und dritter Anlauf, danach heute keiner mehr: Versuche 2, 3, 3',
    $versuche === [2, 3, 3], json_encode($versuche));
pruefe('health.php antwortet auch beim letzten dieser Abrufe wie sonst', wieSonst($a, $basis), kurz($a));
pruefe('last_cleanup ist nicht geschrieben', konfig($u, 'last_cleanup') === null, (string)konfig($u, 'last_cleanup'));
stoppe($u);

$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
file_put_contents($u['api'] . '/analytics-cleanup.php', KAPUTT);
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler']);
$k = anfrage($u, 'POST', '/collect.php', ereignis());
pruefe('analytics-cleanup.php mit Syntaxfehler: health.php wie sonst, collect.php ' . LEERE_ANTWORT_COLLECT,
    wieSonst($a, $basis) && $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($a) . ' | ' . kurz($k));
pruefe('Marke: heute, fehler, 1 Versuch', markeIst($u, 'fehler', 1), markeText($u));
stoppe($u);

$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
if (is_file($u['api'] . '/bereinigung-anstoss.php')) {
    unlink($u['api'] . '/bereinigung-anstoss.php');
}
$a = anfrage($u, 'GET', '/health.php');
$k = anfrage($u, 'POST', '/collect.php', ereignis());
pruefe('bereinigung-anstoss.php fehlt (halb hochgeladener Stand): health.php wie sonst, collect.php ' . LEERE_ANTWORT_COLLECT,
    wieSonst($a, $basis) && $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($a) . ' | ' . kurz($k));
file_put_contents($u['api'] . '/bereinigung-anstoss.php', KAPUTT);
$a = anfrage($u, 'GET', '/health.php');
$k = anfrage($u, 'POST', '/collect.php', ereignis());
pruefe('bereinigung-anstoss.php mit Syntaxfehler: health.php wie sonst, collect.php ' . LEERE_ANTWORT_COLLECT,
    wieSonst($a, $basis) && $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($a) . ' | ' . kurz($k));
pruefeUnberuehrt($u, $soll, 'ohne lauffähigen Anstoß');
stoppe($u);

// ─── E: Zeitgrenze ──────────────────────────────────────────────────────────
echo "\nE  die Zeitgrenze bricht einen hängenden Lauf ab\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$anstoss = is_file($u['api'] . '/bereinigung-anstoss.php') ? (string)file_get_contents($u['api'] . '/bereinigung-anstoss.php') : '';
$anker = "define('BEREINIGUNG_ZEITGRENZE', 10);";
if (substr_count($anstoss, $anker) !== 1) {
    pruefe('Zeitgrenze steht als ' . $anker . ' in bereinigung-anstoss.php', false, 'Anker nicht genau einmal gefunden');
} else {
    file_put_contents($u['api'] . '/bereinigung-anstoss.php', str_replace($anker, "define('BEREINIGUNG_ZEITGRENZE', 1);", $anstoss));
    vorneEin($u, 'analytics-cleanup.php', 'if (isset($bereinigungIntern)) { while (true) { } }');
    $a = anfrage($u, 'GET', '/health.php', null, [], 15);
    pruefe('Bereinigung hängt in einer Endlosschleife: health.php antwortet 200 und Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
    pruefe(sprintf('PHP bricht den Lauf ab: Zeitgrenze im Test 1 s, Verbindung nach %.1f s frei (Schranke 6 s)', $a['dauer']),
        $a['status'] === 200 && $a['dauer'] < 6.0);
    pruefe('der Abbruch steht im Protokoll des Servers (Maximum execution time)',
        strpos((string)file_get_contents($u['log']), 'Maximum execution time') !== false);
    pruefe('Marke: heute, laeuft, 1 Versuch (kein Erfolg vermerkt)', markeIst($u, 'laeuft', 1), markeText($u));
    $b = anfrage($u, 'GET', '/health.php', null, [], 15);
    pruefe(sprintf('der nächste Abruf antwortet sofort und wie sonst (%.0f ms): Pause greift, der Server lebt', $b['dauer'] * 1000),
        wieSonst($b, $basis) && $b['dauer'] < 1.0, kurz($b));
    pruefeUnberuehrt($u, $soll, 'nach dem abgebrochenen Lauf');
}
stoppe($u);

// ─── F: gleichzeitige Abrufe ────────────────────────────────────────────────
echo "\nF  gleichzeitige Abrufe: genau ein Lauf\n";
if (PHP_OS_FAMILY === 'Windows') {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  php -S hat unter Windows nur einen Arbeiter\n";
} else {
    $u = starte($apiQuelle, 4) ?? exit(2);
    schema($u);
    $soll = fuelle($u);
    // Jeder Lauf hinterlässt eine Zeile und dauert 0,4 s, damit sich die Abrufe sicher überschneiden.
    vorneEin($u, 'analytics-cleanup.php', 'if (isset($bereinigungIntern)) { file_put_contents(dirname(__DIR__) . "/lauf_zaehler.txt", "x\n", FILE_APPEND | LOCK_EX); usleep(400000); }');
    $alle = gleichzeitig($u, '/health.php', 8);
    warte($u, ['ok', 'fehler']);
    usleep(600000);
    $gut = 0;
    foreach ($alle as $a) {
        $gut += wieSonst($a, $basis) ? 1 : 0;
    }
    pruefe('8 gleichzeitige Abrufe bei 4 Arbeitern: alle antworten wie sonst', $gut === 8, "$gut von 8, erster: " . kurz($alle[0]));
    $laeufe = is_file($u['wurzel'] . '/lauf_zaehler.txt') ? count(file($u['wurzel'] . '/lauf_zaehler.txt')) : 0;
    pruefe('die Bereinigung ist genau einmal gelaufen', $laeufe === 1, "$laeufe Läufe");
    pruefe('Marke: heute, ok, 1 Versuch', markeIst($u, 'ok', 1), markeText($u));
    pruefeGeraeumt($u, $soll, 'nach den gleichzeitigen Abrufen');
    stoppe($u);
}

// ─── G: Türen ───────────────────────────────────────────────────────────────
echo "\nG  Türen: ohne Anmeldung 401, der Admin-Knopf wie bisher\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$p = db($u);
$p->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)')
    ->execute(['probe-admin', password_hash('Nur-fuer-diesen-Test-1', PASSWORD_DEFAULT), 'Probe']);
$p = null;
$a = anfrage($u, 'POST', '/analytics-cleanup.php', '{}');
pruefe('POST analytics-cleanup.php ohne Anmeldung: 401 "Nicht autorisiert"', $a['status'] === 401 && $a['fehler'] === 'Nicht autorisiert', kurz($a));
$a = anfrage($u, 'POST', '/analytics-cleanup.php?bereinigungIntern=1', '{"bereinigungIntern":true}', ['Cookie: bereinigungIntern=1']);
pruefe('dasselbe mit bereinigungIntern als Parameter, Feld und Cookie: 401', $a['status'] === 401 && $a['fehler'] === 'Nicht autorisiert', kurz($a));
$a = anfrage($u, 'GET', '/analytics-cleanup.php');
pruefe('GET analytics-cleanup.php: 405', $a['status'] === 405, kurz($a));
$a = anfrage($u, 'POST', '/bereinigung-anstoss.php', '{}');
pruefe('bereinigung-anstoss.php direkt aufgerufen: 404', $a['status'] === 404, kurz($a));
pruefeUnberuehrt($u, $soll, 'nach diesen vier Anfragen');
pruefe('und es gibt keine Marke: kein Lauf wurde angestoßen', marke($u) === null, markeText($u));
$l = anfrage($u, 'POST', '/auth.php?action=login', '{"username":"probe-admin","password":"Nur-fuer-diesen-Test-1"}');
$a = anfrage($u, 'POST', '/analytics-cleanup.php', '{}', ['Cookie: ' . (string)$l['cookie']]);
$felder = is_array($a['json']) ? array_keys($a['json']) : [];
pruefe('angemeldet: POST analytics-cleanup.php antwortet 200 mit deleted, retention_days, cutoff_date, timestamp',
    $l['status'] === 200 && $a['status'] === 200 && $felder === ['deleted', 'retention_days', 'cutoff_date', 'timestamp'],
    kurz($l) . ' | ' . kurz($a));
pruefe('deleted ist 2, retention_days ist 365', ($a['json']['deleted'] ?? null) === 2 && ($a['json']['retention_days'] ?? null) === 365, kurz($a));
pruefeGeraeumt($u, $soll, 'nach dem Admin-Knopf');
$letzter = konfig($u, 'last_cleanup');
pruefe('last_cleanup trägt das heutige Datum', $letzter !== null && strncmp($letzter, heute(), 10) === 0, (string)$letzter);
stoppe($u);

// ─── H: PHP-FPM ─────────────────────────────────────────────────────────────
echo "\nH  unter PHP-FPM ist die Antwort fertig, bevor geräumt ist\n";
$fpm = null;
foreach (['/usr/local/sbin/php-fpm', '/usr/sbin/php-fpm'] as $kandidat) {
    if (is_executable($kandidat)) {
        $fpm = $kandidat;
        break;
    }
}
if ($fpm === null) {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  php-fpm liegt nicht in diesem Abbild (php:8.3-fpm hat es)\n";
} else {
    $u = starteFpm($apiQuelle, $fpm);
    if ($u === null) {
        pruefe('php-fpm startet', false, $fpm);
    } else {
        schema($u);
        $soll = fuelle($u);
        // Der Lauf dauert hier mindestens 1,5 s.
        vorneEin($u, 'analytics-cleanup.php', 'if (isset($bereinigungIntern)) { usleep(1500000); }');
        setzeMarke($u, ['tag' => heute(), 'versuche' => 1, 'zeit' => time(), 'ergebnis' => 'ok', 'geloescht' => 0]);
        $v = fcgi($u, 'health.php');
        $basisFpm = normal($v['text']);
        pruefe('Vergleichsantwort unter FPM: 200 mit "status": "ok"', $v['status'] === 200 && strpos($v['text'], '"status": "ok"') !== false, kurz($v));
        unlink($u['daten'] . '/bereinigung_lauf.json');
        $a = fcgi($u, 'health.php');
        warte($u, ['laeuft', 'ok', 'fehler'], 1.0); // die Marke entsteht erst nach der Antwort
        $gleichDanach = marke($u);
        pruefe('health.php antwortet Wort für Wort wie ohne fälligen Lauf', $a['status'] === 200 && normal($a['text']) === $basisFpm, kurz($a));
        pruefe(sprintf('die Antwort ist nach %.0f ms abgeschlossen, der Lauf dauert mindestens 1500 ms (Schranke 1000 ms)', ($a['dauer'] ?? 99) * 1000),
            $a['dauer'] !== null && $a['dauer'] < 1.0);
        pruefe('in diesem Augenblick läuft die Bereinigung noch (Marke: laeuft)',
            ($gleichDanach['ergebnis'] ?? null) === 'laeuft', json_encode($gleichDanach));
        warte($u, ['ok', 'fehler'], 10.0);
        pruefe('danach Marke: heute, ok, 1 Versuch', markeIst($u, 'ok', 1), markeText($u));
        pruefeGeraeumt($u, $soll, 'nach dem Lauf unter FPM');
        stoppe($u);
    }
}

// ─── Schluss: keine Antwort verrät Fehlertext oder Pfade ────────────────────
echo "\nSchluss\n";
$verraeter = [];
foreach ($antworten as $a) {
    if (preg_match('/Fatal error|Stack trace|Warning:|Notice:|Deprecated:|Uncaught|bereinigung-test-|\.php on line|Probe:/i', $a['text'])) {
        $verraeter[] = $a['url'] . ' ' . kurz($a);
    }
}
pruefe(count($antworten) . ' Antworten geprüft: keine enthält PHP-Fehlertext, Stacktrace oder Dateipfad',
    $verraeter === [], count($verraeter) . ' Treffer, erster: ' . ($verraeter[0] ?? ''));

echo "\nERGEBNIS: $gruen gruen, $rot rot, $uebersprungen uebersprungen\n";
exit($rot === 0 ? 0 : 1);
