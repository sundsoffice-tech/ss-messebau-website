# SMTP Setup-Anleitung für S&S Messebau

Dieses Dokument erklärt Schritt für Schritt, wie Sie echten E-Mail-Versand für die Banner-Bestellungen einrichten.

## Übersicht

Die Website ist bereits mit E-Mail-Funktionalität ausgestattet. Standardmäßig läuft das System im **Test-Modus**, bei dem E-Mails nur simuliert werden. Um echte E-Mails zu versenden, müssen Sie einen SMTP-Provider konfigurieren.

**Wir empfehlen SendGrid** - einfacher Setup, 100 kostenlose E-Mails pro Tag, perfekt für Banner-Bestellungen.

---

## Option 1: SendGrid (Empfohlen)

### Warum SendGrid?
- ✅ Einfacher Setup in 10 Minuten
- ✅ 100 E-Mails pro Tag kostenlos
- ✅ Zuverlässige Zustellung
- ✅ Tracking und Analytics
- ✅ Professioneller Support

### Schritt 1: SendGrid Account erstellen

1. Gehen Sie zu: https://signup.sendgrid.com
2. Klicken Sie auf "Start for Free"
3. Füllen Sie das Registrierungsformular aus:
   - E-Mail-Adresse (z.B. info@sunds-messebau.de)
   - Passwort erstellen
   - Persönliche Daten eingeben
4. Bestätigen Sie Ihre E-Mail-Adresse (Check-E-Mail in Ihrem Postfach)

### Schritt 2: Absender-E-Mail verifizieren

1. Melden Sie sich bei SendGrid an
2. Gehen Sie zu **Settings** → **Sender Authentication**
3. Wählen Sie **Single Sender Verification**
4. Klicken Sie auf **Create New Sender**
5. Füllen Sie das Formular aus:
   ```
   From Name: S&S Messebau GbR
   From Email Address: noreply@sunds-messebau.de (oder info@sunds-messebau.de)
   Reply To: info@sunds-messebau.de
   Company Address: Marienstr. 37-42, 41836 Hückelhoven
   ```
6. Klicken Sie auf **Create**
7. **Wichtig**: Prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink
8. Warten Sie auf die Bestätigung (kann einige Minuten dauern)

### Schritt 3: API Key erstellen

1. Gehen Sie zu **Settings** → **API Keys**
2. Klicken Sie auf **Create API Key**
3. Geben Sie einen Namen ein: `S&S Messebau Website`
4. Wählen Sie **Full Access** (wichtig!)
5. Klicken Sie auf **Create & View**
6. **WICHTIG**: Kopieren Sie den API Key sofort!
   - Beginnt mit: `SG.`
   - Sie können ihn später nicht mehr sehen
   - Beispiel: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
7. Speichern Sie den API Key sicher (z.B. in einem Passwort-Manager)

### Schritt 4: API Key in der Website einrichten

1. Öffnen Sie Ihre Website: https://ihre-domain.de
2. Scrollen Sie zum Footer und klicken Sie auf **Admin**
3. Sie werden zur Authentifizierung aufgefordert (nur für Projekt-Besitzer)
4. Wechseln Sie zum Tab **SMTP-Konfiguration**
5. Wechseln Sie zum Sub-Tab **SendGrid**
6. Geben Sie folgende Daten ein:
   ```
   SendGrid API Key: [Ihr kopierter API Key]
   Absender E-Mail: noreply@sunds-messebau.de
   Absender Name: S&S Messebau GbR
   ```
7. Klicken Sie auf **SendGrid aktivieren**
8. Klicken Sie auf **Testen** um die Verbindung zu prüfen
9. Sie sollten eine Erfolgsbestätigung sehen

### Schritt 5: Fertig!

✅ Ihr E-Mail-Versand ist jetzt aktiv!

Ab sofort werden alle Banner-Bestellungen automatisch per E-Mail versendet:
- An **info@sunds-messebau.de** mit allen Bestelldetails und Anhängen
- An den **Kunden** mit Auftragsbestätigung und Bestellnummer

### Testen Sie den Versand

1. Gehen Sie zu: https://ihre-domain.de/#/banner-bestellen
2. Füllen Sie eine Test-Bestellung aus
3. Verwenden Sie Ihre eigene E-Mail-Adresse als Kunden-E-Mail
4. Senden Sie die Bestellung ab
5. Prüfen Sie Ihre beiden E-Mail-Postfächer:
   - info@sunds-messebau.de sollte die detaillierte Bestellung erhalten
   - Ihre Test-E-Mail sollte die Kundenbestätigung erhalten

---

## Option 2: AWS SES (Für Fortgeschrittene)

### Warum AWS SES?
- Sehr günstig bei hohem Volumen ($0.10 pro 1000 E-Mails)
- Unbegrenzte Skalierung
- Integration mit anderen AWS Services

### Nachteile
- Komplexerer Setup
- Benötigt AWS Account
- Production Access muss beantragt werden
- Technisches Wissen erforderlich

### Kurzanleitung AWS SES

1. **AWS Account erstellen**: https://aws.amazon.com
2. **SES aktivieren**: In der AWS Console, Region auswählen (z.B. eu-central-1 Frankfurt)
3. **E-Mail verifizieren**: Verified Identities → Create Identity
4. **Production Access beantragen**: Service Quotas → Request increase
5. **IAM User erstellen**: Mit SES-Berechtigung (AmazonSESFullAccess)
6. **Access Key erstellen**: Notieren Sie Access Key ID und Secret Access Key
7. **In Website konfigurieren**: Admin → SMTP-Konfiguration → AWS SES

**Hinweis**: Aufgrund der Komplexität empfehlen wir SendGrid für den Start.

---

## Häufig gestellte Fragen (FAQ)

### Warum werden keine E-Mails versendet?

**Überprüfen Sie:**
1. Ist der Provider aktiviert? (Admin → SMTP-Konfiguration → Status prüfen)
2. Ist der API Key korrekt? (Sollte mit `SG.` beginnen bei SendGrid)
3. Ist die Absender-E-Mail verifiziert? (Bei SendGrid unter Sender Authentication)
4. Sind E-Mails im Spam-Ordner gelandet?

### Wie viele E-Mails kann ich versenden?

**SendGrid Free Plan:**
- 100 E-Mails pro Tag
- Perfekt für Banner-Bestellungen (ca. 5-20 Bestellungen/Tag = 10-40 E-Mails)

**Wenn Sie mehr benötigen:**
- SendGrid Essentials: ab $19.95/Monat für 50.000 E-Mails
- AWS SES: Pay-as-you-go, $0.10 pro 1000 E-Mails

### Kann ich mehrere Absender-E-Mails verwenden?

Ja, aber jede E-Mail muss einzeln verifiziert werden:
- `info@sunds-messebau.de` für allgemeine Anfragen
- `noreply@sunds-messebau.de` für automatische E-Mails
- `angebote@sunds-messebau.de` für Angebote

### Was passiert, wenn das Limit überschritten wird?

Bei SendGrid:
- E-Mails werden in der Queue gespeichert
- Sie werden am nächsten Tag automatisch versendet
- Sie erhalten eine Benachrichtigung von SendGrid

### Können Kunden die E-Mails beantworten?

Ja! Die Reply-To Adresse ist auf `info@sunds-messebau.de` gesetzt. Wenn ein Kunde auf die Bestätigungs-E-Mail antwortet, landet die Antwort in Ihrem normalen Postfach.

### Wie sehe ich, welche E-Mails versendet wurden?

1. **In der Website**: Admin → E-Mail Queue (zeigt ausstehende E-Mails)
2. **Bei SendGrid**: Dashboard → Activity (zeigt alle versendeten E-Mails mit Status)
3. **In Ihrem Postfach**: Kopie jeder Firmen-E-Mail wird an info@sunds-messebau.de gesendet

### Sind die E-Mails DSGVO-konform?

Ja:
- ✅ Kunden müssen DSGVO-Checkbox aktivieren vor dem Absenden
- ✅ Datenschutzerklärung ist verlinkt
- ✅ Daten werden nur für Angebotserstellung verwendet
- ✅ E-Mails enthalten Kontaktdaten für Rückfragen
- ✅ Server in EU (SendGrid EU, AWS eu-central-1)

### Kann ich die E-Mail-Templates anpassen?

Ja, aber es erfordert Code-Anpassungen:
1. Datei öffnen: `/src/lib/email-service.ts`
2. Funktionen anpassen:
   - `formatConfigForEmail()` für Firmen-E-Mail
   - `generateCustomerConfirmationEmail()` für Kunden-E-Mail
3. HTML und Texte anpassen
4. Speichern und testen

**Empfehlung**: Kontaktieren Sie Ihren Entwickler für Template-Anpassungen.

---

## Fehlerbehebung

### "API Key ungültig" Fehler

**Lösung:**
1. Prüfen Sie, ob der API Key mit `SG.` beginnt
2. Prüfen Sie, ob der Key "Full Access" hat
3. Erstellen Sie einen neuen API Key bei SendGrid
4. Geben Sie den neuen Key in der Website ein

### "Absender nicht verifiziert" Fehler

**Lösung:**
1. Gehen Sie zu SendGrid → Settings → Sender Authentication
2. Prüfen Sie den Status Ihrer E-Mail-Adresse
3. Falls nicht verifiziert: Klicken Sie auf "Resend Verification"
4. Klicken Sie auf den Link in der E-Mail
5. Warten Sie 5-10 Minuten und versuchen Sie es erneut

### E-Mails landen im Spam

**Lösung:**
1. **Domain Authentication einrichten** (empfohlen):
   - SendGrid → Settings → Sender Authentication → Authenticate Your Domain
   - Folgen Sie den Anweisungen (DNS-Einträge bei Ihrem Domain-Anbieter)
   - Verbessert Zustellbarkeit erheblich
2. **E-Mail-Inhalt prüfen**:
   - Vermeiden Sie Spam-Wörter (kostenlos, gewonnen, etc.)
   - Verwenden Sie professionelles HTML
3. **Kunden informieren**:
   - E-Mail von noreply@sunds-messebau.de zu Kontakten hinzufügen

### Test-Modus lässt sich nicht deaktivieren

**Lösung:**
1. Prüfen Sie, ob Sie als Administrator angemeldet sind
2. Prüfen Sie, ob Sie der Projekt-Besitzer sind (nur Owner kann Einstellungen ändern)
3. Öffnen Sie Admin → SMTP-Konfiguration
4. Wählen Sie SendGrid oder AWS SES (nicht "Test-Modus")
5. Geben Sie API Key ein und speichern Sie

---

## Support und Kontakt

### SendGrid Support
- **Dokumentation**: https://docs.sendgrid.com
- **Support**: https://support.sendgrid.com
- **Status**: https://status.sendgrid.com

### S&S Messebau Support
- **E-Mail**: info@sunds-messebau.de
- **Telefon**: (02433) 4427144
- **Mobil**: (01514) 0322125

### Technischer Support
Für technische Fragen zur Website-Integration kontaktieren Sie Ihren Entwickler oder das Spark-Support-Team.

---

## Checkliste: Ersteinrichtung

Verwenden Sie diese Checkliste, um sicherzustellen, dass alles korrekt eingerichtet ist:

- [ ] SendGrid Account erstellt
- [ ] E-Mail-Adresse bestätigt
- [ ] Absender-E-Mail verifiziert (Single Sender Verification)
- [ ] API Key erstellt (Full Access)
- [ ] API Key in Website eingetragen (Admin → SMTP-Konfiguration)
- [ ] Provider auf "SendGrid" gesetzt
- [ ] Absender-Daten konfiguriert (noreply@sunds-messebau.de)
- [ ] Verbindungstest durchgeführt (erfolgreich)
- [ ] Test-Bestellung durchgeführt
- [ ] Firmen-E-Mail an info@sunds-messebau.de erhalten
- [ ] Kunden-E-Mail erhalten
- [ ] E-Mails sind korrekt formatiert
- [ ] Anhänge funktionieren (falls Druckdaten hochgeladen)
- [ ] Reply-To funktioniert (E-Mail beantwortet → landet bei info@sunds-messebau.de)

**Herzlichen Glückwunsch!** 🎉 Ihr E-Mail-Versand ist jetzt vollständig eingerichtet und funktioniert.

---

## Nächste Schritte

Nach erfolgreicher Einrichtung können Sie:

1. **Domain Authentication einrichten** (empfohlen):
   - Verbessert Zustellbarkeit
   - Verhindert Spam-Einstufung
   - SendGrid → Settings → Sender Authentication → Authenticate Your Domain

2. **E-Mail-Templates testen**:
   - Verschiedene Szenarien durchspielen
   - Mit und ohne Anhänge
   - Express-Lieferung, Montage, etc.

3. **Monitoring einrichten**:
   - SendGrid Dashboard täglich prüfen
   - E-Mail-Queue im Admin-Dashboard überwachen
   - Bei Problemen: Sofort reagieren

4. **Team schulen**:
   - Zeigen Sie Ihrem Team das Admin-Dashboard
   - Erklären Sie, wie E-Mails verwaltet werden
   - Dokumentieren Sie den Prozess

---

**Viel Erfolg mit Ihrem professionellen E-Mail-Versand!** 📧
