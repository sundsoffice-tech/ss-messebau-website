<?php
/**
 * Test für public/api/admin-passwort-setzen.php (Passwort neu setzen auf der Kommandozeile).
 *
 * Aufruf im Container php:8.3-cli ohne Netz, Arbeitsverzeichnis Repo-Wurzel:
 *   php ops/tests/admin_passwort_cli_test.php
 *
 * Jeder Fall bekommt eine eigene Kopie von public/api mit eigener Datenbank. Das
 * Werkzeug wird über `script` in einem Pseudo-Terminal gestartet, weil es ohne
 * Terminal abbricht; Eingaben gehen erst hinaus, wenn die Frage auf dem Schirm steht
 * (wie bei einem Menschen), sonst verfälschte das Terminal die Probe „nichts angezeigt“.
 */

const ALT = 'altes-passwort-1234';
const NEU = 'Neues-Passwort-fuer-den-Test-42';
$fehler = 0;
$faelle = 0;

function pruef(string $name, bool $ok, string $mehr = ''): void {
    global $fehler, $faelle;
    $faelle++;
    if (!$ok) {
        $fehler++;
    }
    echo ($ok ? '  ok   ' : '  ROT  ') . $name . ($ok || $mehr === '' ? '' : ' :: ' . $mehr) . "\n";
}

/** Legt eine Kopie der API mit Datenbank an; $admins = Liste von Benutzernamen. */
function instanz(array $admins, bool $mitDatenbank = true): string {
    $ziel = sys_get_temp_dir() . '/apc_' . bin2hex(random_bytes(6));
    mkdir($ziel . '/data', 0755, true);
    foreach (['admin-passwort-setzen.php', 'config.php', 'db.php'] as $datei) {
        copy(__DIR__ . '/../../public/api/' . $datei, $ziel . '/' . $datei);
    }
    if ($mitDatenbank) {
        $db = new PDO('sqlite:' . $ziel . '/data/database.sqlite');
        $db->exec('CREATE TABLE admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, display_name TEXT, created_at TEXT, updated_at TEXT)');
        $stmt = $db->prepare('INSERT INTO admin_users (username, password_hash, display_name) VALUES (?, ?, ?)');
        foreach ($admins as $name) {
            $stmt->execute([$name, password_hash(ALT, PASSWORD_BCRYPT), $name]);
        }
    }
    return $ziel;
}

function hashes(string $ziel): array {
    $db = new PDO('sqlite:' . $ziel . '/data/database.sqlite');
    return $db->query('SELECT username, password_hash FROM admin_users ORDER BY id')->fetchAll(PDO::FETCH_KEY_PAIR);
}

/**
 * Startet das Werkzeug im Pseudo-Terminal. $schritte: Liste aus [Frage-Ausschnitt, Eingabe].
 * Gibt [Exit-Code, gesamte Bildschirmausgabe] zurück.
 */
function lauf(string $ziel, array $schritte): array {
    $befehl = 'script -qec ' . escapeshellarg('php ' . escapeshellarg($ziel . '/admin-passwort-setzen.php')) . ' /dev/null';
    $prozess = proc_open($befehl, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohre);
    stream_set_blocking($rohre[1], false);
    $ausgabe = '';
    $lies = static function (float $sekunden) use (&$ausgabe, $rohre): void {
        $ende = microtime(true) + $sekunden;
        while (microtime(true) < $ende) {
            $stueck = fread($rohre[1], 8192);
            if ($stueck !== false && $stueck !== '') {
                $ausgabe .= $stueck;
            } else {
                usleep(20000);
            }
        }
    };
    foreach ($schritte as [$frage, $eingabe]) {
        $frist = microtime(true) + 15;
        while (!str_contains($ausgabe, $frage) && microtime(true) < $frist) {
            $lies(0.05);
            if (!proc_get_status($prozess)['running']) {
                break;
            }
        }
        if (!str_contains($ausgabe, $frage)) {
            break;
        }
        usleep(300000); // dem Werkzeug Zeit geben, die Anzeige abzuschalten
        fwrite($rohre[0], $eingabe . "\n");
        fflush($rohre[0]);
    }
    $frist = microtime(true) + 15;
    while (proc_get_status($prozess)['running'] && microtime(true) < $frist) {
        $lies(0.05);
    }
    $lies(0.2);
    fclose($rohre[0]);
    $status = proc_get_status($prozess);
    $code = $status['running'] ? -1 : $status['exitcode'];
    proc_close($prozess);
    return [$code, $ausgabe];
}

const FRAGE1 = 'wird nicht angezeigt): ';
const FRAGE2 = 'wiederholen: ';

echo "Fall 1: ein Admin, richtiger Ablauf\n";
$z = instanz(['chef']);
[$code, $aus] = lauf($z, [[FRAGE1, NEU], [FRAGE2, NEU]]);
$h = hashes($z);
pruef('Ende 0', $code === 0, "Code $code");
pruef('neues Passwort gilt', password_verify(NEU, $h['chef']));
pruef('altes Passwort gilt nicht mehr', !password_verify(ALT, $h['chef']));
pruef('Benutzername wird gezeigt', str_contains($aus, 'Benutzername: chef'));
pruef('Passwort steht nicht auf dem Schirm', !str_contains($aus, NEU), 'Ausgabe enthält das Passwort');
pruef('kein Benutzer dazugekommen', count($h) === 1);
$dateien = array_diff(scandir($z . '/data'), ['.', '..']);
$sauber = true;
foreach ($dateien as $datei) {
    if (!str_starts_with($datei, 'database.sqlite')) {
        $sauber = false;
    }
}
pruef('keine weitere Datei unter data/', $sauber, implode(',', $dateien));

echo "Fall 2: Eingaben verschieden\n";
$z = instanz(['chef']);
[$code, $aus] = lauf($z, [[FRAGE1, NEU], [FRAGE2, NEU . 'x']]);
pruef('Ende ungleich 0', $code !== 0, "Code $code");
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));
pruef('Meldung nennt den Grund', str_contains($aus, 'verschieden'));

echo "Fall 3: zu kurz (11 Byte) und zu lang (73 Byte)\n";
foreach ([str_repeat('a', 11), str_repeat('a', 73)] as $pw) {
    $z = instanz(['chef']);
    [$code] = lauf($z, [[FRAGE1, $pw], [FRAGE2, $pw]]);
    pruef(strlen($pw) . ' Byte: abgewiesen, Hash unverändert', $code !== 0 && password_verify(ALT, hashes($z)['chef']), "Code $code");
}
foreach ([str_repeat('a', 12), str_repeat('a', 72)] as $pw) {
    $z = instanz(['chef']);
    [$code] = lauf($z, [[FRAGE1, $pw], [FRAGE2, $pw]]);
    pruef(strlen($pw) . ' Byte: angenommen', $code === 0 && password_verify($pw, hashes($z)['chef']), "Code $code");
}

echo "Fall 4: zwei Admins\n";
$z = instanz(['chef', 'zweiter']);
[$code, $aus] = lauf($z, [['Benutzernamen? ', 'zweiter'], [FRAGE1, NEU], [FRAGE2, NEU]]);
$h = hashes($z);
pruef('Ende 0', $code === 0, "Code $code");
pruef('nur der gewählte geändert', password_verify(NEU, $h['zweiter']) && password_verify(ALT, $h['chef']));
pruef('beide Namen werden gezeigt', str_contains($aus, '  chef') && str_contains($aus, '  zweiter'));
$z = instanz(['chef', 'zweiter']);
[$code] = lauf($z, [['Benutzernamen? ', 'gibtesnicht']]);
$h = hashes($z);
pruef('unbekannter Name: abgewiesen, nichts geändert', $code !== 0 && password_verify(ALT, $h['chef']) && password_verify(ALT, $h['zweiter']), "Code $code");

echo "Fall 5: kein Admin, keine Datenbank\n";
$z = instanz([]);
[$code] = lauf($z, []);
pruef('kein Admin: abgewiesen, keiner angelegt', $code !== 0 && count(hashes($z)) === 0, "Code $code");
$z = instanz([], false);
[$code] = lauf($z, []);
pruef('keine Datenbank: abgewiesen, keine angelegt', $code !== 0 && !file_exists($z . '/data/database.sqlite'), "Code $code");

echo "Fall 6: ohne Terminal\n";
$z = instanz(['chef']);
$ausgabe = [];
exec('printf %s ' . escapeshellarg(NEU . "\n" . NEU . "\n") . ' | php ' . escapeshellarg($z . '/admin-passwort-setzen.php') . ' 2>&1', $ausgabe, $code);
pruef('abgewiesen, Hash unverändert', $code !== 0 && password_verify(ALT, hashes($z)['chef']), "Code $code");
pruef('Meldung nennt das Terminal', str_contains(implode("\n", $ausgabe), 'Terminal'));

echo "Fall 7: Aufruf über das Netz\n";
$z = instanz(['chef']);
$port = 18000 + random_int(0, 900);
$server = proc_open('php -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($z), [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $r);
usleep(700000);
$kontext = stream_context_create(['http' => ['ignore_errors' => true, 'method' => 'POST', 'content' => 'x=1', 'timeout' => 5]]);
$antwort = @file_get_contents('http://127.0.0.1:' . $port . '/admin-passwort-setzen.php', false, $kontext);
$kopf = $http_response_header[0] ?? '';
proc_terminate($server);
pruef('Antwort 404', str_contains($kopf, '404'), $kopf);
pruef('leerer Antwortkörper', $antwort === '', (string) $antwort);
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));

echo "\n" . ($faelle - $fehler) . ' von ' . $faelle . " Prüfungen bestanden\n";
exit($fehler === 0 ? 0 : 1);
