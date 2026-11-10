<?php
/**
 * S&S Messebau - Admin-Passwort neu setzen, nur auf der Kommandozeile des Servers
 *
 * Für den Fall, dass der Zugang zum Admin-Bereich vergessen wurde. Die Datei tut
 * nichts, wenn sie über das Netz aufgerufen wird (Antwort 404); sie läuft nur,
 * wenn jemand am Hosting-Konto angemeldet ist und sie von Hand startet:
 *
 *   php domains/sunds-messebau.de/public_html/api/admin-passwort-setzen.php
 *
 * Sie zeigt den Benutzernamen, fragt das neue Passwort zweimal verdeckt ab und
 * tauscht nur den gespeicherten Hash. Sie legt keinen Benutzer an, löscht nichts
 * und schreibt das Passwort in keine Datei und kein Protokoll.
 *
 * Bestehende Anmeldungen im Admin-Bereich bleiben bis zu ihrem Ablauf gültig.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/config.php';

const PASSWORT_MIN_BYTES = 12;
// bcrypt liest nur die ersten 72 Byte; ein längeres Passwort würde still gekürzt.
const PASSWORT_MAX_BYTES = 72;

/** Meldung ausgeben und mit Fehlercode enden; geändert ist dann nichts. */
function abbruch(string $meldung): never {
    fwrite(STDERR, "\n" . $meldung . "\nEs wurde nichts geändert.\n");
    exit(1);
}

/** Eine Zeile von der Tastatur, ohne Zeilenende. */
function zeileLesen(): string {
    $zeile = fgets(STDIN);
    if ($zeile === false) {
        abbruch('Die Eingabe wurde beendet.');
    }
    return rtrim($zeile, "\r\n");
}

/** Schaltet die Anzeige der Eingabe ab; false, wenn das hier nicht geht. */
function anzeigeAus(): bool {
    if (!function_exists('shell_exec')) {
        return false;
    }
    $vorher = shell_exec('stty -g 2>/dev/null');
    if (!is_string($vorher) || trim($vorher) === '') {
        return false;
    }
    register_shutdown_function(static function () use ($vorher): void {
        shell_exec('stty ' . escapeshellarg(trim($vorher)) . ' 2>/dev/null');
    });
    shell_exec('stty -echo 2>/dev/null');
    // Gegenprobe am Terminal selbst: „-echo“ als eigenes Wort (nicht „-echoctl“ und Ähnliches).
    $jetzt = shell_exec('stty -a 2>/dev/null');
    return is_string($jetzt) && preg_match('/(^|[\s;])-echo([\s;]|$)/', $jetzt) === 1;
}

function anzeigeAn(): void {
    if (function_exists('shell_exec')) {
        shell_exec('stty echo 2>/dev/null');
    }
}

/** Fragt verdeckt nach einem Passwort. */
function passwortLesen(string $frage): string {
    fwrite(STDOUT, $frage);
    $eingabe = zeileLesen();
    fwrite(STDOUT, "\n");
    return $eingabe;
}

function passwortSetzen(PDO $db, int $id, #[\SensitiveParameter] string $passwort): void {
    $hash = password_hash($passwort, PASSWORD_BCRYPT);
    $stmt = $db->prepare("UPDATE admin_users SET password_hash = :hash, updated_at = datetime('now') WHERE id = :id");
    $stmt->execute([':hash' => $hash, ':id' => $id]);
    if ($stmt->rowCount() !== 1) {
        abbruch('Der Eintrag ließ sich nicht ändern.');
    }
    $neu = $db->prepare('SELECT password_hash FROM admin_users WHERE id = :id');
    $neu->execute([':id' => $id]);
    if (!password_verify($passwort, (string) $neu->fetchColumn())) {
        abbruch('Die Gegenprobe nach dem Speichern ist fehlgeschlagen. Bitte den Vorgang wiederholen.');
    }
}

try {
    if (!function_exists('posix_isatty') || !posix_isatty(STDIN) || !posix_isatty(STDOUT)) {
        abbruch('Dieses Werkzeug läuft nur in einem Terminal, in dem ein Mensch tippt.');
    }

    // Die Datenbank wird nur geöffnet, nie angelegt: Fehlt sie, stimmt etwas anderes nicht.
    if (!is_file(DB_PATH)) {
        abbruch('Die Datenbank der Website wurde nicht gefunden.');
    }
    $db = new PDO('sqlite:' . DB_PATH, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('PRAGMA busy_timeout=5000');

    $admins = $db->query('SELECT id, username, display_name FROM admin_users ORDER BY id')->fetchAll();
    if (count($admins) === 0) {
        abbruch('Es gibt keinen Admin-Benutzer. Dieses Werkzeug legt keinen an.');
    }

    fwrite(STDOUT, "Admin-Bereich von sunds-messebau.de: Passwort neu setzen\n\n");
    if (count($admins) === 1) {
        $admin = $admins[0];
        fwrite(STDOUT, 'Benutzername: ' . $admin['username'] . "\n");
    } else {
        fwrite(STDOUT, "Es gibt mehrere Benutzer:\n");
        foreach ($admins as $zeile) {
            fwrite(STDOUT, '  ' . $zeile['username'] . "\n");
        }
        fwrite(STDOUT, 'Für welchen Benutzernamen? ');
        $name = trim(zeileLesen());
        $treffer = array_values(array_filter($admins, static fn (array $zeile): bool => $zeile['username'] === $name));
        if (count($treffer) !== 1) {
            abbruch('Diesen Benutzernamen gibt es nicht.');
        }
        $admin = $treffer[0];
    }

    if (!anzeigeAus()) {
        anzeigeAn();
        abbruch('Die Eingabe ließe sich hier nicht verdecken. Das Passwort wird deshalb nicht abgefragt.');
    }
    $erstes = passwortLesen('Neues Passwort (12 bis 72 Zeichen, wird nicht angezeigt): ');
    $zweites = passwortLesen('Neues Passwort wiederholen: ');
    anzeigeAn();

    if ($erstes !== $zweites) {
        abbruch('Die beiden Eingaben sind verschieden.');
    }
    if (strlen($erstes) < PASSWORT_MIN_BYTES) {
        abbruch('Das Passwort ist zu kurz (mindestens 12 Zeichen).');
    }
    if (strlen($erstes) > PASSWORT_MAX_BYTES) {
        abbruch('Das Passwort ist zu lang (höchstens 72 Zeichen; Umlaute zählen doppelt).');
    }

    passwortSetzen($db, (int) $admin['id'], $erstes);

    fwrite(STDOUT, "\nDas Passwort ist gesetzt.\n");
    fwrite(STDOUT, 'Anmelden unter https://sunds-messebau.de/admin mit dem Benutzernamen ' . $admin['username'] . ".\n");
    fwrite(STDOUT, "Bitte beides jetzt in der Passwortverwaltung ablegen.\n");
    exit(0);
} catch (\Throwable $fehler) {
    anzeigeAn();
    // Nur die Art des Fehlers, nie Aufrufparameter: Darin stünde das Passwort.
    abbruch('Unerwarteter Fehler (' . get_class($fehler) . ').');
}
