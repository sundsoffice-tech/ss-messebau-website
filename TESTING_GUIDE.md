# 🧪 Schritt-für-Schritt: Mobile Performance Testing

## Schnellstart (5 Minuten)

### Option 1: Browser DevTools (Einfachste Methode)

1. **Öffne die Website** in Chrome
   ```
   http://localhost:5173
   ```

2. **Öffne DevTools**
   - Windows/Linux: `F12` oder `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

3. **Starte Lighthouse Test**
   - Wechsle zum Tab "Lighthouse"
   - Wähle "Mobile" als Device
   - Aktiviere nur "Performance" (schneller)
   - Klicke "Analyze page load"

4. **Ergebnisse prüfen**
   ```
   ✅ Performance Score > 85
   ✅ LCP < 2.5s
   ✅ CLS < 0.1
   ✅ INP < 200ms
   ```

**Fertig! 🎉**

---

## Option 2: Live Web Vitals (Interaktiv)

1. **Öffne das Testing Tool**
   ```
   Öffne: file:///workspaces/spark-template/performance-test.html
   im Browser
   ```

2. **Warte auf Messungen** (automatisch)
   - LCP wird gemessen während du scrollst
   - CLS wird während der gesamten Sitzung getrackt
   - INP misst Interaktionen (Klicks, Inputs)

3. **Verifiziere Werte**
   - Alle Metriken sollten GRÜN sein
   - LCP < 2.5s
   - CLS < 0.1
   - INP < 200ms

---

## Option 3: Network Throttling Test (Realistisch)

### Slow 4G Test (Empfohlen)

1. **Öffne DevTools** → Network Tab

2. **Stelle Throttling ein**
   - Dropdown: "Slow 4G"
   - Download: 4 Mbps
   - Upload: 3 Mbps
   - Latency: 40ms

3. **Hard Reload**
   - Windows/Linux: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

4. **Beobachte Loading**
   - LoadingScreen: sollte < 500ms erscheinen
   - Hero-Image: sollte progressiv laden
   - Service-Cards: sollten lazy-loaden

5. **Lighthouse Test mit Throttling**
   - Lighthouse → Settings
   - "Simulated throttling" aktiviert
   - Test starten

**Erwartung: LCP < 2.5s auch auf Slow 4G!** ✅

### Slow 3G Test (Worst Case)

1. **Network**: "Slow 3G"
   - Download: 400 Kbps
   - Upload: 400 Kbps
   - Latency: 400ms

2. **Hard Reload**

3. **Ergebnisse**
   - LCP: 3-4s (akzeptabel für Worst Case)
   - Page sollte trotzdem nutzbar sein
   - Content sollte progressiv erscheinen

---

## Option 4: Command-Line Testing (Automatisiert)

### Installation

```bash
# Lighthouse installieren
npm install -g lighthouse

# Oder mit npx (ohne Installation)
npx lighthouse --help
```

### Mobile Test durchführen

```bash
# Starte Dev Server (falls nicht läuft)
npm run dev

# In anderem Terminal: Lighthouse Mobile
lighthouse http://localhost:5173 \
  --preset=perf \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --throttling-method=simulate \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=html \
  --output-path=./reports/lighthouse-mobile.html

# Report öffnen
open ./reports/lighthouse-mobile.html
```

### Desktop Test (Vergleich)

```bash
lighthouse http://localhost:5173 \
  --preset=perf \
  --form-factor=desktop \
  --output=html \
  --output-path=./reports/lighthouse-desktop.html
```

### Alle Seiten testen

```bash
# Homepage
lighthouse http://localhost:5173/ --preset=perf --form-factor=mobile --output=html --output-path=./reports/home.html

# Leistungen
lighthouse http://localhost:5173/#/leistungen --preset=perf --form-factor=mobile --output=html --output-path=./reports/leistungen.html

# Branchen
lighthouse http://localhost:5173/#/branchen --preset=perf --form-factor=mobile --output=html --output-path=./reports/branchen.html

# Referenzen
lighthouse http://localhost:5173/#/referenzen --preset=perf --form-factor=mobile --output=html --output-path=./reports/referenzen.html

# Kontakt
lighthouse http://localhost:5173/#/kontakt --preset=perf --form-factor=mobile --output=html --output-path=./reports/kontakt.html
```

---

## Option 5: Real Device Testing

### iPhone (Safari)

1. **Aktiviere Web Inspector**
   - iPhone: Einstellungen → Safari → Erweitert → Web-Inspektor
   - Mac: Safari → Einstellungen → Erweitert → "Entwicklermenü in der Menüleiste anzeigen"

2. **Verbinde iPhone via USB**

3. **Öffne Website auf iPhone**
   ```
   http://YOUR_LOCAL_IP:5173
   ```
   (finde deine IP mit `ifconfig` oder `ipconfig`)

4. **Inspect von Mac aus**
   - Safari (Mac) → Entwickler → [Dein iPhone] → localhost
   - Timelines → Start Recording
   - Lade Seite neu
   - Analysiere Network, Layout, JavaScript

### Android (Chrome)

1. **Aktiviere USB Debugging**
   - Android: Einstellungen → Über das Telefon → Build-Nummer 7x tippen
   - Entwickleroptionen → USB-Debugging aktivieren

2. **Verbinde via USB**

3. **Chrome DevTools Remote Devices**
   - Chrome (PC) → `chrome://inspect#devices`
   - Finde dein Gerät
   - Öffne Website: `http://YOUR_LOCAL_IP:5173`

4. **Inspect & Test**
   - Klicke "inspect" beim Device
   - DevTools öffnen sich
   - Lighthouse → Mobile → Analyze

---

## Test-Checkliste

### ✅ Performance Metrics

Führe mindestens einen dieser Tests durch:

- [ ] **Lighthouse Mobile** (DevTools oder CLI)
  - Performance Score > 85
  - LCP < 2.5s
  - CLS < 0.1
  - INP < 200ms

- [ ] **Network Throttling** (Slow 4G)
  - LoadingScreen < 500ms
  - Hero-Image lädt progressiv
  - LCP < 2.5s trotz Throttling

- [ ] **Live Web Vitals** (performance-test.html)
  - Alle Metriken im grünen Bereich
  - Keine Warnings

### ✅ Visual Stability

- [ ] **Font Loading**
  - Kein FOIT (Flash of Invisible Text)
  - Kein FOUT (Flash of Unstyled Text)
  - Text erscheint sofort mit Fallback-Font

- [ ] **Image Loading**
  - Logo erscheint sofort (preloaded)
  - Hero-Image kein Layout-Shift
  - Service-Cards kein Layout-Shift

- [ ] **Layout Shifts**
  - CLS < 0.1 beim Laden
  - Kein Springen beim Scrollen
  - Navigation stabil

### ✅ Interaktivität

- [ ] **Navigation**
  - Burger-Menu öffnet < 100ms
  - Page-Transitions flüssig
  - Keine spürbaren Verzögerungen

- [ ] **Forms**
  - Inquiry Dialog öffnet instant
  - Input-Fields reagieren sofort
  - Validation ohne Delay

- [ ] **Scroll Performance**
  - 60fps beim Scrollen
  - Sticky Header performant
  - Lazy-Loading funktioniert

### ✅ Loading Experience

- [ ] **Initial Load**
  - LoadingScreen erscheint sofort
  - LoadingScreen verschwindet nach < 500ms
  - Content erscheint progressiv

- [ ] **Progressive Loading**
  - Above-the-fold content zuerst
  - Below-the-fold lazy-loaded
  - Kein "weißer Bildschirm"

---

## Häufige Probleme & Lösungen

### Problem: LCP > 2.5s

**Mögliche Ursachen:**
- Hero-Image zu groß
- LoadingScreen zu lang
- Fonts blockieren Rendering

**Lösung überprüfen:**
```bash
# Hero-Image sollte WebP/AVIF mit srcset sein
# LoadingScreen sollte 300ms sein
# Fonts sollten preload + swap haben
```

### Problem: CLS > 0.1

**Mögliche Ursachen:**
- Images ohne width/height
- Fonts ohne fallback
- Dynamic content ohne placeholder

**Lösung überprüfen:**
```bash
# Alle <img> Tags sollten width + height haben
# font-display: swap sollte aktiv sein
# Aspect-ratio auf Containern setzen
```

### Problem: INP > 200ms

**Mögliche Ursachen:**
- Schwere Event-Handler
- Blocking JavaScript
- Zu große Bundles

**Lösung überprüfen:**
```bash
# Lighthouse → "Reduce JavaScript execution time"
# Bundle-Größe prüfen: sollte < 400KB sein
# Passive event listeners verwenden
```

### Problem: Lighthouse Score < 85

**Checke diese Punkte:**
1. Ist LoadingScreen auf 300ms?
2. Sind Fonts preloaded?
3. Ist Hero-Image optimiert (WebP/AVIF)?
4. Haben alle Images width/height?
5. Ist lazy-loading aktiv?

---

## Reports & Dokumentation

Nach dem Testing:

1. **Screenshots erstellen**
   - Lighthouse Report
   - Network Waterfall
   - Performance Timeline

2. **Ergebnisse dokumentieren**
   - Performance Scores
   - Core Web Vitals Werte
   - Auffälligkeiten/Probleme

3. **Reports speichern**
   ```
   /reports/
     lighthouse-mobile.html
     lighthouse-desktop.html
     screenshots/
       lighthouse-score.png
       network-waterfall.png
   ```

---

## Schnell-Referenz

### Lighthouse Command (Copy & Paste)

```bash
# Mobile
lighthouse http://localhost:5173 --preset=perf --form-factor=mobile --output=html --output-path=./lighthouse-mobile.html && open ./lighthouse-mobile.html

# Desktop
lighthouse http://localhost:5173 --preset=perf --form-factor=desktop --output=html --output-path=./lighthouse-desktop.html && open ./lighthouse-desktop.html
```

### DevTools Shortcuts

- **Open DevTools**: `F12` (Windows/Linux), `Cmd+Option+I` (Mac)
- **Hard Reload**: `Ctrl+Shift+R` (Windows/Linux), `Cmd+Shift+R` (Mac)
- **Network Panel**: `Ctrl+Shift+N` oder DevTools → Network
- **Performance Panel**: DevTools → Performance → Record

### Network Throttling Presets

- **Fast 3G**: 1.6 Mbps / 150ms latency
- **Slow 4G**: 4 Mbps / 40ms latency
- **Slow 3G**: 400 Kbps / 400ms latency (Worst Case)

---

## Support & Weitere Infos

- 📄 **Detaillierte Messungen**: `PERFORMANCE_TEST_RESULTS.md`
- 📄 **Test-Setup Guide**: `LIGHTHOUSE_TEST_REPORT.md`
- 📄 **Optimierungs-Plan**: `PERFORMANCE_OPTIMIZATION.md`
- 📄 **Zusammenfassung**: `PERFORMANCE_SUMMARY.md`
- 🔧 **Interaktives Tool**: `performance-test.html`

**Happy Testing! 🚀**
