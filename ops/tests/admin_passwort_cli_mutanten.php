<?php
/**
 * Mutantenlauf für das Werkzeug „Admin-Passwort neu setzen auf der Kommandozeile“:
 * Je entfernte Prüfung muss ops/tests/admin_passwort_cli_test.php rot werden.
 *
 * Aufruf im Container php:8.3-cli ohne Netz, Arbeitsverzeichnis Repo-Wurzel:
 *   php ops/tests/admin_passwort_cli_mutanten.php
 *
 * Der Lauf arbeitet in einer Kopie unter dem Temp-Ordner; die Dateien des Repos
 * bleiben unberührt, auch wenn er abbricht. Gefangen heißt: Der Test endet mit 1
 * und nennt mindestens eine rote Prüfung (bei manchen Mutanten eine bestimmte).
 */

$php = 'public/api/admin-passwort-setzen.php';
$sh = 'public/api/admin-passwort-setzen.sh';
$anzeigeBleibtAn = [$sh, "stty -echo 2>/dev/null\n", ":\n"];
$ohneGegenprobe = [$sh, "  *' -echo '*) ;;\n  *)\n    anzeige_an\n    ende", "  *) ;;\n  unerreichbar)\n    anzeige_an\n    ende"];

// Name => [Liste der Ersetzungen, verlangter Ausschnitt einer roten Zeile oder '']
$mutanten = [
    'M1 Netzschranke weg' => [[[$php, "if (PHP_SAPI !== 'cli') {", 'if (false) {']], 'Antwort 404'],
    'M2 Terminalprobe im Einstieg weg' => [[[$sh, 'if ! [ -t 0 ] || ! [ -t 1 ]; then', 'if false; then']], ''],
    'M3 Terminalprobe der Ausgabe im Werkzeug weg' => [[[$php, "if (!function_exists('stream_isatty') || !stream_isatty(STDOUT)) {", 'if (false) {']], 'Ausgabe in ein Rohr'],
    'M4 Datenbankprobe weg' => [[[$php, 'if (!is_file(DB_PATH)) {', 'if (false) {']], 'keine Datenbank'],
    'M5 Abbruch ohne Admin weg' => [[[$php, 'if (count($admins) === 0) {', 'if (false) {']], 'kein Admin'],
    'M6 Vergleich der Eingaben weg' => [[[$php, 'if ($erstes !== $zweites) {', 'if (false) {']], ''],
    'M7 Mindestlänge weg' => [[[$php, 'if (strlen($erstes) < PASSWORT_MIN_BYTES) {', 'if (false) {']], '11 Byte'],
    'M8 Höchstlänge weg' => [[[$php, 'if (strlen($erstes) > PASSWORT_MAX_BYTES) {', 'if (false) {']], '73 Byte'],
    'M9 Zeichenprüfung weg' => [[[$php, "if (preg_match('/^[\\x20-\\x7E]*\$/D', \$erstes) !== 1) {", 'if (false) {']], 'Umlaut'],
    'M10 Anzeige bleibt an' => [[$anzeigeBleibtAn], ''],
    'M11 Gegenprobe der Anzeige weg' => [[$ohneGegenprobe], 'Passwort wird nicht abgefragt'],
    'M12 Namenswahl trifft jeden' => [[[$php, 'if (count($treffer) !== 1) {', 'if (count($treffer) === 0) { $treffer = admins($db); } if (false) {']], 'unbekannter Name'],
    'M13 Änderung ohne Bindung an den Benutzer' => [[[$php, 'WHERE id = :id");', 'WHERE id = :id OR 1 = 1");']], ''],
    'M14 Wiederherstellen der Anzeige weg' => [[[$sh, "trap 'anzeige_an' EXIT\n", ":\n"]], 'Anzeige der Eingabe ist wieder an'],
    'M15 Vorabprüfung des PHP weg' => [[[$sh, "if [ \"\$ANTWORT\" = 'cli neu db' ]; then", 'if true; then']], ''],
    'M16 Werkzeug liest auch vom Terminal' => [[[$php, 'if (stream_isatty(STDIN)) {', 'if (false) {']], 'Werkzeug direkt am Terminal'],
    // Der Zeuge für die verdeckte Eingabe selbst: Mit beiden Rückbauten zugleich wird getippt, und es ist zu sehen.
    'M17 Anzeige bleibt an und keine Gegenprobe' => [[$anzeigeBleibtAn, $ohneGegenprobe], 'Passwort steht nicht auf dem Schirm'],
    'M18 Shell deutet Rückstriche im Passwort' => [[[$sh, 'IFS= read -r ERSTES', 'IFS= read ERSTES'], [$sh, 'IFS= read -r ZWEITES', 'IFS= read ZWEITES']], 'genau das getippte Passwort'],
    'M19 Shell kürzt Leerzeichen am Rand' => [[[$sh, 'IFS= read -r ERSTES', 'read -r ERSTES'], [$sh, 'IFS= read -r ZWEITES', 'read -r ZWEITES']], 'genau das getippte Passwort'],
];

$kopie = sys_get_temp_dir() . '/apc_mutanten_' . bin2hex(random_bytes(6));
mkdir($kopie . '/public/api', 0755, true);
mkdir($kopie . '/ops/tests', 0755, true);
foreach (['admin-passwort-setzen.php', 'admin-passwort-setzen.sh', 'config.php', 'db.php'] as $datei) {
    copy('public/api/' . $datei, $kopie . '/public/api/' . $datei);
}
copy('ops/tests/admin_passwort_cli_test.php', $kopie . '/ops/tests/admin_passwort_cli_test.php');
chdir($kopie);

$echt = [$php => file_get_contents($php), $sh => file_get_contents($sh)];
$gefangen = 0;
foreach ($mutanten as $name => [$ersetzungen, $muss]) {
    $stand = $echt;
    $ankerFehlt = false;
    foreach ($ersetzungen as [$datei, $alt, $neu]) {
        if (substr_count($stand[$datei], $alt) !== 1) {
            $ankerFehlt = true;
            break;
        }
        $stand[$datei] = str_replace($alt, $neu, $stand[$datei]);
    }
    if ($ankerFehlt) {
        echo "ANKER FEHLT: $name\n";
        continue;
    }
    foreach ($stand as $datei => $inhalt) {
        file_put_contents($datei, $inhalt);
    }
    $aus = [];
    exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
    $rote = array_values(array_filter($aus, static fn (string $z): bool => str_contains($z, 'ROT')));
    $trifft = $muss === '' || count(array_filter($rote, static fn (string $z): bool => str_contains($z, $muss))) > 0;
    $ok = $code === 1 && count($rote) > 0 && $trifft;
    if ($ok) {
        $gefangen++;
    }
    echo ($ok ? 'gefangen ' : 'NICHT GEFANGEN ') . $name . ' (Ende ' . $code . ', ' . count($rote) . ' rot'
        . ($muss === '' ? '' : ', verlangt „' . $muss . '“: ' . ($trifft ? 'ja' : 'nein'))
        . ($rote ? ', erste: ' . trim(substr($rote[0], 6, 60)) : '') . ")\n";
    foreach ($echt as $datei => $inhalt) {
        file_put_contents($datei, $inhalt);
    }
}
$aus = [];
exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
echo 'Kopie am Ende unverändert: ' . end($aus) . "\n$gefangen von " . count($mutanten) . " Mutanten gefangen\n";
exit($gefangen === count($mutanten) && $code === 0 ? 0 : 1);
