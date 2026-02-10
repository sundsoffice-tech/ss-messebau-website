# Banner bestellen - Konfigurator Konzept & Umsetzungsplan

## A) INTEGRATION IN DIE WEBSITE

### Navigation & Menüstruktur
- **Hauptmenü**: Neuer Punkt "Bannerrahmen" mit Dropdown:
  - "Bannerrahmen Info" → `/bannerrahmen`
  - "Banner bestellen" → `/banner-bestellen`
- **Header CTA**: Zusätzlicher Button "Banner konfigurieren" neben "Projekt anfragen"
- **Sticky CTA**: Bleibt "Projekt anfragen", auf Banner-Seiten wird Text zu "Jetzt konfigurieren"

### Interne Verlinkungen
- **Startseite**: Neue Kachel "Bannerrahmen & Großformatdruck" mit CTA "Banner konfigurieren"
- **Leistungen-Seite**: Neuer Abschnitt "Bannerrahmen & Druck" mit CTA-Button
- **Referenzen**: Bei passenden Cases Link "Ähnliches Banner bestellen"
- **Footer**: Link zu "Banner bestellen" in Service-Spalte

### URL-Struktur
- `/bannerrahmen` - Info-Seite (Produktübersicht, Anwendungsfälle, Specs)
- `/banner-bestellen` - Konfigurator (Smart Wizard)

---

## B) PAGE-LOOK - DESIGNER BLUEPRINT

### Hero Section
**Visual**: Großes Hero-Image mit hochwertigen Bannerrahmen im Messeeinsatz, dezentes Overlay für Text-Lesbarkeit.

**Headline**: "Banner & Rahmen in 10 Minuten konfigurieren"

**Subline**: "Professionelle Bannerrahmen mit optionalem Druck – von Standard bis LED-Backlit. Faire Preise, schnelle Lieferung, deutschlandweite Montage."

**Trust-Bullets** (3 Icons mit Text):
1. ✓ Produktion in 5-10 Werktagen
2. ✓ Montageservice deutschlandweit verfügbar
3. ✓ B1-Brandschutz für Messeeinsatz

**CTAs**:
- Primär: "Jetzt konfigurieren" (Scroll zum Konfigurator)
- Sekundär: "Beratung anfordern" (öffnet Kontakt-Dialog)

---

### Trust-Row (direkt unter Hero)
4-5 Icons mit Kurztexten in Karten-Layout:
- **Schnelle Lieferung**: 5-10 Werktage Standard
- **Deutschlandweit**: Lieferung & Montage bundesweit
- **Qualität**: Hochwertige Profile & Materialien
- **B1-Zertifiziert**: Brandschutz für Messen
- **Full-Service**: Von Druck bis Montage

---

### Konfigurator Section (Hauptbereich)

**Layout**: 2-Spalten (Desktop) / 1-Spalte (Mobile)
- **Links (8/12)**: Step-by-Step Wizard in Card mit Progress-Bar
- **Rechts (4/12)**: Sticky Summary Card mit:
  - Überschrift "Ihre Konfiguration"
  - Liste aller getroffenen Auswahlen
  - Hinweis "Individuelles Angebot" (keine festen Preise)
  - Button "Konfiguration abschließen" (führt zu letztem Step)

**Wizard-UI**:
- Progress-Bar oben (1/6, 2/6, etc.)
- Aktuelle Schritt-Nummer + Titel
- Kurze Erklärung (1-2 Sätze)
- Formular-Felder mit Validierung
- Buttons: "Zurück" + "Weiter"
- Auto-Save in LocalStorage

---

### "So läuft's"-Section
4 Schritte in Timeline/Card-Layout:

1. **Konfigurieren** - "Wählen Sie online Maße, Material und Optionen"
2. **Daten prüfen** - "Wir prüfen Ihre Angaben und Druckdaten"
3. **Angebot erhalten** - "Sie erhalten binnen 24h ein individuelles Angebot"
4. **Produktion & Lieferung** - "Nach Freigabe produzieren wir und liefern termingerecht"

---

### Referenz-Section
**Überschrift**: "Banner im Einsatz"

6 Beispielbilder in Grid (3 Spalten Desktop, 2 Mobile):
- Messestand mit Hängerahmen
- Ladenfront mit Standrahmen
- Event mit LED-Backlit-Banner
- Indoor-Ausstellung mit Verkleidungsrahmen
- Outdoor-Promotion mit wetterfesten Bannern
- Großformat-Werbung mit Premium-Profilen

Je Bild: Kurzbeschreibung + Maße als Overlay

---

### FAQ Section
Accordion mit 10 Fragen:

1. Welche Rahmenarten bieten Sie an?
2. Kann ich auch nur den Rahmen ohne Druck bestellen?
3. Welche Materialien eignen sich für Outdoor-Einsatz?
4. Was bedeutet B1-Brandschutz und wann brauche ich ihn?
5. Wie lange dauert die Produktion?
6. Können Sie bundesweit montieren?
7. In welchen Formaten kann ich Druckdaten liefern?
8. Was kostet die Erstellung von Druckdaten?
9. Gibt es einen Mindestauftrag?
10. Kann ich nachträglich weitere Banner für denselben Rahmen bestellen?

---

### Footer CTA
**Card mit sanftem Hintergrund**:
- Headline: "Individuelles Angebot in 24 Stunden"
- Text: "Konfigurieren Sie jetzt Ihre Banner oder lassen Sie sich persönlich beraten"
- Buttons: "Jetzt konfigurieren" + "Beratung buchen"

---

## C) KONFIGURATOR - SMART WIZARD (6 Schritte)

### Schritt 1: Einsatz & System
**Titel**: "Wofür benötigen Sie die Banner?"

**Erklärung**: "Damit wir die passende Ausführung empfehlen können, teilen Sie uns den Einsatzzweck mit."

**Felder**:

1. **Einsatzort** (Radio-Buttons mit Icons, Pflicht)
   - Messe / Ausstellung
   - Laden / Showroom
   - Event / Veranstaltung
   - Outdoor / Dauerinstallation
   - Sonstiges
   - Validierung: Muss ausgewählt werden
   - Fehlertext: "Bitte wählen Sie einen Einsatzort"

2. **Rahmenart** (Radio-Buttons mit Erklärung, Pflicht)
   - Hängerahmen (zur Deckenmontage)
   - Standrahmen (freistehend mit Standfuß)
   - Verkleidungsrahmen (zur Wandmontage)
   - Beidseitiger Rahmen (für Raumteiler)
   - Default: Hängerahmen
   - Validierung: Muss ausgewählt werden
   - Fehlertext: "Bitte wählen Sie eine Rahmenart"

3. **Menge** (Number Input, Pflicht)
   - Label: "Anzahl Rahmen"
   - Min: 1, Max: 50
   - Default: 1
   - Validierung: Zahl zwischen 1-50
   - Fehlertext: "Bitte geben Sie eine Menge zwischen 1 und 50 an"
   - Microcopy: "Ab 5 Stück erhalten Sie Mengenrabatt"

4. **Indoor/Outdoor** (Radio-Buttons, Pflicht)
   - Indoor
   - Outdoor (wetterfest)
   - Default: Indoor
   - Smart: Bei Auswahl "Outdoor" → Empfehlung für Material in Schritt 3

5. **Montageservice** (Checkbox, Optional)
   - Label: "Montage durch S&S Messebau gewünscht?"
   - Bei "Ja": Zusatzfelder einblenden:
     - **Montageort** (Text Input, Pflicht wenn Montage gewählt)
     - **Zeitraum** (Date Range Picker)
     - Microcopy: "Wir montieren bundesweit, Preis nach Aufwand"

---

### Schritt 2: Maße & Ausführung
**Titel**: "Technische Details"

**Erklärung**: "Geben Sie die gewünschten Maße und die Ausführung an."

**Felder**:

1. **Breite** (Number Input, Pflicht)
   - Label: "Breite in cm"
   - Min: 50, Max: 800
   - Placeholder: "z.B. 200"
   - Validierung: Zahl 50-800
   - Fehlertext: "Breite muss zwischen 50 und 800 cm liegen"
   - Smart: Bei >400cm → Hinweis "Großformat, Transport ggf. mehrteilig"

2. **Höhe** (Number Input, Pflicht)
   - Label: "Höhe in cm"
   - Min: 50, Max: 400
   - Placeholder: "z.B. 300"
   - Validierung: Zahl 50-400
   - Fehlertext: "Höhe muss zwischen 50 und 400 cm liegen"

3. **Live-Vorschau**: Anzeige der Fläche in m² (berechnet aus Breite × Höhe)

4. **Profil/Optik** (Radio-Buttons mit Bildern, Pflicht)
   - Standard (Aluminium eloxiert, 25mm)
   - Premium (Alu gebürstet, 35mm)
   - Sonder/Individuell (Farbe, Holzoptik)
   - Default: Standard
   - Microcopy: "Premium-Profile wirken hochwertiger und sind stabiler"

5. **Ecken** (Radio-Buttons, Pflicht)
   - Gehrung (45° geschnitten, nahtlos)
   - Verbinder (Eckverbinder sichtbar, günstiger)
   - Default: Gehrung
   - Smart: Bei "Sonder"-Profil → nur Gehrung verfügbar

6. **Seitigkeit** (Radio-Buttons, Pflicht)
   - Einseitig
   - Beidseitig (2 Banner)
   - Default: Einseitig
   - Smart: Nur bei Standrahmen/Verkleidungsrahmen verfügbar

7. **LED/Backlit** (Checkbox, Optional)
   - Label: "Hinterleuchtung gewünscht?"
   - Bei "Ja": Zusatzfelder einblenden:
     - **Stromversorgung** (Radio: 230V / Akku)
     - **Einsatzdauer** (Select: Dauerbetrieb / Event)
     - Microcopy: "LED-Backlit macht Ihre Botschaft leuchtend sichtbar"

---

### Schritt 3: Banner & Druck
**Titel**: "Benötigen Sie auch den Druck?"

**Erklärung**: "Wir können Banner in verschiedenen Materialien bedrucken oder Sie liefern eigene Banner."

**Felder**:

1. **Banner benötigt?** (Radio-Buttons, Pflicht)
   - Ja, S&S soll Banner drucken
   - Nein, ich habe eigene Banner
   - Default: Ja

2. **Wenn "Ja" gewählt** → Folgende Felder:

   a) **Material** (Radio-Buttons mit Info-Icons, Pflicht)
      - Frontlit 450g (Standard, Indoor/leichtes Outdoor)
      - Blockout 510g (blickdicht, beidseitiger Druck)
      - Mesh 350g (windurchlässig, Outdoor)
      - Backlit 450g (transluzent für LED-Beleuchtung)
      - Default: Frontlit 450g
      - Smart: Bei Schritt 1 "Outdoor" → Empfehlung "Mesh oder Blockout"
      - Smart: Bei Schritt 2 "LED" gewählt → Empfehlung "Backlit"
      - Fehlertext: "Bitte wählen Sie ein Material"

   b) **Konfektion** (Checkboxes, Mehrfachauswahl möglich)
      - Keder 6mm (Standard für Rahmen)
      - Saum ringsum
      - Ösen (bei Outdoor-Bannern)
      - Default: Keder 6mm (immer bei Rahmenbestellung)

   c) **Brandschutz B1** (Checkbox, Optional)
      - Label: "B1-Brandschutz-Zertifikat erforderlich?"
      - Microcopy: "Pflicht bei den meisten Messen. Wir liefern Zertifikat mit."

   d) **Druckqualität** (Radio-Buttons, Pflicht)
      - Standard (720dpi, für normale Betrachtung)
      - High (1440dpi, für Nahbetrachtung/Premium)
      - Default: Standard
      - Microcopy: "Standard ist für 95% der Fälle ausreichend"

3. **Hinweis zu Druckdaten**: Info-Box
   - "Sie laden Druckdaten im nächsten Schritt hoch"
   - "Format: PDF, AI, EPS (CMYK, 100dpi, Endformat + 2cm Beschnitt)"
   - Link: "Druckdaten-Guide herunterladen"

---

### Schritt 4: Daten & Upload
**Titel**: "Druckdaten hochladen"

**Erklärung**: "Laden Sie Ihre Druckdaten hoch oder buchen Sie unseren Grafikservice."

**Felder**:

1. **Druckdaten vorhanden?** (Radio-Buttons, Pflicht)
   - Ja, ich lade Daten hoch
   - Nein, ich benötige Grafikservice
   - Default: Ja

2. **Wenn "Ja, Upload"**:

   a) **Datei-Upload** (Drag & Drop oder Button)
      - Erlaubte Formate: .pdf, .ai, .eps, .jpg, .png, .tif
      - Max. Dateigröße: 100 MB pro Datei
      - Mehrfachupload möglich
      - Validierung: Format + Größe
      - Fehlertext: "Bitte laden Sie eine gültige Datei hoch (max. 100MB)"
      - Microcopy: "Sie können mehrere Dateien hochladen"

   b) **CI/Logo-Upload** (Optional)
      - Label: "Optional: Logo/CI für Rückfragen"
      - Erlaubte Formate: .pdf, .ai, .eps, .jpg, .png
      - Max: 20 MB

3. **Wenn "Nein, Grafikservice"**:
   - Info-Text: "Unser Grafikteam erstellt Ihre Druckdaten nach Ihren Vorgaben. Kosten werden im Angebot separat ausgewiesen."
   - **Designwunsch** (Textarea, Pflicht)
     - Label: "Beschreiben Sie Ihre Designvorstellung"
     - Placeholder: "z.B. Firmenlogo zentriert, Slogan darunter, Hintergrund weiß..."
     - Min: 20 Zeichen
     - Fehlertext: "Bitte beschreiben Sie kurz Ihre Designwünsche"

4. **Kommentar/Besonderheiten** (Textarea, Optional, für alle)
   - Label: "Besondere Anforderungen oder Hinweise?"
   - Placeholder: "z.B. spezielle Deadline, Skizze per E-Mail folgt, Muster gewünscht..."
   - Max: 500 Zeichen

---

### Schritt 5: Lieferung & Termin
**Titel**: "Lieferung planen"

**Erklärung**: "Wann und wohin sollen wir liefern?"

**Felder**:

1. **Lieferadresse** (Composite Fields, Pflicht)
   - Firma (Optional)
   - Straße + Nr. (Pflicht)
   - PLZ (Pflicht, Validierung: 5 Ziffern)
   - Ort (Pflicht)
   - Land (Select, Default: Deutschland)
   - Validierung: Alle Pflichtfelder ausgefüllt
   - Fehlertext je Feld: "Dieses Feld ist erforderlich"

2. **Wunsch-Lieferdatum** (Date Picker, Optional)
   - Label: "Wunschtermin (falls vorhanden)"
   - Min: Heute + 7 Werktage
   - Microcopy: "Standard-Lieferzeit: 5-10 Werktage"
   - Smart: Bei Datum <10 Tage → Hinweis "Express-Zuschlag möglich"

3. **Express-Service** (Checkbox, Optional)
   - Label: "Express-Produktion gewünscht? (3-5 Werktage)"
   - Microcopy: "Express nach Verfügbarkeit, Aufpreis im Angebot"

4. **Lieferart** (Radio-Buttons, Pflicht)
   - Speditionslieferung (Standard)
   - Abholung in Hückelhoven (kostenlos)
   - Direktanlieferung zur Messe (Adresse + Datum)
   - Default: Speditionslieferung

5. **Zeitfenster** (Optional, nur bei Spedition)
   - Vormittag (8-12 Uhr)
   - Nachmittag (12-17 Uhr)
   - Egal
   - Default: Egal

---

### Schritt 6: Kontaktdaten & Abschluss
**Titel**: "Fast geschafft!"

**Erklärung**: "Noch Ihre Kontaktdaten, dann erhalten Sie binnen 24h Ihr individuelles Angebot."

**Felder**:

1. **Firma** (Text Input, Pflicht)
   - Validierung: Min. 2 Zeichen
   - Fehlertext: "Bitte geben Sie Ihre Firma an"

2. **Ansprechpartner** (Text Input, Pflicht)
   - Label: "Vor- und Nachname"
   - Validierung: Min. 3 Zeichen
   - Fehlertext: "Bitte geben Sie Ihren Namen an"

3. **E-Mail** (Email Input, Pflicht)
   - Validierung: Gültiges E-Mail-Format
   - Fehlertext: "Bitte geben Sie eine gültige E-Mail-Adresse an"
   - Microcopy: "An diese Adresse senden wir die Angebotsbestätigung"

4. **Telefon** (Tel Input, Pflicht)
   - Validierung: Min. 8 Zeichen, nur Ziffern/+/-/(/)
   - Fehlertext: "Bitte geben Sie eine gültige Telefonnummer an"
   - Microcopy: "Für Rückfragen zu technischen Details"

5. **USt-IdNr.** (Text Input, Optional)
   - Label: "Umsatzsteuer-ID (optional)"

6. **DSGVO-Checkbox** (Checkbox, Pflicht)
   - Label: "Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Daten zu."
   - Link zu /datenschutz
   - Validierung: Muss aktiviert sein
   - Fehlertext: "Bitte akzeptieren Sie die Datenschutzbestimmungen"

7. **Newsletter** (Checkbox, Optional)
   - Label: "Ich möchte Infos zu Produkten und Angeboten erhalten (jederzeit kündbar)"

**Button**: "Konfiguration senden" (Primary, groß, mit Icon)

---

### Danke-Seite (nach Absenden)
**Vollbild-Card mit Checkmark-Animation**

**Headline**: "Vielen Dank, [Name]!"

**Text**: 
"Ihre Konfiguration ist bei uns eingegangen. Sie erhalten in Kürze eine Bestätigung per E-Mail mit allen Details.

**Wie geht es weiter?**
1. Wir prüfen Ihre Angaben und Druckdaten (falls vorhanden)
2. Sie erhalten binnen 24 Stunden ein individuelles Angebot
3. Nach Ihrer Freigabe starten wir die Produktion
4. Lieferung zum Wunschtermin"

**CTA-Buttons**:
- "Weitere Anfrage stellen"
- "Zurück zur Startseite"

**Kontakt-Info**: "Fragen? Rufen Sie uns an: (02433) 4427144"

---

## D) AUTOMATION & TECHNIK

### 1) Nach dem Absenden - Sofort-Aktionen

**Kunde erhält** (automatische E-Mail):
```
Betreff: Ihre Banner-Konfiguration bei S&S Messebau [#ID]

Sehr geehrte/r [Name],

vielen Dank für Ihre Anfrage. Wir haben folgende Konfiguration erhalten:

[Zusammenfassung als HTML-Tabelle]
- Rahmenart: [...]
- Maße: [Breite] × [Höhe] cm
- Material: [...]
- Montage: [Ja/Nein]
- Liefertermin: [Datum]

Ihre Druckdaten: [Dateinamen als Links]

Wir prüfen nun Ihre Angaben und erstellen ein individuelles Angebot, das Sie binnen 24 Stunden erhalten.

Bei Rückfragen erreichen Sie uns unter:
Tel: (02433) 4427144 oder info@sundsmessebau.de

Mit freundlichen Grüßen
Ihr S&S Messebau Team
```

**Anhang**: PDF mit Konfigurationszusammenfassung

---

**Intern erhält** info@sundsmessebau.de:
```
Betreff: NEUE BANNER-KONFIGURATION [#ID] - [Firma]

Neue Banner-Bestellung eingegangen:

KUNDE
Firma: [...]
Ansprechpartner: [...]
E-Mail: [...]
Telefon: [...]

KONFIGURATION
Einsatz: [...]
Rahmenart: [...]
Maße: [Breite] × [Höhe] cm (= [X] m²)
Menge: [...]
Indoor/Outdoor: [...]
Profil: [...]
LED: [Ja/Nein]

DRUCK
Banner gewünscht: [Ja/Nein]
Material: [...]
Konfektion: [...]
B1-Brandschutz: [Ja/Nein]
Druckdaten: [Links zu Dateien]
Grafikservice: [Ja/Nein]

LIEFERUNG
Adresse: [vollständig]
Wunschtermin: [Datum]
Express: [Ja/Nein]
Montage: [Ja/Nein, wenn ja: Ort + Zeitraum]

UPLOADS
[Links zu allen hochgeladenen Dateien]

KOMMENTAR
[Kunde-Kommentar]

---
Aktion erforderlich: Angebot erstellen binnen 24h
```

---

### 2) Datenbank-Speicherung (2 Varianten)

**Variante A: Low-Tech (Google Sheets / Airtable)**

Über API-Integration (z.B. Google Sheets API oder Airtable API) wird automatisch ein neuer Eintrag erstellt:

Spalten:
- Datum/Zeit
- Konfiguration-ID
- Firma
- Ansprechpartner
- E-Mail
- Telefon
- Rahmenart
- Maße (Breite × Höhe)
- Menge
- Material
- B1-Brandschutz (Ja/Nein)
- LED (Ja/Nein)
- Montage (Ja/Nein)
- Wunsch-Liefertermin
- Status (Neu / In Bearbeitung / Angebot versendet / Auftrag)
- Upload-Links
- Kommentar

**Vorteil**: Keine Datenbank nötig, sofort für Team sichtbar, Excel-Export möglich
**Nachteil**: API-Limits, weniger Kontrolle

---

**Variante B: Pro (CRM-Integration oder eigene DB)**

Verwendung von `useKV` (Spark Persistence API) für Konfigurationsdaten:

```typescript
// Bei Absenden
const configId = `banner_${Date.now()}_${uuid()}`;
await spark.kv.set(configId, {
  timestamp: new Date().toISOString(),
  kunde: { ... },
  konfiguration: { ... },
  uploads: [...],
  status: 'neu'
});

// Admin kann alle Configs abrufen
const allKeys = await spark.kv.keys();
const configs = allKeys.filter(k => k.startsWith('banner_'));
```

**Alternativ**: Integration in bestehendes CRM:
- HubSpot API
- Pipedrive API
- Zoho CRM
- Eigene PostgreSQL-Datenbank (bereits vorhanden laut ursprünglichem Brief)

---

### 3) Angebots-Template automatisch generieren

Nach Datenempfang wird automatisch ein **Angebots-Draft** als PDF erstellt:

**Struktur**:
```
S&S MESSEBAU GBR
Angebot Nr. [Jahr]-[ID]

Kunde: [Firma]
Ansprechpartner: [Name]
Datum: [Heute]

Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:

POSITION 1: Bannerrahmen
- Art: [Hängerahmen/Standrahmen/...]
- Maße: [Breite] × [Höhe] cm
- Profil: [Standard/Premium/...]
- Ausführung: [Details]
- Menge: [X] Stück

Preis: [MANUELL EINTRAGEN] EUR

POSITION 2: Bannerdruck (falls gewählt)
- Material: [Frontlit/Blockout/...]
- Konfektion: [Keder, Saum, ...]
- B1-Brandschutz: [Ja/Nein]
- Fläche: [X] m²

Preis: [MANUELL EINTRAGEN] EUR

POSITION 3: Montage (falls gewählt)
- Ort: [...]
- Zeitraum: [...]

Preis: [MANUELL EINTRAGEN] EUR

---
SUMME NETTO: [MANUELL]
zzgl. 19% MwSt.: [MANUELL]
SUMME BRUTTO: [MANUELL]

Lieferzeit: ca. [X] Werktage ab Druckfreigabe
Zahlungsziel: 14 Tage netto

Mit freundlichen Grüßen
[Unterschrift]
```

**Technisch**: PDF-Generierung mit Libraries wie `jsPDF` oder serverseitiges Rendering mit Template-Engine.

---

### 4) Dateiupload - Cloud-Speicherung

**Empfohlene Lösung**: Cloud-Storage mit strukturierter Ablage

**Benennungsschema**:
```
JJJJMMDD_Firma_Rahmenart_BreitexHoehe_ID

Beispiel:
20250115_MusterGmbH_Haengerahmen_200x300_abc123/
  ├── druckdaten_hauptbanner.pdf
  ├── logo_muster_gmbh.ai
  └── kommentar_skizze.jpg
```

**Umsetzung**:
- **Low-Tech**: Direkter Upload zu Google Drive / Dropbox via API
- **Pro**: AWS S3 / Azure Blob Storage / eigener Server

**Workflow**:
1. Kunde wählt Dateien → Upload startet
2. Dateien werden mit Progress-Bar hochgeladen
3. URLs werden in Konfigurations-Objekt gespeichert
4. Links werden in E-Mail + DB eingefügt
5. Zugriff für S&S-Team via Admin-Dashboard

**Sicherheit**:
- Signierte URLs (zeitlich begrenzt)
- Virus-Scan bei Upload
- Maximale Dateigröße enforced (100MB)

---

### 5) Tracking & Analytics

**Events definieren** (Google Analytics 4 / Matomo):

```javascript
// Step-Progress
gtag('event', 'banner_step_complete', {
  step_number: 1,
  step_name: 'Einsatz & System'
});

// Upload
gtag('event', 'banner_upload', {
  file_type: 'pdf',
  file_size_mb: 12
});

// Submit
gtag('event', 'banner_submit', {
  rahmenart: 'Hängerahmen',
  has_druck: true,
  montage: false,
  value: 0 // kein Preis bekannt
});

// Abbruch
window.addEventListener('beforeunload', () => {
  gtag('event', 'banner_exit', {
    last_step: currentStep
  });
});
```

**DSGVO-konform**:
- Nur nach Cookie-Consent tracken
- IP-Anonymisierung aktiviert
- Keine personenbezogenen Daten in Events

---

## E) MODERN/SMART FEATURES

### 1) Live Summary (Rechte Spalte, Sticky)

**Content**:
- Überschrift: "Ihre Konfiguration"
- Dynamische Liste mit Icons:
  ```
  ✓ Hängerahmen, 200 × 300 cm
  ✓ Standard-Profil, Gehrung
  ✓ Frontlit 450g mit Keder
  ✓ B1-Brandschutz
  ✓ Montage in Berlin, KW 12
  ```
- Berechnete Werte:
  - Fläche in m²
  - Anzahl Rahmen
  - Geschätzte Lieferzeit
- Button: "Zusammenfassung als PDF" (Download vor Absenden)
- Hinweis: "Individuelles Angebot nach Prüfung"

**UX**:
- Sticky Position beim Scrollen
- Smooth Animations bei Änderungen
- Mobile: Als ausklappbare Leiste am unteren Rand

---

### 2) Fortschrittsanzeige + Auto-Save

**Progress Bar**:
- Oben im Konfigurator
- 6 Schritte visualisiert
- Aktueller Schritt hervorgehoben
- Prozentanzeige: "3 von 6 Schritten"
- Klickbar für bereits besuchte Schritte

**Auto-Save**:
```typescript
// Bei jeder Eingabe → LocalStorage speichern
useEffect(() => {
  const saveConfig = debounce(() => {
    localStorage.setItem('banner_config', JSON.stringify(formData));
  }, 500);
  
  saveConfig();
}, [formData]);

// Beim Laden prüfen
useEffect(() => {
  const saved = localStorage.getItem('banner_config');
  if (saved) {
    // Toast: "Möchten Sie Ihre gespeicherte Konfiguration fortsetzen?"
  }
}, []);
```

**UX**:
- Icon "Gespeichert" erscheint kurz nach jeder Änderung
- Beim Wiederkehren: Dialog "Konfiguration fortsetzen?"
- Löschen nach erfolgreichem Absenden

---

### 3) Echtzeit-Validierung

**Beispiele**:

```typescript
// Maße: Warnung bei ungewöhnlichen Werten
if (breite > 500 || hoehe > 350) {
  showWarning("Großformat: Transport ggf. mehrteilig, wir beraten Sie gerne");
}

// Verhältnis prüfen
const ratio = breite / hoehe;
if (ratio > 4 || ratio < 0.25) {
  showWarning("Ungewöhnliches Seitenverhältnis – ist das korrekt?");
}

// Lieferdatum
if (wunschDatum < heute + 10Tage && !expressSelected) {
  showHint("Für diesen Termin benötigen Sie Express-Service");
}
```

**Visuals**:
- Grünes Häkchen bei korrekter Eingabe
- Gelbes Warnsymbol bei Hinweisen
- Rotes X bei Fehlern (blockiert "Weiter")

---

### 4) Smarte Empfehlungen

**Kontext-basierte Tipps**:

```typescript
// Outdoor gewählt → Material-Empfehlung
if (einsatz === 'outdoor' && material === 'frontlit') {
  showRecommendation(
    "Für Outdoor empfehlen wir Mesh (windurchlässig) oder Blockout (extra stabil)"
  );
}

// LED gewählt → Material-Empfehlung
if (ledBacklit && material !== 'backlit') {
  showRecommendation(
    "Für LED-Hinterleuchtung ist transluzentes Backlit-Material optimal"
  );
}

// Große Menge → Hinweis
if (menge >= 5) {
  showInfo("Ab 5 Stück: Mengenrabatt im Angebot berücksichtigt");
}

// Messe-Einsatz → B1-Hinweis
if (einsatz === 'messe' && !b1Selected) {
  showWarning("Die meisten Messen verlangen B1-Brandschutz – möchten Sie dies hinzufügen?");
}
```

**Design**: Info-Cards mit Icon, Text und optionalem "Hinzufügen"-Button

---

### 5) Exit-Intent im Schritt 3/4

**Trigger**: Mauszeiger verlässt Viewport nach oben

**Modal**:
- Headline: "Noch Fragen zur Konfiguration?"
- Text: "Unsere Experten beraten Sie gerne – kostenlos und unverbindlich"
- Button: "Rückruf vereinbaren" → Öffnet Kontakt-Dialog
- Button: "Nein danke, weiter konfigurieren"

**Zusätzlich**: Bei langer Inaktivität (>2 Min) in Schritt 3/4:
- Sticky-Bubble unten rechts: "Brauchen Sie Hilfe? Chat starten"

---

### 6) Mobile-First Optimierungen

**Layout-Anpassungen**:
- Summary-Card wird zu Bottom-Sheet (ausklappbar)
- Wizard: Steps nacheinander, nicht seitlich
- Buttons: Full-Width, mindestens 48px Höhe
- Progress Bar: Kompakter, nur Punkte statt Text

**Sticky CTA** (Mobile):
- Am unteren Rand fixiert
- "Weiter zu Schritt [X]" oder "Konfiguration senden"
- Mit Schatten für Abhebung

**Touch-Optimierungen**:
- Radio-Buttons: Große Touch-Targets (60×60px)
- File-Upload: Große Drop-Zone
- Date-Picker: Native Mobile-Picker

**Performance**:
- Lazy-Loading für Bilder in Referenz-Section
- Code-Splitting: Konfigurator-Code nur auf dieser Seite laden
- Optimierte Bildgrößen für Mobile (WebP)

---

## F) SEO / PERFORMANCE / DSGVO

### SEO-Optimierung

**Meta-Tags** (`/banner-bestellen`):
```html
<title>Banner & Bannerrahmen online konfigurieren | S&S Messebau</title>
<meta name="description" content="Konfigurieren Sie Bannerrahmen und Großformatdruck online. Von Standard bis LED-Backlit, mit Montageservice. Angebot binnen 24h. Bundesweite Lieferung." />
<meta name="keywords" content="Bannerrahmen bestellen, Banner konfigurieren, Großformatdruck, Messebanner, LED Banner, Bannerrahmen kaufen" />
<link rel="canonical" href="https://sundsmessebau.de/banner-bestellen" />
```

**Strukturierte Daten** (Schema.org):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bannerrahmen mit Druck",
  "description": "Professionelle Bannerrahmen in allen Größen...",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  },
  "provider": {
    "@type": "LocalBusiness",
    "name": "S&S Messebau GbR"
  }
}
```

**Content-Optimierung**:
- H1: "Banner & Bannerrahmen online konfigurieren"
- H2: "So funktioniert's", "Banner im Einsatz", "Häufige Fragen"
- Keywords natürlich einbinden
- Alt-Texte für alle Bilder (Referenzen)
- Interne Links zu verwandten Seiten (Leistungen, Referenzen)

**URL-Struktur**:
- `/bannerrahmen` - Info-Seite (Ratgeber, Anwendungsfälle)
- `/banner-bestellen` - Konfigurator
- Kurz, sprechend, deutsch

---

### Performance

**Ladezeit-Optimierung**:
- **Lazy-Loading**: Bilder in Referenz-Section erst bei Sichtbarkeit laden
- **Code-Splitting**: Konfigurator-Komponenten dynamisch importieren
- **Caching**: Static Assets mit langen Cache-Headers
- **CDN**: Bilder über CDN ausliefern
- **Compression**: Gzip/Brotli für alle Text-Assets

**Technisch**:
```typescript
// Lazy-Loading für Konfigurator
const BannerConfigurator = lazy(() => import('./BannerConfigurator'));

// Bilder mit loading="lazy"
<img src="..." alt="..." loading="lazy" />

// WebP mit Fallback
<picture>
  <source srcset="banner.webp" type="image/webp" />
  <img src="banner.jpg" alt="..." />
</picture>
```

**Lighthouse-Ziele**:
- Performance: >90
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

### DSGVO-Compliance

**Cookie-Consent**:
- Banner beim ersten Besuch
- Opt-In für Tracking (Google Analytics)
- Technisch notwendig: LocalStorage für Auto-Save (Info in Datenschutz)
- Granulare Auswahl: Marketing / Statistik / Notwendig

**Datenschutz-Hinweise**:
1. **Im Formular** (vor DSGVO-Checkbox):
   - "Wir verarbeiten Ihre Daten zur Angebotserstellung. Details in unserer Datenschutzerklärung."
   
2. **Bei Upload**:
   - "Hochgeladene Dateien werden verschlüsselt gespeichert und nach Projektabschluss gelöscht."

3. **In Datenschutzseite** (erweitern):
   - Abschnitt "Banner-Konfigurator"
   - Welche Daten gespeichert werden (Kontakt, Konfiguration, Uploads)
   - Rechtsgrundlage (Vertragsanbahnung, Art. 6 Abs. 1 lit. b DSGVO)
   - Speicherdauer (bis Projektabschluss + 10 Jahre Aufbewahrungspflicht)
   - Weitergabe an Dienstleister (Cloud-Storage, E-Mail-Versand)
   - Rechte (Auskunft, Löschung, Widerruf)

**SSL/TLS**:
- Komplette Seite über HTTPS
- Upload-URLs mit Signatur

**E-Mail-Sicherheit**:
- SPF/DKIM/DMARC für ausgehende Mails
- Kein Klartext-PW in E-Mails

---

## ZUSAMMENFASSUNG & NÄCHSTE SCHRITTE

### Was ist umzusetzen?

1. **Info-Seite** `/bannerrahmen` erstellen:
   - Produkt-Übersicht (Rahmenarten, Materialien)
   - Anwendungsfälle mit Bildern
   - Technische Specs
   - CTA zum Konfigurator

2. **Konfigurator** `/banner-bestellen`:
   - 6-Schritte-Wizard (siehe Kapitel C)
   - Live Summary (Sticky Sidebar)
   - Upload-Funktion
   - Validierung + Smart Recommendations

3. **Backend/Automation**:
   - E-Mail-Versand (Kunde + Intern)
   - Datenspeicherung (KV Storage oder Google Sheets)
   - Upload-Handling (Cloud Storage)
   - PDF-Generierung (Bestätigung + Angebots-Draft)

4. **Integration**:
   - Navigation erweitern (Header + Footer)
   - CTAs auf Startseite, Leistungen, etc.
   - Tracking Events implementieren

5. **Optimierung**:
   - Mobile-Optimierung
   - SEO (Meta-Tags, Schema.org)
   - Performance (Lazy-Loading, Code-Splitting)
   - DSGVO (Consent, Datenschutzhinweise)

### Technologie-Stack:

- **Frontend**: React + TypeScript + Tailwind CSS (bestehend)
- **State Management**: React Hook Form + useKV für Persistence
- **UI Components**: Shadcn (bestehend): Dialog, Card, Input, Select, etc.
- **Upload**: File API + Cloud Storage Integration
- **E-Mail**: Spark Backend oder externe API (SendGrid, Resend)
- **Tracking**: Google Analytics 4 (mit Consent)
- **PDF-Generierung**: jsPDF oder Server-Side Rendering

### Prioritäten:

**Phase 1** (MVP):
- Konfigurator mit allen 6 Schritten
- E-Mail-Benachrichtigungen (basic)
- Upload-Funktionalität
- Mobile-Responsive

**Phase 2** (Optimierung):
- Auto-Save + Wiederaufnahme
- Live Summary + Smart Recommendations
- PDF-Generierung (Bestätigung)
- Exit-Intent Modal

**Phase 3** (Pro-Features):
- CRM-Integration
- Automatisches Angebots-PDF
- Admin-Dashboard für Anfragen
- A/B-Testing für Conversion-Optimierung

---

Ende des Konzepts. Bereit zur Implementierung! 🚀
