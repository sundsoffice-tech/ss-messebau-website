#!/bin/bash
# Prüflauf der Website auf einem Server des Hauses (hel1), nicht auf dem PC,
# in einem Node-20-Container mit 3 GB Speichergrenze.
#
# Aufruf: lauf.sh <verzeichnis> <name> [voll|rotprobe]
#   voll      npm ci, vitest, tsc -b, npm run build (Vorgabe)
#   rotprobe  node ops/messung/rotprobe.mjs (braucht node_modules aus einem Lauf "voll")
# Zeitgrenze 900 s auf dieser Seite; läuft der Container danach noch, wird er gestoppt.
D="$1"; N="$2"; MODUS="${3:-voll}"
cd "$D" || exit 2
echo "START $(date +%H:%M:%S) $N $MODUS load=$(cut -d' ' -f1-3 /proc/loadavg) frei=$(free -m | awk 'NR==2{print $7}')MB"
if [ "$MODUS" = "rotprobe" ]; then
  timeout 900 docker run --rm -m 3g --name "messung-$N" -v "$D":/app -w /app node:20-slim \
    bash -c 'node ops/messung/rotprobe.mjs; echo "ROTPROBE_RC=$?"'
else
  timeout 900 docker run --rm -m 3g --name "messung-$N" -v "$D":/app -w /app node:20-slim bash -c '
    npm ci --no-audit --no-fund >/tmp/ci.log 2>&1; echo "CI_RC=$?"; tail -n 3 /tmp/ci.log
    npx vitest run >/app/.vitest.log 2>&1; echo "VITEST_RC=$?"
    grep -E "Test Files|Tests |FAIL|Error:|AssertionError|Unhandled" /app/.vitest.log | head -n 60
    npx tsc -b >/app/.tsc.log 2>&1; echo "TSC_RC=$?"; echo "TSC_FEHLER=$(grep -c "error TS" /app/.tsc.log)"
    npm run build >/app/.build.log 2>&1; echo "BUILD_RC=$?"; tail -n 4 /app/.build.log
    chmod -R a+rX dist
    chmod a+r /app/.vitest.log /app/.tsc.log /app/.build.log
  '
fi
RC=$?
echo "DOCKER_RC=$RC"
if [ "$RC" = "124" ]; then docker stop "messung-$N" >/dev/null 2>&1; echo "ZEITGRENZE 900 s erreicht, Container gestoppt"; fi
echo "ENDE $(date +%H:%M:%S) $N"
