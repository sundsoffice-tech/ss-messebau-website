<?php
/**
 * S&S Messebau - Analytics Cleanup Endpoint
 * POST: Delete old events based on retention settings
 * Requires auth.
 *
 * Zwei Wege führen in diese Datei:
 *   1. Der Aufruf über HTTP (Knopf im Admin-Bereich): POST, nur angemeldet.
 *   2. Der Anstoß ohne Handgriff: bereinigungAusfuehren() in
 *      bereinigung-anstoss.php bindet die Datei ein und setzt dafür in ihrer
 *      eigenen Funktion $bereinigungIntern = true. Dann entfallen HTTP-Teil,
 *      Anmeldung und Ausgabe, die Regeln darunter sind dieselben.
 * Jede Regel steht deshalb nur hier; eine neue Regel gilt für beide Wege.
 *
 * Reihenfolge seit November 2026: erst die Zähldateien, dann die Messzeilen in
 * Portionen bis zum Ende des Zeitbudgets, zuletzt last_cleanup, und das nur,
 * wenn beide Teile durch sind. Die Antwort des Admin-Knopfs trägt dieselben
 * vier Felder wie zuvor; "deleted" zählt die Messzeilen dieses Aufrufs.
 */

require_once __DIR__ . '/db.php';

// Fail-closed: Ohne das ausdrückliche Zeichen des Einbinders gilt der Weg über
// HTTP mit Anmeldung, und ist diese Datei selbst das aufgerufene Skript, gilt
// er immer. Eine Anfrage kann die Variable nicht setzen.
$bereinigungIntern = isset($bereinigungIntern) && $bereinigungIntern === true
    && realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) !== __FILE__;

if (!$bereinigungIntern) {
    require_once __DIR__ . '/auth.php';

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

    if (!requireAuth()) exit;
}

// Eigene Verbindung für die Bereinigung, nicht die gemeinsame aus getDB():
// Auf der gemeinsamen kann ein Lesebefehl des aufrufenden Skripts noch offen
// sein (collect.php, auth.php holen je eine Zeile und schließen den Befehl
// nicht). Solange er offen ist, hält die Verbindung ihren Lesestand fest, und
// jeder Schreibbefehl darauf scheitert sofort mit "database is locked", sobald
// ein anderer Aufruf inzwischen geschrieben hat; die Wartezeit greift dann
// nicht (gemessen 10.11.2026: Abbruch nach der zweiten Portion, als ein zweiter
// Schreiber dazukam). Aus demselben Grund schließt diese Datei jeden eigenen
// Lesebefehl gleich nach dem Lesen (closeCursor).
getDB(); // legt Datenbank und Schema an, falls sie fehlen
$db = new PDO('sqlite:' . DB_PATH, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
if ($bereinigungIntern && defined('BEREINIGUNG_DB_WARTEN')) {
    // Der Lauf ohne Handgriff wartet je Befehl nur kurz auf die Schreibsperre
    // (PDO wartet sonst bis zu 60 Sekunden).
    $db->setAttribute(PDO::ATTR_TIMEOUT, BEREINIGUNG_DB_WARTEN);
}

// ─── Grenzen des Laufs ──────────────────────────────────────────────────────
// Portion: Die Messzeilen werden nicht mehr mit einem einzigen DELETE je Regel
// gelöscht, sondern in Portionen, jede als eigener Befehl und damit als eigene
// kurze Transaktion. Fortschritt bleibt so auch dann stehen, wenn der Lauf vor
// dem Ende aufhört, und die Schreibsperre der Datenbank ist nach jeder Portion
// wieder frei.
// 500 Zeilen: Gemessen wurden auf einem PC 23 bis 42 µs Rechenzeit je
// gelöschter Zeile (Wanduhr das 1,1- bis 1,6-fache), bei einer Datenbank, die
// den Seitenspeicher übersteigt, 106 µs Wanduhr. Mit dem angenommenen Faktor 3
// für Hostinger sind das höchstens rund 0,32 ms je Zeile, also rund 0,16 s je
// Portion: ein Sechstel der Sekunde, die ein anderer Schreiber warten dürfte.
$portionZeilen = 500;
// Pause nach jeder Portion: mindestens 20 ms und mindestens so lang, wie die
// Portion gedauert hat. Die Sperre ist damit höchstens die Hälfte der Zeit
// belegt. Ohne Pause käme ein wartender Schreiber kaum zum Zug: SQLite fragt
// beim Warten in Abständen von 1 bis 100 ms nach, eine Warteschlange gibt es nicht.
$portionPauseMs = 20;
// Ende des Zeitbudgets auf der Wanduhr (hrtime, Nanosekunden). Der Anstoß ohne
// Handgriff gibt es vor (BEREINIGUNG_BUDGET_MS in bereinigung-anstoss.php); der
// Admin-Knopf hat 240 Sekunden, unter den 300 Sekunden aus public/.user.ini.
// Was bis dahin nicht gelöscht ist, bleibt für den nächsten Lauf liegen.
$fristNs = ($bereinigungIntern && isset($bereinigungFristNs) && is_int($bereinigungFristNs))
    ? $bereinigungFristNs
    : hrtime(true) + 240 * 1000000000;

// Get retention setting
$stmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'retention_days'");
$stmt->execute();
$row = $stmt->fetch();
$stmt->closeCursor();
$retentionDays = $row ? intval($row['config_value']) : 90;

// Die Grenzen werden in UTC gebildet (gmdate), weil der Zeitstempel "ts" der
// Messzeilen UTC ist; mit date() läge die Grenze bei einer anderen Zeitzone
// des Servers um deren Abstand zu UTC daneben.
// Delete events older than retention period
$cutoff = gmdate('Y-m-d H:i:s', time() - ($retentionDays * 86400));
// Clean up heartbeat events older than 24 hours (only useful for real-time, not historical analysis)
$heartbeatCutoff = gmdate('Y-m-d H:i:s', time() - 86400);

// Die Regeln für Messzeilen: Bedingung und Grenze. Die Fristen sind dieselben
// wie zuvor, neu ist nur das Löschen in Portionen.
$zeilenRegeln = [
    ['ts < :grenze', $cutoff],
    ["event = 'heartbeat' AND ts < :grenze", $heartbeatCutoff],
];

// Der Datenbankteil läuft erst NACH dem Dateiteil weiter unten: Die Zähldateien
// mit IP-Bezug sind der zugesagte Teil und hängen so nicht hinter dem Teil, der
// bei großer Altlast nicht in einem Lauf fertig wird. Er steht hier als
// Funktion, damit der Dateiteil an seiner Stelle bleiben kann.
$dbStand = ['deleted' => 0, 'rest' => false, 'portionen' => 0, 'laengste_portion_ms' => 0];
$datenbankTeil = function () use ($db, $zeilenRegeln, $portionZeilen, $portionPauseMs, $fristNs, &$dbStand): void {
    $budgetAus = false;
    foreach ($zeilenRegeln as [$bedingung, $grenze]) {
        if (!$budgetAus) {
            $loeschen = $db->prepare(
                "DELETE FROM analytics_events WHERE id IN
                 (SELECT id FROM analytics_events WHERE $bedingung LIMIT " . (int)$portionZeilen . ')'
            );
            while (true) {
                if (hrtime(true) >= $fristNs) {
                    $budgetAus = true;
                    break;
                }
                $beginn = hrtime(true);
                $loeschen->execute([':grenze' => $grenze]);
                $anzahl = $loeschen->rowCount();
                $dauerNs = hrtime(true) - $beginn;
                $dbStand['deleted'] += $anzahl;
                $dbStand['portionen']++;
                $dbStand['laengste_portion_ms'] = max($dbStand['laengste_portion_ms'], (int)ceil($dauerNs / 1000000));
                if ($anzahl < $portionZeilen) {
                    break; // diese Regel ist fertig
                }
                // Budget gleich nach der Portion prüfen und nicht erst nach der
                // Pause: Der Lauf überzieht so höchstens um die eine Portion.
                if (hrtime(true) >= $fristNs) {
                    $budgetAus = true;
                    break;
                }
                usleep((int)min(1000000, max($portionPauseMs * 1000, intdiv($dauerNs, 1000))));
            }
        }
        if ($budgetAus) {
            // Budget verbraucht: nachsehen, ob wirklich noch etwas fällig ist
            // (ein Blick in den Index, keine Schreibsperre).
            $offen = $db->prepare("SELECT 1 FROM analytics_events WHERE $bedingung LIMIT 1");
            $offen->execute([':grenze' => $grenze]);
            $nochFaellig = $offen->fetchColumn() !== false;
            $offen->closeCursor();
            if ($nochFaellig) {
                $dbStand['rest'] = true;
                return;
            }
        }
    }
};

// Zeuge für den Dateiteil: Bestand vorher merken und jedes gescheiterte
// unlink zählen. Beides hängt nicht an den einzelnen Regeln darunter, gilt also
// auch für jede Regel, die dort später dazukommt. @unlink unterdrückt nur die
// Meldung, der Zähler hier sieht den Fehlschlag trotzdem. Eine Datei, die ein
// anderer Aufruf inzwischen entfernt hat, zählt nicht als Fehler.
$datenOrdner = __DIR__ . '/data/';
$dateienVorher = array_merge(glob($datenOrdner . '*.json') ?: [], glob($datenOrdner . 'geocache/*.json') ?: []);
$dateienFehler = 0;
set_error_handler(function (int $nr, string $text) use (&$dateienFehler): bool {
    if (strncmp($text, 'unlink(', 7) !== 0) {
        return false; // alles andere behandelt PHP wie sonst
    }
    if (strpos($text, 'No such file or directory') === false) {
        $dateienFehler++;
    }
    return true;
}, E_WARNING);

// Also clean up old rate limit files (older than 1 hour)
// rate_limit_*.json erfasst auch die IP-Zähler des Chats (rate_limit_chat_<md5>.json).
// chat_tagesdeckel.json (Tageszähler des Chats, chat.php) gehört NICHT in diese
// Liste: Er muss den ganzen Tag stehen bleiben und setzt sich am Folgetag selbst zurück.
$rateLimitDir = __DIR__ . '/data/';
$rateLimitPatterns = ['rate_limit_*.json', 'login_limit_*.json', 'email_limit_*.json', 'order_limit_*.json', 'inquiry_limit_*.json'];
foreach ($rateLimitPatterns as $pattern) {
    $files = glob($rateLimitDir . $pattern);
    if ($files) {
        foreach ($files as $file) {
            if (filemtime($file) < time() - 3600) {
                @unlink($file);
            }
        }
    }
}

// Clean up old geocache files (older than 7 days)
$geocacheDir = $rateLimitDir . 'geocache/';
if (is_dir($geocacheDir)) {
    $geoFiles = glob($geocacheDir . '*.json');
    if ($geoFiles) {
        foreach ($geoFiles as $file) {
            if (filemtime($file) < time() - 604800) {
                @unlink($file);
            }
        }
    }
}

// Ende des Dateiteils: zählen, was von dem Bestand von vorhin verschwunden ist.
restore_error_handler();
clearstatcache();
$dateienGeloescht = 0;
foreach ($dateienVorher as $datei) {
    if (!file_exists($datei)) {
        $dateienGeloescht++;
    }
}

// Jetzt der Datenbankteil (Regeln und Portionen stehen oben). last_cleanup ist
// der Zeuge für den ganzen Lauf und wird deshalb erst hier geschrieben, und nur,
// wenn beide Teile durch sind: keine fällige Messzeile mehr da und keine Datei,
// die sich nicht löschen ließ. Bleibt etwas liegen, merkt sich
// cleanup_teil_count die schon gelöschten Zeilen; last_cleanup_count nennt
// beim Abschluss die Summe seit dem letzten vollständigen Lauf.
// Scheitert der Datenbankteil mittendrin, bleiben die schon gelöschten Portionen
// gelöscht. Ihre Zahl wird deshalb auch im Fehlerfall vermerkt, sonst fehlte
// sie in der Summe, die last_cleanup_count beim Abschluss nennt.
$dbFehler = null;
$dbSperre = false;
$vollstaendig = false;
$dbAusnahme = null;
try {
    $datenbankTeil();
} catch (\Throwable $e) {
    $dbAusnahme = $e;
    if ($bereinigungIntern) {
        // Für den Vermerk unten nur noch kurz auf die Schreibsperre warten:
        // Der Lauf hat sein Warten schon hinter sich.
        try {
            $db->setAttribute(PDO::ATTR_TIMEOUT, 1);
        } catch (\Throwable $e2) {
            // dann bleibt es bei der bisherigen Wartezeit
        }
    }
}
try {
    $vollstaendig = $dbAusnahme === null && !$dbStand['rest'] && $dateienFehler === 0;

    $teilStmt = $db->prepare("SELECT config_value FROM analytics_config WHERE config_key = 'cleanup_teil_count'");
    $teilStmt->execute();
    $teilZuvor = (int)$teilStmt->fetchColumn();
    $teilStmt->closeCursor();

    // Store cleanup metadata
    $updateStmt = $db->prepare("
        INSERT INTO analytics_config (config_key, config_value, updated_at)
        VALUES (:key, :value, datetime('now'))
        ON CONFLICT(config_key) DO UPDATE SET config_value = :value, updated_at = datetime('now')
    ");
    if ($vollstaendig) {
        $updateStmt->execute([':key' => 'last_cleanup_count', ':value' => (string)($teilZuvor + $dbStand['deleted'])]);
        if ($teilZuvor !== 0) {
            $updateStmt->execute([':key' => 'cleanup_teil_count', ':value' => '0']);
        }
        $updateStmt->execute([':key' => 'last_cleanup', ':value' => gmdate('c')]);
    } elseif ($dbStand['deleted'] > 0) {
        $updateStmt->execute([':key' => 'cleanup_teil_count', ':value' => (string)($teilZuvor + $dbStand['deleted'])]);
    }
} catch (\Throwable $e) {
    $vollstaendig = false;
    if ($dbAusnahme === null) {
        $dbAusnahme = $e;
    }
    // Sonst gilt der erste Fehler; dass auch der Vermerk scheiterte, ändert
    // am Ergebnis nichts (die Zahl dieses Anlaufs fehlt dann in der Summe).
}
if ($dbAusnahme !== null) {
    if (!$bereinigungIntern) {
        throw $dbAusnahme; // Admin-Knopf: wie bisher ein Serverfehler ohne Text nach außen
    }
    $vollstaendig = false;
    $dbFehler = get_class($dbAusnahme) . ': ' . $dbAusnahme->getMessage();
    // Sperrfehler (SQLITE_BUSY 5, SQLITE_LOCKED 6): Die Datenbank war belegt,
    // kaputt ist nichts. bereinigung-anstoss.php wertet ihn nach Fortschritt
    // als Teillauf und nicht als Fehlschlag.
    $dbSperre = $dbAusnahme instanceof \PDOException
        && (in_array(((int)($dbAusnahme->errorInfo[1] ?? 0)) & 0xFF, [5, 6], true)
            || stripos($dbAusnahme->getMessage(), 'database is locked') !== false);
}
$deleted = $dbStand['deleted'];

// Admin-Knopf: Ein vollständiger Lauf von Hand wird auch in der Marke des
// Anstoßes als Erfolg vermerkt (unter ihrer Dateisperre), damit
// "checks.bereinigung" in health.php danach "ok" zeigt und der Mensch am Knopf
// die Wirkung seines Handgriffs sieht. Ein Fehler dabei ändert die Antwort nicht.
if (!$bereinigungIntern && $vollstaendig) {
    try {
        if ((@include_once __DIR__ . '/bereinigung-anstoss.php') !== false
            && function_exists('bereinigungErfolgVermerken')) {
            bereinigungErfolgVermerken([
                'deleted' => $deleted,
                'dateien' => $dateienGeloescht,
                'dateien_fehler' => $dateienFehler,
                'portionen' => $dbStand['portionen'],
                'laengste_portion_ms' => $dbStand['laengste_portion_ms'],
            ]);
        }
    } catch (\Throwable $e) {
        error_log('Bereinigung: Erfolg des Laufs von Hand nicht in der Marke vermerkt: ' . get_class($e) . ': ' . $e->getMessage());
    }
}

// Anstoß ohne Handgriff: Ergebnis an bereinigungAusfuehren() zurück, keine Ausgabe.
if ($bereinigungIntern) {
    return [
        'deleted' => $deleted,
        'retention_days' => $retentionDays,
        'cutoff_date' => $cutoff,
        'dateien' => $dateienGeloescht,
        'dateien_fehler' => $dateienFehler,
        'rest' => $dbStand['rest'],
        'portionen' => $dbStand['portionen'],
        'laengste_portion_ms' => $dbStand['laengste_portion_ms'],
        'db_fehler' => $dbFehler,
        'db_sperre' => $dbSperre,
        'vollstaendig' => $vollstaendig,
    ];
}

echo json_encode([
    'deleted' => $deleted,
    'retention_days' => $retentionDays,
    'cutoff_date' => $cutoff,
    'timestamp' => gmdate('c'),
]);
