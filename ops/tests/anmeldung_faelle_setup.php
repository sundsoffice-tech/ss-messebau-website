<?php
/**
 * Fälle zur Ersteinrichtung (eingebunden von ops/tests/anmeldung_test.php; Helfer und Zähler stehen dort).
 * Im ausgelieferten Stand ist die Aktion setup gesperrt (Schalter SETUP_ERLAUBT in auth.php), damit eine
 * verlorene und leer neu angelegte Datenbank nicht den ersten Aufrufer aus dem Netz zum Admin macht.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

const SETUP_OFFEN = ['auth.php' => ['const SETUP_ERLAUBT = false;' => 'const SETUP_ERLAUBT = true;']];

function einrichten(array $u, string $name = 'fremder'): array {
    return anfrage($u, 'POST', '/auth.php?action=setup', json_encode(['username' => $name, 'password' => NEU]));
}

function adminZahl(array $u): int {
    return (int)db($u)->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
}

function brauchtSetup(array $u): ?bool {
    $a = anfrage($u, 'GET', '/auth.php?action=check_setup');
    return $a['status'] === 200 ? ($a['json']['needsSetup'] ?? null) : null;
}

// ─── Fall E1: ausgelieferter Stand, Tabelle leer ─────────────────────────────
echo "\n== Fall E1: gesperrt, kein Admin vorhanden ==\n";
$quelltext = (string)file_get_contents($apiQuelle . '/auth.php');
pruefe('ausgelieferter Stand: Schalter steht auf gesperrt (genau eine Zeile "const SETUP_ERLAUBT = false;")',
    substr_count($quelltext, 'const SETUP_ERLAUBT = false;') === 1 && strpos($quelltext, 'SETUP_ERLAUBT = true') === false);
$u = starte($apiQuelle, []);
pruefe('gesperrt und Tabelle leer: check_setup meldet needsSetup false', brauchtSetup($u) === false);
$a = einrichten($u);
pruefe('gesperrt und Tabelle leer: setup 403, kein Admin angelegt', $a['status'] === 403 && adminZahl($u) === 0, kurz($a));
$me = anfrage($u, 'GET', '/auth.php?action=me', null, ['Cookie: ' . $a['cookie']]);
pruefe('gesperrt: die Sitzung des Aufrufers ist nicht angemeldet', ($me['json']['authenticated'] ?? null) === false, kurz($me));

// ─── Fall E2: Datenbankdatei verloren ────────────────────────────────────────
echo "\n== Fall E2: Datenbank fehlt und wird leer neu angelegt ==\n";
$u = starte($apiQuelle, ['chef']);
foreach (glob($u['daten'] . '/database.sqlite*') as $datei) {
    unlink($datei);
}
$a = einrichten($u);
pruefe('Datenbank fehlt: setup 403 statt eines neuen Admins', $a['status'] === 403, kurz($a));
anfrage($u, 'GET', '/analytics-config.php'); // irgendein Aufruf, der die Datenbank öffnet, legt sie leer neu an
pruefe('Datenbank leer neu angelegt: check_setup meldet needsSetup false, setup weiter 403, Tabelle bleibt leer',
    is_file($u['daten'] . '/database.sqlite') && brauchtSetup($u) === false && einrichten($u)['status'] === 403 && adminZahl($u) === 0);
$a = anmelden($u, 'fremder', NEU);
pruefe('Datenbank leer neu angelegt: Anmeldung mit den Daten des Aufrufers 401', $a['status'] === 401, kurz($a));

// ─── Fall E3: gesperrt, Admin vorhanden ──────────────────────────────────────
echo "\n== Fall E3: gesperrt, Admin vorhanden ==\n";
$u = starte($apiQuelle, ['chef']);
$a = einrichten($u);
pruefe('gesperrt mit vorhandenem Admin: setup 403, check_setup false, weiter genau ein Admin, Anmeldung wie bisher 200',
    $a['status'] === 403 && brauchtSetup($u) === false && adminZahl($u) === 1 && anmelden($u, 'chef', ALT)['status'] === 200, kurz($a));

// ─── Fall E4: Schalter offen (bewusst geöffnete Neuinstallation) ─────────────
echo "\n== Fall E4: Schalter offen ==\n";
$u = starte($apiQuelle, [], 1, SETUP_OFFEN);
pruefe('offen und Tabelle leer: check_setup meldet needsSetup true', brauchtSetup($u) === true);
$a = anfrage($u, 'GET', '/auth.php?action=setup');
pruefe('offen: setup per GET 405', $a['status'] === 405, kurz($a));
$a = anfrage($u, 'POST', '/auth.php?action=setup', json_encode(['username' => 'erster', 'password' => 'kurz']));
pruefe('offen: Passwort unter 8 Zeichen 400, nichts angelegt', $a['status'] === 400 && adminZahl($u) === 0, kurz($a));
$a = einrichten($u, 'erster');
pruefe('offen und Tabelle leer: setup 200, genau ein Admin', $a['status'] === 200 && adminZahl($u) === 1, kurz($a));
$b = einrichten($u, 'zweiter');
pruefe('offen, zweite Einrichtung: 403, weiter genau ein Admin, check_setup false',
    $b['status'] === 403 && adminZahl($u) === 1 && brauchtSetup($u) === false, kurz($b));
