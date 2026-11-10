#!/bin/sh
# Fährt den Beleg für die Bereinigung ohne Handgriff in einem PHP-Container, ohne Netz.
#
# Aufruf im Container php:8.3-cli (oder php:8.3-fpm, dann läuft auch Fall H):
#   sh <neu>/ops/tests/bereinigung_lauf.sh <neu> [<main> [<zusammen>]]
#   <neu>       Baum mit dem zu prüfenden Stand (public/api und ops/tests)
#   <main>      Baum mit public/api des Vergleichsstands für die Rotprobe, etwa
#               main oder der Vorgänger-PR (optional)
#   <zusammen>  Baum, in dem der Stand mit einem zweiten Zweig verschmolzen ist,
#               etwa mit PR #238 (optional); geprüft wird mit dem Test aus <neu>
#
# Auf dem Server fährt bereinigung_server.sh diesen Lauf und schreibt ihn in Dateien.
#
# Exit 0 nur, wenn php -l sauber ist, der Test gegen <neu> grün endet (Exit 0),
# gegen <main> rot (Exit 1) und gegen <zusammen> grün (Exit 0), soweit angegeben.
set -u
NEU=${1:?Baum mit dem neuen Stand fehlt}
MAIN=${2:-}
ZUSAMMEN=${3:-}
START=$(date +%s)

echo "== php -l =="
LINT=0
for f in public/api/bereinigung-anstoss.php public/api/analytics-cleanup.php public/api/health.php public/api/collect.php public/api/statistik-zaehler.php public/api/analytics-export.php public/api/analytics-status.php public/api/chat.php public/api/email.php public/api/ai.php ops/tests/bereinigung_test.php ops/tests/statistik_alarm_mutanten.php; do
    php -l "$NEU/$f" || LINT=1
done
if [ -n "$ZUSAMMEN" ]; then
    for f in public/api/analytics-cleanup.php public/api/health.php public/api/collect.php public/api/statistik-zaehler.php public/api/analytics-export.php public/api/analytics-status.php public/api/chat.php; do
        php -l "$ZUSAMMEN/$f" || LINT=1
    done
fi

echo
echo "== Test gegen den neuen Stand (erwartet: Exit 0) =="
php "$NEU/ops/tests/bereinigung_test.php" --ohne-netz "$NEU/public/api"
RC_NEU=$?

RC_MAIN=-
if [ -n "$MAIN" ]; then
    echo
    echo "== Rotprobe: derselbe Test gegen public/api des Vergleichsstands $MAIN (erwartet: Exit 1) =="
    php "$NEU/ops/tests/bereinigung_test.php" --ohne-netz "$MAIN/public/api"
    RC_MAIN=$?
fi

RC_ZUS=-
if [ -n "$ZUSAMMEN" ]; then
    echo
    echo "== Derselbe Test gegen den verschmolzenen Stand (erwartet: Exit 0) =="
    php "$NEU/ops/tests/bereinigung_test.php" --ohne-netz "$ZUSAMMEN/public/api"
    RC_ZUS=$?
fi

echo
echo "DAUER $(( $(date +%s) - START )) s"
echo "EXIT lint=$LINT neu=$RC_NEU main=$RC_MAIN zusammen=$RC_ZUS"
[ "$LINT" = 0 ] && [ "$RC_NEU" = 0 ] \
    && { [ -z "$MAIN" ] || [ "$RC_MAIN" = 1 ]; } \
    && { [ -z "$ZUSAMMEN" ] || [ "$RC_ZUS" = 0 ]; }
