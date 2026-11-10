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
 * Feld last_cleanup) noch nicht vollständig geräumt, läuft die Bereinigung nach
 * dem Ende des Skripts, also nachdem die Antwort geschrieben ist. Was geräumt
 * wird, steht allein in analytics-cleanup.php; diese Datei entscheidet nur,
 * wann, wie lange, und was danach als Erfolg gilt.
 *
 * Zusagen an die Aufrufer:
 *   - Höchstens ein Lauf zugleich (Dateisperre) und nach einem vollständigen
 *     Lauf keiner mehr am selben Tag (Marke data/bereinigung_lauf.json).
 *   - Ein Fehler ändert keine Antwort: Er steht nur im Fehlerprotokoll.
 *     Nach einem Fehlschlag frühestens nach BEREINIGUNG_PAUSE Sekunden erneut,
 *     höchstens BEREINIGUNG_VERSUCHE Fehlschläge je Tag.
 *   - Zeitbudget auf der Wanduhr: BEREINIGUNG_BUDGET_MS. Die Messzeilen werden
 *     in Portionen gelöscht; ist das Budget verbraucht, endet der Lauf als
 *     "teilweise", das Gelöschte bleibt gelöscht, und der nächste Anlauf macht
 *     nach BEREINIGUNG_PAUSE_TEIL Sekunden weiter, so oft wie nötig.
 *   - Dahinter als Notbremse BEREINIGUNG_ZEITGRENZE Sekunden Rechenzeit
 *     (set_time_limit zählt unter Linux Rechenzeit, nicht Dauer) und höchstens
 *     BEREINIGUNG_DB_WARTEN Sekunden Warten je Datenbankbefehl. Bricht PHP den
 *     Lauf an dieser Grenze ab, bleibt die Marke auf "laeuft" stehen; der
 *     nächste Anlauf erkennt das als abgebrochenen Lauf und zählt ihn. Gelöschte
 *     Dateien und abgeschlossene Portionen bleiben dabei gelöscht, nur die eine
 *     Portion, in der der Abbruch fiel, nimmt die Datenbank zurück.
 *   - An einem gewöhnlichen Aufruf kostet der Anstoß das Lesen einer kleinen Datei.
 *
 * Die Marke passt absichtlich in kein Muster der Bereinigung. Ihre Felder:
 *   tag, versuche, fehlschlaege, abbrueche   Anläufe des Kalendertags (UTC)
 *   zeit, ergebnis                           letzter Anlauf: laeuft | ok | teilweise | fehler
 *   geloescht, dateien, dateien_fehler,
 *   rest, portionen, laengste_portion_ms,
 *   dauer_ms                                 was der letzte Anlauf getan hat
 *   erfolg_tag, erfolg_zeit                  letzter VOLLSTÄNDIGER Lauf; bleibt über Anläufe stehen
 *   seit                                     erster Anlauf überhaupt (Beginn der Beobachtung)
 * Vollständig heißt: Zähldateien durch, keine ließ sich nicht löschen, keine
 * fällige Messzeile mehr da. Daraus liest health.php "checks.bereinigung".
 */

// Direkt aufgerufen gibt es hier nichts: Die Datei wird nur eingebunden.
if (realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    http_response_code(404);
    exit;
}

define('BEREINIGUNG_MARKE', __DIR__ . '/data/bereinigung_lauf.json');
define('BEREINIGUNG_ZEITGRENZE', 10);
// Zeitbudget eines Laufs auf der Wanduhr. 3 Sekunden, weil der Wächter des
// Hauses health.php mit einer Grenze von 5 Sekunden abruft
// (ops/sunds-hub/eintragen.py) und der Lauf an seinem Abruf hängen bleibt, wenn
// der Server die Antwort nicht vorab abschließen kann: 5 s abzüglich der
// Antwort selbst (gemessen 0,15 s), einer letzten Portion (bis 0,16 s bei
// Faktor 3) und gut einer Sekunde Luft. Der Dateiteil steht vor der ersten
// Prüfung des Budgets; er zählt mit, wird aber nicht unterbrochen.
define('BEREINIGUNG_BUDGET_MS', 3000);
define('BEREINIGUNG_DB_WARTEN', 2);
define('BEREINIGUNG_PAUSE', 600);
// Pause nach einem Lauf, der Fortschritt gemacht hat und nur nicht fertig
// wurde. Kurz, weil nichts kaputt ist: 3 s Arbeit je 60 s sind höchstens
// 5 Prozent der Zeit, die Schreibsperre ist davon höchstens die Hälfte belegt.
define('BEREINIGUNG_PAUSE_TEIL', 60);
define('BEREINIGUNG_VERSUCHE', 3);
// Ab diesem Alter des letzten vollständigen Laufs meldet health.php
// "ueberfaellig": zwei Tage. Der Lauf ist täglich fällig, ein gesunder Abstand
// liegt bei 24 Stunden; zwei Tage heißen, dass ein ganzer Kalendertag ohne
// vollständigen Lauf vergangen ist.
define('BEREINIGUNG_UEBERFAELLIG', 172800);

/** Inhalt der Marke, je Aufruf höchstens einmal gelesen. false = Datei fehlt. */
function bereinigungMarkeLesen() {
    static $gelesen = null;
    if ($gelesen === null) {
        $roh = @file_get_contents(BEREINIGUNG_MARKE);
        $gelesen = ['stand' => $roh === false ? false : json_decode($roh, true)];
    }
    return $gelesen['stand'];
}

/**
 * Entscheidet aus dem Inhalt der Marke, ob jetzt ein Lauf fällig ist.
 * Eine fehlende oder unlesbare Marke heißt: fällig.
 */
function bereinigungFaellig($stand, int $jetzt): bool {
    if (!is_array($stand) || ($stand['tag'] ?? null) !== gmdate('Y-m-d', $jetzt)) {
        return true;
    }
    $ergebnis = $stand['ergebnis'] ?? null;
    if ($ergebnis === 'ok') {
        return false;
    }
    $her = $jetzt - (int)($stand['zeit'] ?? 0);
    if ($ergebnis === 'teilweise') {
        // Fortschritt, aber nicht fertig: weiter nach kurzer Pause, ohne Obergrenze.
        return $her >= BEREINIGUNG_PAUSE_TEIL;
    }
    if ($ergebnis === 'laeuft') {
        // Entweder räumt gerade eine andere Anfrage (dann hält sie die Sperre),
        // oder der Lauf ist abgebrochen. Das entscheidet sich erst unter der
        // Sperre in bereinigungLaufen(); dort wird der Abbruch auch gezählt.
        return $her >= BEREINIGUNG_PAUSE;
    }
    // Fehlschlag: mit Pause und Obergrenze. Eine Marke aus der ersten Fassung
    // kennt "fehlschlaege" noch nicht, dort zählen die Versuche.
    if ((int)($stand['fehlschlaege'] ?? $stand['versuche'] ?? 0) >= BEREINIGUNG_VERSUCHE) {
        return false;
    }
    return $her >= BEREINIGUNG_PAUSE;
}

/**
 * Für health.php: "ok" oder "ueberfaellig". Überfällig ist die Bereinigung,
 * wenn der letzte vollständige Lauf länger als BEREINIGUNG_UEBERFAELLIG her ist,
 * oder wenn es noch keinen gab und der erste Anlauf so lange her ist. Ohne
 * Marke (frisch nach dem Deploy, noch kein Anlauf) gilt "ok".
 * Liest nur die Marke, keine Datenbank, und schreibt nichts.
 */
function bereinigungZustand(?int $jetzt = null): string {
    $jetzt = $jetzt ?? time();
    $stand = bereinigungMarkeLesen();
    if ($stand === false) {
        // Fehlt die Datei, ist nie ein Lauf angelaufen. Ist sie da und nur
        // nicht lesbar, ist der Zustand unbekannt und gilt als überfällig.
        return file_exists(BEREINIGUNG_MARKE) ? 'ueberfaellig' : 'ok';
    }
    $bezug = null;
    if (is_array($stand) && is_int($stand['erfolg_zeit'] ?? null)) {
        $bezug = $stand['erfolg_zeit'];
    } elseif (is_array($stand) && is_int($stand['seit'] ?? null)) {
        $bezug = $stand['seit'];
    } else {
        // Leer oder halb geschrieben (ein Lauf schreibt gerade) oder Marke der
        // ersten Fassung: Es zählt, wann die Datei zuletzt geschrieben wurde.
        $geschrieben = @filemtime(BEREINIGUNG_MARKE);
        $bezug = $geschrieben === false ? null : $geschrieben;
    }
    if ($bezug === null) {
        return 'ueberfaellig';
    }
    return ($jetzt - $bezug) > BEREINIGUNG_UEBERFAELLIG ? 'ueberfaellig' : 'ok';
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
        if (bereinigungFaellig(bereinigungMarkeLesen(), time())) {
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
 * Der Stand für einen neuen Anlauf: Zähler des Tages weitergeführt oder neu
 * begonnen, der letzte vollständige Erfolg und der Beginn der Beobachtung
 * übernommen. "versuche" zählt der Aufrufer erst hoch, wenn wirklich gelaufen wird.
 */
function bereinigungNeuerStand($stand, int $jetzt): array {
    $alt = is_array($stand) ? $stand : [];
    $heute = gmdate('Y-m-d', $jetzt);
    $gleicherTag = ($alt['tag'] ?? null) === $heute;
    $neu = [
        'tag' => $heute,
        'versuche' => $gleicherTag ? (int)($alt['versuche'] ?? 0) : 0,
        'fehlschlaege' => $gleicherTag ? (int)($alt['fehlschlaege'] ?? 0) : 0,
        'abbrueche' => $gleicherTag ? (int)($alt['abbrueche'] ?? 0) : 0,
        'zeit' => $jetzt,
        'ergebnis' => 'laeuft',
        'seit' => is_int($alt['seit'] ?? null) ? $alt['seit'] : $jetzt,
    ];
    if (is_int($alt['erfolg_zeit'] ?? null)) {
        $neu['erfolg_zeit'] = $alt['erfolg_zeit'];
        $neu['erfolg_tag'] = is_string($alt['erfolg_tag'] ?? null) ? $alt['erfolg_tag'] : gmdate('Y-m-d', $alt['erfolg_zeit']);
    }
    return $neu;
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
    $gesperrt = false;
    try {
        $belegt = 0;
        if (!flock($fp, LOCK_EX | LOCK_NB, $belegt)) {
            if (!$belegt) {
                // Nicht "belegt", sondern ein Fehler der Sperre selbst (etwa
                // ENOLCK auf einem Netzlaufwerk). Ohne Sperre wird nicht
                // geräumt. Der Fehlschlag wird gezählt, ausnahmsweise ohne
                // Sperre geschrieben, damit Pause und Obergrenze greifen und
                // nicht jede Anfrage eine Protokollzeile schreibt.
                $jetzt = time();
                $neu = bereinigungNeuerStand(json_decode((string)stream_get_contents($fp), true), $jetzt);
                $neu['ergebnis'] = 'fehler';
                $neu['fehlschlaege']++;
                error_log('Bereinigung: Sperre auf ' . basename(BEREINIGUNG_MARKE)
                    . ' gescheitert, obwohl sie niemand hält; es wird nicht geräumt (Fehlschlag '
                    . $neu['fehlschlaege'] . ' heute)');
                bereinigungMarkeSchreiben($fp, $neu);
            }
            return;
        }
        $gesperrt = true;
        $beginnNs = hrtime(true);
        $jetzt = time();
        $stand = json_decode((string)stream_get_contents($fp), true);
        if (!bereinigungFaellig($stand, $jetzt)) {
            return;
        }
        $neu = bereinigungNeuerStand($stand, $jetzt);

        // Steht die Marke auf "laeuft" und die Sperre war frei, ist der vorige
        // Lauf nicht zu Ende gekommen (PHP hat ihn an der Zeitgrenze beendet,
        // oder der Prozess ist gestorben). Das zählt als Fehlschlag seines Tages.
        if (is_array($stand) && ($stand['ergebnis'] ?? null) === 'laeuft') {
            $neu['abbrueche']++;
            if (($stand['tag'] ?? null) === $neu['tag']) {
                $neu['fehlschlaege']++;
            }
            error_log('Bereinigung: der Lauf vom ' . (string)($stand['tag'] ?? '?') . ' (Versuch '
                . (int)($stand['versuche'] ?? 0) . ') endete ohne Abschluss, er wurde abgebrochen');
            if ($neu['fehlschlaege'] >= BEREINIGUNG_VERSUCHE) {
                $neu['ergebnis'] = 'fehler';
                bereinigungMarkeSchreiben($fp, $neu);
                return;
            }
        }

        $neu['versuche']++;
        bereinigungMarkeSchreiben($fp, $neu);

        try {
            if (function_exists('set_time_limit')) {
                @set_time_limit(BEREINIGUNG_ZEITGRENZE);
            }
            $ergebnis = bereinigungAusfuehren($beginnNs + BEREINIGUNG_BUDGET_MS * 1000000);
            foreach (['dateien', 'dateien_fehler', 'portionen', 'laengste_portion_ms'] as $feld) {
                $neu[$feld] = (int)($ergebnis[$feld] ?? 0);
            }
            $neu['geloescht'] = (int)($ergebnis['deleted'] ?? 0);
            $neu['rest'] = !empty($ergebnis['rest']);
            if (!array_key_exists('vollstaendig', $ergebnis)) {
                // Halb hochgeladener Stand: analytics-cleanup.php ist noch die alte Fassung.
                $neu['ergebnis'] = 'fehler';
                error_log('Bereinigung: Lauf ' . $neu['versuche'] . ': analytics-cleanup.php meldet nicht, ob es fertig wurde');
            } elseif (($ergebnis['db_fehler'] ?? null) !== null) {
                $neu['ergebnis'] = 'fehler';
                error_log('Bereinigung: Lauf ' . $neu['versuche'] . ' gescheitert im Datenbankteil nach '
                    . $neu['geloescht'] . ' Messzeilen (' . $neu['dateien'] . ' Dateien sind gelöscht): ' . $ergebnis['db_fehler']);
            } elseif ($neu['rest']) {
                $neu['ergebnis'] = 'teilweise';
                error_log('Bereinigung: Lauf ' . $neu['versuche'] . ' teilweise: ' . $neu['geloescht']
                    . ' Messzeilen in ' . $neu['portionen'] . ' Portionen gelöscht, das Zeitbudget ist verbraucht, der Rest folgt');
            } elseif ($ergebnis['vollstaendig'] !== true) {
                $neu['ergebnis'] = 'fehler';
                error_log('Bereinigung: Lauf ' . $neu['versuche'] . ': ' . $neu['dateien_fehler']
                    . ' Datei(en) ließen sich nicht löschen, der Lauf gilt nicht als vollständig');
            } else {
                $neu['ergebnis'] = 'ok';
                $neu['erfolg_zeit'] = time();
                $neu['erfolg_tag'] = gmdate('Y-m-d', $neu['erfolg_zeit']);
            }
        } catch (\Throwable $e) {
            $neu['ergebnis'] = 'fehler';
            error_log('Bereinigung: Lauf ' . $neu['versuche'] . ' gescheitert: ' . get_class($e) . ': ' . $e->getMessage());
        }
        if ($neu['ergebnis'] === 'fehler') {
            $neu['fehlschlaege']++;
        }
        $neu['zeit'] = time();
        $neu['dauer_ms'] = intdiv(hrtime(true) - $beginnNs, 1000000);
        bereinigungMarkeSchreiben($fp, $neu);
    } finally {
        if ($gesperrt) {
            flock($fp, LOCK_UN);
        }
        fclose($fp);
    }
}

/**
 * Führt die Regeln aus analytics-cleanup.php aus, ohne HTTP-Teil und ohne
 * Anmeldung. Die Variablen $bereinigungIntern und $bereinigungFristNs (Ende des
 * Zeitbudgets, hrtime) gelten nur in dieser Funktion; eine Anfrage von außen
 * kann sie nicht setzen.
 */
function bereinigungAusfuehren(int $bereinigungFristNs): array {
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
