<?php
/**
 * Rotprobe mit Anker-Zwang für ops/tests/anmeldung_test.php.
 *
 * Baut je Mutant eine Kopie des API-Ordners, in der genau eine Schutzstelle der
 * Anmeldung ausgeschaltet ist, und lässt den Test darauf laufen. Der Test muss
 * rot enden und dabei die Prüfung nennen, die zu dieser Schutzstelle gehört.
 * Bleibt er grün, belegt er die Schutzstelle nicht.
 *
 * Anker-Zwang: Der zu ersetzende Text muss in der Datei genau einmal stehen.
 * Fehlt er (weil der Code umgebaut wurde), ist das ein Fehler dieses Skripts
 * und kein bestandener Mutant.
 *
 * Aufruf:  php ops/tests/anmeldung_mutanten.php [--ohne-netz] [--ganz] [<Pfad zu public/api>]
 * Exit:    0 = jeder Mutant wurde erkannt, 1 = ein Mutant überlebte oder ein Anker fehlt
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$testArgumente = [];
$ganz = false;
$apiQuelle = __DIR__ . '/../../public/api';
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--ohne-netz') {
        $testArgumente[] = $arg;
    } elseif ($arg === '--ganz') {
        $ganz = true;
    } else {
        $apiQuelle = $arg;
    }
}
$apiQuelle = realpath($apiQuelle);
if ($apiQuelle === false || !is_file($apiQuelle . '/auth.php')) {
    fwrite(STDERR, "auth.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}

$abweisung = "        http_response_code(503);\n        echo json_encode(['error' => 'Anmeldung derzeit nicht prüfbar']);\n";

// [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
$mutanten = [
    ['Sitzungsmarke wird nicht verglichen',
        [['auth.php', "!hash_equals(sitzungsMarke((string)\$zeile['password_hash']), \$_SESSION['pw_marke'])", 'false']],
        'Hash getauscht: geschützte Tür (analytics-status.php) 401'],
    ['Sitzung ohne Marke gilt',
        [['auth.php', "if (empty(\$_SESSION['user_id']) || !is_string(\$_SESSION['pw_marke'] ?? null)) {\n        return null;\n    }",
            "if (empty(\$_SESSION['user_id'])) {\n        return null;\n    }\n    if (!isset(\$_SESSION['pw_marke'])) {\n        return ['id' => \$_SESSION['user_id'], 'username' => \$_SESSION['username'], 'display_name' => \$_SESSION['display_name']];\n    }"]],
        'Sitzung ohne Marke (wie aus der Zeit vor diesem Stand)'],
    ['Marke muss kein Text sein',
        [['auth.php', "!is_string(\$_SESSION['pw_marke'] ?? null)) {", "!isset(\$_SESSION['pw_marke'])) {"],
         ['auth.php', "!hash_equals(sitzungsMarke((string)\$zeile['password_hash']), \$_SESSION['pw_marke'])",
            "(is_string(\$_SESSION['pw_marke']) && !hash_equals(sitzungsMarke((string)\$zeile['password_hash']), \$_SESSION['pw_marke']))"]],
        'Sitzung mit Marke als Zahl'],
    ['analytics-config.php prüft nur die Sitzung',
        [['analytics-config.php', '$angemeldet = angemeldeterAdmin() !== null;', "\$angemeldet = !empty(\$_SESSION['user_id']);"]],
        'Hash getauscht: analytics-config.php ohne Feld geo_api_key'],
    ['me prüft nur die Sitzung',
        [['auth.php', '        $konto = angemeldeterAdmin();',
            "        \$konto = empty(\$_SESSION['user_id']) ? null : ['username' => \$_SESSION['username'], 'display_name' => \$_SESSION['display_name']];"]],
        'Hash getauscht: me meldet unangemeldet'],
    ['requireAuth prüft nur die Sitzung',
        [['auth.php', '        $admin = angemeldeterAdmin();', "        \$admin = empty(\$_SESSION['user_id']) ? null : [];"]],
        'Hash getauscht: orders.php GET 401'],
    ['requireAuth: Datenbankfehler gilt als angemeldet',
        [['auth.php', $abweisung . "        return false;\n", "        return true;\n"]],
        'Datenbank nicht lesbar: geschützte Tür 503'],
    ['me: Datenbankfehler wird nicht als 503 gemeldet',
        [['auth.php', $abweisung . "        return;\n", "        echo json_encode(['authenticated' => false, 'user' => null]);\n        return;\n"]],
        'Datenbank nicht lesbar: me 503'],
    ['Anmeldung legt keine Marke in die Sitzung',
        [['auth.php', "    \$_SESSION['pw_marke'] = sitzungsMarke((string)\$user['password_hash']);\n", '']],
        'vor dem Tausch: me meldet angemeldet'],
    ['Ersteinrichtung legt keine Marke in die Sitzung',
        [['auth.php', "    \$_SESSION['pw_marke'] = sitzungsMarke(\$hash);\n", '']],
        'nach setup: me angemeldet'],
    ['Marke ist der Passwort-Hash selbst',
        [['auth.php', "return substr(hash('sha256', \$passwortHash), 0, 16);", 'return $passwortHash;']],
        'Sitzungsdatei trägt eine Marke aus 16 Hex-Zeichen'],
];
// Jeder Mutant gehört zu einem Teil des Tests: die Liste oben zum Teil "sitzung", die Listen der
// Dateien anmeldung_mutanten_<teil>.php zum Teil <teil>. Gefahren wird je Mutant nur dieser Teil;
// dort steht die Prüfung, die rot werden muss. Mit --ganz läuft je Mutant der ganze Test.
$mutanten = array_map(fn($m) => array_merge($m, ['sitzung']), $mutanten);
foreach (glob(__DIR__ . '/anmeldung_mutanten_*.php') ?: [] as $datei) {
    $teil = substr(basename($datei, '.php'), strlen('anmeldung_mutanten_'));
    if (!is_file(__DIR__ . '/anmeldung_faelle_' . $teil . '.php')) {
        fwrite(STDERR, "Zu den Mutanten in " . basename($datei) . " gibt es keinen Teil $teil
");
        exit(2);
    }
    $mutanten = array_merge($mutanten, array_map(fn($m) => array_merge($m, [$teil]), require $datei));
}

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
foreach ($mutanten as [$name, $ersetzungen, $pruefung, $teil]) {
    $kopie = sys_get_temp_dir() . '/anmeldung-mutant-' . bin2hex(random_bytes(6));
    kopiere($apiQuelle, $kopie);
    $ankerFehlt = false;
    foreach ($ersetzungen as [$datei, $anker, $ersatz]) {
        $quelltext = (string)file_get_contents($kopie . '/' . $datei);
        $treffer = substr_count($quelltext, $anker);
        if ($treffer !== 1) {
            $ankerFehlt = true;
            echo "ANKER FEHLT   $name: Anker steht {$treffer}-mal in $datei, erwartet genau einmal\n";
            break;
        }
        file_put_contents($kopie . '/' . $datei, str_replace($anker, $ersatz, $quelltext));
    }
    if ($ankerFehlt) {
        $fehler++;
        exec('rm -rf ' . escapeshellarg($kopie));
        continue;
    }

    $rohre = [];
    $prozess = proc_open(
        array_merge([PHP_BINARY, __DIR__ . '/anmeldung_test.php'], $testArgumente, $ganz ? [] : ['--teil=' . $teil], [$kopie]),
        [1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']],
        $rohre
    );
    $ausgabe = stream_get_contents($rohre[1]);
    $exit = proc_close($prozess);
    exec('rm -rf ' . escapeshellarg($kopie));

    $roteZeilen = array_values(array_filter(explode("\n", $ausgabe), fn($z) => strpos($z, 'ROT ') === 0));
    $zugehoerig = array_filter($roteZeilen, fn($z) => strpos($z, $pruefung) !== false);
    if ($exit === 1 && $zugehoerig !== []) {
        $erkannt++;
        echo "ERKANNT       [$teil] $name: Test Exit 1, " . count($roteZeilen) . " rot, darunter \"$pruefung\"\n";
    } else {
        $fehler++;
        echo "UEBERLEBT     [$teil] $name: Test Exit $exit, " . count($roteZeilen) . " rot, \"$pruefung\" nicht darunter\n";
    }
}

echo "\nERGEBNIS MUTANTEN: $erkannt von " . count($mutanten) . " erkannt, $fehler Fehler\n";
exit($fehler === 0 ? 0 : 1);
