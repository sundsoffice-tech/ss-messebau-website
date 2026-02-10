# E-Mail-Versand für Banner-Bestellungen

## Übersicht

Das E-Mail-System versendet automatisch Auftragsbestätigungen mit Dateianhängen an **info@sundsmessebau.com** und eine Bestätigung an den Kunden.

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
