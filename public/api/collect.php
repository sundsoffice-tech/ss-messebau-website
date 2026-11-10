<?php
/**
 * S&S Messebau - Analytics Event Collection Endpoint (Enterprise)
 * POST: Receives batched tracking events from the frontend
 * Rate-limited, no auth required (public endpoint)
 * Supports: visitor_id for cross-session tracking, new event types
 */

require_once __DIR__ . '/db.php';

// ─── Grenzen des Zuflusses ──────────────────────────────────────────────────
// Der Endpunkt ist öffentlich. Die Bremse je Adresse weiter unten (60 Anfragen
// je Minute, also bis zu 3.000 Ereignisse) hält einen einzelnen Absender auf,
// aber nicht viele Adressen zugleich. Die Grenzen hier gelten für alle zusammen.
// Antwort und Statuscode für den Browser ändern sich dadurch nicht.

// Zeitstempel: Das Feld "ts" kommt vom Besucher. Gespeichert wird es nur, wenn
// es das Format des Browsers hat (toISOString, etwa 2026-11-10T14:03:27.512Z)
// und in einem Fenster um die Serverzeit liegt; sonst gilt die Serverzeit.
// Grund: Die Fristen der Bereinigung hängen an "ts". Mit einem alten Zeitstempel
// ließe sich Altlast einfüllen, die sofort fällig ist; ein Zeitstempel in der
// Zukunft bliebe länger liegen, als die Datenschutzerklärung zusagt; ein Text
// wie "now", den strtotime() auch annimmt, fiele aus jedem Vergleich heraus.
// 24 Stunden zurück: Der Browser hält Ereignisse in einer Warteschlange im
// localStorage (src/lib/analytics-tracker.ts) und sendet sie 2 Sekunden nach
// dem Einreihen und beim Verlassen des Tabs; liegen bleibt nur, was nicht
// zugestellt werden konnte (Netz weg, Tab vorher zu), und das geht beim
// nächsten Seitenaufruf mit. Ein Tag deckt den Besuch, der am selben oder am
// nächsten Tag fortgesetzt wird; Älteres zählt mit der Ankunftszeit. Länger
// darf das Fenster nicht sein: Die kürzeste Frist (Herzschlag) ist 24 Stunden.
// 5 Minuten voraus: Spielraum für falsch gehende Uhren der Besucher.
define('COLLECT_TS_ZURUECK', 86400);
define('COLLECT_TS_VORAUS', 300);

// Gesamtdeckel: höchstens so viele gespeicherte Ereignisse in 60 Sekunden über
// alle Adressen. Was darüber liegt, wird nicht gespeichert und in der Zähldatei
// gezählt; die Antwort bleibt dieselbe.
// Rechnung für 400:
//   Gewöhnlicher Verkehr: ein sichtbarer Tab sendet 2 Herzschläge je Minute
//   (alle 30 s, src/hooks/use-heartbeat.ts); ein Seitenaufruf bringt dazu in
//   seiner dichtesten Minute bis zu 12 Ereignisse (session_start, page_view,
//   performance, bis zu 5 scroll_depth, page_engagement, tab_visibility,
//   Klicks), zusammen 14. 400 je Minute tragen 200 offene Tabs, 100 lesende
//   Besucher (4 je Minute) oder 28 Besucher, die alle gleichzeitig in ihrer
//   dichtesten Minute sind. Die Firmenseite hat davon einen Bruchteil.
//   Abbau der Bereinigung: gemessen 55.000 bis 59.000 Zeilen je Lauf, ein Lauf
//   je 63 Sekunden (Testserver). Für Hostinger angenommen bis Faktor 25
//   langsamer: 2.200 Zeilen je Lauf, rund 2.100 je Minute. 400 liegt um den
//   Faktor 5 darunter, der Abbau gewinnt also auch im schlechten Fall.
// Der echte Bedarf ist nicht gemessen; die Zähldatei führt dafür die Zahlen
// des Tages (angenommen, verworfen, dichteste Minute).
define('COLLECT_GESAMT_JE_MINUTE', 400);
// Der Name passt absichtlich in kein Muster von analytics-cleanup.php: Die
// Zahlen des Tages sollen nicht nach einer Stunde Ruhe verschwinden. Die Datei
// trägt keine Adresse und keine Kennung, nur Zahlen, und liegt im gesperrten
// Datenordner (nicht öffentlich).
define('COLLECT_GESAMT_DATEI', __DIR__ . '/data/collect_gesamt.json');

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Simple rate limiting by IP (max 60 requests/minute)
$rateLimitFile = __DIR__ . '/data/rate_limit_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.json';
$now = time();

$rateData = ['timestamps' => []];
$rateLimited = false;

$fp = @fopen($rateLimitFile, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
    $raw = stream_get_contents($fp);
    if ($raw) {
        $rateData = json_decode($raw, true) ?: ['timestamps' => []];
    }

    // Remove timestamps older than 60 seconds
    $rateData['timestamps'] = array_values(array_filter(
        $rateData['timestamps'],
        function($ts) use ($now) { return ($now - $ts) < 60; }
    ));

    if (count($rateData['timestamps']) >= 60) {
        $rateLimited = true;
    } else {
        $rateData['timestamps'][] = $now;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($rateData));
    flock($fp, LOCK_UN);
    fclose($fp);
} else {
    if ($fp) fclose($fp);
}

if ($rateLimited) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}

// Enforce request body size limit
enforceRequestBodyLimit();

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['events']) || !is_array($input['events'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload: events array required']);
    exit;
}

$events = $input['events'];
if (count($events) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Too many events (max 50)']);
    exit;
}

// Check global tracking toggle
// Jeder Lesebefehl wird gleich nach dem Lesen geschlossen (collectKonfig):
// Bleibt er offen, hält die Verbindung ihren Lesestand fest, und jeder
// Schreibbefehl darauf scheitert sofort mit "database is locked", sobald ein
// anderer Aufruf inzwischen geschrieben hat (etwa eine Portion der Bereinigung).
$db = getDB();
if (collectKonfig($db, 'enabled') === '0') {
    echo json_encode(['ok' => true, 'stored' => 0, 'message' => 'Tracking disabled']);
    exit;
}

// Get enabled events list
$enabledEventsRoh = collectKonfig($db, 'enabled_events');
$enabledEvents = $enabledEventsRoh !== null ? json_decode($enabledEventsRoh, true) : null;

// Allowed event names (extended)
$validEvents = [
    'page_view', 'cta_click', 'form_submit', 'phone_click',
    'whatsapp_click', 'download', 'scroll_depth', 'page_engagement',
    'blog_article_read', 'heartbeat', 'session_start', 'session_end',
    'form_interaction', 'form_abandon', 'exit_intent', 'configurator_step',
    'outbound_click', 'video_play', 'error', 'performance',
    'search', 'tab_visibility'
];

// 1. Prüfen: was von diesem POST überhaupt gespeichert werden dürfte.
$zeilen = [];
foreach ($events as $ev) {
    if (!is_array($ev)) continue;

    $eventName = $ev['event'] ?? '';
    if (!in_array($eventName, $validEvents, true)) continue;

    // Check per-event toggle
    if ($enabledEvents !== null && isset($enabledEvents[$eventName]) && !$enabledEvents[$eventName]) {
        continue;
    }

    // Sanitize: no PII allowed in url/referrer
    $zeilen[] = [
        'event' => $eventName,
        'ts' => collectZeitstempel($ev['ts'] ?? null, $now),
        'session_id' => collectText($ev['session_id'] ?? '', 64),
        'visitor_id' => collectText($ev['visitor_id'] ?? '', 64),
        'url' => collectText($ev['url'] ?? '', 2048),
        'referrer' => collectText($ev['referrer'] ?? '', 2048),
        'utm_source' => collectText($ev['utm_source'] ?? '', 255),
        'utm_medium' => collectText($ev['utm_medium'] ?? '', 255),
        'utm_campaign' => collectText($ev['utm_campaign'] ?? '', 255),
        'utm_content' => collectText($ev['utm_content'] ?? '', 255),
        'utm_term' => collectText($ev['utm_term'] ?? '', 255),
        'props' => isset($ev['props']) && is_array($ev['props']) ? $ev['props'] : [],
    ];
}

// 2. Gesamtdeckel: wie viele davon in dieser Minute noch Platz haben.
$geprueft = count($zeilen);
$still = 0; // über dem Deckel: nicht gespeichert, dem Browser nicht gemeldet
if ($geprueft > 0) {
    $erlaubt = collectGesamtdeckel(COLLECT_GESAMT_DATEI, $geprueft, COLLECT_GESAMT_JE_MINUTE, $now);
    if ($erlaubt === null) {
        // Ohne Zähler kein Deckel, ohne Deckel keine Speicherung.
        error_log('Analytics collect: Zähler des Gesamtdeckels nicht nutzbar, ' . $geprueft . ' Ereignisse nicht gespeichert');
        $zeilen = [];
    } else {
        $still = $geprueft - $erlaubt;
        $zeilen = array_slice($zeilen, 0, $erlaubt);
    }
}

// 3. Ortung für session_start: nur für Ereignisse, die gespeichert werden, und
// vor der Transaktion, weil der Abruf bis zu 2 Sekunden dauern kann und die
// Schreibsperre der Datenbank so lange nicht halten soll.
$geoEnabled = null;
$geoApiKey = '';
foreach ($zeilen as $i => $zeile) {
    // Server-side geolocation for session_start events
    if ($zeile['event'] !== 'session_start' || !empty($zeile['props']['geo_city'])) {
        continue;
    }
    if ($geoEnabled === null) {
        $geoEnabled = collectKonfig($db, 'geo_enabled') === '1';
        $geoApiKey = $geoEnabled ? trim((string)collectKonfig($db, 'geo_api_key')) : '';
    }
    if ($geoEnabled) {
        $geoData = resolveGeoFromIP($geoApiKey);
        if ($geoData) {
            $zeilen[$i]['props']['geo_city'] = $geoData['city'];
            $zeilen[$i]['props']['geo_region_name'] = $geoData['regionName'];
            $zeilen[$i]['props']['geo_country_code'] = $geoData['countryCode'];
            $zeilen[$i]['props']['geo_country_name'] = $geoData['country'];
        }
    }
}

// 4. Speichern: eine Transaktion je POST statt eines Commits je Ereignis. Die
// Schreibsperre wird so einmal geholt statt bis zu 50-mal, und ein fremder
// Commit zwischen zwei Ereignissen kann den Rest nicht mehr scheitern lassen.
$stored = 0;
if ($zeilen !== []) {
    try {
        $stmt = $db->prepare("
            INSERT INTO analytics_events (event, ts, session_id, visitor_id, url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, props)
            VALUES (:event, :ts, :session_id, :visitor_id, :url, :referrer, :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :props)
        ");
        $db->beginTransaction();
        foreach ($zeilen as $zeile) {
            try {
                $stmt->execute([
                    ':event' => $zeile['event'],
                    ':ts' => $zeile['ts'],
                    ':session_id' => $zeile['session_id'],
                    ':visitor_id' => $zeile['visitor_id'],
                    ':url' => $zeile['url'],
                    ':referrer' => $zeile['referrer'],
                    ':utm_source' => $zeile['utm_source'],
                    ':utm_medium' => $zeile['utm_medium'],
                    ':utm_campaign' => $zeile['utm_campaign'],
                    ':utm_content' => $zeile['utm_content'],
                    ':utm_term' => $zeile['utm_term'],
                    ':props' => !empty($zeile['props']) ? json_encode($zeile['props']) : null,
                ]);
                $stored++;
            } catch (Exception $e) {
                // Log error but continue
                error_log('Analytics collect error: ' . $e->getMessage());
            }
        }
        $db->commit();
    } catch (Exception $e) {
        // Die Transaktion kam nicht zustande oder ließ sich nicht bestätigen:
        // Dann ist von diesem POST nichts gespeichert.
        $stored = 0;
        error_log('Analytics collect error: ' . $e->getMessage());
        try {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
        } catch (Exception $e2) {
            // nichts mehr zu tun
        }
    }
}

// Antwort wie bisher. Was über dem Gesamtdeckel lag, zählt hier mit: Die Zahl
// der verworfenen Ereignisse steht nur in der Zähldatei, nicht in der Antwort.
echo json_encode(['ok' => true, 'stored' => $stored + $still]);

// Anstoß der Bereinigung, zweiter Weg neben health.php: nur, wenn heute noch
// nicht vollständig geräumt ist (bei großer Altlast in Teilläufen im Abstand
// von mindestens 60 Sekunden), und erst nach dem Ende dieses Skripts. Die
// Antwort oben steht schon; ein Fehler hier steht nur im Fehlerprotokoll.
try {
    if ((@include_once __DIR__ . '/bereinigung-anstoss.php') !== false
        && function_exists('bereinigungVormerken')) {
        bereinigungVormerken();
    }
} catch (\Throwable $e) {
    error_log('Bereinigung: Anstoß aus collect.php gescheitert: ' . $e->getMessage());
}

/**
 * Ein Wert aus analytics_config oder null, wenn die Zeile fehlt. Der
 * Lesebefehl wird geschlossen, bevor die Funktion zurückkehrt.
 */
function collectKonfig(PDO $db, string $schluessel): ?string {
    $stmt = $db->prepare('SELECT config_value FROM analytics_config WHERE config_key = :schluessel');
    $stmt->execute([':schluessel' => $schluessel]);
    $wert = $stmt->fetchColumn();
    $stmt->closeCursor();
    return $wert === false ? null : (string)$wert;
}

/** Textfeld eines Ereignisses, gekürzt. Was kein einfacher Wert ist (Liste, Objekt), zählt als leer. */
function collectText($wert, int $laenge): string {
    return is_scalar($wert) ? substr((string)$wert, 0, $laenge) : '';
}

/**
 * Zeitstempel eines Ereignisses: der des Besuchers, wenn er das Format des
 * Browsers hat und im Fenster um die Serverzeit liegt, sonst die Serverzeit
 * (Begründung bei COLLECT_TS_ZURUECK).
 */
function collectZeitstempel($roh, int $jetzt): string {
    if (is_string($roh)
        && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|\+00:00)$/D', $roh)) {
        $zeit = strtotime($roh);
        // Der Rückweg über gmdate weist Angaben ab, die strtotime() umrechnet
        // statt ablehnt (31. Februar, Stunde 24): Ihr Text läge beim Vergleich
        // an einer anderen Stelle als ihr Zeitpunkt.
        if ($zeit !== false
            && gmdate('Y-m-d\TH:i:s', $zeit) === substr($roh, 0, 19)
            && $zeit >= $jetzt - COLLECT_TS_ZURUECK
            && $zeit <= $jetzt + COLLECT_TS_VORAUS) {
            return $roh;
        }
    }
    return gmdate('c', $jetzt);
}

/**
 * Gesamtdeckel über alle Adressen: höchstens $max gespeicherte Ereignisse in
 * 60 Sekunden, gezählt in Sekundenfächern in einer Datei unter Dateisperre
 * (Muster wie die Zähler in chat.php). Führt nebenbei die Zahlen des Tages
 * (UTC), aus denen das Haus den Bedarf und den Missbrauch liest.
 *
 * Rückgabe: wie viele der $anzahl Ereignisse gespeichert werden dürfen
 * (0 bis $anzahl), oder null, wenn der Zähler nicht nutzbar ist (Datei nicht
 * zu öffnen, zu sperren oder zu schreiben). Der Aufrufer speichert bei null nichts.
 */
function collectGesamtdeckel(string $datei, int $anzahl, int $max, int $jetzt): ?int {
    $fp = @fopen($datei, 'c+');
    if (!$fp) {
        return null;
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return null;
    }
    $stand = json_decode((string)stream_get_contents($fp), true);
    $stand = is_array($stand) ? $stand : [];
    $zahl = function ($wert): int {
        return is_int($wert) && $wert > 0 ? $wert : 0;
    };

    // Gleitendes Fenster von 60 Sekunden. abs(): Ein Fach aus der Zukunft (Uhr
    // zurückgestellt) zählt mit, aber höchstens ein Fenster lang.
    $sekunden = [];
    $belegt = 0;
    foreach (is_array($stand['sekunden'] ?? null) ? $stand['sekunden'] : [] as $sekunde => $n) {
        if (is_int($sekunde) && abs($jetzt - $sekunde) < 60 && $zahl($n) > 0) {
            $sekunden[$sekunde] = $zahl($n);
            $belegt += $zahl($n);
        }
    }
    $erlaubt = max(0, min($anzahl, $max - $belegt));
    $verworfen = $anzahl - $erlaubt;
    if ($erlaubt > 0) {
        $sekunden[$jetzt] = ($sekunden[$jetzt] ?? 0) + $erlaubt;
    }

    $tag = gmdate('Y-m-d', $jetzt);
    $heute = ($stand['tag'] ?? null) === $tag;
    $verworfenBisher = $heute ? $zahl($stand['verworfen_tag'] ?? null) : 0;
    $neu = [
        'tag' => $tag,
        'angenommen_tag' => ($heute ? $zahl($stand['angenommen_tag'] ?? null) : 0) + $erlaubt,
        'verworfen_tag' => $verworfenBisher + $verworfen,
        // dichteste Minute des Tages: gespeicherte Ereignisse in 60 Sekunden
        'spitze_tag' => max($heute ? $zahl($stand['spitze_tag'] ?? null) : 0, $belegt + $erlaubt),
        'verworfen_gesamt' => $zahl($stand['verworfen_gesamt'] ?? null) + $verworfen,
        'deckel' => $max,
    ];
    if (!$heute && is_string($stand['tag'] ?? null)) {
        // Tageswechsel: die Zahlen des letzten Tages mit Verkehr bleiben stehen.
        $neu['vortag'] = [
            'tag' => $stand['tag'],
            'angenommen' => $zahl($stand['angenommen_tag'] ?? null),
            'verworfen' => $zahl($stand['verworfen_tag'] ?? null),
            'spitze' => $zahl($stand['spitze_tag'] ?? null),
        ];
    } elseif (is_array($stand['vortag'] ?? null)) {
        $neu['vortag'] = [
            'tag' => is_string($stand['vortag']['tag'] ?? null) ? $stand['vortag']['tag'] : '',
            'angenommen' => $zahl($stand['vortag']['angenommen'] ?? null),
            'verworfen' => $zahl($stand['vortag']['verworfen'] ?? null),
            'spitze' => $zahl($stand['vortag']['spitze'] ?? null),
        ];
    }
    $neu['sekunden'] = $sekunden;
    if ($verworfen > 0 && $verworfenBisher === 0) {
        // Einmal je Tag, nicht je verworfenem Ereignis
        error_log('Analytics collect: Gesamtdeckel von ' . $max . ' Ereignissen je Minute am ' . $tag
            . ' erreicht, weitere Ereignisse werden nicht gespeichert');
    }

    $text = json_encode($neu);
    // Erst überschreiben, dann auf die neue Länge kürzen: So steht zu keinem
    // Zeitpunkt eine leere Datei da, die als Zählerstand null gelesen würde.
    $geschrieben = rewind($fp)
        && fwrite($fp, $text) === strlen($text)
        && ftruncate($fp, strlen($text))
        && fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $geschrieben ? $erlaubt : null;
}

/**
 * Resolve approximate location from client IP using ip-api.com.
 * Without API key: http://ip-api.com (free, 45 req/min, HTTP only)
 * With API key: https://pro.ip-api.com (HTTPS, higher limits)
 * The IP is NOT stored — only the resolved geo data is returned.
 */
function resolveGeoFromIP(string $apiKey = ''): ?array {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (empty($ip) || $ip === '127.0.0.1' || $ip === '::1') return null;

    // File-based cache (24h TTL) using md5 hash of IP as filename
    $cacheDir = __DIR__ . '/data/geocache/';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);

    $cacheKey = md5($ip);
    $cacheFile = $cacheDir . $cacheKey . '.json';

    if (file_exists($cacheFile) && filemtime($cacheFile) > time() - 86400) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if ($cached) return $cached;
    }

    // Build API URL based on whether we have a key
    if (!empty($apiKey)) {
        $url = "https://pro.ip-api.com/json/{$ip}?key=" . urlencode($apiKey) . "&fields=status,country,countryCode,regionName,city";
    } else {
        $url = "http://ip-api.com/json/{$ip}?fields=status,country,countryCode,regionName,city";
    }

    $ctx = stream_context_create([
        'http' => ['timeout' => 2, 'ignore_errors' => true]
    ]);
    $response = @file_get_contents($url, false, $ctx);

    if (!$response) return null;

    $data = json_decode($response, true);
    if (!$data || ($data['status'] ?? '') !== 'success') return null;

    $result = [
        'country' => $data['country'] ?? '',
        'countryCode' => $data['countryCode'] ?? '',
        'regionName' => $data['regionName'] ?? '',
        'city' => $data['city'] ?? '',
    ];
    @file_put_contents($cacheFile, json_encode($result));

    return $result;
}
