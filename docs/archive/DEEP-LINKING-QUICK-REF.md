# Deep-Linking Quick Reference

## Schnellstart

### Link zu einer Section erstellen

```tsx
import { SectionLink } from '@/components/SectionLink'

<SectionLink page="/leistungen" section="messebau">
  Zum Messebau
</SectionLink>
```

### Programmatisch navigieren

```tsx
import { useDeepLinking } from '@/hooks/use-deep-linking'

const { navigateToSectionOnPage } = useDeepLinking('/current-page')

<button onClick={() => navigateToSectionOnPage('/leistungen', 'messebau')}>
  Zum Messebau
</button>
```

### Section auf Seite definieren

```tsx
<section id="messebau" className="py-16 scroll-mt-20">
  <h2>Messebau</h2>
  {/* Content */}
</section>
```

## Verfügbare Sections pro Seite

### Homepage (/)
- `hero` - Hero-Bereich
- `services` - Leistungsübersicht
- `advantages` - Unsere Vorteile
- `references` - Referenzen
- `testimonials` - Kundenstimmen
- `cta` - Kontakt

### Leistungen (/leistungen)
- `messebau` - Messebau
- `eventbau` - Eventbau & Bühnen
- `ladenbau` - Ladenbau & Showrooms
- `boeden-ausstattung` - Böden & Ausstattung

### Branchen (/branchen)
- `food` - Food & Feinkost
- `versicherungen` - Versicherungen & Dienstleistungen
- `industrie` - Industrie & Technik

### Referenzen (/referenzen)
- `filter` - Projektfilter
- `projekte` - Projekte

### Über uns (/ueber-uns)
- `story` - Unsere Geschichte
- `team` - Unser Team
- `werte` - Unsere Werte
- `arbeitsweise` - Unsere Arbeitsweise
- `vergleich` - Warum S&S

### Ablauf (/ablauf)
- `timeline` - Projekt-Ablauf
- `faq` - Häufige Fragen

### Nachhaltigkeit (/nachhaltigkeit)
- `systeme` - Nachhaltige Systeme
- `partnernetzwerk` - Partnernetzwerk
- `vorteile` - Vorteile

### Blog (/blog)
- `artikel` - Blog-Artikel

### Kontakt (/kontakt)
- `kontaktformular` - Kontaktformular
- `anfahrt` - Anfahrt
- `ki-berater` - KI-Berater

### Bannerrahmen (/bannerrahmen)
- `overview` - Übersicht Bannerrahmen
- `arten` - Rahmenarten
- `systeme` - Systemlösungen
- `konfiguration` - Konfiguration

### Banner bestellen (/banner-bestellen)
- `konfigurator` - Konfigurator
- `ablauf` - Bestellablauf

## Neue Section hinzufügen

1. **Section Map aktualisieren** (`/src/lib/section-map.ts`):
   ```typescript
   '/meine-seite': [
     { id: 'neue-section', label: 'Neue Section', page: '/meine-seite' }
   ]
   ```

2. **ID auf der Seite setzen**:
   ```tsx
   <section id="neue-section" className="py-16 scroll-mt-20">
     {/* Content */}
   </section>
   ```

3. **Section Observer aktivieren** (optional):
   ```tsx
   useSectionObserver(['neue-section'])
   ```

## URL-Format

```
#/seite#section
```

Beispiele:
- `#/leistungen#messebau`
- `#/branchen#food`
- `#/kontakt#kontaktformular`

## API-Referenz

### Komponenten

#### SectionLink
```tsx
<SectionLink 
  page="/leistungen"           // Zielseite
  section="messebau"            // Section-ID
  className="..."               // Optional: CSS-Klassen
  onClick={() => {}}            // Optional: Callback
  aria-label="..."              // Optional: Accessibility-Label
>
  Link-Text
</SectionLink>
```

#### RouterLink
```tsx
<RouterLink 
  to="/leistungen"              // Zielseite
  section="messebau"            // Optional: Section-ID
  className="..."               // Optional: CSS-Klassen
  onClick={() => {}}            // Optional: Callback
  aria-label="..."              // Optional: Accessibility-Label
  aria-current="page"           // Optional: Aktueller Status
>
  Link-Text
</RouterLink>
```

### Hooks

#### useDeepLinking
```tsx
const { 
  navigateToSectionOnPage,      // Navigation zu beliebiger Section
  scrollToSection               // Scroll zu Section auf aktueller Seite
} = useDeepLinking('/current-page')

// Zu Section auf anderer Seite navigieren
navigateToSectionOnPage('/leistungen', 'messebau')

// Zu Section auf aktueller Seite scrollen
scrollToSection('messebau')
```

#### useSectionObserver
```tsx
// Automatische URL-Updates beim Scrollen
useSectionObserver(['section1', 'section2', 'section3'])
```

### Funktionen

#### navigateToPageAndSection
```tsx
import { navigateToPageAndSection } from '@/lib/deep-linking'

navigateToPageAndSection('/leistungen', 'messebau', {
  maxRetries: 15,      // Optional: Max. Versuche
  retryDelay: 100,     // Optional: Verzögerung zwischen Versuchen (ms)
  headerOffset: 100    // Optional: Scroll-Offset für Header (px)
})
```

#### validateSectionExists
```tsx
import { validateSectionExists } from '@/lib/section-map'

if (validateSectionExists('/leistungen', 'messebau')) {
  // Section existiert
}
```

#### getSectionsByPage
```tsx
import { getSectionsByPage } from '@/lib/section-map'

const sections = getSectionsByPage('/leistungen')
// Returns: [{ id: 'messebau', label: 'Messebau', page: '/leistungen' }, ...]
```

## Tipps & Best Practices

### ✅ Do

- Verwende kebab-case für Section-IDs
- Setze `scroll-mt-*` für korrekten Scroll-Offset
- Füge `tabindex="-1"` für Fokus-Management hinzu
- Teste Links mit Browser Reload
- Validiere neue Sections in der Section Map

### ❌ Don't

- Verwende keine Sonderzeichen außer Bindestrichen
- Keine generischen IDs wie `section1`, `content`
- Keine direkten Hash-Links ohne System
- Section-IDs nicht ändern ohne Redirect-Logik

## Debugging

### Console-Validierung
Im Dev-Modus werden automatisch Validierungen ausgegeben:
```
🔍 Deep-Linking Validation
✅ Section Map is valid
⚠️ Section Map warnings:
  - Section "xyz" has no scroll-margin-top...
```

### Manuelle Validierung
```tsx
import { logValidationResults } from '@/lib/validate-sections'

// Im Browser-Console
logValidationResults()
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Section nicht gefunden | Prüfe Section-ID in Section Map und HTML |
| Scroll-Position ungenau | Passe `headerOffset` Parameter an |
| URL aktualisiert nicht | Nutze `updateUrlWithSection()` |
| Funktioniert nicht bei Reload | Prüfe `useDeepLinking` Hook in Page-Komponente |

## Weitere Informationen

Siehe [DEEP-LINKING.md](./DEEP-LINKING.md) für vollständige Dokumentation.
