<?php
/**
 * Mutanten zur Anmeldung bei nicht lesbarer Datenbank (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$fang = "    } catch (\\Throwable \$e) {\n        // Die Prüfung selbst ist ausgefallen";
$ruecknahme = "        if (\$vorher !== null) {\n            @ftruncate(\$fp, \$vorher);\n        }\n";

return [
    ['Ausnahme der Prüfung wird nicht abgefangen',
        [['auth.php', $fang, "    } catch (\\Throwable \$e) {\n        throw \$e;\n        // Die Prüfung selbst ist ausgefallen"]],
        'sieben Anmeldungen einer Adresse'],
    ['ausgefallene Prüfung gilt als Fehlversuch (401 statt 503)',
        [['auth.php', "        error_log('Anmeldung nicht prüfbar: ' . get_class(\$e));\n        return ['defekt', 0];",
            "        error_log('Anmeldung nicht prüfbar: ' . get_class(\$e));\n        return ['falsch', 0];"]],
        'sieben Anmeldungen einer Adresse'],
    ['Stempel bleibt stehen, wenn die Prüfung ausfällt',
        [['auth.php', $ruecknahme, '']],
        'kein Versuch gezählt (Zähldatei ohne Stempel)'],
    ['Rücknahme des Stempels leert den Bestand',
        [['auth.php', '@ftruncate($fp, $vorher);', '@ftruncate($fp, 0);']],
        'Zähler mit vier Stempeln: 503, der Bestand ist unverändert'],
    ['Protokoll trägt den Fehlertext samt Spur',
        [['auth.php', "error_log('Anmeldung nicht prüfbar: ' . get_class(\$e));", "error_log('Anmeldung nicht prüfbar: ' . \$e);"]],
        'je Anmeldung eine Protokollzeile nur mit der Art des Fehlers'],
];
