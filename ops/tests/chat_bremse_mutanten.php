<?php
/**
 * Rotprobe mit Anker-Zwang für ops/tests/chat_bremse_test.php.
 *
 * Baut je Mutant eine Kopie des API-Ordners, in der genau eine Schutzstelle
 * ausgeschaltet ist, und lässt den Test darauf laufen. Der Test muss rot enden
 * und dabei die Prüfung nennen, die zu dieser Schutzstelle gehört. Bleibt er
 * grün, belegt er die Schutzstelle nicht.
 *
 * Anker-Zwang: Der zu ersetzende Text muss in der Datei genau einmal stehen.
 * Fehlt er (weil der Code umgebaut wurde), ist das ein Fehler dieses Skripts
 * und kein bestandener Mutant.
 *
 * Aufruf:  php ops/tests/chat_bremse_mutanten.php [--ohne-netz] [<Pfad zu public/api>]
 * Exit:    0 = jeder Mutant wurde erkannt, 1 = ein Mutant überlebte oder ein Anker fehlt
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$testArgumente = [];
$apiQuelle = __DIR__ . '/../../public/api';
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--ohne-netz') {
        $testArgumente[] = $arg;
    } else {
        $apiQuelle = $arg;
    }
}
$apiQuelle = realpath($apiQuelle);
if ($apiQuelle === false || !is_file($apiQuelle . '/chat.php')) {
    fwrite(STDERR, "chat.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}

// [Name, Datei, Anker (genau einmal), Ersatz, Teil des Namens der Prüfung, die rot werden muss]
$mutanten = [
    ['Zähldatei ohne Sperre', 'chat.php',
        'if (!flock($fp, LOCK_EX)) {', 'if (false) {',
        'von außen gesperrt: die Anfrage wartet'],
    ['Methode wird nicht geprüft', 'chat.php',
        "if (\$_SERVER['REQUEST_METHOD'] !== 'POST') {", 'if (false) {',
        '15 GET-Abrufe: jeder 405'],
    ['IP-Bremse lässt alles durch', 'chat.php',
        '$erlaubt = count($stempel) < $max;', '$erlaubt = true;',
        'in derselben Minute ohne Cookie: 429'],
    ['Adresse aus X-Forwarded-For', 'chat.php',
        "(string)(\$_SERVER['REMOTE_ADDR'] ?? '')", "(string)(\$_SERVER['HTTP_X_FORWARDED_FOR'] ?? \$_SERVER['REMOTE_ADDR'] ?? '')",
        'gefälschte Kopfzeilen'],
    ['Tagesdeckel lässt alles durch', 'chat.php',
        '$erlaubt = $anzahl < $max;', '$erlaubt = true;',
        '429 mit der deutschen Meldung, obwohl die IP-Bremse'],
    ['defekter Tageszähler wird durchgelassen', 'chat.php',
        'if ($tagErlaubt === null) {', 'if (false) {',
        'Tageszähler nicht zu öffnen: 503'],
    ['message muss kein Text sein', 'chat.php',
        " || !is_string(\$input['message'])) {", ') {',
        'message als Liste: 400'],
    ['health.php nennt wieder die PHP-Fassung', 'health.php',
        "\$checks['timestamp'] = gmdate('c');", "\$checks['php_version'] = PHP_VERSION;\n\$checks['timestamp'] = gmdate('c');",
        'Feld php_version fehlt'],
];

function kopiere(string $von, string $nach): void {
    mkdir($nach, 0755, true);
    foreach (scandir($von) as $eintrag) {
        if ($eintrag === '.' || $eintrag === '..') {
            continue;
        }
        if (is_dir($von . '/' . $eintrag)) {
            if ($eintrag === 'data') {
                mkdir($nach . '/data', 0755);
            }
            continue;
        }
        copy($von . '/' . $eintrag, $nach . '/' . $eintrag);
    }
}

$erkannt = 0;
$fehler = 0;
echo "Prüfling: $apiQuelle\n";
foreach ($mutanten as [$name, $datei, $anker, $ersatz, $pruefung]) {
    $quelltext = (string)file_get_contents($apiQuelle . '/' . $datei);
    $treffer = substr_count($quelltext, $anker);
    if ($treffer !== 1) {
        $fehler++;
        echo "ANKER FEHLT   $name: Anker steht {$treffer}-mal in $datei, erwartet genau einmal\n";
        continue;
    }
    $kopie = sys_get_temp_dir() . '/chat-mutant-' . bin2hex(random_bytes(6));
    kopiere($apiQuelle, $kopie);
    file_put_contents($kopie . '/' . $datei, str_replace($anker, $ersatz, $quelltext));

    $rohre = [];
    $prozess = proc_open(
        array_merge([PHP_BINARY, __DIR__ . '/chat_bremse_test.php'], $testArgumente, [$kopie]),
        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
        $rohre
    );
    $ausgabe = stream_get_contents($rohre[1]);
    stream_get_contents($rohre[2]);
    $exit = proc_close($prozess);

    $roteZeilen = array_values(array_filter(explode("\n", $ausgabe), fn($z) => strpos($z, 'ROT ') === 0));
    $zugehoerig = array_filter($roteZeilen, fn($z) => strpos($z, $pruefung) !== false);
    if ($exit === 1 && $zugehoerig !== []) {
        $erkannt++;
        echo "ERKANNT       $name: Test Exit 1, " . count($roteZeilen) . " rot, darunter \"$pruefung\"\n";
    } else {
        $fehler++;
        echo "UEBERLEBT     $name: Test Exit $exit, " . count($roteZeilen) . " rot, \"$pruefung\" nicht darunter\n";
    }
}

echo "\nERGEBNIS MUTANTEN: $erkannt von " . count($mutanten) . " erkannt, $fehler Fehler\n";
exit($fehler === 0 ? 0 : 1);
