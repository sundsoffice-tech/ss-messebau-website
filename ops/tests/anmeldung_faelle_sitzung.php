<?php
/**
 * Fälle zur Sitzungsmarke (eingebunden von ops/tests/anmeldung_test.php; Helfer und Zähler stehen dort).
 *
 * Geprüft wird an fünf Türen: auth.php?action=me, analytics-config.php (GET, Feld geo_api_key nur für den
 * Admin) und drei Türen hinter requireAuth() in verschiedenen Dateien (analytics-status.php, orders.php,
 * email.php?action=list). Jede Tür bekommt eine eigene Sitzung von vor dem Ereignis, weil die erste Tür,
 * die die Marke prüft, ihre Sitzung abräumt.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

const TUEREN = ['/analytics-status.php', '/orders.php', '/email.php?action=list'];
define('TEXT_503', json_encode(['error' => 'Anmeldung derzeit nicht prüfbar']));

/** Status je Tür, jede mit eigener Sitzung aus $sitzungen. */
function tuerenStatus(array $u, array $sitzungen): array {
    $status = [];
    foreach (TUEREN as $nr => $pfad) {
        $status[] = anfrage($u, 'GET', $pfad, null, $sitzungen[$nr])['status'];
    }
    return $status;
}

function angemeldetLautMe(array $u, array $sitzung): ?bool {
    $a = anfrage($u, 'GET', '/auth.php?action=me', null, $sitzung);
    return $a['status'] === 200 ? ($a['json']['authenticated'] ?? null) : null;
}

function mitSchluessel(array $u, array $sitzung): bool {
    $a = anfrage($u, 'GET', '/analytics-config.php', null, $sitzung);
    return strpos($a['text'], 'geo_api_key') !== false;
}

/** Schreibt eine Sitzungsdatei von Hand und gibt die Kopfzeile dazu zurück. */
function handSitzung(array $u, string $kennung, string $inhalt): array {
    file_put_contents($u['sitzungen'] . '/sess_' . $kennung, $inhalt);
    return ['Cookie: PHPSESSID=' . $kennung];
}

// ─── Fall S1: angemeldet, dann Hash getauscht ────────────────────────────────
echo "\n== Fall S1: Hash in der Datenbank getauscht ==\n";
$u = starte($apiQuelle);
$s = [];
for ($i = 0; $i < 5; $i++) {
    $s[$i] = sitzung($u);
}
pruefe('vor dem Tausch: me meldet angemeldet', angemeldetLautMe($u, $s[3]) === true);
pruefe('vor dem Tausch: drei Türen hinter requireAuth (analytics-status, orders, email list) je 200',
    tuerenStatus($u, $s) === [200, 200, 200], implode(',', tuerenStatus($u, $s)));
pruefe('vor dem Tausch: analytics-config.php liefert dem Admin das Feld geo_api_key', mitSchluessel($u, $s[4]));
pruefe('zweiter Abruf mit derselben Sitzung: weiter angemeldet (die Prüfung räumt eine gültige Sitzung nicht ab)',
    angemeldetLautMe($u, $s[3]) === true && tuerenStatus($u, $s) === [200, 200, 200]);
$hash = hashVon($u, 'chef');
$sitzungsdateien = implode("\n", array_map('file_get_contents', glob($u['sitzungen'] . '/sess_*') ?: []));
pruefe('Sitzungsdatei trägt eine Marke aus 16 Hex-Zeichen und enthält den Passwort-Hash nicht',
    preg_match('/pw_marke\|s:16:"[0-9a-f]{16}";/', $sitzungsdateien) === 1 && strpos($sitzungsdateien, $hash) === false);

tauscheHash($u, 'chef', NEU);
$a = anfrage($u, 'GET', '/analytics-status.php', null, $s[0]);
pruefe('Hash getauscht: geschützte Tür (analytics-status.php) 401', $a['status'] === 401, kurz($a));
$a = anfrage($u, 'GET', '/orders.php', null, $s[1]);
pruefe('Hash getauscht: orders.php GET 401', $a['status'] === 401, kurz($a));
$a = anfrage($u, 'GET', '/email.php?action=list', null, $s[2]);
pruefe('Hash getauscht: email.php?action=list 401', $a['status'] === 401, kurz($a));
pruefe('Hash getauscht: me meldet unangemeldet', angemeldetLautMe($u, $s[3]) === false);
pruefe('Hash getauscht: analytics-config.php ohne Feld geo_api_key', !mitSchluessel($u, $s[4]));
$a = anmelden($u, 'chef', ALT);
pruefe('altes Passwort: 401', $a['status'] === 401, kurz($a));
$neu = sitzung($u, 'chef', NEU);
pruefe('neue Anmeldung mit dem neuen Passwort: me angemeldet, Tür 200, Feld geo_api_key da',
    angemeldetLautMe($u, $neu) === true && anfrage($u, 'GET', '/orders.php', null, $neu)['status'] === 200 && mitSchluessel($u, $neu));
$a = anfrage($u, 'POST', '/auth.php?action=logout', '{}', $neu);
pruefe('Abmelden wie bisher: danach me unangemeldet', $a['status'] === 200 && angemeldetLautMe($u, $neu) === false, kurz($a));

// ─── Fall S2: Hash getauscht durch das Werkzeug auf der Kommandozeile ────────
echo "\n== Fall S2: Passwort neu gesetzt mit admin-passwort-setzen.php ==\n";
$u = starte($apiQuelle);
$s = [sitzung($u), sitzung($u), sitzung($u), sitzung($u), sitzung($u)];
$vorher = hashVon($u, 'chef');
// Das Werkzeug verlangt ein Terminal an der Ausgabe; script stellt eines. Es liest Passwort und Wiederholung.
$befehl = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($u['api'] . '/admin-passwort-setzen.php') . ' setzen chef';
$rohre = [];
$prozess = proc_open('script -qec ' . escapeshellarg($befehl) . ' /dev/null',
    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohre);
fwrite($rohre[0], NEU . "\n" . NEU . "\n");
fclose($rohre[0]);
$ausgabe = stream_get_contents($rohre[1]) . stream_get_contents($rohre[2]);
$exit = proc_close($prozess);
pruefe('Werkzeug setzt das Passwort (Exit 0, Hash in der Tabelle neu)',
    $exit === 0 && hashVon($u, 'chef') !== $vorher && password_verify(NEU, hashVon($u, 'chef')), "Exit $exit " . substr(trim($ausgabe), -120));
pruefe('nach dem Werkzeug: Sitzungen von vorher an drei Türen je 401', tuerenStatus($u, $s) === [401, 401, 401], implode(',', tuerenStatus($u, $s)));
pruefe('nach dem Werkzeug: me unangemeldet, analytics-config.php ohne Feld geo_api_key',
    angemeldetLautMe($u, $s[3]) === false && !mitSchluessel($u, $s[4]));
$neu = sitzung($u, 'chef', NEU);
pruefe('nach dem Werkzeug: Anmeldung mit dem neuen Passwort gilt', angemeldetLautMe($u, $neu) === true);

// ─── Fall S3: Sitzungen ohne oder mit falscher Marke ─────────────────────────
echo "\n== Fall S3: Sitzung ohne passende Marke ==\n";
$u = starte($apiQuelle);
$grund = 'user_id|i:1;username|s:4:"chef";display_name|s:4:"Chef";';
$arten = [
    'ohne Marke (wie aus der Zeit vor diesem Stand)' => $grund,
    'mit erfundener Marke' => $grund . 'pw_marke|s:16:"0123456789abcdef";',
    'mit Marke als Zahl' => $grund . 'pw_marke|i:1;',
    'mit leerer Marke' => $grund . 'pw_marke|s:0:"";',
];
$nr = 0;
foreach ($arten as $name => $inhalt) {
    $nr++;
    $t = [];
    for ($i = 0; $i < 5; $i++) {
        $t[$i] = handSitzung($u, 'handsitzung' . $nr . 'x' . $i . 'aaaaaaaaaaaaaaaa', $inhalt);
    }
    pruefe("Sitzung $name: drei Türen je 401, me unangemeldet, kein Feld geo_api_key",
        tuerenStatus($u, $t) === [401, 401, 401] && angemeldetLautMe($u, $t[3]) === false && !mitSchluessel($u, $t[4]),
        implode(',', tuerenStatus($u, $t)));
}
$richtig = substr(hash('sha256', hashVon($u, 'chef')), 0, 16);
$t = handSitzung($u, 'handsitzung9aaaaaaaaaaaaaaaaaa', $grund . 'pw_marke|s:16:"' . $richtig . '";');
pruefe('Gegenprobe: dieselbe Sitzung mit der Marke zum heutigen Hash gilt', angemeldetLautMe($u, $t) === true);
$t = handSitzung($u, 'handsitzung8aaaaaaaaaaaaaaaaaa', 'chat_requests|a:0:{}');
pruefe('Sitzung ohne Anmeldung (nur Chat-Zähler): Tür 401, me unangemeldet',
    anfrage($u, 'GET', '/orders.php', null, $t)['status'] === 401 && angemeldetLautMe($u, $t) === false);
pruefe('ganz ohne Sitzung: Tür 401, me unangemeldet',
    anfrage($u, 'GET', '/orders.php')['status'] === 401 && angemeldetLautMe($u, []) === false);

// ─── Fall S4: zwei Admins, gelöschter Admin ──────────────────────────────────
echo "\n== Fall S4: nur die Sitzungen des betroffenen Admins enden ==\n";
$u = starte($apiQuelle, ['chef', 'zwei']);
$chef = sitzung($u, 'chef');
$zwei = [sitzung($u, 'zwei'), sitzung($u, 'zwei')];
tauscheHash($u, 'zwei', NEU);
pruefe('Hash von "zwei" getauscht: dessen Sitzung endet (me unangemeldet, Tür 401)',
    angemeldetLautMe($u, $zwei[0]) === false && anfrage($u, 'GET', '/orders.php', null, $zwei[1])['status'] === 401);
$a = anfrage($u, 'GET', '/auth.php?action=me', null, $chef);
pruefe('Hash von "zwei" getauscht: die Sitzung von "chef" gilt weiter und nennt "chef"',
    ($a['json']['authenticated'] ?? null) === true && ($a['json']['user']['username'] ?? null) === 'chef'
    && anfrage($u, 'GET', '/orders.php', null, $chef)['status'] === 200, kurz($a));
$chef2 = sitzung($u, 'chef');
db($u)->exec("DELETE FROM admin_users WHERE username = 'chef'");
pruefe('Admin-Zeile gelöscht: dessen Sitzungen enden (me unangemeldet, Tür 401)',
    angemeldetLautMe($u, $chef) === false && anfrage($u, 'GET', '/orders.php', null, $chef2)['status'] === 401);

// ─── Fall S5: Datenbank nicht lesbar ─────────────────────────────────────────
echo "\n== Fall S5: Datenbank nicht lesbar ==\n";
$u = starte($apiQuelle);
$s = [sitzung($u), sitzung($u), sitzung($u), sitzung($u), sitzung($u)];
foreach (glob($u['daten'] . '/database.sqlite*') as $datei) {
    unlink($datei);
}
file_put_contents($u['daten'] . '/database.sqlite', str_repeat("keine Datenbank\n", 400));
$a = anfrage($u, 'GET', '/analytics-status.php', null, $s[0]);
pruefe('Datenbank nicht lesbar: geschützte Tür 503 mit festem Text statt angemeldet', $a['status'] === 503 && trim($a['text']) === TEXT_503, kurz($a));
$a = anfrage($u, 'GET', '/orders.php', null, $s[1]);
$b = anfrage($u, 'GET', '/email.php?action=list', null, $s[2]);
pruefe('Datenbank nicht lesbar: orders.php und email.php?action=list je 503', $a['status'] === 503 && $b['status'] === 503, kurz($a) . ' / ' . kurz($b));
$a = anfrage($u, 'GET', '/auth.php?action=me', null, $s[3]);
pruefe('Datenbank nicht lesbar: me 503 mit festem Text statt angemeldet', $a['status'] === 503 && trim($a['text']) === TEXT_503, kurz($a));
$a = anfrage($u, 'GET', '/analytics-config.php', null, $s[4]);
// Diese Tür öffnet die Datenbank schon vor der Prüfung der Sitzung und endet dort; geprüft wird, dass kein Schlüsselfeld herauskommt.
pruefe('Datenbank nicht lesbar: analytics-config.php liefert kein Feld geo_api_key', !array_key_exists('geo_api_key', $a['json']), kurz($a));
$a = anfrage($u, 'GET', '/orders.php');
pruefe('Datenbank nicht lesbar, ohne Sitzung: Tür 401 (wer nicht angemeldet ist, erfährt nichts vom Zustand)', $a['status'] === 401, kurz($a));

// ─── Fall S6: Einrichtung (setup) legt die Marke ─────────────────────────────
echo "\n== Fall S6: Sitzung aus der Ersteinrichtung ==\n";
// Der Schalter SETUP_ERLAUBT existiert nicht in jedem geprüften Stand; wo es ihn gibt, steht er hier auf offen.
$u = starte($apiQuelle, [], 1, ['auth.php' => ['const SETUP_ERLAUBT = false;' => 'const SETUP_ERLAUBT = true;']]);
$a = anfrage($u, 'POST', '/auth.php?action=setup', json_encode(['username' => 'erster', 'password' => NEU]));
$kopf = ['Cookie: ' . $a['cookie']];
pruefe('Ersteinrichtung bei leerer Tabelle: 200 mit Sitzung', $a['status'] === 200 && $a['cookie'] !== null, kurz($a));
pruefe('nach setup: me angemeldet und geschützte Tür 200',
    angemeldetLautMe($u, $kopf) === true && anfrage($u, 'GET', '/orders.php', null, $kopf)['status'] === 200);
