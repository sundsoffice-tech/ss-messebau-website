#!/bin/bash
# Serverseite des Belegs für die Bereinigung ohne Handgriff: fährt die
# Container-Proben und schreibt ihre Ausgabe in Dateien, damit der Lauf eine
# abgerissene ssh-Verbindung übersteht.
#
# Aufruf auf dem Server (Beispiel hel1):
#   bash <D>/neu/ops/tests/bereinigung_server.sh <D>
#   <D>  frisches Verzeichnis mit neu/ (zu prüfender Stand), main/ (origin/main)
#        und wahlweise zusammen/ (Stand mit PR #238 verschmolzen), alle aus
#        git -c core.autocrlf=false archive <stand> public/api ops
#
# Schreibt nach <D>:
#   lauf.log  php:8.3-cli: Lint, Test gegen neu, Rotprobe gegen main, Test gegen zusammen
#   fpm.log   php:8.3-fpm: dasselbe, dazu Fall H (Antwort vor dem Räumen)
#   chat.log  Gegenprobe: die Belege der Chat-Bremsen laufen mit dem Anstoß weiter grün
#   fertig    Zeitstempel, zuletzt
# Alle Container laufen ohne Netz, lesen <D> nur und werden nach 300 s beendet.
set -u
D=${1:?Verzeichnis mit neu/ und main/ fehlt}
cd "$D" || exit 2
KENNUNG="ber-$(basename "$D")-$$"
ZUS=""
[ -d "$D/zusammen" ] && ZUS=/app/zusammen

probe() { # <abbild> <name> <befehl...>
    local abbild=$1 name=$2
    shift 2
    timeout 300 docker run --rm --name "$name" --network none -m 512m -v "$D":/app:ro -w /app "$abbild" "$@"
    local rc=$?
    [ "$rc" = 124 ] && docker stop -t 2 "$name" >/dev/null 2>&1
    return "$rc"
}

kopf() {
    echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ) auf $(hostname), Last $(cut -d' ' -f1-3 /proc/loadavg) auf $(nproc) Kernen, RAM verfügbar $(free -m | awk '/^Mem/{print $7}') MB"
}

{
    kopf
    probe php:8.3-cli "$KENNUNG-cli" sh /app/neu/ops/tests/bereinigung_lauf.sh /app/neu /app/main $ZUS
    echo "DOCKER_EXIT=$?"
    echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$D/lauf.log" 2>&1

{
    kopf
    probe php:8.3-fpm "$KENNUNG-fpm" sh /app/neu/ops/tests/bereinigung_lauf.sh /app/neu /app/main $ZUS
    echo "DOCKER_EXIT=$?"
    echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$D/fpm.log" 2>&1

{
    kopf
    echo "== Chat-Bremsen: Test aus neu gegen neu (erwartet: Exit 0) =="
    probe php:8.3-cli "$KENNUNG-chat1" php /app/neu/ops/tests/chat_bremse_test.php --ohne-netz /app/neu/public/api
    echo "EXIT_NEU=$?"
    if [ -n "$ZUS" ]; then
        echo
        echo "== Chat-Bremsen: Test aus zusammen gegen zusammen (erwartet: Exit 0) =="
        probe php:8.3-cli "$KENNUNG-chat2" php /app/zusammen/ops/tests/chat_bremse_test.php --ohne-netz /app/zusammen/public/api
        echo "EXIT_ZUSAMMEN=$?"
    fi
    echo "ENDE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$D/chat.log" 2>&1

date -u +%Y-%m-%dT%H:%M:%SZ > "$D/fertig"
