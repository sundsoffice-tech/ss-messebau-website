<?php
/**
 * Rotprobe mit Anker-Zwang für die Fälle zum Zufluss in ops/tests/bereinigung_test.php
 * (V bis Z, AA bis AD).
 *
 * Baut je Mutant eine Kopie des API-Ordners, in der genau eine Prüfung oder
 * Regel ausgeschaltet ist, und lässt den Test (nur die Fälle ab V, Umgebung
 * BEREINIGUNG_AB_V=1) darauf laufen. Der Test muss rot enden und dabei die
 * Prüfung nennen, die zu dieser Stelle gehört. Bleibt er grün, belegt er die
 * Stelle nicht.
 *
 * Anker-Zwang: Der zu ersetzende Text muss in der Datei genau einmal stehen.
 * Fehlt er (weil der Code umgebaut wurde), ist das ein Fehler dieses Skripts
 * und kein bestandener Mutant.
 *
 * Aufruf:  php ops/tests/statistik_alarm_mutanten.php [--ohne-netz] [<Pfad zu public/api>]
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
if ($apiQuelle === false || !is_file($apiQuelle . '/collect.php') || !is_file($apiQuelle . '/statistik-zaehler.php')) {
    fwrite(STDERR, "collect.php oder statistik-zaehler.php nicht gefunden unter dem angegebenen Pfad\n");
    exit(2);
}

// [Name, Datei, Anker (genau einmal), Ersatz, Teil des Namens der Prüfung, die rot werden muss]
$z = 'statistik-zaehler.php';
$c = 'collect.php';
$mutanten = [
    ['Alarm zählt nur die laufende Minute statt des Fensters', $z,
        'if (is_int($m) && $m <= $minute && $minute - $m < STATISTIK_DECKEL_FENSTER_MINUTEN) {',
        'if (is_int($m) && $m <= $minute && $minute - $m < 1) {',
        'je vier Minuten voll und eine frei'],
    ['Fenster eine Minute zu lang', $z,
        '$minute - $m < STATISTIK_DECKEL_FENSTER_MINUTEN) {', '$minute - $m <= STATISTIK_DECKEL_FENSTER_MINUTEN) {',
        'Rand des Fensters'],
    ['Schwelle der vollen Minuten entfällt', $z,
        'if (count($deckel[\'voll\']) >= STATISTIK_DECKEL_MINUTEN || $deckel[\'alarm\'] !== null) {', 'if (true) {',
        'ein einzelner Stoß über eine Minutengrenze'],
    ['laufender Alarm wird durch eine spätere volle Minute nicht verlängert', $z,
        '>= STATISTIK_DECKEL_MINUTEN || $deckel[\'alarm\'] !== null) {', '>= STATISTIK_DECKEL_MINUTEN) {',
        'ein Stoß 28 Minuten nach der Episode'],
    ['Alarm läuft nie ab', $z,
        'if ($alarm !== null && $minute - $alarm > STATISTIK_HALTEN_MINUTEN) {', 'if (false) {',
        'Gegenprobe ohne den Stoß'],
    ['Stand der Fassung davor wird nicht gelesen', $z,
        '} elseif (is_array($stand) && is_array($stand[\'deckel_lauf\'] ?? null)) {', '} elseif (false) {',
        'Deckel fünf Minuten am Stück erreicht, zuletzt vor einer Minute'],
    ['Zustand deckel wird nicht gemeldet', $z,
        'if (statistikDeckelStand($stand, $minute)[\'alarm\'] !== null) {', 'if (false) {',
        'health.php liest den Alarm aus der Zähldatei'],
    ['Tagesmenge wird nicht gemeldet', $z,
        'if (statistikMengeErreicht($stand, $jetzt)) {', 'if (false) {',
        'hebt den Tag über die Menge'],
    ['Tagesmenge gilt auch für den Vortag', $z,
        'if (($stand[\'tag\'] ?? null) === gmdate(\'Y-m-d\', $jetzt) && is_int(', 'if (is_int(',
        'am Folgetag um 00:10 "ok"'],
    ['Tagesmenge hält nicht über den Tageswechsel', $z,
        'return $her >= 0 && $her <= STATISTIK_HALTEN_MINUTEN;', 'return false;',
        'Menge kurz vor Mitternacht erreicht'],
    ['Tagesmenge hält ohne Ende', $z,
        'return $her >= 0 && $her <= STATISTIK_HALTEN_MINUTEN;', 'return $her >= 0;',
        'Menge kurz vor Mitternacht erreicht'],
    ['Tagesmenge geht dem Deckel vor', $z,
        'if (statistikStoerung($stand, $minute) !== null) {', 'if (statistikMengeErreicht($stand, $jetzt)) { return \'menge\'; } if (statistikStoerung($stand, $minute) !== null) {',
        'Rang: Menge erreicht'],
    ['gemerkter Ausfall wird nicht gemeldet', $z,
        'if (statistikStoerung($stand, $minute) !== null) {', 'if (false) {',
        'health.php zeigt dabei "statistik": "zaehler"'],
    ['gemerkter Ausfall läuft nie ab', $z,
        'if ($her < 0 || $her > STATISTIK_HALTEN_MINUTEN) {', 'if ($her < 0) {',
        'Ausfall vor 29 Minuten'],
    ['Ausfall wird nicht gemerkt', $c,
        'collectStoerungMerken(COLLECT_GESAMT_DATEI, $zaehlung[\'aus\'], $now);', '',
        'health.php zeigt dabei "statistik": "zaehler"'],
    ['gemerkter Ausfall geht beim nächsten Abruf verloren', $c,
        '$neu[\'stoerung\'] = $stoerung;', '',
        'eine andere Adresse wird währenddessen gezählt'],
    ['Protokoll nennt immer den Gesamtdeckel', $c,
        '($zaehlung[\'aus\'] === \'adresse\' ? \'Zähler des Anteils je Adresse\' : \'Zähler des Gesamtdeckels\')', '\'Zähler des Gesamtdeckels\'',
        'das Protokoll nennt den Zähler des Anteils je Adresse'],
    ['nicht zu öffnende Zähldatei der Adresse wird übergangen', $c,
        "    if (!\$fp) {\n        return ['aus' => 'adresse'];\n    }\n    if (!flock(\$fp, LOCK_EX)) {\n        fclose(\$fp);\n        return ['aus' => 'adresse'];\n    }",
        "    if (!\$fp) {\n        \$fp = fopen('php://memory', 'w+');\n    }",
        'Zähldatei einer Adresse nicht nutzbar: collect.php antwortet ihr 503'],
    ['Anteil wird vor dem Gesamtzähler gebucht (Ausfall)', $c,
        "        // Der Anteil bleibt unberührt: nichts gebucht, nichts geschrieben.\n",
        "        \$sekunden[\$jetzt] = (\$sekunden[\$jetzt] ?? 0) + \$anteil;\n        \$text = json_encode(['sekunden' => \$sekunden]);\n        rewind(\$fp); fwrite(\$fp, \$text); ftruncate(\$fp, strlen(\$text));\n",
        'Gesamtzähler aus, eine Adresse sendet ihren Stapel sechsmal'],
    ['Anteil bucht das Beanspruchte statt des Angenommenen', $c,
        "    if (\$erlaubt > 0) {\n        \$nachBehalten = 0;\n        foreach (\$behalten as \$i) {\n            \$nachBehalten += \$nachrangig[\$i] ? 1 : 0;\n        }\n"
            . '        $sekunden[$jetzt] = ($sekunden[$jetzt] ?? 0) + $erlaubt;',
        "    if (\$anteil > 0) {\n        \$nachBehalten = 0;\n        foreach (\$behalten as \$i) {\n            \$nachBehalten += \$nachrangig[\$i] ? 1 : 0;\n        }\n"
            . '        $sekunden[$jetzt] = ($sekunden[$jetzt] ?? 0) + $anteil;',
        'Gesamtdeckel voll, eine Adresse sendet 150 Ereignisse'],
    ['kein 429 bei aufgebrauchtem Anteil', $c,
        '$abgewiesen = $anteil === 0 && $wichtige > 0;', '$abgewiesen = false;',
        'der nächste Stapel bekommt 429'],
    ['429 auch für Stapel nur aus nachrangigen Ereignissen', $c,
        '$abgewiesen = $anteil === 0 && $wichtige > 0;', '$abgewiesen = $anteil === 0;',
        'weitere Herzschläge allein'],
    ['Anteil je Adresse gilt nicht', $c,
        '$frei = max(0, COLLECT_ADRESSE_JE_MINUTE - array_sum($sekunden));', '$frei = COLLECT_ADRESSE_JE_MINUTE;',
        'gespeichert ist genau ihr Anteil'],
    ['Grenze für nachrangige Ereignisse gilt nicht', $c,
        '$freiNach = max(0, COLLECT_ADRESSE_NACHRANGIG_JE_MINUTE - array_sum($nachSekunden));', '$freiNach = COLLECT_ADRESSE_JE_MINUTE;',
        'eine Adresse sendet 120 Herzschläge'],
    ['nachrangige Ereignisse werden nicht gebucht', $c,
        '$nachSekunden[$jetzt] = ($nachSekunden[$jetzt] ?? 0) + $nachBehalten;', '',
        'eine Adresse sendet 120 Herzschläge'],
    ['Reihenfolge des Stapels geht verloren', $c,
        "    sort(\$behalten);\n", "    rsort(\$behalten);\n",
        'in der Reihenfolge des Stapels'],
    ['Tagesmenge wird nicht fortgeschrieben', $c,
        '$neu[\'menge_zuletzt\'] = $minute;', '',
        'hebt den Tag über die Menge'],
    ['volle Minuten werden nicht fortgeschrieben', $c,
        '$neu[\'deckel_voll\'] = $deckelStand[\'voll\'];', '',
        'je vier Minuten voll und eine frei'],
    ['Alarm wird nicht fortgeschrieben', $c,
        '$neu[\'deckel_alarm\'] = $deckelStand[\'alarm\'];', '',
        'Episode von fünf vollen Minuten'],
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

function raeume(string $pfad): void {
    foreach (scandir($pfad) ?: [] as $eintrag) {
        if ($eintrag === '.' || $eintrag === '..') {
            continue;
        }
        is_dir($pfad . '/' . $eintrag) ? raeume($pfad . '/' . $eintrag) : unlink($pfad . '/' . $eintrag);
    }
    rmdir($pfad);
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
    $kopie = sys_get_temp_dir() . '/statistik-mutant-' . bin2hex(random_bytes(6));
    kopiere($apiQuelle, $kopie);
    file_put_contents($kopie . '/' . $datei, str_replace($anker, $ersatz, $quelltext));

    $rohre = [];
    $prozess = proc_open(
        array_merge([PHP_BINARY, __DIR__ . '/bereinigung_test.php'], $testArgumente, [$kopie]),
        [1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']],
        $rohre,
        null,
        ['BEREINIGUNG_AB_V' => '1', 'PATH' => getenv('PATH') ?: '/usr/local/bin:/usr/bin:/bin']
    );
    $ausgabe = stream_get_contents($rohre[1]);
    $exit = proc_close($prozess);
    raeume($kopie);

    $roteZeilen = array_values(array_filter(explode("\n", $ausgabe), fn($zeile) => strpos($zeile, 'ROT ') === 0));
    $zugehoerig = array_filter($roteZeilen, fn($zeile) => strpos($zeile, $pruefung) !== false);
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
