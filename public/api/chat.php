<?php
/**
 * S&S Messebau - Chat API
 * Secure proxy for OpenAI Chat Completions API
 * Never exposes API keys to the frontend
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// ─── Bremsen ───────────────────────────────────────────────────────────────
// Der Chat ist öffentlich und ruft je Anfrage OpenAI auf, kostet also Geld.
// Alle Grenzen stehen hier oben, damit sie ohne Suchen zu ändern sind.

// Sitzungsbremse (Bestand): 10 Anfragen je Minute je PHP-Sitzung. Sie hält nur
// bei Besuchern, die das Sitzungs-Cookie zurückschicken; wer es weglässt,
// bekommt je Anfrage eine neue Sitzung. Deshalb die beiden Bremsen darunter.
define('CHAT_RATE_LIMIT_MAX', 10);
define('CHAT_RATE_LIMIT_WINDOW', 60); // Sekunden

// IP-Bremse: 10 Anfragen je Minute je Adresse, gezählt in einer Datei
// data/rate_limit_chat_<md5>.json (Muster wie collect.php; der Name passt in
// das Aufräum-Muster rate_limit_*.json von analytics-cleanup.php).
// Quelle ist allein REMOTE_ADDR: weitergereichte Kopfzeilen (X-Forwarded-For
// und ähnliche) setzt der Aufrufer selbst, sie wären eine frei wählbare Adresse.
define('CHAT_IP_LIMIT_MAX', 10);
define('CHAT_IP_LIMIT_WINDOW', 60); // Sekunden

// Tagesdeckel über alle Besucher zusammen: Die IP-Bremse hält einen einzelnen
// Absender auf, aber nicht viele Adressen zugleich. Der Deckel begrenzt, was
// der Chat an einem Kalendertag (Europe/Berlin) höchstens kosten kann.
// Rechnung für 300 (Listenpreis gpt-4o 2,50 USD je 1 Mio. Eingabe- und
// 10 USD je 1 Mio. Ausgabe-Tokens, Stand 11/2026 aus Sekundärquellen): eine
// Anfrage kostet höchstens rund 1,2 Cent (1000 Ausgabe-Tokens = 1 Cent, dazu
// Systemtext und 2000 Zeichen Nachricht), also höchstens rund 3,60 USD je Tag
// und 110 USD je Monat bei Dauermissbrauch. Jeder aktive Wissenseintrag aus
// ai_training_data in voller Länge (5000 Zeichen) hebt das um rund 1,10 USD
// je Tag. Der echte Bedarf ist nicht gemessen; 300 ist ein Vorschlag mit
// Abstand nach oben für eine Firmenwebsite. Ist der Deckel erreicht, antwortet
// der Chat bis Mitternacht mit 429 und schreibt eine Zeile ins Fehlerprotokoll.
define('CHAT_TAGESDECKEL', 300);
// Der Name passt absichtlich in kein Muster von analytics-cleanup.php: Dort
// werden Zähldateien nach einer Stunde ohne Änderung gelöscht, das würde den
// Tageszähler vorzeitig auf null setzen. Die Datei wird nie gelöscht, sie
// trägt ihr Datum und beginnt am nächsten Tag von selbst bei null.
define('CHAT_TAGESDECKEL_DATEI', __DIR__ . '/data/chat_tagesdeckel.json');

/**
 * Zählschlüssel einer Adresse. IPv4 zählt je Adresse. IPv6 zählt je /64-Netz,
 * weil ein einzelner Anschluss dort über 2^64 Adressen verfügt und die Bremse
 * sonst mit jeder Anfrage unter einer neuen Adresse umgehen könnte.
 */
function chatBremseSchluessel(string $adresse): string {
    $binaer = @inet_pton($adresse);
    if ($binaer === false) {
        // Keine lesbare Adresse: alle solchen Anfragen teilen sich einen Zähler.
        return 'x:unbekannt';
    }
    if (strlen($binaer) === 4) {
        return 'v4:' . inet_ntop($binaer);
    }
    // IPv4 in IPv6-Schreibweise (::ffff:a.b.c.d) wie IPv4 zählen
    if (substr($binaer, 0, 12) === str_repeat("\0", 10) . "\xff\xff") {
        return 'v4:' . inet_ntop(substr($binaer, 12));
    }
    return 'v6:' . bin2hex(substr($binaer, 0, 8));
}

/**
 * Öffnet eine Zähldatei, sperrt sie exklusiv, übergibt den gelesenen Stand an
 * $zaehle und schreibt dessen neuen Stand zurück. Die Sperre hält über Lesen
 * und Schreiben, damit gleichzeitige Anfragen sich nicht gegenseitig
 * überschreiben und so mehr durchlassen als erlaubt.
 *
 * $zaehle bekommt den bisherigen Stand (Array oder null) und gibt
 * [erlaubt, neuer Stand] zurück.
 *
 * Rückgabe: true = gezählt und erlaubt, false = Grenze erreicht,
 * null = Zähler nicht nutzbar (Datei nicht zu öffnen, zu sperren oder zu
 * schreiben). Der Aufrufer lehnt bei null ab: ohne Zähler kein OpenAI-Aufruf.
 */
function chatZaehldatei(string $datei, callable $zaehle): ?bool {
    $ordner = dirname($datei);
    if (!is_dir($ordner)) {
        @mkdir($ordner, 0755, true);
    }
    $fp = @fopen($datei, 'c+');
    if (!$fp) {
        return null;
    }
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return null;
    }
    $stand = json_decode((string)stream_get_contents($fp), true);
    [$erlaubt, $neu] = $zaehle(is_array($stand) ? $stand : null);
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

/** Gleitendes Fenster: höchstens $max gezählte Anfragen in $fenster Sekunden. */
function chatFensterZaehlen(string $datei, int $max, int $fenster, int $jetzt): ?bool {
    return chatZaehldatei($datei, function (?array $stand) use ($max, $fenster, $jetzt): array {
        $stempel = [];
        $alt = is_array($stand['timestamps'] ?? null) ? $stand['timestamps'] : [];
        foreach ($alt as $ts) {
            // abs(): ein Stempel aus der Zukunft (Uhr zurückgestellt) zählt
            // mit, aber höchstens ein Fenster lang.
            if (is_int($ts) && abs($jetzt - $ts) < $fenster) {
                $stempel[] = $ts;
            }
        }
        $erlaubt = count($stempel) < $max;
        if ($erlaubt) {
            $stempel[] = $jetzt;
        }
        return [$erlaubt, ['timestamps' => $stempel]];
    });
}

/** Tageszähler: höchstens $max gezählte Anfragen am Kalendertag $tag (JJJJ-MM-TT). */
function chatTagZaehlen(string $datei, int $max, string $tag): ?bool {
    return chatZaehldatei($datei, function (?array $stand) use ($max, $tag): array {
        $anzahl = 0;
        // Anderes Datum oder unlesbarer Inhalt: Zähler beginnt bei null.
        if (($stand['tag'] ?? null) === $tag && is_int($stand['anzahl'] ?? null) && $stand['anzahl'] > 0) {
            $anzahl = $stand['anzahl'];
        }
        $erlaubt = $anzahl < $max;
        if ($erlaubt) {
            $anzahl++;
            if ($anzahl === $max) {
                // Einmal je Tag, nicht je abgelehnter Anfrage
                error_log('Chat: Tagesdeckel von ' . $max . ' Anfragen am ' . $tag . ' erreicht');
            }
        }
        return [$erlaubt, ['tag' => $tag, 'anzahl' => $anzahl]];
    });
}

/** 429 mit der Meldung, die das Frontend schon kennt. Beendet die Anfrage. */
function chatZuVieleAnfragen(int $wartenSekunden): void {
    http_response_code(429);
    header('Retry-After: ' . max(1, $wartenSekunden));
    echo json_encode(['success' => false, 'error' => 'Zu viele Anfragen. Bitte warten Sie einen Moment.']);
    exit;
}

/** 503, wenn ein Zähler nicht nutzbar ist. Beendet die Anfrage. */
function chatZaehlerNichtNutzbar(string $welcher): void {
    error_log('Chat: Zähler nicht nutzbar (' . $welcher . '), Anfrage abgelehnt');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => 'KI-Service vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.'
    ]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Methode vor jeder Zählung und vor der Sitzung prüfen: Ein GET-Abruf
// (Suchmaschine, Wächter, Neugier) verbraucht kein Kontingent.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// AI Chat is publicly accessible (no auth required for visitors)
// Rate limiting and input validation are applied instead
$now = time();

// 1. IP-Bremse: hält ohne Cookie
$ipDatei = __DIR__ . '/data/rate_limit_chat_'
    . md5(chatBremseSchluessel((string)($_SERVER['REMOTE_ADDR'] ?? ''))) . '.json';
$ipErlaubt = chatFensterZaehlen($ipDatei, CHAT_IP_LIMIT_MAX, CHAT_IP_LIMIT_WINDOW, $now);
if ($ipErlaubt === null) {
    chatZaehlerNichtNutzbar('IP-Bremse');
}
if ($ipErlaubt === false) {
    chatZuVieleAnfragen(CHAT_IP_LIMIT_WINDOW);
}

// 2. Sitzungsbremse (Bestand): max 10 requests per minute per session
startSession();
if (!isset($_SESSION['chat_requests']) || !is_array($_SESSION['chat_requests'])) {
    $_SESSION['chat_requests'] = [];
}
// Remove entries older than the rate limit window
$_SESSION['chat_requests'] = array_filter($_SESSION['chat_requests'], function($ts) use ($now) {
    return ($now - $ts) < CHAT_RATE_LIMIT_WINDOW;
});
if (count($_SESSION['chat_requests']) >= CHAT_RATE_LIMIT_MAX) {
    chatZuVieleAnfragen(CHAT_RATE_LIMIT_WINDOW);
}
$_SESSION['chat_requests'][] = $now;

// 3. Eingabe prüfen, bevor der Tagesdeckel zählt: Eine Anfrage, die ohnehin
// mit 400 endet, erreicht OpenAI nicht und soll das Tageskontingent der
// echten Besucher nicht verbrauchen.
enforceRequestBodyLimit();
$input = json_decode(file_get_contents('php://input'), true);

// is_string: Ein Array als message löst sonst in strlen() einen TypeError
// außerhalb des try-Blocks aus (Fatal error statt JSON-Antwort); eine Zahl
// ist ebenfalls kein Chattext.
if (!is_array($input) || empty($input['message']) || !is_string($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message is required']);
    exit;
}

// Enforce message length limit server-side
$rawMessage = $input['message'];
if (strlen($rawMessage) > 2000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nachricht zu lang (max. 2000 Zeichen)']);
    exit;
}

// 4. Tagesdeckel über alle Besucher: letzte Schranke vor dem OpenAI-Aufruf
$berlin = new DateTimeZone('Europe/Berlin');
$tagErlaubt = chatTagZaehlen(
    CHAT_TAGESDECKEL_DATEI,
    CHAT_TAGESDECKEL,
    (new DateTimeImmutable('@' . $now))->setTimezone($berlin)->format('Y-m-d')
);
if ($tagErlaubt === null) {
    chatZaehlerNichtNutzbar('Tagesdeckel');
}
if ($tagErlaubt === false) {
    chatZuVieleAnfragen((new DateTimeImmutable('tomorrow', $berlin))->getTimestamp() - $now);
}

// Wrap main logic in try-catch to ensure valid JSON is always returned
try {
    // Sanitize message: strip HTML tags and control characters
    $message = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', strip_tags($rawMessage));

    // SECURITY: System prompt is defined server-side only, never from client input.
    // This prevents prompt injection attacks where an attacker overrides the AI behavior.
    $systemPrompt = 'Du bist ein hilfreicher KI-Berater für S&S Messebau GbR. '
        . 'Du beantwortest ausschließlich Fragen zu Messebau, Bannersystemen, Standdesign und den Dienstleistungen von S&S Messebau. '
        . 'Antworte immer auf Deutsch, es sei denn der Nutzer schreibt auf Englisch. '
        . 'Leite keine sensiblen Unternehmensinformationen, interne Prozesse oder Preise weiter, die nicht öffentlich sind. '
        . 'Wenn du dir bei einer Antwort nicht sicher bist, verweise freundlich auf den Kontakt: info@sundsmessebau.com oder +49 1514 0368754.';
    // Client-provided systemPrompt and context are intentionally ignored for security

    // Initialize database connection
    $db = getDB();

    // Load server-side training data as additional context
    try {
        $trainingStmt = $db->query('SELECT title, content FROM ai_training_data WHERE active = 1 ORDER BY created_at DESC');
        $trainingEntries = $trainingStmt->fetchAll();
        if (!empty($trainingEntries)) {
            $trainingContext = "\n\nZUSÄTZLICHES WISSEN (Admin-gepflegt):\n";
            foreach ($trainingEntries as $te) {
                // Sanitize training data to prevent prompt injection patterns
                $title = substr(preg_replace('/[\x00-\x1f]/', '', $te['title']), 0, 200);
                $content = substr(preg_replace('/[\x00-\x1f]/', '', $te['content']), 0, 5000);
                $trainingContext .= "[{$title}]\n{$content}\n\n";
            }
            $systemPrompt .= $trainingContext;
        }
    } catch (\Throwable $e) {
        // Training data is optional, continue without it if query fails
        // Catches query execution errors (table missing, schema issues, etc.)
        error_log('Failed to load training data: ' . $e->getMessage());
    }

    // Get active OpenAI API key from database
    $stmt = $db->prepare('SELECT api_key, id FROM ai_keys WHERE provider = :provider AND status = :status ORDER BY created_at DESC LIMIT 1');
    $stmt->execute([
        ':provider' => 'openai',
        ':status' => 'active',
    ]);
    $keyRecord = $stmt->fetch();

    if (!$keyRecord) {
        // Fallback to environment variable
        $apiKey = getenv('OPENAI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'No active OpenAI API key configured'
            ]);
            exit;
        }
        $keyRecordId = null;
    } else {
        $apiKey = $keyRecord['api_key'];
        $keyRecordId = $keyRecord['id'];
    }

    // Build the messages for OpenAI
    $messages = [];

    if (!empty($systemPrompt)) {
        $messages[] = [
            'role' => 'system',
            'content' => $systemPrompt
        ];
    }

    // Note: Client-sent 'context' is intentionally not used as a system message
    // to prevent prompt injection. Training data provides all needed context.

    $messages[] = [
        'role' => 'user',
        'content' => $message
    ];

    // Make request to OpenAI
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'model' => 'gpt-4o',
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 1000,
        ]),
        CURLOPT_TIMEOUT => OPENAI_TIMEOUT,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log('Chat OpenAI connection error: ' . $curlError);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'KI-Service vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.'
        ]);
        exit;
    }

    $responseData = json_decode($response, true);

    if ($httpCode !== 200) {
        // Log the actual error internally but don't expose to user
        error_log('Chat OpenAI API error (' . $httpCode . '): ' . ($responseData['error']['message'] ?? $response));
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'KI-Anfrage fehlgeschlagen. Bitte versuchen Sie es später erneut.'
        ]);
        exit;
    }

    // Update last_used_at for the key
    if ($keyRecordId !== null) {
        $updateStmt = $db->prepare('UPDATE ai_keys SET last_used_at = datetime("now") WHERE id = :id');
        $updateStmt->execute([':id' => $keyRecordId]);
    }

    // Extract the assistant's message
    $aiMessage = $responseData['choices'][0]['message']['content'] ?? 'No response from AI';

    echo json_encode([
        'success' => true,
        'message' => $aiMessage
    ]);
} catch (\Throwable $e) {
    // Global error handler - ensure we always return valid JSON
    error_log('Chat API fatal error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An unexpected error occurred. Please try again later.'
    ]);
}
