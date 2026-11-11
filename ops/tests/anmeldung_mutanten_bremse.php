<?php
/**
 * Mutanten zur Anmeldebremse (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['Anmeldebremse ohne Sperre',
        [['auth.php', 'if (!flock($fp, LOCK_EX)) {', 'if (false) {']],
        'Zähldatei von außen gesperrt: die Anmeldung wartet'],
    ['Anmeldebremse lässt alles durch',
        [['auth.php', 'if (count($stempel) >= $max) {', 'if (false) {']],
        '6. Fehlversuch derselben Adresse: 429'],
    ['Zähler nicht zu führen: der Versuch läuft trotzdem',
        [['auth.php', "if (\$stand === 'defekt') {", 'if (false) {']],
        'data/ nicht beschreibbar: falsches Passwort 503'],
    ['Zähler nicht zu öffnen: die Prüfung läuft ungezählt',
        [['auth.php', "    if (\$fp === false) {\n        return ['defekt', 0];\n    }\n    try {",
            "    if (\$fp === false) {\n        return [\$pruefung() ? 'ok' : 'falsch', 0];\n    }\n    try {"]],
        'data/ nicht beschreibbar: auch das richtige Passwort 503, und die Sitzung dazu'],
    ['Erfolg leert den Zähler nicht',
        [['auth.php', "        @ftruncate(\$fp, 0);\n        return ['ok', 0];", "        return ['ok', 0];"]],
        'nach erfolgreicher Anmeldung zählt die Bremse neu'],
    ['unvollständige Eingabe zählt als Fehlversuch',
        [['auth.php', '$windowSeconds, $eingabeFehler === null,', '$windowSeconds, true,']],
        'sieben leere oder unvollständige Eingaben'],
    ['alte Stempel verfallen nicht',
        [['auth.php', 'fn($ts) => abs($jetzt - $ts) < $fenster', 'fn($ts) => true']],
        'fünf Stempel älter als 15 Minuten sperren nicht'],
    ['Wartezeit wird nicht aus dem ältesten Stempel gerechnet',
        [['auth.php', "return ['voll', \$fenster - (\$jetzt - min(\$stempel))];", "return ['voll', \$fenster];"]],
        'fünf Stempel von vor zehn Minuten: 429 mit "5 Minuten"'],
    ['Sperre nur geteilt (LOCK_SH)',
        [['auth.php', 'if (!flock($fp, LOCK_EX)) {', 'if (!flock($fp, LOCK_SH)) {']],
        'Zähldatei von außen geteilt gesperrt: die Anmeldung wartet (keine Antwort in 2 s), weil der Server exklusiv sperrt'],
    ['geteilt lesen, erst zum Stempeln exklusiv sperren',
        [['auth.php', 'if (!flock($fp, LOCK_EX)) {', 'if (!flock($fp, LOCK_SH)) {'],
         ['auth.php', "        // Erst zählen, dann prüfen.\n        \$vorher = bremseStempeln(",
            "        // Erst zählen, dann prüfen.\n        flock(\$fp, LOCK_EX);\n        \$vorher = bremseStempeln("]],
        'während des Wartens füllt der Test die Zähldatei auf fünf Stempel'],
    ['Sperre wird vor dem Schreiben des Stempels freigegeben',
        [['auth.php', "        // Erst zählen, dann prüfen.\n        \$vorher = bremseStempeln(",
            "        // Erst zählen, dann prüfen.\n        flock(\$fp, LOCK_UN);\n        usleep(200000);\n        \$vorher = bremseStempeln("]],
        '20 gleichzeitige Fehlversuche einer Adresse: genau fünf 401, der Rest 429'],
    ['Wartezeit wird vom jüngsten statt vom ältesten Stempel gerechnet',
        [['auth.php', "return ['voll', \$fenster - (\$jetzt - min(\$stempel))];", "return ['voll', \$fenster - (\$jetzt - max(\$stempel))];"]],
        'gemischte Stempel (10 bis 800 s alt, ungeordnet)'],
    ['Stempel gilt ein Fenster einschließlich der Grenze',
        [['auth.php', 'fn($ts) => abs($jetzt - $ts) < $fenster', 'fn($ts) => abs($jetzt - $ts) <= $fenster']],
        'fünf Stempel genau 900 s alt sind verfallen'],
    ['Stempel verfällt eine Sekunde zu früh',
        [['auth.php', 'fn($ts) => abs($jetzt - $ts) < $fenster', 'fn($ts) => abs($jetzt - $ts) < $fenster - 1']],
        'fünf Stempel genau 899 s alt zählen noch'],
    ['zehn Ziffern zählen auch mitten in einer längeren Folge',
        [['auth.php', 'preg_match_all(\'/(?<!\d)\d{10}(?!\d)/\', $inhalt, $treffer);', 'preg_match_all(\'/\d{10}/\', $inhalt, $treffer);']],
        'fünf Folgen von 13 Ziffern am Stück'],
    ['der wartende Versuch zählt doppelt',
        [['auth.php', "        if (!\$pruefung()) {\n            return ['falsch', 0];",
            "        if (!\$pruefung()) {\n            fwrite(\$fp, \$jetzt . chr(10));\n            return ['falsch', 0];"]],
        'nach der Freigabe der Sperre steht genau ein Stempel'],
];
