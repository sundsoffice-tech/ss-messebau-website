# Schnittstelle Messebau-Website → Lead-Endpunkt (sunds-hub)

Vertrag nach `/opt/sunds-hub/KONVENTION.md` § 8. Kopien: hier (Repo der Website),
`/opt/sunds-hub/schnittstellen/messebau-website-leads.md` (Server) und
`/opt/sunds-leads/SCHNITTSTELLE-MESSEBAU-WEBSITE.md` (Projektordner des Endpunkts).
Registereintrag: `projekte.json` → `messebau-website` (braucht) und `leads` (bietet).

Stand: 2026-08-21 · Entscheidung Fabrice: **parallel zum bestehenden SendGrid-Mailing**,
bis der Lead-Weg vier Wochen sauber läuft. Danach wird entschieden, ob SendGrid bleibt.

## 1 · Was die Website braucht und warum

Das Anfrageformular der Website (`InquiryDialog`, `KontaktPage`) speichert heute in
`api/inquiries.php` (SQLite auf Hostinger) und schickt per SendGrid eine Mail an die
konfigurierten Empfänger. Fällt SendGrid **und** das Hostinger-Backend aus, existiert die
Anfrage nur noch im Browser des Besuchers — und niemand merkt es.

Der Lead-Endpunkt dreht die Reihenfolge um: **speichern (fsync), dann 200, dann Mail, bei
Fehler alle 5 min nachsenden + ntfy.** Er ist damit der zweite, unabhängige Zustellweg.
Die Website sendet **zusätzlich**, nie statt.

## 2 · Der Aufruf

```
POST https://leads.sundsconnect.de/lead
Origin: https://sunds-messebau.de   (Browser setzt ihn; Endpunkt prüft gegen kunden.json)
Content-Type: application/json

{
  "kunde":     "messebau",
  "name":      "Erika Muster",                  Pflicht, ≥ 2 Zeichen, ≤ 120
  "telefon":   "+49 2161 123456" | "",          optional (telefon_pflicht=false), ≤ 60, Format [0-9+()/ .-]{6,}
  "email":     "erika@example.org",             Pflicht, wenn telefon leer; ≤ 180
  "firma":     "Muster GmbH",                   optional, ≤ 160   (neu seit 2026-08-21)
  "plz":       "",                              optional, ≤ 10    (Website hat kein PLZ-Feld)
  "nachricht": "…",                             ≤ 4000, siehe § 3
  "seite":     "/kontakt",                      ≤ 300, Pfad der Seite
  "botcheck":  ""                               Honigtopf, MUSS leer bleiben
}

→ 200 {"ok": true, "vorgang": "a1b2c3d4e5"}     gespeichert (Mail folgt)
→ 200 {"ok": true}                              Honigtopf gefüllt: NICHTS gespeichert
→ 400 {"ok": false, "fehler": "…"}              Validierung (Text ist für Besucher formuliert)
→ 403 {"ok": false, "fehler": "Herkunft nicht freigegeben"}
→ 413 Nutzlast > 16 KB · 429 mehr als 5 Anfragen/IP/Stunde · 500 technischer Fehler
```

**Zusagenliste (KONVENTION § 8.4):** Die Website sendet genau diese neun Schlüssel und
keinen weiteren. Der Endpunkt ignoriert unbekannte Schlüssel nicht stillschweigend als
„Feature", sondern der Test `lead-relay.test.ts` prüft, dass keiner dazukommt.

## 3 · Abbildung Website → Endpunkt

| Website-Feld | Lead-Feld | Hinweis |
|---|---|---|
| `name` | `name` | |
| `phone` | `telefon` | optional auf der Website |
| `email` | `email` | Pflicht auf der Website |
| `company` | `firma` | Pflicht auf der Website |
| `message` | `nachricht` (Kopf) | |
| `event`, `size`, `budget`, `messesProJahr`, `wunschtermin`, `branche`, `position`, `wieGefunden`, `utm_source/medium/campaign` | `nachricht` (Block „— Angaben aus dem Formular —") | nur gefüllte Felder |
| Formulartyp + interne ID `inq-…` | `nachricht` (letzte Zeile) | verbindet Lead mit `api/inquiries.php` |
| `window.location.pathname` | `seite` | |

Implementierung: `src/lib/lead-relay.ts` (`buildLeadPayload`, `relayLeadToHub`,
`relayInquiryLead`); wirft nie. Aufruf in beiden Formularen **parallel** zu
`sendFormNotification` (`Promise.all`). Erfolgsbedingung des Formulars: API **oder**
SendGrid **oder** Lead-Endpunkt hat angenommen — erst wenn alle drei scheitern, sieht
der Besucher die Fehlermeldung.

## 4 · Was der Endpunkt dafür zugesagt hat (Seite sunds-hub)

- `kunden.json` → `messebau`: Empfänger `Info@sundsmessebau.com` (Leitstand liest dieses
  Postfach, Firma `messebau`), `betreff` „Neue Anfrage (Website sunds-messebau.de)",
  `telefon_pflicht: false`, `nachricht_titel: "Nachricht:"`, `herkunft` = die sechs
  Domain-Varianten (`sunds-messebau.de`, `sundsmessebau.de`, `sundsmessebau.com`, je mit/ohne www).
- `dienst.py`: Feld `firma` (optional), Telefon-Pflicht je Kunde, E-Mail-Mindestform,
  Mailtext mit E-Mail-/Firma-Zeile. **kge bleibt byte-gleich im Verhalten** (Telefon Pflicht,
  Überschrift „Was passiert ist:"). Beleg: `test-lead-endpunkt.py` (lokaler Verhaltenstest).
- CSP der Website: `connect-src` um `https://leads.sundsconnect.de` erweitert
  (`public/.htaccess` **und** `index.html`-Meta — beide gelten).

## 5 · Was ausdrücklich nicht gebaut wird

- Keine Rückrichtung (Endpunkt → Website). Der Lead lebt danach im Leitstand/Postfach.
- Keine Bestellungen (Banner-Konfigurator, `api/orders.php`) — anderer Prozess, berührt
  das Rechnungsprogramm; eigener Vertrag, wenn gewünscht.
- Kein Abschalten von SendGrid in dieser Runde.

## 6 · Abnahme (als Verbraucher gemessen, KONVENTION § 8.5)

1. `GET https://leads.sundsconnect.de/gesund` → `"kunden"` enthält `"messebau"`.
2. `OPTIONS /lead` mit `Origin: https://sunds-messebau.de` → `Access-Control-Allow-Origin` = Origin.
3. `POST /lead` (Origin wie oben) mit `botcheck: "x"` → `200 {"ok": true}` ohne `vorgang`
   (nichts gespeichert) — testet CORS + Pfad ohne Nebenwirkung.
4. `POST /lead` ohne Telefon, mit E-Mail → `200 {"ok": true, "vorgang": …}`; Mail landet in
   `Info@sundsmessebau.com` mit Zeilen `E-Mail:`/`Firma:` und Überschrift `Nachricht:`.
5. `POST /lead` ohne Telefon **und** ohne E-Mail → `400` mit Besuchertext.
6. Live-Website: CSP-Header enthält `leads.sundsconnect.de`; Bundle enthält den Endpunkt.
7. Außenwächter-Ziel „Lead-Endpunkt leads.sundsconnect.de" bleibt grün.

## 7 · Betrieb

- Offene (nicht zugestellte) Leads: `GET /gesund` → `"offen"`. Dauerhaft > 0 → Mailweg kaputt.
- Protokoll: `sudo journalctl -u sunds-leads -f` auf sunds-hub.
- Wer `kunden.json` ändert: Dienst neu starten (`sudo systemctl restart sunds-leads`) — die
  Datei wird beim Start gelesen.
