<?php
/**
 * S&S Messebau - Anstoß der Bereinigung ohne Handgriff
 *
 * Die Datenschutzerklärung sagt zu, dass die Bereinigung mindestens einmal im
 * Monat läuft. Bis November 2026 lief sie nur, wenn ein angemeldeter Admin den
 * Knopf drückte (zuletzt 19.02.2026); die Zähldateien mit IP-Bezug blieben so
 * lange liegen. Hostinger Shared Hosting hat keinen Timer, den das Repo
 * einrichten könnte. Deshalb stößt gewöhnlicher Betrieb die Bereinigung an:
 *
 *   health.php   (der Wächter des Hauses ruft sie regelmäßig ab, auch ohne Besucher)
 *   collect.php  (jeder gezählte Seitenaufruf)
 *
 * Beide rufen bereinigungVormerken(). Ist heute (Kalendertag in UTC, wie das
 * Feld last_cleanup) noch nicht geräumt, läuft die Bereinigung nach dem Ende
 * des Skripts, also nachdem die Antwort geschrieben ist. Was geräumt wird,
 * steht allein in analytics-cleanup.php; diese Datei entscheidet nur, wann.
 *
 * Zusagen an die Aufrufer:
 *   - Höchstens ein Lauf zugleich (Dateisperre) und nach einem gelungenen Lauf
 *     keiner mehr am selben Tag (Marke data/bereinigung_lauf.json).
 *   - Ein Fehler ändert keine Antwort: Er steht nur im Fehlerprotokoll.
 *     Nach einem Fehlschlag frühestens nach BEREINIGUNG_PAUSE Sekunden erneut,
 *     höchstens BEREINIGUNG_VERSUCHE Anläufe je Tag.
 *   - Zeitgrenze: BEREINIGUNG_ZEITGRENZE Sekunden Rechenzeit, dazu höchstens
 *     BEREINIGUNG_DB_WARTEN Sekunden Warten je Datenbankbefehl. Danach bricht
 *     PHP den Lauf ab; der nächste Anlauf macht dort weiter, wo Dateien fehlen.
 *   - An einem gewöhnlichen Aufruf kostet der Anstoß das Lesen einer kleinen Datei.
 *
 * Die Marke passt absichtlich in kein Muster der Bereinigung.
 */

// Direkt aufgerufen gibt es hier nichts: Die Datei wird nur eingebunden.
if (realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    http_response_code(404);
    exit;
}

define('BEREINIGUNG_MARKE', __DIR__ . '/data/bereinigung_lauf.json');
define('BEREINIGUNG_ZEITGRENZE', 10);
define('BEREINIGUNG_DB_WARTEN', 2);
define('BEREINIGUNG_PAUSE', 600);
define('BEREINIGUNG_VERSUCHE', 3);

/**
 * Entscheidet aus dem Inhalt der Marke, ob jetzt ein Lauf fällig ist.
 * Eine fehlende oder unlesbare Marke heißt: fällig.
 */
function bereinigungFaellig($stand, int $jetzt): bool {
    if (!is_array($stand) || ($stand['tag'] ?? null) !== gmdate('Y-m-d', $jetzt)) {
        return true;
    }
    if (($stand['ergebnis'] ?? null) === 'ok') {
        return false;
    }
    // Heute schon versucht, aber nicht gelungen ("fehler") oder mitten im Lauf
    // abgebrochen ("laeuft" ohne gehaltene Sperre): mit Pause und Obergrenze.
    if ((int)($stand['versuche'] ?? 0) >= BEREINIGUNG_VERSUCHE) {
        return false;
    }
    return ($jetzt - (int)($stand['zeit'] ?? 0)) >= BEREINIGUNG_PAUSE;
}

/**
 * Von health.php und collect.php gerufen. Schreibt nichts in die Antwort und
 * wirft nicht. Der Lauf selbst folgt erst nach dem Ende des Skripts.
 */
function bereinigungVormerken(): void {
    static $vorgemerkt = false;
    if ($vorgemerkt) {
        return;
    }
    $vorgemerkt = true;
    try {
        // Ohne Sperre gelesen: Ein halb geschriebener Stand gilt als "fällig",
        // die Entscheidung fällt dann unter der Sperre in bereinigungLaufen().
        $stand = json_decode((string)@file_get_contents(BEREINIGUNG_MARKE), true);
        if (bereinigungFaellig($stand, time())) {
            register_shutdown_function('bereinigungNachAntwort');
        }
    } catch (\Throwable $e) {
        error_log('Bereinigung: Vormerken gescheitert: ' . $e->getMessage());
    }
}

/**
 * Läuft als Shutdown-Funktion. Gibt zuerst die Antwort frei, wenn die Umgebung
 * das kann (PHP-FPM, LiteSpeed), und räumt dann. Ohne diese Möglichkeit bleibt
 * die Verbindung dieses einen Aufrufs bis zum Ende des Laufs offen, die Antwort
 * selbst ist dann schon geschrieben.
 */
function bereinigungNachAntwort(): void {
    try {
        // Nichts von hier darf in der Antwort landen, auch keine Meldung von
        // PHP selbst beim Erreichen der Zeitgrenze.
        if (function_exists('ini_set')) {
            @ini_set('display_errors', '0');
        }
        if (function_exists('ignore_user_abort')) {
            @ignore_user_abort(true);
        }
        if (function_exists('fastcgi_finish_request')) {
            @fastcgi_finish_request();
        } elseif (function_exists('litespeed_finish_request')) {
            @litespeed_finish_request();
        } else {
            while (ob_get_level() > 0) {
                @ob_end_flush();
            }
            @flush();
        }
        bereinigungLaufen();
    } catch (\Throwable $e) {
        error_log('Bereinigung: ' . get_class($e) . ': ' . $e->getMessage());
    }
}

function bereinigungMarkeSchreiben($fp, array $stand): void {
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($stand));
    fflush($fp);
}

/**
 * Ein Lauf unter Dateisperre. Wer die Sperre nicht sofort bekommt, geht:
 * Dann räumt gerade eine andere Anfrage.
 */
function bereinigungLaufen(): void {
    $fp = @fopen(BEREINIGUNG_MARKE, 'c+');
    if (!$fp) {
        // Datenordner nicht beschreibbar. Das meldet health.php selbst
        // (data_writable); hier kein Protokolleintrag je Anfrage.
        return;
    }
    try {
        if (!flock($fp, LOCK_EX | LOCK_NB)) {
            return;
        }
        $jetzt = time();
        $stand = json_decode((string)stream_get_contents($fp), true);
        if (!bereinigungFaellig($stand, $jetzt)) {
            return;
        }
        $heute = gmdate('Y-m-d', $jetzt);
        $versuche = (is_array($stand) && ($stand['tag'] ?? null) === $heute)
            ? (int)($stand['versuche'] ?? 0) + 1
            : 1;
        $neu = ['tag' => $heute, 'versuche' => $versuche, 'zeit' => $jetzt, 'ergebnis' => 'laeuft'];
        bereinigungMarkeSchreiben($fp, $neu);

        try {
            if (function_exists('set_time_limit')) {
                @set_time_limit(BEREINIGUNG_ZEITGRENZE);
            }
            $ergebnis = bereinigungAusfuehren();
            $neu['ergebnis'] = 'ok';
            $neu['geloescht'] = (int)($ergebnis['deleted'] ?? 0);
        } catch (\Throwable $e) {
            $neu['ergebnis'] = 'fehler';
            error_log('Bereinigung: Lauf ' . $versuche . ' gescheitert: ' . get_class($e) . ': ' . $e->getMessage());
        }
        $neu['zeit'] = time();
        bereinigungMarkeSchreiben($fp, $neu);
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

/**
 * Führt die Regeln aus analytics-cleanup.php aus, ohne HTTP-Teil und ohne
 * Anmeldung. Die Variable $bereinigungIntern gilt nur in dieser Funktion;
 * eine Anfrage von außen kann sie nicht setzen.
 */
function bereinigungAusfuehren(): array {
    require_once __DIR__ . '/db.php';
    // PDO wartet sonst bis zu 60 Sekunden auf eine gesperrte Datenbank.
    getDB()->setAttribute(PDO::ATTR_TIMEOUT, BEREINIGUNG_DB_WARTEN);
    $bereinigungIntern = true;
    $ergebnis = require __DIR__ . '/analytics-cleanup.php';
    if (!is_array($ergebnis)) {
        throw new \RuntimeException('analytics-cleanup.php hat kein Ergebnis geliefert');
    }
    return $ergebnis;
}
