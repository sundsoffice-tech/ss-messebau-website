# Text-Angleichung Analyse: Layout-Konsistenz

**Datum:** 2026-02-18
**Ziel:** Alle Stellen identifizieren, an denen ungleiche Textlängen zu visuellen Layout-Brüchen führen — und sinnvolle Angleichungen vorschlagen, ohne die Aussage zu verschlechtern.

---

## Zusammenfassung der Befunde

| Bereich | Stellen | Schweregrad |
|---------|---------|-------------|
| Header Mega-Menü (Leistungen-Kacheln) | 6 Kacheln | **KRITISCH** |
| HomePage Service-Cards | 3 Cards | HOCH |
| HomePage Vorteils-Cards | 3 Cards | MITTEL |
| HomePage Testimonials | 3 Cards | MITTEL |
| LeistungenPage Bullet-Listen | 6 Sektionen | HOCH |
| LeistungenPage „Alles aus einer Hand" | 6 Cards | HOCH |
| LeistungenPage Digital-Cards | 4 Cards | MITTEL |
| LeistungenPage Methodik-Cards | 4 Cards | MITTEL |
| BranchenPage Bullet-Listen | 4 Sektionen | HOCH |
| Ablauf-Schritte | 7 Steps | MITTEL |
| Über-Uns Arbeitsweise-Titel | 5 Items | NIEDRIG |
| Footer Service-Links | 9 Links | MITTEL |
| CTA-Buttons seitenübergreifend | 6 Buttons | NIEDRIG |

---

## 1. KRITISCH: Header Mega-Menü – Leistungen-Kacheln

**Datei:** `src/components/Header.tsx:42-115`
**Übersetzungen:** `src/locales/de.json` (Zeilen 117-151, 1757-1761)

### Problem (vom Nutzer gemeldet)

Die 6 Mega-Menü-Kacheln werden in einem `grid-cols-3`-Raster dargestellt. Eine Kachel — „Showroom & Ladenbau | Brandspaces" — ist deutlich größer als die anderen, weil der Titel viel länger ist.

### Titel-Analyse

| # | Kachel | Aktueller Text | Zeichen |
|---|--------|---------------|---------|
| 1 | Messebau | `Messebau` | **8** |
| 2 | Touren | `Touren & Messeauftritte` | **23** |
| 3 | Showroom | `Showroom & Ladenbau \| Brandspaces` | **33** |
| 4 | Eventbau | `Eventbau & Bühnen` | **17** |
| 5 | Böden | `Böden & Ausstattung` | **19** |
| 6 | Bannerrahmen | `Bannerrahmen` | **12** |

**Differenz:** 25 Zeichen zwischen kürzestem (8) und längstem (33) → Layout-Bruch

### Beschreibungs-Analyse (mit `line-clamp-1`)

| # | Aktueller Text | Zeichen |
|---|---------------|---------|
| 1 | `Professionelle Messestände von 20-200 qm` | **41** |
| 2 | `Skalierbare Lösungen ab NRW` | **27** |
| 3 | `Showrooms, Ladenbau und Markenerlebnisräume` | **44** |
| 4 | `Eindrucksvolle Event-Locations` | **30** |
| 5 | `Hochwertige Komplettlösungen` | **28** |
| 6 | `Großformatdruck & Rahmen-Systeme` | **32** |

**Beschreibungen haben `line-clamp-1`** → werden bei einer Zeile abgeschnitten. Problem ist aber, dass der Clamp je nach Bildschirmbreite unterschiedlich greift.

### Feature-Listen (je 3 Einträge pro Kachel)

| Kachel | f1 | f2 | f3 | Summe |
|--------|----|----|-----|-------|
| Messebau | Design & Konzeption (19) | Standbau & Montage (18) | Full-Service-Betreuung (22) | **59** |
| Touren | Wiederverwendbare Systemstände (29) | Zentrale Logistik (17) | Kostenoptimierte Planung (24) | **70** |
| Showroom | Showrooms & Brand Spaces (24) | Ladeneinrichtung & Ladenbau (27) | Planung bis Montage (19) | **70** |
| Eventbau | Bühnenaufbau (12) | Event-Ausstattung (17) | Technik-Integration (19) | **48** |
| Böden | Messeboden-Systeme (18) | Möbel & Ausstattung (19) | Beleuchtung (11) | **48** |
| Bannerrahmen | Hänge- & Standrahmen (20) | Grafikservice inklusive (23) | Express-Lieferung (17) | **60** |

### Vorschlag: Angeglichene Texte

**Ziel: Titel 14-20 Zeichen, Beschreibungen 28-35 Zeichen, Features 17-22 Zeichen**

#### Titel (Vorher → Nachher)

| # | Vorher | Nachher | Zeichen |
|---|--------|---------|---------|
| 1 | `Messebau` | `Messebau` | 8 → **8** (OK, kurz aber klar) |
| 2 | `Touren & Messeauftritte` | `Messetouren` | 23 → **11** |
| 3 | `Showroom & Ladenbau \| Brandspaces` | `Showroom & Ladenbau` | 33 → **20** |
| 4 | `Eventbau & Bühnen` | `Eventbau & Bühnen` | 17 → **17** (OK) |
| 5 | `Böden & Ausstattung` | `Böden & Ausstattung` | 19 → **19** (OK) |
| 6 | `Bannerrahmen` | `Bannerrahmen` | 12 → **12** (OK) |

**Begründung Kachel 3:** „Brandspaces" ist Marketingsprache und Duplikat von „Showroom". Der Pipe-Operator (`|`) ist im Titel visuell störend. „Showroom & Ladenbau" deckt den Inhalt vollständig ab. Die Brand-Spaces-Botschaft bleibt in den Features erhalten.

**Begründung Kachel 2:** „Touren & Messeauftritte" ist redundant — eine Messetour *ist* ein Messeauftritt. „Messetouren" ist prägnanter und reicht aus.

#### Beschreibungen (Vorher → Nachher)

| # | Vorher | Nachher | Zeichen |
|---|--------|---------|---------|
| 1 | `Professionelle Messestände von 20-200 qm` | `Messestände von 20 bis 200 m²` | 41 → **30** |
| 2 | `Skalierbare Lösungen ab NRW` | `Skalierbare Lösungen ab NRW` | 27 → **27** (OK) |
| 3 | `Showrooms, Ladenbau und Markenerlebnisräume` | `Markenerlebnisräume und Ladenbau` | 44 → **32** |
| 4 | `Eindrucksvolle Event-Locations` | `Eindrucksvolle Event-Locations` | 30 → **30** (OK) |
| 5 | `Hochwertige Komplettlösungen` | `Hochwertige Komplettlösungen` | 28 → **28** (OK) |
| 6 | `Großformatdruck & Rahmen-Systeme` | `Großformatdruck & Rahmen-Systeme` | 32 → **32** (OK) |

#### Features (die größten Ausreißer)

| Kachel | Feature | Vorher | Nachher | Zeichen |
|--------|---------|--------|---------|---------|
| Touren | f1 | `Wiederverwendbare Systemstände` (29) | `Modulare Systemstände` (21) | -8 |
| Showroom | f2 | `Ladeneinrichtung & Ladenbau` (27) | `Ladeneinrichtung` (16) | -11 |
| Eventbau | f1 | `Bühnenaufbau` (12) | `Bühnen- und Podestbau` (21) | +9 |
| Böden | f3 | `Beleuchtung` (11) | `Licht & Beleuchtung` (20) | +9 |

---

## 2. HOCH: HomePage Service-Cards

**Datei:** `src/components/pages/HomePage.tsx` (Zeilen 145-241)
**Layout:** 3 Cards im Grid, gleiche visuelle Gewichtung erwartet

### Titel-Analyse

| Card | Aktueller Titel | Zeichen |
|------|----------------|---------|
| Messebau | `Full-Service Messebau` | **21** |
| Touren | `Touren & wiederkehrende Messeauftritte` | **38** |
| Showrooms | `Showroom & Ladenbau \| Brandspaces` | **33** |

**Differenz:** 17 Zeichen → Card 2 bricht auf 2 Zeilen, Card 1 bleibt einzeilig

### Vorschlag

| Card | Vorher | Nachher | Zeichen |
|------|--------|---------|---------|
| Messebau | `Full-Service Messebau` | `Full-Service Messebau` | 21 (OK) |
| Touren | `Touren & wiederkehrende Messeauftritte` | `Messetouren & Roadshows` | **24** |
| Showrooms | `Showroom & Ladenbau \| Brandspaces` | `Showroom & Ladenbau` | **20** |

**Begründung:** „wiederkehrende Messeauftritte" ist eine Umschreibung von „Touren/Roadshows". Kürzer, gleiche Aussage.

### Bullet-Points (je 4 pro Card)

**Längster Einzeleintrag je Card:**
- Messebau: „Lagerung und Wiederverwendung von Standbauteilen" (48 Zeichen)
- Touren: „Zentrale Logistik ab NRW – kurze Wege, schnelle Reaktion" (**56 Zeichen**)
- Showrooms: „Langfristig effiziente und kostenoptimierte Lösungen" (52 Zeichen)

### Vorschlag

| Card | Bullet | Vorher | Nachher | Z. |
|------|--------|--------|---------|-----|
| Touren | b1 | `Zentrale Logistik ab NRW – kurze Wege, schnelle Reaktion` (56) | `Zentrale Logistik ab NRW – schnelle Reaktion` (45) | -11 |
| Messebau | b3 | `Lagerung und Wiederverwendung von Standbauteilen` (48) | `Lagerung und Wiederverwendung der Standbauteile` (48) | 0 (OK) |

---

## 3. HOCH: LeistungenPage Bullet-Listen

**Datei:** `src/components/pages/LeistungenPage.tsx`

### Touren-Sektion (Zeilen 162-173) — KRITISCH

| # | Bullet | Zeichen |
|---|--------|---------|
| b1 | `Zentrale Logistik ab NRW – kurze Wege, schnelle Reaktionszeiten` | **62** |
| b2 | `Modulare Systemstände für flexible Standgrößen` | **47** |
| b3 | `Wiederverwendbare Komponenten senken Ihre Kosten` | **49** |
| b4 | `Kostenoptimierte Routen- und Transportplanung` | **46** |
| b5 | `Bundesweite Verfügbarkeit für DACH-Region` | **42** |

**Vorschlag b1:** `Zentrale Logistik ab NRW mit schnellen Reaktionszeiten` → **52 Zeichen** (–10)

### Eventbau-Typen (Zeilen 107-119)

| # | Bullet | Zeichen |
|---|--------|---------|
| b1 | `Firmenjubiläen & Galas` | **21** |
| b2 | `Produktpräsentationen` | **21** |
| b3 | `Konferenzen & Tagungen` | **22** |
| b4 | `Outdoor-Events & Festivals` | **26** |
| b5 | `Pop-Up-Stores` | **13** |

**Vorschlag b5:** `Pop-Up-Stores & Aktivierungen` → **28 Zeichen** (+15)

### Eventbau-Benefits (Zeilen 133-144)

| # | Bullet | Zeichen |
|---|--------|---------|
| b8 | `Licht- und Tontechnik-Integration` | **34** (Ausreißer) |
| Rest | 17-24 Zeichen | |

**Vorschlag b8:** `Licht- und Tontechnik` → **21 Zeichen** (–13)

---

## 4. HOCH: LeistungenPage „Alles aus einer Hand"

**Datei:** `src/components/pages/LeistungenPage.tsx` (Zeilen 753-770)
**Layout:** 6 Cards (vermutlich 2×3 oder 3×2 Grid)

### Titel-Analyse

| # | Titel | Zeichen |
|---|-------|---------|
| 1 | `Konzeption & Design` | **19** |
| 2 | `Produktion & Bau` | **16** |
| 3 | `Logistik` | **8** |
| 4 | `Auf- & Abbau` | **12** |
| 5 | `Lagerung` | **8** |
| 6 | `Service vor Ort` | **15** |

**Differenz:** 11 Zeichen — Cards 3 und 5 sind viel kürzer

### Vorschlag

| # | Vorher | Nachher | Zeichen |
|---|--------|---------|---------|
| 3 | `Logistik` | `Logistik & Transport` | **20** |
| 5 | `Lagerung` | `Lagerung & Archivierung` | **24** |

### Beschreibungs-Analyse

| # | Beschreibung | Zeichen |
|---|-------------|---------|
| 1 | `Individuelle Entwürfe und Konzeptentwicklung für Ihren Stand` | **60** |
| 2 | `Hochwertige Verarbeitung durch erfahrene Partner` | **48** |
| 3 | `Bundesweiter Transport und termingerechte Anlieferung` | **53** |
| 4 | `Professionelles Team kümmert sich vor Ort um alles` | **50** |
| 5 | `Sichere Einlagerung für Wiederverwendung bei Folgemessen` | **56** |
| 6 | `Technischer Support während der gesamten Messezeit` | **50** |

**Vorschlag Card 1:** `Individuelle Entwürfe und Konzepte für Ihren Stand` → **50 Zeichen** (–10)

---

## 5. MITTEL: HomePage Vorteils-Cards

**Datei:** `src/components/pages/HomePage.tsx` (Zeilen 255-285)
**Layout:** 3 Cards im Grid

### Titel-Analyse

| # | Titel | Zeichen |
|---|-------|---------|
| 1 | `48h-Angebot mit persönlicher Beratung` | **37** |
| 2 | `Spezialist für 20–200 m²` | **24** |
| 3 | `Branchenexperte mit Netzwerk` | **28** |

**Differenz:** 13 Zeichen

### Vorschlag

| # | Vorher | Nachher | Zeichen |
|---|--------|---------|---------|
| 1 | `48h-Angebot mit persönlicher Beratung` | `48h-Angebot inkl. Beratung` | **27** |

### Beschreibungs-Analyse

| # | Zeichen | Differenz |
|---|---------|-----------|
| 1 (offer) | 154 | +21 zum kürzesten |
| 2 (specialist) | 133 | Kürzester |
| 3 (expert) | 147 | +14 |

**Vorschlag:** Beschreibung 1 von 154 auf ~140 Zeichen kürzen, Beschreibung 2 von 133 auf ~140 erweitern.

---

## 6. MITTEL: HomePage Testimonials

**Datei:** `src/components/pages/HomePage.tsx` (Zeilen 379-417)
**Layout:** 3 Cards im Grid, kein `line-clamp` auf Zitat-Text

| # | Zitat | Zeichen |
|---|-------|---------|
| t1 | „Perfekter Stand, pünktlich aufgebaut..." | **154** |
| t2 | „S&S Messebau hat uns von der ersten..." | **156** |
| t3 | „Faire Preise, kreative Lösungen..." | **132** |

**Differenz:** 24 Zeichen → t3 ist merklich kürzer

### Vorschlag

**t3 erweitern** (132 → ~150 Zeichen):
- Vorher: `Faire Preise, kreative Lösungen und ein Team, das mitdenkt. Unser Showroom ist genau so geworden, wie wir ihn uns vorgestellt haben.`
- Nachher: `Faire Preise, kreative Lösungen und ein Team, das mitdenkt. Unser Showroom ist genau so geworden, wie wir ihn uns vorgestellt haben – top Ergebnis.`

Alternativ: `line-clamp-4` auf alle Testimonial-Texte setzen.

---

## 7. HOCH: BranchenPage Bullet-Listen

**Datei:** `src/components/pages/BranchenPage.tsx`

### Eventbau-Sektion (Zeilen 138-149) — größter Ausreißer

| # | Bullet | Zeichen |
|---|--------|---------|
| b1 | `Modulare Roadshow-Systeme` | **25** |
| b2 | `Schneller Auf- und Abbau` | **25** |
| b3 | `Transport-optimierte Konstruktionen` | **35** |
| b4 | `Wiederverwendbare Event-Module` | **30** |
| b5 | `Konsistente Markenpräsenz über mehrere Locations` | **49** |

**Vorschlag b5:** `Markenpräsenz über mehrere Standorte` → **34 Zeichen** (–15)

### Messebau-Sektion (Zeilen 79-90)

| # | Bullet | Zeichen |
|---|--------|---------|
| b3 | `Technische Integration (Beleuchtung, AV, Strom)` | **48** (Rest: 33-41) |

**Vorschlag b3:** `Technische Ausstattung (Licht, AV, Strom)` → **40 Zeichen** (–8)

### Sport-Sektion (Zeilen 256-267)

| # | Bullet | Zeichen |
|---|--------|---------|
| b4 | `Sport-Branding und Sponsoring-Integration` | **41** (Rest: 28-38) |

**Vorschlag b4:** `Sport-Branding und Sponsoring` → **28 Zeichen** (–13)

---

## 8. MITTEL: Ablauf-Schritte

**Datei:** `src/components/pages/OtherPages.tsx` (Zeilen 185-327)

### Titel-Analyse

| Step | Titel | Zeichen | Muster |
|------|-------|---------|--------|
| 1 | `Erstgespräch & Briefing` | 24 | X & Y |
| 2 | `Konzept & Design` | 17 | X & Y |
| 3 | `Angebot & Planung` | 18 | X & Y |
| 4 | `Produktion` | **11** | Nur X |
| 5 | `Logistik & Aufbau` | 18 | X & Y |
| 6 | `Betreuung & Service` | 19 | X & Y |
| 7 | `Abbau & Nachsorge` | 18 | X & Y |

**Problem:** Step 4 bricht das „X & Y"-Muster und ist deutlich kürzer.

**Vorschlag:** `Produktion` → `Produktion & Fertigung` (**22 Zeichen**)

### Beschreibungs-Analyse

| Step | Zeichen |
|------|---------|
| 1 | 115 |
| 2 | 126 |
| 3 | 118 |
| 4 | 107 |
| 5 | **88** |
| 6 | **72** |
| 7 | 106 |

**Problem:** Step 5 (88) und Step 6 (72) sind deutlich kürzer als der Rest (106-126).

**Vorschlag Step 6:**
- Vorher: `Während der Messetage stehen wir bei technischen Fragen zur Verfügung.` (72)
- Nachher: `Während der Messetage stehen wir mit technischer Unterstützung zur Verfügung – bei Fragen oder Anpassungen vor Ort.` (**115**)

**Vorschlag Step 5:**
- Vorher: `Pünktlicher Transport zur Messe und professioneller Aufbau durch unser erfahrenes Team.` (88)
- Nachher: `Pünktlicher Transport zur Messe und professioneller Aufbau durch unser erfahrenes Team. Termintreue garantiert.` (**112**)

---

## 9. MITTEL: LeistungenPage Digital-Cards

**Datei:** `src/components/pages/LeistungenPage.tsx` (Zeilen 365-376)
**Layout:** 4 Cards im Grid

### Titel-Analyse

| # | Titel | Zeichen |
|---|-------|---------|
| 1 | `Touchscreen-Terminals` | **20** |
| 2 | `LED-Videowalls` | **14** |
| 3 | `KI-Chatbots` | **11** |
| 4 | `Live-Produktdemos` | **17** |

**Vorschlag Card 3:** `KI-Chatbot-Assistent` → **20 Zeichen** (+9)

### Beschreibungs-Analyse

| # | Beschreibung | Zeichen |
|---|-------------|---------|
| 1 | `Interaktive Produktkataloge & Konfiguratoren` | **43** |
| 2 | `Großformatige Displays für maximale Aufmerksamkeit` | **49** |
| 3 | `Digitale Assistenten für Erstberatung` | **37** |
| 4 | `Integrierte Präsentationssysteme` | **32** |

**Vorschlag Card 4:** `Integrierte Präsentations- und Demo-Systeme` → **43 Zeichen** (+11)
**Vorschlag Card 3:** `Digitale Assistenten für die Erstberatung` → **41 Zeichen** (+4)

---

## 10. MITTEL: Footer Service-Links

**Datei:** `src/components/Footer.tsx` (Zeilen 57-125)

| # | Link-Text | Zeichen |
|---|-----------|---------|
| 1 | `Messebau` | **8** |
| 2 | `Eventbau` | **8** |
| 3 | `Ladenbau` | **8** |
| 4 | `Touren & Messeauftritte` | **23** |
| 5 | `Showrooms & Brand Spaces` | **25** |
| 6 | `Böden & Ausstattung` | **20** |
| 7 | `Digital Experience` | **18** |
| 8 | `Bannerrahmen` | **12** |
| 9 | `Nachhaltigkeit` | **15** |

**Differenz:** 17 Zeichen — die ersten drei sind kurz, die nächsten drei lang.

**Vorschlag:**
- `Touren & Messeauftritte` → `Messetouren` (**11**) — konsistent mit Mega-Menü-Änderung
- `Showrooms & Brand Spaces` → `Showroom & Ladenbau` (**20**) — konsistent mit Mega-Menü-Änderung

---

## 11. NIEDRIG: Über-Uns Arbeitsweise-Titel

**Datei:** `src/components/pages/OtherPages.tsx`

| # | Titel | Zeichen |
|---|-------|---------|
| 1 | `Persönlich` | 10 |
| 2 | `Flexibel` | 8 |
| 3 | `Zuverlässig` | 11 |
| 4 | `Transparent` | 11 |
| 5 | `Qualitätsorientiert` | **19** |

**Vorschlag:** `Qualitätsorientiert` → `Qualitätsfokus` (**14**) — kürzer, gleiche Aussage

---

## 12. NIEDRIG: CTA-Buttons seitenübergreifend

| Seite | Button-Text | Zeichen |
|-------|------------|---------|
| Referenzen | `Jetzt Projekt besprechen` | 26 |
| Referenzen (leer) | `Projekt anfragen` | **16** |
| Referenzen (Detail) | `Ähnliches Projekt anfragen` | 27 |
| Kontakt | `Nachricht absenden` | 18 |
| Ablauf | `Erstgespräch vereinbaren` | 25 |
| Über Uns | `Jetzt Kontakt aufnehmen` | 24 |

**Differenz:** 11 Zeichen bei den primären CTAs (24-27), der Empty-State-Button ist 10 Zeichen kürzer.

**Vorschlag:** `Projekt anfragen` → `Jetzt Projekt anfragen` (**22**) — näher am Standard

---

## Priorisierte Umsetzungs-Reihenfolge

### Priorität 1 — KRITISCH (sofort sichtbar, bricht Layout)

| # | Änderung | Datei | Key |
|---|----------|-------|-----|
| 1 | Mega-Menü Kachel 3: „Showroom & Ladenbau \| Brandspaces" → „Showroom & Ladenbau" | de.json | `header.mega.showroomLadenbau` |
| 2 | Mega-Menü Kachel 2: „Touren & Messeauftritte" → „Messetouren" | de.json | `header.mega.touren` |
| 3 | HomePage Card 2: „Touren & wiederkehrende Messeauftritte" → „Messetouren & Roadshows" | de.json | `home.services.touren.title` |
| 4 | HomePage Card 3: „Showroom & Ladenbau \| Brandspaces" → „Showroom & Ladenbau" | de.json | `home.services.showroom.title` |

### Priorität 2 — HOCH (Grid-Cards ungleich hoch)

| # | Änderung | Datei | Key |
|---|----------|-------|-----|
| 5 | „Alles aus einer Hand" Card 3: „Logistik" → „Logistik & Transport" | de.json | `leistungen.allesauseinerhand.card3.title` |
| 6 | „Alles aus einer Hand" Card 5: „Lagerung" → „Lagerung & Archivierung" | de.json | `leistungen.allesauseinerhand.card5.title` |
| 7 | Touren b1 kürzen (62 → 52 Zeichen) | de.json | `leistungen.touren.b1` |
| 8 | Eventbau b5 erweitern (13 → 28 Zeichen) | de.json | `leistungen.eventbau.b5` |
| 9 | Eventbau b8 kürzen (34 → 21 Zeichen) | de.json | `leistungen.eventbau.b8` |
| 10 | Branchen Eventbau b5 kürzen (49 → 34 Zeichen) | de.json | `branchen.eventbau.b5` |

### Priorität 3 — MITTEL (merkbar, aber nicht kritisch)

| # | Änderung | Bereich |
|---|----------|---------|
| 11 | Ablauf Step 4 Titel erweitern | `ablauf.step4.title` |
| 12 | Ablauf Step 5+6 Beschreibung erweitern | `ablauf.step5.desc`, `ablauf.step6.desc` |
| 13 | Digital Card 3+4 Titel/Beschreibung angleichen | `leistungen.digital.interactive.*` |
| 14 | Testimonial t3 leicht erweitern | `home.testimonials.t3.text` |
| 15 | Vorteils-Card 1 Titel kürzen | `home.advantages.offer.title` |
| 16 | Footer Links konsistent mit Menü-Änderungen | `footer.services.*` |

### Priorität 4 — NIEDRIG (Feinschliff)

| # | Änderung | Bereich |
|---|----------|---------|
| 17 | Arbeitsweise Titel 5 kürzen | `about.arbeitsweise.w5.title` |
| 18 | CTA Empty-State-Button angleichen | `referenzen.emptyCta` |

---

## Technische Hinweise

### Bereits vorhandene CSS-Absicherungen

| Technik | Wo | Wirkung |
|---------|-----|---------|
| `line-clamp-1` | Mega-Menü Beschreibungen | Schneidet nach 1 Zeile ab |
| `line-clamp-2` | Referenz-Card Beschreibungen | Schneidet nach 2 Zeilen ab |
| `min-h-[48px]` | Mobile Buttons | Mindesthöhe für Touch-Targets |
| `flex flex-col` | Cards allgemein | Streckt sich auf Inhalt — **ohne** gleiche Höhe! |

### Empfohlene zusätzliche CSS-Maßnahmen

Textangleichung allein löst nicht alle Probleme. Ergänzend sollte man erwägen:

1. **`line-clamp-1` auf Mega-Menü-Titel** hinzufügen
2. **`min-h`-Werte** auf Grid-Cards setzen, damit sie gleich hoch sind
3. **`grid-rows-subgrid`** für Cards, damit Titel/Beschreibung/Features auf gleicher Baseline stehen (CSS Subgrid)

### Betroffene Übersetzungsdateien

Alle Textänderungen betreffen:
- `src/locales/de.json` — Deutsche Texte
- `src/locales/en.json` — Englische Texte (müssen analog angepasst werden)
