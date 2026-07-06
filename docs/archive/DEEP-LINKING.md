# Deep-Linking System Dokumentation

## Übersicht

Das Deep-Linking-System ermöglicht es, direkt zu spezifischen Abschnitten auf jeder Seite der Website zu navigieren. Dies funktioniert über URL-Hashes im Format `#/page#section` und bleibt auch bei Seitenneuladen, Teilen und Bookmarks erhalten.

## URL-Format

```
#/page#section
```

Beispiele:
- `#/leistungen#messebau` - Springt zur Leistungen-Seite, Abschnitt "Messebau"
- `#/branchen#food-feinkost` - Springt zur Branchen-Seite, Abschnitt "Food & Feinkost"
- `#/kontakt#kontaktformular` - Springt zur Kontakt-Seite, Formular-Bereich

## Zentrale Konfiguration

Alle Section-IDs sind zentral in `/src/lib/section-map.ts` definiert. Dies stellt sicher, dass:

1. **Keine doppelten IDs** existieren
2. **Keine fehlenden Verlinkungen** auftreten
3. **Änderungen zentral** vorgenommen werden können
4. **Validierung** automatisch erfolgt

### Section Map Struktur

```typescript
export const SECTION_MAP: Record<string, SectionConfig[]> = {
  '/': [
    { id: 'hero', label: 'Startseite', page: '/' },
    { id: 'services', label: 'Leistungsübersicht', page: '/' },
    // ...
  ],
  '/leistungen': [
    { id: 'messebau', label: 'Messebau', page: '/leistungen' },
    { id: 'eventbau', label: 'Eventbau & Bühnen', page: '/leistungen' },
    // ...
  ],
  // ... weitere Seiten
}
```

## Verwendung in Komponenten

### 1. Mit SectionLink Komponente (empfohlen)

```tsx
import { SectionLink } from '@/components/SectionLink'

<SectionLink 
  page="/leistungen" 
  section="messebau"
  className="text-primary hover:underline"
>
  Mehr über Messebau erfahren
</SectionLink>
```

### 2. Mit RouterLink Komponente

```tsx
import { RouterLink } from '@/components/RouterLink'

<RouterLink 
  to="/leistungen" 
  section="messebau"
  className="btn"
>
  Zum Messebau
</RouterLink>
```

### 3. Programmatisch mit Hook

```tsx
import { useDeepLinking } from '@/hooks/use-deep-linking'

function MyComponent() {
  const { navigateToSectionOnPage } = useDeepLinking('/current-page')
  
  const handleClick = () => {
    navigateToSectionOnPage('/leistungen', 'messebau')
  }
  
  return <button onClick={handleClick}>Zum Messebau</button>
}
```

### 4. Direkt mit Funktion

```tsx
import { navigateToPageAndSection } from '@/lib/deep-linking'

const handleClick = () => {
  navigateToPageAndSection('/leistungen', 'messebau', {
    maxRetries: 15,
    retryDelay: 100,
    headerOffset: 100
  })
}
```

## Section-IDs auf Seiten setzen

Jeder Abschnitt muss eine eindeutige ID haben, die in der Section Map definiert ist:

```tsx
<section id="messebau" className="py-16 scroll-mt-20">
  <h2>Messebau</h2>
  {/* Inhalt */}
</section>
```

**Wichtig:** 
- Verwende `scroll-mt-20` (oder ähnlich) für korrekten Scroll-Offset
- Die ID muss mit der Section Map übereinstimmen
- Verwende `tabindex="-1"` wenn das Element nicht natürlich fokussierbar ist

## Accessibility

Das System ist vollständig accessible:

1. **Keyboard Navigation**: Alle Links sind mit Tab-Taste erreichbar
2. **Focus Management**: Nach dem Scrollen wird das Ziel-Element fokussiert
3. **Screen Reader**: Korrekte ARIA-Labels und semantic HTML
4. **Reduced Motion**: Respektiert `prefers-reduced-motion` Präferenz

## Thematische Links

Vordefinierte thematische Links sind in der Section Map als `THEMATIC_LINKS` verfügbar:

```typescript
export const THEMATIC_LINKS = {
  'home-to-messebau': { page: '/leistungen', section: 'messebau', label: 'Messebau' },
  'home-to-eventbau': { page: '/leistungen', section: 'eventbau', label: 'Eventbau' },
  // ...
}
```

Verwendung:

```tsx
import { getThematicLink } from '@/lib/section-map'
import { SectionLink } from '@/components/SectionLink'

const link = getThematicLink('home-to-messebau')
if (link) {
  return (
    <SectionLink page={link.page} section={link.section}>
      {link.label}
    </SectionLink>
  )
}
```

## Neue Sections hinzufügen

### Schritt 1: Section Map aktualisieren

In `/src/lib/section-map.ts`:

```typescript
export const SECTION_MAP = {
  // ...
  '/neue-seite': [
    { id: 'neuer-abschnitt', label: 'Neuer Abschnitt', page: '/neue-seite' }
  ]
}
```

### Schritt 2: Section ID auf der Seite setzen

In der Page-Komponente:

```tsx
<section id="neuer-abschnitt" className="py-16 scroll-mt-20">
  <h2>Neuer Abschnitt</h2>
  {/* Inhalt */}
</section>
```

### Schritt 3: Section Observer aktivieren (optional)

Für automatische URL-Updates beim Scrollen:

```tsx
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'

export function NeuePage() {
  useDeepLinking('/neue-seite')
  useSectionObserver(['neuer-abschnitt', 'weiterer-abschnitt'])
  
  return (
    // ...
  )
}
```

## Best Practices

### 1. Konsistente Namenskonvention

- Verwende kebab-case für IDs: `messebau`, `food-feinkost`
- Beschreibende Namen: `kontaktformular` statt `form1`
- Keine Sonderzeichen außer Bindestrichen

### 2. Section-IDs gruppieren

Gruppiere verwandte Sections logisch:

```tsx
// Gut
<section id="messebau" />
<section id="eventbau" />
<section id="ladenbau" />

// Nicht ideal
<section id="section1" />
<section id="content-area" />
<section id="box3" />
```

### 3. Scroll-Offset beachten

Verwende immer `scroll-mt-*` Utility-Classes für korrekten Abstand zum Header:

```tsx
<section id="messebau" className="scroll-mt-20 lg:scroll-mt-24">
  {/* Mobile: 80px, Desktop: 96px Offset */}
</section>
```

### 4. Fokus-Zustände stylen

Stelle sicher, dass fokussierte Sections visuell erkennbar sind:

```css
section:focus {
  outline: 3px solid oklch(0.45 0.15 250);
  outline-offset: 2px;
}
```

### 5. Testing

Teste Deep-Links immer mit:
- Direktem URL-Aufruf (Copy/Paste)
- Page Reload (F5)
- Browser Back/Forward
- Teilen-Funktionen
- Verschiedenen Viewport-Größen

## Fehlerbehebung

### Problem: Section wird nicht gefunden

**Lösung:** Überprüfe, ob:
1. Die Section-ID in der Section Map existiert
2. Das HTML-Element die korrekte ID hat
3. Die ID exakt übereinstimmt (case-sensitive)

### Problem: Scroll-Position ist ungenau

**Lösung:** Passe den `headerOffset` Parameter an:

```tsx
navigateToPageAndSection('/leistungen', 'messebau', {
  headerOffset: 120  // Erhöhe/verringere für bessere Position
})
```

### Problem: Section lädt nicht bei Seitenwechsel

**Lösung:** Erhöhe `maxRetries` oder `retryDelay`:

```tsx
navigateToPageAndSection('/leistungen', 'messebau', {
  maxRetries: 20,     // Mehr Versuche
  retryDelay: 150     // Längere Pause zwischen Versuchen
})
```

### Problem: URL-Update funktioniert nicht

**Lösung:** Verwende `updateUrlWithSection` manuell:

```tsx
import { updateUrlWithSection } from '@/lib/deep-linking'

// Nach erfolgreichem Scroll
updateUrlWithSection('messebau', true)  // true = replaceState
```

## Wartung

### Section-IDs ändern

Bei Änderungen an Section-IDs:

1. **Alte ID in Section Map beibehalten** (mindestens 6 Monate)
2. **Neue ID hinzufügen**
3. **Redirect-Logik implementieren** (optional):

```typescript
const SECTION_REDIRECTS: Record<string, string> = {
  'alte-id': 'neue-id'
}

export function resolveSection(sectionId: string): string {
  return SECTION_REDIRECTS[sectionId] || sectionId
}
```

### Regelmäßige Checks

Führe regelmäßig aus:

1. Validierung aller Section-IDs
2. Check auf verwaiste Links
3. Performance-Tests
4. Accessibility-Audit

## Performance

Das System ist optimiert für:

- **Schnelles Laden**: Keine externen Dependencies
- **Effizientes Scrolling**: requestAnimationFrame unter der Haube
- **Intelligentes Retry**: Nur wenn nötig
- **Reduced Motion**: Automatische Anpassung

## Browser-Kompatibilität

Unterstützt alle modernen Browser:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

## Zusammenfassung

Das Deep-Linking-System bietet:

✅ Zuverlässige Section-Navigation  
✅ Funktioniert bei Reload/Share/Bookmark  
✅ Zentrale, wartbare Konfiguration  
✅ Accessibility-ready  
✅ Performance-optimiert  
✅ Einfache API für Entwickler  

Bei Fragen oder Problemen: Siehe `/src/lib/section-map.ts` für die vollständige Konfiguration.
