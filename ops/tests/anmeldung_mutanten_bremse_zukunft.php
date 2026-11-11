<?php
/**
 * Mutanten zu Stempeln aus der Zukunft (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['Stempel aus der Zukunft zählen ohne Grenze',
        [['auth.php', 'fn($ts) => abs($jetzt - $ts) < $fenster', 'fn($ts) => ($jetzt - $ts) < $fenster']],
        'fünf Stempel 3600 s voraus sperren nicht'],
    ['Stempel aus der Zukunft zählen nie',
        [['auth.php', 'fn($ts) => abs($jetzt - $ts) < $fenster', 'fn($ts) => $ts <= $jetzt && ($jetzt - $ts) < $fenster']],
        'fünf Stempel 890 s voraus (weniger als ein Fenster) zählen: 429'],
];
