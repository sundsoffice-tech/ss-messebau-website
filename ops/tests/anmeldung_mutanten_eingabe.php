<?php
/**
 * Mutanten zur Eingabe der Anmeldung (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['Benutzername muss kein Text sein',
        [['auth.php', "\$username = is_string(\$input['username'] ?? null) ? trim(\$input['username']) : '';", "\$username = trim(\$input['username'] ?? '');"]],
        'neun Eingaben, deren Felder kein Text sind'],
    ['Passwort muss kein Text sein',
        [['auth.php', "\$password = is_string(\$input['password'] ?? null) ? \$input['password'] : '';", "\$password = \$input['password'] ?? '';"]],
        'neun Eingaben, deren Felder kein Text sind'],
];
