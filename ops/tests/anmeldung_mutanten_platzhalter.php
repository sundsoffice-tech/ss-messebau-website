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
    ['Werkzeug der Kommandozeile mit PHP-Vorgabe statt fester Kosten',
        [['admin-passwort-setzen.php', "password_hash(\$passwort, PASSWORD_BCRYPT, ['cost' => 10]);", "password_hash(\$passwort, PASSWORD_BCRYPT);"]],
        'jeder password_hash()-Aufruf in auth.php und admin-passwort-setzen.php nennt die Kosten'],
    ['Werkzeug der Kommandozeile mit anderen Kosten',
        [['admin-passwort-setzen.php', "['cost' => 10]", "['cost' => 12]"]],
        'das Werkzeug der Kommandozeile erzeugt Hashes mit denselben Kosten'],
    ['Ersteinrichtung mit PHP-Vorgabe',
        [['auth.php', "\$hash = password_hash(\$password, PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN]);", "\$hash = password_hash(\$password, PASSWORD_BCRYPT);"]],
        'jeder password_hash()-Aufruf in auth.php und admin-passwort-setzen.php nennt die Kosten'],
    ['keine Neuberechnung bei anderen Kosten',
        [['auth.php', "if (password_needs_rehash((string)\$user['password_hash'], PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN])) {", "if (false) {"]],
        'danach trägt der gespeicherte Hash die Kosten BCRYPT_KOSTEN'],
    ['Neuberechnung bei jeder Anmeldung',
        [['auth.php', "if (password_needs_rehash((string)\$user['password_hash'], PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN])) {", "if (true) {"]],
        'Anmeldung mit passenden Kosten: 200 und der Hash bleibt unverändert'],
    ['Neuberechnung nur nach oben',
        [['auth.php', "if (password_needs_rehash((string)\$user['password_hash'], PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN])) {",
            "if ((password_get_info((string)\$user['password_hash'])['options']['cost'] ?? 0) < BCRYPT_KOSTEN) {"]],
        // Höhere Kosten bleiben dann stehen; das zeigt der erste Schritt von P2.
        'danach trägt der gespeicherte Hash die Kosten BCRYPT_KOSTEN'],
    ['Neuberechnung nur nach unten',
        [['auth.php', "if (password_needs_rehash((string)\$user['password_hash'], PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN])) {",
            "if ((password_get_info((string)\$user['password_hash'])['options']['cost'] ?? 0) > BCRYPT_KOSTEN) {"]],
        'auch geringere Kosten werden auf BCRYPT_KOSTEN angehoben'],
    ['Sitzung behält nach der Neuberechnung die Marke des alten Hashs',
        [['auth.php', "\$user['password_hash'] = \$neuerHash;", ""]],
        'Sitzung der Anmeldung mit Neuberechnung gilt beim nächsten Aufruf'],
    ['Neuberechnung schreibt ohne Vergleich mit dem gelesenen Hash',
        [['auth.php', "WHERE id = :id AND password_hash = :alt\");", "WHERE id = :id AND :alt = :alt\");"]],
        'gleichzeitiger Passworttausch: der neue Hash bleibt stehen'],
    ['Schreibfehler bei der Neuberechnung bricht die Anmeldung ab',
        [['auth.php', "error_log('Anmeldung: Neuberechnung des Passwort-Hashs gescheitert (' . get_class(\$e) . ')');", "throw \$e;"]],
        'Schreibfehler bei der Neuberechnung: Anmeldung 200'],
    ['Neuberechnung schreibt einen falschen Hash',
        [['auth.php', "\$neuerHash = password_hash(\$password, PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN]);",
            "\$neuerHash = password_hash(\$password . 'x', PASSWORD_BCRYPT, ['cost' => BCRYPT_KOSTEN]);"]],
        'danach trägt der gespeicherte Hash die Kosten BCRYPT_KOSTEN und passt zum Passwort'],
];
