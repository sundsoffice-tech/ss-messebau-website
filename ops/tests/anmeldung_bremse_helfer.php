<?php
/**
 * Helfer für die Fälle zur Anmeldebremse (anmeldung_faelle_bremse.php, anmeldung_faelle_bremse_zaehler.php).
 * Eingebunden von dort; die allgemeinen Helfer und Zähler stehen in anmeldung_test.php.
 */

if (PHP_SAPI !== 'cli' || !function_exists('starte')) {
    http_response_code(404);
    exit;
}

define('TEXT_BREMSE_503', json_encode(['error' => 'Anmeldung derzeit nicht möglich']));

// Kleinst-Dateisystem für den Fall "Platte voll": docker run --tmpfs /kleinfs:size=256k,mode=1777
const KLEINFS = '/kleinfs';

function bremsdatei(array $u, string $adresse): string {
    return $u['daten'] . '/login_limit_' . md5($adresse) . '.json';
}

/** Zahl der Stempel in einer Zähldatei (zehn Ziffern am Stück, wie der Prüfling sie liest). */
function stempelZahl(string $datei): int {
    return (int)preg_match_all('/(?<!\d)\d{10}(?!\d)/', (string)@file_get_contents($datei));
}

function groesse(string $datei): int {
    clearstatcache(true, $datei);
    return (int)filesize($datei);
}

/** Status einer Folge von Anmeldungen von einer Adresse. */
function folge(array $u, string $adresse, array $passwoerter): array {
    $status = [];
    foreach ($passwoerter as $passwort) {
        $status[] = anmelden($u, 'chef', $passwort, $adresse)['status'];
    }
    return $status;
}

/** Frischer Ordner auf dem Kleinst-Dateisystem, oder null, wenn es fehlt. Reste früherer Läufe werden vorher entfernt. */
function kleinOrdner(): ?string {
    if (!is_dir(KLEINFS) || !is_writable(KLEINFS)) {
        return null;
    }
    foreach (glob(KLEINFS . '/anm-*') ?: [] as $alt) {
        kleinWeg($alt);
    }
    $ordner = KLEINFS . '/anm-' . bin2hex(random_bytes(4));
    return @mkdir($ordner, 0755) ? $ordner : null;
}

/** Entfernt einen Ordner dieses Tests vom Kleinst-Dateisystem samt Inhalt. */
function kleinWeg(string $ordner): void {
    if (strncmp($ordner, KLEINFS . '/anm-', strlen(KLEINFS) + 5) === 0) {
        exec('rm -rf ' . escapeshellarg($ordner));
    }
}

/** Füllt das Kleinst-Dateisystem, bis keine Seite mehr frei ist. Rückgabe: Pfad der Fülldatei. */
function fuelle(string $ordner): string {
    $pfad = $ordner . '/fuellung';
    $fp = fopen($pfad, 'w');
    $block = str_repeat('x', 4096);
    for ($i = 0; $i < 100000; $i++) {
        if (@fwrite($fp, $block) !== 4096) {
            break;
        }
    }
    fclose($fp);
    return $pfad;
}

/** Inhalt einer Zähldatei mit genau $bytes Byte: eine Füllzeile, verfallene Stempel und am Ende $gueltig gültige. */
function bestand(int $bytes, int $gueltig, int $jetzt): string {
    $zeilen = intdiv($bytes, 11);
    $rest = $bytes - $zeilen * 11;
    if ($rest === 1) {
        $zeilen--;
        $rest += 11;
    }
    $text = $rest > 0 ? str_repeat('#', $rest - 1) . "\n" : '';
    for ($i = 0; $i < $zeilen; $i++) {
        $text .= ($i < $zeilen - $gueltig ? $jetzt - 5000 - $i : $jetzt - 60) . "\n";
    }
    return $text;
}

/** Legt die Zähldatei einer Adresse mit $inhalt auf das Kleinst-Dateisystem (Verweis aus data/). */
function verlege(array $u, string $adresse, string $ordner, string $inhalt): string {
    $ziel = $ordner . '/zaehler-' . md5($adresse);
    file_put_contents($ziel, $inhalt);
    symlink($ziel, bremsdatei($u, $adresse));
    return $ziel;
}

/**
 * Ruft bremseVersuch() des Prüflings direkt auf (eigener Prozess) und meldet den Stand und ob die
 * Prüfung lief. $art: "richtig" oder "falsch" als Ergebnis der Prüfung.
 */
function bremseDirekt(array $u, string $datei, string $art): array {
    $skript = $u['wurzel'] . '/bremse_direkt.php';
    file_put_contents($skript, '<?php
require $argv[1];
$lief = false;
$erg = bremseVersuch($argv[2], 5, 900, true, function () use (&$lief, $argv) { $lief = true; return $argv[3] === "richtig"; });
echo json_encode(["stand" => $erg[0], "lief" => $lief]);
');
    exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($skript) . ' ' . escapeshellarg($u['api'] . '/auth.php') . ' '
        . escapeshellarg($datei) . ' ' . escapeshellarg($art) . ' 2>&1', $zeilen);
    $json = json_decode(implode('', $zeilen), true);
    return is_array($json) ? $json : ['stand' => 'Fehler: ' . substr(implode(' ', $zeilen), 0, 140), 'lief' => null];
}
