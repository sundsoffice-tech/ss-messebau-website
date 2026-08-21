#!/usr/bin/env python3
"""Traegt die Messebau-Website dort ein, wo das Oekosystem sie finden muss:
im Register /opt/sunds-hub/projekte.json, beim Lead-Endpunkt (Register-Eintrag
"leads": Kunde + Schnittstelle) und in den Zielen des Aussenwaechters.
Idempotent, laeuft ohne Schaden zweimal.

    sudo python3 eintragen.py

Die Website selbst laeuft NICHT auf sunds-hub (Hostinger Shared Hosting,
sunds-messebau.de). Dieser Eintrag ist die Sichtbarkeit nach KONVENTION.md § 8:
ein Vertrag, den die Gegenseite nicht findet, ist keiner.
Quelle: GitHub sundsoffice-tech/ss-messebau-website, ops/sunds-hub/eintragen.py
"""
import io
import json
import os
import sys

REGISTER = "/opt/sunds-hub/projekte.json"
ZIELE = "/opt/sunds-waechter/ziele.json"
NAME = "messebau-website"
VERTRAG = "/opt/sunds-hub/schnittstellen/messebau-website-leads.md"
LIVE = "https://sunds-messebau.de/"
GESUND = "https://sunds-messebau.de/api/health.php"
QUELLE_INDEX = ("https://raw.githubusercontent.com/sundsoffice-tech/"
                "ss-messebau-website/hostinger/index.html")

EINTRAG = {
    "zweck": "Website + Anfrageformulare der S&S Messebau (Firma 'messebau'); "
             "eigenes PHP/SQLite-Backend fuer Anfragen, Bestellungen, Mailversand, Analytics",
    "domain": "sunds-messebau.de",
    "port": None,
    "dienst": "PHP 8.3 + SQLite auf Hostinger Shared Hosting (kein Daemon, kein Docker)",
    "benutzer": None,
    "gesund": "/api/health.php",
    "daten": "personenbezogen",
    "kunden": [],
    "server": "hostinger (sunds-messebau.de:65002, nur Passwort-SSH, kein Schluessel)",
    "quelle": "GitHub sundsoffice-tech/ss-messebau-website — main = Quelle, "
              "Branch hostinger = gebautes Live-Artefakt",
    "seit": "2026-08-21",
    "hinweis": (
        "Laeuft NICHT auf sunds-hub. Deploy seit 21.08.2026 13:20 vollautomatisch: Push auf main "
        "-> GitHub Action baut und pusht Branch hostinger -> dieselbe Action zieht per SSH auf dem "
        "Hostinger-Konto (Key github-actions-deploy@ss-messebau, in authorized_keys per command= "
        "auf 'git pull --ff-only origin hostinger' beschraenkt; Hostkey gepinnt in "
        "vars.HOSTINGER_KNOWN_HOSTS) und misst danach Live gegen das Bundle. Der Hostinger-Webhook "
        "selbst zieht nicht (antwortet 200, tut nichts). Rueckfall von Hand: hPanel -> Websites -> "
        "sunds-messebau.de -> Erweitert -> GIT -> Zeilenmenue -> Bereitstellen. Der Aussenwaechter "
        "vergleicht Live gegen den Branch (Ziel 'Messebau-Website Deploy-Abgleich'). Anfragen gehen parallel an den "
        "Lead-Endpunkt (kunde=messebau) UND per SendGrid aus dem eigenen Backend; beides "
        "bleibt, bis der Lead-Weg 4 Wochen sauber laeuft (Entscheidung Fabrice, 21.08.2026)."),
    "schnittstellen": {
        "bietet": ["GET /api/health.php"],
        "braucht": {"leads": ["POST /lead (kunde=messebau)", "GET /gesund"]},
        "vertraege": [VERTRAG],
    },
}

LEADS_ERGAENZUNG = {
    "kunden": ["kge", "messebau"],
    "schnittstellen": {
        "bietet": ["GET /gesund", "POST /lead"],
        "genutzt_von": ["messebau-website"],
        "vertraege": [VERTRAG],
    },
}

ZIELE_NEU = [
    {
        "name": "Messebau-Website",
        "typ": "url",
        "kunde": "S&S Messebau",
        "url": LIVE,
        "max_sekunden": 5.0,
        "muss_enthalten": ["S&S Messebau"],
    },
    {
        "name": "Messebau-Website API/Datenbank",
        "typ": "url",
        "kunde": "S&S Messebau",
        "url": GESUND,
        "max_sekunden": 5.0,
        "muss_enthalten": ["\"status\": \"ok\"", "\"database\": \"ok\""],
    },
    {
        "name": "Messebau-Website Deploy-Abgleich",
        "typ": "abgleich",
        "kunde": "S&S Messebau",
        "url": LIVE,
        "referenz": QUELLE_INDEX,
        "muster": "assets/index-[A-Za-z0-9_-]+[.]js",
        "hinweis": "hPanel -> sunds-messebau.de -> Erweitert -> GIT -> Bereitstellen "
                   "(Hostinger-Webhook zieht nicht, gemessen 21.08.2026).",
    },
]


def lade(pfad, standard):
    try:
        return json.load(io.open(pfad, encoding="utf-8"))
    except Exception:
        return standard


def vereinige(alt, neu):
    """Listen ohne Doppelte zusammenfuehren, Reihenfolge erhalten."""
    aus = list(alt or [])
    for x in neu:
        if x not in aus:
            aus.append(x)
    return aus


def main():
    if os.geteuid() != 0:
        sys.exit("Muss als root laufen (sudo).")

    register = lade(REGISTER, {})
    vorher = json.dumps(register, sort_keys=True)

    register.setdefault(NAME, {}).update(EINTRAG)

    leads = register.setdefault("leads", {})
    leads["kunden"] = vereinige(leads.get("kunden"), LEADS_ERGAENZUNG["kunden"])
    ls = leads.setdefault("schnittstellen", {})
    ls["bietet"] = vereinige(ls.get("bietet"), LEADS_ERGAENZUNG["schnittstellen"]["bietet"])
    ls["genutzt_von"] = vereinige(ls.get("genutzt_von"), LEADS_ERGAENZUNG["schnittstellen"]["genutzt_von"])
    ls["vertraege"] = vereinige(ls.get("vertraege"), LEADS_ERGAENZUNG["schnittstellen"]["vertraege"])

    if json.dumps(register, sort_keys=True) != vorher:
        json.dump(register, io.open(REGISTER, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2, sort_keys=True)
        print("projekte.json: '%s' geschrieben, 'leads' ergaenzt" % NAME)
    else:
        print("projekte.json: war schon aktuell")

    ziele = lade(ZIELE, [])
    vorhanden = {z.get("name") for z in ziele}
    ergaenzt = 0
    for ziel in ZIELE_NEU:
        if ziel["name"] in vorhanden:
            continue
        ziele.append(ziel)
        ergaenzt += 1
    if ergaenzt:
        json.dump(ziele, io.open(ZIELE, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        st = os.stat("/opt/sunds-waechter")
        os.chown(ZIELE, st.st_uid, st.st_gid)
        print("ziele.json: %d Ziel(e) ergaenzt, jetzt %d Ziele" % (ergaenzt, len(ziele)))
    else:
        print("ziele.json: alle Ziele waren schon vorhanden")
    return 0


if __name__ == "__main__":
    sys.exit(main())
