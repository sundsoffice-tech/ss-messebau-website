#!/bin/bash
# S&S Messebau - Admin-Passwort neu setzen: Einstieg für die Kommandozeile des Servers
#
# Start, nachdem man sich selbst am Hosting-Konto angemeldet hat:
#   bash domains/sunds-messebau.de/public_html/api/admin-passwort-setzen.sh
#
# Der Einstieg prüft Terminal und PHP, zeigt den Benutzernamen, schaltet die Anzeige
# der Eingabe ab, fragt das neue Passwort zweimal ab und reicht es dem Werkzeug
# admin-passwort-setzen.php über die Standardeingabe. Das Passwort steht in keinem
# Aufruf, keiner Umgebungsvariable und keiner Datei. Über das Netz ist diese Datei
# gesperrt (api/.htaccess); sie enthält ohnehin kein Geheimnis.

set -u
ORT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WERKZEUG="$ORT/admin-passwort-setzen.php"

ende() {
  printf '\n%s\nEs wurde nichts geändert.\n' "$1" >&2
  exit 1
}

if ! [ -t 0 ] || ! [ -t 1 ]; then
  ende 'Dieses Werkzeug läuft nur in einem Terminal, in dem ein Mensch tippt.'
fi
[ -f "$WERKZEUG" ] || ende 'Das Werkzeug liegt nicht vollständig vor.'

# Das PHP der Kommandozeile suchen: Fassung für die Kommandozeile, neu genug, mit SQLite.
PROBE='echo PHP_SAPI, " ", (PHP_VERSION_ID >= 70400 ? "neu" : "alt"), " ", (extension_loaded("pdo_sqlite") ? "db" : "ohnedb");'
PHP=''
GESEHEN=''
for KANDIDAT in php /opt/alt/php84/usr/bin/php /opt/alt/php83/usr/bin/php /opt/alt/php82/usr/bin/php /opt/alt/php81/usr/bin/php; do
  command -v "$KANDIDAT" >/dev/null 2>&1 || continue
  ANTWORT="$("$KANDIDAT" -r "$PROBE" 2>/dev/null)"
  if [ "$ANTWORT" = 'cli neu db' ]; then
    PHP="$KANDIDAT"
    break
  fi
  [ -n "$GESEHEN" ] || GESEHEN="$ANTWORT"
done
if [ -z "$PHP" ]; then
  case "$GESEHEN" in
    '') ende 'Auf diesem Server wurde kein PHP für die Kommandozeile gefunden.' ;;
    'cli alt '*) ende 'Das PHP der Kommandozeile ist zu alt für dieses Werkzeug.' ;;
    'cli neu ohnedb') ende 'Dem PHP der Kommandozeile fehlt die Erweiterung für die Datenbank (pdo_sqlite).' ;;
    *) ende 'Das gefundene PHP ist nicht die Fassung für die Kommandozeile.' ;;
  esac
fi

# Benutzernamen holen; scheitert das, hat das Werkzeug den Grund schon genannt.
LISTE="$("$PHP" "$WERKZEUG" liste)" || exit 1

printf 'Admin-Bereich von sunds-messebau.de: Passwort neu setzen\n\n'
ANZAHL=0
while IFS= read -r ZEILE; do
  [ -n "$ZEILE" ] && ANZAHL=$((ANZAHL + 1))
done <<EOF
$LISTE
EOF
if [ "$ANZAHL" = 1 ]; then
  NAME="$LISTE"
  printf 'Benutzername: %s\n' "$NAME"
else
  printf 'Es gibt mehrere Benutzer:\n'
  while IFS= read -r ZEILE; do
    [ -n "$ZEILE" ] && printf '  %s\n' "$ZEILE"
  done <<EOF
$LISTE
EOF
  printf 'Für welchen Benutzernamen? '
  IFS= read -r NAME || ende 'Die Eingabe wurde beendet.'
fi

# Anzeige der Eingabe abschalten, am Terminal gegenprüfen und in jedem Ausgang wiederherstellen.
VORHER="$(stty -g 2>/dev/null)" || VORHER=''
[ -n "$VORHER" ] || ende 'Die Eingabe ließe sich hier nicht verdecken. Das Passwort wird deshalb nicht abgefragt.'
anzeige_an() {
  stty "$VORHER" 2>/dev/null
}
# Die Wiederherstellung hängt am Ende des Skripts und gilt damit für jeden Ausgang, auch nach Strg+C.
trap 'anzeige_an' EXIT
trap 'printf "\nAbgebrochen.\nEs wurde nichts geändert.\n" >&2; exit 130' INT TERM HUP
stty -echo 2>/dev/null
case " $(stty -a 2>/dev/null | tr ';\n' '  ') " in
  *' -echo '*) ;;
  *)
    anzeige_an
    ende 'Die Eingabe ließe sich hier nicht verdecken. Das Passwort wird deshalb nicht abgefragt.'
    ;;
esac

printf 'Neues Passwort (12 bis 72 Zeichen, wird nicht angezeigt): '
IFS= read -r ERSTES || ende 'Die Eingabe wurde beendet.'
printf '\nNeues Passwort wiederholen: '
IFS= read -r ZWEITES || ende 'Die Eingabe wurde beendet.'
printf '\n'
anzeige_an
trap - INT TERM HUP

# printf ist ein Teil der Shell: Das Passwort erscheint in keiner Prozessliste.
printf '%s\n%s\n%s\n' "$NAME" "$ERSTES" "$ZWEITES" | "$PHP" "$WERKZEUG" setzen
ERGEBNIS=$?
ERSTES=''
ZWEITES=''
exit "$ERGEBNIS"
