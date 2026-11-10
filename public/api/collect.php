<?php
/**
 * S&S Messebau - Analytics Event Collection Endpoint (Enterprise)
 * POST: Receives batched tracking events from the frontend
 * Rate-limited, no auth required (public endpoint)
 * Supports: visitor_id for cross-session tracking, new event types
 */

require_once __DIR__ . '/db.php';
// Ort der Zähldatei und der Lauf "Deckel erreicht", den health.php liest.
require_once __DIR__ . '/statistik-zaehler.php';

// ─── Grenzen des Zuflusses ──────────────────────────────────────────────────
// Der Endpunkt ist öffentlich. Vier Grenzen, in dieser Reihenfolge:
//   1. Anfragen je Adresse (60 je Minute, weiter unten),
//   2. Größe je Ereignis (Textfelder gekürzt, "props" höchstens COLLECT_PROPS_BYTES),
//   3. gespeicherte Ereignisse je Adresse und Minute (COLLECT_ADRESSE_JE_MINUTE),
//   4. gespeicherte Ereignisse je Minute über alle Adressen (COLLECT_GESAMT_JE_MINUTE).
// Antwort und Statuscode für den Browser ändern sich dadurch nicht, mit zwei
// Ausnahmen, bei denen der Browser den Stapel behalten soll (er wertet nur den
// Status aus): Sind die Zähler für 3 oder 4 nicht nutzbar, antwortet der
// Endpunkt mit 503 statt still nichts zu speichern. Ist der Anteil der Adresse
// (3) aufgebraucht und nimmt vom Stapel nichts an, antwortet er mit 429 wie
// die Grenze 1 (siehe dort).

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
// Ort und Begründung des Namens: statistik-zaehler.php.
define('COLLECT_GESAMT_DATEI', STATISTIK_ZAEHLDATEI);

// Anteil je Adresse am Gesamtdeckel: höchstens so viele gespeicherte Ereignisse
// in 60 Sekunden von einer Adresse (IPv6: von einem /64-Präfix). Die Bremse
// weiter unten zählt Anfragen, nicht Ereignisse: Mit 8 Anfragen zu 50
// Ereignissen füllte eine Adresse den Gesamtdeckel allein, und jeder echte
// Besuch der Minute ging still verloren.
// Rechnung für 120:
//   Dichteste Minute eines Besuchers (aus src/lib/analytics-tracker.ts gezählt):
//   17 Ereignisse bei einer Seite, 37 bei drei Seiten in derselben Minute.
//   120 sind das 7-fache und das 3,2-fache davon. Hinter einer gemeinsamen
//   Adresse (Firmennetz, Mobilfunk) tragen 120 je Minute 3 Besucher, die alle
//   gleichzeitig drei Seiten in einer Minute aufrufen, 7 gleichzeitig in ihrer
//   dichtesten Minute mit einer Seite, 30 lesende Besucher (4 je Minute) oder
//   60 offene Tabs (2 Herzschläge je Minute).
//   Gegen den Gesamtdeckel: 3 Adressen kommen auf 360 von 400, erst die vierte
//   füllt ihn. Neben einer Adresse am Anschlag bleiben 280 je Minute frei.
// Was über dem Anteil liegt, wird nicht gespeichert und in der Zähldatei
// gezählt (verworfen_adresse_tag): der Rest eines Stapels, von dem ein Teil
// angenommen ist, still mit Antwort 200; ein Stapel, von dem der Anteil nichts
// annimmt, mit Antwort 429 (der Browser behält ihn und sendet ihn mit dem
// nächsten Ereignis wieder, die Zahl zählt dann jeden Versuch). Liegt die Zahl
// an einem gewöhnlichen Tag über null, ist der Anteil zu klein oder
// REMOTE_ADDR ist nicht die Adresse des Besuchers (Vorschaltserver).
// Gebucht wird beim Anteil nur, was der Gesamtdeckel danach auch annimmt.
define('COLLECT_ADRESSE_JE_MINUTE', 120);

// Nachrangige Ereignisse dürfen vom Anteil einer Adresse höchstens so viel
// belegen; der Rest bleibt für Sitzungsstart, Seitenaufruf, Klicks und
// Anfragen frei. Nachrangig sind die Ereignisse, die ein offener Tab von
// selbst und am häufigsten sendet (COLLECT_NACHRANGIG).
// Rechnung für 80 von 120:
//   Hinter einer gemeinsamen Adresse (Firmennetz, Messe-WLAN) füllten sonst
//   Herzschläge und Scrollen den Anteil, und es fielen gerade die Einstiege
//   weg, an denen Quelle und Absprung hängen. 80 tragen weiter 40 offene Tabs
//   (2 Herzschläge je Minute) oder 20 lesende Besucher; 40 je Minute bleiben
//   für die übrigen Ereignisse frei, das ist mehr als die dichteste Minute
//   eines Besuchers mit drei Seiten (37, davon rund die Hälfte nachrangig).
//   Herzschläge löscht die Bereinigung ohnehin nach 24 Stunden.
// Nachrangige Ereignisse über dieser Grenze werden still nicht gespeichert
// (Antwort 200) und nie mit 429 zurückgegeben: Sie sollen sich im Browser
// nicht vor den übrigen Ereignissen stauen.
define('COLLECT_ADRESSE_NACHRANGIG_JE_MINUTE', 80);
const COLLECT_NACHRANGIG = ['heartbeat', 'scroll_depth', 'performance', 'tab_visibility'];

// Größe je Ereignis: "props" darf als JSON, so wie es gespeichert wird,
// höchstens so viele Bytes haben. Ohne diese Grenze galt nur 1 MB je Anfrage,
// und eine Adresse konnte mit wenigen dicken Ereignissen die Datenbank füllen,
// in der auch die Anfragen der Kunden liegen.
// Rechnung für 8192 (nachgerechnet aus dem, was der Browser schickt):
//   session_start (Geräteangaben, das größte gewöhnliche Ereignis): 569 Bytes,
//   mit der Ortung des Servers 712, mit 40 Sprachen im Browser 934.
//   error mit voller Länge (500 + 200 Zeichen): 781 Bytes, wenn der Text nur
//   aus Umlauten bestünde (json_encode schreibt je Zeichen 6 Bytes) 4.277.
//   outbound_click mit voller Länge: 892, nur Umlaute 3.890.
//   8192 ist das 1,9-fache des größten Falls, den der Browser überhaupt
//   erzeugen kann, und das 11-fache des größten gewöhnlichen.
// Was darüber liegt, wird mit leerem "props" gespeichert und gezählt
// (props_gross_tag), nicht verworfen: Seitenaufruf, Sitzung und Zeit bleiben
// so gezählt, falls doch ein echter Browser die Grenze reißt; einem Fremden
// bringt es nichts, denn dieselbe Zeile ohne "props" durfte er ohnehin senden.
// Die übrigen Felder sind einzeln gekürzt (collectText unten): Kennungen je 64,
// Adresse und Herkunft je 2048, fünf Kampagnenfelder je 255 Bytes. Eine Zeile
// hat damit höchstens rund 13,7 KB (rund 5.550 Bytes Felder, 8.192 Bytes props).
define('COLLECT_PROPS_BYTES', 8192);

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
$propsZuGross = 0; // Ereignisse, deren "props" über COLLECT_PROPS_BYTES lag
foreach ($events as $ev) {
    if (!is_array($ev)) continue;

    $eventName = $ev['event'] ?? '';
    if (!in_array($eventName, $validEvents, true)) continue;

    // Check per-event toggle
    if ($enabledEvents !== null && isset($enabledEvents[$eventName]) && !$enabledEvents[$eventName]) {
        continue;
    }

    // Größe je Ereignis: gemessen wird der Text, der gespeichert würde.
    $props = isset($ev['props']) && is_array($ev['props']) ? $ev['props'] : [];
    if ($props !== []) {
        $propsText = json_encode($props);
        if ($propsText === false || strlen($propsText) > COLLECT_PROPS_BYTES) {
            $props = [];
            $propsZuGross++;
        }
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
        'props' => $props,
    ];
}

// 2. Anteil der Adresse, dann Gesamtdeckel: welche davon in dieser Minute noch
// Platz haben. Erst der Anteil, damit eine Adresse dem Gesamtdeckel je Minute
// nie mehr als ihren Anteil abverlangt. Gebucht wird beim Anteil erst, was der
// Gesamtdeckel angenommen hat: Fällt dessen Zähler aus oder verwirft er, ist
// der Anteil der Adresse danach nicht verbraucht (collectStapelZaehlen).
$geprueft = count($zeilen);
$still = 0; // über Anteil oder Deckel: nicht gespeichert, dem Browser nicht gemeldet
$zaehlerAus = false;
$anteilVoll = false; // der Anteil nimmt vom Stapel nichts an: 429, der Browser behält ihn
if ($geprueft > 0) {
    $anteilDatei = __DIR__ . '/data/rate_limit_anteil_'
        . statistikAdressSchluessel((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown')) . '.json';
    $nachrangig = [];
    foreach ($zeilen as $zeile) {
        $nachrangig[] = in_array($zeile['event'], COLLECT_NACHRANGIG, true);
    }
    $zaehlung = collectStapelZaehlen($anteilDatei, COLLECT_GESAMT_DATEI, $nachrangig, $now, $propsZuGross);
    if (isset($zaehlung['aus'])) {
        // Ohne Zähler kein Deckel, ohne Deckel keine Speicherung. Der Browser
        // bekommt 503 (unten) und behält den Stapel für den nächsten Versuch.
        error_log('Analytics collect: '
            . ($zaehlung['aus'] === 'adresse' ? 'Zähler des Anteils je Adresse' : 'Zähler des Gesamtdeckels')
            . ' nicht nutzbar, ' . $geprueft . ' Ereignisse nicht gespeichert');
        collectStoerungMerken(COLLECT_GESAMT_DATEI, $zaehlung['aus'], $now);
        $zeilen = [];
        $zaehlerAus = true;
    } elseif ($zaehlung['abgewiesen']) {
        $zeilen = [];
        $anteilVoll = true;
    } else {
        // Die Reihenfolge der Ereignisse im Stapel bleibt erhalten.
        $behalten = [];
        foreach ($zaehlung['behalten'] as $i) {
            $behalten[] = $zeilen[$i];
        }
        $still = $geprueft - count($behalten);
        $zeilen = $behalten;
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

if ($zaehlerAus) {
    // Zähler nicht nutzbar: 503 statt 200 mit "stored" 0. Der Browser wertet nur
    // den Status aus (flushQueue in src/lib/analytics-tracker.ts): Bei 200
    // verwirft er den Stapel, bei 503 legt er ihn zurück und sendet ihn mit dem
    // nächsten Ereignis wieder, höchstens 20 je Anfrage und ohne eigene
    // Wiederholung. health.php zeigt denselben Zustand als "statistik": "zaehler".
    http_response_code(503);
    header('Retry-After: 60');
    echo json_encode(['error' => 'Statistics temporarily unavailable']);
} elseif ($anteilVoll) {
    // Der Anteil der Adresse nimmt vom Stapel nichts an: 429 statt 200 mit
    // "stored", bei dem der Browser den Stapel verwürfe. Er legt ihn bei 429
    // wie bei 503 zurück und sendet ihn mit dem nächsten Ereignis wieder, ohne
    // eigene Wiederholung. Status und Text sind dieselben wie bei der Grenze
    // der Anfragen je Adresse weiter oben.
    http_response_code(429);
    header('Retry-After: 60');
    echo json_encode(['error' => 'Rate limit exceeded']);
} else {
    // Antwort wie bisher. Was über dem Anteil der Adresse oder dem Gesamtdeckel
    // lag, zählt hier mit: Die Zahl der verworfenen Ereignisse steht nur in der
    // Zähldatei, nicht in der Antwort.
    echo json_encode(['ok' => true, 'stored' => $stored + $still]);
}

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
 * $neben zählt mit, was vor dem Deckel schon aussortiert wurde: 'adresse'
 * (Ereignisse über dem Anteil der Adresse), 'props' (Ereignisse mit zu großem
 * "props", leer gespeichert), 'je_adresse' (der geltende Anteil, zur Anzeige).
 *
 * Rückgabe: wie viele der $anzahl Ereignisse gespeichert werden dürfen
 * (0 bis $anzahl), oder null, wenn der Zähler nicht nutzbar ist (Datei nicht
 * zu öffnen, zu sperren oder zu schreiben). Der Aufrufer speichert bei null nichts.
 */
function collectGesamtdeckel(string $datei, int $anzahl, int $max, int $jetzt, array $neben = []): ?int {
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
    $ueberAnteil = $zahl($neben['adresse'] ?? null);
    $ueberAnteilBisher = $heute ? $zahl($stand['verworfen_adresse_tag'] ?? null) : 0;
    $propsGross = $zahl($neben['props'] ?? null);
    $propsGrossBisher = $heute ? $zahl($stand['props_gross_tag'] ?? null) : 0;
    $neu = [
        'tag' => $tag,
        'angenommen_tag' => ($heute ? $zahl($stand['angenommen_tag'] ?? null) : 0) + $erlaubt,
        'verworfen_tag' => $verworfenBisher + $verworfen,
        // dichteste Minute des Tages: gespeicherte Ereignisse in 60 Sekunden
        'spitze_tag' => max($heute ? $zahl($stand['spitze_tag'] ?? null) : 0, $belegt + $erlaubt),
        'verworfen_gesamt' => $zahl($stand['verworfen_gesamt'] ?? null) + $verworfen,
        'deckel' => $max,
        // über dem Anteil einer Adresse (nicht gespeichert) und mit zu großem
        // "props" (leer gespeichert), je Tag
        'verworfen_adresse_tag' => $ueberAnteilBisher + $ueberAnteil,
        'props_gross_tag' => $propsGrossBisher + $propsGross,
        'je_adresse' => $zahl($neben['je_adresse'] ?? ($stand['je_adresse'] ?? null)),
    ];
    // "Deckel erreicht" in Kalenderminuten: daraus liest health.php, ob der
    // Deckel in mehreren Minuten eines Fensters erreicht war (statistik-zaehler.php).
    $minute = intdiv($jetzt, 60);
    $deckelStand = statistikDeckelFortschreiben($stand, $minute, $belegt + $erlaubt >= $max);
    if ($deckelStand['voll'] !== []) {
        $neu['deckel_voll'] = $deckelStand['voll'];
    }
    if ($deckelStand['alarm'] !== null) {
        $neu['deckel_alarm'] = $deckelStand['alarm'];
    }
    // Tagesmenge: der letzte Abruf über der Menge, damit der Zustand "menge"
    // den Tageswechsel um die Haltezeit überdauert.
    $angenommenBisher = $neu['angenommen_tag'] - $erlaubt;
    if ($neu['angenommen_tag'] >= STATISTIK_TAGESMENGE) {
        $neu['menge_zuletzt'] = $minute;
        if ($angenommenBisher < STATISTIK_TAGESMENGE) {
            // Einmal je Tag
            error_log('Analytics collect: Tagesmenge von ' . STATISTIK_TAGESMENGE . ' angenommenen Ereignissen am ' . $tag . ' erreicht');
        }
    } elseif (is_int($stand['menge_zuletzt'] ?? null) && $stand['menge_zuletzt'] <= $minute
        && $minute - $stand['menge_zuletzt'] <= STATISTIK_HALTEN_MINUTEN) {
        $neu['menge_zuletzt'] = $stand['menge_zuletzt'];
    }
    // Ein gemerkter Ausfall einer Zähldatei bleibt stehen, bis er abgelaufen ist.
    $stoerung = statistikStoerung($stand, $minute);
    if ($stoerung !== null) {
        $neu['stoerung'] = $stoerung;
    }
    if (!$heute && is_string($stand['tag'] ?? null)) {
        // Tageswechsel: die Zahlen des letzten Tages mit Verkehr bleiben stehen.
        $neu['vortag'] = [
            'tag' => $stand['tag'],
            'angenommen' => $zahl($stand['angenommen_tag'] ?? null),
            'verworfen' => $zahl($stand['verworfen_tag'] ?? null),
            'spitze' => $zahl($stand['spitze_tag'] ?? null),
            'verworfen_adresse' => $zahl($stand['verworfen_adresse_tag'] ?? null),
            'props_gross' => $zahl($stand['props_gross_tag'] ?? null),
        ];
    } elseif (is_array($stand['vortag'] ?? null)) {
        $neu['vortag'] = [
            'tag' => is_string($stand['vortag']['tag'] ?? null) ? $stand['vortag']['tag'] : '',
            'angenommen' => $zahl($stand['vortag']['angenommen'] ?? null),
            'verworfen' => $zahl($stand['vortag']['verworfen'] ?? null),
            'spitze' => $zahl($stand['vortag']['spitze'] ?? null),
            'verworfen_adresse' => $zahl($stand['vortag']['verworfen_adresse'] ?? null),
            'props_gross' => $zahl($stand['vortag']['props_gross'] ?? null),
        ];
    }
    $neu['sekunden'] = $sekunden;
    if ($verworfen > 0 && $verworfenBisher === 0) {
        // Einmal je Tag, nicht je verworfenem Ereignis
        error_log('Analytics collect: Gesamtdeckel von ' . $max . ' Ereignissen je Minute am ' . $tag
            . ' erreicht, weitere Ereignisse werden nicht gespeichert');
    }
    if ($ueberAnteil > 0 && $ueberAnteilBisher === 0) {
        error_log('Analytics collect: Anteil je Adresse am ' . $tag
            . ' erreicht, weitere Ereignisse dieser Adresse werden in der Minute nicht gespeichert');
    }
    if ($propsGross > 0 && $propsGrossBisher === 0) {
        error_log('Analytics collect: props über der Größengrenze am ' . $tag . ', Ereignis ohne props gespeichert');
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
 * Zählt einen Stapel gegen den Anteil der Adresse und den Gesamtdeckel.
 *
 * Anteil einer Adresse: höchstens COLLECT_ADRESSE_JE_MINUTE Ereignisse in 60
 * Sekunden, davon höchstens COLLECT_ADRESSE_NACHRANGIG_JE_MINUTE nachrangige,
 * gezählt in Sekundenfächern in einer eigenen Zähldatei je Adresse unter
 * Dateisperre. Der Dateiname trägt nur einen Hash der Adresse
 * (statistikAdressSchluessel), der Inhalt nur Sekunden und Zahlen. Der Name
 * beginnt mit rate_limit_ und fällt damit unter dieselbe Regel der Bereinigung
 * wie die übrigen Zähldateien mit IP-Bezug (eine Stunde nach der letzten Änderung).
 *
 * Reihenfolge: Unter der Sperre der Adressdatei wird gelesen, was der Anteil
 * noch frei hat, dann der Gesamtdeckel gefragt (collectGesamtdeckel, eigene
 * Sperre; die Sperren werden immer in dieser Reihenfolge geholt), und erst
 * was der angenommen hat, wird beim Anteil gebucht. Reicht der Platz nicht für
 * den ganzen Stapel, gehen die übrigen Ereignisse den nachrangigen vor.
 *
 * $nachrangig: je Ereignis des Stapels true, wenn es nachrangig ist.
 * Rückgabe:
 *   ['aus' => 'adresse' | 'gesamt']  diese Zähldatei ist nicht nutzbar (nicht
 *       zu öffnen, zu sperren oder zu schreiben); der Aufrufer speichert nichts
 *   ['behalten' => Stellen im Stapel, aufsteigend, 'abgewiesen' => bool]
 *       abgewiesen: Der Stapel trägt mindestens ein nicht nachrangiges
 *       Ereignis, und der Anteil nimmt von ihm nichts an.
 */
function collectStapelZaehlen(string $anteilDatei, string $gesamtDatei, array $nachrangig, int $jetzt, int $propsZuGross): array {
    $anzahl = count($nachrangig);
    $fp = @fopen($anteilDatei, 'c+');
    if (!$fp) {
        return ['aus' => 'adresse'];
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['aus' => 'adresse'];
    }
    $stand = json_decode((string)stream_get_contents($fp), true);
    $fenster = function ($roh) use ($jetzt): array {
        $faecher = [];
        foreach (is_array($roh) ? $roh : [] as $sekunde => $n) {
            if (is_int($sekunde) && is_int($n) && $n > 0 && abs($jetzt - $sekunde) < 60) {
                $faecher[$sekunde] = $n;
            }
        }
        return $faecher;
    };
    $sekunden = $fenster(is_array($stand) ? ($stand['sekunden'] ?? null) : null);
    $nachSekunden = $fenster(is_array($stand) ? ($stand['nachrangig'] ?? null) : null);
    $frei = max(0, COLLECT_ADRESSE_JE_MINUTE - array_sum($sekunden));
    $freiNach = max(0, COLLECT_ADRESSE_NACHRANGIG_JE_MINUTE - array_sum($nachSekunden));

    // Auswahl: erst die übrigen Ereignisse, dann die nachrangigen bis zu ihrer Grenze.
    $wahl = [];
    $wichtige = 0;
    foreach ($nachrangig as $i => $nach) {
        if (!$nach) {
            $wichtige++;
            if (count($wahl) < $frei) {
                $wahl[] = $i;
            }
        }
    }
    $nachGewaehlt = 0;
    foreach ($nachrangig as $i => $nach) {
        if ($nach && count($wahl) < $frei && $nachGewaehlt < $freiNach) {
            $wahl[] = $i;
            $nachGewaehlt++;
        }
    }
    $anteil = count($wahl);
    $abgewiesen = $anteil === 0 && $wichtige > 0;

    $erlaubt = collectGesamtdeckel($gesamtDatei, $anteil, COLLECT_GESAMT_JE_MINUTE, $jetzt, [
        'adresse' => $anzahl - $anteil,
        'props' => $abgewiesen ? 0 : $propsZuGross, // ein abgewiesener Stapel kommt wieder
        'je_adresse' => COLLECT_ADRESSE_JE_MINUTE,
    ]);
    if ($erlaubt === null) {
        // Der Anteil bleibt unberührt: nichts gebucht, nichts geschrieben.
        flock($fp, LOCK_UN);
        fclose($fp);
        return ['aus' => 'gesamt'];
    }

    $behalten = array_slice($wahl, 0, $erlaubt);
    $geschrieben = true;
    if ($erlaubt > 0) {
        $nachBehalten = 0;
        foreach ($behalten as $i) {
            $nachBehalten += $nachrangig[$i] ? 1 : 0;
        }
        $sekunden[$jetzt] = ($sekunden[$jetzt] ?? 0) + $erlaubt;
        if ($nachBehalten > 0) {
            $nachSekunden[$jetzt] = ($nachSekunden[$jetzt] ?? 0) + $nachBehalten;
        }
        $neu = ['sekunden' => $sekunden];
        if ($nachSekunden !== []) {
            $neu['nachrangig'] = $nachSekunden;
        }
        $text = json_encode($neu);
        $geschrieben = rewind($fp)
            && fwrite($fp, $text) === strlen($text)
            && ftruncate($fp, strlen($text))
            && fflush($fp);
    }
    flock($fp, LOCK_UN);
    fclose($fp);
    if (!$geschrieben) {
        // Der Gesamtdeckel hat diese Ereignisse schon gezählt; gespeichert
        // werden sie nicht, weil der Anteil der Adresse sonst nicht gälte.
        return ['aus' => 'adresse'];
    }
    sort($behalten);
    return ['behalten' => $behalten, 'abgewiesen' => $abgewiesen];
}

/**
 * Merkt in der Zähldatei des Gesamtdeckels, dass eine Zähldatei ausgefallen ist
 * ($welcher: 'adresse' oder 'gesamt') und collect.php deshalb mit 503
 * geantwortet hat. health.php zeigt danach STATISTIK_HALTEN_MINUTEN Minuten
 * lang "statistik": "zaehler" (statistikStoerung), auch wenn die Zähldatei des
 * Gesamtdeckels selbst nutzbar ist. Lässt sich die Datei nicht schreiben,
 * bleibt der Ausfall nur im Fehlerprotokoll.
 */
function collectStoerungMerken(string $datei, string $welcher, int $jetzt): void {
    $fp = @fopen($datei, 'c+');
    if (!$fp) {
        return;
    }
    if (flock($fp, LOCK_EX)) {
        $stand = json_decode((string)stream_get_contents($fp), true);
        $stand = is_array($stand) ? $stand : [];
        $stand['stoerung'] = ['minute' => intdiv($jetzt, 60), 'zaehler' => $welcher];
        $text = json_encode($stand);
        if (rewind($fp) && fwrite($fp, $text) === strlen($text) && ftruncate($fp, strlen($text))) {
            fflush($fp);
        }
        flock($fp, LOCK_UN);
    }
    fclose($fp);
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
