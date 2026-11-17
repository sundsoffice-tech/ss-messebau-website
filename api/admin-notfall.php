<?php
/**
 * S&S Messebau - Notfall-Zugang zum Admin-Bereich über das Netz
 *
 * Zweck: Das Passwort des Admin-Benutzers neu setzen, ohne SSH-Kennwort.
 * Der Weg ist ein einmaliges, langes Zeichen (TOKEN). Ohne das richtige Zeichen
 * antwortet die Datei mit 404, also wie "gibt es nicht".
 *
 * Aufrufe:
 *   ?token=...            zeigt die Benutzernamen
 *   ?token=...&pw=...     setzt das Passwort (bei mehreren Benutzern zusätzlich &name=...)
 *
 * Der neue Hash hat dieselben Kosten wie in auth.php (10), damit die Anmeldung
 * gleich lange rechnet. Ein neuer Hash beendet alle offenen Sitzungen.
 */

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Robots-Tag: noindex');

const TOKEN = 'f3a91c7d2b45e8a06c1d94be7f30528a';
const PASSWORT_MIN_BYTES = 12;
const PASSWORT_MAX_BYTES = 72;

function abbruch(string $meldung, int $code = 400): void
{
    http_response_code($code);
    echo $meldung, "\n";
    exit;
}

$gegeben = (string) ($_GET['token'] ?? '');
if ($gegeben === '' || !hash_equals(TOKEN, $gegeben)) {
    abbruch('Nicht gefunden.', 404);
}

require_once __DIR__ . '/config.php';

if (!is_file(DB_PATH)) {
    abbruch('Die Datenbank der Website wurde nicht gefunden.', 500);
}

try {
    $db = new PDO('sqlite:' . DB_PATH, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $db->exec('PRAGMA busy_timeout=5000');
    $admins = $db->query('SELECT id, username FROM admin_users ORDER BY id')->fetchAll();
} catch (Throwable $e) {
    abbruch('Datenbank nicht lesbar: ' . $e->getMessage(), 500);
}

if (count($admins) === 0) {
    abbruch('Es gibt keinen Admin-Benutzer.', 500);
}

$passwort = (string) ($_GET['pw'] ?? '');
if ($passwort === '') {
    $namen = array_column($admins, 'username');
    echo "Benutzer: ", implode(', ', $namen), "\n";
    echo "Zum Setzen: ?token=...&pw=<neues Passwort>", count($namen) > 1 ? "&name=<Benutzer>" : '', "\n";
    exit;
}

$name = (string) ($_GET['name'] ?? '');
if ($name === '') {
    if (count($admins) !== 1) {
        abbruch('Mehrere Benutzer, bitte &name= angeben.', 400);
    }
    $name = (string) $admins[0]['username'];
}

$treffer = array_values(array_filter($admins, static fn(array $z): bool => $z['username'] === $name));
if (count($treffer) !== 1) {
    abbruch('Benutzername nicht eindeutig.', 400);
}

if (preg_match('/^[\x20-\x7E]*$/D', $passwort) !== 1) {
    abbruch('Nur ASCII-Zeichen ohne Umlaute verwenden.', 400);
}
if (strlen($passwort) < PASSWORT_MIN_BYTES || strlen($passwort) > PASSWORT_MAX_BYTES) {
    abbruch('Passwort muss 12 bis 72 Zeichen haben.', 400);
}

$id = (int) $treffer[0]['id'];
$hash = password_hash($passwort, PASSWORD_BCRYPT, ['cost' => 10]);
$stmt = $db->prepare("UPDATE admin_users SET password_hash = :hash, updated_at = datetime('now') WHERE id = :id");
$stmt->execute([':hash' => $hash, ':id' => $id]);
if ($stmt->rowCount() !== 1) {
    abbruch('Der Eintrag ließ sich nicht ändern.', 500);
}

$neu = $db->prepare('SELECT password_hash FROM admin_users WHERE id = :id');
$neu->execute([':id' => $id]);
if (!password_verify($passwort, (string) $neu->fetchColumn())) {
    abbruch('Gegenprobe fehlgeschlagen.', 500);
}

echo "OK. Passwort für '", $name, "' gesetzt. Alle alten Sitzungen sind beendet.\n";
