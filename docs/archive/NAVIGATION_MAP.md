# Website Navigation Map - S&S Messebau

Dieses Dokument definiert alle Seiten, Abschnitte und thematischen CTAs der Website. Jeder CTA führt präzise zum passenden Abschnitt.

## Seiten und Abschnitte

### 1. Startseite (/)
**Abschnitte:**
- `#hero` - Hero-Bereich
- `#services` - Hauptleistungen (3 Service-Karten)
- `#advantages` - Warum S&S Messebau
- `#references` - Erfolgreiche Projekte
- `#process` - Projektablauf (ProcessTimeline)
- `#testimonials` - Kundenstimmen
- `#cta` - Call-to-Action Bereich

**CTAs auf dieser Seite:**
- "Projekt anfragen" → öffnet Inquiry Dialog
- "Leistungen entdecken" → `/leistungen`
- Service-Karte "Messebau" → `/leistungen/messebau`
- Service-Karte "Touren & Messeauftritte" → `/leistungen/touren`
- Service-Karte "Showroom & Ladenbau" → `/leistungen/showroom-ladenbau`
- Referenz-Karten → `/referenzen`
- Branchen-Links (LogoWall) → `/branchen#food`, `/branchen#versicherungen`, `/branchen#industrie`

### 2. Leistungen Hub (/leistungen)
**Abschnitte:** Keine Subsections – Übersichtsseite mit Service-Kacheln

**Service-Kacheln:**
- **Messebau** → `/leistungen/messebau`
- **Eventbau** → `/leistungen/eventbau`
- **Touren** → `/leistungen/touren`
- **Showroom & Ladenbau** → `/leistungen/showroom-ladenbau`
- **Böden & Ausstattung** → `/leistungen/boeden-ausstattung`
- **Bannerrahmen** → `/bannerrahmen`

### 2a. Leistungen Messebau (/leistungen/messebau)
Eigene Detailseite für Messebau

### 2b. Leistungen Eventbau (/leistungen/eventbau)
Eigene Detailseite für Eventbau

### 2c. Leistungen Touren (/leistungen/touren)
Eigene Detailseite für Touren & Messeauftritte

### 2d. Leistungen Showroom & Ladenbau (/leistungen/showroom-ladenbau)
Eigene kombinierte Detailseite für Showroom & Ladenbau | Brandspaces
- Redirects: `/leistungen/showrooms`, `/leistungen/ladenbau`, `/leistungen/brandspaces` → `/leistungen/showroom-ladenbau`

### 2e. Leistungen Böden (/leistungen/boeden-ausstattung)
Eigene Detailseite für Böden & Ausstattung

### 2f. Leistungen Digital (/leistungen/digital-experience)
Eigene Detailseite für Digital Experience

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

### 9. Aktuelles (/aktuelles)
Messekalender und News

### 10. Kontakt (/kontakt)
**Keine Subsections** - Kontaktformular und KI-Berater

### 11. KI-Berater (/ki-berater)
**Keine Subsections** - Erweiterte KI-Berater Informationen

### 12. Bannerrahmen (/bannerrahmen)
**Keine Subsections** - Info-Seite über Bannerrahmen

### 13. Banner bestellen (/banner-bestellen)
**Keine Subsections** - Konfigurator

## Globale Navigation (Header)

### Desktop Mega-Menu (Leistungen)
Beim Hover über "Leistungen":
- **Messebau** → `/leistungen/messebau`
- **Touren & Messeauftritte** → `/leistungen/touren`
- **Showroom & Ladenbau | Brandspaces** → `/leistungen/showroom-ladenbau`
- **Eventbau & Bühnen** → `/leistungen/eventbau`
- **Böden & Ausstattung** → `/leistungen/boeden-ausstattung`
- **Bannerrahmen** → `/bannerrahmen`
- "Alle Leistungen anzeigen" → `/leistungen`

### Mobile Menü
Im Burger-Menü:
- **Leistungen Abschnitt** mit 6 Karten:
  - **Messebau** → `/leistungen/messebau`
  - **Touren** → `/leistungen/touren`
  - **Showroom & Ladenbau** → `/leistungen/showroom-ladenbau`
  - **Eventbau** → `/leistungen/eventbau`
  - **Böden & Ausstattung** → `/leistungen/boeden-ausstattung`
  - **Bannerrahmen** → `/bannerrahmen`
- "Alle Leistungen anzeigen" → `/leistungen`

## Footer Navigation

### Leistungen Spalte
- **Messebau** → `/leistungen/messebau`
- **Eventbau** → `/leistungen/eventbau`
- **Showroom & Ladenbau** → `/leistungen/showroom-ladenbau`
- **Touren** → `/leistungen/touren`
- **Böden & Ausstattung** → `/leistungen/boeden-ausstattung`
- **Digital Experience** → `/leistungen/digital-experience`
- **Bannerrahmen** → `/bannerrahmen`

### Unternehmen Spalte
- Über uns → `/ueber-uns`
- Referenzen → `/referenzen`
- Blog → `/blog`
- Kontakt → `/kontakt`

## Navigation Regeln

### 1. Section IDs
Alle Abschnitte haben eindeutige IDs im Format:
- Startseite: `hero`, `services`, `advantages`, `references`, `process`, `testimonials`, `cta`
- Branchen: `food`, `versicherungen`, `industrie`

### 2. Deep-Linking Format
- Seite ohne Section: `#/leistungen`
- Seite mit Section: `#/branchen#food`
- Parsing: `window.location.hash` → Split by `#` → [page, section]

### 3. Scroll-Verhalten
- Header-Offset: 80-100px (sticky header compensation)
- Scroll-Methode: `smooth` (außer bei `prefers-reduced-motion`)
- Nach Navigation: Section-Element erhält Focus für Accessibility
- Retry-Mechanismus: Bis zu 20 Versuche à 150ms falls Element noch nicht geladen

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
- [ ] Alle Service-Karten auf Startseite führen zu korrekter Detailseite
- [ ] Mega-Menu Items führen zu korrekter Detailseite
- [ ] Mobile-Menü Items führen zu korrekter Detailseite
- [ ] Footer Links führen zu korrekter Detailseite
- [ ] Deep-Links via URL funktionieren (z.B. direkter Aufruf `#/branchen#food`)
- [ ] Section-Navigation innerhalb derselben Seite scrollt ohne Reload
- [ ] Section-Navigation zu anderer Seite lädt Seite und scrollt dann
- [ ] Überschriften der Sections sind nach Navigation sichtbar (nicht unter Header)
- [ ] Branchen Tabs wechseln korrekt bei Section-Navigation
- [ ] LogoWall-Links auf Startseite navigieren korrekt zu `/branchen#xyz`
- [ ] `/#process` Deep-Link scrollt zur ProcessTimeline

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
- `/src/lib/section-map.ts` - Section map with page/section definitions
- `/src/hooks/use-deep-linking.ts` - React hooks für deep-linking
- `/src/components/Header.tsx` - Navigation mit Mega-Menu
- `/src/components/Footer.tsx` - Footer mit Section-Links
- `/src/components/pages/HomePage.tsx` - Service Cards mit Service-Navigation
- `/src/components/pages/LeistungenHubPage.tsx` - Leistungen Übersichtsseite
- `/src/components/pages/LeistungenMessebauPage.tsx` - Messebau Detailseite
- `/src/components/pages/LeistungenTourenPage.tsx` - Touren Detailseite
- `/src/components/pages/LeistungenShowroomsPage.tsx` - Showroom & Ladenbau Detailseite
- `/src/components/pages/LeistungenEventbauPage.tsx` - Eventbau Detailseite
- `/src/components/pages/LeistungenBoedenPage.tsx` - Böden Detailseite
- `/src/components/pages/LeistungenDigitalPage.tsx` - Digital Experience Detailseite
- `/src/components/pages/BranchenPage.tsx` - Tabs als Sections
- `/src/components/ui/ProcessTimeline.tsx` - Prozess-Timeline mit id="process"
- `/src/components/ui/GuaranteeBanner.tsx` - 48h-Garantie Banner (i18n)
- `/src/components/ui/LogoWall.tsx` - Branchen-Links (i18n + Navigation)
- `/src/App.tsx` - Hash-Change Handling + Routing

### Key Functions
- `parseDeepLink(hash)` - Parse URL hash zu {page, section}
- `createDeepLink(page, section)` - Create URL hash
- `navigateToSection(sectionId, offset)` - Scroll to section
- `navigateToPageAndSection(page, section)` - Navigate + scroll
- `useDeepLinking(page)` - React hook für Section-Navigation auf Page
- `useSectionObserver(sections)` - Observer für aktive Section
