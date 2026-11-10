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

// Zustand des KI-Chats: "frei" oder "deckel_erreicht" (Tagesdeckel aus
// chat.php für heute verbraucht, der Chat antwortet allen bis Mitternacht
// Europe/Berlin mit 429). Der Wächter auf sunds-hub prüft auf "chat": "frei"
// (Ziel "Messebau-Website KI-Chat" in ops/sunds-hub/eintragen.py), damit das
// Haus einen geschlossenen Chat bemerkt.
// Hier steht nur der Zustand, nie die Zahl: Der Endpunkt ist öffentlich, und
// die Zahl zeigte Mitbewerbern den Anfragefluss. Die Zahlen liest der
// angemeldete Admin über chat.php?tageszahlen=1.
// "status" bleibt dabei "ok": Ein geschlossener Chat ist keine Störung der
// Website, das Ziel "Messebau-Website API/Datenbank" soll deshalb nicht rot werden.
// Gelesen wird ohne Sperre, damit Abrufe dieses öffentlichen Endpunkts den
// Zähler des Chats nicht aufhalten können. chat.php schreibt "anzahl" und
// "deckel" in die Datei; fehlt sie oder ist sie von gestern, ist der Chat frei.
$checks['chat'] = 'frei';
$chatStand = json_decode((string)@file_get_contents($dataDir . '/chat_tagesdeckel.json'), true);
$chatHeute = (new DateTimeImmutable('now', new DateTimeZone('Europe/Berlin')))->format('Y-m-d');
if (is_array($chatStand)
    && ($chatStand['tag'] ?? null) === $chatHeute
    && is_int($chatStand['anzahl'] ?? null)
    && is_int($chatStand['deckel'] ?? null)
    && $chatStand['deckel'] > 0
    && $chatStand['anzahl'] >= $chatStand['deckel']) {
    $checks['chat'] = 'deckel_erreicht';
}

// Die PHP-Fassung steht hier absichtlich nicht mehr: Der Endpunkt ist
// öffentlich, und die genaue Fassung sagt einem Angreifer, welche bekannten
// Lücken er probieren kann. Gelesen hat das Feld niemand (der Wächter auf
// sunds-hub prüft nur die Zeichenketten zu "status", "database" und "chat",
// siehe ops/sunds-hub/eintragen.py).

// Timestamp
$checks['timestamp'] = gmdate('c');

echo json_encode([
    'status' => $status,
    'checks' => $checks,
], JSON_PRETTY_PRINT);
