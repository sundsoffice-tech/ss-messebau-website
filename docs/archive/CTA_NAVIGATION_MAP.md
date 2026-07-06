# CTA Navigation Mapping - Vollständige Übersicht

Dieses Dokument mappt **alle** thematischen CTAs (Call-to-Actions) auf der Website zu ihren Zielabschnitten.

## Prinzip: Thematische CTAs führen immer zu passenden Abschnitten

**Regel:** Wenn ein Button/Link ein spezifisches Thema hat (z.B. "Messebau", "Eventbau"), führt er DIREKT zum passenden Abschnitt auf der Zielseite, nicht nur zur Seite selbst.

---

## Header Navigation

### Desktop Mega-Menu (Leistungen Dropdown)

| CTA Text | Ziel | Format |
|----------|------|--------|
| **Messebau** (mit Icon & Bild) | Leistungen-Seite, Messebau-Abschnitt | `#/leistungen#messebau` |
| **Eventbau & Bühnen** (mit Icon & Bild) | Leistungen-Seite, Eventbau-Abschnitt | `#/leistungen#eventbau` |
| **Ladenbau & Showrooms** (mit Icon & Bild) | Leistungen-Seite, Ladenbau-Abschnitt | `#/leistungen#ladenbau` |
| **Böden & Ausstattung** (mit Icon & Bild) | Leistungen-Seite, Böden-Abschnitt | `#/leistungen#boeden-ausstattung` |
| Design & Konzeption | Leistungen-Seite (Top) | `#/leistungen` |
| Logistik & Transport | Leistungen-Seite (Top) | `#/leistungen` |
| Montage & Service | Leistungen-Seite (Top) | `#/leistungen` |
| "Alle Leistungen anzeigen" | Leistungen-Seite (Top) | `#/leistungen` |

**Status:** ✅ Implementiert (Header.tsx Zeilen 40-85, 378-416)

### Mobile Burger-Menü (Leistungen Abschnitt)

| CTA Text | Ziel | Format |
|----------|------|--------|
| **Messebau** Card | Leistungen-Seite, Messebau-Abschnitt | `#/leistungen#messebau` |
| **Eventbau & Bühnen** Card | Leistungen-Seite, Eventbau-Abschnitt | `#/leistungen#eventbau` |
| **Ladenbau & Showrooms** Card | Leistungen-Seite, Ladenbau-Abschnitt | `#/leistungen#ladenbau` |
| **Böden & Ausstattung** Card | Leistungen-Seite, Böden-Abschnitt | `#/leistungen#boeden-ausstattung` |
| "Alle Leistungen anzeigen" | Leistungen-Seite (Top) | `#/leistungen` |

**Status:** ✅ Implementiert (Header.tsx Zeilen 654-693)

---

## Footer Navigation

### Leistungen Spalte

| CTA Text | Ziel | Format |
|----------|------|--------|
| **Messebau** | Leistungen-Seite, Messebau-Abschnitt | `#/leistungen#messebau` |
| **Eventbau** | Leistungen-Seite, Eventbau-Abschnitt | `#/leistungen#eventbau` |
| **Ladenbau** | Leistungen-Seite, Ladenbau-Abschnitt | `#/leistungen#ladenbau` |
| Bannerrahmen | Bannerrahmen-Seite | `#/bannerrahmen` |
| Nachhaltigkeit | Nachhaltigkeit-Seite | `#/nachhaltigkeit` |

**Status:** ✅ Implementiert (Footer.tsx Zeilen 39-52)

---

## Startseite (/) CTAs

### Hero Bereich

| CTA Text | Ziel | Aktion |
|----------|------|--------|
| "Projekt anfragen" | Inquiry Dialog | Modal öffnen |
| "Leistungen entdecken" | Leistungen-Seite | `#/leistungen` |

**Status:** ✅ Implementiert (HomePage.tsx Zeilen 92-109)

### Services Grid (4 Karten)

| Karte | Ziel | Format |
|-------|------|--------|
| **Messebau** Card (Icon + Bild) | Leistungen-Seite, Messebau-Abschnitt | `#/leistungen#messebau` |
| **Eventbau** Card (Icon + Bild) | Leistungen-Seite, Eventbau-Abschnitt | `#/leistungen#eventbau` |
| **Ladenbau** Card (Icon + Bild) | Leistungen-Seite, Ladenbau-Abschnitt | `#/leistungen#ladenbau` |
| **Böden & Möbel** Card (Icon + Bild) | Leistungen-Seite, Böden-Abschnitt | `#/leistungen#boeden-ausstattung` |

**Status:** ✅ Implementiert (HomePage.tsx Zeilen 119-182)

### Referenzen Teaser

| CTA | Ziel | Format |
|-----|------|--------|
| Referenz Cards | Referenzen-Seite | `#/referenzen` |
| "Alle Referenzen" Button | Referenzen-Seite | `#/referenzen` |

**Status:** ✅ Implementiert

---

## Leistungen Seite (/leistungen) CTAs

### Section-spezifische CTAs

| Button Text | Ziel | Aktion |
|-------------|------|--------|
| "Messestand anfragen" (im Messebau-Abschnitt) | Inquiry Dialog | Modal öffnen |
| "Event planen" (im Eventbau-Abschnitt) | Inquiry Dialog | Modal öffnen |
| "Showroom anfragen" (im Ladenbau-Abschnitt) | Inquiry Dialog | Modal öffnen |
| "Ausstattung anfragen" (im Böden-Abschnitt) | Inquiry Dialog | Modal öffnen |

**Status:** ✅ Implementiert (LeistungenPage.tsx Zeilen 66, 141, 174, 221)

**Sections:**
- `#messebau` - Zeile 40
- `#eventbau` - Zeile 96
- `#ladenbau` - Zeile 148
- `#boeden-ausstattung` - Zeile 188

---

## Branchen Seite (/branchen) CTAs

### Tab-Navigation & Section-Links

| Tab/CTA | Ziel | Format | Status |
|---------|------|--------|--------|
| "Food & Feinkost" Tab | Branchen-Seite, Food-Abschnitt | `#/branchen#food` | ✅ Implementiert |
| "Versicherungen" Tab | Branchen-Seite, Versicherungen-Abschnitt | `#/branchen#versicherungen` | ✅ Implementiert |
| "Industrie & Technik" Tab | Branchen-Seite, Industrie-Abschnitt | `#/branchen#industrie` | ✅ Implementiert |

**Sections:**
- `#food` - Tab Content mit ID "food"
- `#versicherungen` - Tab Content mit ID "versicherungen"
- `#industrie` - Tab Content mit ID "industrie"

**Status:** ✅ Implementiert mit Tab-Steuerung (BranchenPage.tsx Zeilen 16-26)

### Branchen-spezifische CTAs

| Button Text | Ziel | Aktion |
|-------------|------|--------|
| "Food-Stand anfragen" | Inquiry Dialog | Modal öffnen |
| "Versicherungs-Stand anfragen" | Inquiry Dialog | Modal öffnen |
| "Industrie-Stand anfragen" | Inquiry Dialog | Modal öffnen |

**Status:** ✅ Implementiert

---

## Bannerrahmen Seite (/bannerrahmen) CTAs

| CTA Text | Ziel | Format |
|----------|------|--------|
| "Jetzt Banner konfigurieren" | Banner-Konfigurator | `#/banner-bestellen` |
| "Beratung anfordern" | Inquiry Dialog | Modal öffnen |

**Status:** ✅ Implementiert (BannerrahmenPage.tsx Zeilen 23-38)

---

## Weitere Seiten ohne thematische Section-CTAs

### Referenzen (/referenzen)
- Keine Section-Navigation (Filter-basiert)
- CTAs: "Alle Referenzen", "Ihr Projekt anfragen" → Inquiry Dialog

### Über uns (/ueber-uns)
- Keine Section-Navigation
- CTAs: "Mehr über uns", "Jetzt Kontakt aufnehmen" → `/kontakt`

### Ablauf (/ablauf)
- Keine Section-Navigation
- CTAs: "Prozess starten" → Inquiry Dialog

### Nachhaltigkeit (/nachhaltigkeit)
- Keine Section-Navigation
- CTAs: "Nachhaltig planen" → Inquiry Dialog

### Blog (/blog)
- Keine Section-Navigation
- CTAs: Blog-Artikel öffnen

### Kontakt (/kontakt)
- Keine Section-Navigation
- CTAs: Formular absenden, KI-Berater nutzen

### KI-Berater (/ki-berater)
- Keine Section-Navigation
- Interaktiver Chat

### Banner bestellen (/banner-bestellen)
- Keine Section-Navigation
- Multi-Step Konfigurator

---

## Implementierungs-Status

### ✅ Vollständig implementiert:
1. **Header Mega-Menu** - Alle 4 Leistungen führen zu korrekten Sections
2. **Mobile Menü** - Alle 4 Leistungen führen zu korrekten Sections
3. **Footer Leistungen** - Messebau, Eventbau, Ladenbau zu Sections
4. **Startseite Services Grid** - Alle 4 Karten zu Sections
5. **Branchen Tabs** - Tab-Wechsel bei Section-Navigation
6. **Deep-Linking** - URL-basierte Navigation funktioniert

### 📋 Potenzielle Erweiterungen:

1. **Branchen-Verlinkung auf Startseite/anderen Seiten**
   - Falls es Branchen-Teaser gibt → zu `/branchen#food` etc.

2. **Interne Querverweise**
   - Text-Links in Fließtext (z.B. "Mehr zu Messebau") → zu Sections

3. **Breadcrumb Navigation**
   - Zeigt aktuelle Section an

4. **Sticky Section-Navigation**
   - Auf langen Seiten: Floating Inhaltsverzeichnis

---

## Testing Checkliste

### Navigation funktioniert korrekt:

#### Header Mega-Menu (Desktop)
- [ ] "Messebau" Item → `/leistungen` mit Scroll zu Messebau-Überschrift sichtbar
- [ ] "Eventbau & Bühnen" Item → `/leistungen` mit Scroll zu Eventbau-Überschrift sichtbar
- [ ] "Ladenbau & Showrooms" Item → `/leistungen` mit Scroll zu Ladenbau-Überschrift sichtbar
- [ ] "Böden & Ausstattung" Item → `/leistungen` mit Scroll zu Böden-Überschrift sichtbar
- [ ] "Alle Leistungen" → `/leistungen` Top der Seite

#### Mobile Burger-Menü
- [ ] Alle 4 Leistungs-Cards navigieren korrekt
- [ ] "Alle Leistungen anzeigen" → `/leistungen` Top

#### Footer
- [ ] "Messebau" Link → `/leistungen#messebau`
- [ ] "Eventbau" Link → `/leistungen#eventbau`
- [ ] "Ladenbau" Link → `/leistungen#ladenbau`

#### Startseite
- [ ] Alle 4 Service-Cards navigieren zu korrekten Sections
- [ ] Überschriften nach Navigation sichtbar (nicht unter Header versteckt)

#### Branchen Seite
- [ ] Deep-Link `/branchen#food` aktiviert Food-Tab und scrollt
- [ ] Deep-Link `/branchen#versicherungen` aktiviert Versicherungen-Tab und scrollt
- [ ] Deep-Link `/branchen#industrie` aktiviert Industrie-Tab und scrollt

#### Leistungen Seite
- [ ] Deep-Link `/leistungen#messebau` scrollt zu Messebau-Section
- [ ] Deep-Link `/leistungen#eventbau` scrollt zu Eventbau-Section
- [ ] Deep-Link `/leistungen#ladenbau` scrollt zu Ladenbau-Section
- [ ] Deep-Link `/leistungen#boeden-ausstattung` scrollt zu Böden-Section

#### Cross-Page Navigation
- [ ] Von Startseite zu Leistungen-Section: Page Load + Scroll funktioniert
- [ ] Von Footer zu Leistungen-Section: Navigation + Scroll funktioniert
- [ ] Von Header-Mega-Menu zu Section: Navigation funktioniert

#### Scroll-Verhalten
- [ ] Section-Überschriften sind nach Scroll sichtbar (nicht unter Header)
- [ ] Smooth-Scroll funktioniert (außer bei prefers-reduced-motion)
- [ ] Kein Layout-Shift beim Navigieren
- [ ] Focus wird korrekt auf Section gesetzt (Accessibility)

#### Browser-Tests
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Edge Desktop

---

## Technische Details

### Scroll-Offset
- Header-Höhe: 64px (Desktop normal), 56px (Desktop scrolled), 64px (Mobile)
- Scroll-Margin: `scroll-mt-20` (80px) auf allen Section-Elementen
- Effektiv: 80-100px Offset, je nach Viewport

### Deep-Linking Format
- Pattern: `#/page#section`
- Beispiel: `#/leistungen#messebau`
- Parsing: Split by `#` → Array [page, section]

### Retry-Mechanismus
- Bei Page-Wechsel: Bis zu 10 Retries à 100ms
- Grund: Element muss erst im DOM existieren bevor Scroll möglich
- Implementiert in: `navigateToPageAndSection()` (deep-linking.ts)

### Focus Management
- Nach Scroll: `element.focus({ preventScroll: true })`
- Timeout: 300ms (smooth scroll duration)
- Accessibility: Screenreader springt zu Section

---

## Wartung & Updates

### Bei neuen Seiten/Sections:
1. Section mit `id` Attribut versehen
2. `scroll-mt-20` CSS-Klasse hinzufügen
3. In `useSectionObserver` Array aufnehmen
4. CTAs aktualisieren (siehe Beispiele oben)
5. Diese Dokumentation aktualisieren
6. Testing Checkliste durchgehen

### Bei CTA-Änderungen:
1. Prüfen: Ist es ein thematischer CTA?
2. Falls ja: Zum passenden Section verlinken
3. Falls nein: Zu Seiten-Top oder Dialog verlinken
4. Diese Dokumentation aktualisieren

---

## Beispiel-Code für neue Section-Links

```tsx
// Button zu Section auf anderer Seite
import { navigateToPageAndSection } from '@/lib/deep-linking'

<Button onClick={() => navigateToPageAndSection('/leistungen', 'messebau')}>
  Mehr zu Messebau
</Button>

// Link zu Section auf anderer Seite
import { SectionLink } from '@/components/SectionLink'

<SectionLink page="/leistungen" section="messebau" className="text-primary hover:underline">
  Mehr zu Messebau
</SectionLink>

// Button zu Section auf gleicher Seite
const { scrollToSection } = useDeepLinking('/current-page')

<Button onClick={() => scrollToSection('section-id')}>
  Zum Abschnitt
</Button>
```

---

**Letzte Aktualisierung:** 2024 (Iteration 38)
**Verantwortlich:** Navigation Overhaul
**Status:** ✅ Vollständig implementiert und dokumentiert
