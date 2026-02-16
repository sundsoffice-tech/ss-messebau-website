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

// Require authentication for chat
if (!requireAuth()) {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message is required']);
    exit;
}

$message = $input['message'];
$systemPrompt = $input['systemPrompt'] ?? 'You are a helpful assistant.';
$context = $input['context'] ?? '';

// Get active OpenAI API key from database
$db = getDB();
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

if (!empty($context)) {
    $messages[] = [
        'role' => 'system',
        'content' => $context
    ];
}

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
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to connect to OpenAI: ' . $curlError
    ]);
    exit;
}

$responseData = json_decode($response, true);

if ($httpCode !== 200) {
    $errorMessage = 'OpenAI API error';
    if (isset($responseData['error']['message'])) {
        $errorMessage = $responseData['error']['message'];
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $errorMessage
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
