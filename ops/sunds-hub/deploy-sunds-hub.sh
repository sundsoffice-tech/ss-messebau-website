#!/usr/bin/env bash
# Spielt die Oekosystem-Anbindung der Messebau-Website auf sunds-hub ein.
# Idempotent: kann mehrfach laufen. Sichert jede ueberschriebene Datei mit Datum.
#
#   bash ops/sunds-hub/deploy-sunds-hub.sh            (aus dem Website-Repo, Git Bash)
#
# Braucht: ssh-Alias "sunds-hub" (Key-Auth), sudo ohne Passwort dort.
# Quellen: leadmaschine/zentrale/lead-endpunkt/{lead_endpunkt.py,kunden.json}
#          leadmaschine/zentrale/waechter/sunds_waechter.py
#          ops/sunds-hub/eintragen.py, SCHNITTSTELLE-LEADS.md (dieses Repo)
set -euo pipefail

HIER="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HIER/../.." && pwd)"
ZENTRALE="${ZENTRALE:-/c/Users/fabrice/Desktop/leadmaschine/zentrale}"
STEMPEL="$(date +%Y-%m-%d-%H%M)"
HOST="${HOST:-sunds-hub}"

for f in "$ZENTRALE/lead-endpunkt/lead_endpunkt.py" "$ZENTRALE/lead-endpunkt/kunden.json" \
         "$ZENTRALE/waechter/sunds_waechter.py" "$HIER/eintragen.py" "$REPO/SCHNITTSTELLE-LEADS.md"; do
  [ -f "$f" ] || { echo "fehlt: $f" >&2; exit 2; }
done

echo "== 1/4 Dateien nach $HOST:/tmp/sunds-messebau-deploy kopieren"
ssh "$HOST" 'rm -rf /tmp/sunds-messebau-deploy && mkdir -p /tmp/sunds-messebau-deploy'
scp -q "$ZENTRALE/lead-endpunkt/lead_endpunkt.py" "$ZENTRALE/lead-endpunkt/kunden.json" \
       "$ZENTRALE/waechter/sunds_waechter.py" "$HIER/eintragen.py" "$REPO/SCHNITTSTELLE-LEADS.md" \
       "$HOST:/tmp/sunds-messebau-deploy/"

echo "== 2/4 Lead-Endpunkt: dienst.py + kunden.json einspielen, Dienst neu starten"
ssh "$HOST" "set -e; S=/tmp/sunds-messebau-deploy; cd /opt/sunds-leads
  sudo python3 -m py_compile \$S/lead_endpunkt.py
  sudo cp -p dienst.py dienst.py.vor-$STEMPEL
  sudo cp -p kunden.json kunden.json.vor-$STEMPEL
  sudo install -o root -g root -m 755 \$S/lead_endpunkt.py dienst.py
  sudo install -o root -g root -m 644 \$S/kunden.json kunden.json
  sudo install -o root -g root -m 644 \$S/SCHNITTSTELLE-LEADS.md SCHNITTSTELLE-MESSEBAU-WEBSITE.md
  sudo systemctl restart sunds-leads; sleep 2
  systemctl is-active sunds-leads
  curl -s localhost:8081/gesund; echo"

echo "== 3/4 Aussenwaechter: Skript (Typ abgleich) einspielen, Register + Ziele eintragen, Probelauf"
ssh "$HOST" "set -e; S=/tmp/sunds-messebau-deploy; cd /opt/sunds-waechter
  python3 -m py_compile \$S/sunds_waechter.py
  cp -p sunds_waechter.py sunds_waechter.py.vor-$STEMPEL
  cp -p ziele.json ziele.json.vor-$STEMPEL
  install -m 755 \$S/sunds_waechter.py sunds_waechter.py
  sudo python3 \$S/eintragen.py
  python3 sunds_waechter.py | tail -6"

echo "== 4/4 Vertrag ins Schnittstellen-Verzeichnis + README-Zeile"
ssh "$HOST" "set -e; S=/tmp/sunds-messebau-deploy
  sudo install -o root -g root -m 644 \$S/SCHNITTSTELLE-LEADS.md /opt/sunds-hub/schnittstellen/messebau-website-leads.md
  if ! grep -q 'messebau-website-leads.md' /opt/sunds-hub/schnittstellen/README.md; then
    printf '%s\n' '| messebau-website-leads.md | Messebau-Website -> Lead-Endpunkt (Anfragen, kunde=messebau, parallel zu SendGrid) | Endpunkt-Seite gebaut + Website-Seite gebaut 21.08.2026; Abnahme siehe Vertrag Par. 6 |' | sudo tee -a /opt/sunds-hub/schnittstellen/README.md >/dev/null
    echo 'README-Zeile ergaenzt'
  else echo 'README-Zeile war schon da'; fi
  rm -rf /tmp/sunds-messebau-deploy
  echo; echo '== Register-Auszug =='; python3 -c \"import json;d=json.load(open('/opt/sunds-hub/projekte.json'));print(json.dumps({k:d[k] for k in ('messebau-website','leads')},ensure_ascii=False,indent=1)[:1500])\""

echo
echo "Fertig. Abnahme von aussen (Vertrag Par. 6):"
echo "  curl -s https://leads.sundsconnect.de/gesund"
echo "  curl -s -X OPTIONS -H 'Origin: https://sunds-messebau.de' -D - -o /dev/null https://leads.sundsconnect.de/lead | grep -i access-control"
