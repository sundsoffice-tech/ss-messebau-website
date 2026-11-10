#!/bin/bash
# Serverseite des Belegs für die Chat-Bremsen: fährt beide Container-Proben
# und schreibt ihre Ausgabe in Dateien, damit der Lauf eine abgerissene
# ssh-Verbindung übersteht.
#
# Aufruf auf dem Server (Beispiel hel1):
#   bash <D>/neu/ops/tests/chat_bremse_server.sh <D>
#   <D>  frisches Verzeichnis mit neu/ (zu prüfender Stand) und main/ (origin/main),
#        beide aus  git -c core.autocrlf=false archive <stand> public/api ops
#
# Schreibt <D>/lauf.log (PHP: Lint, Test, Rotprobe gegen main, Mutanten),
# <D>/eintragen.log (Python: Wächter-Eintrag samt Rotprobe) und zuletzt <D>/fertig.
# Mit einer Zahl als zweitem Argument läuft danach die Mutantenreihe so oft
# noch einmal (<D>/stabil.log), als Probe, ob die Reihe verlässlich urteilt.
# Alle Container laufen ohne Netz und lesen <D> nur.
set -u
D=${1:?Verzeichnis mit neu/ und main/ fehlt}
RUNDEN=${2:-0}
cd "$D" || exit 2
{
    echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ), Last $(cut -d' ' -f1-3 /proc/loadavg) auf $(nproc) Kernen, RAM verfügbar $(free -m | awk '/^Mem/{print $7}') MB"
    timeout 300 docker run --rm --network none -m 512m -v "$D":/app:ro -w /app \
        php:8.3-cli sh /app/neu/ops/tests/chat_bremse_lauf.sh /app/neu /app/main
    echo "DOCKER_EXIT=$?"
    echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$D/lauf.log" 2>&1
{
    echo "== eintragen.py: Probe gegen den neuen Stand, Ausgangsbestand von main (erwartet: Exit 0) =="
    timeout 120 docker run --rm --network none -m 256m -v "$D":/app:ro -w /tmp \
        python:3.12-slim python /app/neu/ops/tests/eintragen_probe.py \
        /app/neu/ops/sunds-hub/eintragen.py /app/main/ops/sunds-hub/eintragen.py
    echo "EXIT_NEU=$?"
    echo
    echo "== Rotprobe: dieselbe Probe gegen eintragen.py von main (erwartet: Exit 1) =="
    timeout 120 docker run --rm --network none -m 256m -v "$D":/app:ro -w /tmp \
        python:3.12-slim python /app/neu/ops/tests/eintragen_probe.py \
        /app/main/ops/sunds-hub/eintragen.py
    echo "EXIT_MAIN=$?"
} > "$D/eintragen.log" 2>&1
if [ "$RUNDEN" -gt 0 ]; then
    {
        echo "== Stabilitätsprobe: die Mutantenreihe $RUNDEN-mal hintereinander, gezeigt wird nur, was nicht ERKANNT ist =="
        timeout 600 docker run --rm --network none -m 512m -v "$D":/app:ro -w /app php:8.3-cli \
            sh -c "for i in \$(seq 1 $RUNDEN); do php /app/neu/ops/tests/chat_bremse_mutanten.php --ohne-netz /app/neu/public/api | grep -v '^ERKANNT'; done"
        echo "DOCKER_EXIT=$?"
    } > "$D/stabil.log" 2>&1
fi
date -u +%Y-%m-%dT%H:%M:%SZ > "$D/fertig"
