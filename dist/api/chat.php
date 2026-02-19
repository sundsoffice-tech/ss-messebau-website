<?php
/**
 * S&S Messebau - Chat API
 * Secure proxy for OpenAI Chat Completions API
 * Never exposes API keys to the frontend
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// AI Chat is publicly accessible (no auth required for visitors)
// Rate limiting and input validation are applied instead
startSession();

// Simple rate limiting: max 10 requests per minute per session
define('CHAT_RATE_LIMIT_MAX', 10);
define('CHAT_RATE_LIMIT_WINDOW', 60); // seconds
$now = time();
if (!isset($_SESSION['chat_requests'])) {
    $_SESSION['chat_requests'] = [];
}
// Remove entries older than the rate limit window
$_SESSION['chat_requests'] = array_filter($_SESSION['chat_requests'], function($ts) use ($now) {
    return ($now - $ts) < CHAT_RATE_LIMIT_WINDOW;
});
if (count($_SESSION['chat_requests']) >= CHAT_RATE_LIMIT_MAX) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Zu viele Anfragen. Bitte warten Sie einen Moment.']);
    exit;
}
$_SESSION['chat_requests'][] = $now;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

enforceRequestBodyLimit();
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['message'])) {
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
