#!/bin/bash
# Serverseite des Belegs für die Anmeldung am Admin-Bereich: wartet auf ruhige Last,
# fährt die Container-Proben mit niedriger Priorität und schreibt ihre Ausgabe in
# Dateien, damit der Lauf eine abgerissene ssh-Verbindung übersteht.
#
# Aufruf auf dem Server (Beispiel hel1):
#   bash <D>/neu/ops/tests/anmeldung_server.sh <D> ["<teile>"]
#   <D>  frisches Verzeichnis mit neu/ (zu prüfender Stand: public/api und ops)
#        und main/ (public/api des Vergleichsstands) für die Rotprobe
#
# Schreibt nach <D>:
#   lauf.log  php:8.3-cli: Lint, Test gegen neu, Rotprobe je Teil gegen main, Mutanten
#   fpm.log   php:8.3-fpm: dasselbe
#   cli.log   Gegenprobe: der Test des Kommandozeilen-Werkzeugs läuft weiter grün
#   fertig    Zeitstempel, zuletzt
# Die Container laufen ohne Netz, lesen <D> nur und werden nach 1800 s beendet. Sie bekommen ein
# Kleinst-Dateisystem unter /kleinfs (256 KB) für den Fall "Platte voll" der Anmeldebremse.
set -u
D=${1:?Verzeichnis mit neu/ und main/ fehlt}
ROT_TEILE=${2:-}   # Teile, die am Vergleichsstand rot sein müssen (ohne Angabe alle)
cd "$D" || exit 2
KENNUNG="anm-$(basename "$D")-$$"

warte() { # bis die Last unter 4 liegt, höchstens 30 Minuten
    for _ in $(seq 1 180); do
        awk '{exit !($1 < 4)}' /proc/loadavg && return 0
        sleep 10
    done
    echo "Last blieb 30 Minuten über 4, Lauf startet trotzdem nicht"
    return 1
}

kopf() {
    echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ) auf $(hostname), Last $(cut -d' ' -f1-3 /proc/loadavg) auf $(nproc) Kernen, RAM verfügbar $(free -m | awk '/^Mem/{print $7}') MB"
}

probe() { # <abbild> <name> <nutzer> <befehl...>
    local abbild=$1 name=$2 nutzer=$3
    shift 3
    nice -n 15 timeout 1800 docker run --rm --name "$name" --network none -m 512m --cpu-shares 256 --tmpfs /kleinfs:size=256k,mode=1777 --user "$nutzer" -v "$D":/app:ro -w /app/neu "$abbild" "$@"
    local rc=$?
    [ "$rc" = 124 ] && docker stop -t 2 "$name" >/dev/null 2>&1
    return "$rc"
}

for ART in cli fpm; do
    ZIEL=lauf.log
    [ "$ART" = fpm ] && ZIEL=fpm.log
    {
        warte || { echo "DOCKER_EXIT=wartet"; continue; }
        kopf
        probe "php:8.3-$ART" "$KENNUNG-$ART" 65534:65534 sh /app/neu/ops/tests/anmeldung_lauf.sh /app/neu /app/main "$ROT_TEILE"
        echo "DOCKER_EXIT=$?"
        echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    } > "$D/$ZIEL" 2>&1
done

{
    kopf
    probe php:8.3-cli "$KENNUNG-werkzeug" 0:0 php ops/tests/admin_passwort_cli_test.php
    echo "DOCKER_EXIT=$?"
    echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$D/cli.log" 2>&1

date -u +%Y-%m-%dT%H:%M:%SZ > "$D/fertig"
