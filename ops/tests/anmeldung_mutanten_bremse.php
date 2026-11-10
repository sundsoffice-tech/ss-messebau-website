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
        [['auth.php', '$stempel = $gelungen ? [] : array_merge($stempel, [$jetzt]);', '$stempel = $gelungen ? $stempel : array_merge($stempel, [$jetzt]);']],
        'nach erfolgreicher Anmeldung zählt die Bremse neu'],
    ['unvollständige Eingabe zählt als Fehlversuch',
        [['auth.php', "                \$eingabeFehler = 'Benutzername und Passwort erforderlich';\n                return null;", '                return false;']],
        'sieben leere oder unvollständige Eingaben'],
    ['alte Stempel verfallen nicht',
        [['auth.php', 'is_int($ts) && ($jetzt - $ts) < $fenster', 'is_int($ts)']],
        'fünf Stempel älter als 15 Minuten sperren nicht'],
    ['Wartezeit wird nicht aus dem ältesten Stempel gerechnet',
        [['auth.php', "return ['voll', \$fenster - (\$jetzt - min(\$stempel))];", "return ['voll', \$fenster];"]],
        'fünf Stempel von vor zehn Minuten: 429 mit "5 Minuten"'],
];
