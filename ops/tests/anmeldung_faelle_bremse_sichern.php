<?php
/**
 * Fälle zum Sichern des Stempels auf den Datenträger (fsync) in der Anmeldebremse (eingebunden von
 * ops/tests/anmeldung_test.php). Ein gescheitertes fsync gilt wie ein gescheitertes Schreiben: kein
 * Stempel, keine Prüfung, 503.
 *
 * Ein echtes Scheitern von fsync lässt sich im Container nicht herstellen. Die Fälle spielen es in
 * der Kopie des Prüflings ein: Dort ist der Aufruf @fsync($fp) durch false ersetzt (Fall Y2) oder
 * der Name der Funktion so geändert, dass function_exists() sie nicht findet (Fall Y3, PHP vor 8.1).
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

echo "\n== Fall Y1: fsync vorhanden und gelingt ==\n";
$quelltext = (string)file_get_contents($apiQuelle . '/auth.php');
pruefe('der Prüfling ruft fsync() genau einmal auf, und die PHP-Fassung dieses Laufs kennt die Funktion',
    substr_count($quelltext, '@fsync($fp)') === 1 && substr_count($quelltext, "function_exists('fsync')") === 1 && function_exists('fsync'));
$u = starte($apiQuelle);
$codes = folge($u, '127.0.9.90', ['falsch-falsch', ALT]);
pruefe('fsync gelingt: Fehlversuch 401, richtiges Passwort 200', $codes === [401, 200], implode(',', $codes));

echo "\n== Fall Y2: fsync scheitert (eingespielt) ==\n";
$u = starte($apiQuelle, ['chef'], 1, ['auth.php' => ['@fsync($fp)' => 'false']]);
pruefe('Vorbedingung: in dieser Instanz ist der Aufruf durch false ersetzt',
    strpos((string)file_get_contents($u['api'] . '/auth.php'), '@fsync($fp)') === false);
file_put_contents(bremsdatei($u, '127.0.9.91'), (time() - 60) . "\n" . (time() - 50) . "\n");
$vorher = md5_file(bremsdatei($u, '127.0.9.91'));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.91');
$b = anmelden($u, 'chef', ALT, '127.0.9.91');
pruefe('fsync scheitert: falsches und richtiges Passwort je 503 mit festem Text',
    $a['status'] === 503 && $b['status'] === 503 && trim($a['text']) === TEXT_BREMSE_503, kurz($a) . ' / ' . kurz($b));
pruefe('fsync scheitert: der Stempel des Versuchs ist wieder abgeschnitten, der Bestand unverändert',
    md5_file(bremsdatei($u, '127.0.9.91')) === $vorher, (string)stempelZahl(bremsdatei($u, '127.0.9.91')));
$a = anmelden($u, 'chef', ALT, '127.0.9.92');
pruefe('fsync scheitert, leerer Zähler: richtiges Passwort 503, Datei bleibt leer',
    $a['status'] === 503 && groesse(bremsdatei($u, '127.0.9.92')) === 0, kurz($a) . ' / ' . groesse(bremsdatei($u, '127.0.9.92')));

echo "\n== Fall Y3: PHP ohne fsync (eingespielt) ==\n";
$u = starte($apiQuelle, ['chef'], 1, ['auth.php' => ["function_exists('fsync')" => "function_exists('fsync_gibt_es_hier_nicht')"]]);
pruefe('Vorbedingung: in dieser Instanz findet function_exists() die Funktion nicht',
    strpos((string)file_get_contents($u['api'] . '/auth.php'), "function_exists('fsync')") === false);
$codes = folge($u, '127.0.9.93', ['falsch-falsch', 'falsch-falsch', ALT]);
pruefe('PHP ohne fsync: die Anmeldung arbeitet wie bisher (zwei Fehlversuche 401 und gezählt, richtiges Passwort 200)',
    $codes === [401, 401, 200], implode(',', $codes));
