#!/usr/bin/env python3
"""Probe fuer ops/sunds-hub/eintragen.py: ohne Netz, ohne sunds-hub.

Das Skript schreibt als root nach /opt/sunds-hub und /opt/sunds-waechter.
Die Probe laeuft deshalb NUR in einem Wegwerf-Container und bricht ab, wenn
einer der beiden Ordner schon da ist (dann waere es ein echter Server).

Aufruf auf dem Server (Beispiel hel1), D wie in chat_bremse_lauf.sh:
    timeout 120 docker run --rm --network none -m 256m -v "$D":/app:ro -w /tmp \
      python:3.12-slim python /app/neu/ops/tests/eintragen_probe.py \
      /app/neu/ops/sunds-hub/eintragen.py /app/main/ops/sunds-hub/eintragen.py

    <neu>   eintragen.py des zu pruefenden Stands
    <main>  eintragen.py von main: Seine Ziele sind der Ausgangsbestand, so wie
            er heute in /opt/sunds-waechter/ziele.json steht (optional)

Geprueft wird: Das Skript uebersetzt, ergaenzt genau das neue Ziel
"Messebau-Website KI-Chat", laesst vorhandene und fremde Ziele unveraendert,
ist beim zweiten Lauf ohne Wirkung, und die Suchzeichenkette des Ziels trennt
die beiden Antworten von health.php so, wie der Waechter sie auswertet
(sunds_waechter.py, pruefe_url: jede Zeichenkette aus muss_enthalten muss in
der Antwort stehen).

Exit 0 = alle Pruefungen gruen, 1 = mindestens eine rot, 2 = Umgebung ungeeignet.
"""
import hashlib
import importlib.util
import json
import os
import py_compile
import subprocess
import sys

ZIEL = "Messebau-Website KI-Chat"

# So antwortet public/api/health.php (JSON_PRETTY_PRINT); dass die echte
# Antwort diese Zeichenketten traegt, misst ops/tests/chat_bremse_test.php (Abschnitt L).
ANTWORT_FREI = """{
    "status": "ok",
    "checks": {
        "database": "ok",
        "data_writable": "ok",
        "chat": "frei",
        "timestamp": "2026-11-10T02:00:00+00:00"
    }
}"""
ANTWORT_DECKEL = ANTWORT_FREI.replace('"chat": "frei"', '"chat": "deckel_erreicht"')
# Stand von main vor dieser Aenderung: das Feld fehlt
ANTWORT_ALT = ANTWORT_FREI.replace('        "chat": "frei",\n', '')

gruen = rot = 0


def pruefe(name, ok, detail=""):
    global gruen, rot
    if ok:
        gruen += 1
        print("GRUEN  " + name)
    else:
        rot += 1
        print("ROT    " + name + (("  [" + str(detail) + "]") if detail else ""))


def lade_modul(pfad, name):
    spec = importlib.util.spec_from_file_location(name, pfad)
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul


def md5(pfad):
    return hashlib.md5(open(pfad, "rb").read()).hexdigest()


def waechter_ok(ziel, antwort):
    """Dieselbe Auswertung wie pruefe_url im Waechter, ohne Abruf und Zeitmessung."""
    return all(muss in antwort for muss in ziel.get("muss_enthalten", []))


def main():
    if len(sys.argv) < 2:
        sys.exit("Aufruf: eintragen_probe.py <neu/eintragen.py> [<main/eintragen.py>]")
    neu_pfad = sys.argv[1]
    main_pfad = sys.argv[2] if len(sys.argv) > 2 else None
    if any(os.path.exists(p) for p in ("/opt/sunds-hub", "/opt/sunds-waechter", "/opt/sunds-leadmaschine")):
        print("ABBRUCH: /opt/sunds-hub, /opt/sunds-waechter oder /opt/sunds-leadmaschine gibt es hier schon. "
              "Die Probe laeuft nur in einem Wegwerf-Container.", file=sys.stderr)
        return 2
    if os.geteuid() != 0:
        print("ABBRUCH: braucht root im Container (eintragen.py verlangt es).", file=sys.stderr)
        return 2

    try:
        py_compile.compile(neu_pfad, cfile="/tmp/eintragen_probe.pyc", doraise=True)
        pruefe("eintragen.py uebersetzt (py_compile)", True)
    except py_compile.PyCompileError as e:
        pruefe("eintragen.py uebersetzt (py_compile)", False, e)
        return 1

    neu = lade_modul(neu_pfad, "eintragen_neu")
    ziele_neu = {z["name"]: z for z in neu.ZIELE_NEU}
    ziel = ziele_neu.get(ZIEL, {})
    pruefe('Ziel "%s" steht in ZIELE_NEU, Typ url, Adresse ist der Gesundheits-Endpunkt' % ZIEL,
           ziel.get("typ") == "url" and ziel.get("url") == neu.GESUND
           and ziel.get("url") == "https://sunds-messebau.de/api/health.php", ziel)
    pruefe('es sucht genau die Zeichenkette "chat": "frei"',
           ziel.get("muss_enthalten") == ['"chat": "frei"'], ziel.get("muss_enthalten"))
    pruefe("Namen der Ziele sind eindeutig", len(ziele_neu) == len(neu.ZIELE_NEU))

    # Auswertung wie im Waechter
    pruefe("Waechter-Auswertung: Antwort mit freiem Chat ist gruen", waechter_ok(ziel, ANTWORT_FREI))
    pruefe("Waechter-Auswertung: Antwort mit erreichtem Deckel ist rot", not waechter_ok(ziel, ANTWORT_DECKEL))
    pruefe("Waechter-Auswertung: Antwort ohne das Feld (Website noch auf altem Stand) ist rot",
           not waechter_ok(ziel, ANTWORT_ALT))
    api = ziele_neu.get("Messebau-Website API/Datenbank", {})
    pruefe('das Ziel "Messebau-Website API/Datenbank" bleibt bei erreichtem Deckel gruen',
           bool(api.get("muss_enthalten")) and waechter_ok(api, ANTWORT_DECKEL), api.get("muss_enthalten"))

    # Ausgangsbestand wie auf sunds-hub: die Ziele von main plus ein fremdes Ziel
    fremd = {"name": "Fremdes Ziel", "typ": "url", "url": "https://example.invalid/", "muss_enthalten": ["x"]}
    if main_pfad:
        alt = lade_modul(main_pfad, "eintragen_main")
        bestand = [fremd] + list(alt.ZIELE_NEU)
        pruefe('Ausgangsbestand (main) kennt das Ziel "%s" noch nicht' % ZIEL,
               ZIEL not in {z["name"] for z in bestand})
    else:
        bestand = [fremd] + [z for z in neu.ZIELE_NEU if z["name"] != ZIEL]
    os.makedirs("/opt/sunds-hub")
    os.makedirs("/opt/sunds-waechter")
    json.dump({"leads": {"kunden": ["kge"]}}, open(neu.REGISTER, "w", encoding="utf-8"))
    json.dump(bestand, open(neu.ZIELE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    lauf1 = subprocess.run([sys.executable, neu_pfad], capture_output=True, text=True, timeout=60)
    print("  Lauf 1: " + " | ".join(lauf1.stdout.strip().splitlines()))
    nach1 = json.load(open(neu.ZIELE, encoding="utf-8"))
    pruefe("Lauf 1: Exit 0, genau 1 Ziel ergaenzt",
           lauf1.returncode == 0 and "ziele.json: 1 Ziel(e) ergaenzt" in lauf1.stdout,
           (lauf1.returncode, lauf1.stdout, lauf1.stderr))
    pruefe("danach stehen die %d alten Ziele unveraendert und in alter Reihenfolge vorn, das neue am Ende"
           % len(bestand),
           nach1[:len(bestand)] == bestand and len(nach1) == len(bestand) + 1 and nach1[-1] == ziel,
           [z.get("name") for z in nach1])
    register = json.load(open(neu.REGISTER, encoding="utf-8"))
    pruefe("projekte.json traegt den Eintrag der Website", neu.NAME in register and "messebau" in register["leads"]["kunden"])

    pruefe("Lauf 1 ohne den Verteiler der Leadmaschine: kein Hinweis auf die TSV",
           "ACHTUNG" not in lauf1.stdout, lauf1.stdout)

    # Zeile fuer ueberwachung.tsv: gelesen wie in ziele-erzeugen.py (Spalten mit
    # Tabulator, Zusatzfelder mit " ;; ", mehrere Suchtexte mit "|")
    zeile = getattr(neu, "TSV_ZEILE_CHAT", "")
    spalten = zeile.split("\t")
    zusatz = dict(s.partition("=")[::2] for s in (spalten[4].split(" ;; ") if len(spalten) == 5 else []))
    pruefe("TSV-Zeile: fuenf Spalten, Typ url, Name des Ziels, Suchtext wie im Ziel",
           len(spalten) == 5 and spalten[0] == "url" and spalten[2] == ZIEL
           and zusatz.get("muss", "").split("|") == ziel.get("muss_enthalten")
           and zusatz.get("kunde") == ziel.get("kunde"), spalten)
    andere = {z.get("url", "").rstrip("/") for z in neu.ZIELE_NEU if z.get("typ") == "url"}
    pruefe("TSV-Zeile: eigene Adresse am selben Endpunkt (sonst haelt die Verlustpruefung die Verteilung an)",
           len(spalten) == 5 and spalten[1].startswith(neu.GESUND + "?") and spalten[1].rstrip("/") not in andere,
           spalten[1:2])

    summe = (md5(neu.ZIELE), md5(neu.REGISTER))
    # Jetzt wie auf sunds-hub: Der Verteiler der Leadmaschine ist da
    verteiler = getattr(neu, "VERTEILER", "/opt/sunds-leadmaschine/ziele-verteilen.sh")
    os.makedirs(os.path.dirname(verteiler))
    open(verteiler, "w").write("#!/bin/sh\n")
    lauf2 = subprocess.run([sys.executable, neu_pfad], capture_output=True, text=True, timeout=60)
    print("  Lauf 2: " + " | ".join(lauf2.stdout.strip().splitlines()))
    pruefe("Lauf 2: Exit 0, nichts ergaenzt, beide Dateien bytegleich",
           lauf2.returncode == 0 and "alle Ziele waren schon vorhanden" in lauf2.stdout
           and "war schon aktuell" in lauf2.stdout and (md5(neu.ZIELE), md5(neu.REGISTER)) == summe,
           (lauf2.returncode, lauf2.stdout, lauf2.stderr))
    pruefe("Lauf 2 mit dem Verteiler: das Skript sagt, dass das Ziel ohne TSV-Zeile wieder verschwindet, und druckt die Zeile",
           "ACHTUNG" in lauf2.stdout and zeile != "" and zeile in lauf2.stdout, lauf2.stdout)

    print("\nERGEBNIS EINTRAGEN: %d gruen, %d rot" % (gruen, rot))
    return 0 if rot == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
