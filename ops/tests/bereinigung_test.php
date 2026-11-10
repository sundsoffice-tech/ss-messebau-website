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
 *   I  erst die Zähldateien, dann die Datenbank; last_cleanup und der Erfolg in
 *      der Marke erst, wenn beide Teile durch sind; nicht löschbare Datei zählt
 *   J  große Altlast: Löschen in Portionen über mehrere Anläufe, Fortschritt je Anlauf
 *   K  ein zweiter Schreiber kommt während des Portionslaufs binnen einer Sekunde durch
 *   L  checks.bereinigung in allen Zuständen, "status" bleibt "ok"
 *   M  Abbruch mitten in einem langen Datenbankbefehl (nur unter PHP-FPM)
 *   N  die Grenzen der Regeln gelten in UTC, auch bei Zeitzone Europe/Berlin
 *   O  Abrufe über collect.php während des Portionslaufs: jedes Ereignis ist gespeichert
 *   P  chat.php: ein fremder Commit während des Aufrufs der KI kostet die Antwort nicht
 *      (die KI ist durch eine Datei auf demselben Testserver ersetzt, kein Schlüssel)
 *   Q  Zufluss in collect.php: Zeitstempel im Fenster um die Serverzeit, Gesamtdeckel
 *      je Minute über alle Adressen, Antwort unverändert
 *   R  Sperrfehler nach Fortschritt gilt als teilweise, die Teilsumme bleibt erhalten
 *   S  der Admin-Knopf vermerkt einen vollständigen Lauf in der Marke
 *   T  gescheiterte Dateisperre: kein Lauf, Fehlschlag gezählt, Pause und Obergrenze
 *   U  Zeitstempel im Format des Browsers ("T" und "Z") an den Fristen
 *   V  Anteil je Adresse am Gesamtdeckel: eine Adresse füllt ihn nicht mehr allein,
 *      ein zweiter Besucher wird weiter gezählt; die Zähldatei je Adresse trägt
 *      keine Adresse und fällt unter die Bereinigung
 *   W  Größe je Ereignis: zu großes "props" wird leer gespeichert und gezählt
 *   X  Zählerausfall: 503, health.php "statistik": "zaehler", Heilung; "deckel"
 *      erst nach fünf Minuten am Stück; Zahlen des Tages in analytics-status.php
 *   Y  Auswertung: der letzte Tag des Zeitraums zählt mit, Absprung ist eine
 *      Sitzung mit genau einem Seitenaufruf
 *   Z  Sitzungen und Anfragen je Quelle über den Sitzungsstart
 *
 * Gegen den Stand von main vom 10.11.2026 (375ba93) ist der Test an den Fällen
 * O, P, Q, R und S rot. T und U sind dort grün: Sie belegen Verhalten, das es
 * schon gab und das bisher keinen Zeugen hatte. Gegen main f04e50c (mit PR #251)
 * sind A bis U grün bis auf die Stellen in Q, die den Anteil je Adresse und die
 * Antwort 503 verlangen, und V bis Z sind rot.
 *
 * Umgebung: BEREINIGUNG_OHNE_GROSS=1 lässt Fall M aus (seine Datenbank wird
 * rund 600 MB groß). Jeder Fall räumt sein Verzeichnis unter dem
 * Temp-Ordner nach dem Stoppen des Servers wieder weg.
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

/**
 * Frische Kopie des API-Ordners samt eigenem Server (php -S).
 * $mitCurl lässt curl im Server zu; nur Fall P braucht das, und dort zeigt die
 * einzige Adresse, die chat.php aufruft, auf diesen Testserver selbst.
 */
function starte(string $apiQuelle, int $arbeiter = 1, array $zusatzIni = [], bool $mitCurl = false): ?array {
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
        // Das Abbild php:8.3-cli hat keine php.ini und damit log_errors=0; ohne
        // diese Zeile stünde der Abbruch an der Zeitgrenze (Fall E) nirgends.
        '-d', 'log_errors=1',
        '-d', 'session.save_path=' . $wurzel . '/sitzungen',
    ];
    if (!$mitCurl) {
        array_push($befehl, '-d', 'disable_functions=curl_init,curl_exec,curl_multi_exec');
    }
    foreach ($zusatzIni as $ini) {
        $befehl[] = '-d';
        $befehl[] = $ini;
    }
    array_push($befehl, '-S', '127.0.0.1:' . $port, '-t', $wurzel . '/api');
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
        . "catch_workers_output = yes\nphp_flag[display_errors] = on\nphp_flag[log_errors] = on\nphp_value[error_reporting] = -1\n"
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
    raeumeWeg($u['wurzel']);
}

/**
 * Entfernt das Verzeichnis eines Falls wieder, damit die Datenbanken der Fälle
 * (bis zu 150.000 Zeilen) sich nicht aufaddieren. Fasst nur an, was dieser
 * Test selbst unter dem Temp-Ordner angelegt hat.
 */
function raeumeWeg(string $pfad): void {
    $vorsatz = sys_get_temp_dir() . '/bereinigung-test-';
    if (strncmp($pfad, $vorsatz, strlen($vorsatz)) !== 0 || !is_dir($pfad) || is_link($pfad)) {
        return;
    }
    foreach (scandir($pfad) ?: [] as $eintrag) {
        if ($eintrag === '.' || $eintrag === '..') {
            continue;
        }
        $ziel = $pfad . '/' . $eintrag;
        if (is_dir($ziel) && !is_link($ziel)) {
            raeumeWeg($ziel);
        } else {
            @unlink($ziel);
        }
    }
    @rmdir($pfad);
}

/** Zeitstempel so, wie der Browser ihn schickt (toISOString). */
function browserZeit(int $zeit): string {
    return gmdate('Y-m-d\TH:i:s', $zeit) . '.000Z';
}

/** Messzeilen eines Besuchers: session_id => ts. */
function zeilenVon(array $u, string $besucher): array {
    $s = db($u)->prepare('SELECT session_id, ts FROM analytics_events WHERE visitor_id = ? ORDER BY id');
    $s->execute([$besucher]);
    return $s->fetchAll(PDO::FETCH_KEY_PAIR);
}

/** Körper für collect.php: $anzahl Seitenaufrufe eines Besuchers mit der Zeit von jetzt. */
function stapel(string $besucher, string $vorsatz, int $anzahl): string {
    $ereignisse = [];
    for ($j = 0; $j < $anzahl; $j++) {
        $ereignisse[] = ['event' => 'page_view', 'session_id' => $vorsatz . '-' . $j, 'visitor_id' => $besucher,
            'url' => '/probe', 'ts' => browserZeit(time())];
    }
    return json_encode(['events' => $ereignisse]);
}

function protokollZahl(array $u, string $text): int {
    return substr_count((string)@file_get_contents($u['log']), $text);
}

/** Startet einen Abruf von health.php, ohne auf sein Ende zu warten, und wartet, bis die Marke "laeuft" zeigt. */
function starteLauf(array $u): array {
    global $hatAnstoss;
    $url = $u['basis'] . '/health.php';
    $ch = curlGriff($url, 'GET', null, [], 40);
    $mh = curl_multi_init();
    curl_multi_add_handle($mh, $ch);
    $ende = microtime(true) + 5;
    do {
        curl_multi_exec($mh, $laeuft);
        usleep(5000);
    } while (((marke($u) ?? [])['ergebnis'] ?? null) !== 'laeuft' && microtime(true) < $ende && $hatAnstoss);
    return ['mh' => $mh, 'ch' => $ch, 'url' => $url];
}

/** Wartet das Ende des mit starteLauf() begonnenen Abrufs ab und gibt seine Antwort zurück. */
function beendeLauf(array $lauf): array {
    do {
        curl_multi_exec($lauf['mh'], $laeuft);
        if ($laeuft) {
            curl_multi_select($lauf['mh'], 0.5);
        }
    } while ($laeuft);
    $a = lies($lauf['ch'], curl_multi_getcontent($lauf['ch']), $lauf['url']);
    curl_multi_remove_handle($lauf['mh'], $lauf['ch']);
    curl_multi_close($lauf['mh']);
    return $a;
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

/**
 * Wie anfrage(), aber von einer anderen Absenderadresse aus dem Netz 127.0.0.0/8
 * (unter Linux gehört das ganze Netz zur Schleife): Der Prüfling sieht sie als
 * REMOTE_ADDR. Nie mit session_start benutzen: Die Ortung in collect.php lässt
 * nur 127.0.0.1 aus und ginge für jede andere Adresse nach außen.
 */
function anfrageVon(array $u, string $adresse, string $methode, string $pfad, ?string $koerper = null): array {
    $url = $u['basis'] . $pfad;
    $ch = curlGriff($url, $methode, $koerper, []);
    curl_setopt($ch, CURLOPT_INTERFACE, $adresse);
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
        // Zähler des Gesamtdeckels von collect.php: passt in kein Muster und bleibt.
        datei($u, 'collect_gesamt.json', 3 * TAG, '{"tag":"2000-01-01","angenommen_tag":5,"verworfen_tag":0}'),
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

/** Wie wieSonst, nur dass checks.bereinigung "ueberfaellig" zeigt; alles andere Wort für Wort gleich. */
function wieSonstUeberfaellig(array $a, string $basis): bool {
    return $a['status'] === 200
        && normal($a['text']) === str_replace('"bereinigung": "ok"', '"bereinigung": "ueberfaellig"', $basis);
}

/** Ersetzt in einer Datei der Kopie eine Stelle, die genau einmal vorkommen muss. */
function ersetzeAnker(array $u, string $datei, string $anker, string $neu): bool {
    $pfad = $u['api'] . '/' . $datei;
    $quelle = is_file($pfad) ? (string)file_get_contents($pfad) : '';
    if (substr_count($quelle, $anker) !== 1) {
        return false;
    }
    return file_put_contents($pfad, str_replace($anker, $neu, $quelle)) !== false;
}

/** Setzt mehrere Anker; meldet den ersten, der fehlt, als rote Prüfung. */
function ersetzeAlle(array $u, array $stellen): bool {
    foreach ($stellen as [$datei, $anker, $neu]) {
        if (!ersetzeAnker($u, $datei, $anker, $neu)) {
            pruefe("Anker steht genau einmal in $datei: $anker", false, 'nicht gefunden, dieser Fall wird nicht gefahren');
            return false;
        }
    }
    return true;
}

/** Altlast: $anzahl Herzschlag-Zeilen, drei Tage alt, im Format des Browsers. */
function altlast(array $u, int $anzahl): void {
    $p = db($u);
    // Die Zahl steht als Zahl im Befehl und nicht als Platzhalter: PDO bindet
    // Platzhalter als Text, und "i < '30000'" ist in SQLite für jede Zahl wahr.
    // Die Rekursion endete dann nie (gemessen 10.11.2026: 16 GB in sechs Minuten).
    $s = $p->prepare('WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < ' . $anzahl . ")
        INSERT INTO analytics_events (event, ts, session_id, visitor_id, url)
        SELECT 'heartbeat', :ts, 'altlast-' || i, 'altlast', '/probe' FROM n");
    $s->execute([':ts' => gmdate('Y-m-d\TH:i:s', time() - 3 * TAG) . '.000Z']);
}

function altlastRest(array $u): int {
    return (int)db($u)->query("SELECT COUNT(*) FROM analytics_events WHERE visitor_id = 'altlast'")->fetchColumn();
}

/** Messzeile mit frei gewähltem Zeitstempel (Fall N). */
function zeileRoh(PDO $p, string $ereignis, string $marke, string $ts): string {
    $p->prepare('INSERT INTO analytics_events (event, ts, session_id, visitor_id, url) VALUES (?, ?, ?, ?, ?)')
        ->execute([$ereignis, $ts, $marke, 'probe', '/probe']);
    return $marke;
}

/** Wartet, bis niemand mehr die Sperre auf der Marke hält (der Lauf ist zu Ende oder sein Prozess ist tot). */
function warteSperreFrei(array $u, float $sekunden): bool {
    $datei = $u['daten'] . '/bereinigung_lauf.json';
    $ende = microtime(true) + $sekunden;
    do {
        if (is_file($datei) && filesize($datei) > 0) {
            $fp = fopen($datei, 'r');
            $frei = $fp && flock($fp, LOCK_EX | LOCK_NB);
            if ($frei) {
                flock($fp, LOCK_UN);
            }
            if ($fp) {
                fclose($fp);
            }
            if ($frei) {
                return true;
            }
        }
        clearstatcache();
        usleep(100000);
    } while (microtime(true) < $ende);
    return false;
}

/** health.php mit vorgegebener Marke: was zeigt checks.bereinigung, und bleibt der Rest wie sonst? */
function zustandMit(array $u, ?array $stand): array {
    if ($stand === null) {
        @unlink($u['daten'] . '/bereinigung_lauf.json');
    } else {
        setzeMarke($u, $stand);
    }
    $a = anfrage($u, 'GET', '/health.php');
    return [
        'bereinigung' => $a['json']['checks']['bereinigung'] ?? null,
        'status' => $a['json']['status'] ?? null,
        'datenbank' => $a['json']['checks']['database'] ?? null,
        'http' => $a['status'],
        'antwort' => $a,
    ];
}

function zustandIst(array $z, string $soll): bool {
    return $z['bereinigung'] === $soll && $z['status'] === 'ok' && $z['datenbank'] === 'ok' && $z['http'] === 200;
}

function zustandText(array $z): string {
    return 'bereinigung=' . json_encode($z['bereinigung']) . ' status=' . json_encode($z['status']) . ' HTTP ' . $z['http'];
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
pruefe('Marke nennt die gelöschten Dateien (' . count($soll['weg']) . '), keine nicht löschbare, keinen Rest, und den vollständigen Erfolg von heute',
    ($m['dateien'] ?? null) === count($soll['weg']) && ($m['dateien_fehler'] ?? null) === 0 && ($m['rest'] ?? null) === false
        && ($m['erfolg_tag'] ?? null) === heute() && is_int($m['erfolg_zeit'] ?? null) && abs($m['erfolg_zeit'] - time()) < 60,
    markeText($u));
pruefe('health.php zeigte dabei "bereinigung": "ok" (frisch, noch keine Marke) und "status": "ok"',
    ($a['json']['checks']['bereinigung'] ?? null) === 'ok' && ($a['json']['status'] ?? null) === 'ok', kurz($a));
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
// Ohne lauffähigen Anstoß kann nicht geräumt werden: checks.bereinigung zeigt
// dann "ueberfaellig", alles andere bleibt Wort für Wort gleich ("status": "ok", 200).
pruefe('bereinigung-anstoss.php fehlt (halb hochgeladener Stand): health.php wie sonst bis auf "bereinigung": "ueberfaellig", collect.php ' . LEERE_ANTWORT_COLLECT,
    wieSonstUeberfaellig($a, $basis) && $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($a) . ' | ' . kurz($k));
file_put_contents($u['api'] . '/bereinigung-anstoss.php', KAPUTT);
$a = anfrage($u, 'GET', '/health.php');
$k = anfrage($u, 'POST', '/collect.php', ereignis());
pruefe('bereinigung-anstoss.php mit Syntaxfehler: health.php wie sonst bis auf "bereinigung": "ueberfaellig", collect.php ' . LEERE_ANTWORT_COLLECT,
    wieSonstUeberfaellig($a, $basis) && $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT, kurz($a) . ' | ' . kurz($k));
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
        strpos((string)file_get_contents($u['log']), 'Maximum execution time') !== false,
        'Ende des Protokolls: ' . str_replace("\n", ' | ', substr((string)file_get_contents($u['log']), -500)));
    pruefe('Marke: heute, laeuft, 1 Versuch (kein Erfolg vermerkt)', markeIst($u, 'laeuft', 1), markeText($u));
    $b = anfrage($u, 'GET', '/health.php', null, [], 15);
    pruefe(sprintf('der nächste Abruf antwortet sofort und wie sonst (%.0f ms): Pause greift, der Server lebt', $b['dauer'] * 1000),
        wieSonst($b, $basis) && $b['dauer'] < 1.0, kurz($b));
    pruefeUnberuehrt($u, $soll, 'nach dem abgebrochenen Lauf');

    // Der nächste Anlauf nach der Pause findet "laeuft" bei freier Sperre: Das
    // ist ein abgebrochener Lauf, kein laufender. Er wird gezählt, dann wird geräumt.
    copy($apiQuelle . '/analytics-cleanup.php', $u['api'] . '/analytics-cleanup.php');
    $m = marke($u) ?? [];
    $m['zeit'] = time() - 601;
    setzeMarke($u, $m);
    $c = anfrage($u, 'GET', '/health.php', null, [], 15);
    warte($u, ['ok', 'fehler', 'teilweise']);
    $m = marke($u) ?? [];
    pruefe('nach der Pause: der abgebrochene Lauf ist erkannt und gezählt (abbrueche 1, fehlschlaege 1), der neue Anlauf ist Versuch 2 und endet ok',
        markeIst($u, 'ok', 2) && ($m['abbrueche'] ?? null) === 1 && ($m['fehlschlaege'] ?? null) === 1, markeText($u));
    pruefe('der Abbruch steht als Zeile "Bereinigung: … endete ohne Abschluss" im Protokoll',
        strpos((string)file_get_contents($u['log']), 'endete ohne Abschluss') !== false);
    pruefeGeraeumt($u, $soll, 'nach dem Anlauf, der den Abbruch erkannt hat');
    // Dritter Abbruch des Tages: Obergrenze erreicht, es wird nicht mehr gelaufen.
    setzeMarke($u, ['tag' => heute(), 'versuche' => 3, 'fehlschlaege' => 2, 'abbrueche' => 2, 'zeit' => time() - 601,
        'ergebnis' => 'laeuft', 'seit' => time() - 3600]);
    $c = anfrage($u, 'GET', '/health.php', null, [], 15);
    usleep(300000);
    $m = marke($u) ?? [];
    pruefe('steht die Marke nach zwei Fehlschlägen wieder auf laeuft: dritter Fehlschlag gezählt, Marke fehler, kein vierter Lauf (Versuche 3, fehlschlaege 3, abbrueche 3)',
        markeIst($u, 'fehler', 3) && ($m['fehlschlaege'] ?? null) === 3 && ($m['abbrueche'] ?? null) === 3, markeText($u));
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

// ─── I: Reihenfolge und Zeuge ───────────────────────────────────────────────
echo "\nI  erst die Zähldateien, dann die Datenbank; Erfolg erst, wenn beide Teile durch sind\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
if (ersetzeAlle($u, [['analytics-cleanup.php', "    \$datenbankTeil();\n", "    throw new \\RuntimeException('Probe: Datenbank kaputt');\n"]])) {
    $a = anfrage($u, 'GET', '/health.php');
    warte($u, ['ok', 'fehler', 'teilweise']);
    $m = marke($u) ?? [];
    pruefe('Datenbankteil wirft: health.php antwortet 200 und Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
    $rest = nochDa($u, $soll['weg'], []);
    pruefe('die fälligen Dateien sind trotzdem gelöscht (' . count($soll['weg']) . '): der Dateiteil läuft vor der Datenbank',
        $rest === [], 'noch da: ' . implode(', ', $rest));
    pruefe('die fälligen Messzeilen stehen noch (' . count($soll['zeilenWeg']) . ')',
        count(nochDa($u, [], $soll['zeilenWeg'])) === count($soll['zeilenWeg']));
    pruefe('Marke: heute, fehler, 1 Versuch, 1 Fehlschlag, ' . count($soll['weg']) . ' gelöschte Dateien, kein Erfolg vermerkt',
        markeIst($u, 'fehler', 1) && ($m['fehlschlaege'] ?? null) === 1 && ($m['dateien'] ?? null) === count($soll['weg'])
            && !array_key_exists('erfolg_zeit', $m), markeText($u));
    pruefe('last_cleanup ist nicht geschrieben', konfig($u, 'last_cleanup') === null, (string)konfig($u, 'last_cleanup'));
    pruefe('der Fehler steht im Protokoll des Servers', strpos((string)file_get_contents($u['log']), 'Probe: Datenbank kaputt') !== false);
}
stoppe($u);

$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
// Eine "Datei", die ins Muster passt, alt ist und sich nicht löschen lässt:
// ein Verzeichnis mit Inhalt (unlink scheitert daran auch als root).
$sperrig = $u['daten'] . '/rate_limit_nichtloeschbar.json';
mkdir($sperrig);
file_put_contents($sperrig . '/inhalt', 'x');
touch($sperrig, time() - 7200);
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
$m = marke($u) ?? [];
pruefe('eine Datei lässt sich nicht löschen: health.php antwortet 200 und Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
pruefe('Marke: der Lauf gilt nicht als ok, sondern als fehler, mit dateien_fehler 1 und ohne Erfolg',
    markeIst($u, 'fehler', 1) && ($m['dateien_fehler'] ?? null) === 1 && !array_key_exists('erfolg_zeit', $m), markeText($u));
pruefe('die löschbaren Dateien (' . count($soll['weg']) . ') und die 2 fälligen Messzeilen sind dabei gelöscht',
    nochDa($u, $soll['weg'], $soll['zeilenWeg']) === [] && ($m['dateien'] ?? null) === count($soll['weg']) && ($m['geloescht'] ?? null) === 2,
    markeText($u));
pruefe('last_cleanup ist nicht geschrieben: kein stiller Erfolg', konfig($u, 'last_cleanup') === null, (string)konfig($u, 'last_cleanup'));
pruefe('die Zeile "ließen sich nicht löschen" steht im Protokoll',
    strpos((string)file_get_contents($u['log']), 'ließen sich nicht löschen') !== false);
unlink($sperrig . '/inhalt');
rmdir($sperrig);
$m['zeit'] = time() - 601;
setzeMarke($u, $m);
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok']);
$m = marke($u) ?? [];
$letzter = konfig($u, 'last_cleanup');
pruefe('Hindernis weg, nächster Anlauf nach der Pause: Marke ok, Versuch 2, Erfolg von heute, last_cleanup von heute',
    markeIst($u, 'ok', 2) && ($m['erfolg_tag'] ?? null) === heute() && $letzter !== null && strncmp($letzter, heute(), 10) === 0,
    markeText($u) . ' / ' . $letzter);
pruefe('last_cleanup_count nennt die Summe seit dem letzten vollständigen Lauf (2 aus dem ersten Anlauf, 0 aus dem zweiten)',
    konfig($u, 'last_cleanup_count') === '2', (string)konfig($u, 'last_cleanup_count'));
stoppe($u);

// ─── J: große Altlast in Portionen ──────────────────────────────────────────
echo "\nJ  große Altlast: Löschen in Portionen über mehrere Anläufe\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$altlastZeilen = 30000;
altlast($u, $altlastZeilen);
// Budget im Test 300 ms statt 3000 ms, damit ein Anlauf sicher nicht reicht.
if (ersetzeAlle($u, [['bereinigung-anstoss.php', "define('BEREINIGUNG_BUDGET_MS', 3000);", "define('BEREINIGUNG_BUDGET_MS', 300);"]])) {
    $verlauf = [];
    $ersteAntwort = null;
    $nachErstem = null;
    for ($i = 1; $i <= 80; $i++) {
        $a = anfrage($u, 'GET', '/health.php');
        warte($u, ['ok', 'fehler', 'teilweise']);
        $m = marke($u) ?? [];
        $verlauf[] = ['rest' => altlastRest($u), 'ergebnis' => $m['ergebnis'] ?? null, 'geloescht' => $m['geloescht'] ?? null,
            'dauer' => $m['dauer_ms'] ?? null, 'portion' => $m['laengste_portion_ms'] ?? null, 'versuche' => $m['versuche'] ?? null];
        if ($i === 1) {
            $ersteAntwort = $a;
            $nachErstem = ['marke' => $m, 'dateien' => nochDa($u, $soll['weg'], []), 'last_cleanup' => konfig($u, 'last_cleanup')];
        }
        if (($m['ergebnis'] ?? null) !== 'teilweise') {
            break;
        }
        $m['zeit'] = time() - 61; // Pause nach einem Teillauf (60 s) abgelaufen
        setzeMarke($u, $m);
    }
    $reste = array_column($verlauf, 'rest');
    echo 'HINWEIS Rest der Altlast nach jedem Anlauf: ' . implode(', ', $reste) . "\n";
    echo 'HINWEIS Dauer je Anlauf in ms: ' . implode(', ', array_column($verlauf, 'dauer'))
        . '; längste Portion je Anlauf in ms: ' . implode(', ', array_column($verlauf, 'portion')) . "\n";
    pruefe("erster Anlauf bei $altlastZeilen fälligen Zeilen und 300 ms Budget: Marke teilweise mit Rest, kein Fehler",
        ($nachErstem['marke']['ergebnis'] ?? null) === 'teilweise' && ($nachErstem['marke']['rest'] ?? null) === true
            && ($nachErstem['marke']['fehlschlaege'] ?? null) === 0, json_encode($nachErstem['marke'] ?? null));
    pruefe('die Dateien sind schon nach dem ersten Anlauf gelöscht, obwohl die Datenbank nicht fertig ist',
        ($nachErstem['dateien'] ?? ['?']) === [], 'noch da: ' . implode(', ', $nachErstem['dateien'] ?? []));
    pruefe('last_cleanup ist nach dem ersten Anlauf nicht geschrieben, kein Erfolg in der Marke',
        is_array($nachErstem) && $nachErstem['last_cleanup'] === null && !array_key_exists('erfolg_zeit', $nachErstem['marke']),
        json_encode($nachErstem));
    pruefe('health.php antwortete dabei Wort für Wort wie sonst ("status": "ok", "bereinigung": "ok")',
        $ersteAntwort !== null && wieSonst($ersteAntwort, $basis), $ersteAntwort !== null ? kurz($ersteAntwort) : '');
    $faellt = count($reste) >= 2;
    for ($i = 1; $i < count($reste); $i++) {
        $faellt = $faellt && $reste[$i] < $reste[$i - 1];
    }
    pruefe('jeder Anlauf macht Fortschritt: der Rest fällt von Anlauf zu Anlauf und der erste hat schon gelöscht',
        $faellt && $reste[0] < $altlastZeilen && $reste[0] > 0, implode(', ', $reste));
    pruefe('es braucht mindestens 3 Anläufe (das Budget reicht nicht für alles): ' . count($verlauf),
        count($verlauf) >= 3);
    $letzterAnlauf = end($verlauf);
    pruefe('am Ende ist die Altlast ganz abgebaut: Rest 0, Marke ok, Versuche = Zahl der Anläufe',
        $letzterAnlauf['rest'] === 0 && $letzterAnlauf['ergebnis'] === 'ok' && $letzterAnlauf['versuche'] === count($verlauf),
        json_encode($letzterAnlauf));
    $maxDauer = max(array_map('intval', array_column($verlauf, 'dauer')));
    $maxPortion = max(array_map('intval', array_column($verlauf, 'portion')));
    pruefe("kein Anlauf überzieht das Budget grob: längster $maxDauer ms bei 300 ms Budget (Schranke 1500 ms, Wanduhr)", $maxDauer < 1500);
    pruefe("keine Portion hält die Schreibsperre lange: längste $maxPortion ms (Schranke 1000 ms)", $maxPortion < 1000);
    pruefeGeraeumt($u, $soll, 'nach dem letzten Anlauf');
    $letzter = konfig($u, 'last_cleanup');
    pruefe('erst jetzt trägt last_cleanup das heutige Datum, last_cleanup_count die Summe aller Anläufe (' . ($altlastZeilen + 2) . ')',
        $letzter !== null && strncmp($letzter, heute(), 10) === 0 && konfig($u, 'last_cleanup_count') === (string)($altlastZeilen + 2),
        $letzter . ' / ' . konfig($u, 'last_cleanup_count'));
    pruefe('ein Teillauf steht als "teilweise" im Protokoll, nicht als gescheitert',
        strpos((string)file_get_contents($u['log']), ' teilweise: ') !== false && strpos((string)file_get_contents($u['log']), 'gescheitert') === false);
}
stoppe($u);

// ─── K: zweiter Schreiber ───────────────────────────────────────────────────
echo "\nK  ein zweiter Schreiber kommt während des Portionslaufs binnen einer Sekunde durch\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
altlast($u, 150000); // mehr, als ein Lauf mit 3 s Budget schafft: der Lauf dauert das ganze Budget
$url = $u['basis'] . '/health.php';
$ch = curlGriff($url, 'GET', null, [], 40);
$mh = curl_multi_init();
curl_multi_add_handle($mh, $ch);
$ende = microtime(true) + 5;
do {
    curl_multi_exec($mh, $laeuft);
    usleep(5000);
} while (((marke($u) ?? [])['ergebnis'] ?? null) !== 'laeuft' && microtime(true) < $ende && $hatAnstoss);
$dauern = ['collect' => [], 'inquiry' => []];
$schreibFehler = [];
for ($i = 0; $i < 400; $i++) {
    curl_multi_exec($mh, $laeuft);
    if (((marke($u) ?? [])['ergebnis'] ?? null) !== 'laeuft') {
        break;
    }
    $art = $i % 2 === 0 ? 'collect' : 'inquiry';
    $t0 = microtime(true);
    try {
        $p = db($u); // eigene Verbindung je Schreiber, wartet höchstens 5 s
        if ($art === 'collect') {
            $p->prepare('INSERT INTO analytics_events (event, ts, session_id, visitor_id, url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, props)
                VALUES (:event, :ts, :session_id, :visitor_id, :url, :referrer, :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :props)')
                ->execute([':event' => 'page_view', ':ts' => gmdate('c'), ':session_id' => 'schreiber-' . $i, ':visitor_id' => 'schreiber',
                    ':url' => '/probe', ':referrer' => '', ':utm_source' => '', ':utm_medium' => '', ':utm_campaign' => '',
                    ':utm_content' => '', ':utm_term' => '', ':props' => null]);
        } else {
            $p->prepare('INSERT INTO inquiries (inquiry_id, type, name, email, company, phone, message, form_data)
                VALUES (:inquiry_id, :type, :name, :email, :company, :phone, :message, :form_data)')
                ->execute([':inquiry_id' => 'schreiber-' . $i, ':type' => 'kontakt', ':name' => 'Probe', ':email' => 'probe@example.invalid',
                    ':company' => '', ':phone' => '', ':message' => 'Probe', ':form_data' => '{}']);
        }
        $p = null;
    } catch (\Throwable $e) {
        $schreibFehler[] = $art . ': ' . $e->getMessage();
    }
    $dauern[$art][] = microtime(true) - $t0;
    usleep(40000);
}
do {
    curl_multi_exec($mh, $laeuft);
    if ($laeuft) {
        curl_multi_select($mh, 0.5);
    }
} while ($laeuft);
$a = lies($ch, curl_multi_getcontent($ch), $url);
curl_multi_remove_handle($mh, $ch);
curl_multi_close($mh);
warte($u, ['ok', 'fehler', 'teilweise']);
$m = marke($u) ?? [];
$alleDauern = array_merge($dauern['collect'], $dauern['inquiry']);
$laengste = $alleDauern === [] ? 99.0 : max($alleDauern);
sort($alleDauern);
$mitte = $alleDauern === [] ? 99.0 : $alleDauern[intdiv(count($alleDauern), 2)];
pruefe('während des Laufs (Marke laeuft) begonnen: mindestens 5 INSERT wie collect.php und 5 wie inquiries.php ('
    . count($dauern['collect']) . ' und ' . count($dauern['inquiry']) . ')',
    count($dauern['collect']) >= 5 && count($dauern['inquiry']) >= 5);
pruefe(sprintf('jeder davon war binnen einer Sekunde durch: längster %.0f ms, mittlerer %.0f ms', $laengste * 1000, $mitte * 1000),
    $laengste < 1.0 && $schreibFehler === [], implode(' | ', array_slice($schreibFehler, 0, 3)));
pruefe('der Lauf hat dabei weitergelöscht und endete teilweise oder ok, ohne Fehlschlag: '
    . ($m['geloescht'] ?? '?') . ' Zeilen in ' . ($m['portionen'] ?? '?') . ' Portionen, ' . ($m['dauer_ms'] ?? '?') . ' ms',
    in_array($m['ergebnis'] ?? null, ['teilweise', 'ok'], true) && ($m['geloescht'] ?? 0) > 0 && ($m['fehlschlaege'] ?? null) === 0, markeText($u));
pruefe('health.php antwortete Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
$geschrieben = (int)db($u)->query("SELECT COUNT(*) FROM analytics_events WHERE visitor_id = 'schreiber'")->fetchColumn();
pruefe('die Zeilen des zweiten Schreibers stehen in der Datenbank (' . $geschrieben . ')', $geschrieben === count($dauern['collect']) && $geschrieben > 0);
stoppe($u);

// ─── L: checks.bereinigung ──────────────────────────────────────────────────
echo "\nL  checks.bereinigung in allen Zuständen, \"status\" bleibt \"ok\"\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$jetzt = time();
$gesperrt = ['tag' => heute(), 'versuche' => 3, 'fehlschlaege' => 3, 'abbrueche' => 0, 'zeit' => $jetzt, 'ergebnis' => 'fehler'];
$teil = ['tag' => heute(), 'versuche' => 5, 'fehlschlaege' => 0, 'abbrueche' => 0, 'zeit' => $jetzt, 'ergebnis' => 'teilweise', 'rest' => true];
$z = zustandMit($u, null);
warte($u, ['ok', 'fehler', 'teilweise']);
pruefe('frisch nach dem Deploy (noch keine Marke): "bereinigung": "ok"', zustandIst($z, 'ok'), zustandText($z));
$z = zustandMit($u, marke($u));
pruefe('nach dem ersten vollständigen Lauf: "ok"', zustandIst($z, 'ok') && (marke($u)['erfolg_tag'] ?? null) === heute(), zustandText($z) . ' ' . markeText($u));
$z = zustandMit($u, $gesperrt + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $jetzt - 3 * TAG, 'erfolg_tag' => gmdate('Y-m-d', $jetzt - 3 * TAG)]);
pruefe('letzter vollständiger Lauf vor drei Tagen, seither nur Fehlschläge: "ueberfaellig", dabei "status": "ok", "database": "ok", HTTP 200',
    zustandIst($z, 'ueberfaellig'), zustandText($z));
pruefe('die Antwort ist sonst Wort für Wort dieselbe', wieSonstUeberfaellig($z['antwort'], $basis), kurz($z['antwort']));
$z = zustandMit($u, $gesperrt + ['seit' => $jetzt - 3 * TAG]);
pruefe('noch nie ein vollständiger Lauf, erster Anlauf vor drei Tagen: "ueberfaellig"', zustandIst($z, 'ueberfaellig'), zustandText($z));
$z = zustandMit($u, $gesperrt + ['seit' => $jetzt - TAG]);
pruefe('noch nie ein vollständiger Lauf, erster Anlauf vor einem Tag (erster Tag nach dem Deploy): "ok"', zustandIst($z, 'ok'), zustandText($z));
$z = zustandMit($u, $teil + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $jetzt - TAG, 'erfolg_tag' => gmdate('Y-m-d', $jetzt - TAG)]);
pruefe('teilweise, letzter vollständiger Lauf gestern: "ok"', zustandIst($z, 'ok'), zustandText($z));
$z = zustandMit($u, $teil + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $jetzt - 3 * TAG, 'erfolg_tag' => gmdate('Y-m-d', $jetzt - 3 * TAG)]);
pruefe('teilweise seit drei Tagen ohne vollständigen Lauf: "ueberfaellig", "status" bleibt "ok"', zustandIst($z, 'ueberfaellig'), zustandText($z));
$z = zustandMit($u, ['ergebnis' => 'laeuft'] + $gesperrt + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $jetzt - 3 * TAG]);
pruefe('laeuft, letzter vollständiger Lauf vor drei Tagen: "ueberfaellig"', zustandIst($z, 'ueberfaellig'), zustandText($z));
$z1 = zustandMit($u, $gesperrt + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => time() - 2 * TAG + 120]);
$z2 = zustandMit($u, $gesperrt + ['seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => time() - 2 * TAG - 120]);
pruefe('Schwelle zwei Tage: zwei Minuten davor "ok", zwei Minuten danach "ueberfaellig"',
    zustandIst($z1, 'ok') && zustandIst($z2, 'ueberfaellig'), zustandText($z1) . ' | ' . zustandText($z2));
pruefe('keine dieser Anfragen hat einen Lauf ausgelöst (Marke unverändert gesperrt)', markeIst($u, 'fehler', 3), markeText($u));
// Der letzte vollständige Erfolg übersteht spätere Anläufe: gestern ok, heute Fehlschlag.
$erfolgZeit = $jetzt - TAG;
setzeMarke($u, ['tag' => gmdate('Y-m-d', $erfolgZeit), 'versuche' => 1, 'fehlschlaege' => 0, 'abbrueche' => 0, 'zeit' => $erfolgZeit,
    'ergebnis' => 'ok', 'seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $erfolgZeit, 'erfolg_tag' => gmdate('Y-m-d', $erfolgZeit)]);
vorneEin($u, 'analytics-cleanup.php', "if (isset(\$bereinigungIntern)) { throw new \\RuntimeException('Probe: Bereinigung kaputt'); }");
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
$m = marke($u) ?? [];
pruefe('gestern ok, heute Fehlschlag: die Marke behält Tag und Zeit des letzten vollständigen Erfolgs und den Beginn der Beobachtung',
    markeIst($u, 'fehler', 1) && ($m['erfolg_zeit'] ?? null) === $erfolgZeit && ($m['erfolg_tag'] ?? null) === gmdate('Y-m-d', $erfolgZeit)
        && ($m['seit'] ?? null) === $jetzt - 10 * TAG, markeText($u));
stoppe($u);

// ─── N: Zeitzone ────────────────────────────────────────────────────────────
echo "\nN  die Grenzen der Regeln gelten in UTC, auch bei Zeitzone Europe/Berlin\n";
$u = starte($apiQuelle, 1, ['date.timezone=Europe/Berlin']) ?? exit(2);
schema($u);
$p = db($u);
$p->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('retention_days', '365')");
// Zeitstempel in UTC mit Leerzeichen, damit die halbe Stunde zählt (das Format
// des Browsers mit "T" vergleicht gegen die Grenze nur tagesgenau).
$utc = function (int $alter): string {
    return gmdate('Y-m-d H:i:s', time() - $alter);
};
$tzBleibt = [
    zeileRoh($p, 'heartbeat', 'tz-herzschlag-23h30', $utc(TAG - 1800)),
    zeileRoh($p, 'page_view', 'tz-seite-365-tage-weniger-30-min', $utc(365 * TAG - 1800)),
];
$tzWeg = [
    zeileRoh($p, 'heartbeat', 'tz-herzschlag-24h30', $utc(TAG + 1800)),
    zeileRoh($p, 'page_view', 'tz-seite-365-tage-mehr-30-min', $utc(365 * TAG + 1800)),
];
$p = null;
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
$da = zeilenDa($u);
pruefe('Server in Europe/Berlin: Herzschlag 23,5 h alt und Seitenaufruf 365 Tage weniger 30 Minuten alt (UTC) stehen noch',
    array_values(array_intersect($tzBleibt, $da)) === $tzBleibt, 'da: ' . implode(', ', $da));
pruefe('Herzschlag 24,5 h alt und Seitenaufruf 365 Tage plus 30 Minuten alt sind gelöscht',
    array_intersect($tzWeg, $da) === [] && markeIst($u, 'ok', 1), 'da: ' . implode(', ', $da) . ' ' . markeText($u));
stoppe($u);

// ─── O: Abrufe über collect.php während des Portionslaufs ───────────────────
// Anders als Fall K schreibt hier nicht der Test mit einer frischen Verbindung,
// sondern collect.php selbst, so wie der Browser es aufruft: 50 Ereignisse je
// POST, die Schalter stehen in analytics_config (im Betrieb legt sie das
// Admin-Panel an). Am Stand von main bleibt der Lesebefehl für die Schalter
// offen, und nach der nächsten Portion der Bereinigung scheitert jedes weitere
// INSERT dieses POST sofort: Ereignisse fehlen.
echo "\nO  Abrufe über collect.php während des Portionslaufs: jedes Ereignis ist gespeichert\n";
if (PHP_OS_FAMILY === 'Windows') {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  php -S hat unter Windows nur einen Arbeiter\n";
} else {
    $u = starte($apiQuelle, 4) ?? exit(2);
    schema($u);
    $soll = fuelle($u);
    $p = db($u);
    $p->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('enabled', '1')");
    $p->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('enabled_events', '{\"page_view\":true}')");
    $p = null;
    altlast($u, 150000); // der Lauf dauert sein ganzes Budget von 3 s
    $lauf = starteLauf($u);
    $gesendet = 0;
    $antwortenO = [];
    for ($i = 0; $i < 7; $i++) { // 350 Ereignisse, unter dem Gesamtdeckel
        curl_multi_exec($lauf['mh'], $laeuft);
        if (((marke($u) ?? [])['ergebnis'] ?? null) !== 'laeuft') {
            break;
        }
        // Je POST eine andere Absenderadresse: Von einer Adresse speichert
        // collect.php je Minute nur ihren Anteil am Gesamtdeckel (Fall V).
        $antwortenO[] = anfrageVon($u, '127.0.0.' . (41 + $i % 200), 'POST', '/collect.php', stapel('ueber-collect', 'ueber-collect-' . $i, 50));
        $gesendet += 50;
        usleep(150000);
    }
    $a = beendeLauf($lauf);
    warte($u, ['ok', 'fehler', 'teilweise']);
    $m = marke($u) ?? [];
    $gespeichert = count(zeilenVon($u, 'ueber-collect'));
    $gemeldet = 0;
    $wieImmer = $antwortenO !== [];
    $laengster = 0.0;
    foreach ($antwortenO as $k) {
        $gemeldet += (int)($k['json']['stored'] ?? 0);
        $wieImmer = $wieImmer && $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":50}';
        $laengster = max($laengster, $k['dauer']);
    }
    pruefe('während des Laufs (Marke laeuft) mindestens 3 POST zu je 50 Ereignissen über collect.php geschickt (' . count($antwortenO) . ')',
        count($antwortenO) >= 3);
    pruefe("alle $gesendet Ereignisse stehen in der Datenbank: $gespeichert", $gespeichert === $gesendet && $gesendet > 0,
        ($gesendet - $gespeichert) . ' fehlen');
    pruefe(sprintf('jeder POST antwortete 200 mit {"ok":true,"stored":50} (gemeldet %d von %d, längster POST %.0f ms)', $gemeldet, $gesendet, $laengster * 1000),
        $wieImmer, $antwortenO !== [] ? kurz(end($antwortenO)) : 'kein POST');
    pruefe('der Lauf hat dabei weitergelöscht und endete teilweise oder ok, ohne Fehlschlag: '
        . ($m['geloescht'] ?? '?') . ' Zeilen in ' . ($m['portionen'] ?? '?') . ' Portionen, ' . ($m['dauer_ms'] ?? '?') . ' ms',
        in_array($m['ergebnis'] ?? null, ['teilweise', 'ok'], true) && ($m['geloescht'] ?? 0) > 0 && ($m['fehlschlaege'] ?? null) === 0, markeText($u));
    pruefe('health.php antwortete Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
    pruefe('im Protokoll steht kein "database is locked"', protokollZahl($u, 'database is locked') === 0,
        protokollZahl($u, 'database is locked') . ' Zeilen');
    stoppe($u);
}

// ─── P: chat.php schreibt nach dem Aufruf der KI ────────────────────────────
// Die KI ist durch eine Datei auf demselben Testserver ersetzt: Sie schreibt
// wie ein anderer Besucher in die Datenbank (der fremde Commit, während
// chat.php auf die Antwort wartet) und antwortet in der Form von OpenAI. Kein
// Schlüssel, kein Aufruf nach außen: Die einzige Adresse in chat.php zeigt
// danach auf 127.0.0.1, und ohne den Ersatz der Adresse wird der Fall nicht gefahren.
echo "\nP  chat.php: fremder Commit während des Aufrufs der KI, die Antwort kommt trotzdem an\n";
if (PHP_OS_FAMILY === 'Windows') {
    $uebersprungen++;
    echo "UEBERSPRUNGEN  php -S hat unter Windows nur einen Arbeiter\n";
} else {
    $u = starte($apiQuelle, 3, [], true) ?? exit(2);
    schema($u);
    $p = db($u);
    $p->prepare('INSERT INTO ai_keys (key_id, provider, api_key, status) VALUES (?, ?, ?, ?)')
        ->execute(['probe', 'openai', 'kein-schluessel-nur-test', 'active']);
    $p = null;
    file_put_contents($u['api'] . '/ki_ersatz.php', '<?php
$p = new PDO("sqlite:" . __DIR__ . "/data/database.sqlite", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]);
$p->prepare("INSERT INTO inquiries (inquiry_id, type, name, email, company, phone, message, form_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    ->execute(["ki-ersatz-" . bin2hex(random_bytes(4)), "kontakt", "Probe", "probe@example.invalid", "", "", "Probe", "{}"]);
$p = null;
file_put_contents(dirname(__DIR__) . "/ki_ersatz_aufrufe.txt", "x\n", FILE_APPEND | LOCK_EX);
header("Content-Type: application/json");
echo json_encode(["choices" => [["message" => ["content" => "Antwort vom Ersatz, nicht von der KI"]]]]);
');
    if (ersetzeAlle($u, [['chat.php', "curl_init('https://api.openai.com/v1/chat/completions')", "curl_init('" . $u['basis'] . "/ki_ersatz.php')"]])) {
        pruefe('in der Kopie von chat.php steht keine Adresse von OpenAI mehr',
            strpos((string)file_get_contents($u['api'] . '/chat.php'), 'api.openai.com') === false);
        $a = anfrage($u, 'POST', '/chat.php', json_encode(['message' => 'Frage im Test']));
        $aufrufe = is_file($u['wurzel'] . '/ki_ersatz_aufrufe.txt') ? count(file($u['wurzel'] . '/ki_ersatz_aufrufe.txt')) : 0;
        $p = db($u);
        $fremd = (int)$p->query("SELECT COUNT(*) FROM inquiries WHERE inquiry_id LIKE 'ki-ersatz-%'")->fetchColumn();
        $benutzt = $p->query("SELECT last_used_at FROM ai_keys WHERE key_id = 'probe'")->fetchColumn();
        $p = null;
        pruefe('der Ersatz der KI wurde genau einmal aufgerufen und hat dabei in die Datenbank geschrieben (fremder Commit)',
            $aufrufe === 1 && $fremd === 1, "$aufrufe Aufrufe, $fremd Zeilen");
        pruefe('chat.php antwortet 200 mit success und der Antwort des Ersatzes',
            $a['status'] === 200 && ($a['json']['success'] ?? null) === true
                && ($a['json']['message'] ?? null) === 'Antwort vom Ersatz, nicht von der KI', kurz($a));
        pruefe('last_used_at des Schlüssels ist geschrieben (das UPDATE nach dem Aufruf kam durch)',
            is_string($benutzt) && $benutzt !== '', json_encode($benutzt));
        pruefe('im Protokoll steht kein "database is locked"', protokollZahl($u, 'database is locked') === 0,
            protokollZahl($u, 'database is locked') . ' Zeilen');
    }
    stoppe($u);
}

// ─── Q: Zufluss in collect.php ──────────────────────────────────────────────
echo "\nQ  Zufluss: Zeitstempel im Fenster um die Serverzeit, Gesamtdeckel je Minute, Antwort unverändert\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
db($u)->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('retention_days', '365')");
$jetzt = time();
// marke => [Ereignis, Zeitstempel wie gesendet, bleibt er stehen?]
$zeitFaelle = [
    'ts-herzschlag-3-tage' => ['heartbeat', browserZeit($jetzt - 3 * TAG), false],
    'ts-seite-2-jahre' => ['page_view', browserZeit($jetzt - 730 * TAG), false],
    'ts-zukunft-2-tage' => ['page_view', browserZeit($jetzt + 2 * TAG), false],
    'ts-zukunft-10-jahre' => ['page_view', browserZeit($jetzt + 3650 * TAG), false],
    'ts-text-now' => ['page_view', 'now', false],
    'ts-text-datum' => ['heartbeat', '1 January 2020', false],
    'ts-stunde-24' => ['page_view', gmdate('Y-m-d', $jetzt - TAG) . 'T24:00:00.000Z', false],
    'ts-leerzeichen' => ['page_view', gmdate('Y-m-d H:i:s', $jetzt - 60), false],
    'ts-vor-1-stunde' => ['page_view', browserZeit($jetzt - 3600), true],
    'ts-herzschlag-vor-23-stunden' => ['heartbeat', browserZeit($jetzt - 23 * 3600), true],
    'ts-jetzt' => ['page_view', browserZeit($jetzt), true],
    'ts-plus-2-minuten' => ['page_view', browserZeit($jetzt + 120), true],
    'ts-format-des-servers' => ['page_view', gmdate('c', $jetzt - 60), true],
];
$ereignisse = [['event' => 'page_view', 'session_id' => 'ts-fehlt', 'visitor_id' => 'ts-probe', 'url' => '/probe']];
foreach ($zeitFaelle as $name => [$ereignisName, $ts]) {
    $ereignisse[] = ['event' => $ereignisName, 'session_id' => $name, 'visitor_id' => 'ts-probe', 'url' => '/probe', 'ts' => $ts];
}
$anzahl = count($ereignisse);
$k = anfrage($u, 'POST', '/collect.php', json_encode(['events' => $ereignisse]));
// Dieser POST stößt selbst den ersten Lauf der Bereinigung an (noch keine
// Marke): Was als fällige Altlast ankäme, wäre danach schon gelöscht.
warte($u, ['ok', 'fehler', 'teilweise']);
pruefe("POST mit $anzahl Ereignissen (alte, künftige, Text statt Zeit, gültige): Antwort unverändert 200 {\"ok\":true,\"stored\":$anzahl}",
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":' . $anzahl . '}', kurz($k));
$da = zeilenVon($u, 'ts-probe');
pruefe("alle $anzahl stehen in der Datenbank, auch nach dem Lauf der Bereinigung, den dieser POST angestoßen hat", count($da) === $anzahl,
    count($da) . ' Zeilen, ' . markeText($u));
$serverZeit = function (?string $ts) use ($jetzt): bool {
    return is_string($ts) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/', $ts) === 1
        && abs((int)strtotime($ts) - $jetzt) <= 60;
};
$falsch = [];
foreach ($zeitFaelle as $name => [$ereignisName, $ts, $bleibt]) {
    $gespeichertTs = $da[$name] ?? null;
    if ($bleibt ? $gespeichertTs !== $ts : !$serverZeit($gespeichertTs)) {
        $falsch[] = $name . '=' . json_encode($gespeichertTs);
    }
}
if (!$serverZeit($da['ts-fehlt'] ?? null)) {
    $falsch[] = 'ts-fehlt=' . json_encode($da['ts-fehlt'] ?? null);
}
pruefe('Zeitstempel im Fenster (bis 24 h zurück, bis 5 min voraus, Format des Browsers) stehen unverändert da, alle anderen tragen die Serverzeit',
    $falsch === [], implode(', ', $falsch));
$ausserhalb = [];
foreach ($da as $name => $ts) {
    $zeit = preg_match('/^\d{4}-\d{2}-\d{2}T/', (string)$ts) === 1 ? strtotime((string)$ts) : false;
    if ($zeit === false || $zeit < $jetzt - TAG - 60 || $zeit > $jetzt + 360) {
        $ausserhalb[] = $name . '=' . json_encode($ts);
    }
}
pruefe('kein gespeicherter Zeitstempel liegt außerhalb des Fensters oder ist Text statt Zeit', $ausserhalb === [], implode(', ', $ausserhalb));
$m = marke($u) ?? [];
$m['tag'] = gmdate('Y-m-d', time() - TAG); // Marke von gestern: der nächste Abruf räumt noch einmal
setzeMarke($u, $m);
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
$nachLauf = zeilenVon($u, 'ts-probe');
pruefe('ein weiterer Lauf der Bereinigung löscht keines davon: niemand hat fällige Altlast eingefüllt (Marke ok)',
    count($nachLauf) === $anzahl && markeIst($u, 'ok', 1),
    'gelöscht: ' . implode(', ', array_keys(array_diff_key($da, $nachLauf))) . ' ' . markeText($u));
$k = anfrage($u, 'POST', '/collect.php', json_encode(['events' => [[
    'event' => 'page_view', 'session_id' => 'ts-liste', 'visitor_id' => 'ts-probe', 'url' => ['x'], 'ts' => ['x'],
]]]));
$da = zeilenVon($u, 'ts-probe');
pruefe('Zeitstempel und Adresse als Liste statt Text: Antwort ' . LEERE_ANTWORT_COLLECT . ', gespeichert mit Serverzeit',
    $k['status'] === 200 && $k['text'] === LEERE_ANTWORT_COLLECT && $serverZeit($da['ts-liste'] ?? null), kurz($k));
stoppe($u);

// Gesamtdeckel: mehr Ereignisse in einer Minute, als der Deckel erlaubt.
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$deckel = preg_match("/define\\('COLLECT_GESAMT_JE_MINUTE',\\s*(\\d+)\\)/", (string)file_get_contents($apiQuelle . '/collect.php'), $treffer)
    ? (int)$treffer[1] : 0;
pruefe('Gesamtdeckel steht als COLLECT_GESAMT_JE_MINUTE in collect.php und liegt zwischen 100 und 2000: ' . $deckel,
    $deckel >= 100 && $deckel <= 2000);
$rechneMit = $deckel > 0 ? $deckel : 400;
$zaehlDatei = $u['daten'] . '/collect_gesamt.json';
// Seit dem Anteil je Adresse (COLLECT_ADRESSE_JE_MINUTE) füllt eine Adresse den
// Deckel nicht mehr allein (Fall V): Hier senden deshalb so viele Adressen, dass
// ihre Anteile zusammen über dem Deckel liegen, jede etwas mehr als ihren Anteil.
$anteilJeAdresse = preg_match("/define\\('COLLECT_ADRESSE_JE_MINUTE',\\s*(\\d+)\\)/", (string)file_get_contents($apiQuelle . '/collect.php'), $treffer)
    ? (int)$treffer[1] : 120;
$adressZahl = intdiv($rechneMit + $anteilJeAdresse - 1, $anteilJeAdresse) + 1; // eine mehr, als den Deckel füllen
$stapelJeAdresse = intdiv($anteilJeAdresse, 50) + 1;                            // 30 Ereignisse über dem Anteil
$stapelZahl = $adressZahl * $stapelJeAdresse;
$wieImmer = true;
for ($nr = 0; $nr < $adressZahl; $nr++) {
    for ($i = 0; $i < $stapelJeAdresse; $i++) {
        $k = anfrageVon($u, '127.0.0.' . (11 + $nr), 'POST', '/collect.php', stapel('deckel', 'deckel-' . $nr . '-' . $i, 50));
        $wieImmer = $wieImmer && $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":50}';
    }
}
$gesendet = $stapelZahl * 50;
$ueberAnteil = $adressZahl * ($stapelJeAdresse * 50 - $anteilJeAdresse);
$ueberDeckel = $gesendet - $ueberAnteil - $rechneMit;
$gespeichert = count(zeilenVon($u, 'deckel'));
pruefe("$gesendet Ereignisse in $stapelZahl POST von $adressZahl Adressen binnen Sekunden: gespeichert sind genau $rechneMit (Deckel), nicht mehr: $gespeichert",
    $gespeichert === $rechneMit);
pruefe('jeder POST antwortete unverändert 200 mit {"ok":true,"stored":50}: was über dem Deckel liegt, wird still nicht gespeichert', $wieImmer, kurz($k));
$zaehler = is_file($zaehlDatei) ? json_decode((string)file_get_contents($zaehlDatei), true) : null;
pruefe('die Zähldatei nennt die Zahlen des Tages: angenommen ' . $rechneMit . ', über dem Deckel verworfen ' . $ueberDeckel
    . ', über dem Anteil der Adressen ' . $ueberAnteil . ', dichteste Minute ' . $rechneMit,
    is_array($zaehler) && ($zaehler['tag'] ?? null) === heute() && ($zaehler['angenommen_tag'] ?? null) === $rechneMit
        && ($zaehler['verworfen_tag'] ?? null) === $ueberDeckel && ($zaehler['verworfen_adresse_tag'] ?? null) === $ueberAnteil
        && ($zaehler['spitze_tag'] ?? null) === $rechneMit,
    is_file($zaehlDatei) ? substr((string)file_get_contents($zaehlDatei), 0, 260) : 'Datei fehlt');
pruefe('die Zähldatei trägt nur Zahlen, keine Adresse und keine Kennung',
    is_array($zaehler) && array_diff(array_keys($zaehler), ['tag', 'angenommen_tag', 'verworfen_tag', 'spitze_tag', 'verworfen_gesamt', 'deckel',
            'verworfen_adresse_tag', 'props_gross_tag', 'je_adresse', 'deckel_lauf', 'vortag', 'sekunden']) === []
        && strpos((string)file_get_contents($zaehlDatei), 'deckel-') === false && strpos((string)file_get_contents($zaehlDatei), '127.0.0.') === false);
pruefe('der Deckel steht genau einmal im Protokoll, nicht je verworfenem Ereignis', protokollZahl($u, 'Gesamtdeckel von') === 1,
    protokollZahl($u, 'Gesamtdeckel von') . ' Zeilen');
// Eine Minute später ist wieder Platz: die Fächer des Zählers um 61 s zurückstellen.
if (is_array($zaehler) && is_array($zaehler['sekunden'] ?? null)) {
    $verschoben = [];
    foreach ($zaehler['sekunden'] as $sekunde => $n) {
        $verschoben[(int)$sekunde - 61] = $n;
    }
    $zaehler['sekunden'] = $verschoben;
    file_put_contents($zaehlDatei, json_encode($zaehler));
}
$k = anfrageVon($u, '127.0.0.30', 'POST', '/collect.php', stapel('deckel', 'deckel-spaeter', 50)); // Adresse mit freiem Anteil
$gespeichertSpaeter = count(zeilenVon($u, 'deckel'));
pruefe('61 Sekunden später (Zähler zurückgestellt) werden wieder 50 gespeichert: ' . $gespeichertSpaeter,
    $gespeichertSpaeter === $rechneMit + 50 && $k['text'] === '{"ok":true,"stored":50}', kurz($k));
// Tageswechsel: die Zahlen des letzten Tages bleiben als "vortag" stehen.
file_put_contents($zaehlDatei, '{"tag":"2000-01-01","angenommen_tag":7,"verworfen_tag":3,"spitze_tag":5,"verworfen_gesamt":3,"sekunden":[]}');
$k = anfrage($u, 'POST', '/collect.php', stapel('deckel', 'deckel-neuer-tag', 1));
$zaehler = json_decode((string)@file_get_contents($zaehlDatei), true);
pruefe('Tageswechsel: neuer Tag beginnt bei 1 angenommen und 0 verworfen, der letzte Tag steht als vortag (7 angenommen, 3 verworfen, Spitze 5)',
    is_array($zaehler) && ($zaehler['tag'] ?? null) === heute() && ($zaehler['angenommen_tag'] ?? null) === 1 && ($zaehler['verworfen_tag'] ?? null) === 0
        && array_intersect_key(is_array($zaehler['vortag'] ?? null) ? $zaehler['vortag'] : [], ['tag' => 1, 'angenommen' => 1, 'verworfen' => 1, 'spitze' => 1])
            === ['tag' => '2000-01-01', 'angenommen' => 7, 'verworfen' => 3, 'spitze' => 5]
        && ($zaehler['verworfen_gesamt'] ?? null) === 3,
    substr((string)@file_get_contents($zaehlDatei), 0, 240));
// Zähler nicht nutzbar (ein Verzeichnis an seiner Stelle): dann wird nichts
// gespeichert, und der Browser erfährt es (503), damit er den Stapel behält.
$vorher = count(zeilenVon($u, 'deckel'));
@unlink($zaehlDatei);
mkdir($zaehlDatei);
$k = anfrage($u, 'POST', '/collect.php', stapel('deckel', 'deckel-ohne-zaehler', 5));
pruefe('Zähldatei nicht nutzbar: 503 mit Fehlertext statt 200 mit "stored" 0, nichts gespeichert, eine Zeile im Protokoll',
    $k['status'] === 503 && is_string($k['fehler']) && $k['fehler'] !== '' && !isset($k['json']['stored'])
        && count(zeilenVon($u, 'deckel')) === $vorher && protokollZahl($u, 'Gesamtdeckels nicht nutzbar') === 1,
    kurz($k) . ' ' . (count(zeilenVon($u, 'deckel')) - $vorher) . ' gespeichert');
rmdir($zaehlDatei);
$k = anfrage($u, 'POST', '/collect.php', stapel('deckel', 'deckel-ohne-zaehler', 5));
pruefe('Zähldatei wieder nutzbar: derselbe Stapel noch einmal gesendet (so tut es der Browser) wird gespeichert, 200 mit {"ok":true,"stored":5}',
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":5}' && count(zeilenVon($u, 'deckel')) === $vorher + 5,
    kurz($k) . ' ' . (count(zeilenVon($u, 'deckel')) - $vorher) . ' gespeichert');
stoppe($u);

// ─── R: Sperrfehler nach Fortschritt ────────────────────────────────────────
// Der Test hält die Schreibsperre der Datenbank länger, als der Lauf je Befehl
// wartet (2 s), nachdem der Lauf schon Portionen gelöscht hat.
echo "\nR  Sperrfehler nach Fortschritt gilt als teilweise, die Teilsumme bleibt erhalten\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$altlastZeilen = 100000;
altlast($u, $altlastZeilen);
$lauf = starteLauf($u);
$ende = microtime(true) + 2;
while (altlastRest($u) >= $altlastZeilen && microtime(true) < $ende) {
    curl_multi_exec($lauf['mh'], $laeuft);
    usleep(5000);
}
$sperre = db($u);
$sperre->exec('BEGIN IMMEDIATE');
$restBeiSperre = altlastRest($u);
usleep(2600000);
$sperre->exec('ROLLBACK');
$sperre = null;
$a = beendeLauf($lauf);
warte($u, ['ok', 'fehler', 'teilweise'], 10.0);
$m = marke($u) ?? [];
pruefe("die Sperre fiel in den laufenden Lauf, nach den ersten Portionen (Rest $restBeiSperre von $altlastZeilen)",
    $restBeiSperre < $altlastZeilen && $restBeiSperre > 0);
pruefe('Marke: teilweise mit Rest, kein Fehlschlag gezählt, gelöscht mehr als 0: ' . ($m['geloescht'] ?? '?') . ' Zeilen in ' . ($m['portionen'] ?? '?') . ' Portionen',
    markeIst($u, 'teilweise', 1) && ($m['fehlschlaege'] ?? null) === 0 && ($m['rest'] ?? null) === true && ($m['geloescht'] ?? 0) > 0, markeText($u));
pruefe('im Protokoll steht der Lauf als teilweise mit dem Sperrfehler, nicht als gescheitert',
    protokollZahl($u, 'dann war die Datenbank belegt') === 1 && protokollZahl($u, 'gescheitert') === 0,
    'Ende des Protokolls: ' . str_replace("\n", ' | ', substr((string)file_get_contents($u['log']), -300)));
pruefe('health.php antwortete Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
pruefe('die gelöschten Zeilen dieses Anlaufs sind als Teilsumme vermerkt (cleanup_teil_count = ' . ($m['geloescht'] ?? '?') . ')',
    isset($m['geloescht']) && konfig($u, 'cleanup_teil_count') === (string)$m['geloescht'], (string)konfig($u, 'cleanup_teil_count'));
pruefe('last_cleanup ist nicht geschrieben', konfig($u, 'last_cleanup') === null, (string)konfig($u, 'last_cleanup'));
for ($i = 0; $i < 12 && ((marke($u) ?? [])['ergebnis'] ?? null) === 'teilweise'; $i++) {
    $m = marke($u) ?? [];
    $m['zeit'] = time() - 61; // Pause nach einem Teillauf (60 s) abgelaufen
    setzeMarke($u, $m);
    anfrage($u, 'GET', '/health.php');
    warte($u, ['ok', 'fehler', 'teilweise'], 10.0);
}
$m = marke($u) ?? [];
pruefe('nach der kurzen Pause geht es weiter bis zum Ende: Marke ok, Rest 0, weiter kein Fehlschlag (Versuche ' . ($m['versuche'] ?? '?') . ')',
    ($m['ergebnis'] ?? null) === 'ok' && altlastRest($u) === 0 && ($m['fehlschlaege'] ?? null) === 0, markeText($u));
pruefe('last_cleanup_count nennt die Summe aller Anläufe einschließlich des unterbrochenen (' . ($altlastZeilen + 2) . ')',
    konfig($u, 'last_cleanup_count') === (string)($altlastZeilen + 2), (string)konfig($u, 'last_cleanup_count'));
stoppe($u);

// Gegenprobe: Sperre schon vor der ersten Portion, also ohne Fortschritt. Das bleibt ein Fehlschlag.
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$sperre = db($u);
$sperre->exec('BEGIN IMMEDIATE');
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise'], 10.0);
$sperre->exec('ROLLBACK');
$sperre = null;
$m = marke($u) ?? [];
pruefe('Gegenprobe, Sperre ohne Fortschritt: Marke fehler, 1 Fehlschlag, nichts gelöscht; health.php wie sonst',
    markeIst($u, 'fehler', 1) && ($m['fehlschlaege'] ?? null) === 1 && ($m['geloescht'] ?? null) === 0 && wieSonst($a, $basis),
    markeText($u) . ' ' . kurz($a));
stoppe($u);

// ─── S: Admin-Knopf vermerkt den Erfolg ─────────────────────────────────────
echo "\nS  ein vollständiger Lauf über den Admin-Knopf steht danach in der Marke, checks.bereinigung zeigt ok\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
$p = db($u);
$p->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)')
    ->execute(['probe-admin', password_hash('Nur-fuer-diesen-Test-1', PASSWORD_DEFAULT), 'Probe']);
$p = null;
$jetzt = time();
$stillstand = ['tag' => heute(), 'versuche' => 3, 'fehlschlaege' => 3, 'abbrueche' => 0, 'zeit' => $jetzt, 'ergebnis' => 'fehler',
    'seit' => $jetzt - 10 * TAG, 'erfolg_zeit' => $jetzt - 3 * TAG, 'erfolg_tag' => gmdate('Y-m-d', $jetzt - 3 * TAG)];
$z = zustandMit($u, $stillstand);
pruefe('vorher: Selbstlauf steht seit drei Tagen (drei Fehlschläge heute), health.php zeigt "ueberfaellig"', zustandIst($z, 'ueberfaellig'), zustandText($z));
$l = anfrage($u, 'POST', '/auth.php?action=login', '{"username":"probe-admin","password":"Nur-fuer-diesen-Test-1"}');
// Erst ein Lauf von Hand, der nicht vollständig wird (eine Datei lässt sich nicht löschen): kein Vermerk.
$sperrig = $u['daten'] . '/rate_limit_nichtloeschbar.json';
mkdir($sperrig);
file_put_contents($sperrig . '/inhalt', 'x');
touch($sperrig, time() - 7200);
$a = anfrage($u, 'POST', '/analytics-cleanup.php', '{}', ['Cookie: ' . (string)$l['cookie']]);
$m = marke($u) ?? [];
$z = zustandMit($u, marke($u));
pruefe('Knopf, aber eine Datei bleibt liegen: Antwort 200, die Marke bleibt beim alten Erfolg, health.php weiter "ueberfaellig"',
    $a['status'] === 200 && ($m['erfolg_zeit'] ?? null) === $jetzt - 3 * TAG && ($m['ergebnis'] ?? null) === 'fehler' && zustandIst($z, 'ueberfaellig'),
    kurz($a) . ' ' . markeText($u) . ' ' . zustandText($z));
unlink($sperrig . '/inhalt');
rmdir($sperrig);
$a = anfrage($u, 'POST', '/analytics-cleanup.php', '{}', ['Cookie: ' . (string)$l['cookie']]);
$felder = is_array($a['json']) ? array_keys($a['json']) : [];
pruefe('Knopf, vollständiger Lauf: Antwort wie bisher 200 mit deleted, retention_days, cutoff_date, timestamp',
    $l['status'] === 200 && $a['status'] === 200 && $felder === ['deleted', 'retention_days', 'cutoff_date', 'timestamp'], kurz($l) . ' | ' . kurz($a));
$m = marke($u) ?? [];
pruefe('die Marke trägt jetzt den Erfolg von heute (ergebnis ok, erfolg_zeit jetzt, von_hand), die Zähler des Tages bleiben (versuche 3, fehlschlaege 3)',
    markeIst($u, 'ok', 3) && ($m['erfolg_tag'] ?? null) === heute() && is_int($m['erfolg_zeit'] ?? null) && abs($m['erfolg_zeit'] - time()) < 60
        && is_int($m['von_hand'] ?? null) && ($m['fehlschlaege'] ?? null) === 3 && ($m['seit'] ?? null) === $jetzt - 10 * TAG, markeText($u));
$vorAbruf = markeText($u);
$h = anfrage($u, 'GET', '/health.php');
usleep(300000);
pruefe('health.php zeigt danach "bereinigung": "ok", sonst Wort für Wort wie immer', wieSonst($h, $basis), kurz($h));
pruefe('und stößt heute keinen Lauf mehr an (Marke unverändert)', markeText($u) === $vorAbruf, markeText($u));
pruefeGeraeumt($u, $soll, 'nach dem Admin-Knopf');
stoppe($u);

// ─── T: gescheiterte Dateisperre ────────────────────────────────────────────
// flock() scheitert, ohne dass jemand die Sperre hält (etwa ENOLCK auf einem
// Netzlaufwerk). Das lässt sich auf einer gewöhnlichen Platte nicht herstellen;
// der Fall ersetzt deshalb in der Kopie den einen Aufruf durch eine Funktion,
// die genau das meldet.
echo "\nT  gescheiterte Dateisperre: kein Lauf, Fehlschlag gezählt, Pause und Obergrenze greifen\n";
$sperreKaputt = 'function probeSperreKaputt($fp, int $art, &$belegt): bool { $belegt = 0; return false; }';
$sperrAnker = ['bereinigung-anstoss.php', 'if (!flock($fp, LOCK_EX | LOCK_NB, $belegt)) {', 'if (!probeSperreKaputt($fp, LOCK_EX | LOCK_NB, $belegt)) {'];
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
if (ersetzeAlle($u, [$sperrAnker]) && vorneEin($u, 'bereinigung-anstoss.php', $sperreKaputt)) {
    $a = anfrage($u, 'GET', '/health.php');
    usleep(300000);
    $m = marke($u) ?? [];
    pruefe('health.php antwortet 200 und Wort für Wort wie sonst', wieSonst($a, $basis), kurz($a));
    pruefe('Marke: heute, fehler, 1 Fehlschlag, kein Lauf gezählt (versuche 0), kein Erfolg',
        markeIst($u, 'fehler', 0) && ($m['fehlschlaege'] ?? null) === 1 && !array_key_exists('erfolg_zeit', $m), markeText($u));
    pruefeUnberuehrt($u, $soll, 'ohne Sperre');
    pruefe('die Zeile "Sperre auf bereinigung_lauf.json gescheitert" steht im Protokoll, last_cleanup ist nicht geschrieben',
        protokollZahl($u, 'Sperre auf bereinigung_lauf.json gescheitert') === 1 && konfig($u, 'last_cleanup') === null);
    $a = anfrage($u, 'GET', '/health.php');
    $k = anfrage($u, 'POST', '/collect.php', ereignis());
    usleep(300000);
    pruefe('zwei weitere Abrufe sofort danach (health.php, collect.php): Pause greift, weiter 1 Fehlschlag und 1 Zeile im Protokoll',
        ((marke($u) ?? [])['fehlschlaege'] ?? null) === 1 && protokollZahl($u, 'Sperre auf bereinigung_lauf.json gescheitert') === 1
            && wieSonst($a, $basis) && $k['text'] === LEERE_ANTWORT_COLLECT, markeText($u) . ' ' . kurz($k));
    $verlauf = [];
    for ($i = 0; $i < 3; $i++) {
        $m = marke($u) ?? [];
        $m['zeit'] = time() - 601; // Pause nach einem Fehlschlag abgelaufen
        setzeMarke($u, $m);
        anfrage($u, 'GET', '/health.php');
        usleep(300000);
        $verlauf[] = (marke($u) ?? [])['fehlschlaege'] ?? null;
    }
    pruefe('nach abgelaufener Pause zweiter und dritter Fehlschlag, danach heute keiner mehr: 2, 3, 3; drei Zeilen im Protokoll',
        $verlauf === [2, 3, 3] && protokollZahl($u, 'Sperre auf bereinigung_lauf.json gescheitert') === 3,
        json_encode($verlauf) . ' ' . protokollZahl($u, 'Sperre auf bereinigung_lauf.json gescheitert') . ' Zeilen');
    pruefeUnberuehrt($u, $soll, 'nach drei gescheiterten Sperren');
}
stoppe($u);
// Gegenprobe: derselbe Aufbau ohne den Zweig, der den Fehlschlag zählt. Bleibt
// dann alles still, misst der Fall oben wirklich diesen Zweig.
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$soll = fuelle($u);
if (ersetzeAlle($u, [$sperrAnker, ['bereinigung-anstoss.php', 'if (!$belegt) {', 'if (false) {']])
    && vorneEin($u, 'bereinigung-anstoss.php', $sperreKaputt)) {
    $a = anfrage($u, 'GET', '/health.php');
    usleep(300000);
    pruefe('Gegenprobe ohne den zählenden Zweig: keine Marke mit Inhalt, keine Zeile im Protokoll (der Fall oben misst also diesen Zweig)',
        marke($u) === null && protokollZahl($u, 'Sperre auf bereinigung_lauf.json gescheitert') === 0, markeText($u));
}
stoppe($u);

// ─── U: Zeitstempel im Format des Browsers ──────────────────────────────────
// Der Browser schickt "2026-11-10T14:03:27.512Z", die Grenzen der Bereinigung
// sind "2026-11-10 14:03:27". Der Vergleich ist ein Textvergleich, und "T"
// sortiert hinter dem Leerzeichen: Eine Zeile mit "T" ist deshalb erst fällig,
// wenn ihr Kalendertag (UTC) vor dem der Grenze liegt. Sie bleibt nie kürzer
// als ihre Frist und höchstens einen Tag länger.
echo "\nU  Zeitstempel im Format des Browsers (\"T\" und \"Z\") an den Fristen\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$p = db($u);
$p->exec("INSERT INTO analytics_config (config_key, config_value) VALUES ('retention_days', '365')");
$jetzt = time();
$bBleibt = [
    zeileRoh($p, 'heartbeat', 'b-herzschlag-23h30', browserZeit($jetzt - TAG + 1800)),
    zeileRoh($p, 'page_view', 'b-seite-365-tage-weniger-30-min', browserZeit($jetzt - 365 * TAG + 1800)),
];
$bWeg = [
    zeileRoh($p, 'heartbeat', 'b-herzschlag-49h', browserZeit($jetzt - 2 * TAG - 3600)),
    zeileRoh($p, 'page_view', 'b-seite-366-tage-und-1-h', browserZeit($jetzt - 366 * TAG - 3600)),
];
$bDazwischen = [
    zeileRoh($p, 'heartbeat', 'b-herzschlag-24h30', browserZeit($jetzt - TAG - 1800)),
    zeileRoh($p, 'page_view', 'b-seite-365-tage-mehr-30-min', browserZeit($jetzt - 365 * TAG - 1800)),
];
$p = null;
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
$da = zeilenDa($u);
pruefe('jünger als die Frist (Herzschlag 23,5 h, Seitenaufruf 365 Tage weniger 30 Minuten): beide stehen noch',
    array_values(array_intersect($bBleibt, $da)) === $bBleibt && markeIst($u, 'ok', 1), 'da: ' . implode(', ', $da) . ' ' . markeText($u));
pruefe('mehr als einen Tag über der Frist (Herzschlag 49 h, Seitenaufruf 366 Tage und 1 h): beide sind gelöscht',
    array_intersect($bWeg, $da) === [], 'da: ' . implode(', ', $da));
echo 'HINWEIS bis zu einen Tag über der Frist (Herzschlag 24,5 h, Seitenaufruf 365 Tage und 30 Minuten), tagesgenauer Vergleich: '
    . 'noch da: ' . (implode(', ', array_intersect($bDazwischen, $da)) ?: 'keine')
    . '; gelöscht: ' . (implode(', ', array_diff($bDazwischen, $da)) ?: 'keine') . "\n";
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

// ─── M: Abbruch im langen Datenbankbefehl ───────────────────────────────────
// Mit Portionen gibt es im Betrieb keinen langen Befehl mehr. Der Fall stellt
// ihn künstlich her (eine einzige Portion über die ganze Altlast, Zeitgrenze
// 2 s Rechenzeit) und belegt, was dann geschieht: PHP beendet den Arbeiter,
// die Datenbank bleibt heil, und der nächste Anlauf erkennt den Abbruch.
echo "\nM  Abbruch mitten in einem langen Datenbankbefehl (nur unter PHP-FPM)\n";
$ohneGross = getenv('BEREINIGUNG_OHNE_GROSS') === '1';
$u = ($fpm === null || $ohneGross) ? null : starteFpm($apiQuelle, $fpm);
if ($u === null) {
    $uebersprungen++;
    echo $ohneGross
        ? "UEBERSPRUNGEN  BEREINIGUNG_OHNE_GROSS=1: die Datenbank dieses Falls wird rund 600 MB groß\n"
        : "UEBERSPRUNGEN  php-fpm liegt nicht in diesem Abbild oder startet nicht\n";
} else {
    schema($u);
    $soll = fuelle($u);
    // So viele Zeilen, dass der eine DELETE länger rechnet als die Zeitgrenze
    // im Test (2 s) plus Nachfrist von PHP (hard_timeout, 2 s): 600.000 Zeilen
    // waren auf hel1 in 2,8 s durch, 2,5 Mio. brauchen ein Mehrfaches.
    $grosseAltlast = 2500000;
    altlast($u, $grosseAltlast);
    // Das Zeitbudget bleibt bei 3 s: Es wird nur zwischen Portionen geprüft und
    // hält den einen langen Befehl deshalb nicht auf.
    if (ersetzeAlle($u, [
        ['analytics-cleanup.php', '$portionZeilen = 500;', '$portionZeilen = 100000000;'],
        ['bereinigung-anstoss.php', "define('BEREINIGUNG_ZEITGRENZE', 10);", "define('BEREINIGUNG_ZEITGRENZE', 2);"],
    ])) {
        $t0 = microtime(true);
        $a = fcgi($u, 'health.php');
        pruefe('health.php antwortet 200 mit "status": "ok"', $a['status'] === 200 && strpos($a['text'], '"status": "ok"') !== false, kurz($a));
        $frei = warteSperreFrei($u, 90.0);
        $bisEnde = microtime(true) - $t0;
        usleep(500000); // FPM schreibt den Tod des Arbeiters erst danach ins Protokoll
        $protokoll = (string)@file_get_contents($u['log']) . (string)@file_get_contents($u['wurzel'] . '/fpm.aus');
        $hart = strpos($protokoll, 'terminated') !== false || strpos($protokoll, 'code 124') !== false;
        $weich = strpos($protokoll, 'Maximum execution time') !== false;
        printf("HINWEIS ein DELETE über %d Zeilen, Zeitgrenze 2 s Rechenzeit: Sperre nach %.1f s frei; im Protokoll: %s\n",
            $grosseAltlast, $bisEnde,
            $hart ? 'harter Abbruch (Prozess beendet)' : ($weich ? 'Abbruch nach dem Ende des Befehls' : 'kein Abbruch gefunden'));
        pruefe('der Lauf ist zu Ende (Sperre frei) und PHP hat ihn an der Zeitgrenze abgebrochen', $frei && ($hart || $weich),
            'Ende des Protokolls: ' . str_replace("\n", ' | ', substr($protokoll, -400)));
        pruefe('die Marke steht noch auf laeuft, 1 Versuch: kein Erfolg vermerkt', markeIst($u, 'laeuft', 1), markeText($u));
        $rest = altlastRest($u);
        pruefe("alles oder nichts: von der einen Portion ist nichts halb gelöscht (Rest $rest von $grosseAltlast)",
            $rest === $grosseAltlast || $rest === 0);
        pruefe('die Datenbank ist heil (PRAGMA integrity_check: ok)', db($u)->query('PRAGMA integrity_check')->fetchColumn() === 'ok');
        pruefe('last_cleanup ist nicht geschrieben', konfig($u, 'last_cleanup') === null, (string)konfig($u, 'last_cleanup'));
        $b = fcgi($u, 'health.php');
        pruefe(sprintf('PHP-FPM lebt: der nächste Abruf antwortet 200 nach %.0f ms, ohne neuen Lauf (Pause)', ($b['dauer'] ?? 99) * 1000),
            $b['status'] === 200 && ($b['dauer'] ?? 99) < 2.0 && markeIst($u, 'laeuft', 1), kurz($b) . ' ' . markeText($u));
        // Zurück auf Portionen zu 500 Zeilen, Pause abgelaufen. Die Zeitgrenze
        // bleibt bei 2 s Rechenzeit; ein Lauf in Portionen mit 3 s Budget auf
        // der Wanduhr rechnet deutlich weniger (gemessen rund 5 ms je Portion).
        // Drei Sekunden Abstand, weil PHP-FPM in diesem Abbild eine eben
        // geänderte Datei sonst noch in der alten Fassung ausführte (gemessen
        // 10.11.2026 an bereinigung-anstoss.php; Ursache nicht untersucht).
        copy($apiQuelle . '/analytics-cleanup.php', $u['api'] . '/analytics-cleanup.php');
        sleep(3);
        $m = marke($u) ?? [];
        $m['zeit'] = time() - 601;
        setzeMarke($u, $m);
        $c = fcgi($u, 'health.php');
        usleep(300000);
        warteSperreFrei($u, 30.0);
        $m = marke($u) ?? [];
        $restDanach = altlastRest($u);
        pruefe('nächster Anlauf: Abbruch erkannt und gezählt (abbrueche 1, fehlschlaege 1), Versuch 2 endet teilweise oder ok',
            ($m['abbrueche'] ?? null) === 1 && ($m['fehlschlaege'] ?? null) === 1 && ($m['versuche'] ?? null) === 2
                && in_array($m['ergebnis'] ?? null, ['teilweise', 'ok'], true), markeText($u));
        pruefe("und er macht in Portionen Fortschritt oder findet nichts mehr vor: Rest $restDanach nach $rest",
            $rest === 0 ? $restDanach === 0 : $restDanach < $rest);
        printf("HINWEIS dieser Anlauf mit echtem Budget (3 s): %s Zeilen in %s Portionen, %s ms, längste Portion %s ms\n",
            $m['geloescht'] ?? '?', $m['portionen'] ?? '?', $m['dauer_ms'] ?? '?', $m['laengste_portion_ms'] ?? '?');
    }
    stoppe($u);
}

// ─── V: Anteil je Adresse am Gesamtdeckel ───────────────────────────────────
echo "\nV  Anteil je Adresse am Gesamtdeckel: eine Adresse füllt ihn nicht mehr allein\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$collectText = (string)file_get_contents($apiQuelle . '/collect.php');
$deckel = preg_match("/define\\('COLLECT_GESAMT_JE_MINUTE',\\s*(\\d+)\\)/", $collectText, $treffer) ? (int)$treffer[1] : 400;
$anteil = preg_match("/define\\('COLLECT_ADRESSE_JE_MINUTE',\\s*(\\d+)\\)/", $collectText, $treffer) ? (int)$treffer[1] : 0;
pruefe('Anteil je Adresse steht als COLLECT_ADRESSE_JE_MINUTE in collect.php: mindestens 37 (drei Seiten in einer Minute), und drei Adressen füllen den Gesamtdeckel nicht: ' . $anteil,
    $anteil >= 37 && $anteil * 3 < $deckel);
$rechneAnteil = $anteil > 0 ? $anteil : 120;
$stapelZahl = intdiv($deckel, 50) + 4; // mehr als der ganze Gesamtdeckel, unter 60 Anfragen je Minute
$wieImmer = true;
for ($i = 0; $i < $stapelZahl; $i++) {
    $k = anfrageVon($u, '127.0.0.61', 'POST', '/collect.php', stapel('viel', 'viel-' . $i, 50));
    $wieImmer = $wieImmer && $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":50}';
}
warte($u, ['ok', 'fehler', 'teilweise']); // der erste POST hat den ersten Lauf der Bereinigung angestoßen
$vonEiner = count(zeilenVon($u, 'viel'));
pruefe('eine Adresse sendet ' . ($stapelZahl * 50) . " Ereignisse in $stapelZahl POST: gespeichert ist genau ihr Anteil von $rechneAnteil, nicht der ganze Deckel von $deckel: $vonEiner",
    $vonEiner === $rechneAnteil);
pruefe('jeder ihrer POST antwortete unverändert 200 mit {"ok":true,"stored":50}', $wieImmer, kurz($k));
// Zweiter Besucher in derselben Minute: seine dichteste Minute bei einer Seite, 17 Ereignisse in 3 POST.
$zweiterOk = true;
foreach ([7, 5, 5] as $nr => $n) {
    $k = anfrageVon($u, '127.0.0.62', 'POST', '/collect.php', stapel('besucher', 'besucher-' . $nr, $n));
    $zweiterOk = $zweiterOk && $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":' . $n . '}';
}
$vomZweiten = count(zeilenVon($u, 'besucher'));
pruefe("ein zweiter Besucher von anderer Adresse in derselben Minute (17 Ereignisse) wird vollständig gezählt: $vomZweiten von 17",
    $vomZweiten === 17 && $zweiterOk, kurz($k));
$zaehler = json_decode((string)@file_get_contents($u['daten'] . '/collect_gesamt.json'), true);
$ueberAnteil = $stapelZahl * 50 - $rechneAnteil;
pruefe('Zähldatei: angenommen ' . ($rechneAnteil + 17) . ", über dem Anteil einer Adresse $ueberAnteil, über dem Gesamtdeckel 0, kein Lauf \"Deckel erreicht\"",
    is_array($zaehler) && ($zaehler['angenommen_tag'] ?? null) === $rechneAnteil + 17 && ($zaehler['verworfen_adresse_tag'] ?? null) === $ueberAnteil
        && ($zaehler['verworfen_tag'] ?? null) === 0 && !isset($zaehler['deckel_lauf']) && ($zaehler['je_adresse'] ?? null) === $rechneAnteil,
    substr((string)@file_get_contents($u['daten'] . '/collect_gesamt.json'), 0, 260));
$anteilDateien = glob($u['daten'] . '/rate_limit_anteil_*.json') ?: [];
$sauber = count($anteilDateien) === 2;
foreach ($anteilDateien as $d) {
    $inhalt = json_decode((string)file_get_contents($d), true);
    $sauber = $sauber && preg_match('/^rate_limit_anteil_[0-9a-f]{32}\.json$/', basename($d)) === 1
        && is_array($inhalt) && array_keys($inhalt) === ['sekunden'] && is_array($inhalt['sekunden'])
        && array_filter($inhalt['sekunden'], 'is_int') === $inhalt['sekunden'];
}
pruefe('je Adresse eine Zähldatei rate_limit_anteil_<Hash>.json, Inhalt nur Sekunden und Zahlen', $sauber,
    implode(', ', array_map('basename', $anteilDateien)));
$klartext = [];
foreach (glob($u['daten'] . '/*.json') ?: [] as $d) {
    if (strpos(basename($d), '127.0.0.') !== false || strpos((string)file_get_contents($d), '127.0.0.') !== false) {
        $klartext[] = basename($d);
    }
}
pruefe('keine Datei im Datenordner trägt eine Adresse im Klartext, weder im Namen noch im Inhalt', $klartext === [], implode(', ', $klartext));
foreach ($anteilDateien as $d) {
    touch($d, time() - 7200);
}
clearstatcache();
$m = marke($u) ?? [];
$m['tag'] = gmdate('Y-m-d', time() - TAG); // Marke von gestern: der nächste Abruf räumt noch einmal
setzeMarke($u, $m);
anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
clearstatcache();
$nochDa = glob($u['daten'] . '/rate_limit_anteil_*.json') ?: [];
pruefe('die Bereinigung löscht sie wie die übrigen rate_limit_-Dateien eine Stunde nach der letzten Änderung (hier zwei Stunden alt)',
    $anteilDateien !== [] && $nochDa === [] && markeIst($u, 'ok', 1), count($nochDa) . ' noch da, ' . markeText($u));
$aus = [];
$rc = 1;
exec(escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg('require $argv[1]; $s = "statistikAdressSchluessel"; echo json_encode(['
    . '$s("2001:db8:1:2::1") === $s("2001:db8:1:2:ffff::9"), $s("2001:db8:1:2::1") !== $s("2001:db8:1:3::1"), '
    . '$s("::ffff:192.0.2.7") === $s("192.0.2.7"), $s("192.0.2.7") !== $s("192.0.2.8"), '
    . 'preg_match("/^[0-9a-f]{32}$/", $s("192.0.2.7")) === 1]);')
    . ' ' . escapeshellarg($u['api'] . '/statistik-zaehler.php') . ' 2>&1', $aus, $rc);
pruefe('Schlüssel der Adresse: IPv6 zählt je /64-Präfix, als IPv6 geschriebenes IPv4 wie IPv4, verschiedene Adressen verschieden, nur Hash',
    $rc === 0 && implode('', $aus) === '[true,true,true,true,true]', substr(implode(' ', $aus), 0, 80));
stoppe($u);

// ─── W: Größe je Ereignis ───────────────────────────────────────────────────
echo "\nW  Größe je Ereignis: zu großes props wird leer gespeichert und gezählt\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$grenze = preg_match("/define\\('COLLECT_PROPS_BYTES',\\s*(\\d+)\\)/", $collectText, $treffer) ? (int)$treffer[1] : 0;
pruefe('Grenze steht als COLLECT_PROPS_BYTES in collect.php, zwischen 4.277 (größter Fall, den der Browser erzeugen kann) und 16.384: ' . $grenze,
    $grenze >= 4277 && $grenze <= 16384);
$rechneGrenze = $grenze > 0 ? $grenze : 8192;
// Was der Browser wirklich schickt (src/lib/analytics-tracker.ts): Geräteangaben
// beim Sitzungsstart und der längste Fehlertext, den er zulässt, nur aus Umlauten.
$geraet = ['device_type' => 'desktop', 'browser' => 'Chrome', 'browser_version' => '131.0.6778.86', 'os' => 'Windows',
    'screen_width' => 1920, 'screen_height' => 1080, 'screen_resolution' => '1920x1080', 'viewport_width' => 1920,
    'viewport_height' => 969, 'color_depth' => 24, 'pixel_ratio' => 1.25, 'language' => 'de-DE',
    'languages' => 'de-DE,de,en-US,en', 'timezone' => 'Europe/Berlin', 'geo_country' => 'Europe', 'geo_region' => 'Europa',
    'connection_type' => '4g', 'touch_support' => false, 'cookies_enabled' => true, 'do_not_track' => false,
    'ad_blocker' => false, 'visit_count' => 3, 'is_returning' => true, 'last_visit' => '2026-11-09T14:03:27.512Z', 'page_count' => 0];
$fehlerVoll = ['error_message' => str_repeat('ä', 500), 'error_source' => str_repeat('ä', 200), 'error_line' => 123456, 'error_col' => 123456];
$fuell = function (int $bytes): array { // props, dessen JSON genau $bytes lang ist
    return ['fuell' => str_repeat('x', $bytes - 12)];
};
$lang = str_repeat('u', 5000);
$mitProps = function (string $ereignisName, string $sitzung, array $props, array $dazu = []): array {
    return ['event' => $ereignisName, 'session_id' => $sitzung, 'visitor_id' => 'gr', 'url' => '/probe',
        'ts' => browserZeit(time()), 'props' => $props] + $dazu;
};
$ereignisse = [
    $mitProps('session_start', 'gr-start', $geraet), // von 127.0.0.1: die Ortung lässt diese Adresse aus
    $mitProps('error', 'gr-fehler', $fehlerVoll),
    $mitProps('page_view', 'gr-genau', $fuell($rechneGrenze)),
    $mitProps('page_view', 'gr-eins-drueber', $fuell($rechneGrenze + 1)),
    $mitProps('page_view', 'gr-riesig', $fuell(300000)),
    ['url' => $lang, 'referrer' => $lang, 'utm_source' => $lang, 'utm_medium' => $lang, 'utm_campaign' => $lang,
        'utm_content' => $lang, 'utm_term' => $lang] + $mitProps('page_view', 'gr-felder', $fuell($rechneGrenze)),
];
$k = anfrage($u, 'POST', '/collect.php', json_encode(['events' => $ereignisse]));
warte($u, ['ok', 'fehler', 'teilweise']);
pruefe('POST mit 6 Ereignissen, zwei davon mit zu großem props (eines 300 KB): Antwort unverändert 200 {"ok":true,"stored":6}',
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":6}', kurz($k));
$s = db($u)->prepare("SELECT session_id, props, length(event) + length(ts) + length(session_id) + length(visitor_id) + length(url)
    + length(referrer) + length(utm_source) + length(utm_medium) + length(utm_campaign) + length(utm_content) + length(utm_term)
    + coalesce(length(props), 0) AS bytes FROM analytics_events WHERE visitor_id = 'gr'");
$s->execute();
$da = [];
foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $da[$r['session_id']] = $r;
}
pruefe('alle 6 sind gespeichert', count($da) === 6, implode(', ', array_keys($da)));
pruefe('props bis zur Grenze steht unverändert da: Geräteangaben des Sitzungsstarts (' . strlen(json_encode($geraet)) . ' Bytes), längster Fehlertext aus Umlauten ('
    . strlen(json_encode($fehlerVoll)) . " Bytes), genau $rechneGrenze Bytes",
    json_decode((string)($da['gr-start']['props'] ?? ''), true) == $geraet
        && json_decode((string)($da['gr-fehler']['props'] ?? ''), true) === $fehlerVoll
        && strlen((string)($da['gr-genau']['props'] ?? '')) === $rechneGrenze,
    'Längen: ' . strlen((string)($da['gr-start']['props'] ?? '')) . ', ' . strlen((string)($da['gr-fehler']['props'] ?? '')) . ', ' . strlen((string)($da['gr-genau']['props'] ?? '')));
pruefe('props ein Byte über der Grenze und props mit 300 KB: das Ereignis ist gespeichert, props ist leer',
    array_key_exists('gr-eins-drueber', $da) && $da['gr-eins-drueber']['props'] === null
        && array_key_exists('gr-riesig', $da) && $da['gr-riesig']['props'] === null,
    'Längen: ' . strlen((string)($da['gr-eins-drueber']['props'] ?? '')) . ', ' . strlen((string)($da['gr-riesig']['props'] ?? '')));
$groesste = $da === [] ? 0 : max(array_map(fn($r) => (int)$r['bytes'], $da));
$obergrenze = 64 + 64 + 2048 + 2048 + 5 * 255 + 64 + $rechneGrenze;
pruefe("die größte gespeicherte Zeile (alle Textfelder mit 5.000 Zeichen gesendet, props an der Grenze) hat $groesste Bytes, höchstens $obergrenze",
    $groesste > 0 && $groesste <= $obergrenze);
$zaehler = json_decode((string)@file_get_contents($u['daten'] . '/collect_gesamt.json'), true);
pruefe('Zähldatei: 6 angenommen, 2 mit zu großem props gezählt, eine Zeile im Protokoll',
    is_array($zaehler) && ($zaehler['angenommen_tag'] ?? null) === 6 && ($zaehler['props_gross_tag'] ?? null) === 2
        && protokollZahl($u, 'props über der Größengrenze') === 1,
    substr((string)@file_get_contents($u['daten'] . '/collect_gesamt.json'), 0, 260));
stoppe($u);

// ─── X: Sichtbarkeit von Zählerausfall und Deckel ───────────────────────────
echo "\nX  Zählerausfall und Deckel werden sichtbar: 503, checks.statistik, analytics-status.php\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$zaehlDatei = $u['daten'] . '/collect_gesamt.json';
$statistik = function (array $a): ?string {
    $wert = is_array($a['json']) ? ($a['json']['checks']['statistik'] ?? null) : null;
    return is_string($wert) ? $wert : null;
};
$sonstOk = function (array $a): bool {
    return $a['status'] === 200 && is_array($a['json']) && array_keys($a['json']) === ['status', 'checks']
        && $a['json']['status'] === 'ok' && ($a['json']['checks']['database'] ?? null) === 'ok'
        && ($a['json']['checks']['data_writable'] ?? null) === 'ok';
};
$a = anfrage($u, 'GET', '/health.php');
warte($u, ['ok', 'fehler', 'teilweise']);
pruefe('frisch nach dem Deploy (noch keine Zähldatei): "statistik": "ok", "status": "ok", HTTP 200', $statistik($a) === 'ok' && $sonstOk($a), kurz($a));
$felder = is_array($a['json']) && is_array($a['json']['checks'] ?? null) ? array_keys($a['json']['checks']) : [];
pruefe('checks trägt alle bisherigen Felder (database, data_writable, timestamp, bereinigung), statistik steht dahinter',
    array_diff(['database', 'data_writable', 'timestamp', 'bereinigung'], $felder) === [] && end($felder) === 'statistik', implode(', ', $felder));
$k = anfrage($u, 'POST', '/collect.php', stapel('sicht', 'sicht-a', 3));
$a = anfrage($u, 'GET', '/health.php');
pruefe('gewöhnlicher POST: 200 mit {"ok":true,"stored":3}, health.php "statistik": "ok"',
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":3}' && $statistik($a) === 'ok' && $sonstOk($a), kurz($k) . ' | ' . kurz($a));
// Ausfall: ein Verzeichnis an der Stelle der Zähldatei.
@unlink($zaehlDatei);
mkdir($zaehlDatei);
$k = anfrage($u, 'POST', '/collect.php', stapel('sicht', 'sicht-b', 4));
$a = anfrage($u, 'GET', '/health.php');
pruefe('Zähldatei nicht nutzbar: collect.php antwortet 503 mit Fehlertext und ohne "stored", nichts gespeichert',
    $k['status'] === 503 && is_string($k['fehler']) && $k['fehler'] !== '' && !isset($k['json']['stored']) && count(zeilenVon($u, 'sicht')) === 3,
    kurz($k) . ' ' . count(zeilenVon($u, 'sicht')) . ' Zeilen');
pruefe('health.php zeigt dabei "statistik": "zaehler"; "status" bleibt "ok", HTTP 200', $statistik($a) === 'zaehler' && $sonstOk($a), kurz($a));
rmdir($zaehlDatei);
$k = anfrage($u, 'POST', '/collect.php', stapel('sicht', 'sicht-b', 4));
$a = anfrage($u, 'GET', '/health.php');
pruefe('geheilt: derselbe Stapel noch einmal gesendet wird gespeichert (200, "stored" 4, 7 Zeilen), health.php wieder "ok"',
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":4}' && count(zeilenVon($u, 'sicht')) === 7 && $statistik($a) === 'ok' && $sonstOk($a),
    kurz($k) . ' ' . count(zeilenVon($u, 'sicht')) . ' Zeilen | ' . kurz($a));
// Deckel: erst nach fünf Minuten am Stück, und nur eine halbe Stunde lang.
$mitLauf = function (int $beginn, int $zuletzt) use ($zaehlDatei, $u): array {
    $stand = json_decode((string)file_get_contents($zaehlDatei), true) ?: [];
    $stand['deckel_lauf'] = ['beginn' => $beginn, 'zuletzt' => $zuletzt];
    file_put_contents($zaehlDatei, json_encode($stand));
    return anfrage($u, 'GET', '/health.php');
};
$minute = intdiv(time(), 60);
$a = $mitLauf($minute - 5, $minute - 1);
pruefe('Deckel fünf Minuten am Stück erreicht, zuletzt vor einer Minute: "statistik": "deckel"; "status" bleibt "ok", HTTP 200',
    $statistik($a) === 'deckel' && $sonstOk($a), kurz($a));
pruefe('die Antwort nennt dabei keine Zahl und kein Feld aus der Zähldatei',
    preg_match('/angenommen|verworfen|spitze|beginn|zuletzt|sekunden/', $a['text']) === 0, kurz($a));
$a = $mitLauf($minute - 32, $minute - 28);
pruefe('derselbe Lauf, zuletzt vor 28 Minuten: noch "deckel" (der Wächter ruft alle 15 Minuten ab)', $statistik($a) === 'deckel' && $sonstOk($a), kurz($a));
$a = $mitLauf($minute - 2, $minute - 1);
pruefe('Deckel nur zwei Minuten am Stück erreicht: "ok", kein Alarm', $statistik($a) === 'ok' && $sonstOk($a), kurz($a));
$a = $mitLauf($minute - 45, $minute - 41);
pruefe('fünf Minuten am Stück, aber zuletzt vor 41 Minuten: wieder "ok"', $statistik($a) === 'ok' && $sonstOk($a), kurz($a));
// Der Lauf entsteht in collect.php selbst. Nicht über eine Minutengrenze hinweg messen.
if ((int)gmdate('s') >= 55) {
    sleep(6);
}
$jetzt = time();
$minute = intdiv($jetzt, 60);
$voll = ['tag' => heute(), 'angenommen_tag' => $deckel, 'verworfen_tag' => 0, 'spitze_tag' => $deckel, 'verworfen_gesamt' => 0,
    'deckel' => $deckel, 'sekunden' => [$jetzt - 2 => $deckel]];
file_put_contents($zaehlDatei, json_encode($voll));
$k = anfrageVon($u, '127.0.0.71', 'POST', '/collect.php', stapel('sicht', 'sicht-stoss', 5));
$stand = json_decode((string)file_get_contents($zaehlDatei), true);
$a = anfrage($u, 'GET', '/health.php');
pruefe('ein einzelner Stoß (Deckel voll, ein POST darüber): Antwort unverändert, nichts gespeichert, der Lauf beginnt in dieser Minute, health.php bleibt "ok"',
    $k['status'] === 200 && $k['text'] === '{"ok":true,"stored":5}' && count(zeilenVon($u, 'sicht')) === 7
        && is_array($stand) && ($stand['deckel_lauf'] ?? null) === ['beginn' => $minute, 'zuletzt' => $minute] && ($stand['verworfen_tag'] ?? null) === 5
        && $statistik($a) === 'ok' && $sonstOk($a),
    kurz($k) . ' ' . json_encode($stand['deckel_lauf'] ?? null) . ' | ' . kurz($a));
file_put_contents($zaehlDatei, json_encode($voll + ['deckel_lauf' => ['beginn' => $minute - 4, 'zuletzt' => $minute - 1]]));
$davor = anfrage($u, 'GET', '/health.php');
$k = anfrageVon($u, '127.0.0.72', 'POST', '/collect.php', stapel('sicht', 'sicht-dauer', 5));
$stand = json_decode((string)file_get_contents($zaehlDatei), true);
$a = anfrage($u, 'GET', '/health.php');
pruefe('Deckel seit vier Minuten erreicht (health.php noch "ok"), ein POST in der fünften: der Lauf reicht bis zu dieser Minute, health.php zeigt "deckel"',
    $statistik($davor) === 'ok' && $k['text'] === '{"ok":true,"stored":5}' && count(zeilenVon($u, 'sicht')) === 7
        && is_array($stand) && ($stand['deckel_lauf'] ?? null) === ['beginn' => $minute - 4, 'zuletzt' => $minute]
        && $statistik($a) === 'deckel' && $sonstOk($a),
    kurz($davor) . ' | ' . json_encode($stand['deckel_lauf'] ?? null) . ' | ' . kurz($a));
// Die Zahlen sieht nur der angemeldete Admin.
$p = db($u);
$p->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)')
    ->execute(['probe-admin', password_hash('Nur-fuer-diesen-Test-1', PASSWORD_DEFAULT), 'Probe']);
$p = null;
$l = anfrage($u, 'POST', '/auth.php?action=login', '{"username":"probe-admin","password":"Nur-fuer-diesen-Test-1"}');
$s = anfrage($u, 'GET', '/analytics-status.php', null, ['Cookie: ' . (string)$l['cookie']]);
$stand = json_decode((string)file_get_contents($zaehlDatei), true);
$bisher = ['total_events', 'oldest_event', 'newest_event', 'db_size_bytes', 'last_cleanup', 'last_cleanup_count',
    'unique_sessions_total', 'unique_visitors_total', 'events_today', 'sessions_today'];
pruefe('angemeldet: analytics-status.php zeigt angenommen_tag, verworfen_tag und spitze_tag aus der Zähldatei ('
    . ($stand['angenommen_tag'] ?? '?') . ', ' . ($stand['verworfen_tag'] ?? '?') . ', ' . ($stand['spitze_tag'] ?? '?') . ') hinter den bisherigen zehn Feldern',
    $l['status'] === 200 && $s['status'] === 200 && is_array($s['json']) && is_array($stand)
        && array_slice(array_keys($s['json']), 0, 10) === $bisher
        && ($s['json']['angenommen_tag'] ?? null) === $stand['angenommen_tag'] && $stand['angenommen_tag'] >= $deckel
        && ($s['json']['verworfen_tag'] ?? null) === $stand['verworfen_tag'] && $stand['verworfen_tag'] === 5
        && ($s['json']['spitze_tag'] ?? null) === $stand['spitze_tag']
        && ($s['json']['statistik_zaehler']['zustand'] ?? null) === 'deckel',
    kurz($l) . ' | ' . substr($s['text'], 0, 400));
$ohne = anfrage($u, 'GET', '/analytics-status.php');
pruefe('ohne Anmeldung: 401, keine Zahl', $ohne['status'] === 401 && strpos($ohne['text'], 'angenommen') === false, kurz($ohne));
stoppe($u);

// ─── Y und Z: Auswertung ────────────────────────────────────────────────────
// Die Zeilen stehen fest (kein Zufall, kein Abruf von health.php oder
// collect.php, also auch kein Lauf der Bereinigung): Y misst den Zeitraum
// vor 3 bis vor 1 Tag, Z den Zeitraum vor 12 bis vor 10 Tagen.
echo "\nY  Auswertung: der letzte Tag des Zeitraums zählt mit, Absprung ist eine Sitzung mit genau einem Seitenaufruf\n";
$u = starte($apiQuelle) ?? exit(2);
schema($u);
$p = db($u);
$p->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)')
    ->execute(['probe-admin', password_hash('Nur-fuer-diesen-Test-1', PASSWORD_DEFAULT), 'Probe']);
$ein = $p->prepare('INSERT INTO analytics_events (event, ts, session_id, visitor_id, url, utm_source, utm_campaign) VALUES (?, ?, ?, ?, ?, ?, ?)');
$lege = function (string $ereignisName, string $ts, string $sitzung, string $url = '/probe', string $quelle = '', string $kampagne = '') use ($ein): void {
    $ein->execute([$ereignisName, $ts, $sitzung, 'ausw', $url, $quelle, $kampagne]);
};
$tagVor = function (int $n): string {
    return gmdate('Y-m-d', time() - $n * TAG);
};
$letzter = $tagVor(1);
$mitte = $tagVor(2);
$erster = $tagVor(3);
// A: ein Besuch mit einer Seite am letzten Tag, vier Ereignisse (Absprung).
$lege('session_start', $letzter . 'T10:00:00.000Z', 'ausw-a', '/');
$lege('page_view', $letzter . 'T10:00:00.100Z', 'ausw-a', '/');
$lege('scroll_depth', $letzter . 'T10:00:05.000Z', 'ausw-a', '/');
$lege('page_engagement', $letzter . 'T10:00:30.000Z', 'ausw-a', '/');
// B: zwei Seiten am letzten Tag, die zweite Zeile im alten Format mit Leerzeichen.
$lege('session_start', $letzter . 'T11:00:00.000Z', 'ausw-b', '/');
$lege('page_view', $letzter . 'T11:00:00.000Z', 'ausw-b', '/');
$lege('page_view', $letzter . ' 11:05:00', 'ausw-b', '/leistungen');
// C: zwei Seiten in derselben Sekunde am mittleren Tag.
$lege('session_start', $mitte . 'T09:00:00.000Z', 'ausw-c', '/eins');
$lege('page_view', $mitte . 'T09:00:01.000Z', 'ausw-c', '/eins');
$lege('page_view', $mitte . 'T09:00:01.000Z', 'ausw-c', '/zwei');
// D: Bruchstück, ein einzelner Klick ohne Seitenaufruf (die alte Zählung nannte das Absprung).
$lege('cta_click', $mitte . 'T12:00:00.000Z', 'ausw-d');
// E und F: je eine Seite in der letzten Sekunde des letzten Tages, im Format des Servers und ohne Millisekunden.
$lege('session_start', $letzter . 'T23:59:59+00:00', 'ausw-e', '/');
$lege('page_view', $letzter . 'T23:59:59+00:00', 'ausw-e', '/');
$lege('session_start', $letzter . 'T23:59:59Z', 'ausw-f', '/');
$lege('page_view', $letzter . 'T23:59:59Z', 'ausw-f', '/');
// Gegenprobe: die erste Sekunde des Folgetags gehört nicht dazu.
$lege('page_view', $tagVor(0) . 'T00:00:00.000Z', 'ausw-folgetag', '/');
// Vergleichszeitraum (vor 5 bis vor 4 Tagen): eine Seite an seinem letzten Tag.
$lege('session_start', $tagVor(4) . 'T15:00:00.000Z', 'ausw-vorher', '/');
$lege('page_view', $tagVor(4) . 'T15:00:00.000Z', 'ausw-vorher', '/');
// Z: Kampagnen, vor 13 bis vor 10 Tagen.
$z1 = $tagVor(11);
$z2 = $tagVor(10);
// S1: Einstieg über google, zweiter Kampagnenklick im selben Tab über den Newsletter, Anfrage am letzten Tag.
$lege('session_start', $z1 . 'T08:00:00.000Z', 'quelle-1', '/', 'google', 'herbst');
$lege('page_view', $z1 . 'T08:00:00.100Z', 'quelle-1', '/', 'google', 'herbst');
$lege('page_view', $z1 . 'T08:10:00.000Z', 'quelle-1', '/angebot', 'newsletter', 'nl-11');
$lege('form_submit', $z2 . 'T08:12:00.000Z', 'quelle-1', '/angebot', 'newsletter', 'nl-11');
// S2: Einstieg über den Newsletter, keine Anfrage.
$lege('session_start', $z1 . 'T09:00:00.000Z', 'quelle-2', '/', 'newsletter', 'nl-11');
$lege('page_view', $z1 . 'T09:00:00.100Z', 'quelle-2', '/', 'newsletter', 'nl-11');
$lege('heartbeat', $z1 . 'T09:00:30.000Z', 'quelle-2', '/', 'newsletter', 'nl-11');
// S3: Einstieg ohne Kampagne, später eine Seite und eine Anfrage mit google in der Adresse.
$lege('session_start', $z1 . 'T10:00:00.000Z', 'quelle-3', '/');
$lege('page_view', $z1 . 'T10:05:00.000Z', 'quelle-3', '/', 'google', 'herbst');
$lege('form_submit', $z1 . 'T10:06:00.000Z', 'quelle-3', '/kontakt', 'google', 'herbst');
// S4: Einstieg über google vor dem Zeitraum, Anfrage im Zeitraum ohne Angabe in der Adresse.
$lege('session_start', $tagVor(13) . 'T10:00:00.000Z', 'quelle-4', '/', 'google', 'herbst');
$lege('form_submit', $z2 . 'T10:00:00.000Z', 'quelle-4', '/kontakt');
$ein = null;
$p = null;
$l = anfrage($u, 'POST', '/auth.php?action=login', '{"username":"probe-admin","password":"Nur-fuer-diesen-Test-1"}');
$angemeldet = ['Cookie: ' . (string)$l['cookie']];
$y = anfrage($u, 'GET', '/analytics-export.php?action=kpis&from=' . $erster . '&to=' . $letzter, null, $angemeldet);
$j = is_array($y['json']) ? $y['json'] : [];
$bisherKpi = ['total_events', 'unique_sessions', 'page_views', 'unique_visitors', 'cta_clicks', 'form_submits', 'phone_clicks',
    'whatsapp_clicks', 'downloads', 'comparison', 'bounce_rate', 'avg_session_events', 'engagement', 'session_quality',
    'visitor_segments', 'conversion_funnel', 'conversion_rate', 'events_by_day', 'events_by_hour', 'heatmap', 'top_pages',
    'page_performance', 'navigation_paths', 'top_referrers', 'top_sources', 'top_campaigns', 'device_breakdown',
    'browser_breakdown', 'os_breakdown', 'screen_resolution_breakdown', 'connection_type_breakdown', 'country_breakdown',
    'timezone_breakdown', 'language_breakdown', 'city_breakdown', 'form_conversion_by_type', 'lead_sources', 'exit_intents',
    'performance_metrics', 'top_errors'];
pruefe('angemeldet antwortet analytics-export.php?action=kpis mit 200 und den bisherigen 40 Feldern in der bisherigen Reihenfolge',
    $l['status'] === 200 && $y['status'] === 200 && array_slice(array_keys($j), 0, 40) === $bisherKpi, kurz($l) . ' | ' . kurz($y));
pruefe('der letzte Tag des Zeitraums zählt mit: 15 Ereignisse, 6 Sitzungen, 7 Seitenaufrufe (am Stand davor fehlten alle Zeilen mit "T" des letzten Tages)',
    ($j['total_events'] ?? null) === 15 && ($j['unique_sessions'] ?? null) === 6 && ($j['page_views'] ?? null) === 7,
    'total_events ' . json_encode($j['total_events'] ?? null) . ', unique_sessions ' . json_encode($j['unique_sessions'] ?? null) . ', page_views ' . json_encode($j['page_views'] ?? null));
$tage = [];
foreach (is_array($j['events_by_day'] ?? null) ? $j['events_by_day'] : [] as $t) {
    $tage[(string)($t['date'] ?? '')] = (int)($t['page_views'] ?? -1);
}
pruefe("events_by_day nennt den letzten Tag $letzter mit 5 Seitenaufrufen (Formate des Browsers, des Servers, ohne Millisekunden, mit Leerzeichen) und $mitte mit 2",
    $tage === [$mitte => 2, $letzter => 5], json_encode($tage));
pruefe('die erste Sekunde des Folgetags zählt nicht mit (Gegenprobe: die Grenze ist nicht zu weit)',
    ($j['total_events'] ?? null) === 15 && !isset($tage[$tagVor(0)]), json_encode($tage));
pruefe('der Vergleichszeitraum zählt seinen letzten Tag ebenfalls mit: 1 Seitenaufruf davor',
    ($j['comparison']['page_views']['previous'] ?? null) === 1 && ($j['comparison']['page_views']['current'] ?? null) === 7,
    json_encode($j['comparison']['page_views'] ?? null));
pruefe('Absprung: 3 von 5 Sitzungen mit Seitenaufruf haben genau einen (A, E, F), bounce_rate 60; das Bruchstück D ohne Seitenaufruf zählt nicht',
    is_numeric($j['bounce_rate'] ?? null) && abs((float)$j['bounce_rate'] - 60.0) < 0.05
        && ($j['bounce_sessions'] ?? null) === 3 && ($j['page_view_sessions'] ?? null) === 5,
    'bounce_rate ' . json_encode($j['bounce_rate'] ?? null) . ', bounce_sessions ' . json_encode($j['bounce_sessions'] ?? null)
        . ', page_view_sessions ' . json_encode($j['page_view_sessions'] ?? null));
$pfade = [];
foreach (is_array($j['navigation_paths'] ?? null) ? $j['navigation_paths'] : [] as $pfad) {
    $pfade[] = ($pfad['from_page'] ?? '') . ' -> ' . ($pfad['to_page'] ?? '');
}
pruefe('Seitenfolge: zwei Seitenaufrufe derselben Sekunde stehen in der Reihenfolge ihres Eingangs (/eins -> /zwei)',
    in_array('/eins -> /zwei', $pfade, true) && !in_array('/zwei -> /eins', $pfade, true), implode(', ', $pfade));
$x = anfrage($u, 'GET', '/analytics-export.php?action=export&format=json&limit=1000&from=' . $erster . '&to=' . $letzter, null, $angemeldet);
$sitzungen = is_array($x['json']) ? array_count_values(array_column($x['json'], 'session_id')) : [];
pruefe('der Rohdaten-Export desselben Zeitraums trägt dieselben 15 Zeilen, ohne die des Folgetags',
    $x['status'] === 200 && array_sum($sitzungen) === 15 && ($sitzungen['ausw-a'] ?? 0) === 4 && !isset($sitzungen['ausw-folgetag']),
    $x['status'] . ' ' . json_encode($sitzungen));

echo "\nZ  Sitzungen und Anfragen je Quelle über den Sitzungsstart\n";
$y = anfrage($u, 'GET', '/analytics-export.php?action=kpis&from=' . $tagVor(12) . '&to=' . $z2, null, $angemeldet);
$j = is_array($y['json']) ? $y['json'] : [];
pruefe('neue Felder stehen hinter den bisherigen 40: bounce_sessions, page_view_sessions, sessions_by_source, leads_by_source, sessions_by_campaign, leads_by_campaign',
    $y['status'] === 200 && array_slice(array_keys($j), 0, 40) === $bisherKpi
        && array_slice(array_keys($j), 40) === ['bounce_sessions', 'page_view_sessions', 'sessions_by_source', 'leads_by_source', 'sessions_by_campaign', 'leads_by_campaign'],
    implode(', ', array_slice(array_keys($j), 40)));
pruefe('Sitzungen je Quelle: google 1, newsletter 1. Die Sitzung mit zwei Kampagnenklicks zählt einmal, bei der Quelle ihres Starts; die Sitzung ohne Quelle am Start zählt nicht',
    ($j['sessions_by_source'] ?? null) === [['source' => 'google', 'sessions' => 1], ['source' => 'newsletter', 'sessions' => 1]],
    json_encode($j['sessions_by_source'] ?? null));
pruefe('Anfragen je Quelle: google 2 (die Anfrage nach dem zweiten Klick und die der Sitzung, die vor dem Zeitraum über google begann), newsletter keine',
    ($j['leads_by_source'] ?? null) === [['source' => 'google', 'conversions' => 2]], json_encode($j['leads_by_source'] ?? null));
pruefe('je Kampagne dasselbe: Sitzungen herbst 1 und nl-11 1, Anfragen herbst 2',
    ($j['sessions_by_campaign'] ?? null) === [['campaign' => 'herbst', 'sessions' => 1], ['campaign' => 'nl-11', 'sessions' => 1]]
        && ($j['leads_by_campaign'] ?? null) === [['campaign' => 'herbst', 'conversions' => 2]],
    json_encode($j['sessions_by_campaign'] ?? null) . ' ' . json_encode($j['leads_by_campaign'] ?? null));
$leadAlt = is_array($j['lead_sources'] ?? null) ? $j['lead_sources'] : [];
usort($leadAlt, fn($l1, $l2) => strcmp((string)($l1['source'] ?? ''), (string)($l2['source'] ?? '')));
pruefe('die bisherigen Felder zählen weiter je Ereignis: top_sources newsletter 5 und google 4, lead_sources google 1 und newsletter 1',
    ($j['top_sources'] ?? null) === [['source' => 'newsletter', 'count' => 5], ['source' => 'google', 'count' => 4]]
        && $leadAlt === [['source' => 'google', 'conversions' => 1], ['source' => 'newsletter', 'conversions' => 1]],
    json_encode($j['top_sources'] ?? null) . ' ' . json_encode($j['lead_sources'] ?? null));
stoppe($u);

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
