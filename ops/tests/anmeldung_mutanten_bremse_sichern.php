<?php
/**
 * Mutanten zum Sichern des Stempels (fsync) in der Anmeldebremse (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['Ergebnis von fsync zählt nicht',
        [['auth.php', ' || !bremseGesichert($fp)) {', ') {']],
        'fsync scheitert: falsches und richtiges Passwort je 503'],
    ['fsync wird gar nicht aufgerufen',
        [['auth.php', "return !function_exists('fsync') || @fsync(\$fp);", "return !function_exists('fsync') || true;"]],
        'der Prüfling ruft fsync() genau einmal auf'],
    ['PHP ohne fsync wird abgewiesen statt wie bisher bedient',
        [['auth.php', "return !function_exists('fsync') || @fsync(\$fp);", "return function_exists('fsync') && @fsync(\$fp);"]],
        'PHP ohne fsync: die Anmeldung arbeitet wie bisher'],
];
