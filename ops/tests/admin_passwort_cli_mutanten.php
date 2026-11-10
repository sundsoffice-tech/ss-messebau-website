<?php
/**
 * Mutantenlauf für das Werkzeug „Admin-Passwort neu setzen auf der Kommandozeile“:
 * Je entfernte Prüfung muss ops/tests/admin_passwort_cli_test.php rot werden.
 *
 * Aufruf im Container php:8.3-cli ohne Netz, Arbeitsverzeichnis Repo-Wurzel:
 *   php ops/tests/admin_passwort_cli_mutanten.php
 * Die Dateien werden je Mutant geändert und danach wiederhergestellt.
 */

$php = 'public/api/admin-passwort-setzen.php';
$sh = 'public/api/admin-passwort-setzen.sh';
$mutanten = [
    'M1 Netzschranke weg' => [$php, "if (PHP_SAPI !== 'cli') {", 'if (false) {'],
    'M2 Terminalprobe im Einstieg weg' => [$sh, 'if ! [ -t 0 ] || ! [ -t 1 ]; then', 'if false; then'],
    'M3 Terminalprobe im Werkzeug weg' => [$php, "if (!function_exists('stream_isatty') || !stream_isatty(STDOUT)) {", 'if (false) {'],
    'M4 Datenbankprobe weg' => [$php, 'if (!is_file(DB_PATH)) {', 'if (false) {'],
    'M5 Abbruch ohne Admin weg' => [$php, 'if (count($admins) === 0) {', 'if (false) {'],
    'M6 Vergleich der Eingaben weg' => [$php, 'if ($erstes !== $zweites) {', 'if (false) {'],
    'M7 Mindestlänge weg' => [$php, 'if (strlen($erstes) < PASSWORT_MIN_BYTES) {', 'if (false) {'],
    'M8 Höchstlänge weg' => [$php, 'if (strlen($erstes) > PASSWORT_MAX_BYTES) {', 'if (false) {'],
    'M9 Zeichenprüfung weg' => [$php, "if (preg_match('/^[\\x20-\\x7E]*\$/D', \$erstes) !== 1) {", 'if (false) {'],
    'M10 Anzeige bleibt an' => [$sh, "stty -echo 2>/dev/null\n", ":\n"],
    'M11 Gegenprobe der Anzeige weg' => [$sh, "  *' -echo '*) ;;\n  *)\n    anzeige_an\n    ende", "  *) ;;\n  unerreichbar)\n    anzeige_an\n    ende"],
    'M12 Namenswahl trifft jeden' => [$php, 'if (count($treffer) !== 1) {', 'if (count($treffer) === 0) { $treffer = admins($db); } if (false) {'],
    'M13 Änderung ohne Bindung an den Benutzer' => [$php, 'WHERE id = :id");', 'WHERE id = :id OR 1 = 1");'],
    'M14 Wiederherstellen der Anzeige weg' => [$sh, "trap 'anzeige_an' EXIT\n", ":\n"],
    'M15 Vorabprüfung des PHP weg' => [$sh, "if [ \"\$ANTWORT\" = 'cli neu db' ]; then", 'if true; then'],
];

$echt = [$php => file_get_contents($php), $sh => file_get_contents($sh)];
$gefangen = 0;
foreach ($mutanten as $name => [$datei, $alt, $neu]) {
    if (substr_count($echt[$datei], $alt) !== 1) {
        echo "ANKER FEHLT: $name\n";
        continue;
    }
    file_put_contents($datei, str_replace($alt, $neu, $echt[$datei]));
    $aus = [];
    exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
    $rote = array_values(array_filter($aus, static fn (string $z): bool => str_contains($z, 'ROT')));
    if ($code !== 0) {
        $gefangen++;
    }
    echo ($code !== 0 ? 'gefangen ' : 'NICHT GEFANGEN ') . $name . ' (' . count($rote) . ' rot' . ($rote ? ': ' . trim(substr($rote[0], 6, 70)) : '') . ")\n";
    file_put_contents($datei, $echt[$datei]);
}
$aus = [];
exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
echo 'Kopf wieder: ' . end($aus) . "\n$gefangen von " . count($mutanten) . " Mutanten gefangen\n";
exit($gefangen === count($mutanten) && $code === 0 ? 0 : 1);
