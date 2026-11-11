<?php
/**
 * Fälle zur Anmeldebremse (eingebunden von ops/tests/anmeldung_test.php; Helfer und Zähler stehen dort).
 * Fünf Fehlversuche je Adresse in 15 Minuten; gezählt wird unter einer Dateisperre, und lässt sich der
 * Zähler nicht führen, gibt es keinen Versuch (503).
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

// ─── Fall B1: Grenze je Adresse ──────────────────────────────────────────────
echo "\n== Fall B1: fünf Fehlversuche je Adresse ==\n";
$u = starte($apiQuelle);
$codes = folge($u, '127.0.9.1', array_fill(0, 5, 'falsch-falsch'));
pruefe('fünf Fehlversuche einer Adresse: je 401', $codes === [401, 401, 401, 401, 401], implode(',', $codes));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.1');
pruefe('6. Fehlversuch derselben Adresse: 429 mit Wartezeit in Minuten',
    $a['status'] === 429 && preg_match('/Bitte warten Sie 1[45] Minuten/', (string)($a['json']['error'] ?? '')) === 1, kurz($a));
$a = anmelden($u, 'chef', ALT, '127.0.9.1');
pruefe('gebremste Adresse auch mit richtigem Passwort: 429', $a['status'] === 429, kurz($a));
$a = anfrage($u, 'POST', '/auth.php?action=login', '{}', [], 20, '127.0.9.1');
pruefe('gebremste Adresse mit leerer Eingabe: 429 (die Bremse antwortet vor der Eingabeprüfung)', $a['status'] === 429, kurz($a));
$a = anmelden($u, 'chef', ALT, '127.0.9.2');
pruefe('richtiges Passwort von anderer Adresse: 200 (keine Sperre für alle)', $a['status'] === 200, kurz($a));
$a = anmelden($u, 'gibt-es-nicht', ALT, '127.0.9.2');
pruefe('unbekannter Benutzername: 401 und gezählt',
    $a['status'] === 401 && stempelZahl(bremsdatei($u, '127.0.9.2')) === 1, kurz($a));

// ─── Fall B2: Erfolg leert, Eingabefehler zählen nicht, Fenster ──────────────
echo "\n== Fall B2: was zählt und was nicht ==\n";
$u = starte($apiQuelle);
$codes = folge($u, '127.0.9.3', ['f1-falsch', 'f2-falsch', 'f3-falsch', 'f4-falsch', ALT, 'f5-falsch', 'f6-falsch', 'f7-falsch', 'f8-falsch', 'f9-falsch', 'f10-falsch']);
pruefe('nach erfolgreicher Anmeldung zählt die Bremse neu (4 falsch, richtig, 5 falsch, dann erst 429)',
    $codes === [401, 401, 401, 401, 200, 401, 401, 401, 401, 401, 429], implode(',', $codes));
$codes = [];
foreach (['{}', '{"username":"chef"}', '{"password":"x"}', 'kein json', '{"username":"chef","password":""}', '{}', '{}'] as $rumpf) {
    $codes[] = anfrage($u, 'POST', '/auth.php?action=login', $rumpf, [], 20, '127.0.9.4')['status'];
}
$lang = anfrage($u, 'POST', '/auth.php?action=login', json_encode(['username' => 'chef', 'password' => str_repeat('x', 257)]), [], 20, '127.0.9.4');
$a = anmelden($u, 'chef', ALT, '127.0.9.4');
pruefe('sieben leere oder unvollständige Eingaben und eine überlange: je 400, nicht gezählt, danach Anmeldung 200',
    $codes === array_fill(0, 7, 400) && $lang['status'] === 400 && $a['status'] === 200, implode(',', $codes) . ' / ' . kurz($lang) . ' / ' . kurz($a));
$jetzt = time();
file_put_contents(bremsdatei($u, '127.0.9.6'), json_encode(array_fill(0, 5, $jetzt - 1000)));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.6');
pruefe('fünf Stempel älter als 15 Minuten sperren nicht: 401', $a['status'] === 401, kurz($a));
file_put_contents(bremsdatei($u, '127.0.9.7'), json_encode(array_fill(0, 5, $jetzt - 610)));
$a = anmelden($u, 'chef', ALT, '127.0.9.7');
pruefe('fünf Stempel von vor zehn Minuten: 429 mit "5 Minuten"',
    $a['status'] === 429 && strpos((string)($a['json']['error'] ?? ''), 'Bitte warten Sie 5 Minuten') !== false, kurz($a));
file_put_contents(bremsdatei($u, '127.0.9.8'), 'kein json');
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.8');
pruefe('unlesbarer Zähler gilt als leer und wird neu geschrieben: 401, danach ein Stempel',
    $a['status'] === 401 && stempelZahl(bremsdatei($u, '127.0.9.8')) === 1, kurz($a));

// ─── Fall B3: gleichzeitige Versuche ─────────────────────────────────────────
echo "\n== Fall B3: gleichzeitige Fehlversuche ==\n";
$u = starte($apiQuelle, ['chef'], 10);
$liste = array_fill(0, 20, ['/auth.php?action=login', ['username' => 'chef', 'password' => 'falsch-falsch']]);
$erg = gleichzeitig($u, $liste, bremsdatei($u, '127.0.9.5'), '127.0.9.5');
$codes = array_count_values(array_map(fn($a) => $a['status'], $erg));
ksort($codes);
pruefe('20 gleichzeitige Fehlversuche einer Adresse: genau fünf 401, der Rest 429',
    ($codes[401] ?? 0) === 5 && ($codes[429] ?? 0) === 15, json_encode($codes));
$fp = fopen(bremsdatei($u, '127.0.9.9'), 'c+');
flock($fp, LOCK_EX);
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.9', 2);
flock($fp, LOCK_UN);
fclose($fp);
pruefe('Zähldatei von außen gesperrt: die Anmeldung wartet (keine Antwort in 2 s) statt ungezählt durchzulaufen', $a['status'] === 0, kurz($a));
sleep(1); // der wartende Aufruf läuft im Server zu Ende

// ─── Fall B4: Zähler lässt sich nicht führen ─────────────────────────────────
echo "\n== Fall B4: Zähler nicht zu schreiben ==\n";
$u = starte($apiQuelle);
anmelden($u, 'chef', ALT, '127.0.9.20'); // Datenbank ist danach im Server geöffnet
chmod($u['daten'], 0555);
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.10');
$b = anmelden($u, 'chef', ALT, '127.0.9.10');
chmod($u['daten'], 0755);
pruefe('data/ nicht beschreibbar: falsches Passwort 503 mit festem Text statt ungezählt 401', $a['status'] === 503 && trim($a['text']) === TEXT_BREMSE_503, kurz($a));
$me = anfrage($u, 'GET', '/auth.php?action=me', null, ['Cookie: ' . $b['cookie']]);
pruefe('data/ nicht beschreibbar: auch das richtige Passwort 503, und die Sitzung dazu ist nicht angemeldet',
    $b['status'] === 503 && ($me['json']['authenticated'] ?? null) === false, kurz($b) . ' / ' . kurz($me));
file_put_contents(bremsdatei($u, '127.0.9.11'), '[]');
chmod(bremsdatei($u, '127.0.9.11'), 0444);
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.11');
pruefe('Zähldatei schreibgeschützt: 503', $a['status'] === 503, kurz($a));
$a = anmelden($u, 'chef', ALT, '127.0.9.10');
pruefe('Gegenprobe: ohne das Hindernis gelingt dieselbe Anmeldung (200)', $a['status'] === 200, kurz($a));
