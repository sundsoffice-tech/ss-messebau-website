#!/bin/sh
# Fährt den Beleg für die Anmeldung am Admin-Bereich in einem PHP-Container, ohne Netz.
#
# Aufruf im Container php:8.3-cli oder php:8.3-fpm:
#   sh <neu>/ops/tests/anmeldung_lauf.sh <neu> [<main> [<teile>]]
#   <neu>   Baum mit dem zu prüfenden Stand (public/api und ops/tests)
#   <main>  Baum mit public/api des Vergleichsstands für die Rotprobe (optional)
#   <teile> Teile, die am Vergleichsstand rot sein müssen, durch Leerzeichen getrennt
#           (optional; ohne Angabe alle). Ein Vergleichsstand, der einen Teil schon
#           enthält, ist dort zu Recht grün.
#
# Auf dem Server (Beispiel hel1), D ist ein frisches Verzeichnis mit neu/ und main/.
# Nicht als root: Ein Fall sperrt data/ über die Dateirechte, root schriebe trotzdem.
#   docker run --rm --network none -m 512m --tmpfs /kleinfs:size=256k,mode=1777 --user 65534:65534 -v "$D":/app:ro -w /app \
#     php:8.3-cli sh /app/neu/ops/tests/anmeldung_lauf.sh /app/neu /app/main
#
# Exit 0 nur, wenn php -l sauber ist, der Test gegen <neu> grün endet (Exit 0),
# jeder Mutant erkannt wird und, falls <main> angegeben ist, jeder Teil des Tests
# gegen <main> rot endet (Exit 1).
set -u
NEU=${1:?Baum mit dem neuen Stand fehlt}
MAIN=${2:-}
ROT_TEILE=${3:-}

echo "== php -l =="
LINT=0
for f in "$NEU"/public/api/auth.php "$NEU"/public/api/analytics-config.php "$NEU"/public/api/health.php "$NEU"/ops/tests/anmeldung_*.php; do
    php -l "$f" || LINT=1
done

echo
echo "== Test gegen den neuen Stand (erwartet: Exit 0) =="
php "$NEU/ops/tests/anmeldung_test.php" --ohne-netz "$NEU/public/api"
RC_NEU=$?

RC_MAIN=-
if [ -n "$MAIN" ]; then
    RC_MAIN=1
    ROT_GELAUFEN=0
    # Jeder Teil der angegebenen Liste muss als Datei da sein: Ein Tippfehler in der Liste
    # ließe sonst die Rotprobe still aus.
    for T in $ROT_TEILE; do
        if [ ! -f "$NEU/ops/tests/anmeldung_faelle_$T.php" ]; then
            echo "ROTPROBE $T: diesen Teil gibt es nicht"
            RC_MAIN=fehlt
        fi
    done
    for f in "$NEU"/ops/tests/anmeldung_faelle_*.php; do
        TEIL=$(basename "$f" .php)
        TEIL=${TEIL#anmeldung_faelle_}
        if [ -n "$ROT_TEILE" ]; then
            case " $ROT_TEILE " in *" $TEIL "*) ;; *) continue ;; esac
        fi
        echo
        echo "== Rotprobe, Teil $TEIL: derselbe Test gegen public/api des Vergleichsstands (erwartet: Exit 1) =="
        php "$NEU/ops/tests/anmeldung_test.php" --ohne-netz "--teil=$TEIL" "$MAIN/public/api"
        RC=$?
        echo "ROTPROBE $TEIL: Exit $RC"
        ROT_GELAUFEN=$((ROT_GELAUFEN + 1))
        [ "$RC" = 1 ] || RC_MAIN=$RC
    done
    echo
    echo "ROTPROBEN gelaufen: $ROT_GELAUFEN"
    # Ein Vergleichsstand ohne eine einzige gelaufene Rotprobe belegt nichts.
    [ "$ROT_GELAUFEN" -gt 0 ] || RC_MAIN=keine
fi

echo
echo "== Mutanten: je eine Schutzstelle ausgeschaltet, der Test muss sie nennen (erwartet: Exit 0) =="
php "$NEU/ops/tests/anmeldung_mutanten.php" --ohne-netz "$NEU/public/api"
RC_MUT=$?

echo
echo "EXIT lint=$LINT neu=$RC_NEU main=$RC_MAIN mutanten=$RC_MUT"
[ "$LINT" = 0 ] && [ "$RC_NEU" = 0 ] && [ "$RC_MUT" = 0 ] && { [ -z "$MAIN" ] || [ "$RC_MAIN" = 1 ]; }
