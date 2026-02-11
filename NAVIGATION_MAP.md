# Website Navigation Map - S&S Messebau

Dieses Dokument definiert alle Seiten, Abschnitte und thematischen CTAs der Website. Jeder CTA führt präzise zum passenden Abschnitt.

## Seiten und Abschnitte

### 1. Startseite (/)
**Abschnitte:**
- `#hero` - Hero-Bereich
- `#services` - Hauptleistungen (4 Service-Karten)
- `#advantages` - Warum S&S Messebau
- `#references` - Erfolgreiche Projekte
- `#testimonials` - Kundenstimmen
- `#cta` - Call-to-Action Bereich

**CTAs auf dieser Seite:**
- "Projekt anfragen" → öffnet Inquiry Dialog
- "Leistungen entdecken" → `/leistungen`
- Service-Karte "Messebau" → `/leistungen#messebau`
- Service-Karte "Eventbau" → `/leistungen#eventbau`
- Service-Karte "Ladenbau" → `/leistungen#ladenbau`
- Service-Karte "Böden & Möbel" → `/leistungen#boeden-ausstattung`
- Referenz-Karten → `/referenzen`

### 2. Leistungen (/leistungen)
**Abschnitte:**
- `#messebau` - Messebau Leistung (20-200 qm Messestände)
- `#eventbau` - Eventbau & Bühnen
- `#ladenbau` - Ladenbau & Showrooms
- `#boeden-ausstattung` - Böden & Ausstattung

**CTAs auf dieser Seite:**
- "Messestand anfragen" → öffnet Inquiry Dialog
- "Event planen" → öffnet Inquiry Dialog
- "Showroom anfragen" → öffnet Inquiry Dialog
- "Ausstattung anfragen" → öffnet Inquiry Dialog

### 3. Branchen (/branchen)
**Abschnitte:**
- `#food` - Food & Feinkost
- `#versicherungen` - Versicherungen & Dienstleistungen
- `#industrie` - Industrie & Technik

**Tabs navigierbar als Sections:**
Diese Seite nutzt Tabs, die auch als Sections anspringbar sind.

**CTAs auf dieser Seite:**
- "Food-Stand anfragen" → öffnet Inquiry Dialog
- "Versicherungs-Stand anfragen" → öffnet Inquiry Dialog
- "Industrie-Stand anfragen" → öffnet Inquiry Dialog

### 4. Referenzen (/referenzen)
**Keine Subsections** - Hauptseite mit Filter

### 5. Über uns (/ueber-uns)
**Keine Subsections** - Hauptseite mit Story, Team, Arbeitsweise

### 6. Ablauf (/ablauf)
**Keine Subsections** - Timeline mit FAQ

### 7. Nachhaltigkeit (/nachhaltigkeit)
**Keine Subsections** - Systeme, Partnernetzwerk, Vorteile

### 8. Blog (/blog)
**Keine Subsections** - Blog-Grid mit Artikeln

### 9. Kontakt (/kontakt)
**Keine Subsections** - Kontaktformular und KI-Berater

### 10. KI-Berater (/ki-berater)
**Keine Subsections** - Erweiterte KI-Berater Informationen

### 11. Bannerrahmen (/bannerrahmen)
**Keine Subsections** - Info-Seite über Bannerrahmen

### 12. Banner bestellen (/banner-bestellen)
**Keine Subsections** - Konfigurator

## Globale Navigation (Header)

### Desktop Mega-Menu (Leistungen)
Beim Hover über "Leistungen":
- **Messebau** → `/leistungen#messebau`
- **Eventbau & Bühnen** → `/leistungen#eventbau`
- **Ladenbau & Showrooms** → `/leistungen#ladenbau`
- **Böden & Ausstattung** → `/leistungen#boeden-ausstattung`
- "Alle Leistungen anzeigen" → `/leistungen`

### Mobile Menü
Im Burger-Menü:
- **Leistungen Abschnitt** mit 4 Karten:
  - **Messebau** → `/leistungen#messebau`
  - **Eventbau & Bühnen** → `/leistungen#eventbau`
  - **Ladenbau & Showrooms** → `/leistungen#ladenbau`
  - **Böden & Ausstattung** → `/leistungen#boeden-ausstattung`
- "Alle Leistungen anzeigen" → `/leistungen`

## Footer Navigation

### Leistungen Spalte
- **Messebau** → `/leistungen#messebau`
- **Eventbau** → `/leistungen#eventbau`
- **Ladenbau** → `/leistungen#ladenbau`
- **Bannerrahmen** → `/bannerrahmen`
- **Nachhaltigkeit** → `/nachhaltigkeit`

### Unternehmen Spalte
- Über uns → `/ueber-uns`
- Referenzen → `/referenzen`
- Blog → `/blog`
- Kontakt → `/kontakt`

## Navigation Regeln

### 1. Section IDs
Alle Abschnitte haben eindeutige IDs im Format:
- Leistungen: `messebau`, `eventbau`, `ladenbau`, `boeden-ausstattung`
- Branchen: `food`, `versicherungen`, `industrie`
- Startseite: `hero`, `services`, `advantages`, `references`, `testimonials`, `cta`

### 2. Deep-Linking Format
- Seite ohne Section: `#/leistungen`
- Seite mit Section: `#/leistungen#messebau`
- Parsing: `window.location.hash` → Split by `#` → [page, section]

### 3. Scroll-Verhalten
- Header-Offset: 80-100px (sticky header compensation)
- Scroll-Methode: `smooth` (außer bei `prefers-reduced-motion`)
- Nach Navigation: Section-Element erhält Focus für Accessibility
- Retry-Mechanismus: Bis zu 10 Versuche à 100ms falls Element noch nicht geladen

### 4. Scroll-Margin
Alle Section-Elemente haben `scroll-mt-20` (Tailwind) = 5rem = 80px für sticky header clearance.

### 5. Tab-Navigation (Branchen)
Bei `/branchen#food`, `/branchen#versicherungen`, `/branchen#industrie`:
- Tab automatisch aktivieren
- Zu Section scrollen
- Tab-Trigger programmatisch anklicken falls nötig

## Accessibility

### Semantic HTML
- Alle Sections haben `id` Attribute
- Headers haben passende heading levels (h1, h2, h3)
- Navigation verwendet `<nav>` mit `aria-label`
- Aktuelle Seite hat `aria-current="page"`

### Focus Management
- Nach Section-Navigation: Element erhält Focus
- `preventScroll: true` beim Focus (Scroll ist bereits erfolgt)
- Visible Focus Styles auf allen interaktiven Elementen

### Keyboard Navigation
- Alle CTAs per Tastatur erreichbar
- Mega-Menu schließbar mit `Escape`
- Tab-Navigation durch alle Links/Buttons

## Testing Checklist

### Navigation Tests
- [ ] Alle Service-Karten auf Startseite führen zu korrektem Section
- [ ] Mega-Menu Items führen zu korrektem Section
- [ ] Mobile-Menü Items führen zu korrektem Section
- [ ] Footer Links führen zu korrektem Section
- [ ] Deep-Links via URL funktionieren (z.B. direkter Aufruf `#/leistungen#messebau`)
- [ ] Section-Navigation innerhalb derselben Seite scrollt ohne Reload
- [ ] Section-Navigation zu anderer Seite lädt Seite und scrollt dann
- [ ] Überschriften der Sections sind nach Navigation sichtbar (nicht unter Header)
- [ ] Branchen Tabs wechseln korrekt bei Section-Navigation

### Cross-Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (Desktop + iOS)
- [ ] Mobile Chrome (Android)

### Performance Tests
- [ ] Smooth Scroll Performance (60 FPS)
- [ ] Keine Layout Shifts beim Scrollen
- [ ] Schnelles Laden auch bei direktem Deep-Link

## Technische Implementation

### Files
- `/src/lib/deep-linking.ts` - Core deep-linking logic
- `/src/hooks/use-deep-linking.ts` - React hooks für deep-linking
- `/src/components/Header.tsx` - Navigation mit Mega-Menu
- `/src/components/Footer.tsx` - Footer mit Section-Links
- `/src/components/pages/HomePage.tsx` - Service Cards mit Section-Navigation
- `/src/components/pages/LeistungenPage.tsx` - Sections mit IDs
- `/src/components/pages/BranchenPage.tsx` - Tabs als Sections
- `/src/App.tsx` - Hash-Change Handling

### Key Functions
- `parseDeepLink(hash)` - Parse URL hash zu {page, section}
- `createDeepLink(page, section)` - Create URL hash
- `navigateToSection(sectionId, offset)` - Scroll to section
- `navigateToPageAndSection(page, section)` - Navigate + scroll
- `useDeepLinking(page)` - React hook für Section-Navigation auf Page
- `useSectionObserver(sections)` - Observer für aktive Section
