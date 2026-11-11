<?php
/**
 * Fälle zu Stempeln aus der Zukunft in der Zähldatei der Anmeldebremse (eingebunden von
 * ops/tests/anmeldung_test.php). Ein solcher Stempel entsteht, wenn die Uhr des Servers
 * zurückgestellt wird. Er zählt nur, solange er weniger als ein Fenster (900 s) entfernt ist.
 * Die Abstände in den Fällen lassen einige Sekunden Luft für die Laufzeit der Anfrage.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

/** Schreibt eine Zähldatei mit Stempeln im genannten Abstand zu jetzt (positiv: Zukunft). */
function stempelDatei(array $u, string $adresse, array $abstaende): void {
    $jetzt = time();
    file_put_contents(bremsdatei($u, $adresse), implode("\n", array_map(fn($a) => $jetzt + $a, $abstaende)) . "\n");
}

echo "\n== Fall F1: Stempel aus der Zukunft ==\n";
$u = starte($apiQuelle);
stempelDatei($u, '127.0.9.80', array_fill(0, 5, 3600));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.80');
pruefe('fünf Stempel 3600 s voraus sperren nicht: Fehlversuch 401 statt 429', $a['status'] === 401, kurz($a));
pruefe('danach steht nur der Stempel dieses Versuchs in der Datei (die fernen sind weg)',
    stempelZahl(bremsdatei($u, '127.0.9.80')) === 1 && groesse(bremsdatei($u, '127.0.9.80')) === 11,
    stempelZahl(bremsdatei($u, '127.0.9.80')) . ' / ' . groesse(bremsdatei($u, '127.0.9.80')));
stempelDatei($u, '127.0.9.81', array_fill(0, 5, 3600));
$a = anmelden($u, 'chef', ALT, '127.0.9.81');
pruefe('fünf Stempel 3600 s voraus: richtiges Passwort 200', $a['status'] === 200, kurz($a));
stempelDatei($u, '127.0.9.82', array_fill(0, 5, 910));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.82');
pruefe('fünf Stempel 910 s voraus (mehr als ein Fenster): 401', $a['status'] === 401, kurz($a));
stempelDatei($u, '127.0.9.83', array_fill(0, 5, 890));
$a = anmelden($u, 'chef', ALT, '127.0.9.83');
pruefe('fünf Stempel 890 s voraus (weniger als ein Fenster) zählen: 429', $a['status'] === 429, kurz($a));
stempelDatei($u, '127.0.9.84', array_fill(0, 5, 600));
$a = anmelden($u, 'chef', ALT, '127.0.9.84');
pruefe('fünf Stempel 600 s voraus: 429 mit "25 Minuten" (Ende des Fensters dieser Stempel), nicht mehr',
    $a['status'] === 429 && strpos((string)($a['json']['error'] ?? ''), 'Bitte warten Sie 25 Minuten') !== false, kurz($a));
stempelDatei($u, '127.0.9.85', [-60, -50, -40, -30, 3600, 3600, 3600]);
$codes = folge($u, '127.0.9.85', ['falsch-falsch', 'falsch-falsch']);
pruefe('vier gültige Stempel und drei ferne aus der Zukunft: die fernen zählen nicht (ein Fehlversuch 401, dann 429)',
    $codes === [401, 429], implode(',', $codes));
