<?php
/**
 * Mutanten zur Zähldatei der Anmeldebremse (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$erstZaehlen = "        \$vorher = bremseStempeln(\$fp, \$inhalt, \$stempel, \$jetzt);\n"
    . "        if (\$vorher === null) {\n            return ['defekt', 0];\n        }\n"
    . "        if (!\$pruefung()) {\n            return ['falsch', 0];\n        }\n";
$erstPruefen = "        \$gelungen = \$pruefung();\n"
    . "        \$vorher = bremseStempeln(\$fp, \$inhalt, \$stempel, \$jetzt);\n"
    . "        if (\$vorher === null) {\n            return ['defekt', 0];\n        }\n"
    . "        if (!\$gelungen) {\n            return ['falsch', 0];\n        }\n";

return [
    ['erst prüfen, dann zählen',
        [['auth.php', $erstZaehlen, $erstPruefen]],
        'bremseVersuch direkt, leerer Zähler: Stand defekt, die Prüfung lief nicht'],
    ['scheitert das Zählen, wird trotzdem geprüft',
        [['auth.php', 'if ($vorher === null) {', 'if (false) {']],
        'Platte voll, leerer Zähler: richtiges Passwort ebenfalls 503'],
    ['bei leerem Zähler wird ohne Stempel geprüft',
        [['auth.php', '$vorher = bremseStempeln($fp, $inhalt, $stempel, $jetzt);', '$vorher = $stempel === [] ? 0 : bremseStempeln($fp, $inhalt, $stempel, $jetzt);']],
        'Platte voll, leerer Zähler: falsches Passwort 503'],
    ['gescheitertes Schreiben leert den Bestand',
        [['auth.php', '@ftruncate($fp, $laenge); // einen abgerissenen Rest wieder abschneiden', '@ftruncate($fp, 0);']],
        'Platte voll, Zähler mit zwei Stempeln: der Bestand ist unverändert'],
    ['abgerissener Rest bleibt in der Datei',
        [['auth.php', '@ftruncate($fp, $laenge); // einen abgerissenen Rest wieder abschneiden', '']],
        'der Stempel passt nur zum Teil in die Datei: 503'],
    ['nur ein Teil des Stempels geschrieben gilt als gezählt',
        [['auth.php', '@fwrite($fp, $zeile) !== strlen($zeile)', '@fwrite($fp, $zeile) === false']],
        'der Stempel passt nur zum Teil in die Datei: 503'],
    ['kein Trennzeichen nach einem abgerissenen Rest',
        [['auth.php', '$trenner = ($laenge > 0 && substr($inhalt, -1) !== "\n") ? "\n" : \'\';', '$trenner = \'\';']],
        'Zähldatei endet mit einem abgerissenen Rest'],
    ['Zähldatei im früheren Format wird nicht gelesen',
        [['auth.php', 'preg_match_all(\'/(?<!\d)\d{10}(?!\d)/\', $inhalt, $treffer);', 'preg_match_all(\'/^\d{10}$/m\', $inhalt, $treffer);']],
        'Zähldatei im früheren Format (JSON-Liste)'],
    ['Kürzen der gewachsenen Datei verliert die gültigen Stempel',
        [['auth.php', '$kopf = implode("\n", $gueltig) . "\n";', '$kopf = \'\';']],
        'Zähldatei über 4096 Byte'],
    ['gewachsene Datei wird nicht gekürzt',
        [['auth.php', '} elseif ($laenge > BREMSE_DATEI_MAX) {', '} elseif (false) {']],
        'Zähldatei über 4096 Byte'],
    ['Datei nur mit verfallenen Stempeln wächst weiter',
        [['auth.php', 'if ($gueltig === []) {', 'if (false) {']],
        'Zähldatei nur mit verfallenen Stempeln'],
];
