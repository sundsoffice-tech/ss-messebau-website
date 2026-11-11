<?php
/**
 * Fälle zur Antwortzeit bei unbekanntem Benutzernamen (eingebunden von ops/tests/anmeldung_test.php).
 * Die Anmeldung rechnet auch dann einmal bcrypt (gegen einen festen Platzhalter-Hash), damit die
 * Antwortzeit nicht verrät, ob es den Namen gibt.
 *
 * Gemessen wird an einer Instanz, in der die zufällige Pause nach einem Fehlversuch (100 bis 300 ms)
 * abgeschaltet ist; sie überdeckte sonst den Unterschied, um den es geht. Der Admin dieser Instanz
 * hat einen Hash mit den üblichen Kosten (nicht den schnellen der übrigen Fälle).
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

/** Median der Antwortzeit (ms) über $n Fehlversuche, jeder von eigener Adresse. */
function zeitMedian(array $u, string $name, int $n): float {
    $zeiten = [];
    for ($i = 0; $i < $n; $i++) {
        $start = microtime(true);
        $a = anmelden($u, $name, 'falsch-falsch');
        $zeiten[] = (microtime(true) - $start) * 1000;
        if ($a['status'] !== 401) {
            return -1.0;
        }
    }
    sort($zeiten);
    return $zeiten[intdiv($n, 2)];
}

echo "\n== Fall P1: Antwortzeit bei unbekanntem Benutzernamen ==\n";
$quelltext = (string)file_get_contents($apiQuelle . '/auth.php');
preg_match("/const ANMELDUNG_PLATZHALTER_HASH = '([^']+)';/", $quelltext, $m);
$platzhalter = $m[1] ?? '';
$info = password_get_info($platzhalter);
preg_match('/const BCRYPT_KOSTEN = (\d+);/', $quelltext, $k);
$kosten = isset($k[1]) ? (int)$k[1] : -1;
pruefe('der Platzhalter ist ein bcrypt-Hash mit den Kosten BCRYPT_KOSTEN aus auth.php',
    ($info['algo'] ?? null) === '2y' && ($info['options']['cost'] ?? null) === $kosten && $kosten >= 10,
    json_encode($info) . ' / BCRYPT_KOSTEN ' . $kosten);
// Jede Stelle, die Hashes erzeugt, nennt die Kosten ausdrücklich, und es sind dieselben.
$werkzeug = (string)file_get_contents($apiQuelle . '/admin-passwort-setzen.php');
preg_match_all('/password_hash\([^;]*\);/', $quelltext . "\n" . $werkzeug, $aufrufe);
$ohneKosten = array_values(array_filter($aufrufe[0], fn($a) => strpos($a, "'cost' =>") === false));
pruefe('jeder password_hash()-Aufruf in auth.php und admin-passwort-setzen.php nennt die Kosten',
    count($aufrufe[0]) >= 3 && $ohneKosten === [], json_encode($ohneKosten, JSON_UNESCAPED_UNICODE));
// In auth.php nicht irgendeine Zahl, sondern die Konstante (eine 12 bei der Ersteinrichtung fiele sonst nicht auf).
preg_match_all('/password_hash\([^;]*\);/', $quelltext, $aufrufeAuth);
$ohneKonstante = array_values(array_filter($aufrufeAuth[0], fn($a) => strpos($a, "['cost' => BCRYPT_KOSTEN]") === false));
pruefe('jeder password_hash()-Aufruf in auth.php rechnet mit BCRYPT_KOSTEN',
    count($aufrufeAuth[0]) >= 2 && $ohneKonstante === [], json_encode($ohneKonstante, JSON_UNESCAPED_UNICODE));
pruefe('das Werkzeug der Kommandozeile erzeugt Hashes mit denselben Kosten wie auth.php',
    preg_match("/password_hash\(\\\$passwort, PASSWORD_BCRYPT, \['cost' => (\d+)\]\)/", $werkzeug, $w) === 1 && (int)$w[1] === $kosten,
    'Werkzeug ' . ($w[1] ?? 'ohne Angabe') . ', auth.php ' . $kosten);

$u = starte($apiQuelle, ['chef'], 1, ['auth.php' => ['usleep(random_int(100000, 300000));' => '']]);
pruefe('Vorbedingung: die zufällige Pause steht im Prüfling und ist in dieser Instanz abgeschaltet',
    substr_count($quelltext, 'usleep(random_int(100000, 300000));') === 1
    && strpos((string)file_get_contents($u['api'] . '/auth.php'), 'usleep(') === false);
$stmt = db($u)->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?');
$stmt->execute([password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten]), 'chef']);
$bekannt = zeitMedian($u, 'chef', 9);
$unbekannt = zeitMedian($u, 'gibt-es-nicht', 9);
echo sprintf("INFO   Median der Antwortzeit: bekannter Name %.1f ms, unbekannter Name %.1f ms\n", $bekannt, $unbekannt);
pruefe('unbekannter Benutzername antwortet etwa so langsam wie ein bekannter mit falschem Passwort (Median zwischen der Hälfte und dem Doppelten)',
    $bekannt > 0 && $unbekannt >= 0.5 * $bekannt && $unbekannt <= 2.0 * $bekannt, sprintf('%.1f ms gegen %.1f ms', $unbekannt, $bekannt));
pruefe('Vorbedingung der Messung: bcrypt mit üblichen Kosten ist messbar (bekannter Name über 15 ms)', $bekannt > 15, sprintf('%.1f ms', $bekannt));
$a = anmelden($u, 'gibt-es-nicht', ALT);
pruefe('unbekannter Benutzername mit dem Passwort eines Admins: 401', $a['status'] === 401, kurz($a));
$a = anmelden($u, 'chef', ALT);
pruefe('bekannter Name mit richtigem Passwort: 200', $a['status'] === 200, kurz($a));

echo "\n== Fall P2: gespeicherter Hash mit anderen Kosten wird bei der Anmeldung neu berechnet ==\n";
$hashLesen = function () use ($u): string {
    $s = db($u)->prepare('SELECT password_hash FROM admin_users WHERE username = ?');
    $s->execute(['chef']);
    return (string)$s->fetchColumn();
};
$stmt->execute([password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten + 1]), 'chef']);
$vorher = $hashLesen();
$a = anmelden($u, 'chef', 'falsch-falsch');
pruefe('falsches Passwort: 401 und der Hash bleibt unverändert', $a['status'] === 401 && $hashLesen() === $vorher, kurz($a));
$a = anmelden($u, 'chef', ALT);
$nachher = $hashLesen();
pruefe('richtiges Passwort bei höheren Kosten: 200', $a['status'] === 200, kurz($a));
pruefe('danach trägt der gespeicherte Hash die Kosten BCRYPT_KOSTEN und passt zum Passwort',
    $nachher !== $vorher && (password_get_info($nachher)['options']['cost'] ?? null) === $kosten && password_verify(ALT, $nachher),
    json_encode(password_get_info($nachher)));
$a = anmelden($u, 'chef', ALT);
pruefe('Anmeldung mit passenden Kosten: 200 und der Hash bleibt unverändert', $a['status'] === 200 && $hashLesen() === $nachher, kurz($a));
$stmt->execute([password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten - 1]), 'chef']);
$a = anmelden($u, 'chef', ALT);
pruefe('auch geringere Kosten werden auf BCRYPT_KOSTEN angehoben',
    $a['status'] === 200 && (password_get_info($hashLesen())['options']['cost'] ?? null) === $kosten, kurz($a));

/** Gilt die Sitzung aus dieser Anmeldung beim nächsten Aufruf? null, wenn me nicht mit 200 antwortet. */
$sitzungGilt = function (array $instanz, array $anmeldung): ?bool {
    if ($anmeldung['cookie'] === null) {
        return null;
    }
    $me = anfrage($instanz, 'GET', '/auth.php?action=me', null, ['Cookie: ' . $anmeldung['cookie']]);
    return $me['status'] === 200 ? ($me['json']['authenticated'] ?? null) : null;
};

echo "\n== Fall P3: die Anmeldung, die neu berechnet, bleibt angemeldet ==\n";
// Nur andere Geräte enden einmalig; die Sitzung dieser Anmeldung trägt die Marke des neuen Hashs.
$stmt->execute([password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten + 1]), 'chef']);
$a = anmelden($u, 'chef', ALT);
pruefe('Sitzung der Anmeldung mit Neuberechnung gilt beim nächsten Aufruf',
    $a['status'] === 200 && $sitzungGilt($u, $a) === true
    && (password_get_info($hashLesen())['options']['cost'] ?? null) === $kosten, kurz($a));

echo "\n== Fall P4: ein gleichzeitiger Passworttausch bleibt stehen ==\n";
// Zwischen dem Lesen des alten Hashs und dem Schreiben des neuen tauscht jemand das Passwort (Werkzeug der
// Kommandozeile). Der Prüfling bekommt dafür genau an dieser Stelle einen Tausch eingesetzt. Das Schreiben
// der Neuberechnung darf den neuen Hash nicht überschreiben, sonst gälte das alte Passwort wieder.
$hashNeu = password_hash(NEU, PASSWORD_BCRYPT, ['cost' => $kosten]);
$anker = '$neu = getDB()->prepare("UPDATE admin_users SET password_hash = :hash';
$tausch = 'getDB()->exec(' . var_export("UPDATE admin_users SET password_hash = '" . $hashNeu . "'", true) . '); ';
$w = starte($apiQuelle, ['chef'], 1, ['auth.php' => [$anker => $tausch . $anker]]);
pruefe('Vorbedingung: der Tausch steht genau einmal vor dem Schreiben der Neuberechnung',
    substr_count($quelltext, $anker) === 1
    && substr_count((string)file_get_contents($w['api'] . '/auth.php'), $tausch . $anker) === 1);
db($w)->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?')
    ->execute([password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten + 1]), 'chef']);
$a = anmelden($w, 'chef', ALT);
$gespeichert = hashVon($w, 'chef');
pruefe('gleichzeitiger Passworttausch: der neue Hash bleibt stehen, das alte Passwort gilt nicht mehr',
    $gespeichert === $hashNeu && password_verify(NEU, $gespeichert) && !password_verify(ALT, $gespeichert), kurz($a));
pruefe('gleichzeitiger Passworttausch: die Sitzung der Anmeldung mit dem alten Passwort gilt nicht',
    $a['status'] === 200 && $sitzungGilt($w, $a) === false, kurz($a));

echo "\n== Fall P5: scheitert das Schreiben der Neuberechnung, gilt die Anmeldung trotzdem ==\n";
$ankerSchreiben = 'UPDATE admin_users SET password_hash = :hash';
$f = starte($apiQuelle, ['chef'], 1, ['auth.php' => [$ankerSchreiben => 'UPDATE gibt_es_nicht SET password_hash = :hash']]);
pruefe('Vorbedingung: das Schreiben der Neuberechnung zielt in dieser Instanz auf eine fehlende Tabelle',
    substr_count($quelltext, $ankerSchreiben) === 1
    && substr_count((string)file_get_contents($f['api'] . '/auth.php'), 'UPDATE gibt_es_nicht') === 1);
$hashAlt = password_hash(ALT, PASSWORD_BCRYPT, ['cost' => $kosten + 1]);
db($f)->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?')->execute([$hashAlt, 'chef']);
$a = anmelden($f, 'chef', ALT);
pruefe('Schreibfehler bei der Neuberechnung: Anmeldung 200, Hash unverändert, Sitzung gilt',
    $a['status'] === 200 && hashVon($f, 'chef') === $hashAlt && $sitzungGilt($f, $a) === true, kurz($a));
