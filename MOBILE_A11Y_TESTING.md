# Mobile A11y Testing Guide - S&S Messebau Website

## Schnelle QA-Checkliste (15 Minuten)

### ✅ Vor jedem Deployment

#### 1. Keyboard-Navigation (5 Min)
```
□ Tab durch gesamte Seite - logische Reihenfolge?
□ Fokus immer sichtbar (3px blauer Ring)?
□ Enter auf Logo → Startseite
□ Tab zu "Leistungen" → Enter öffnet Mega Menu
□ Im Mega Menu: Esc schließt, Fokus zurück zu Button
□ Tab zu "Projekt anfragen" → Enter öffnet Dialog
□ Im Dialog: Tab bleibt im Dialog, Esc schließt
□ Formular komplett mit Keyboard ausfüllbar
```

#### 2. Mobile Touch-Targets (3 Min)
```
□ Alle Buttons mindestens 44x44px (mit Finger testen)
□ Sticky CTA unten nicht überdeckt Content
□ Burger-Menu öffnet mit Tap
□ Swipe nach rechts schließt Menu
□ WhatsApp Button funktioniert
```

#### 3. Formular-Validierung (3 Min)
```
□ Leeres Formular absenden → Fehlermeldungen erscheinen
□ Ungültige E-Mail → "Bitte geben Sie eine gültige E-Mail-Adresse ein"
□ Fehler verschwindet beim Tippen
□ Fehler rot und direkt unter Feld
□ Success-Toast erscheint nach Submit
```

#### 4. Screenreader Quick-Test (4 Min)
```
□ VoiceOver/TalkBack aktivieren
□ "Zum Hauptinhalt springen" Link am Anfang
□ Logo wird als Link angekündigt
□ Alle Buttons haben aussagekräftige Labels
□ Formular-Labels werden vorgelesen
□ Fehlermeldungen werden als Alert angekündigt
```

---

## Detaillierte Test-Szenarien

### Szenario A: Neue User auf Mobile (iPhone)

**Gerät:** iPhone 13, iOS 16+, Safari
**Netzwerk:** 4G (simuliert)
**Dauer:** 10 Minuten

#### Schritte:
1. **Homepage laden**
   - [ ] LCP (Hero-Image) < 2.5s
   - [ ] Kein Layout-Shift beim Laden
   - [ ] Sticky CTA sichtbar aber nicht störend
   - [ ] Text lesbar ohne Zoom

2. **Navigation erkunden**
   - [ ] Burger-Menu öffnen (Tap)
   - [ ] Logo & "Menü" Text sichtbar
   - [ ] Alle Nav-Items > 44px Touch-Target
   - [ ] Swipe nach rechts schließt Menu
   - [ ] Menu schließt bei Navigation

3. **Leistungen ansehen**
   - [ ] Mobile: Leistungen-Karten tappable
   - [ ] Bilder laden lazy
   - [ ] Kein horizontaler Scroll

4. **Anfrage stellen**
   - [ ] Dialog öffnet mit "Projekt anfragen"
   - [ ] Dialog scrollbar bei langem Content
   - [ ] iOS Keyboard schiebt Dialog hoch (nicht überdeckt)
   - [ ] Email-Field zeigt @-Tastatur
   - [ ] Telefon-Field zeigt Ziffern-Tastatur
   - [ ] Validierung reagiert sofort
   - [ ] Submit funktioniert
   - [ ] Toast erscheint oben
   - [ ] Dialog schließt nach Success

5. **WhatsApp kontaktieren**
   - [ ] WhatsApp Button unten links tappable
   - [ ] Öffnet WhatsApp App
   - [ ] Vorbefüllter Text vorhanden

**Expected Time:** 3-5 Minuten für User
**Issues to track:** Layout-Shifts, Keyboard-Overlap, Fehlende Touch-Targets

---

### Szenario B: Screenreader-User (Desktop)

**Setup:** Windows 11, Chrome, NVDA aktiv
**Dauer:** 15 Minuten

#### Schritte:
1. **Page Load**
   - [ ] NVDA liest: "S&S Messebau GbR - Full-Service Messebau"
   - [ ] H drücken → Überschriften werden gefunden
   - [ ] L drücken → Liste von Landmarken (Header, Navigation, Main, Footer)

2. **Skip-Link testen**
   - [ ] Tab → erster Fokus ist "Zum Hauptinhalt springen"
   - [ ] Enter → Fokus springt zu Main-Content
   - [ ] NVDA sagt: "Hauptinhalt, Region"

3. **Navigation durchgehen**
   - [ ] Tab zu Logo → "S&S Messebau - Zur Startseite, Link"
   - [ ] Tab zu "Start" → "Start, Button, nicht gedrückt"
   - [ ] Tab zu "Leistungen" → "Leistungen, Button, hat Pop-up, eingeklappt"
   - [ ] Enter auf Leistungen → "erweitert"
   - [ ] Arrow Down im Mega Menu → Fokus auf ersten Item
   - [ ] Esc → "Leistungen, Button, eingeklappt"

4. **Formular ausfüllen**
   - [ ] Tab zu "Projekt anfragen" → Button wird angekündigt
   - [ ] Enter → Dialog öffnet
   - [ ] NVDA: "Projekt anfragen, Dialog"
   - [ ] Tab → "Name, Pflichtfeld, Bearbeiten"
   - [ ] Text eingeben → Vorgelesen
   - [ ] Tab weiter → "E-Mail, Pflichtfeld, Bearbeiten"
   - [ ] Ungültige E-Mail eingeben → Tab weiter
   - [ ] Submit → "Bitte geben Sie eine gültige E-Mail-Adresse ein, Alert"
   - [ ] Korrigieren und Submit
   - [ ] "Vielen Dank! Wir melden uns..., Alert"

5. **Sections navigieren**
   - [ ] R drücken → Springt zwischen Regions
   - [ ] Jede Section wird angekündigt
   - [ ] Bilder: Alt-Texte oder "dekoratives Bild"

**Issues zu dokumentieren:**
- Fehlende/falsche ARIA-Labels
- Überschriften-Hierarchie Lücken
- Fehlende Alt-Texte
- Fokus-Traps

---

### Szenario C: Nur-Tastatur-User

**Setup:** Beliebiger Desktop Browser
**Dauer:** 10 Minuten

#### Tastatur-Only Checklist:
```
1. Tab durch gesamte Page
   □ Fokus immer sichtbar (3px Outline + Shadow)
   □ Reihenfolge logisch: Logo → Nav → Content → CTAs → Footer
   □ Keine Fokus-Traps (außer in Modals)

2. Mega Menu
   □ Tab zu "Leistungen"
   □ Enter öffnet Menu
   □ Tab durchläuft Menu-Items
   □ Enter auf Item → Navigation
   □ Esc schließt Menu, Fokus zurück

3. Dialog
   □ Enter auf "Projekt anfragen"
   □ Dialog öffnet, Fokus geht ins Dialog
   □ Tab bleibt im Dialog (Fokus-Trap aktiv)
   □ Shift+Tab geht rückwärts im Dialog
   □ Esc schließt Dialog
   □ Fokus kehrt zu "Projekt anfragen" zurück

4. Dropdown
   □ Tab zu "Mehr" Dropdown
   □ Enter öffnet
   □ Arrow Down/Up navigiert
   □ Enter wählt Item aus
   □ Esc schließt

5. Forms
   □ Tab durch alle Felder
   □ Space bei Checkboxes togglet
   □ Enter bei letztem Feld submitted (oder Tab zu Submit-Button)

6. Keine Hover-Only Features
   □ Alle Interaktionen ohne Maus erreichbar
   □ Tooltips erscheinen bei Fokus (nicht nur Hover)
```

**Time:** 8-12 Minuten
**Document:** Jede Stelle wo Fokus unsichtbar oder Interaktion unmöglich ist

---

### Szenario D: Browser-Zoom 200%

**Setup:** Desktop Browser, Zoom auf 200%
**Dauer:** 8 Minuten

#### Checklist:
```
1. Homepage
   □ Kein horizontaler Scroll
   □ Text nicht abgeschnitten
   □ Hero vollständig sichtbar
   □ Sticky Header passt noch

2. Navigation
   □ Nav-Items nicht überlappt
   □ Mega Menu funktioniert
   □ Dropdown passt auf Screen

3. Content
   □ Cards/Grids umbrechen korrekt
   □ Bilder skalieren
   □ Text line-clamp schneidet nichts Kritisches ab

4. Forms
   □ Inputs nicht umbrochen
   □ Labels lesbar
   □ Buttons nicht verzerrt
   □ Fehlermeldungen sichtbar

5. Footer
   □ Vollständig erreichbar
   □ Links nicht überlappt
```

---

### Szenario E: Langsames Netz (3G)

**Setup:** Chrome DevTools → Network → Slow 3G
**Dauer:** 5 Minuten

#### Performance Checks:
```
1. Initial Load
   □ Loading State sichtbar
   □ Skeleton Screens (falls vorhanden)
   □ Hero-Image lädt progressiv
   □ Critical CSS inline
   □ Fonts mit swap laden

2. Navigation
   □ Keine Verzögerung bei Page-Switch (Hash-Navigation)
   □ Bilder lazy-loaden sichtbar
   □ Keine Layout-Shifts

3. Interactions
   □ Button-Klicks reagieren sofort (Optimistic UI)
   □ Formular-Submit zeigt Loading
   □ Toast erscheint nach erfolgreicher Aktion
```

---

## Automatisierte Tests

### Lighthouse CI

**Setup:**
```bash
npm install -g @lhci/cli
```

**Run:**
```bash
# Start Dev Server
npm run dev

# In anderem Terminal
lhci autorun --config=lighthouserc.json
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
        "http://localhost:5173/#/kontakt",
        "http://localhost:5173/#/referenzen"
      ],
      "settings": {
        "preset": "mobile",
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638.4,
          "cpuSlowdownMultiplier": 4
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 1.0}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Expected Results:**
- Performance: ≥90
- Accessibility: 100
- Best Practices: ≥90
- SEO: ≥90

---

### Axe DevTools

**Setup:**
```bash
# Browser Extension installieren:
# Chrome: https://chrome.google.com/webstore → "axe DevTools"
```

**Run:**
1. Öffne Website
2. F12 → "axe DevTools" Tab
3. "Scan ALL of my page"
4. Review Issues

**Expected:**
- 0 Critical Issues
- 0 Serious Issues
- <5 Moderate Issues (dokumentieren)

**Common Issues zu prüfen:**
- Images ohne Alt
- Buttons ohne Label
- Insufficient Color Contrast
- Missing Form Labels
- Improper ARIA usage

---

### Pa11y CI

**Setup:**
```bash
npm install -g pa11y-ci
```

**pa11y.json:**
```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000,
    "wait": 1000,
    "ignore": [
      "notice",
      "warning"
    ],
    "runners": [
      "axe",
      "htmlcs"
    ],
    "chromeLaunchConfig": {
      "args": [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    }
  },
  "urls": [
    "http://localhost:5173/",
    "http://localhost:5173/#/leistungen",
    "http://localhost:5173/#/branchen",
    "http://localhost:5173/#/referenzen",
    "http://localhost:5173/#/kontakt",
    "http://localhost:5173/#/banner-bestellen"
  ]
}
```

**Run:**
```bash
npm run dev
# In anderem Terminal:
pa11y-ci --config pa11y.json
```

**Expected:** 0 Errors (alle Routen)

---

## Mobile Device Testing

### iOS Testing

**Devices:**
- iPhone SE (2nd gen) - 375px width
- iPhone 13/14 - 390px width
- iPad Mini - 768px width
- iPad Pro - 1024px width

**Safari spezifische Tests:**
```
□ Safe-Area berücksichtigt (Notch/Dynamic Island)
□ 100vh Problem nicht vorhanden (min-h statt h-screen)
□ Input-Focus zoomt nicht Page (font-size ≥16px)
□ Sticky Position funktioniert
□ Touch-Events reagieren (keine 300ms Delay)
□ Swipe-Gestures funktionieren
□ Rubber-Banding nicht störend (overscroll-behavior)
```

**Testing Tools:**
- **Xcode Simulator** (macOS) - Verschiedene iOS Versionen
- **BrowserStack** - Real Device Cloud
- **Physical Devices** - Beste Option

**Simulator Setup:**
```bash
# Xcode installiert?
xcode-select --install

# Simulator starten
open -a Simulator

# In Simulator: Device → iOS 16.x → iPhone 13
# Safari öffnen → http://[YOUR_LOCAL_IP]:5173
```

### Android Testing

**Devices:**
- Samsung Galaxy S21 - 360px width
- Google Pixel 6 - 393px width
- Samsung Tab - 800px width

**Chrome spezifische Tests:**
```
□ Pull-to-Refresh nicht mit Swipe-Gesture konfliktet
□ Address Bar collapse berücksichtigt (vh units)
□ Material Design Guidelines eingehalten
□ Touch Ripple Effects (optional)
□ Back-Button funktioniert (Hash-Navigation)
```

**Testing Tools:**
- **Android Studio Emulator** - Verschiedene Android Versionen
- **Chrome DevTools Device Mode** - Quick Testing
- **BrowserStack / LambdaTest** - Real Devices
- **Physical Devices** - Empfohlen

**Emulator Setup:**
```bash
# Android Studio installiert?
# AVD Manager öffnen
# Pixel 6 API 33 erstellen
# Emulator starten
# Chrome öffnen → http://10.0.2.2:5173
```

---

## Regressions-Test-Matrix

### Nach jedem Feature-Update

| Test | Desktop | Mobile | Tablet | Keyboard | SR |
|------|---------|--------|--------|----------|-----|
| Homepage Hero | ✓ | ✓ | ✓ | n/a | ✓ |
| Navigation | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mega Menu | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mobile Menu | n/a | ✓ | ✓ | ✓ | ✓ |
| Formular | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dialog | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sticky CTA | ✓ | ✓ | n/a | ✓ | ✓ |
| WhatsApp | ✓ | ✓ | ✓ | ✓ | ✓ |
| Footer | ✓ | ✓ | ✓ | ✓ | ✓ |
| Skip Links | ✓ | ✓ | ✓ | ✓ | ✓ |

**Legende:**
- ✓ = Testen erforderlich
- n/a = Nicht zutreffend
- SR = Screenreader

---

## Fehler-Dokumentation Template

### Issue Tracking Format

**Titel:** [A11y/Mobile] Kurze Beschreibung

**Severity:**
- 🔴 Critical - Blocker für Deployment
- 🟡 High - Muss vor Launch gefixt werden
- 🟢 Medium - Nice to have
- ⚪ Low - Backlog

**Environment:**
- Browser: Safari 16.1
- Device: iPhone 13
- OS: iOS 16.2
- Screen Size: 390x844

**Steps to Reproduce:**
1. Öffne Homepage
2. Tap auf "Projekt anfragen"
3. Fülle Formular aus
4. Tap Submit

**Expected:**
- Fokus bleibt im Dialog
- Fehlermeldungen erscheinen direkt unter Feldern

**Actual:**
- Fokus springt zu Body
- Fehlermeldungen nur als Toast

**Screenshots:**
[Attach]

**WCAG Kriterium verletzt:**
- 2.4.3 Focus Order (Level A)
- 3.3.1 Error Identification (Level A)

**Priority:** 🔴 Critical

**Fix:**
- Dialog Fokus-Trap implementieren
- Inline-Fehler mit aria-describedby

---

## CI/CD Integration

### GitHub Actions Workflow

**.github/workflows/a11y-ci.yml:**
```yaml
name: Accessibility & Mobile CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Serve
        run: npx serve -s dist -p 8080 &
        
      - name: Wait for server
        run: npx wait-on http://localhost:8080
        
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=lighthouserc.json
        
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci

  a11y:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Serve
        run: npx serve -s dist -p 8080 &
        
      - name: Wait for server
        run: npx wait-on http://localhost:8080
        
      - name: Run Pa11y
        run: |
          npm install -g pa11y-ci
          pa11y-ci --config pa11y.json
        
      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: pa11y-results
          path: pa11y-results.json
```

---

## Monitoring & Maintenance

### Post-Launch Monitoring

**Wöchentlich:**
- Lighthouse CI auf Production URL
- Check Google Search Console → Core Web Vitals
- Review Sentry Errors (falls integriert)

**Monatlich:**
- Manueller Screenreader-Test (NVDA + VoiceOver)
- Mobile Device Testing (real devices)
- Review User Feedback zu Accessibility

**Quarterly:**
- Umfassender A11y-Audit mit externem Tool
- User Testing mit Menschen mit Behinderungen
- Update dieser Dokumentation

### Tools Dashboard

**Empfohlenes Monitoring-Setup:**
1. **Google Search Console** - Core Web Vitals
2. **Sentry** - Error Tracking mit A11y-Tags
3. **LogRocket** - Session Replay mit A11y-Insights
4. **Lighthouse CI Server** - Trendanalyse über Zeit

---

## Zusammenfassung & Quick-Reference

### Vor jedem Deployment: 5-Minuten-Check

```bash
# 1. Lighthouse Mobile
lhci autorun --preset=mobile

# 2. Pa11y alle Routen
pa11y-ci

# 3. Manuell: Keyboard-Navigation
# Tab durch Page, Enter auf Buttons, Esc schließt Dialogs

# 4. Manuell: Mobile-Tap
# Alle Buttons > 44px, Sticky CTA passt

# 5. Formular
# Validierung funktioniert, Fehler sichtbar
```

**Wenn alle ✅ → Deploy OK**
**Bei einem ❌ → Fix before deploy**

---

**Ende des Testing Guides**
