<?php
/**
 * Mutanten zur Ersteinrichtung (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['setup prüft den Schalter nicht',
        [['auth.php', "    if (!SETUP_ERLAUBT) {\n        http_response_code(403);", "    if (false) {\n        http_response_code(403);"]],
        'Datenbank fehlt: setup 403 statt eines neuen Admins'],
    ['check_setup verrät trotz Sperre die leere Tabelle',
        [['auth.php', "    if (!SETUP_ERLAUBT) {\n        // Gesperrt: Die Anmeldeseite", "    if (false) {\n        // Gesperrt: Die Anmeldeseite"]],
        'gesperrt und Tabelle leer: check_setup meldet needsSetup false'],
    ['Schalter steht im ausgelieferten Stand offen',
        [['auth.php', 'const SETUP_ERLAUBT = false;', 'const SETUP_ERLAUBT = true;']],
        'ausgelieferter Stand: Schalter steht auf gesperrt'],
    ['bei offenem Schalter darf ein zweiter Admin eingerichtet werden',
        [['auth.php', "    if (\$count > 0) {\n        http_response_code(403);", "    if (false) {\n        http_response_code(403);"]],
        'offen, zweite Einrichtung: 403'],
];
