<?php
/**
 * Mutanten zum Feld data_writable von health.php (eingebunden von ops/tests/anmeldung_mutanten.php).
 * Form: [Name, [[Datei, Anker (genau einmal), Ersatz], ...], Teil des Namens der Prüfung, die rot werden muss]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

return [
    ['Schreibprobe: Anlegen der Datei genügt',
        [['health.php', 'if (@fwrite($probe, $probeZeile) === strlen($probeZeile) && @fflush($probe)) {', 'if (true) {']],
        'Speicher voll: data_writable error und status degraded'],
    ['data_writable prüft wieder nur das Recht am Ordner',
        [['health.php', "\$checks['data_writable'] = 'error';\ntry {", "\$checks['data_writable'] = is_writable(\$dataDir) ? 'ok' : 'error';\nif (false) try {"]],
        'Speicher voll: data_writable error und status degraded'],
    ['Probe-Datei bleibt liegen',
        [['health.php', '        @unlink($probeDatei);', '']],
        'nach 31 Abrufen liegt keine Probe-Datei unter data/'],
    ['data_writable error lässt status auf ok',
        [['health.php', "if (\$checks['data_writable'] !== 'ok') {\n    \$status = 'degraded';", "if (\$checks['data_writable'] !== 'ok') {\n    \$status = \$status;"]],
        'Speicher voll: data_writable error und status degraded'],
];
