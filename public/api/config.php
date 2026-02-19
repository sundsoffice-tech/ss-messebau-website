<?php
/**
 * S&S Messebau API Configuration
 * All sensitive keys are stored here – NEVER expose in frontend.
 */

// Database path (relative to this file)
define('DB_PATH', __DIR__ . '/data/database.sqlite');

// SendGrid API Key – set via environment or directly here
define('SENDGRID_API_KEY', getenv('SENDGRID_API_KEY') ?: '');

// Company email for receiving orders/inquiries
define('COMPANY_EMAIL', 'info@sundsmessebau.com');

// From email settings
define('FROM_EMAIL', 'noreply@sunds-messebau.de');
define('FROM_NAME', 'S&S Messebau GbR');

// Session settings
define('SESSION_LIFETIME', 86400); // 24 hours

// AI/LLM settings
define('OPENAI_TIMEOUT', 30); // timeout in seconds for OpenAI API calls

// CORS allowed origins (adjust for production)
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://sundsmessebau.com',
    'https://www.sundsmessebau.com',
]);

// Maximum request body size (1MB) - reject oversized requests early
define('MAX_REQUEST_BODY_SIZE', 1048576);

/**
 * Enforce request body size limit to prevent abuse.
 * Call this at the start of any endpoint that reads php://input.
 */
function enforceRequestBodyLimit(): void {
    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
    if ((int)$contentLength > MAX_REQUEST_BODY_SIZE) {
        http_response_code(413);
        echo json_encode(['error' => 'Request body too large']);
        exit;
    }
}
