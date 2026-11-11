<?php
/**
 * Fälle zur Anmeldung bei nicht lesbarer Datenbank (eingebunden von ops/tests/anmeldung_test.php).
 * Die Prüfung des Passworts fällt dann aus: Die Anmeldung antwortet mit 503 und festem Text,
 * der Versuch wird nicht gezählt, und die Zähldatei ist danach nicht mehr gesperrt.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

echo "\n== Fall D1: Datenbank bei der Anmeldung nicht lesbar ==\n";
$u = starte($apiQuelle);
$jetzt = time();
file_put_contents(bremsdatei($u, '127.0.9.51'), ($jetzt - 60) . "\n" . ($jetzt - 50) . "\n" . ($jetzt - 40) . "\n" . ($jetzt - 30) . "\n");
$vier = md5_file(bremsdatei($u, '127.0.9.51'));

// Datenbank beiseitelegen und durch eine Datei ersetzen, die keine Datenbank ist.
$dbDateien = glob($u['daten'] . '/database.sqlite*') ?: [];
foreach ($dbDateien as $dbDatei) {
    rename($dbDatei, $dbDatei . '.beiseite');
}
file_put_contents($u['daten'] . '/database.sqlite', str_repeat("keine Datenbank\n", 400));

$antworten = [];
foreach (['falsch-1', 'falsch-2', 'falsch-3', 'falsch-4', 'falsch-5', 'falsch-6', ALT] as $passwort) {
    $antworten[] = anmelden($u, 'chef', $passwort, '127.0.9.50');
}
$fest = array_filter($antworten, fn($a) => $a['status'] === 503 && trim($a['text']) === TEXT_BREMSE_503);
pruefe('Datenbank nicht lesbar: sieben Anmeldungen einer Adresse (sechs falsche, ein richtiges Passwort) je 503 mit festem Text, ohne Fehlertext',
    count($fest) === 7, implode(' | ', array_map('kurz', array_slice($antworten, 0, 2))));
pruefe('Datenbank nicht lesbar: kein Versuch gezählt (Zähldatei ohne Stempel)',
    stempelZahl(bremsdatei($u, '127.0.9.50')) === 0, (string)stempelZahl(bremsdatei($u, '127.0.9.50')));
$fp = fopen(bremsdatei($u, '127.0.9.50'), 'c+');
$frei = flock($fp, LOCK_EX | LOCK_NB);
flock($fp, LOCK_UN);
fclose($fp);
pruefe('Datenbank nicht lesbar: die Zähldatei ist nach der Antwort nicht mehr gesperrt', $frei === true);
$me = anfrage($u, 'GET', '/auth.php?action=me', null, ['Cookie: ' . $antworten[6]['cookie']]);
pruefe('Datenbank nicht lesbar: die Sitzung zum richtigen Passwort ist nicht angemeldet',
    ($me['json']['authenticated'] ?? null) !== true, kurz($me));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.51');
pruefe('Datenbank nicht lesbar, Zähler mit vier Stempeln: 503, der Bestand ist unverändert (der Stempel des Versuchs ist zurückgenommen)',
    $a['status'] === 503 && md5_file(bremsdatei($u, '127.0.9.51')) === $vier, kurz($a) . ' / ' . stempelZahl(bremsdatei($u, '127.0.9.51')));
$zeilen = is_file($u['wurzel'] . '/php-fehler.log') ? file($u['wurzel'] . '/php-fehler.log', FILE_IGNORE_NEW_LINES) : [];
$passend = preg_grep('/Anmeldung nicht prüfbar: [A-Za-z\\\\]+\z/', $zeilen);
pruefe('Datenbank nicht lesbar: je Anmeldung eine Protokollzeile nur mit der Art des Fehlers, sonst keine Zeile',
    count($passend) === 8 && count($zeilen) === 8, count($passend) . ' von ' . count($zeilen) . ': ' . substr(implode(' | ', array_slice($zeilen, 0, 2)), 0, 200));

// Datenbank zurücklegen.
unlink($u['daten'] . '/database.sqlite');
foreach ($dbDateien as $dbDatei) {
    rename($dbDatei . '.beiseite', $dbDatei);
}
$codes = folge($u, '127.0.9.50', array_fill(0, 6, 'falsch-falsch'));
pruefe('Datenbank wieder lesbar: die Adresse hat ihre fünf Versuche noch (fünfmal 401, dann 429)',
    $codes === [401, 401, 401, 401, 401, 429], implode(',', $codes));
$codes = folge($u, '127.0.9.51', ['falsch-falsch', 'falsch-falsch']);
pruefe('Datenbank wieder lesbar: die vier Stempel von vorher zählen weiter (ein Fehlversuch 401, dann 429)',
    $codes === [401, 429], implode(',', $codes));
$a = anmelden($u, 'chef', ALT, '127.0.9.52');
pruefe('Datenbank wieder lesbar: Anmeldung mit richtigem Passwort 200', $a['status'] === 200, kurz($a));
