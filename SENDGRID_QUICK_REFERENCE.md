# 📧 SendGrid Quick Reference Card

**Für schnellen Zugriff auf wichtige Informationen**

---

## 🔑 Wichtige Zugangsdaten

### SendGrid Login
- **URL:** https://app.sendgrid.com/login
- **E-Mail:** `info@sundsmessebau.de`
- **Passwort:** [In Passwort-Manager gespeichert]

### Admin-Dashboard
- **URL:** `#/admin`
- **Zugang:** Nur für GitHub Owner
- **Tabs:** E-Mail Queue | SMTP-Konfiguration | Bestellungen

---

## ⚡ Schnellstart

### E-Mail-Versand aktivieren (5 Minuten)

1. **SendGrid API Key holen:**
   - Login: https://app.sendgrid.com
   - Settings → API Keys → Create API Key
   - Name: "S&S Messebau Website" | Berechtigung: Full Access
   - ⚠️ API Key sofort kopieren (beginnt mit `SG.`)

2. **In Website konfigurieren:**
   - Website öffnen → `#/admin`
   - Tab: "SMTP-Konfiguration" → Sub-Tab: "SendGrid"
   - API Key eintragen → "SendGrid aktivieren" → "Testen"
   - ✅ Erfolgsbestätigung = Fertig!

3. **Test durchführen:**
   - `#/banner-bestellen` → Testbestellung ausfüllen
   - Eigene E-Mail als Kunde angeben
   - Prüfen: 2 E-Mails sollten ankommen

---

## 📊 Status prüfen

### Ist SendGrid aktiv?
- Admin → SMTP-Konfiguration → Badge oben rechts
- 🟢 "SENDGRID" = Aktiv
- 🟡 "Test-Modus" = Nur Simulation

### E-Mails in Warteschlange?
- Admin → E-Mail Queue → Counter oben
- Badge rot = Wartende E-Mails
- Jede E-Mail einzeln prüfen & versenden

### SendGrid Dashboard
- https://app.sendgrid.com
- Dashboard → Activity
- Zeigt: Versendete, zugestellte, geöffnete E-Mails

---

## 🚀 Workflow: Banner-Bestellung

### Automatischer Ablauf

1. **Kunde:** Füllt Banner-Konfigurator aus (`#/banner-bestellen`)
2. **System:** Speichert Bestellung in Queue
3. **Admin:** Prüft E-Mail in Queue (`#/admin` → E-Mail Queue)
4. **Admin:** Klickt "Versenden" (oder automatisch bei Aktivierung)
5. **System:** Versendet 2 E-Mails:
   - ✉️ **An Firma:** `info@sundsmessebau.com` (mit allen Details + Anhängen)
   - ✉️ **An Kunde:** Bestätigung mit Bestellnummer

---

## 📧 E-Mail-Details

### Firmen-E-Mail

**An:** `info@sundsmessebau.com`  
**Betreff:** `Neue Banner-Bestellung: [Firma] - [Menge]x [Rahmenart]`

**Enthält:**
- Vollständige Kundendaten (Firma, Kontakt, E-Mail, Telefon)
- Alle 6 Schritte der Bestellung (Einsatz, Maße, Druck, etc.)
- Hochgeladene Druckdaten als Anhang
- Formatiert als professionelle HTML-E-Mail

### Kunden-E-Mail

**An:** [Kunden-E-Mail aus Formular]  
**Betreff:** `Auftragsbestätigung: Banner-Bestellung #[ID]`

**Enthält:**
- Bestellbestätigung mit Zusammenfassung
- Bestellnummer
- Zeitplan (24h Antwortzeit)
- Nächste Schritte
- S&S Messebau Kontaktdaten

---

## 🔧 Häufige Aufgaben

### E-Mail aus Queue versenden
1. Admin → E-Mail Queue
2. E-Mail anklicken → "Vorschau" (optional)
3. "Versenden" klicken
4. ✅ Bestätigung abwarten

### Verbindung testen
1. Admin → SMTP-Konfiguration
2. "Testen" klicken
3. ✅ = Alles OK | ❌ = Fehler beheben

### API Key ändern
1. Neuen Key bei SendGrid erstellen
2. Admin → SMTP-Konfiguration → SendGrid
3. Neuen Key eintragen → "SendGrid aktivieren"
4. "Testen" klicken

### E-Mail-Vorschau anzeigen
1. Admin → E-Mail Queue
2. E-Mail auswählen → "Vorschau"
3. Toggle: "Firmen-E-Mail" ↔ "Kunden-E-Mail"

---

## ⚠️ Troubleshooting

### Problem: E-Mails werden nicht versendet

**Prüfen:**
- ✓ SendGrid aktiv? (Badge = "SENDGRID", nicht "Test-Modus")
- ✓ API Key korrekt? (beginnt mit `SG.`)
- ✓ Absender verifiziert? (SendGrid → Sender Authentication → Status "Verified")
- ✓ Internet-Verbindung OK?

**Lösung:**
- Verbindungstest durchführen (zeigt konkreten Fehler)
- Ggf. neuen API Key erstellen

### Problem: E-Mails landen im Spam

**Kurzfristig:**
- Kunde informieren: Spam-Ordner prüfen
- `noreply@sundsmessebau.de` zu Kontakten hinzufügen

**Langfristig:**
- Domain Authentication einrichten (siehe unten)

### Problem: API Key ungültig

**Lösung:**
1. SendGrid → Settings → API Keys
2. Alten Key löschen
3. Neuen Key erstellen (Full Access)
4. In Website eintragen

### Problem: Zu viele E-Mails (Limit erreicht)

**SendGrid Free Plan:** 100 E-Mails/Tag

**Lösungen:**
- Warten bis nächster Tag (E-Mails bleiben in Queue)
- Upgrade auf SendGrid Essentials ($19.95/Monat = 50.000 E-Mails)
- Wechsel zu AWS SES (günstiger bei hohem Volumen)

---

## 🎯 Best Practices

### Tägliche Routine
- [ ] E-Mail Queue prüfen (wartende E-Mails?)
- [ ] SendGrid Dashboard prüfen (Fehler? Bounces?)
- [ ] info@sundsmessebau.com Postfach prüfen (neue Bestellungen?)

### Wöchentliche Routine
- [ ] SendGrid Activity prüfen (Zustellraten OK?)
- [ ] Kunden-Feedback sammeln (E-Mails angekommen?)
- [ ] Statistiken notieren (wie viele Bestellungen?)

### Monatliche Routine
- [ ] SendGrid Limit prüfen (Upgrade nötig?)
- [ ] E-Mail-Templates prüfen (Verbesserungen?)
- [ ] DSGVO-Compliance prüfen (alles konform?)

---

## 📈 Limits & Kosten

### SendGrid Free Plan
- **Kosten:** $0/Monat
- **Limit:** 100 E-Mails/Tag = 50 Bestellungen/Tag
- **Perfekt für:** Start, Tests, niedrige Volumina

### SendGrid Essentials
- **Kosten:** $19.95/Monat
- **Limit:** 50.000 E-Mails/Monat = 25.000 Bestellungen/Monat
- **Perfekt für:** Professioneller Betrieb, mittlere Volumina

### SendGrid Pro
- **Kosten:** $89.95/Monat
- **Limit:** 100.000+ E-Mails/Monat
- **Perfekt für:** Hohe Volumina, große Unternehmen

---

## 🔐 Sicherheit

### API Key Schutz
- ⚠️ Niemals API Key per E-Mail senden
- ⚠️ Niemals API Key im Code speichern
- ✅ Nur im Admin-Panel eingeben
- ✅ In Passwort-Manager speichern

### Zugriffskontrolle
- Nur GitHub Owner haben Admin-Zugang
- Keine Weitergabe von Zugangsdaten
- Regelmäßig überprüfen: Wer hat Zugriff?

### DSGVO
- Kunden müssen Checkbox aktivieren
- Daten nur für Angebotserstellung verwenden
- Keine Weitergabe an Dritte (außer SendGrid als Processor)

---

## 🆙 Erweiterte Features

### Domain Authentication (empfohlen)

**Warum?**
- ✅ Bessere Zustellraten (weniger Spam)
- ✅ Professioneller (`@sundsmessebau.de` statt `@sendgrid.net`)
- ✅ Vertrauenswürdiger für E-Mail-Provider

**Wie?**
1. SendGrid → Settings → Sender Authentication
2. "Authenticate Your Domain" klicken
3. Domain eingeben: `sundsmessebau.de`
4. DNS-Einträge kopieren (CNAME, MX)
5. Bei Domain-Provider eintragen (z.B. Strato, 1&1, etc.)
6. Verifizierung abwarten (bis 48h)
7. ✅ Fertig

### Automatischer Versand

**Standard:** E-Mails werden in Queue gespeichert, Admin versendet manuell  
**Automatisch:** E-Mails werden sofort versendet (keine manuelle Freigabe)

**Aktivieren:** (erfordert Code-Änderung)
- Datei: `src/components/pages/configurator/Step6Form.tsx`
- Zeile ~85: `sendImmediately: false` → `sendImmediately: true`

**Vorteil:** Schneller, keine manuelle Arbeit  
**Nachteil:** Keine Kontrollmöglichkeit vor Versand

---

## 📞 Support & Links

### SendGrid
- **Login:** https://app.sendgrid.com/login
- **Dokumentation:** https://docs.sendgrid.com
- **Support:** https://support.sendgrid.com
- **Status:** https://status.sendgrid.com

### S&S Messebau
- **Website:** https://[ihre-domain].de
- **Admin:** https://[ihre-domain].de/#/admin
- **E-Mail:** info@sundsmessebau.de
- **Telefon:** (02433) 4427144

### Anleitungen
- **Ausführlich:** `SENDGRID_SETUP_ANLEITUNG.md`
- **SMTP-Guide:** `SMTP_SETUP_GUIDE.md`
- **E-Mail-System:** `EMAIL_SYSTEM.md`

---

## ✅ Checkliste: Produktiv-Betrieb

### Einmalig (Setup)
- [x] SendGrid Account erstellt
- [x] Absender-E-Mail verifiziert
- [x] API Key erstellt & eingetragen
- [x] Verbindungstest erfolgreich
- [x] Test-Bestellung durchgeführt
- [ ] Domain Authentication eingerichtet (optional, empfohlen)

### Täglich
- [ ] E-Mail Queue geprüft
- [ ] Wartende E-Mails versendet
- [ ] info@sundsmessebau.com Postfach geprüft

### Bei Problemen
- [ ] Browser-Konsole geprüft (F12 → Console)
- [ ] SendGrid Dashboard geprüft (Activity)
- [ ] Verbindungstest durchgeführt
- [ ] Dokumentation konsultiert
- [ ] Bei Bedarf: Support kontaktiert

---

**Letzte Aktualisierung:** Dezember 2024  
**Version:** 1.0  
**Erstellt für:** S&S Messebau GbR
