<?php
/**
 * Mutanten zur Antwortzeit bei unbekanntem Benutzernamen (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['unbekannter Benutzername kehrt ohne bcrypt zurück',
        [['auth.php', "\$stimmt = password_verify(\$password, \$zeile ? (string)\$zeile['password_hash'] : ANMELDUNG_PLATZHALTER_HASH);",
            "\$stimmt = \$zeile && password_verify(\$password, (string)\$zeile['password_hash']);"]],
        'unbekannter Benutzername antwortet etwa so langsam'],
    ['Platzhalter mit geringeren Kosten',
        [['auth.php', "const ANMELDUNG_PLATZHALTER_HASH = '\$2y\$10\$", "const ANMELDUNG_PLATZHALTER_HASH = '\$2y\$04\$"]],
        'der Platzhalter ist ein bcrypt-Hash mit den Kosten'],
];
