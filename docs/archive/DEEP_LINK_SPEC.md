# Deep-Link & Routing Spezifikation

## Link-Format Standard

Das Deep-Link-Format folgt einem einheitlichen Schema für alle Navigationsfälle:

### Format
```
#/route#section
```

### Beispiele
- **Nur Page:** `#/leistungen` → Springt zur Leistungen-Seite, scrollt nach oben
- **Page + Section:** `#/leistungen#messebau` → Springt zur Leistungen-Seite und scrollt zum Messebau-Abschnitt
- **Homepage:** `#/` oder `#` → Startseite
- **Homepage + Section:** `#/#services` → Startseite mit Scroll zu Services

### Wichtige Regeln
1. **Kein doppeltes `/`:** Die Route beginnt mit `/`, aber zwischen Route und Section steht `#`
2. **Konsistenz:** Alle Seiten verwenden führendes `/` (außer Homepage kann auch nur `#` sein)
3. **Section-Namen:** Verwenden Kebab-Case (z.B. `boeden-ausstattung`, nicht `BoedenAusstattung`)

## Zentrale Funktionen

### Core API (`src/lib/deep-linking.ts`)

#### `parseDeepLink(hash: string): DeepLinkConfig`
Parst einen Hash-String in Page und Section.

```typescript
parseDeepLink('#/leistungen#messebau')
// → { page: '/leistungen', section: 'messebau' }

parseDeepLink('#/kontakt')
// → { page: '/kontakt', section: undefined }
```

#### `createDeepLink(page: string, section?: string): string`
Erstellt einen validen Deep-Link-Hash.

```typescript
createDeepLink('/leistungen', 'messebau')
// → '#/leistungen#messebau'

createDeepLink('/kontakt')
// → '#/kontakt'
```

#### `navigateToSection(sectionId: string, headerOffset?: number): boolean`
Scrollt direkt zu einer Section auf der aktuellen Page.

```typescript
navigateToSection('messebau', 100)
// → Scrollt zu #messebau mit 100px Header-Offset
// → Gibt true zurück wenn Section existiert
```

#### `scrollToSectionWithRetry(sectionId: string, options?): void`
Scrollt zu einer Section mit automatischem Retry (für noch nicht gerenderte Elemente).

```typescript
scrollToSectionWithRetry('messebau', {
  maxRetries: 20,
  retryDelay: 150,
  headerOffset: 100
})
// → Versucht 20x alle 150ms die Section zu finden und zu scrollen
```

#### `navigateToPageAndSection(page: string, section: string, options?): void`
Navigiert zu einer anderen Page und scrollt dann zur Section.

```typescript
navigateToPageAndSection('/leistungen', 'messebau', {
  maxRetries: 20,
  retryDelay: 150,
  headerOffset: 100
})
// → Wechselt zu /leistungen und scrollt automatisch zu #messebau
```

#### `isValidDeepLink(page: string, section?: string): boolean`
Validiert ob eine Section für eine Page existiert.

```typescript
isValidDeepLink('/leistungen', 'messebau')
// → true (Section existiert in SECTION_MAP)

isValidDeepLink('/leistungen', 'nonexistent')
// → false (Section existiert nicht)
```

## App.tsx Routing-Logik

### Zentrale `handleHashChange` Funktion

```typescript
const handleHashChange = () => {
  const deepLink = parseDeepLink(window.location.hash)
  const page = normalizePagePath(deepLink.page)
  const section = deepLink.section
  
  setCurrentPage(page)
  
  if (section) {
    scrollToSectionWithRetry(section, {
      maxRetries: 20,
      retryDelay: 150,
      headerOffset: HEADER_OFFSET
    })
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
}
```

### Verhalten

1. **Initial Load:** 
   - Parst URL-Hash beim ersten Laden
   - Setzt `currentPage` State
   - Scrollt zu Section falls vorhanden, sonst nach oben

2. **Hash Change (Navigation):**
   - Triggert bei jeder Hash-Änderung (Browser Back/Forward, Link-Klicks)
   - Parsed neuen Hash
   - Updated Page State → React rendert neue Page-Komponente
   - Wartet bis Component gemountet ist
   - Scrollt dann zur Section (mit Retry-Logik)

3. **Section-Scroll ohne Page-Wechsel:**
   - Wenn bereits auf der richtigen Page → sofortiger Scroll
   - Wenn auf anderer Page → Page-Wechsel + verzögerter Scroll mit Retry

## Verwendung in Komponenten

### RouterLink Component

```tsx
<RouterLink to="/leistungen" section="messebau">
  Zu Messebau
</RouterLink>
```

Generiert: `href="#/leistungen#messebau"` und handled Click-Event intelligent.

### SectionLink Component

```tsx
<SectionLink page="/branchen" section="food">
  Food & Feinkost
</SectionLink>
```

Kürzere API für direkte Page+Section Navigation.

### Manuelle Navigation

```typescript
// In Event-Handlern
import { navigateToPageAndSection } from '@/lib/deep-linking'

navigateToPageAndSection('/leistungen', 'messebau')
```

## Section-Mapping (`src/lib/section-map.ts`)

Zentrale Konfiguration aller verfügbaren Sections pro Page:

```typescript
export const SECTION_MAP: Record<string, SectionConfig[]> = {
  '/leistungen': [
    { id: 'messebau', label: 'Messebau', page: '/leistungen' },
    { id: 'eventbau', label: 'Eventbau & Bühnen', page: '/leistungen' },
    // ...
  ],
  // ...
}
```

**Wartung:** Bei neuen Sections → hier hinzufügen für automatische Validierung.

## Test-Checkliste

### 1. Direktlink (URL eingeben/teilen)
- [ ] `#/leistungen#messebau` öffnet Leistungen-Page und scrollt zu Messebau
- [ ] `#/kontakt` öffnet Kontakt-Page und scrollt nach oben
- [ ] `#/` öffnet Homepage
- [ ] `#/#services` öffnet Homepage und scrollt zu Services

### 2. Browser Back/Forward
- [ ] Von Home → Leistungen → Browser Back → zeigt Home wieder
- [ ] Von Leistungen#messebau → Branchen#food → Back → zeigt Leistungen#messebau und scrollt korrekt
- [ ] Forward-Navigation stellt Section-Position wieder her

### 3. Page-Wechsel mit Section-Sprung
- [ ] Klick auf "Messebau" in Home-Kacheln → landet auf /leistungen#messebau, Überschrift sichtbar
- [ ] Von /kontakt zu /leistungen#eventbau → Section wird nach Render angesprungen
- [ ] Von /branchen zu /leistungen#ladenbau → wartet auf Component-Mount, scrollt dann

### 4. Section-Wechsel innerhalb gleicher Page
- [ ] Auf /leistungen: Klick auf "Zu Eventbau" → scrollt direkt ohne Flicker
- [ ] Auf /leistungen: Klick auf "Zu Messebau" → sofortiger Scroll, kein Page-Reload
- [ ] URL updated sich zu `#/leistungen#eventbau`

### 5. Reload-Stabilität
- [ ] Seite auf /leistungen#messebau → F5 → Section-Position bleibt erhalten
- [ ] Seite auf /branchen#food → Reload → scrollt erneut zur Section
- [ ] Seite auf /kontakt → Reload → scrollt nach oben (keine Section)

## Robustheit & Edge Cases

### Retry-Mechanismus
- Section-Elemente werden mit Retry-Loop gesucht (max. 20 Versuche à 150ms)
- Falls Section nach Timeout nicht existiert → Console-Warning, aber keine Fehler

### Ungültige Sections
- Validierung über `SECTION_MAP` → Warning wenn Section nicht konfiguriert
- Navigation funktioniert trotzdem (für dynamische Sections)
- Keine Crashes bei falschen Hash-Werten

### Accessibility
- Gescrollte Sections bekommen `tabindex="-1"` und `.focus()` für Screenreader
- `prefers-reduced-motion` → kein smooth Scrolling
- ARIA-Labels werden durch RouterLink/SectionLink durchgereicht

### Performance
- Scroll-Animationen respektieren `prefers-reduced-motion`
- Kein doppeltes Scrolling bei Hash-Änderungen
- Debouncing durch Retry-Delays (verhindert zu viele DOM-Queries)

## Migration & Änderungen

### Vorher (Alt)
```typescript
// Doppelte Hash-Split-Logik
const hash = window.location.hash.replace('#', '')
const hashParts = hash.split('#')
const page = hashParts[0] || '/'
const section = hashParts[1]

// Inkonsistente Scroll-Aufrufe
if (section) {
  setTimeout(() => scrollToSection(section, 100), 200)
} else {
  scrollToTop(false)
}
```

### Nachher (Neu)
```typescript
// Zentrale Parse-Funktion
const deepLink = parseDeepLink(window.location.hash)
const page = normalizePagePath(deepLink.page)
const section = deepLink.section

// Einheitlicher Scroll mit Retry
if (section) {
  scrollToSectionWithRetry(section, { ... })
} else {
  window.scrollTo({ top: 0, behavior: 'auto' })
}
```

### Vorteile
- ✅ Eine zentrale Parse-Logik statt mehrfacher String-Manipulation
- ✅ Robuster Retry-Mechanismus für langsam rendernde Components
- ✅ Validierung gegen SECTION_MAP (Typsicherheit)
- ✅ Konsistente Header-Offset-Werte (HEADER_OFFSET = 100)
- ✅ Keine Race-Conditions durch deterministisches Timing
- ✅ Bessere Testbarkeit durch isolierte Funktionen
- ✅ Leichter wartbar: Neue Sections nur in SECTION_MAP hinzufügen
