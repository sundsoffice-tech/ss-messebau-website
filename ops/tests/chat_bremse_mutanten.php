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
 * Aufruf:  php ops/tests/chat_bremse_mutanten.php [--ohne-netz] [--gleichzeitig=N] [<Pfad zu public/api>]
 * Exit:    0 = jeder Mutant wurde erkannt, 1 = ein Mutant überlebte oder ein Anker fehlt
 *
 * Je Mutant läuft der ganze Test. Damit die Reihe in die Zeitgrenze des Laufs
 * passt, laufen N Mutanten zugleich (Vorgabe 4); jeder Testlauf hat eigene
 * Kopien, eigene Server und eigene Ports.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$testArgumente = [];
$gleichzeitig = 4;
$apiQuelle = __DIR__ . '/../../public/api';
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--ohne-netz') {
        $testArgumente[] = $arg;
    } elseif (strpos($arg, '--gleichzeitig=') === 0) {
        $gleichzeitig = max(1, (int)substr($arg, strlen('--gleichzeitig=')));
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
    // Fund 5 des Programmierers: der 503-Ausgang der IP-Bremse
    ['defekter IP-Zähler wird durchgelassen', 'chat.php',
        'if ($ipErlaubt === null) {', 'if (false) {',
        'IP-Zähler nicht zu öffnen: 503'],
    // F1: Tageslimit je Adresse
    ['Tageslimit je Adresse lässt alles durch', 'chat.php',
        'if ($adresseErlaubt === false) {', 'if (false) {',
        'derselben Adresse am selben Tag: 429'],
    ['defekter Adress-Tageszähler wird durchgelassen', 'chat.php',
        'if ($adresseErlaubt === null) {', 'if (false) {',
        'Adress-Tageszähler nicht zu öffnen: 503'],
    ['alle Adressen teilen sich einen Tageszähler', 'chat.php',
        "CHAT_ADRESSE_DATEI_ANFANG . \$adressSchluessel . '.json',", "CHAT_ADRESSE_DATEI_ANFANG . 'alle.json',",
        'eine zweite Adresse (127.0.0.2) geht zur selben Zeit durch'],
    ['Zähler von gestern gilt heute weiter', 'chat.php',
        "return (\$stand['tag'] ?? null) === \$tag;", 'return $stand !== null;',
        'voller Adresszähler von gestern sperrt heute nicht'],
    ['Tageszähler je Adresse heißt wie die Stunden-Zähler', 'chat.php',
        "'/data/chat_adresstag_'", "'/data/rate_limit_chattag_'",
        'passt in kein Stunden-Muster'],
    ['Aufräumen löscht den Adress-Tageszähler schon nach einer Stunde', 'analytics-cleanup.php',
        'time() - 172800', 'time() - 3600',
        '47 Stunden alt bleibt'],
    ['Aufräumregel für den Adress-Tageszähler fehlt', 'analytics-cleanup.php',
        "glob(\$rateLimitDir . 'chat_adresstag_*.json')", '[]',
        '49 Stunden alt ist weg'],
    ['chat.php räumt verfallene Adress-Tageszähler nicht selbst weg', 'chat.php',
        'chatAdressdateienAufraeumen($now);', '',
        'beim Tageswechsel räumt chat.php selbst auf'],
    // F2: Tageszahlen und Zustand
    ['Tageszahl wird beim Tageswechsel überschrieben statt festgehalten', 'chat.php',
        'chatTageszahlFesthalten($stand);', '',
        'Tageszahl von gestern bleibt lesbar'],
    ['Nachzügler um Mitternacht überschreibt die festgehaltene Tageszahl', 'chat.php',
        "if ((\$tage[\$tag]['anzahl'] ?? -1) < \$eintrag['anzahl']) {", 'if (true) {',
        'ersetzt die festgehaltene 17 nicht'],
    ['Verlauf wächst über 90 Tage hinaus', 'chat.php',
        '$tage = array_slice($tage, -CHAT_TAGESZAHLEN_TAGE, null, true);', '',
        'Verlauf hält höchstens'],
    ['health.php meldet den erreichten Deckel nicht', 'health.php',
        "\$checks['chat'] = 'deckel_erreicht';", "\$checks['chat'] = 'frei';",
        'Deckel erreicht: health.php meldet'],
    ['health.php nennt die Zahl', 'health.php',
        "\$checks['chat'] = 'deckel_erreicht';", "\$checks['chat'] = 'deckel_erreicht';\n    \$checks['chat_anzahl'] = \$chatStand['anzahl'];",
        'der Zustand steht ohne Zahl da'],
    ['erreichter Deckel färbt den Status der ganzen Seite', 'health.php',
        "\$checks['chat'] = 'deckel_erreicht';", "\$checks['chat'] = 'deckel_erreicht';\n    \$status = 'degraded';",
        '"status": "ok" und "database": "ok" bleiben dabei stehen'],
    ['Tageszahlen ohne Anmeldung lesbar', 'chat.php',
        'if (!requireAuth()) {', 'if (false) {',
        'Tageszahlen mit Sitzung ohne Anmeldung: 401'],
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
$neustarts = 0; // Testserver, die erst im zweiten Versuch einen Port bekamen
echo "Prüfling: $apiQuelle\n";

// Erst alle Kopien bauen (Anker-Zwang), dann die Testläufe in Gruppen starten.
$laeufe = [];
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
    $laeufe[] = ['name' => $name, 'pruefung' => $pruefung, 'kopie' => $kopie];
}

foreach (array_chunk($laeufe, $gleichzeitig) as $gruppe) {
    // Ausgabe in eine Datei je Lauf, nicht in ein Rohr: Ein volles Rohr hielte
    // einen Testlauf an, solange hier ein anderer ausgelesen wird.
    foreach ($gruppe as $i => $lauf) {
        $rohre = [];
        $gruppe[$i]['ausgabe'] = $lauf['kopie'] . '.ausgabe';
        $gruppe[$i]['prozess'] = proc_open(
            array_merge([PHP_BINARY, __DIR__ . '/chat_bremse_test.php'], $testArgumente, [$lauf['kopie']]),
            [1 => ['file', $gruppe[$i]['ausgabe'], 'w'], 2 => ['file', $lauf['kopie'] . '.fehler', 'w']],
            $rohre
        );
    }
    foreach ($gruppe as $lauf) {
        $exit = is_resource($lauf['prozess']) ? proc_close($lauf['prozess']) : -1;
        $ausgabe = (string)@file_get_contents($lauf['ausgabe']);
        $neustarts += substr_count($ausgabe, 'HINWEIS Testserver erst im Versuch');
        $name = $lauf['name'];
        $pruefung = $lauf['pruefung'];
        $roteZeilen = array_values(array_filter(explode("\n", $ausgabe), fn($z) => strpos($z, 'ROT ') === 0));
        $zugehoerig = array_filter($roteZeilen, fn($z) => strpos($z, $pruefung) !== false);
        if ($exit === 1 && $zugehoerig !== []) {
            $erkannt++;
            echo "ERKANNT       $name: Test Exit 1, " . count($roteZeilen) . " rot, darunter \"$pruefung\"\n";
        } elseif ($exit !== 0 && $exit !== 1) {
            // Der Test ist nicht durchgelaufen (Exit 2 = Umgebung): kein Urteil über den Mutanten
            $fehler++;
            $letzte = array_slice(array_values(array_filter(explode("\n", $ausgabe))), -2);
            echo "NICHT GELAUFEN $name: Test Exit $exit, letzte Zeilen: " . implode(' | ', $letzte)
                . ' | ' . trim((string)@file_get_contents($lauf['kopie'] . '.fehler')) . "\n";
        } else {
            $fehler++;
            echo "UEBERLEBT     $name: Test Exit $exit, " . count($roteZeilen) . " rot, \"$pruefung\" nicht darunter\n";
        }
    }
}

echo "\nERGEBNIS MUTANTEN: $erkannt von " . count($mutanten) . " erkannt, $fehler Fehler"
    . ", $neustarts Testserver im zweiten Anlauf gestartet\n";
exit($fehler === 0 ? 0 : 1);
