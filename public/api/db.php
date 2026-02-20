<?php
/**
 * S&S Messebau - Database Connection & Schema
 * SQLite database with tables for admin_users, orders, inquiries, email_queue
 */

require_once __DIR__ . '/config.php';

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dbDir = dirname(DB_PATH);
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA journal_mode=WAL');
        $pdo->exec('PRAGMA foreign_keys=ON');
        initSchema($pdo);
    }
    return $pdo;
}

function initSchema(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_id TEXT UNIQUE NOT NULL,
            customer_email TEXT,
            customer_name TEXT,
            company TEXT,
            phone TEXT,
            status TEXT DEFAULT 'neu',
            order_data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inquiry_id TEXT UNIQUE NOT NULL,
            type TEXT DEFAULT 'inquiry',
            name TEXT,
            email TEXT,
            company TEXT,
            phone TEXT,
            message TEXT,
            form_data TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            queue_id TEXT UNIQUE NOT NULL,
            to_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            html_body TEXT NOT NULL,
            text_body TEXT,
            customer_email TEXT,
            customer_subject TEXT,
            customer_html_body TEXT,
            customer_text_body TEXT,
            attachments TEXT,
            order_id TEXT,
            sent INTEGER DEFAULT 0,
            sent_at TEXT,
            error TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ai_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_id TEXT UNIQUE NOT NULL,
            provider TEXT NOT NULL,
            api_key TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            last_used_at TEXT
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'sonstiges',
            image_url TEXT,
            excerpt TEXT,
            content TEXT NOT NULL,
            published_at TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS messe_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            start_date TEXT,
            end_date TEXT,
            category TEXT DEFAULT 'allgemein',
            website TEXT,
            description TEXT,
            ss_present INTEGER DEFAULT 0,
            image_url TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS external_api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            encrypted_key TEXT NOT NULL,
            masked_key TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notification_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_key TEXT UNIQUE NOT NULL,
            config_value TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ai_training_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'faq',
            active INTEGER DEFAULT 1,
            created_by TEXT DEFAULT 'admin',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ai_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            actor TEXT DEFAULT 'admin',
            details TEXT,
            category TEXT DEFAULT 'config',
            created_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT NOT NULL,
            ts TEXT NOT NULL,
            session_id TEXT NOT NULL,
            visitor_id TEXT DEFAULT '',
            url TEXT,
            referrer TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            utm_content TEXT,
            utm_term TEXT,
            props TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_ts ON analytics_events(ts)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_event_ts ON analytics_events(event, ts)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_url ON analytics_events(url)");

    // Add visitor_id column if missing (migration for existing databases)
    // MUST run BEFORE the visitor_id index is created, otherwise the index
    // creation crashes with "no such column: visitor_id" on older databases.
    try {
        $pdo->exec("ALTER TABLE analytics_events ADD COLUMN visitor_id TEXT DEFAULT ''");
    } catch (\Throwable $e) {
        // Column already exists, ignore
    }

    // Now that visitor_id column is guaranteed to exist, create the index
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_id)");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS analytics_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_key TEXT UNIQUE NOT NULL,
            config_value TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS automation_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            trigger_type TEXT NOT NULL DEFAULT 'order_created',
            conditions TEXT DEFAULT '[]',
            action TEXT NOT NULL DEFAULT 'send_email',
            action_config TEXT DEFAULT '{}',
            enabled INTEGER DEFAULT 1,
            delay_minutes INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            html_content TEXT DEFAULT '',
            text_content TEXT DEFAULT '',
            variables TEXT DEFAULT '[]',
            category TEXT DEFAULT 'custom',
            version INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_id TEXT UNIQUE NOT NULL,
            to_email TEXT NOT NULL,
            subject TEXT DEFAULT '',
            status TEXT DEFAULT 'queued',
            order_id TEXT,
            inquiry_id TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_tracking_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_id TEXT NOT NULL,
            event TEXT NOT NULL,
            details TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (tracking_id) REFERENCES email_tracking(tracking_id)
        )
    ");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tracking_status ON email_tracking(status)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tracking_order ON email_tracking(order_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tracking_inquiry ON email_tracking(inquiry_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tracking_events_tid ON email_tracking_events(tracking_id)");
}
