<?php
/**
 * Fälle zur Eingabe der Anmeldung (eingebunden von ops/tests/anmeldung_test.php).
 * Benutzername und Passwort gelten nur als Text; alles andere antwortet wie eine fehlende Eingabe
 * mit 400 und wird nicht gezählt.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/anmeldung_bremse_helfer.php';

echo "\n== Fall E1: Eingabefelder, die kein Text sind ==\n";
$u = starte($apiQuelle);
$fehlt = json_encode(['error' => 'Benutzername und Passwort erforderlich']);
$ruempfe = [
    'username als Liste' => '{"username":["chef"],"password":"' . ALT . '"}',
    'password als Liste' => '{"username":"chef","password":["' . ALT . '"]}',
    'beide als Objekt' => '{"username":{"a":"chef"},"password":{"a":"x"}}',
    'username als Zahl' => '{"username":12345,"password":"' . ALT . '"}',
    'password als Zahl' => '{"username":"chef","password":1234567890123}',
    'password als Wahrheitswert' => '{"username":"chef","password":true}',
    'Rumpf als Text' => '"chef"',
    'Rumpf als Zahl' => '42',
    'Rumpf als Liste von Texten' => '["chef","' . ALT . '"]',
];
$falsch = [];
foreach ($ruempfe as $name => $rumpf) {
    $a = anfrage($u, 'POST', '/auth.php?action=login', $rumpf, [], 20, '127.0.9.70');
    if ($a['status'] !== 400 || trim($a['text']) !== $fehlt) {
        $falsch[] = $name . ': ' . kurz($a);
    }
}
pruefe('neun Eingaben, deren Felder kein Text sind: je 400 mit der Meldung der fehlenden Eingabe, ohne Fehlertext',
    $falsch === [], implode(' | ', array_slice($falsch, 0, 3)));
pruefe('diese Eingaben sind nicht gezählt (Zähldatei ohne Stempel)', stempelZahl(bremsdatei($u, '127.0.9.70')) === 0,
    (string)stempelZahl(bremsdatei($u, '127.0.9.70')));
$a = anmelden($u, 'chef', ALT, '127.0.9.70');
pruefe('Gegenprobe: dieselbe Adresse meldet sich danach mit Text-Feldern an (200)', $a['status'] === 200, kurz($a));
$codes = folge($u, '127.0.9.71', array_fill(0, 5, 'falsch-falsch'));
$a = anfrage($u, 'POST', '/auth.php?action=login', '{"username":["chef"],"password":["x"]}', [], 20, '127.0.9.71');
pruefe('gebremste Adresse mit Feldern als Liste: 429 (die Bremse antwortet weiter vor der Eingabeprüfung)',
    $codes === [401, 401, 401, 401, 401] && $a['status'] === 429, implode(',', $codes) . ' / ' . kurz($a));
$a = anmelden($u, ' chef ', ALT, '127.0.9.72');
pruefe('Leerzeichen um den Benutzernamen werden weiter entfernt (200)', $a['status'] === 200, kurz($a));
