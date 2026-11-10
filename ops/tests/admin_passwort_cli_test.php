<?php
/**
 * Test für das Werkzeug „Admin-Passwort neu setzen auf der Kommandozeile“:
 * public/api/admin-passwort-setzen.sh (Einstieg) und admin-passwort-setzen.php.
 *
 * Aufruf im Container php:8.3-cli ohne Netz, Arbeitsverzeichnis Repo-Wurzel:
 *   php ops/tests/admin_passwort_cli_test.php
 *
 * Jeder Fall bekommt eine eigene Kopie der Dateien mit eigener Datenbank. Der Einstieg
 * wird über `script` in einem Pseudo-Terminal gestartet, weil er ohne Terminal abbricht;
 * Eingaben gehen erst hinaus, wenn die Frage auf dem Schirm steht (wie bei einem
 * Menschen), sonst verfälschte das Terminal die Probe „nichts angezeigt“.
 */

const ALT = 'altes-passwort-1234';
const NEU = 'Neues-Passwort-fuer-den-Test-42';
const FRAGE1 = 'wird nicht angezeigt): ';
const FRAGE2 = 'wiederholen: ';
const GESPERRT = 'shell_exec,exec,system,passthru,proc_open,popen';
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

/** Legt eine Kopie der Dateien mit Datenbank an; $admins = Liste von Benutzernamen. */
function instanz(array $admins, bool $mitDatenbank = true): string {
    $ziel = sys_get_temp_dir() . '/apc_' . bin2hex(random_bytes(6));
    mkdir($ziel . '/data', 0755, true);
    foreach (['admin-passwort-setzen.sh', 'admin-passwort-setzen.php', 'config.php', 'db.php'] as $datei) {
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

/** Ein Ordner mit einem Programm namens php, das vor das echte gestellt wird. */
function ersatz(string $name, string $inhalt): string {
    $ordner = sys_get_temp_dir() . '/ersatz_' . bin2hex(random_bytes(6));
    mkdir($ordner, 0755, true);
    file_put_contents($ordner . '/' . $name, "#!/bin/bash\n" . $inhalt . "\n");
    chmod($ordner . '/' . $name, 0755);
    return $ordner;
}

function ersatzPhp(string $inhalt): string {
    return ersatz('php', $inhalt);
}

/**
 * Startet einen Befehl im Pseudo-Terminal. $schritte: Liste aus [Frage-Ausschnitt, Eingabe].
 * Gibt [Exit-Code, gesamte Bildschirmausgabe] zurück.
 */
function terminal(string $befehl, array $schritte): array {
    $prozess = proc_open('script -qec ' . escapeshellarg($befehl) . ' /dev/null', [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohre);
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
        usleep(300000);
        fwrite($rohre[0], $eingabe);
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
    if ($status['running']) {
        proc_terminate($prozess, 9);
    }
    proc_close($prozess);
    return [$code, $ausgabe];
}

/** Der Einstieg, wie der Inhaber ihn startet; $pfadVorn stellt ein anderes php davor. */
function lauf(string $ziel, array $schritte, string $pfadVorn = ''): array {
    $befehl = ($pfadVorn === '' ? '' : 'PATH=' . escapeshellarg($pfadVorn) . ':$PATH ') . 'bash ' . escapeshellarg($ziel . '/admin-passwort-setzen.sh');
    $mitZeilenende = array_map(static fn (array $s): array => [$s[0], $s[1] . "\n"], $schritte);
    return terminal($befehl, $mitZeilenende);
}

echo "Fall 1: ein Admin, richtiger Ablauf\n";
$z = instanz(['chef']);
[$code, $aus] = lauf($z, [[FRAGE1, NEU], [FRAGE2, NEU]]);
$h = hashes($z);
pruef('Ende 0', $code === 0, "Code $code");
pruef('neues Passwort gilt', password_verify(NEU, $h['chef']));
pruef('altes Passwort gilt nicht mehr', !password_verify(ALT, $h['chef']));
pruef('Benutzername wird gezeigt', str_contains($aus, 'Benutzername: chef'));
pruef('Passwort steht nicht auf dem Schirm', !str_contains($aus, NEU), 'Ausgabe enthält das Passwort');
pruef('Erfolg wird gemeldet', str_contains($aus, 'Das Passwort ist gesetzt.'));
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
pruef('Ende 1', $code === 1, "Code $code");
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));
pruef('Meldung nennt den Grund', str_contains($aus, 'verschieden'));

echo "Fall 3: Länge\n";
foreach ([str_repeat('a', 11), str_repeat('a', 73)] as $pw) {
    $z = instanz(['chef']);
    [$code] = lauf($z, [[FRAGE1, $pw], [FRAGE2, $pw]]);
    pruef(strlen($pw) . ' Byte: Ende 1, Hash unverändert', $code === 1 && password_verify(ALT, hashes($z)['chef']), "Code $code");
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
[$code, $aus] = lauf($z, [['Benutzernamen? ', 'gibtesnicht'], [FRAGE1, NEU], [FRAGE2, NEU]]);
$h = hashes($z);
pruef('unbekannter Name: Ende 1 mit Meldung, nichts geändert', $code === 1 && str_contains($aus, 'gibt es nicht') && password_verify(ALT, $h['chef']) && password_verify(ALT, $h['zweiter']), "Code $code");

echo "Fall 5: kein Admin, keine Datenbank\n";
$z = instanz([]);
[$code, $aus] = lauf($z, []);
pruef('kein Admin: Ende 1 mit Meldung, keiner angelegt', $code === 1 && str_contains($aus, 'keinen Admin-Benutzer') && count(hashes($z)) === 0, "Code $code");
$z = instanz([], false);
[$code, $aus] = lauf($z, []);
pruef('keine Datenbank: Ende 1 mit Meldung, keine angelegt', $code === 1 && str_contains($aus, 'nicht gefunden') && !file_exists($z . '/data/database.sqlite'), "Code $code");

echo "Fall 6: ohne Terminal\n";
$z = instanz(['chef']);
$ausgabe = [];
exec('printf %s ' . escapeshellarg(NEU . "\n" . NEU . "\n") . ' | bash ' . escapeshellarg($z . '/admin-passwort-setzen.sh') . ' 2>&1', $ausgabe, $code);
pruef('Einstieg: Ende 1, Hash unverändert', $code === 1 && password_verify(ALT, hashes($z)['chef']), "Code $code");
pruef('Meldung nennt das Terminal', str_contains(implode("\n", $ausgabe), 'Terminal'));
$ausgabe = [];
exec('printf %s ' . escapeshellarg(NEU . "\n" . NEU . "\n") . ' | php ' . escapeshellarg($z . '/admin-passwort-setzen.php') . ' setzen chef 2>&1 | cat', $ausgabe, $code);
pruef('Werkzeug direkt, Ausgabe in ein Rohr: Hash unverändert', password_verify(ALT, hashes($z)['chef']) && str_contains(implode("\n", $ausgabe), 'Terminal'));
$ausgabe = [];
exec('php ' . escapeshellarg($z . '/admin-passwort-setzen.php') . ' 2>&1', $ausgabe, $code);
pruef('Werkzeug ohne Befehl: Ende 1, Verweis auf den Einstieg', $code === 1 && str_contains(implode("\n", $ausgabe), 'Einstieg'), "Code $code");

echo "Fall 7: Aufruf über das Netz\n";
$z = instanz(['chef']);
$port = 18000 + random_int(0, 900);
$server = proc_open('php -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($z), [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $r);
usleep(700000);
foreach (['', '?befehl=setzen', '/liste'] as $anhang) {
    $kontext = stream_context_create(['http' => ['ignore_errors' => true, 'method' => 'POST', 'content' => NEU . "\n" . NEU . "\n", 'timeout' => 5]]);
    $antwort = @file_get_contents('http://127.0.0.1:' . $port . '/admin-passwort-setzen.php' . $anhang, false, $kontext);
    $kopf = $http_response_header[0] ?? '';
    pruef('Antwort 404 mit leerem Körper (' . ($anhang === '' ? 'ohne Zusatz' : $anhang) . ')', str_contains($kopf, '404') && $antwort === '', $kopf);
}
proc_terminate($server);
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));

echo "Fall 8: Programmaufrufe in PHP gesperrt (wie auf geteiltem Hosting üblich)\n";
$z = instanz(['chef']);
$echt = trim((string) shell_exec('command -v php'));
$ersatz = ersatzPhp('exec ' . escapeshellarg($echt) . ' -d disable_functions=' . GESPERRT . ' "$@"');
[$code, $aus] = lauf($z, [[FRAGE1, NEU], [FRAGE2, NEU]], $ersatz);
pruef('Ablauf gelingt', $code === 0 && password_verify(NEU, hashes($z)['chef']), "Code $code");
pruef('Passwort steht nicht auf dem Schirm', !str_contains($aus, NEU));
$quelltext = file_get_contents(__DIR__ . '/../../public/api/admin-passwort-setzen.php');
pruef('das Werkzeug ruft selbst kein Programm auf', preg_match('/(?<!->)\b(shell_exec|exec|system|passthru|proc_open|popen)\s*\(/', $quelltext) === 0);

echo "Fall 9: Zeichen außerhalb der Tastatur-Grundzeichen\n";
foreach (['Umlaut' => 'Passwört-mit-Umlaut-123', 'Pfeiltaste' => "Passwort\x1b[A-mit-Pfeil-12", 'Tabulator' => "Passwort\tmit-Tabulator-1"] as $art => $pw) {
    $z = instanz(['chef']);
    [$code, $aus] = lauf($z, [[FRAGE1, $pw], [FRAGE2, $pw]]);
    pruef($art . ': Ende 1 mit Meldung, Hash unverändert', $code === 1 && str_contains($aus, 'nicht sicher übertragen') && password_verify(ALT, hashes($z)['chef']), "Code $code");
}
$z = instanz(['chef']);
$pw = 'Mit Leerzeichen & Zeichen !#%{}~ 12';
[$code] = lauf($z, [[FRAGE1, $pw], [FRAGE2, $pw]]);
pruef('Leerzeichen und Satzzeichen: angenommen', $code === 0 && password_verify($pw, hashes($z)['chef']), "Code $code");

echo "Fall 10: Voraussetzungen der Kommandozeile\n";
$proben = [
    'andere Fassung als die der Kommandozeile' => ['cgi-fcgi neu db', 'nicht die Fassung'],
    'zu altes PHP' => ['cli alt db', 'zu alt'],
    'ohne Datenbank-Erweiterung' => ['cli neu ohnedb', 'pdo_sqlite'],
];
foreach ($proben as $art => [$antwort, $wort]) {
    $z = instanz(['chef']);
    $ersatz = ersatzPhp('if [ "$1" = "-r" ]; then printf %s ' . escapeshellarg($antwort) . '; exit 0; fi; echo UNERWARTET; exit 0');
    [$code, $aus] = lauf($z, [], $ersatz);
    pruef($art . ': Ende 1 mit klarer Meldung, keine Abfrage', $code === 1 && str_contains($aus, $wort) && !str_contains($aus, 'UNERWARTET') && !str_contains($aus, 'Neues Passwort') && password_verify(ALT, hashes($z)['chef']), "Code $code");
}

echo "Fall 11: Abbruch mit Strg+C während der Eingabe\n";
$z = instanz(['chef']);
// Die äußere Shell fängt das Signal ab, damit sie danach noch den Zustand des Terminals zeigen kann.
$innen = 'trap : INT; bash ' . escapeshellarg($z . '/admin-passwort-setzen.sh') . '; echo CODE=$?; stty -a';
[$code, $aus] = terminal('bash -c ' . escapeshellarg($innen), [[FRAGE1, "halbes-passw\x03"]]);
$danach = strstr($aus, 'CODE=') ?: '';
pruef('Ende 130 mit Meldung', str_contains($danach, 'CODE=130') && str_contains($aus, 'Abgebrochen'), substr($danach, 0, 12));
pruef('Anzeige der Eingabe ist wieder an', preg_match('/(^|[\s;])echo([\s;]|$)/', $danach) === 1 && preg_match('/(^|[\s;])-echo([\s;]|$)/', $danach) === 0);
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));

echo "Fall 12: das Terminal lässt die Anzeige nicht abschalten\n";
$z = instanz(['chef']);
$echtesStty = trim((string) shell_exec('command -v stty'));
// Dieses stty tut beim Abschalten nichts und meldet trotzdem Erfolg.
$taub = ersatz('stty', 'for a in "$@"; do [ "$a" = "-echo" ] && exit 0; done; exec ' . escapeshellarg($echtesStty) . ' "$@"');
[$code, $aus] = lauf($z, [[FRAGE1, NEU], [FRAGE2, NEU]], $taub);
pruef('Ende 1 mit Meldung, Passwort wird nicht abgefragt', $code === 1 && str_contains($aus, 'nicht verdecken') && !str_contains($aus, 'Neues Passwort'), "Code $code");
pruef('Hash unverändert', password_verify(ALT, hashes($z)['chef']));

echo "\n" . ($faelle - $fehler) . ' von ' . $faelle . " Prüfungen bestanden\n";
exit($fehler === 0 ? 0 : 1);
