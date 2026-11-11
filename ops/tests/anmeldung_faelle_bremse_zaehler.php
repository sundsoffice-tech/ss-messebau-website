<?php
/**
 * Fälle zur Zähldatei der Anmeldebremse (eingebunden von ops/tests/anmeldung_test.php).
 * Reihenfolge im Prüfling: erst den Stempel des Versuchs schreiben, dann das Passwort prüfen.
 * Lässt sich der Stempel nicht schreiben (Platte voll), wird nicht geprüft, und der Bestand der
 * Zähldatei bleibt stehen.
 *
 * Fall Z1 braucht ein Kleinst-Dateisystem unter /kleinfs (docker run --tmpfs /kleinfs:size=256k,mode=1777).
 * Die Zähldateien dreier Adressen liegen dort (Verweis aus data/), dann wird es bis zur letzten Seite gefüllt.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

// ─── Fall Z1: Platte voll ────────────────────────────────────────────────────
echo "\n== Fall Z1: Platte voll, der Versuch lässt sich nicht zählen ==\n";
$klein = kleinOrdner();
pruefe('Kleinst-Dateisystem unter /kleinfs vorhanden (docker run --tmpfs /kleinfs:size=256k,mode=1777)', $klein !== null);
if ($klein !== null) {
    $u = starte($apiQuelle);
    $jetzt = time();
    $leer = verlege($u, '127.0.9.30', $klein, '');
    $zwei = verlege($u, '127.0.9.31', $klein, bestand(4096, 2, $jetzt));
    $krumm = verlege($u, '127.0.9.32', $klein, bestand(4090, 2, $jetzt));
    $direktLeer = $klein . '/direkt-leer';
    $direktZwei = $klein . '/direkt-zwei';
    $seite = $klein . '/volle-seite';
    file_put_contents($direktLeer, '');
    file_put_contents($direktZwei, bestand(4096, 2, $jetzt));
    file_put_contents($seite, str_repeat('x', 4096));
    $abdruck = [md5_file($zwei), md5_file($krumm), md5_file($direktZwei)];
    $fuellung = fuelle($klein);
    $fp = fopen($seite, 'a');
    $geschrieben = @fwrite($fp, 'x');
    fclose($fp);
    pruefe('Vorbedingung: Das Kleinst-Dateisystem ist voll (Anhängen an eine volle Seite scheitert)',
        $geschrieben !== 1 && groesse($seite) === 4096, var_export($geschrieben, true) . ' / ' . groesse($seite));

    $a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.30');
    pruefe('Platte voll, leerer Zähler: falsches Passwort 503', $a['status'] === 503 && trim($a['text']) === TEXT_BREMSE_503, kurz($a));
    $b = anmelden($u, 'chef', ALT, '127.0.9.30');
    $me = anfrage($u, 'GET', '/auth.php?action=me', null, ['Cookie: ' . $b['cookie']]);
    pruefe('Platte voll, leerer Zähler: richtiges Passwort ebenfalls 503 statt 200, die Sitzung dazu ist nicht angemeldet',
        $b['status'] === 503 && trim($b['text']) === TEXT_BREMSE_503 && ($me['json']['authenticated'] ?? null) === false, kurz($b) . ' / ' . kurz($me));
    pruefe('Platte voll, leerer Zähler: die Zähldatei bleibt leer', groesse($leer) === 0, (string)groesse($leer));
    $a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.31');
    $b = anmelden($u, 'chef', ALT, '127.0.9.31');
    pruefe('Platte voll, Zähler mit zwei Stempeln: falsches und richtiges Passwort je 503', $a['status'] === 503 && $b['status'] === 503, kurz($a) . ' / ' . kurz($b));
    pruefe('Platte voll, Zähler mit zwei Stempeln: der Bestand ist unverändert', md5_file($zwei) === $abdruck[0], (string)groesse($zwei));
    $a = anmelden($u, 'chef', 'falsch-falsch', '127.0.9.32');
    pruefe('Platte voll, der Stempel passt nur zum Teil in die Datei: 503, der abgerissene Rest ist wieder abgeschnitten (Datei wie vorher)',
        $a['status'] === 503 && groesse($krumm) === 4090 && md5_file($krumm) === $abdruck[1], kurz($a) . ' / ' . groesse($krumm));
    $r = bremseDirekt($u, $direktLeer, 'richtig');
    pruefe('Platte voll, bremseVersuch direkt, leerer Zähler: Stand defekt, die Prüfung lief nicht',
        $r['stand'] === 'defekt' && $r['lief'] === false, json_encode($r));
    $r = bremseDirekt($u, $direktZwei, 'richtig');
    pruefe('Platte voll, bremseVersuch direkt, zwei Stempel: Stand defekt, die Prüfung lief nicht, Bestand unverändert',
        $r['stand'] === 'defekt' && $r['lief'] === false && md5_file($direktZwei) === $abdruck[2], json_encode($r));

    unlink($fuellung);
    $r = bremseDirekt($u, $direktLeer, 'falsch');
    pruefe('Gegenprobe mit Platz: bremseVersuch direkt zählt und prüft (Stand falsch, Prüfung lief, ein Stempel)',
        $r['stand'] === 'falsch' && $r['lief'] === true && stempelZahl($direktLeer) === 1, json_encode($r));
    $codes = folge($u, '127.0.9.31', array_fill(0, 4, 'falsch-falsch'));
    pruefe('Gegenprobe mit Platz: die zwei Stempel von vor der vollen Platte zählen weiter (drei Fehlversuche 401, der vierte 429)',
        $codes === [401, 401, 401, 429], implode(',', $codes));
    $a = anmelden($u, 'chef', ALT, '127.0.9.30');
    pruefe('Gegenprobe mit Platz: dieselbe Adresse mit richtigem Passwort 200', $a['status'] === 200, kurz($a));
    array_map('unlink', glob($klein . '/*') ?: []);
    rmdir($klein);
}

// ─── Fall Z2: Bestand der Zähldatei ──────────────────────────────────────────
echo "\n== Fall Z2: Bestand der Zähldatei ==\n";
$u = starte($apiQuelle);
$jetzt = time();
file_put_contents(bremsdatei($u, '127.0.9.40'), json_encode([$jetzt - 60, $jetzt - 50]));
$codes = folge($u, '127.0.9.40', array_fill(0, 4, 'falsch-falsch'));
pruefe('Zähldatei im früheren Format (JSON-Liste) mit zwei Stempeln zählt weiter (drei Fehlversuche 401, der vierte 429)',
    $codes === [401, 401, 401, 429], implode(',', $codes));
file_put_contents(bremsdatei($u, '127.0.9.41'), ($jetzt - 60) . "\n" . ($jetzt - 50) . "\n" . ($jetzt - 40) . "\n" . ($jetzt - 30) . "\n17310");
$codes = folge($u, '127.0.9.41', ['falsch-falsch', 'falsch-falsch']);
pruefe('Zähldatei endet mit einem abgerissenen Rest: er zählt nicht, der nächste Stempel zählt (ein Fehlversuch 401, dann 429)',
    $codes === [401, 429], implode(',', $codes));
file_put_contents(bremsdatei($u, '127.0.9.42'), bestand(4433, 2, $jetzt));
$erst = folge($u, '127.0.9.42', ['falsch-falsch']);
$danach = groesse(bremsdatei($u, '127.0.9.42'));
$codes = array_merge($erst, folge($u, '127.0.9.42', array_fill(0, 3, 'falsch-falsch')));
pruefe('Zähldatei über 4096 Byte: wird auf die gültigen Stempel gekürzt (danach 33 Byte), und sie zählen weiter (drei Fehlversuche 401, der vierte 429)',
    $danach === 33 && $codes === [401, 401, 401, 429], $danach . ' / ' . implode(',', $codes));
file_put_contents(bremsdatei($u, '127.0.9.43'), bestand(4096, 0, $jetzt));
$codes = folge($u, '127.0.9.43', ['falsch-falsch']);
pruefe('Zähldatei nur mit verfallenen Stempeln: beginnt von vorn (danach 11 Byte)',
    $codes === [401] && groesse(bremsdatei($u, '127.0.9.43')) === 11, implode(',', $codes) . ' / ' . groesse(bremsdatei($u, '127.0.9.43')));
$codes = folge($u, '127.0.9.44', ['falsch-falsch', ALT]);
pruefe('nach erfolgreicher Anmeldung ist die Zähldatei leer (0 Byte)',
    $codes === [401, 200] && groesse(bremsdatei($u, '127.0.9.44')) === 0, implode(',', $codes) . ' / ' . groesse(bremsdatei($u, '127.0.9.44')));
