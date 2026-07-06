# SendGrid API Konfiguration - Komplette Anleitung

## 📋 Übersicht

Diese Anleitung führt Sie Schritt für Schritt durch die Konfiguration des SendGrid E-Mail-Versands für Ihre S&S Messebau Website. Nach Abschluss werden alle Banner-Bestellungen automatisch per E-Mail an `info@sunds-messebau.de` versendet.

## ✨ Was ist bereits implementiert?

✅ **Vollständiges E-Mail-System:**
- SMTP-Service mit Support für SendGrid, AWS SES und Test-Modus
- E-Mail-Queue-Management im Admin-Bereich
- Automatische Bestätigungs-E-Mails an Kunden
- Dateianhänge (Druckdaten) werden mitgesendet
- Professionelle HTML-E-Mail-Templates mit S&S Messebau Branding

✅ **Admin-Dashboard:**
- SMTP-Konfigurationspanel unter `/admin`
- E-Mail-Queue-Verwaltung
- Test-Funktion für E-Mail-Versand
- Status-Übersicht

## 🚀 SendGrid Einrichtung (5 Minuten)

### Schritt 1: SendGrid Account erstellen

1. **Account registrieren:**
   - Gehen Sie zu: https://signup.sendgrid.com
   - Wählen Sie "Free Plan" (100 E-Mails/Tag kostenlos)
   - Füllen Sie das Formular aus:
     - Vorname, Nachname
     - E-Mail: info@sunds-messebau.de (empfohlen)
     - Passwort
   - Bestätigen Sie Ihre E-Mail-Adresse

2. **Account-Verifizierung:**
   - SendGrid sendet eine Bestätigungs-E-Mail
   - Klicken Sie auf den Bestätigungslink
   - Schließen Sie das Setup-Tutorial ab

### Schritt 2: Single Sender Verification

Um E-Mails versenden zu können, muss Ihre Absender-Adresse verifiziert werden:

1. **Im SendGrid Dashboard:**
   - Klicken Sie links auf **"Settings"** → **"Sender Authentication"**
   - Wählen Sie **"Single Sender Verification"** (empfohlen für den Start)

2. **Absender-Informationen eingeben:**
   - From Name: `S&S Messebau GbR`
   - From Email Address: `noreply@sunds-messebau.de` oder `info@sunds-messebau.de`
   - Reply To: `info@sunds-messebau.de`
   - Company Address:
     - Street: `Marienstr. 37-42`
     - City: `Hückelhoven`
     - ZIP: `41836`
     - Country: `Germany`
   - Klicken Sie auf **"Create"**

3. **E-Mail-Verifizierung:**
   - SendGrid sendet eine E-Mail an die angegebene Adresse
   - Öffnen Sie die E-Mail und klicken Sie auf **"Verify Single Sender"**
   - ✅ Status sollte nun "Verified" sein

### Schritt 3: API Key erstellen

1. **Navigieren Sie zu API Keys:**
   - Klicken Sie links auf **"Settings"** → **"API Keys"**
   - Klicken Sie auf **"Create API Key"**

2. **API Key konfigurieren:**
   - API Key Name: `S&S Messebau Website` (oder ein beliebiger Name)
   - API Key Permissions: **"Full Access"** (empfohlen) oder **"Restricted Access"**
     - Bei Restricted Access: Mindestens "Mail Send" aktivieren

3. **API Key kopieren:**
   - ⚠️ **WICHTIG:** Der Key wird nur EINMAL angezeigt!
   - Klicken Sie auf **"Create & View"**
   - Der Key beginnt mit `SG.` und ist etwa 69 Zeichen lang
   - Kopieren Sie den kompletten Key (z.B. `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Speichern Sie ihn temporär in einem Textdokument

### Schritt 4: API Key in der Website konfigurieren

1. **Admin-Bereich öffnen:**
   - Öffnen Sie Ihre Website
   - Navigieren Sie zu: `#/admin`
   - Melden Sie sich mit Ihrem GitHub-Account an (Owner-Berechtigung erforderlich)

2. **SMTP-Konfiguration:**
   - Wechseln Sie zum Tab **"SMTP-Konfiguration"**
   - Wechseln Sie zum Sub-Tab **"SendGrid"**

3. **API Key eintragen:**
   - Fügen Sie den kopierten API Key in das Feld **"SendGrid API Key"** ein
   - Überprüfen Sie die **"Absender E-Mail"**: `noreply@sunds-messebau.de`
   - Überprüfen Sie den **"Absender Name"**: `S&S Messebau GbR`
   - Klicken Sie auf **"SendGrid aktivieren"**
   - ✅ Sie sollten eine Erfolgsbestätigung sehen

### Schritt 5: Verbindung testen

1. **Test-E-Mail senden:**
   - Klicken Sie auf den Button **"Testen"**
   - Warten Sie 2-3 Sekunden
   - Bei Erfolg: ✅ Grüne Meldung "Verbindungstest erfolgreich"
   - Bei Fehler: ❌ Rote Meldung mit Fehlerbeschreibung

2. **Bei Fehlern prüfen:**
   - ✓ Ist der API Key korrekt eingefügt? (muss mit `SG.` beginnen)
   - ✓ Ist die Absender-E-Mail in SendGrid verifiziert?
   - ✓ Hat der API Key "Mail Send" Berechtigung?
   - ✓ Ist Ihr SendGrid-Account aktiv?

## 📧 E-Mail-Versand testen

### Test 1: Banner-Bestellung durchführen

1. **Konfigurator öffnen:**
   - Navigieren Sie zu: `#/banner-bestellen`
   - Füllen Sie alle 6 Schritte aus
   - Verwenden Sie eine echte E-Mail-Adresse im Schritt 6

2. **Bestellung absenden:**
   - Akzeptieren Sie die Datenschutzerklärung
   - Klicken Sie auf **"Konfiguration senden"**
   - ✅ Sie sollten eine Erfolgsbestätigung sehen

3. **E-Mails prüfen:**
   - **Firmen-E-Mail:** Prüfen Sie `info@sunds-messebau.de`
     - Betreff: "Neue Banner-Bestellung: [Firma] - [Menge]x [Rahmenart]"
     - Enthält: Alle Bestelldetails, Kundenkontakt, ggf. Dateianhänge
   - **Kunden-E-Mail:** Prüfen Sie die eingegebene Kunden-E-Mail
     - Betreff: "Auftragsbestätigung: Banner-Bestellung #[ID]"
     - Enthält: Zusammenfassung, nächste Schritte

### Test 2: E-Mail-Queue im Admin

1. **Queue öffnen:**
   - Navigieren Sie zu: `#/admin`
   - Tab: **"E-Mail Queue"**

2. **E-Mails manuell senden:**
   - Sie sehen alle wartenden E-Mails
   - Klicken Sie auf **"Versenden"** bei einer E-Mail
   - ✅ Nach erfolgreichem Versand verschwindet die E-Mail aus der Queue

3. **E-Mail-Vorschau:**
   - Klicken Sie auf **"Vorschau"**
   - Wechseln Sie zwischen "Firmen-E-Mail" und "Kunden-E-Mail"
   - Prüfen Sie die Formatierung und Inhalte

## 🎯 Produktiv-Betrieb

### Standard-Workflow

1. **Kunde füllt Banner-Bestellung aus** (`#/banner-bestellen`)
2. **E-Mail wird in Queue gespeichert** (sofortige Bestätigung für Kunde)
3. **Admin prüft E-Mail im Dashboard** (`#/admin` → "E-Mail Queue")
4. **Admin sendet E-Mail manuell** (oder automatisch bei sofortigem Versand)
5. **Beide E-Mails werden versendet:**
   - ✉️ An Firma: `info@sunds-messebau.de` mit allen Details
   - ✉️ An Kunde: Bestätigung mit nächsten Schritten

### Automatischer Versand (optional)

Wenn Sie möchten, dass E-Mails sofort versendet werden:

1. **Code-Änderung erforderlich:**
   - Datei: `src/components/pages/configurator/Step6Form.tsx`
   - Zeile ca. 85: `sendImmediately: false` → `sendImmediately: true`

2. **Vorteil:** Keine manuelle Prüfung nötig
3. **Nachteil:** Keine Möglichkeit zur Vorprüfung

### Monitoring

**Status-Badge im Admin:**
- 🟢 Grün = SendGrid aktiv
- 🟡 Gelb = Test-Modus (keine echten E-Mails)

**E-Mail-Queue Counter:**
- Zeigt Anzahl wartender E-Mails
- Badge wird rot bei wartenden E-Mails

## 🔧 Erweiterte Konfiguration

### Domain Authentication (optional, empfohlen für Produktion)

Für bessere Zustellraten und professionelleres Branding:

1. **Im SendGrid Dashboard:**
   - Settings → Sender Authentication → **"Authenticate Your Domain"**

2. **DNS-Einträge hinzufügen:**
   - SendGrid zeigt Ihnen DNS-Einträge (CNAME, MX)
   - Fügen Sie diese bei Ihrem Domain-Provider hinzu
   - Nach Verifizierung: E-Mails kommen von `@sunds-messebau.de`

### E-Mail-Limits

**SendGrid Free Plan:**
- 100 E-Mails/Tag
- Pro Bestellung: 2 E-Mails (1x Firma, 1x Kunde)
- = **50 Bestellungen/Tag** möglich

**Upgrade erforderlich bei:**
- Mehr als 50 Bestellungen/Tag
- Mehr als 1.500 Bestellungen/Monat

**SendGrid Essentials Plan:**
- $19.95/Monat
- 50.000 E-Mails/Monat
- = **25.000 Bestellungen/Monat** möglich

## ❓ Troubleshooting

### Problem: "SendGrid API Fehler: 401"
**Lösung:** API Key ist ungültig oder falsch kopiert
- Erstellen Sie einen neuen API Key
- Kopieren Sie ihn vollständig (inkl. `SG.`)
- Tragen Sie ihn erneut ein

### Problem: "SendGrid API Fehler: 403"
**Lösung:** API Key hat keine Mail-Send Berechtigung
- Erstellen Sie einen neuen Key mit "Full Access"
- Oder prüfen Sie die Restricted Access Permissions

### Problem: "E-Mails kommen nicht an"
**Lösung 1:** Absender-E-Mail nicht verifiziert
- Prüfen Sie in SendGrid: Settings → Sender Authentication
- Status muss "Verified" sein

**Lösung 2:** E-Mails landen im Spam
- Prüfen Sie Spam-Ordner
- Für Produktion: Domain Authentication einrichten
- Reply-To Adresse sollte existieren

### Problem: "Test-E-Mail erfolgreich, aber Queue-E-Mails schlagen fehl"
**Lösung:** Dateianhänge zu groß
- SendGrid Limit: 30MB pro E-Mail
- Prüfen Sie die Dateigröße der Druckdaten
- Komprimieren Sie große Dateien

### Problem: "Verbindung kann nicht getestet werden"
**Lösung:** Browser-Konsole prüfen
- Öffnen Sie Browser DevTools (F12)
- Tab: "Console"
- Suchen Sie nach Fehlermeldungen
- CORS-Fehler? → SendGrid API ist erreichbar
- Network-Fehler? → Internetverbindung prüfen

## 📊 E-Mail-Templates

### Firmen-E-Mail (info@sunds-messebau.de)

**Enthält:**
- ✅ Vollständige Kundeninformationen
- ✅ Alle Bestelldetails (6 Schritte)
- ✅ Hochgeladene Druckdaten als Anhang
- ✅ Formatiert mit S&S Branding
- ✅ Direkte Links (E-Mail, Telefon)

**Verwendung:**
- Für interne Bearbeitung
- Alle Infos für Angebotserstellung
- Zugriff auf Kundendaten

### Kunden-E-Mail

**Enthält:**
- ✅ Bestellbestätigung mit Bestellnummer
- ✅ Zusammenfassung der wichtigsten Daten
- ✅ Zeitplan (24h Antwortzeit)
- ✅ Nächste Schritte
- ✅ Kontaktdaten von S&S Messebau

**Verwendung:**
- Automatische Bestätigung
- Vertrauensaufbau
- Klare Erwartungen

## 🔐 Sicherheit

### API Key Schutz

⚠️ **WICHTIG:**
- API Key NIEMALS in Git committen
- API Key nur im Admin-Panel eingeben
- Wird sicher in Browser-Storage gespeichert
- Nur für authentifizierte Owner sichtbar

### Datenschutz (DSGVO)

✅ **Implementiert:**
- Datenschutz-Checkbox bei Bestellung
- E-Mails enthalten nur notwendige Daten
- Keine Weitergabe an Dritte (außer SendGrid als Processor)
- Kunden werden informiert (Auftragsbestätigung)

**SendGrid DSGVO-Compliance:**
- SendGrid ist DSGVO-konform
- Data Processing Agreement verfügbar
- Server in EU möglich (bei Bedarf konfigurierbar)

## 📱 Support

### SendGrid Support
- Dokumentation: https://docs.sendgrid.com
- Support-Portal: https://support.sendgrid.com
- Status-Page: https://status.sendgrid.com

### S&S Messebau Website Support
- Admin-Dashboard: `#/admin`
- E-Mail-Queue: Monitoring & manuelle Steuerung
- Test-Funktion: Jederzeit Verbindung prüfbar

## ✅ Checkliste: Setup abgeschlossen?

- [ ] SendGrid Account erstellt
- [ ] E-Mail-Adresse verifiziert (Single Sender Verification)
- [ ] API Key erstellt (mit Mail Send Berechtigung)
- [ ] API Key im Admin-Panel eingetragen
- [ ] Verbindungstest erfolgreich
- [ ] Test-Bestellung durchgeführt
- [ ] Firmen-E-Mail erhalten (`info@sunds-messebau.de`)
- [ ] Kunden-E-Mail erhalten (eigene Testadresse)
- [ ] E-Mail-Queue im Admin geprüft
- [ ] Status-Badge zeigt "SendGrid" an (nicht "Test-Modus")

## 🎉 Herzlichen Glückwunsch!

Ihr E-Mail-System ist jetzt vollständig konfiguriert und einsatzbereit!

**Was funktioniert jetzt:**
- ✉️ Automatische Bestellbestätigungen per E-Mail
- 📎 Druckdaten-Anhänge werden mitgesendet
- 👥 Kunden erhalten sofortige Bestätigung
- 📊 Admin hat volle Kontrolle über E-Mail-Versand
- 🔒 Sicherer, DSGVO-konformer Versand

**Nächste Schritte:**
1. Testen Sie das System mit echten Bestellungen
2. Überwachen Sie die E-Mail-Queue regelmäßig
3. Bei Bedarf: Domain Authentication für bessere Zustellraten
4. Bei hohem Volumen: Upgrade auf SendGrid Essentials Plan

---

**Letzte Aktualisierung:** Dezember 2024  
**Version:** 1.0  
**System:** S&S Messebau Website - Banner-Konfigurator
