<?php
/**
 * S&S Messebau - Health Check Endpoint
 * Returns system health status for monitoring
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Anstoß der Bereinigung (Messdaten nach ihrer Frist, Zähldateien mit
// IP-Bezug): Der Wächter des Hauses ruft diesen Endpunkt regelmäßig ab, deshalb
// läuft sie von hier auch an Tagen ohne Besucher: nach einem vollständigen Lauf
// am selben Tag nicht noch einmal, bei großer Altlast in Teilläufen im Abstand
// von mindestens 60 Sekunden, bis nichts Fälliges mehr da ist; immer erst nach
// dem Ende dieses Skripts. "status" und "checks" hängen davon nicht
// ab: Fehlt die Datei oder scheitert der Lauf, steht das nur im Fehlerprotokoll.
// Sichtbar wird Stillstand in "checks.bereinigung" (unten): "ok" oder
// "ueberfaellig", gelesen aus der Marke des Anstoßes. Lässt sich der Zustand
// nicht bestimmen (Datei fehlt oder ist kaputt), gilt er als überfällig.
$bereinigungZustand = 'ueberfaellig';
try {
    if ((@include_once __DIR__ . '/bereinigung-anstoss.php') !== false
        && function_exists('bereinigungVormerken')) {
        if (function_exists('bereinigungZustand')) {
            $bereinigungZustand = bereinigungZustand();
        }
        bereinigungVormerken();
    }
} catch (\Throwable $e) {
    error_log('Bereinigung: Anstoß aus health.php gescheitert: ' . $e->getMessage());
}

$status = 'ok';
$checks = [];

// Check database connection
try {
    require_once __DIR__ . '/db.php';
    $db = getDB();
    $db->query('SELECT 1');
    $checks['database'] = 'ok';
} catch (Exception $e) {
    $checks['database'] = 'error';
    $status = 'degraded';
}

// Check data directory is writable
$dataDir = __DIR__ . '/data';
$checks['data_writable'] = is_writable($dataDir) ? 'ok' : 'error';
if ($checks['data_writable'] !== 'ok') {
    $status = 'degraded';
}

// Die PHP-Fassung steht hier absichtlich nicht mehr: Der Endpunkt ist
// öffentlich, und die genaue Fassung sagt einem Angreifer, welche bekannten
// Lücken er probieren kann. Gelesen hat das Feld niemand (Wächter auf
// sunds-hub prüft nur "status" und "database", siehe ops/sunds-hub/eintragen.py).

// Timestamp
$checks['timestamp'] = gmdate('c');

// Bereinigung: "ok" oder "ueberfaellig" (letzter vollständiger Lauf länger als
// zwei Tage her, siehe bereinigungZustand() in bereinigung-anstoss.php). Der
// Wächter auf sunds-hub prüft auf "bereinigung": "ok" mit einem eigenen Ziel
// (ops/sunds-hub/eintragen.py). "status" und der HTTP-Status bleiben davon
// unberührt: Wer die Bereinigung von außen aufhält, soll damit nicht den
// Alarm für API und Datenbank auslösen können. Hier steht nur der Zustand,
// keine Zahl und kein Zeitpunkt.
$checks['bereinigung'] = $bereinigungZustand;

echo json_encode([
    'status' => $status,
    'checks' => $checks,
], JSON_PRETTY_PRINT);
