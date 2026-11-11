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
// Der wartende Aufruf läuft im Server zu Ende und zählt dann genau einmal.
for ($i = 0; $i < 50 && stempelZahl(bremsdatei($u, '127.0.9.9')) === 0; $i++) {
    usleep(100000);
}
usleep(300000);
pruefe('nach der Freigabe der Sperre steht genau ein Stempel des wartenden Versuchs in der Zähldatei',
    stempelZahl(bremsdatei($u, '127.0.9.9')) === 1 && groesse(bremsdatei($u, '127.0.9.9')) === 11,
    stempelZahl(bremsdatei($u, '127.0.9.9')) . ' / ' . groesse(bremsdatei($u, '127.0.9.9')));
// Dieselbe Probe mit einer geteilten Sperre von außen. Eine exklusive Sperre im Server muss auf sie
// warten; eine nur geteilte bekäme sie sofort und liefe durch. Damit hängt der Nachweis „auth.php
// sperrt exklusiv“ nicht mehr am Zufall der 20 gleichzeitigen Versuche oben (Wissenschaftler
// 11.11.2026: dort überlebte der Mutant LOCK_SH 1 von 17 Malen).
$fp = fopen(bremsdatei($u, '127.0.9.14'), 'c+');
flock($fp, LOCK_SH);
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.14', 2);
flock($fp, LOCK_UN);
fclose($fp);
pruefe('Zähldatei von außen geteilt gesperrt: die Anmeldung wartet (keine Antwort in 2 s), weil der Server exklusiv sperrt', $a['status'] === 0, kurz($a));
for ($i = 0; $i < 50 && stempelZahl(bremsdatei($u, '127.0.9.14')) === 0; $i++) {
    usleep(100000);
}
usleep(300000);
pruefe('nach der Freigabe der geteilten Sperre steht genau ein Stempel des wartenden Versuchs',
    stempelZahl(bremsdatei($u, '127.0.9.14')) === 1 && groesse(bremsdatei($u, '127.0.9.14')) === 11,
    stempelZahl(bremsdatei($u, '127.0.9.14')) . ' / ' . groesse(bremsdatei($u, '127.0.9.14')));
// Die Probe oben zeigt, dass der Server wartet, nicht, dass er erst nach dem Warten liest. Ein Umbau
// „geteilt lesen, dann exklusiv schreiben“ besteht sie und fiel bisher nur in B3 auf, also mit Zufall
// (Spieltheoretiker 11.11.2026). Deshalb füllt der Test die Datei, während der Server wartet: Liest
// der Server erst unter der exklusiven Sperre, sieht er fünf Stempel, antwortet 429 und schreibt
// nichts dazu; hat er vorher gelesen, stempelt er über den Inhalt des Tests hinweg.
$z = bremsdatei($u, '127.0.9.15');
$fp = fopen($z, 'c+');
flock($fp, LOCK_SH);
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.15', 2);
file_put_contents($z, str_repeat(time() . "\n", 5));
flock($fp, LOCK_UN);
fclose($fp);
usleep(1500000);
pruefe('während des Wartens füllt der Test die Zähldatei auf fünf Stempel: der Server liest erst unter der exklusiven Sperre, die Datei bleibt bei 5 Stempeln und 55 Byte',
    $a['status'] === 0 && stempelZahl($z) === 5 && groesse($z) === 55, kurz($a) . ' / ' . stempelZahl($z) . ' / ' . groesse($z));

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

// ─── Fall B5: Grenzen des Fensters und der Lesart ────────────────────────────
echo "\n== Fall B5: Grenzen des Fensters, gemischte Stempel, lange Ziffernfolgen ==\n";
$u = starte($apiQuelle);
$grenze = $u['wurzel'] . '/grenze.zaehler';
$r = bremseAufDieSekunde($u, $grenze, -899);
pruefe('fünf Stempel genau 899 s alt zählen noch: Stand voll, Wartezeit 1 s',
    $r['stand'] === 'voll' && $r['warten'] === 1 && $r['lief'] === false, json_encode($r));
$r = bremseAufDieSekunde($u, $grenze, -900);
pruefe('fünf Stempel genau 900 s alt sind verfallen: der Versuch wird gezählt und geprüft, danach steht nur sein Stempel in der Datei',
    $r['stand'] === 'falsch' && $r['lief'] === true && stempelZahl($grenze) === 1, json_encode($r) . ' / ' . stempelZahl($grenze));
$r = bremseAufDieSekunde($u, $grenze, 899);
pruefe('fünf Stempel genau 899 s voraus zählen: Stand voll', $r['stand'] === 'voll' && $r['lief'] === false, json_encode($r));
$r = bremseAufDieSekunde($u, $grenze, 900);
pruefe('fünf Stempel genau 900 s voraus zählen nicht: der Versuch wird gezählt und geprüft', $r['stand'] === 'falsch' && $r['lief'] === true, json_encode($r));
$jetzt = time();
file_put_contents(bremsdatei($u, '127.0.9.12'), implode("\n", [$jetzt - 10, $jetzt - 800, $jetzt - 200, $jetzt - 600, $jetzt - 400]) . "\n");
$a = anmelden($u, 'chef', ALT, '127.0.9.12');
pruefe('gemischte Stempel (10 bis 800 s alt, ungeordnet): 429 mit "2 Minuten", gerechnet vom ältesten',
    $a['status'] === 429 && strpos((string)($a['json']['error'] ?? ''), 'Bitte warten Sie 2 Minuten') !== false, kurz($a));
file_put_contents(bremsdatei($u, '127.0.9.13'), str_repeat(($jetzt - 60) . "123\n", 5));
$a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.13');
pruefe('fünf Folgen von 13 Ziffern am Stück (Stempel plus drei Ziffern) sind keine Stempel: Fehlversuch 401 statt 429', $a['status'] === 401, kurz($a));
