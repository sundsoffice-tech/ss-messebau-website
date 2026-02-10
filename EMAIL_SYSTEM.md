# E-Mail-Versand mit SMTP-Integration

## Übersicht

Das E-Mail-System versendet automatisch Auftragsbestätigungen mit Dateianhängen an **info@sundsmessebau.com** und eine Bestätigung an den Kunden. Das System unterstützt **echten E-Mail-Versand** über SendGrid oder AWS SES.

## Funktionsweise

### 1. SMTP-Provider Integration

Das System unterstützt drei Modi:

- **Test-Modus** (Standard): E-Mails werden simuliert und nur in der Browser-Konsole angezeigt
- **SendGrid**: Professioneller E-Mail-Service mit 100 kostenlosen E-Mails/Tag
- **AWS SES**: Amazon Simple Email Service für hohe Volumina zu günstigen Preisen

### 2. Konfiguration im Admin-Dashboard

Zugriff: `/#/admin` → Tab "SMTP-Konfiguration"

#### SendGrid Setup (Empfohlen)

1. Account erstellen auf [signup.sendgrid.com](https://signup.sendgrid.com)
2. E-Mail-Adresse verifizieren (Single Sender Verification)
3. API Key erstellen unter Settings → API Keys (Full Access)
4. Im Admin-Dashboard:
   - Provider: "SendGrid" auswählen
   - API Key einfügen
   - Absender-E-Mail und -Name konfigurieren
   - Speichern und testen

#### AWS SES Setup

1. AWS Account erstellen auf [aws.amazon.com](https://aws.amazon.com)
2. SES Service aktivieren (z.B. Region eu-central-1)
3. E-Mail-Adresse verifizieren (Verified Identities)
4. Production Access beantragen (wenn nötig)
5. IAM Credentials erstellen mit SES-Berechtigung
6. Im Admin-Dashboard konfigurieren

**Hinweis:** AWS SES erfordert zusätzliche Konfiguration (Secret Access Key, Signatur). Für einfachere Integration empfehlen wir SendGrid.

### 3. Automatischer Versand bei Bestellung

Wenn ein Kunde eine Banner-Bestellung abschließt:

1. **Daten werden gespeichert** in der KV-Datenbank
2. **E-Mail wird vorbereitet** mit allen Bestelldetails
3. **Zwei E-Mails werden in Queue gestellt**:
   - **An Firma** (`info@sundsmessebau.com`): Vollständige Bestelldetails mit Anhängen
   - **An Kunde**: Auftragsbestätigung mit nächsten Schritten
4. **Sofortiger Versand** (optional): E-Mails werden direkt über den konfigurierten SMTP-Provider versendet

### 4. E-Mail-Inhalt

#### E-Mail an Firma (info@sundsmessebau.com)
- ✅ Vollständige Kundendaten
- ✅ Alle Konfigurationsdetails (Einsatz, Maße, Druck, Lieferung)
- ✅ Hochgeladene Druckdaten als Anhang (Base64)
- ✅ HTML-formatiert mit professionellem Layout
- ✅ Kontaktinformationen für direkten Rückruf

#### E-Mail an Kunde
- ✅ Persönliche Ansprache
- ✅ Bestellnummer zur Referenz
- ✅ Zusammenfassung der Bestellung
- ✅ Nächste Schritte (4-Punkte-Plan)
- ✅ Kontaktinformationen bei Fragen

### 5. Admin Dashboard

Zugriff: `/#/admin` (nur für Besitzer des Spark-Projekts)

#### Tabs:

**E-Mail Queue**
- Liste aller ausstehenden E-Mails
- Vorschau der E-Mails (Firma & Kunde)
- Einzelversand oder Massenversand
- E-Mails aus Queue löschen
- Versandstatus anzeigen

**SMTP-Konfiguration**
- Provider auswählen (Test/SendGrid/AWS SES)
- API Keys konfigurieren
- Absender-Daten festlegen
- Verbindungstest durchführen
- Status und Empfehlungen anzeigen

**Bestellungen**
- Übersicht über alle Banner-Bestellungen
- Details anzeigen
- Kontakt zu Kunden aufnehmen

## Dateien & Komponenten

### Core Services

**`/src/lib/smtp-service.ts`**: SMTP-Provider Integration
- `sendEmail()`: Versendet E-Mails über konfigurierten Provider
- `saveEmailConfig()`: Speichert SMTP-Konfiguration
- `testEmailConnection()`: Testet Verbindung zum Provider
- `getEmailStatus()`: Gibt aktuellen Provider-Status zurück
- `sendViaSendGrid()`: SendGrid API Integration
- `sendViaSES()`: AWS SES API Integration

**`/src/lib/email-service.ts`**: E-Mail-Erstellung und Queue-Verwaltung
- `sendOrderConfirmationEmail()`: Erstellt und versendet/speichert E-Mails
- `sendQueuedEmail()`: Versendet E-Mail aus Queue
- `formatConfigForEmail()`: Formatiert Bestelldaten als HTML
- `generateCustomerConfirmationEmail()`: Erstellt Kundenbestätigung

### UI Komponenten

**`/src/components/SMTPConfigPanel.tsx`**: SMTP-Konfiguration Interface
- Provider-Auswahl (Test/SendGrid/AWS SES)
- API Key Eingabe mit Sichtbarkeits-Toggle
- Absender-Konfiguration
- Setup-Anleitungen mit Links
- Verbindungstest-Funktion
- Status-Anzeige

**`/src/components/EmailQueueManager.tsx`**: E-Mail Queue Verwaltung
- Anzeige aller ausstehenden E-Mails
- Vorschau-Dialog für Firma und Kunde
- Versand-Funktionen (einzeln/alle)
- Fehlerbehandlung mit Toast-Notifications
- E-Mails löschen

**`/src/components/EmailSystemInfo.tsx`**: Status-Anzeige
- Zeigt aktuellen E-Mail-Modus (Test/Live)
- Provider-Information
- Setup-Hinweise
- Link zum Admin-Dashboard

**`/src/components/pages/AdminPage.tsx`**: Admin Dashboard
- Authentifizierung (nur Owner)
- Statistiken (E-Mails, Bestellungen, Anfragen)
- Tabs für E-Mails, SMTP-Config und Bestellungen

### Integration

**`/src/components/pages/BannerBestellenPage.tsx`**: Banner-Konfigurator
- Ruft `sendOrderConfirmationEmail()` nach Submit auf
- Option für sofortigen Versand
- Zeigt Erfolgsseite mit E-Mail-Status

## Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Kunde füllt Banner-Konfigurator aus                     │
│    - Einsatz, Maße, Druck, Dateien, Lieferung, Kontakt    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Submit: handleSubmit() in BannerBestellenPage.tsx      │
│    - Konfiguration speichern                               │
│    - sendOrderConfirmationEmail() aufrufen                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. E-Mail Service (email-service.ts)                       │
│    - Erstellt HTML-E-Mails (Firma + Kunde)                 │
│    - Speichert in KV: email_queue_{configId}               │
│    - Optional: Sofortiger Versand via SMTP                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SMTP Service (smtp-service.ts)                          │
│    - Lädt Provider-Konfiguration                           │
│    - Versendet via SendGrid/SES oder simuliert             │
│    - Markiert E-Mail als versendet                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Bestätigung                                              │
│    - ✓ E-Mail an info@sundsmessebau.com                    │
│    - ✓ E-Mail an Kunde                                      │
│    - ✓ Dateien als Anhang                                   │
│    - ✓ Toast-Notification bei Erfolg/Fehler               │
└─────────────────────────────────────────────────────────────┘
```

## E-Mail-Queue-Datenstruktur

```typescript
{
  id: "email_queue_banner_1234567890",
  to: "info@sundsmessebau.com",
  subject: "Neue Banner-Bestellung: [Firma] - [Anzahl]x [Rahmenart]",
  htmlBody: "<html>...</html>",
  textBody: "...",
  customerEmail: "kunde@example.com",
  customerSubject: "Auftragsbestätigung: Banner-Bestellung #12345678",
  customerHtmlBody: "<html>...</html>",
  customerTextBody: "...",
  attachments: [
    {
      name: "druckdaten.pdf",
      type: "application/pdf",
      size: 1234567,
      dataUrl: "data:application/pdf;base64,..."
    }
  ],
  configId: "banner_1234567890",
  timestamp: "2024-01-15T10:30:00.000Z",
  sent: false,
  sentAt: null
}
```

## SMTP-Konfiguration-Datenstruktur

```typescript
{
  provider: "sendgrid" | "ses" | "test",
  apiKey: "SG.xxxxxxxxxx" | "AKIA...",
  region: "eu-central-1" (nur für SES),
  fromEmail: "noreply@sundsmessebau.de",
  fromName: "S&S Messebau GbR"
}
```

## Verwendung

### Für Entwickler

```typescript
// E-Mail bei Bestellung versenden (mit sofortigem Versand)
import { sendOrderConfirmationEmail } from '@/lib/email-service'

const configId = `banner_${Date.now()}`
const result = await sendOrderConfirmationEmail({ 
  config: bannerConfig, 
  configId,
  sendImmediately: true
})

if (result.success) {
  console.log('✅ E-Mails versendet')
} else {
  console.error('❌ Fehler:', result.error)
}

// SMTP-Provider konfigurieren
import { saveEmailConfig } from '@/lib/smtp-service'

await saveEmailConfig({
  provider: 'sendgrid',
  apiKey: 'SG.xxxxxxxx',
  fromEmail: 'noreply@sundsmessebau.de',
  fromName: 'S&S Messebau GbR'
})

// Verbindung testen
import { testEmailConnection } from '@/lib/smtp-service'

const result = await testEmailConnection()
if (result.success) {
  console.log('✅ Verbindung OK')
}
```

### Für Administratoren

1. **SMTP konfigurieren**: `/#/admin` → Tab "SMTP-Konfiguration"
   - Provider auswählen (SendGrid empfohlen)
   - API Key eintragen
   - Verbindung testen
   - Speichern

2. **E-Mails verwalten**: `/#/admin` → Tab "E-Mail Queue"
   - Ausstehende E-Mails anzeigen
   - Vorschau anzeigen (Firma/Kunde)
   - Einzeln oder alle versenden
   - Bei Bedarf löschen

3. **Bestellungen einsehen**: `/#/admin` → Tab "Bestellungen"
   - Alle Banner-Bestellungen anzeigen
   - Details und Kontaktdaten

## E-Mail-Template-Features

### HTML-E-Mail Design
- ✅ Responsive Design
- ✅ Inline CSS für maximale Kompatibilität
- ✅ Strukturierte Sections mit Farbcodierung
- ✅ Icons und Badges für visuelle Hervorhebung
- ✅ Firmenbrand (S&S Messebau) im Header/Footer
- ✅ Direktlinks (Tel, E-Mail)

### Informations-Sections
1. **Kunde & Kontakt**: Firmendaten, Ansprechpartner, Kontaktinfo
2. **Einsatz & System**: Rahmenart, Menge, Indoor/Outdoor, Montage
3. **Maße & Ausführung**: Abmessungen, Profil, Ecken, LED
4. **Banner & Druck**: Material, Konfektion, Brandschutz
5. **Druckdaten & Upload**: Liste aller hochgeladenen Dateien
6. **Lieferung & Termin**: Adresse, Datum, Lieferart

## Provider-Vergleich

| Feature | Test-Modus | SendGrid | AWS SES |
|---------|-----------|----------|---------|
| **Setup** | ✅ Keine Konfiguration | ⭐ Einfach | ⚠️ Komplex |
| **Kosten** | Kostenlos | 100/Tag kostenlos | $0.10/1000 E-Mails |
| **E-Mail-Versand** | ❌ Simuliert | ✅ Echt | ✅ Echt |
| **Anhänge** | ❌ Nur Anzeige | ✅ Bis 30MB | ✅ Bis 10MB |
| **Zuverlässigkeit** | N/A | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tracking** | ❌ Nein | ✅ Ja | ⚠️ CloudWatch |
| **Support** | N/A | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Empfohlen für** | Entwicklung | Start/KMU | Enterprise |

## Sicherheit & Datenschutz

- ✅ E-Mails nur an verifizierte Adresse (`info@sundsmessebau.com`)
- ✅ Admin-Zugriff nur für Projekt-Owner
- ✅ API Keys verschlüsselt in KV-Storage
- ✅ Dateien als Base64 in E-Mail (temporär in Queue)
- ✅ DSGVO-Checkbox erforderlich vor Submit
- ✅ Kein Logging sensibler Kundendaten in Console (nur IDs)
- ✅ HTTPS für alle API-Calls zu SMTP-Providern

## Fehlerbehandlung

Das System behandelt verschiedene Fehlerszenarien:

- **Netzwerkfehler**: Fehlermeldung mit Retry-Option
- **API-Fehler**: Details in Toast-Notification
- **Ungültige Credentials**: Hinweis im Admin-Dashboard
- **Anhänge zu groß**: Warnung vor dem Versand
- **Queue-Fehler**: Fallback zu manueller Verwaltung

## Testing

### Test-Modus (Standard)
- E-Mails werden **nicht** versendet
- Ausgabe in Browser-Konsole mit allen Details
- Queue-Funktionalität vollständig getestet
- Perfekt für Entwicklung und Staging

### SendGrid/SES Testing
- Verbindungstest im Admin-Dashboard
- Test-E-Mail an konfigurierte Adresse
- Überprüfung der Zustellbarkeit
- Logging in Provider-Dashboard

## Troubleshooting

### E-Mails kommen nicht an

1. **Provider-Status prüfen**: Admin → SMTP-Konfiguration → Status
2. **API Key überprüfen**: Ist der Key gültig und hat Full Access?
3. **Absender verifiziert**: Ist die From-E-Mail beim Provider verifiziert?
4. **Spam-Ordner**: Kunde soll Spam-Ordner prüfen
5. **Provider-Dashboard**: Logs im SendGrid/AWS Dashboard prüfen

### Anhänge werden nicht versendet

1. **Dateigröße prüfen**: Max. 10-30MB je nach Provider
2. **Format unterstützt**: PDF, AI, EPS, JPG sollten funktionieren
3. **Base64-Encoding**: System encodiert automatisch
4. **Provider-Limits**: SendGrid max. 30MB, SES max. 10MB

### Test-Modus deaktivieren

1. Admin-Dashboard öffnen
2. Tab "SMTP-Konfiguration"
3. Provider wählen (SendGrid/SES)
4. API Key eintragen
5. Speichern und testen

## Support

Bei Fragen oder Problemen:
- **E-Mail**: info@sundsmessebau.de
- **Telefon**: (02433) 4427144
- **Mobil**: (01514) 0322125

## Nächste Schritte / Erweiterungen

- ✅ ~~SMTP-Integration (SendGrid/AWS SES)~~
- 🔄 Webhook für Zustellungsbestätigung
- 📋 E-Mail-Templates im Admin bearbeiten
- 📊 Analytics: Öffnungsrate, Klicks
- ⏰ Reminder-E-Mails nach 24h ohne Antwort
- 📄 PDF-Angebot automatisch generieren und anhängen
- 🔐 OAuth2 für Gmail/Outlook
- 📧 E-Mail-Vorlagen-Bibliothek

## Funktionsweise

### 1. Automatischer Versand bei Bestellung

Wenn ein Kunde eine Banner-Bestellung abschließt:

1. **Daten werden gespeichert** in der KV-Datenbank
2. **E-Mail wird vorbereitet** mit allen Bestelldetails
3. **Zwei E-Mails werden in Queue gestellt**:
   - **An Firma** (`info@sundsmessebau.com`): Vollständige Bestelldetails mit Anhängen
   - **An Kunde**: Auftragsbestätigung mit nächsten Schritten

### 2. E-Mail-Inhalt

#### E-Mail an Firma (info@sundsmessebau.com)
- ✅ Vollständige Kundendaten
- ✅ Alle Konfigurationsdetails (Einsatz, Maße, Druck, Lieferung)
- ✅ Hochgeladene Druckdaten als Anhang
- ✅ HTML-formatiert mit professionellem Layout
- ✅ Kontaktinformationen für direkten Rückruf

#### E-Mail an Kunde
- ✅ Persönliche Ansprache
- ✅ Bestellnummer zur Referenz
- ✅ Zusammenfassung der Bestellung
- ✅ Nächste Schritte (4-Punkte-Plan)
- ✅ Kontaktinformationen bei Fragen

### 3. Admin Dashboard

Zugriff: `/#/admin` (nur für Besitzer des Spark-Projekts)

#### Funktionen:
- **E-Mail Queue anzeigen**: Liste aller ausstehenden E-Mails
- **Vorschau**: HTML-Vorschau der E-Mails (Firma & Kunde)
- **Einzelversand**: E-Mails einzeln versenden
- **Massenversand**: Alle E-Mails auf einmal versenden
- **Löschen**: E-Mails aus Queue entfernen
- **Statistiken**: Übersicht über E-Mails, Bestellungen, Anfragen

## Dateien & Komponenten

### Core Service
- **`/src/lib/email-service.ts`**: Hauptlogik für E-Mail-Erstellung und -Versand
  - `sendOrderConfirmationEmail()`: Erstellt und speichert E-Mails in Queue
  - `formatConfigForEmail()`: Formatiert Bestelldaten als HTML
  - `generateCustomerConfirmationEmail()`: Erstellt Kundenbestätigung

### UI Komponenten
- **`/src/components/EmailQueueManager.tsx`**: Admin-Interface für E-Mail-Queue
  - Anzeige aller ausstehenden E-Mails
  - Vorschau-Dialog
  - Versand-Funktionen
  
- **`/src/components/pages/AdminPage.tsx`**: Admin Dashboard
  - Authentifizierung (nur Owner)
  - Statistiken
  - Tabs für E-Mails und Bestellungen

- **`/src/components/pages/configurator/ThankYouPage.tsx`**: Bestätigungsseite
  - Zeigt E-Mail-Versandstatus an
  - Listet versendete E-Mails auf

### Integration
- **`/src/components/pages/BannerBestellenPage.tsx`**: Banner-Konfigurator
  - Ruft `sendOrderConfirmationEmail()` nach Submit auf
  - Zeigt Erfolgsseite mit E-Mail-Status

## Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Kunde füllt Banner-Konfigurator aus                     │
│    - Einsatz, Maße, Druck, Dateien, Lieferung, Kontakt    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Submit: handleSubmit() in BannerBestellenPage.tsx      │
│    - Konfiguration speichern                               │
│    - sendOrderConfirmationEmail() aufrufen                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. E-Mail Service (email-service.ts)                       │
│    - Erstellt HTML-E-Mails (Firma + Kunde)                 │
│    - Speichert in KV: email_queue_{configId}               │
│    - Anhänge: serializedFiles aus step4                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ThankYouPage zeigt Bestätigung                          │
│    - ✓ E-Mail an info@sundsmessebau.com                    │
│    - ✓ E-Mail an Kunde                                      │
│    - ✓ Dateien als Anhang                                   │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Admin öffnet Dashboard (/#/admin)                       │
│    - Sieht E-Mail Queue                                     │
│    - Vorschau der E-Mails                                   │
│    - Kann E-Mails versenden (simuliert)                    │
└─────────────────────────────────────────────────────────────┘
```

## E-Mail-Queue-Datenstruktur

```typescript
{
  id: "email_queue_banner_1234567890",
  to: "info@sundsmessebau.com",
  subject: "Neue Banner-Bestellung: [Firma] - [Anzahl]x [Rahmenart]",
  htmlBody: "<html>...</html>",  // Formatierte E-Mail mit allen Details
  textBody: "...",                // Plain-Text-Version
  customerEmail: "kunde@example.com",
  customerSubject: "Auftragsbestätigung: Banner-Bestellung #12345678",
  customerHtmlBody: "<html>...</html>",  // Kundenbestätigung
  customerTextBody: "...",
  attachments: [
    {
      name: "druckdaten.pdf",
      type: "application/pdf",
      size: 1234567,
      dataUrl: "data:application/pdf;base64,..."
    }
  ],
  configId: "banner_1234567890",
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Verwendung

### Für Entwickler

```typescript
// E-Mail bei Bestellung versenden
import { sendOrderConfirmationEmail } from '@/lib/email-service'

const configId = `banner_${Date.now()}`
const emailSent = await sendOrderConfirmationEmail({ 
  config: bannerConfig, 
  configId 
})

if (emailSent) {
  console.log('✅ E-Mail erfolgreich in Queue')
}
```

### Für Administratoren

1. **Öffne Admin-Dashboard**: `/#/admin`
2. **Authentifizierung**: Als Owner des Spark-Projekts anmelden
3. **E-Mail Queue Tab**: Alle ausstehenden E-Mails anzeigen
4. **Vorschau**: Klick auf "Firma" oder "Kunde" für HTML-Vorschau
5. **Versenden**: Einzeln oder alle auf einmal

## E-Mail-Template-Features

### HTML-E-Mail Design
- ✅ Responsive Design
- ✅ Inline CSS für maximale Kompatibilität
- ✅ Strukturierte Sections mit Farbcodierung
- ✅ Icons und Badges für visuelle Hervorhebung
- ✅ Firmenbrand (S&S Messebau) im Header/Footer
- ✅ Direktlinks (Tel, E-Mail)

### Informations-Sections
1. **Kunde & Kontakt**: Firmendaten, Ansprechpartner, Kontaktinfo
2. **Einsatz & System**: Rahmenart, Menge, Indoor/Outdoor, Montage
3. **Maße & Ausführung**: Abmessungen, Profil, Ecken, LED
4. **Banner & Druck**: Material, Konfektion, Brandschutz
5. **Druckdaten & Upload**: Liste aller hochgeladenen Dateien
6. **Lieferung & Termin**: Adresse, Datum, Lieferart

## Testing

### Simulation
Im aktuellen Setup ist der E-Mail-Versand **simuliert**:
- E-Mails werden in KV-Queue gespeichert
- Admin kann Vorschau sehen
- "Versenden" zeigt Success-Toast, löscht aus Queue
- Console-Log mit allen Details

### Production-Integration
Für echten E-Mail-Versand integrieren:
- **SMTP Service** (z.B. SendGrid, AWS SES, Mailgun)
- **API-Endpunkt** der E-Mail-Dienst aufruft
- **Webhook** für Zustellungsbestätigung

## Sicherheit & Datenschutz

- ✅ E-Mails nur an verifizierte Adresse (`info@sundsmessebau.com`)
- ✅ Admin-Zugriff nur für Projekt-Owner
- ✅ Dateien als Base64 in KV (temporär)
- ✅ DSGVO-Checkbox erforderlich vor Submit
- ✅ Kein Logging sensibler Kundendaten in Console (nur IDs)

## Nächste Schritte

1. **SMTP-Integration**: Echten E-Mail-Provider anbinden
2. **Anhang-Upload**: Dateien zu Cloud-Storage hochladen
3. **Tracking**: E-Mail-Öffnungen und Klicks tracken
4. **Automatisierung**: Reminder-E-Mails nach 24h ohne Antwort
5. **PDF-Generation**: Angebot als PDF-Anhang generieren

## Support

Bei Fragen oder Problemen:
- **E-Mail**: info@sundsmessebau.com
- **Telefon**: (02433) 4427144
- **Mobil**: (01514) 0322125
