<?php
/**
 * Fälle zum Feld data_writable von health.php (eingebunden von ops/tests/anmeldung_test.php).
 * Das Feld beruht auf einer echten Schreibprobe unter data/: Bei vollem Speicher meldet es "error",
 * so wie die Anmeldung dann mit 503 antwortet, und die Probe lässt nichts liegen.
 *
 * Fall H3 braucht das Kleinst-Dateisystem unter /kleinfs; dort liegt data/ der Instanz, die
 * Datenbank liegt daneben.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

function gesund(array $u): array {
    $a = anfrage($u, 'GET', '/health.php');
    return ['roh' => $a, 'status' => $a['json']['status'] ?? null, 'checks' => $a['json']['checks'] ?? []];
}

function proben(array $u): array {
    return glob($u['daten'] . '/*schreibprobe*') ?: [];
}

// ─── Fall H1: Normalfall ─────────────────────────────────────────────────────
echo "\n== Fall H1: data/ beschreibbar ==\n";
$u = starte($apiQuelle);
$g = gesund($u);
pruefe('data/ beschreibbar: status ok, data_writable ok', $g['status'] === 'ok' && ($g['checks']['data_writable'] ?? null) === 'ok', kurz($g['roh']));
pruefe('Feldliste von checks beginnt unverändert mit database, data_writable, timestamp, bereinigung, statistik',
    array_slice(array_keys($g['checks']), 0, 5) === ['database', 'data_writable', 'timestamp', 'bereinigung', 'statistik'], implode(', ', array_keys($g['checks'])));
$zeiten = [];
for ($i = 0; $i < 30; $i++) {
    $start = microtime(true);
    $g = gesund($u);
    $zeiten[] = (microtime(true) - $start) * 1000;
}
sort($zeiten);
pruefe('nach 31 Abrufen liegt keine Probe-Datei unter data/', proben($u) === [], implode(',', array_map('basename', proben($u))));
echo sprintf("INFO   health.php: Median %.1f ms, größter Wert %.1f ms über 30 Abrufe\n", $zeiten[15], $zeiten[29]);

// ─── Fall H2: Ordner ohne Schreibrecht ───────────────────────────────────────
echo "\n== Fall H2: data/ ohne Schreibrecht ==\n";
chmod($u['daten'], 0555);
$g = gesund($u);
chmod($u['daten'], 0755);
pruefe('data/ ohne Schreibrecht: data_writable error, status degraded (wie bisher)',
    ($g['checks']['data_writable'] ?? null) === 'error' && $g['status'] === 'degraded', kurz($g['roh']));

// ─── Fall H3: Speicher voll ──────────────────────────────────────────────────
echo "\n== Fall H3: Speicher unter data/ voll ==\n";
$klein = kleinOrdner();
pruefe('Kleinst-Dateisystem unter /kleinfs vorhanden (docker run --tmpfs /kleinfs:size=256k,mode=1777)', $klein !== null);
if ($klein !== null) {
    $u = starte($apiQuelle, ['chef'], 1, [], $klein);
    $g = gesund($u);
    pruefe('data/ auf dem Kleinst-Dateisystem, noch Platz: database ok, data_writable ok',
        ($g['checks']['database'] ?? null) === 'ok' && ($g['checks']['data_writable'] ?? null) === 'ok', kurz($g['roh']));
    touch(bremsdatei($u, '127.0.9.60'));
    $fuellung = fuelle($klein);
    $g = gesund($u);
    pruefe('Speicher voll: data_writable error und status degraded, obwohl der Ordner beschreibbar ist',
        is_writable($u['daten']) && ($g['checks']['data_writable'] ?? null) === 'error' && $g['status'] === 'degraded', kurz($g['roh']));
    pruefe('Speicher voll: database bleibt ok (die Datenbank liegt nicht auf dem vollen Dateisystem)',
        ($g['checks']['database'] ?? null) === 'ok', kurz($g['roh']));
    $a = anmelden($u, 'chef', ALT, '127.0.9.60');
    pruefe('Speicher voll: die Anmeldung antwortet zur selben Zeit mit 503 (Feld und Anmeldung stimmen überein)', $a['status'] === 503, kurz($a));
    pruefe('Speicher voll: keine Probe-Datei bleibt liegen', proben($u) === [], implode(',', array_map('basename', proben($u))));
    unlink($fuellung);
    $g = gesund($u);
    $a = anmelden($u, 'chef', ALT, '127.0.9.60');
    pruefe('Gegenprobe mit Platz: data_writable wieder ok, status ok, Anmeldung 200',
        ($g['checks']['data_writable'] ?? null) === 'ok' && $g['status'] === 'ok' && $a['status'] === 200, kurz($g['roh']) . ' / ' . kurz($a));
    kleinWeg($klein);
}
