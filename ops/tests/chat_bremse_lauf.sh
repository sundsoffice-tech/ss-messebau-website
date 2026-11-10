#!/bin/sh
# Fährt den Beleg für die Chat-Bremsen in einem PHP-Container, ohne Netz.
#
# Aufruf im Container php:8.3-cli:
#   sh <neu>/ops/tests/chat_bremse_lauf.sh <neu> [<main>]
#   <neu>   Baum mit dem zu prüfenden Stand (public/api und ops/tests)
#   <main>  Baum mit public/api von main für die Rotprobe (optional)
#
# Auf dem Server (Beispiel hel1), D ist ein frisches Verzeichnis mit neu/ und main/:
#   timeout 300 docker run --rm --network none -m 512m -v "$D":/app:ro -w /app \
#     php:8.3-cli sh /app/neu/ops/tests/chat_bremse_lauf.sh /app/neu /app/main
#
# Exit 0 nur, wenn php -l sauber ist, der Test gegen <neu> grün endet (Exit 0),
# jeder Mutant erkannt wird und, falls <main> angegeben ist, derselbe Test
# gegen <main> rot endet (Exit 1).
#
# Der Wächter-Eintrag (ops/sunds-hub/eintragen.py) hat eine eigene Probe in
# einem Python-Container, siehe Kopf von ops/tests/eintragen_probe.py.
set -u
NEU=${1:?Baum mit dem neuen Stand fehlt}
MAIN=${2:-}
START=$(date +%s)

echo "== php -l =="
LINT=0
for f in public/api/chat.php public/api/health.php public/api/analytics-cleanup.php ops/tests/chat_bremse_test.php ops/tests/chat_bremse_mutanten.php; do
    php -l "$NEU/$f" || LINT=1
done

echo
echo "== Test gegen den neuen Stand (erwartet: Exit 0) =="
php "$NEU/ops/tests/chat_bremse_test.php" --ohne-netz "$NEU/public/api"
RC_NEU=$?

RC_MAIN=-
if [ -n "$MAIN" ]; then
    echo
    echo "== Rotprobe: derselbe Test gegen public/api von main (erwartet: Exit 1) =="
    php "$NEU/ops/tests/chat_bremse_test.php" --ohne-netz "$MAIN/public/api"
    RC_MAIN=$?
fi

echo
echo "== Mutanten: je eine Schutzstelle ausgeschaltet, der Test muss sie nennen (erwartet: Exit 0) =="
php "$NEU/ops/tests/chat_bremse_mutanten.php" --ohne-netz "$NEU/public/api"
RC_MUT=$?

echo
echo "DAUER $(( $(date +%s) - START )) s"
echo "EXIT lint=$LINT neu=$RC_NEU main=$RC_MAIN mutanten=$RC_MUT"
[ "$LINT" = 0 ] && [ "$RC_NEU" = 0 ] && [ "$RC_MUT" = 0 ] && { [ -z "$MAIN" ] || [ "$RC_MAIN" = 1 ]; }
