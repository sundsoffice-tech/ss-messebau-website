#!/bin/bash
# Sichtprobe am gebauten Artefakt auf hel1: Apache (mit .htaccess) liefert dist aus,
# ein zweiter Container mit Chromium fotografiert und misst (sicht.cjs).
# Nichts ist von außen erreichbar (kein veröffentlichter Port), nichts geht an die Live-Seite.
#
# Aufruf: sicht.sh <dist-ordner> <name> <ausgabe-ordner>
# Chromium und puppeteer kommen aus der Vorlage des Seitenfoto-Werkzeugs (nur lesend).
DIST="$1"; N="$2"; AUS="$3"
HIER="$(cd "$(dirname "$0")" && pwd)"
V=/srv/laeufe/seitenfotos-vorlage/n
[ -f "$DIST/index.html" ] || { echo "kein index.html in $DIST"; exit 2; }
[ -d "$V/node_modules/puppeteer-core" ] || { echo "Vorlage $V fehlt"; exit 2; }
mkdir -p "$AUS" && chmod a+rwx "$AUS"
printf '%s\n' 'LoadModule rewrite_module modules/mod_rewrite.so' 'LoadModule expires_module modules/mod_expires.so' \
  'LoadModule deflate_module modules/mod_deflate.so' '<Directory "/usr/local/apache2/htdocs">' '  AllowOverride All' \
  '  Require all granted' '</Directory>' > "$AUS/apache.conf"
echo "START $(date +%H:%M:%S) sicht $N load=$(cut -d' ' -f1-3 /proc/loadavg) frei=$(free -m | awk 'NR==2{print $7}')MB"
docker run -d --rm --name "sicht-web-$N" -m 256m -v "$DIST":/usr/local/apache2/htdocs:ro \
  -v "$AUS/apache.conf":/usr/local/apache2/conf/extra/probe.conf:ro httpd:2.4 \
  bash -c 'echo "Include conf/extra/probe.conf" >> conf/httpd.conf; exec httpd-foreground' >/dev/null || exit 3
sleep 3
timeout 420 docker run --rm --name "sicht-foto-$N" -m 2g --network "container:sicht-web-$N" \
  -e AWS_EXECUTION_ENV=AWS_Lambda_nodejs20.x -e LD_LIBRARY_PATH=/tmp/al2023/lib:/w/n/lib -e FONTCONFIG_PATH=/tmp/fonts \
  -e NODE_PATH=/w/n/node_modules -v "$V":/w/n:ro -v "$HIER/sicht.cjs":/w/sicht.cjs:ro -v "$AUS":/w/aus \
  node:22-slim node /w/sicht.cjs http://127.0.0.1 /w/aus
RC=$?
[ "$RC" = "124" ] && docker stop "sicht-foto-$N" >/dev/null 2>&1
docker stop "sicht-web-$N" >/dev/null 2>&1
echo "SICHT_RC=$RC"
echo "ENDE $(date +%H:%M:%S) sicht $N"
