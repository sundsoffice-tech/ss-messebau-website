<?php
/**
 * S&S Messebau - Admin-Passwort neu setzen, nur auf der Kommandozeile des Servers
 *
 * Für den Fall, dass der Zugang zum Admin-Bereich vergessen wurde. Die Datei tut
 * nichts, wenn sie über das Netz aufgerufen wird (Antwort 404). Gestartet wird
 * nicht sie, sondern der Einstieg daneben, von einem Menschen, der am
 * Hosting-Konto angemeldet ist:
 *
 *   bash domains/sunds-messebau.de/public_html/api/admin-passwort-setzen.sh
 *
 * Der Einstieg prüft das Terminal, fragt das neue Passwort verdeckt ab und reicht
 * es dieser Datei über die Standardeingabe. Diese Datei ruft selbst kein Programm
 * auf, prüft die Eingaben und tauscht nur den gespeicherten Hash. Sie legt keinen
 * Benutzer an, löscht nichts und schreibt das Passwort in keine Datei und kein
 * Protokoll.
 *
 * Mit dem neuen Hash enden alle bestehenden Anmeldungen im Admin-Bereich: Jede
 * Sitzung trägt eine Marke zum Passwort-Stand ihrer Anmeldung (auth.php), und
 * die passt nach dem Tausch nicht mehr.
 *
 * Aufrufe (nur vom Einstieg):
 *   php admin-passwort-setzen.php liste     eine Zeile je Benutzername
 *   php admin-passwort-setzen.php setzen    liest drei Zeilen: Benutzername, Passwort, Wiederholung
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/config.php';

const PASSWORT_MIN_BYTES = 12;
// bcrypt liest nur die ersten 72 Byte; ein längeres Passwort würde still gekürzt.
const PASSWORT_MAX_BYTES = 72;

/** Meldung ausgeben und mit Fehlercode enden. */
function abbruch(string $meldung, bool $unveraendert = true): void {
    fwrite(STDERR, "\n" . $meldung . "\n" . ($unveraendert ? "Es wurde nichts geändert.\n" : ''));
    exit(1);
}

/** Öffnet die Datenbank der Website; angelegt wird sie hier nie. */
function datenbank(): PDO {
    if (!is_file(DB_PATH)) {
        abbruch('Die Datenbank der Website wurde nicht gefunden.');
    }
    $db = new PDO('sqlite:' . DB_PATH, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('PRAGMA busy_timeout=5000');
    return $db;
}

function admins(PDO $db): array {
    $admins = $db->query('SELECT id, username FROM admin_users ORDER BY id')->fetchAll();
    if (count($admins) === 0) {
        abbruch('Es gibt keinen Admin-Benutzer. Dieses Werkzeug legt keinen an.');
    }
    return $admins;
}

/** Eine Zeile von der Standardeingabe, ohne Zeilenende. */
function zeileLesen(): string {
    $zeile = fgets(STDIN);
    if ($zeile === false) {
        abbruch('Die Eingabe wurde beendet.');
    }
    return rtrim($zeile, "\r\n");
}

function passwortPruefen(
    #[\SensitiveParameter]
    string $erstes,
    #[\SensitiveParameter]
    string $zweites
): void {
    if ($erstes !== $zweites) {
        abbruch('Die beiden Eingaben sind verschieden.');
    }
    // Nur Zeichen, die jedes Terminal und jeder Browser gleich überträgt. Ein Umlaut oder
    // eine Pfeiltaste käme hier anders an als später im Anmeldefeld: gesetzt, aber unbrauchbar.
    if (preg_match('/^[\x20-\x7E]*$/D', $erstes) !== 1) {
        abbruch('Das Passwort enthält ein Zeichen, das nicht sicher übertragen wird. Bitte nur Buchstaben ohne Umlaute, Ziffern und gängige Satzzeichen verwenden.');
    }
    if (strlen($erstes) < PASSWORT_MIN_BYTES) {
        abbruch('Das Passwort ist zu kurz (mindestens 12 Zeichen).');
    }
    if (strlen($erstes) > PASSWORT_MAX_BYTES) {
        abbruch('Das Passwort ist zu lang (höchstens 72 Zeichen).');
    }
}

function passwortSetzen(
    PDO $db,
    int $id,
    #[\SensitiveParameter]
    string $passwort
): void {
    $hash = password_hash($passwort, PASSWORD_BCRYPT);
    $stmt = $db->prepare("UPDATE admin_users SET password_hash = :hash, updated_at = datetime('now') WHERE id = :id");
    $stmt->execute([':hash' => $hash, ':id' => $id]);
    if ($stmt->rowCount() !== 1) {
        abbruch('Der Eintrag ließ sich nicht sauber ändern. Bitte den Vorgang wiederholen.', false);
    }
    $neu = $db->prepare('SELECT password_hash FROM admin_users WHERE id = :id');
    $neu->execute([':id' => $id]);
    if (!password_verify($passwort, (string) $neu->fetchColumn())) {
        abbruch('Das Passwort wurde geändert, aber die Gegenprobe ist fehlgeschlagen. Bitte den Vorgang wiederholen.', false);
    }
}

try {
    $befehl = $argv[1] ?? '';

    if ($befehl === 'liste') {
        foreach (admins(datenbank()) as $zeile) {
            fwrite(STDOUT, $zeile['username'] . "\n");
        }
        exit(0);
    }

    if ($befehl === 'setzen') {
        // Das Ergebnis geht an einen Menschen am Terminal, nicht in eine Datei oder ein anderes Programm.
        if (!function_exists('stream_isatty') || !stream_isatty(STDOUT)) {
            abbruch('Dieses Werkzeug läuft nur in einem Terminal, in dem ein Mensch tippt.');
        }
        // Die Eingaben kommen vom Einstieg über ein Rohr. Von Hand am Terminal gestartet stünde
        // das Passwort beim Tippen auf dem Schirm: Dann wird gar nicht erst gelesen.
        if (stream_isatty(STDIN)) {
            abbruch('Bitte den Einstieg starten: bash admin-passwort-setzen.sh');
        }
        // Auch der Benutzername kommt über das Rohr, nicht als Argument (Prozessliste).
        $name = zeileLesen();
        $db = datenbank();
        $treffer = array_values(array_filter(admins($db), static function (array $zeile) use ($name): bool {
            return $zeile['username'] === $name;
        }));
        if (count($treffer) !== 1) {
            abbruch('Diesen Benutzernamen gibt es nicht.');
        }
        $erstes = zeileLesen();
        $zweites = zeileLesen();
        passwortPruefen($erstes, $zweites);
        passwortSetzen($db, (int) $treffer[0]['id'], $erstes);

        fwrite(STDOUT, "\nDas Passwort ist gesetzt.\n");
        fwrite(STDOUT, 'Anmelden unter https://sunds-messebau.de/admin mit dem Benutzernamen ' . $treffer[0]['username'] . ".\n");
        fwrite(STDOUT, "Bitte beides jetzt in der Passwortverwaltung ablegen.\n");
        exit(0);
    }

    abbruch('Bitte den Einstieg starten: bash admin-passwort-setzen.sh');
} catch (\Throwable $fehler) {
    // Nur die Art des Fehlers, nie Aufrufparameter: Darin stünde das Passwort.
    abbruch('Unerwarteter Fehler (' . get_class($fehler) . '). Ob etwas geändert wurde, ist offen; bitte den Vorgang wiederholen.', false);
}
