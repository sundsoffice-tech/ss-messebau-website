# Mobile-Qualität & Barrierefreiheit – Umfassendes Audit & Verbesserungsplan

## Executive Summary

Diese Analyse prüft die S&S Messebau Website auf weltklasse Mobile-Standards, semantische HTML-Struktur, Barrierefreiheit und Gerätekompatibilität – ohne Änderung der Farbpalette.

**Status: Gute Grundlage, Verbesserungsbedarf in Semantik, ARIA & Fokusmanagement**

---

## 1. SEMANTISCHES HTML – Strukturanalyse

### 🔴 Kritische Probleme

1. **Header-Button statt Link für Logo-Navigation**
   - Problem: `<button onClick={() => handleNavigation('/')}>` für Logo/Home-Link
   - Standard: Logo sollte `<a href="/">` sein für native Browser-Navigation
   - Impact: Rechtklick "In neuem Tab öffnen" funktioniert nicht, SEO-Signale fehlen

2. **Fehlende Hauptüberschriften-Hierarchie**
   - Problem: Keine klare H1-H6 Struktur dokumentiert
   - Standard: Jede Seite eine H1, dann H2→H3→H4 hierarchisch
   - Impact: Screenreader-Navigation schwierig

3. **Navigation nicht als `<nav>` mit Landmarken**
   - Problem: Wrapper ist `<nav>` aber nicht mit `aria-label` gekennzeichnet
   - Standard: `<nav aria-label="Hauptnavigation">` für primäre Nav
   - Impact: Screenreader können Hauptnav nicht direkt anspringen

4. **Fehlende `<main>` Landmarke**
   - Problem: App.tsx hat keine explizite `<main role="main">` Kennzeichnung
   - Standard: `<main id="main-content">` für Hauptinhalt
   - Impact: "Skip to main content" Links fehlen

5. **Hero-Bild ohne Decorator-Rolle**
   - Problem: Dekoratives Hero-Bild hat alt=""  aber keine `role="presentation"`
   - Standard: Rein dekorative Bilder sollten `role="presentation"` haben
   - Impact: Screenreader behandeln es als Bild statt zu überspringen

### 🟡 Mittlere Probleme

6. **Buttons vs. Links Inkonsistenz**
   - Problem: Navigation verwendet Buttons statt Links
   - Standard: Navigation = `<a>`, Actions = `<button>`
   - Impact: Semantik unklar, Browser-Kontext-Menü fehlt

7. **Section-Struktur unzureichend gekennzeichnet**
   - Problem: `<section>` ohne `aria-labelledby` oder `aria-label`
   - Standard: Sections sollten beschriftete Landmarken sein
   - Impact: Screenreader können nicht zwischen Sections springen

### ✅ Gut umgesetzt

- Footer als `<footer>` vorhanden (vermutlich)
- Header als `<header>` korrekt strukturiert
- Formular-Labels mit htmlFor verknüpft

---

## 2. BARRIEREFREIHEIT (A11Y)

### 🔴 Kritische Mängel

#### A) Fokus-Management

**Problem 1: Mobile Menu - Kein Fokus-Trap**
```tsx
// Header.tsx - Sheet hat keinen Fokus-Trap
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetContent side="right">
    {/* Fokus kann ins Hintergrund-Dokument tabben */}
  </SheetContent>
</Sheet>
```
**Fix erforderlich:**
- Fokus muss beim Öffnen in Sheet gefangen werden
- Tab muss innerhalb Sheet zirkulieren
- Esc muss Sheet schließen (vermutlich vorhanden via shadcn)
- Beim Schließen: Fokus zurück zu Trigger

**Problem 2: Mega Menu - Kein Keyboard-Handling**
```tsx
// Desktop Mega Menu nur mit Maus bedienbar
onMouseEnter={() => setMegaMenuOpen(true)}
onMouseLeave={() => setMegaMenuOpen(false)}
```
**Fix erforderlich:**
- Enter/Space öffnen Menu
- Esc schließt Menu
- Arrow Keys navigieren zwischen Items
- Tab verlässt Menu (nicht schließt)

**Problem 3: Keine Skip-Links**
```html
<!-- Fehlt: Skip to main content Link -->
<a href="#main-content" className="sr-only focus:not-sr-only">
  Zum Hauptinhalt springen
</a>
```

**Problem 4: Fokus-Stile nicht ausreichend sichtbar**
```css
/* index.css - nur outline-ring/50 definiert */
* {
  @apply border-border outline-ring/50;
}
```
**Fix erforderlich:**
- Fokus-Ring muss mindestens 2px sein
- Offset für bessere Sichtbarkeit
- Kontrast zu Background mindestens 3:1

#### B) ARIA-Verwendung

**Problem 1: Fehlende ARIA-Labels für Icon-Only Buttons**
```tsx
// Header - List Icon Button hat sr-only text ✅
<Button variant="ghost">
  <List className="h-6 w-6" />
  <span className="sr-only">Menü öffnen</span>
</Button>
```
**Status: Gut ✅** aber prüfen ob überall konsistent

**Problem 2: Dialog/Modal ARIA**
```tsx
// InquiryDialog - shadcn Dialog sollte ARIA haben
<Dialog> {/* Prüfen: aria-modal, aria-labelledby gesetzt? */}
```
**Prüfung erforderlich:** shadcn/ui Dialog sollte automatisch richtige ARIA setzen

**Problem 3: Live Regions fehlen**
```tsx
// Bei Form Submit - Fehlermeldungen nicht als Live Region
toast.error('Bitte füllen Sie alle Pflichtfelder aus')
```
**Fix:** Sonner sollte `aria-live="polite"` haben (prüfen)

**Problem 4: WhatsApp Link fehlt beschreibender Text**
```tsx
<Button onClick={openWhatsApp}>
  <WhatsappLogo /> WhatsApp
</Button>
```
**Status: OK** - Text ist vorhanden, aber aria-label wäre besser:
```tsx
aria-label="Per WhatsApp kontaktieren"
```

#### C) Formular-Barrierefreiheit

**Problem 1: Fehlende Fehler-Zuordnung**
```tsx
// InquiryDialog - inline Validierung ohne aria-describedby
<Input id="email" required />
{/* Fehlermeldung nicht mit Input verknüpft */}
```
**Fix erforderlich:**
```tsx
<Input 
  id="email" 
  aria-describedby={emailError ? "email-error" : undefined}
  aria-invalid={emailError ? "true" : "false"}
/>
{emailError && (
  <p id="email-error" className="text-destructive text-sm" role="alert">
    {emailError}
  </p>
)}
```

**Problem 2: Pflichtfelder nur visuell gekennzeichnet**
```tsx
<Label>Name *</Label>
```
**Fix:**
```tsx
<Label>
  Name <span aria-label="Pflichtfeld">*</span>
</Label>
// ODER
<Label>Name</Label>
<Input required aria-required="true" />
```

**Problem 3: Fehlende Fieldsets für Gruppen**
```tsx
// Kontaktdaten-Gruppe sollte Fieldset sein
<div className="space-y-4">
  <Label>E-Mail *</Label>
  <Label>Telefon</Label>
</div>
```
**Fix:**
```tsx
<fieldset>
  <legend className="sr-only">Kontaktdaten</legend>
  {/* Inputs */}
</fieldset>
```

### 🟡 Mittlere Probleme

**Problem 5: Autocomplete-Attribute vollständig?**
```tsx
// InquiryDialog - autocomplete gesetzt ✅
<Input autoComplete="name" />
<Input autoComplete="email" />
```
**Status: Gut** - aber prüfen ob alle relevanten Felder abgedeckt

**Problem 6: Input Types korrekt?**
```tsx
// Gut: type="tel", type="email", inputMode="email"
<Input type="tel" inputMode="tel" />
```
**Status: Gut ✅**

#### D) Screenreader-Texte

**Problem 1: Hero-Image ohne aussagekräftigen Alt**
```tsx
<img alt="" /> {/* Dekorativ - OK */}
```
**Status: OK** wenn wirklich dekorativ

**Problem 2: Bildkarussells ohne Beschreibung**
Prüfen: Haben Referenz-Bilder aussagekräftige Alt-Texte?

**Problem 3: Icon-Bedeutung nicht immer klar**
```tsx
<CheckCircle /> {/* Bedeutung nur visuell */}
```
**Fix:** Entweder begleitender Text ODER aria-label

---

## 3. INTERAKTIONS-FEHLER

### 🔴 Kritische Issues

**Problem 1: Sticky CTA überdeckt Content**
```tsx
// MobileStickyCTA - fixed bottom, könnte Inhalte verdecken
<div className="fixed bottom-0 ... pb-safe">
```
**Fix erforderlich:**
```tsx
// App.tsx - main braucht padding-bottom
<main className="mobile-safe-bottom pb-20 lg:pb-0">
```
**Status:** `.mobile-safe-bottom` ist definiert ✅ aber prüfen ob ausreichend

**Problem 2: Dialog-Scroll-Lock**
Prüfen: Verhindert Dialog Body-Scroll? (shadcn/ui sollte das machen)

**Problem 3: Mobile Menu Swipe-Close ohne Zugänglichkeits-Hinweis**
```tsx
// Swipe-Gesture ist implementiert ✅
// ABER: Kein visueller Hinweis für User
```
**Fix:**
- Drag-Indikator am Rand
- Tooltip "Zum Schließen nach rechts wischen"

**Problem 4: Mega Menu - Click-Outside ohne Keyboard-Alternative**
```tsx
// Nur mousedown-Event
document.addEventListener('mousedown', handleClickOutside)
```
**Fix:** Esc-Taste sollte auch schließen (vermutlich über handleKeyDown)

### 🟡 Mittlere Issues

**Problem 5: Dropdown Keyboard-Navigation**
shadcn/ui sollte Arrow-Keys unterstützen - prüfen

**Problem 6: WhatsApp Link öffnet in neuem Tab**
```tsx
window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
```
**Status: Sicher ✅** aber Warnung für User wäre gut

---

## 4. KOMPATIBILITÄT

### iOS Safari Besonderheiten

#### ✅ Bereits umgesetzt

**Safe Area Insets:**
```css
/* index.css */
.mobile-safe-bottom {
  padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
}
```
**Status: Perfekt ✅**

**100vh Problem:**
Wird vermieden durch `min-h-[500px] sm:min-h-[600px]` statt `h-screen`

#### 🟡 Zu prüfen

**Problem 1: Input Zoom auf iOS < 16**
```tsx
// Inputs mit font-size < 16px zoomen Page
<Input className="text-base" /> // ✅ text-base = 16px
```
**Status: Gut ✅**

**Problem 2: Position Sticky in Overflow Containers**
Header nutzt `sticky top-0` - testen ob funktioniert

**Problem 3: Touch-Events vs Click-Events**
```tsx
// Swipe-Gesture nutzt touchstart/touchmove ✅
sheetContent.addEventListener('touchstart', handleTouchStart)
```
**Status: Gut ✅**

### Android Chrome

#### ✅ Bereits umgesetzt

**Viewport Meta:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
**Status: Korrekt ✅**

**Touch Action:**
```tsx
// Passive Touch Listeners für Performance
{ passive: true }
{ passive: false } // nur wenn preventDefault nötig
```
**Status: Perfekt ✅**

#### 🟡 Zu prüfen

**Problem 1: Chrome Pull-to-Refresh Konflikt**
Swipe-Gesture könnte mit Pull-to-Refresh kollidieren
**Fix:**
```css
body {
  overscroll-behavior-y: contain;
}
```

**Problem 2: Autofill-Styling**
```css
input:-webkit-autofill {
  /* Background wird gelb - Theme anpassen? */
}
```

### Schriftgrößen & Zoom

#### ✅ Bereits umgesetzt

**Fluid Typography:**
```tsx
<h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}>
```
**Status: Exzellent ✅**

**Relative Units:**
```css
--radius: 0.5rem; /* rem = zoom-fähig */
```
**Status: Gut ✅**

#### 🟡 Zu prüfen

**Problem 1: Min-Heights bei großem Text**
```tsx
className="min-h-[44px]" // Fix bei 200% Zoom?
```
**Test:** Bei 200% Browser-Zoom prüfen ob Buttons nicht umbrechen

**Problem 2: Line-Clamp bei Zoom**
```tsx
className="line-clamp-1" // Schneidet Text ab
```
**Fix:** Nur für unkritische Inhalte nutzen

---

## 5. QA & TESTING-STRATEGIE

### A) Regressions-Checkliste

#### Navigation
- [ ] Desktop: Alle Nav-Links erreichbar mit Tab
- [ ] Desktop: Mega Menu öffnet mit Enter/Space
- [ ] Desktop: Mega Menu schließt mit Esc
- [ ] Desktop: Fokus bleibt im Mega Menu beim Tabben
- [ ] Mobile: Burger-Menu öffnet/schließt
- [ ] Mobile: Swipe-to-Close funktioniert
- [ ] Mobile: Alle Nav-Items haben min 44px Touch-Target
- [ ] Mobile: Menu schließt bei Navigation
- [ ] Keyboard: Tab-Reihenfolge logisch (Logo → Nav → CTA)
- [ ] Screenreader: Skip-Link zum Hauptinhalt
- [ ] Screenreader: Aktuelle Seite wird angekündigt

#### Formulare
- [ ] Alle Labels mit Inputs verknüpft
- [ ] Pflichtfelder mit aria-required
- [ ] Fehlermeldungen mit aria-describedby verknüpft
- [ ] Fehlermeldungen haben role="alert"
- [ ] Submit mit Enter möglich
- [ ] Validierung vor Submit
- [ ] Success/Error Toast erscheint
- [ ] Toast hat aria-live
- [ ] Autofill funktioniert (name, email, tel)
- [ ] Mobile Keyboard: richtige Typen (email, tel, numeric)
- [ ] iOS: Keine Zoom bei Input-Focus
- [ ] Android: Kein Layout-Shift bei Keyboard

#### Modals/Dialogs
- [ ] Dialog öffnet: Fokus geht in Dialog
- [ ] Dialog: Tab bleibt im Dialog
- [ ] Dialog: Esc schließt Dialog
- [ ] Dialog: Fokus kehrt zu Trigger zurück
- [ ] Dialog: Body-Scroll gesperrt
- [ ] Dialog: aria-modal="true" gesetzt
- [ ] Dialog: aria-labelledby auf Title
- [ ] Mobile: Dialog scrollbar bei langem Content
- [ ] Mobile: Dialog nicht höher als Viewport

#### Medien
- [ ] Hero-Image: WebP/AVIF mit Fallback
- [ ] Hero-Image: srcset mit 3+ Größen
- [ ] Hero-Image: Lädt mit fetchPriority="high"
- [ ] Hero-Image: Width/Height verhindert CLS
- [ ] Andere Bilder: lazy loading
- [ ] Bilder: Aussagekräftige Alt-Texte (oder alt="" wenn dekorativ)
- [ ] Icons mit Text: Icon ist dekorativ (aria-hidden)
- [ ] Icons ohne Text: aria-label vorhanden

#### Lange Seiten
- [ ] Scroll-Performance flüssig (keine Ruckler)
- [ ] Sticky Header bleibt sichtbar
- [ ] Sticky CTA überdeckt keinen Content
- [ ] "Back to Top" Button erscheint (wenn vorhanden)
- [ ] iOS: Safe Area berücksichtigt
- [ ] Android: Navigation Bar berücksichtigt

#### Langsames Netz
- [ ] Loading States sichtbar
- [ ] Critical CSS inline
- [ ] Fonts mit font-display: swap
- [ ] Bilder: Progressive Loading
- [ ] Keine Layout-Shifts während Ladevorgang

### B) Testfälle nach Szenarien

#### Szenario 1: Erster Besuch (Mobile)
**User Journey:** Homepage → Leistungen ansehen → Anfrage stellen

**Tests:**
1. LCP < 2.5s (Hero-Image)
2. CLS < 0.1 (keine Shifts bei Font/Image Load)
3. INP < 200ms (CTA Button-Klick)
4. Navigation funktioniert ohne Scrollruckler
5. Sticky CTA sichtbar aber nicht störend
6. Dialog öffnet flüssig
7. Formular-Validierung reagiert sofort
8. Toast-Bestätigung erscheint
9. Kein horizontaler Scroll

**Geräte:**
- iPhone 12/13 (iOS 15+)
- Samsung Galaxy S21 (Android 12+)
- iPhone SE (kleiner Screen 375px)
- iPad (Tablet 768px)

**Netzwerk:**
- Fast 3G (100 Kbps)
- 4G (10 Mbps)

#### Szenario 2: Screenreader-User (Desktop)
**User Journey:** Homepage → Leistungen erkunden → Kontakt aufnehmen

**Tests:**
1. Skip-Link funktioniert
2. Landmarken korrekt angekündigt (Header, Nav, Main, Footer)
3. Überschriften-Hierarchie logisch
4. Alle Buttons/Links haben Label
5. Formular-Fehler werden vorgelesen
6. Modal öffnen: Fokus korrekt, Escape schließt
7. Mega Menu: Navigation mit Arrow Keys

**Tools:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac)
- TalkBack (Android)

#### Szenario 3: Nur-Tastatur-User
**User Journey:** Alle Hauptseiten besuchen, Formular ausfüllen

**Tests:**
1. Kein Fokus-Trap (außer in Modals)
2. Fokus immer sichtbar (min 2px Outline)
3. Skip-Links verfügbar
4. Dropdown/Mega Menu mit Keyboard bedienbar
5. Formular komplett mit Tab+Enter ausfüllbar
6. Keine Hover-Only Funktionen

#### Szenario 4: Zoom 200% (Desktop & Mobile)
**User Journey:** Alle Seiten durchscrollen, Text lesbar

**Tests:**
1. Kein horizontaler Scroll
2. Text nicht abgeschnitten
3. Buttons nicht umbrochen/überlappt
4. Navigation funktioniert
5. Sticky Elements passen noch
6. Mobile Menu funktioniert

#### Szenario 5: Rotation (Mobile)
**User Journey:** Portrait → Landscape wechseln während Navigation

**Tests:**
1. Layout passt sich an
2. Keine kaputten Sticky Elements
3. Mega Menu schließt bei Rotation
4. Dialog bleibt funktionsfähig
5. Hero-Image skaliert korrekt

### C) Automatisierte Tests

#### Lighthouse CI (Mobile)
```json
{
  "performance": 90,
  "accessibility": 100,
  "best-practices": 100,
  "seo": 100
}
```

**Kritische Metriken:**
- LCP < 2.5s
- FID/INP < 200ms
- CLS < 0.1
- TTI < 5s

#### Axe DevTools
**Zu prüfen:**
- Kontrast-Verhältnisse (mind. 4.5:1 für Text)
- ARIA-Fehler
- Formular-Labels
- Alt-Texte
- Überschriften-Struktur
- Landmarken

#### Pa11y CI
Automatisierte A11y-Tests für alle Routen:
```bash
pa11y-ci --sitemap https://sundsmessebau.de/sitemap.xml
```

---

## 6. KONKRETE FIXES – Implementierungsplan

### Priority 1 (Kritisch)

#### Fix 1: Semantisches HTML - Navigation als Links

**Datei:** `src/App.tsx`

**Problem:** Buttons für Navigation
**Lösung:** Custom Router-Link-Component

```tsx
// src/components/RouterLink.tsx (neu erstellen)
interface RouterLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function RouterLink({ to, children, className, onClick }: RouterLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.hash = to
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onClick?.()
  }

  return (
    <a 
      href={`#${to}`}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
}
```

**Änderung in Header.tsx:**
```tsx
// Alt:
<Button onClick={() => handleNavigation('/')}>Start</Button>

// Neu:
<RouterLink to="/" className={buttonVariants({ variant: "ghost" })}>
  Start
</RouterLink>
```

#### Fix 2: Skip-Link hinzufügen

**Datei:** `src/App.tsx`

```tsx
// Nach <Header>, vor <main>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
>
  Zum Hauptinhalt springen
</a>

<main id="main-content" tabIndex={-1} className="flex-1 mobile-safe-bottom">
```

#### Fix 3: Fokus-Stile verstärken

**Datei:** `src/index.css`

```css
/* Ersetzen */
* {
  @apply border-border
}

/* Durch */
* {
  @apply border-border;
}

*:focus-visible {
  outline: 3px solid oklch(0.45 0.15 250);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* Spezifisch für Buttons/Links */
button:focus-visible,
a:focus-visible {
  outline: 3px solid oklch(0.45 0.15 250);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px oklch(0.45 0.15 250 / 0.2);
}
```

#### Fix 4: Formular-Fehler richtig verknüpfen

**Datei:** `src/components/InquiryDialog.tsx`

```tsx
// Zustand für Fehler hinzufügen
const [errors, setErrors] = useState<Record<string, string>>({})

// Validierung
const validateForm = () => {
  const newErrors: Record<string, string> = {}
  
  if (!formData.name.trim()) {
    newErrors.name = 'Bitte geben Sie Ihren Namen ein'
  }
  
  if (!formData.email.trim()) {
    newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
  }
  
  if (!formData.message.trim()) {
    newErrors.message = 'Bitte beschreiben Sie Ihr Projekt'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Im Input
<div className="space-y-2">
  <Label htmlFor="email">
    E-Mail <span className="text-destructive" aria-label="Pflichtfeld">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    autoComplete="email"
    inputMode="email"
    value={formData.email}
    onChange={(e) => {
      setFormData({ ...formData, email: e.target.value })
      if (errors.email) {
        setErrors({ ...errors, email: '' })
      }
    }}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
    className="min-h-[44px] text-base"
    required
  />
  {errors.email && (
    <p 
      id="email-error" 
      className="text-sm text-destructive" 
      role="alert"
    >
      {errors.email}
    </p>
  )}
</div>
```

#### Fix 5: Mega Menu Keyboard-Handling

**Datei:** `src/components/Header.tsx`

```tsx
// Keyboard Handler hinzufügen
const handleMegaMenuKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    setMegaMenuOpen(false)
    megaMenuTriggerRef.current?.focus()
  }
  
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (megaMenuOpen) {
      handleNavigation('/leistungen')
    } else {
      setMegaMenuOpen(true)
    }
  }
}

// Am Button
<Button
  ref={megaMenuTriggerRef}
  onClick={handleLeistungenClick}
  onKeyDown={handleMegaMenuKeyDown}
  onMouseEnter={() => setMegaMenuOpen(true)}
  aria-expanded={megaMenuOpen}
  aria-haspopup="true"
>
  Leistungen
  <CaretDown />
</Button>

// Am Mega Menu
{megaMenuOpen && (
  <div
    ref={megaMenuRef}
    role="menu"
    onMouseLeave={() => setMegaMenuOpen(false)}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false)
        megaMenuTriggerRef.current?.focus()
      }
    }}
  >
```

#### Fix 6: Mobile Sheet Fokus-Trap

**Datei:** `src/components/Header.tsx`

```tsx
// Nach shadcn/ui Dokumentation sollte Sheet bereits Fokus-Trap haben
// Prüfen und ggf. react-focus-lock hinzufügen

import FocusLock from 'react-focus-lock'

<SheetContent>
  <FocusLock returnFocus>
    {/* Content */}
  </FocusLock>
</SheetContent>
```

**ODER:** shadcn/ui nutzt Radix UI, das bereits Fokus-Management hat.
**Action:** Testen ob Fokus korrekt funktioniert.

#### Fix 7: ARIA-Labels für Icon-Buttons

**Datei:** Alle Komponenten mit Icon-Only Buttons prüfen

```tsx
// WhatsApp Button
<Button
  onClick={openWhatsApp}
  aria-label="Per WhatsApp kontaktieren unter +49 1514 0368754"
>
  <WhatsappLogo />
  WhatsApp
</Button>
```

### Priority 2 (Wichtig)

#### Fix 8: Hero-Image Accessibility

**Datei:** `src/components/pages/HomePage.tsx`

```tsx
<img
  src="..."
  alt=""
  role="presentation"
  aria-hidden="true"
  // ... rest
/>
```

#### Fix 9: Section Landmarken

**Datei:** Alle Page-Komponenten

```tsx
// Alt:
<section className="py-12">

// Neu:
<section 
  aria-labelledby="leistungen-heading"
  className="py-12"
>
  <h2 id="leistungen-heading">Unsere Leistungen</h2>
```

#### Fix 10: Overscroll-Behavior für Android

**Datei:** `src/index.css`

```css
body {
  overscroll-behavior-y: contain;
  /* Verhindert Pull-to-Refresh Konflikt mit Swipe-Gesture */
}
```

#### Fix 11: Fieldsets für Formulargruppen

**Datei:** `src/components/InquiryDialog.tsx`

```tsx
<fieldset className="space-y-4">
  <legend className="text-base font-semibold mb-2">
    Persönliche Daten
  </legend>
  <div className="space-y-2">
    <Label htmlFor="name">Name *</Label>
    <Input id="name" />
  </div>
  {/* ... */}
</fieldset>

<fieldset className="space-y-4">
  <legend className="text-base font-semibold mb-2">
    Kontaktdaten
  </legend>
  {/* ... */}
</fieldset>

<fieldset className="space-y-4">
  <legend className="text-base font-semibold mb-2">
    Projektdetails
  </legend>
  {/* ... */}
</fieldset>
```

### Priority 3 (Nice-to-have)

#### Fix 12: Swipe-Indikator

**Datei:** `src/components/Header.tsx`

```tsx
// Im SheetContent am Anfang
<SheetContent side="right">
  <div 
    className="absolute top-1/2 -translate-y-1/2 right-full mr-2 text-muted-foreground"
    aria-hidden="true"
  >
    <div className="flex items-center gap-1">
      <div className="w-1 h-8 bg-current rounded-full opacity-30" />
      <div className="w-1 h-12 bg-current rounded-full opacity-60" />
      <div className="w-1 h-8 bg-current rounded-full opacity-30" />
    </div>
  </div>
  {/* Rest */}
</SheetContent>
```

#### Fix 13: Link-Warnungen für externe Links

**Datei:** `src/components/StickyCTA.tsx`

```tsx
<Button
  onClick={openWhatsApp}
  aria-label="Per WhatsApp kontaktieren (öffnet externe App)"
>
```

---

## 7. TESTSTRATEGIE - Detailliert

### Phase 1: Automatisierte Tests (1-2 Tage)

#### Setup
```bash
# Lighthouse CI
npm install -g @lhci/cli

# Pa11y
npm install -g pa11y-ci

# Axe
npm install --save-dev @axe-core/cli
```

#### Lighthouse Test
```bash
# Mobile
lhci autorun --config=lighthouserc.json --collect.settings.preset=mobile

# Desktop
lhci autorun --config=lighthouserc.json --collect.settings.preset=desktop
```

**lighthouserc.json:**
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:5173/",
        "http://localhost:5173/#/leistungen",
        "http://localhost:5173/#/kontakt"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 1.0}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

#### Pa11y Test
```json
{
  "urls": [
    "http://localhost:5173/",
    "http://localhost:5173/#/leistungen",
    "http://localhost:5173/#/kontakt"
  ],
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000,
    "wait": 1000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  }
}
```

```bash
pa11y-ci --config pa11y-ci.json
```

#### Axe Test
```bash
axe http://localhost:5173 --save axe-results.json
```

### Phase 2: Manuelle Tests (3-4 Tage)

#### Tag 1: Keyboard & Screenreader (Desktop)
- [ ] NVDA mit Chrome testen
- [ ] Alle Seiten durchgehen
- [ ] Navigation dokumentieren
- [ ] Formular ausfüllen
- [ ] Fehler protokollieren

#### Tag 2: Mobile Geräte (iOS)
- [ ] iPhone SE (kleiner Screen)
- [ ] iPhone 13 (standard)
- [ ] iPad (Tablet)
- [ ] Alle Touch-Targets testen
- [ ] Swipe-Gestures testen
- [ ] Rotation testen

#### Tag 3: Mobile Geräte (Android)
- [ ] Samsung Galaxy S21
- [ ] Pixel 6
- [ ] Tablet (Samsung Tab)
- [ ] Chrome Dev Tools Mobile Emulation

#### Tag 4: Zoom & Extreme Cases
- [ ] Browser-Zoom 200%
- [ ] Font-Size Large (iOS)
- [ ] Langsames Netz (Throttle 3G)
- [ ] Offline-Verhalten

### Phase 3: User Testing (Optional, 1-2 Tage)

#### Testpersonen
- 2 Screenreader-User
- 2 Nur-Keyboard-User
- 2 Mobile-Only-User (älter, unerfahren)

#### Szenarien
1. "Finden Sie Informationen über Messebau"
2. "Stellen Sie eine Anfrage"
3. "Finden Sie die Telefonnummer"

#### Metriken
- Zeit bis Ziel
- Anzahl Fehler
- Frustrations-Level
- Erfolgsrate

---

## 8. VORHER/NACHHER - ERWARTETE VERBESSERUNGEN

### Accessibility Score

| Metrik | Vorher (geschätzt) | Nachher (Ziel) |
|--------|-------------------|----------------|
| Lighthouse A11y | 85-90 | 100 |
| Axe Violations | 10-15 | 0 |
| Pa11y Errors | 8-12 | 0 |
| WCAG 2.1 AA | ~90% | 100% |

### Mobile Performance

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| LCP | ~3.5s | <2.5s | -28% |
| INP | 250ms | <200ms | -20% |
| CLS | 0.15 | <0.1 | -33% |
| Lighthouse Perf | 85 | >90 | +6% |

### User Experience

| Aspekt | Vorher | Nachher |
|--------|--------|---------|
| Keyboard-Navigation | Teilweise | Vollständig |
| Screenreader | Funktioniert mit Problemen | Perfekt |
| Mobile Touch-Targets | Meist OK | Immer ≥44px |
| Fokus-Sichtbarkeit | Schwach | Stark (3px + Shadow) |
| Formular-Fehler | Nur visuell | Semantisch verknüpft |
| Semantische Struktur | Basic | Landmarken + ARIA |

---

## 9. MAINTENANCE - Langfristige Qualitätssicherung

### CI/CD Integration

**GitHub Actions Workflow:**
```yaml
name: A11y & Performance CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli@0.12.x autorun
  
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx pa11y-ci
```

### Checkliste für neue Features

Vor jedem Deployment:
- [ ] Lighthouse Score ≥90 alle Kategorien
- [ ] Axe DevTools: 0 Violations
- [ ] Keyboard-Navigation getestet
- [ ] Screenreader getestet (mindestens VoiceOver/NVDA)
- [ ] Mobile Testing (iOS + Android)
- [ ] Zoom 200% getestet

### Monitoring

**Tools einrichten:**
- Google Search Console (Core Web Vitals)
- Sentry (Error Tracking)
- LogRocket (Session Replay mit A11y-Insights)

---

## 10. ZUSAMMENFASSUNG & NÄCHSTE SCHRITTE

### Aktuelle Stärken ✅
- Gute Performance-Grundlage (Bilder optimiert, Lazy Loading)
- Touch-Targets meist korrekt (44px)
- Formular-Labels vorhanden
- Safe-Area-Insets berücksichtigt
- Fluid Typography
- Swipe-Gestures implementiert

### Kritische Lücken 🔴
1. Semantik: Buttons statt Links für Navigation
2. A11y: Fehlende Skip-Links
3. A11y: Fokus-Stile zu schwach
4. A11y: Formular-Fehler nicht semantisch verknüpft
5. A11y: Mega Menu nur Maus-bedienbar
6. Keyboard: Teilweise fehlende Keyboard-Handler

### Quick Wins (< 2h)
1. Skip-Link hinzufügen
2. Fokus-Stile verstärken (CSS)
3. ARIA-Labels ergänzen
4. Hero-Image role="presentation"
5. Overscroll-behavior setzen

### Medium Effort (4-8h)
1. Navigation auf Links umstellen
2. Formular-Validierung mit ARIA
3. Mega Menu Keyboard-Handling
4. Section Landmarken
5. Fieldsets für Formular-Gruppen

### Große Verbesserungen (2-3 Tage)
1. Umfassende Tests (automatisiert + manuell)
2. Alle Pages durchgehen
3. Dokumentation
4. CI/CD Setup

### Empfohlene Reihenfolge

**Woche 1:**
- Tag 1-2: Quick Wins + Priority 1 Fixes
- Tag 3: Automatisierte Tests Setup
- Tag 4-5: Priority 2 Fixes + Testing

**Woche 2:**
- Tag 1-3: Manuelle Tests (Desktop + Mobile)
- Tag 4: Fixes aus Testing
- Tag 5: Finale Verifikation + Deployment

**Nach Launch:**
- Monitoring Setup
- Wöchentliche Lighthouse Checks
- Monatliche Screenreader-Tests

---

## Anhang: Tools & Ressourcen

### Browser Extensions
- **axe DevTools** (Chrome/Firefox) - A11y Testing
- **WAVE** (Chrome/Firefox) - Visual A11y Feedback
- **Lighthouse** (Chrome DevTools)
- **Web Developer Toolbar** - Struktur-Analyse

### Screenreader
- **NVDA** (Windows, kostenlos)
- **JAWS** (Windows, kommerziell)
- **VoiceOver** (macOS/iOS, integriert)
- **TalkBack** (Android, integriert)

### Testing Tools
- **Pa11y CI** - Automatisierte A11y-Tests
- **Lighthouse CI** - Performance & A11y CI
- **Cypress + axe-core** - E2E mit A11y
- **Playwright** - Cross-Browser E2E

### Mobile Testing
- **BrowserStack** - Real Device Cloud
- **LambdaTest** - Cross-Browser Testing
- **Chrome DevTools Device Mode** - Emulation
- **Xcode Simulator** - iOS Testing (Mac)
- **Android Studio Emulator** - Android Testing

### Learning Resources
- **WCAG 2.1 Guidelines** - https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility** - https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **A11y Project** - https://www.a11yproject.com/
- **WebAIM** - https://webaim.org/

---

**Ende des Audits**

Dieses Dokument dient als Fahrplan zur weltklasse Mobile-Qualität und Barrierefreiheit.
