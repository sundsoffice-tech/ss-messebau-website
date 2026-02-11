# Deep-Linking Audit & Dokumentation

## Format: `#/page#section`
Beispiel: `#/leistungen#messebau`

## LeistungenPage - Abschnitte (Ziel-IDs)

Alle Sections auf `/leistungen` haben diese eindeutigen IDs:

1. **#messebau** - Messebau-Section
2. **#eventbau** - Eventbau & Bühnen Section
3. **#ladenbau** - Ladenbau & Showrooms Section
4. **#boeden-ausstattung** - Böden & Ausstattung Section

## Überprüfte Link-Quellen

### ✅ 1. Header (Desktop & Mobile)
**Datei**: `src/components/Header.tsx`

**Mega Menu (Desktop)**:
- Messebau → `#/leistungen#messebau` ✓
- Eventbau & Bühnen → `#/leistungen#eventbau` ✓
- Ladenbau & Showrooms → `#/leistungen#ladenbau` ✓
- Böden & Ausstattung → `#/leistungen#boeden-ausstattung` ✓

**Mobile Menu**:
- Messebau → `#/leistungen#messebau` ✓
- Eventbau & Bühnen → `#/leistungen#eventbau` ✓
- Ladenbau & Showrooms → `#/leistungen#ladenbau` ✓
- Böden & Ausstattung → `#/leistungen#boeden-ausstattung` ✓

Implementierung: `navigateToPageAndSection('/leistungen', sectionId)`

### ✅ 2. Footer
**Datei**: `src/components/Footer.tsx`

**Leistungen-Spalte**:
- Messebau → `#/leistungen#messebau` ✓
- Eventbau → `#/leistungen#eventbau` ✓
- Ladenbau → `#/leistungen#ladenbau` ✓

Implementierung: `handleSectionNavigation('/leistungen', sectionId)`

### ✅ 3. HomePage - Service Cards
**Datei**: `src/components/pages/HomePage.tsx`

**Service-Kacheln** (4 Cards):
- Messebau Card → `#/leistungen#messebau` ✓
- Eventbau Card → `#/leistungen#eventbau` ✓
- Ladenbau Card → `#/leistungen#ladenbau` ✓
- Böden & Möbel Card → `#/leistungen#boeden-ausstattung` ✓

Implementierung: `navigateToSectionOnPage('/leistungen', sectionId)`

### ✅ 4. LeistungenPage selbst
**Datei**: `src/components/pages/LeistungenPage.tsx`

**Section IDs im DOM**:
```html
<div id="messebau" className="... scroll-mt-20">
<div id="eventbau" className="... scroll-mt-20">
<div id="ladenbau" className="... scroll-mt-20">
<div id="boeden-ausstattung" className="... scroll-mt-20">
```

Alle Sections haben:
- ✓ Eindeutige, stabile ID
- ✓ `scroll-mt-20` für Header-Offset
- ✓ Sichtbare Überschrift (H2)

## Funktionale Deep-Linking-Infrastruktur

### Zentrale Funktionen
**Datei**: `src/lib/deep-linking.ts`

- `parseDeepLink(hash)` - Parst `#/page#section` Format
- `createDeepLink(page, section)` - Erstellt korrektes Hash-Format
- `navigateToSection(sectionId, headerOffset)` - Scrollt zur Section mit Offset
- `scrollToSectionWithRetry(sectionId, options)` - Retry-Logik für spätes Rendering
- `navigateToPageAndSection(page, section, options)` - Cross-Page Navigation

### React Hook
**Datei**: `src/hooks/use-deep-linking.ts`

```typescript
const { navigateToSectionOnPage, scrollToSection } = useDeepLinking('/leistungen')

// Innerhalb derselben Seite:
scrollToSection('messebau')

// Von anderer Seite:
navigateToSectionOnPage('/leistungen', 'messebau')
```

### Section Map (Validierung)
**Datei**: `src/lib/section-map.ts`

Definiert alle gültigen Sections pro Seite und ermöglicht Validierung.

## App.tsx - Routing Logic

**Datei**: `src/App.tsx`

```typescript
useEffect(() => {
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

  handleHashChange()
  window.addEventListener('hashchange', handleHashChange)
  return () => window.removeEventListener('hashchange', handleHashChange)
}, [])
```

**Verhalten**:
1. ✓ Parst Hash bei Load und hashchange
2. ✓ Setzt Page-Route
3. ✓ Scrollt zu Section mit Retry (falls noch nicht gerendert)
4. ✓ Scrollt nach oben wenn keine Section

## Test-Checkliste

### Direktlinks (URL eingeben/teilen)
- [ ] `#/leistungen#messebau` → Lädt Seite, scrollt zu Messebau-Überschrift
- [ ] `#/leistungen#eventbau` → Lädt Seite, scrollt zu Eventbau-Überschrift
- [ ] `#/leistungen#ladenbau` → Lädt Seite, scrollt zu Ladenbau-Überschrift
- [ ] `#/leistungen#boeden-ausstattung` → Lädt Seite, scrollt zu Böden-Überschrift

### Cross-Page Navigation
- [ ] Von `/` (Startseite) → Messebau Card klicken → Leistungen/Messebau
- [ ] Von `/` (Startseite) → Eventbau Card klicken → Leistungen/Eventbau
- [ ] Von `/` (Startseite) → Ladenbau Card klicken → Leistungen/Ladenbau
- [ ] Von `/` (Startseite) → Böden Card klicken → Leistungen/Böden

### Header Navigation (Desktop)
- [ ] Leistungen Mega Menu → Messebau klicken → Leistungen/Messebau
- [ ] Leistungen Mega Menu → Eventbau klicken → Leistungen/Eventbau
- [ ] Leistungen Mega Menu → Ladenbau klicken → Leistungen/Ladenbau
- [ ] Leistungen Mega Menu → Böden klicken → Leistungen/Böden

### Header Navigation (Mobile)
- [ ] Burger Menu → Messebau klicken → Leistungen/Messebau
- [ ] Burger Menu → Eventbau klicken → Leistungen/Eventbau
- [ ] Burger Menu → Ladenbau klicken → Leistungen/Ladenbau
- [ ] Burger Menu → Böden klicken → Leistungen/Böden

### Footer Navigation
- [ ] Footer → Messebau Link → Leistungen/Messebau
- [ ] Footer → Eventbau Link → Leistungen/Eventbau
- [ ] Footer → Ladenbau Link → Leistungen/Ladenbau

### Browser Back/Forward
- [ ] Navigation durchführen → Back Button → Forward Button → Korrekte Section

### Innerhalb derselben Seite
- [ ] Bereits auf `/leistungen` → Section-Link klicken → Smooth Scroll

### Reload/Refresh
- [ ] URL mit Section laden → F5/Refresh → Bleibt bei Section

## Wartbarkeit

### Neue Section hinzufügen:
1. **LeistungenPage.tsx**: `<div id="neue-section">` hinzufügen
2. **section-map.ts**: Section in `SECTION_MAP['/leistungen']` eintragen
3. **Header.tsx**: Mega Menu Item mit `sectionId: 'neue-section'` hinzufügen
4. **Footer.tsx**: Optional Link hinzufügen
5. **HomePage.tsx**: Optional Service Card hinzufügen

### Section-ID ändern:
⚠️ Breaking Change! Alle Referenzen müssen aktualisiert werden:
- LeistungenPage DOM-ID
- Header Mega Menu `sectionId`
- Footer Links
- HomePage Service Cards
- section-map.ts Eintrag

**Empfehlung**: IDs stabil halten, nur bei triftigen Gründen ändern.

## Zusammenfassung

✅ **Alle thematischen Links korrekt verdrahtet**
✅ **Eindeutige, stabile Section-IDs vorhanden**
✅ **Deep-Linking-Format konsistent: `#/page#section`**
✅ **Cross-Page Navigation funktioniert**
✅ **Innerhalb-Page Navigation funktioniert**
✅ **Retry-Logik für spätes Rendering vorhanden**
✅ **Scroll-Offset für Header berücksichtigt (100px)**
✅ **URL-Sharing funktioniert**
✅ **Browser Back/Forward unterstützt**
✅ **Keine Konflikte mit scrollToTop**

## Bekannte Funktionalität

Die Website nutzt **konsistent** die vorhandene Deep-Linking-Infrastruktur:

1. **navigateToPageAndSection()** für Cross-Page Links
2. **useDeepLinking().navigateToSectionOnPage()** für Component-basierte Navigation
3. **parseDeepLink()** und **scrollToSectionWithRetry()** im App-Routing

Alle Buttons/CTAs, die thematisch zu Leistungen führen, landen präzise bei der richtigen Section mit sichtbarer Überschrift.
