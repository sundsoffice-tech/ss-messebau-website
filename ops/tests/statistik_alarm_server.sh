#!/bin/bash
# Serverseite des Belegs für die Fälle zum Zufluss der Statistik (V bis Z, AA bis AD):
# fährt den PHP-Beleg (bereinigung_server.sh: cli, fpm, Rotprobe gegen main), die
# Mutantenprobe und, falls vorhanden, die Tests des Trackers. Schreibt alles in
# Dateien, damit der Lauf eine abgerissene ssh-Verbindung übersteht.
#
# Aufruf auf dem Server:
#   bash <D>/neu/ops/tests/statistik_alarm_server.sh <D> [nur-php|nur-mutanten|nur-node]
#   <D>  frisches Verzeichnis mit neu/ und main/ (je public/api und ops aus
#        git -c core.autocrlf=false archive) und wahlweise web/ (src, package.json,
#        Konfiguration und node_modules) für die Tests des Trackers
#
# Schreibt nach <D>: stand.log (Verlauf und Exit-Codes), lauf.log, fpm.log, chat.log
# (aus bereinigung_server.sh), mutanten.log, node.log, zuletzt alarm-fertig.
# Alle Container laufen ohne Netz und mit Zeitgrenze.
set -u
D=${1:?Laufordner fehlt}
TEIL=${2:-alles}
cd "$D" || exit 2
rm -f "$D/alarm-fertig"
echo "START $(date -u +%FT%TZ) Teil $TEIL, Last $(cut -d' ' -f1-3 /proc/loadavg) auf $(nproc) Kernen, RAM verfuegbar $(free -m | awk '/^Mem/{print $7}') MB, Platte $(df -h "$D" | awk 'END{print $5}')" >> "$D/stand.log"
if [ "$TEIL" = alles ] || [ "$TEIL" = nur-php ]; then
    bash "$D/neu/ops/tests/bereinigung_server.sh" "$D" klein >> "$D/stand.log" 2>&1
    echo "SERVER_RC=$? $(date -u +%T)" >> "$D/stand.log"
fi
if [ "$TEIL" = alles ] || [ "$TEIL" = nur-mutanten ]; then
    NAME="alarm-mut-$$"
    timeout 2400 docker run --rm --name "$NAME" --network none -m 512m -v "$D":/app:ro -w /app php:8.3-cli \
        php /app/neu/ops/tests/statistik_alarm_mutanten.php --ohne-netz /app/neu/public/api > "$D/mutanten.log" 2>&1
    RC=$?
    [ "$RC" = 124 ] && docker stop -t 2 "$NAME" >/dev/null 2>&1
    echo "MUTANTEN_RC=$RC $(date -u +%T)" >> "$D/stand.log"
fi
if { [ "$TEIL" = alles ] || [ "$TEIL" = nur-node ]; } && [ -d "$D/web" ]; then
    NAME="alarm-node-$$"
    timeout 1200 docker run --rm --name "$NAME" --network none -m 1536m -v "$D/web":/web -w /web node:20-slim \
        sh -c 'npx vitest run > /tmp/v.log 2>&1; echo "VITEST_RC=$?"; tail -45 /tmp/v.log; npx tsc -b > /tmp/t.log 2>&1; echo "TSC_RC=$?"; grep -c "error TS" /tmp/t.log; grep "error TS" /tmp/t.log | head -12' > "$D/node.log" 2>&1
    RC=$?
    [ "$RC" = 124 ] && docker stop -t 2 "$NAME" >/dev/null 2>&1
    echo "NODE_RC=$RC $(date -u +%T)" >> "$D/stand.log"
fi
date -u +%FT%TZ > "$D/alarm-fertig"
