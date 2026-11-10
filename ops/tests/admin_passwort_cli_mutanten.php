<?php
// Mutantenlauf für admin-passwort-setzen.php: je entfernte Prüfung muss der Test rot werden.
$datei = 'public/api/admin-passwort-setzen.php';
$echt = file_get_contents($datei);
$mutanten = [
  'M1 Netzriegel weg' => ["if (PHP_SAPI !== 'cli') {", "if (false) {"],
  'M2 Terminalprobe weg' => ["if (!function_exists('posix_isatty') || !posix_isatty(STDIN) || !posix_isatty(STDOUT)) {", "if (false) {"],
  'M3 Datenbankprobe weg' => ["if (!is_file(DB_PATH)) {", "if (false) {"],
  'M4 Abbruch ohne Admin weg' => ["if (count(\$admins) === 0) {", "if (false) {"],
  'M5 Vergleich der Eingaben weg' => ["if (\$erstes !== \$zweites) {", "if (false) {"],
  'M6 Mindestlaenge weg' => ["if (strlen(\$erstes) < PASSWORT_MIN_BYTES) {", "if (false) {"],
  'M7 Hoechstlaenge weg' => ["if (strlen(\$erstes) > PASSWORT_MAX_BYTES) {", "if (false) {"],
  'M8 Anzeige bleibt an' => ["shell_exec('stty -echo 2>/dev/null');", "/* aus */"],
  'M9 Namenswahl trifft immer den ersten' => ["if (count(\$treffer) !== 1) {\n            abbruch('Diesen Benutzernamen gibt es nicht.');\n        }\n        \$admin = \$treffer[0];", "\$admin = \$admins[0];"],
];
$rot = 0;
foreach ($mutanten as $name => [$alt, $neu]) {
  if (substr_count($echt, $alt) !== 1) { echo "ANKER FEHLT: $name\n"; continue; }
  file_put_contents($datei, str_replace($alt, $neu, $echt));
  $aus = []; exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
  $rote = array_values(array_filter($aus, fn($z) => str_contains($z, 'ROT')));
  if ($code !== 0) { $rot++; }
  echo ($code !== 0 ? 'gefangen ' : 'NICHT GEFANGEN ') . $name . ' (' . count($rote) . ' rot' . ($rote ? ': ' . trim(substr($rote[0], 6, 60)) : '') . ")\n";
  file_put_contents($datei, $echt);
}
$aus = []; exec('php ops/tests/admin_passwort_cli_test.php 2>&1', $aus, $code);
echo "Kopf wieder: " . end($aus) . "\n$rot von " . count($mutanten) . " Mutanten gefangen\n";
