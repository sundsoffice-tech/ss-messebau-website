# Referenz-Bilder: Messebau 25 qm

Dieser Ordner ist für echte Referenz-Fotos von realisierten Messeständen mit ca. 25 qm Standfläche vorgesehen.

**Aktueller Stand:** Die Bilder befinden sich derzeit noch unter UUID-Dateinamen im Verzeichnis `public/images/` und werden über diese Pfade im Code referenziert. Eine spätere Umbenennung und Verschiebung in dieses Verzeichnis ist geplant.

## Bildübersicht (aktuell unter UUID-Namen in public/images/)

### 1. e859a873-049d-4f2b-9156-0ac94939c636.jpeg
**Ziel-Dateiname:** messestand-25qm-lounge-multimedia-orange.jpg

**Beschreibung:** ~25 qm Eckstand in Orange/Schwarz. Holzboden-Optik, Lounge-Bereich mit 3 Sesseln und Glastisch, 2 große Flatscreens an den Wänden, gebogene Theke mit Prospektständer. Multimedia-Fokus mit gemütlichem Beratungsbereich.

**Branche:** Tech/Digital, Food-Präsentationen

**Alt-Text:** "Messestand ca. 25 qm mit Lounge-Bereich, Multimedia-Screens und gebogener Theke in Orange-Schwarz – realisiert von S&S Messebau"

---

### 2. 1a5f3965-6bc4-478c-95e1-a97df5fec326.jpeg
**Ziel-Dateiname:** messestand-25qm-beratung-klassisch-rot.jpg

**Beschreibung:** ~25 qm Reihenstand in Rot/Weiß, L-Form Wandsystem. Grauer Teppichboden, Stehtisch-Bereich mit 3 Barhockern, Theke links, Prospektständer. Klassischer, cleaner Beratungsstand.

**Branche:** Elektro/Handwerk/Industrie

**Alt-Text:** "Klassischer Messestand ca. 25 qm mit Stehtisch-Beratungsbereich und Theke in Rot-Weiß – realisiert von S&S Messebau"

---

### 3. 03e69940-1b4a-4555-9c29-e3bb8c2564b3.jpeg
**Ziel-Dateiname:** messestand-25qm-nachhaltig-natur-beige.jpg

**Beschreibung:** ~25 qm Messestand in Natur/Beige/Grün, U-Form Wandsystem. Nachhaltige Ausstrahlung, Bildschirm auf Ständer, Beistelltische aus Metall/Glas, Theke mit 2 Barhockern. Minimalistisch-natürlicher Look.

**Branche:** Nachhaltigkeit/Bio/Lifestyle

**Alt-Text:** "Nachhaltiger Messestand ca. 25 qm mit natürlicher Materialoptik und Beratungstheke in Beige-Grün – realisiert von S&S Messebau"

---

### 4. fda8df74-ab46-44c7-a6ca-ebfc6c9b4850.jpeg
**Ziel-Dateiname:** messestand-25qm-premium-design-dunkel.jpg

**Beschreibung:** ~20-25 qm offener Eckstand in Dunkelbraun/Grün mit hohen Wandelementen. Großflächige Fashion-Bilddrucke, weißer Besprechungstisch mit 2 Stühlen, dunkler Teppichboden. Premium/Design-Fokus mit markanter Ausstrahlung.

**Branche:** Fashion/Lifestyle/Retail, Events, Touren

**Alt-Text:** "Premium-Messestand ca. 25 qm mit großflächigen Bilddrucken und Besprechungsbereich in Dunkelbraun – realisiert von S&S Messebau"

---

## Verwendung

Diese Bilder dienen als Referenzen für die Website und zeigen die Vielseitigkeit und Qualität der von S&S Messebau realisierten Messestände. Sie sollen potenziellen Kunden verschiedene Gestaltungsrichtungen und Einsatzmöglichkeiten aufzeigen:

- **Multimedia & Tech-Fokus** (Orange)
- **Klassischer Beratungsstand** (Rot/Weiß)
- **Nachhaltige Ausrichtung** (Natur/Beige)
- **Premium Design** (Dunkelbraun)

## Integration in die Website

Diese Bilder wurden in die Website integriert und ersetzen Unsplash-Bilder an folgenden Stellen:

### 1. e859a873-049d-4f2b-9156-0ac94939c636.jpeg (Flexersize-Stand)
**Aktueller Pfad:** `/images/e859a873-049d-4f2b-9156-0ac94939c636.jpeg`

**Verwendung:**
- `src/components/pages/HomePage.tsx` – Service-Card "Messebau"
- `src/lib/demo-data.ts` – Referenz "Schwerlast-Stand" (#8)
- `src/components/Header.tsx` – Mega-Menü previewImage für "Messebau"

### 2. 1a5f3965-6bc4-478c-95e1-a97df5fec326.jpeg (Elektro Leven-Stand)
**Aktueller Pfad:** `/images/1a5f3965-6bc4-478c-95e1-a97df5fec326.jpeg`

**Verwendung:**
- `src/components/pages/BranchenPage.tsx` – Branche Industrie Bild
- `src/lib/demo-data.ts` – Referenz "Versicherung" (#2), "Industrie-Showroom" (#3), "Versicherung DKM" (#6), "Robotik" (#9)

### 3. 03e69940-1b4a-4555-9c29-e3bb8c2564b3.jpeg (Vireo-Stand)
**Aktueller Pfad:** `/images/03e69940-1b4a-4555-9c29-e3bb8c2564b3.jpeg`

**Verwendung:**
- `src/components/pages/OtherPages.tsx` – Nachhaltigkeit-Sektion Bild
- `src/lib/demo-data.ts` – Referenz "Bio-Feinkost" (#4)

### 4. fda8df74-ab46-44c7-a6ca-ebfc6c9b4850.jpeg (Stylee-Stand)
**Aktueller Pfad:** `/images/fda8df74-ab46-44c7-a6ca-ebfc6c9b4850.jpeg`

**Verwendung:**
- `src/lib/demo-data.ts` – Referenz "Confiserie" (#5), "Roadshow Finanz" (#7)
- `src/components/pages/BranchenPage.tsx` – Branche Versicherungen Bild
- `src/components/Header.tsx` – Mega-Menü previewImage für "Touren"

---

## Nicht ersetzte Unsplash-Bilder

Die folgenden Unsplash-URLs wurden NICHT ersetzt, da keine passenden eigenen Bilder vorhanden sind:

- **Über Uns Seite** (`OtherPages.tsx`): Unsplash-Bild für Team/Büro
- **Bannerrahmen** (`Header.tsx`): Unsplash-Bild für Bannerrahmen
- **Verschiedene Referenzen** (`demo-data.ts`): Unsplash-Bilder für Bio-Feinkost, Confiserie, etc.

## Bilder mit eigenen Fotos ersetzt

- **Showroom/Ladenbau** (`LeistungenShowroomsPage.tsx`, `Header.tsx`): Ladenbau-Bilder aus `ladenbau/`
- **Food-Branche** (`BranchenPage.tsx`): Deligreece 100qm Food-Stand
- **Food-Referenz** (`demo-data.ts`): Deligreece 100qm Food-Stand

---

## Weitere geplante Bilder

In zukünftigen Updates werden weitere Referenzbilder für größere Standgrößen ergänzt:
- Messestände 50 qm
- Messestände 80 qm
- Messestände 100+ qm

Diese werden dann weitere Unsplash-Bilder ersetzen und die Authentizität der Website weiter erhöhen.

## Hinweise zur Migration

**Wichtig:** Die Bilder können derzeit nicht automatisch verschoben werden, da der Coding Agent keine Binärdateien kopieren/verschieben kann. Die Umbenennung und Verschiebung muss manuell erfolgen:

1. Bilder von `public/images/` nach `public/images/referenzen/messebau-25qm/` verschieben
2. Dateien umbenennen gemäß Ziel-Dateinamen
3. Code-Referenzen anpassen von `/images/[UUID].jpeg` zu `/images/referenzen/messebau-25qm/[beschreibender-name].jpg`
