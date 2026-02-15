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

// CORS allowed origins (adjust for production)
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://sundsmessebau.com',
    'https://www.sundsmessebau.com',
]);
