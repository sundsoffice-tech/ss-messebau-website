# Browser-Kompatibilitäts-Analyse: S&S Messebau Website

**Datum:** 2026-02-18
**Stack:** React 19 · Vite 7 · Tailwind CSS 4 · Framer Motion · TypeScript
**Build-Target:** `es2020` (vite.config.ts)

---

## Zusammenfassung

| Kategorie | Befunde | Priorität |
|-----------|---------|-----------|
| CSS: `oklch()` Farben ohne Fallback | 60+ Stellen | **KRITISCH** |
| CSS: `@layer` Cascade Layers | 4 Stellen | MITTEL |
| CSS: `:has()` Selektoren | 6+ Stellen | MITTEL |
| CSS: Container Queries | 1 Stelle | MITTEL |
| JS: `fetch()` ohne Polyfill | 15+ Dateien | MITTEL |
| JS: `IntersectionObserver` ohne Polyfill | 2 Stellen | NIEDRIG |
| Bilder: Kein WebP/AVIF mit Fallback | Alle Bilder | MITTEL |
| Bilder: Kein `<picture>` Element | 0 vorhanden | MITTEL |
| Bilder: Fehlende responsive `srcSet` | Lokale Bilder | NIEDRIG |
| PWA: Icons fehlen physisch | 2 referenziert | NIEDRIG |
| Build: Kein `browserslist` konfiguriert | — | MITTEL |
| Build: CSS-Minifier `lightningcss` ohne Targets | — | MITTEL |
| `env()` Safe-Area ohne Fallback | 1 Stelle | NIEDRIG |

---

## 1. CSS-Kompatibilität

### 1.1 KRITISCH: `oklch()` Farben (60+ Vorkommen)

**Problem:** Das gesamte Farbsystem basiert auf `oklch()`, einer modernen CSS-Farbfunktion.

**Betroffene Dateien:**
- `src/main.css:19-96` — Alle CSS Custom Properties (`--primary`, `--background`, etc.)
- `src/index.css:68,76-78,84-86` — Focus-Ring-Styles
- `src/index.css:144` — Hero-Gradient
- `src/components/CustomCursor.tsx:139` — Dynamische oklch()-Werte
- `src/components/CursorGlow.tsx:11` — oklch() in State
- `index.html:122-127` — Kritisches Inline-CSS

**Browser-Support:**
| Browser | Unterstützt ab |
|---------|---------------|
| Chrome | 111+ (März 2023) |
| Firefox | 113+ (Mai 2023) |
| Safari | 15.4+ (März 2022) |
| Edge | 111+ (März 2023) |
| Samsung Internet | 22+ |
| IE 11 | Nicht unterstützt |

**Empfehlung:**
```css
/* Vorher (nur oklch) */
--primary: oklch(0.45 0.15 250);

/* Nachher (mit Fallback) */
--primary: #3730a3;             /* Hex-Fallback für ältere Browser */
--primary: oklch(0.45 0.15 250); /* Moderner Wert überschreibt */
```

Alternativ: In `vite.config.ts` den `lightningcss`-Minifier mit Browser-Targets konfigurieren, sodass `oklch()` automatisch nach `rgb()` konvertiert wird:

```ts
build: {
  cssMinify: 'lightningcss',
},
css: {
  lightningcss: {
    targets: browserslistToTargets(browserslist('>= 0.25%')),
  },
},
```

### 1.2 MITTEL: CSS `@layer` Cascade Layers

**Betroffene Dateien:**
- `src/index.css:1` — `@layer base { ... }`
- `src/styles/theme.css:3-11` — `@import ... layer(base)`
- `src/styles/theme.css:23,33` — Weitere `@layer base` Blöcke

**Browser-Support:**
| Browser | Unterstützt ab |
|---------|---------------|
| Chrome | 99+ (März 2022) |
| Firefox | 97+ (Feb 2022) |
| Safari | 15.4+ (März 2022) |
| Edge | 99+ |

**Risiko:** In älteren Browsern werden `@layer`-Regeln ignoriert, was zu unvorhersehbarer CSS-Kaskade führen kann. Tailwind CSS 4 generiert `@layer`-Regeln automatisch.

**Empfehlung:** Akzeptables Risiko, da Tailwind 4 `@layer` voraussetzt. Browser ohne Support (< 2022) sind ein sehr kleiner Anteil. Ein Hinweis-Banner für veraltete Browser wäre sinnvoll.

### 1.3 MITTEL: `:has()` Pseudo-Klasse

**Betroffene Dateien:**
- `src/components/ui/card.tsx:23` — `has-data-[slot=card-action]`
- `src/components/ui/calendar.tsx:37-40` — `[&:has([aria-selected])]`
- `src/components/ui/table.tsx:71,84` — `[&:has([role=checkbox])]`

**Browser-Support:**
| Browser | Unterstützt ab |
|---------|---------------|
| Chrome | 105+ (Aug 2022) |
| Firefox | 121+ (Dez 2023) |
| Safari | 15.4+ (März 2022) |

**Empfehlung:** Fallback-Styles definieren, die ohne `:has()` funktionieren. Die betroffenen Stellen sind UI-Details (Checkbox-Padding, Selection-Highlighting) — kein kritischer Layout-Bruch.

### 1.4 NIEDRIG: Weitere CSS-Features

| Feature | Vorkommen | Support | Risiko |
|---------|-----------|---------|--------|
| `clamp()` | 50+ Stellen | Chrome 79+, Safari 13.1+, FF 75+ | Niedrig |
| `backdrop-filter` | Header.tsx | Mit `@supports` abgesichert | Keins |
| `overscroll-behavior` | index.css:102 | Chrome 63+, FF 59+, Safari 16+ | Niedrig |
| `env(safe-area-inset-bottom)` | index.css:152 | Safari 11.2+, Chrome 69+ | Niedrig |
| `gap` in Flexbox | Überall (Tailwind) | Chrome 84+, Safari 14.1+ | Niedrig |
| Container Queries | card.tsx | Chrome 105+, Safari 16+ | Niedrig |
| `scroll-behavior: smooth` | index.css:7 | Chrome 61+, FF 36+, Safari 15.4+ | Niedrig |

---

## 2. JavaScript-Kompatibilität

### 2.1 MITTEL: `fetch()` API ohne Polyfill

**Betroffene Dateien (15+):**
- `src/lib/api-client.ts:14`
- `src/lib/ai-admin-service.ts:45,64,90,111`
- `src/lib/analytics-tracker.ts:147,245,255,275,283,291,312,321`
- `src/lib/chat-service.ts:126`
- `src/lib/file-utils.ts:29`

**Risiko:** IE 11 bietet keine `fetch()`-Unterstützung. Alle modernen Browser unterstützen es.

**Empfehlung:** Kein Polyfill nötig, wenn IE 11 nicht als Ziel definiert ist (was bei React 19 ohnehin nicht möglich ist).

### 2.2 NIEDRIG: `IntersectionObserver`

**Betroffene Dateien:**
- `src/components/ui/FactBar.tsx:49` — Animierte Zahlen
- `src/hooks/use-deep-linking.ts:46` — Section-Tracking

**Support:** Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+

### 2.3 GUT GELÖST: `requestIdleCallback`

- `src/components/LoadingScreen.tsx:10-17` — **Korrekt mit `setTimeout`-Fallback implementiert**

### 2.4 BEACHTEN: `scrollIntoView({ behavior: 'smooth' })`

- `src/components/pages/KontaktPage.tsx:175`

**Problem:** `behavior: 'smooth'` wird in Safari erst ab 15.4 unterstützt. Ältere Safari-Versionen ignorieren die Option und scrollen sofort — kein Crash, nur kein sanftes Scrollen.

### 2.5 Weitere JS-APIs

| API | Vorkommen | Support |
|-----|-----------|---------|
| `window.matchMedia` | 8+ Dateien | IE 10+ (sicher) |
| `requestAnimationFrame` | 4 Dateien | IE 10+ (sicher) |
| `Intl.NumberFormat` | StandCalculator.tsx | IE 11+ (sicher) |
| `Intl.DateTimeFormat` | MesseCalendar.tsx | IE 11+ (sicher) |
| Dynamic `import()` | App.tsx (19 lazy routes) | Vite transpiliert |
| `import.meta.env` | 5 Dateien | Vite transpiliert |

---

## 3. Bilder & Medien

### 3.1 MITTEL: Keine modernen Bildformate mit Fallback

**Aktueller Zustand:**
- 23 JPEG-Dateien in `public/images/`
- 1 PNG-Logo in `src/assets/logo/`
- 0 WebP-Dateien
- 0 AVIF-Dateien
- 0 `<picture>`-Elemente

**Was gut ist:**
- `loading="lazy"` — 25 Vorkommen (konsequent eingesetzt)
- `decoding="async"` — 25 Vorkommen (konsequent eingesetzt)
- `fetchPriority="high"` — Hero-Bild korrekt priorisiert
- `MediaFrame`-Komponente als wiederverwendbarer Wrapper

**Empfehlung:**
```tsx
/* Vorher */
<img src="/images/hero.jpg" loading="lazy" />

/* Nachher — mit automatischem Format-Fallback */
<picture>
  <source srcSet="/images/hero.avif" type="image/avif" />
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" loading="lazy" decoding="async" />
</picture>
```

**Einsparpotenzial:** WebP bietet ~25-35% kleinere Dateien, AVIF ~50% gegenüber JPEG.

**Umsetzung:** Ein Vite-Plugin wie `vite-plugin-image-optimizer` oder `vite-imagetools` kann automatisch WebP/AVIF-Varianten erzeugen.

### 3.2 NIEDRIG: Responsive Images (`srcSet`) nur für externe Bilder

- `src/components/pages/HomePage.tsx` — Nur Unsplash-Bilder haben `srcSet` + `sizes`
- Lokale Bilder in `public/images/` haben keine responsiven Varianten

**Empfehlung:** Für die wichtigsten Bilder (Hero, Referenzen) `srcSet` mit verschiedenen Auflösungen bereitstellen.

---

## 4. Fonts

### 4.1 GUT GELÖST: Font-Loading-Strategie

| Aspekt | Status |
|--------|--------|
| `font-display: swap` | Implementiert (Google Fonts URL-Parameter) |
| Metrisch angepasster Fallback | Implementiert (`Inter-fallback` in index.html) |
| Preconnect-Hints | Implementiert (`fonts.googleapis.com`, `fonts.gstatic.com`) |
| Async Font-Loading | Implementiert (`media="print"` + `onload`) |
| `<noscript>`-Fallback | Implementiert |
| CLS-Vermeidung | Implementiert (ascent/descent/size-adjust Override) |

**Einziges Risiko:** Abhängigkeit von Google Fonts CDN. Bei Ausfall zeigt der Browser den Fallback-Font.

**Empfehlung:** Optional Font-Dateien lokal hosten (WOFF2) für vollständige Unabhängigkeit und DSGVO-Konformität.

---

## 5. Build-Konfiguration

### 5.1 MITTEL: Kein `browserslist` definiert

**Problem:** Weder in `package.json` noch als `.browserslistrc` ist ein Browser-Target definiert. Der Vite-Build-Target ist `es2020`, was Folgendes bedeutet:

- Optional Chaining (`?.`) und Nullish Coalescing (`??`) werden **nicht** transpiliert
- `BigInt` und `import.meta` werden vorausgesetzt
- Kein automatisches CSS-Downleveling

**Empfehlung:** `browserslist` in `package.json` hinzufügen:
```json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "Firefox ESR",
    "not dead",
    "not IE 11"
  ]
}
```

### 5.2 MITTEL: `lightningcss` ohne Browser-Targets

**Problem:** In `vite.config.ts:42` wird `cssMinify: 'lightningcss'` verwendet, aber ohne `targets`. Dadurch führt LightningCSS **kein automatisches Downleveling** von `oklch()`, `@layer`, oder `:has()` durch.

**Empfehlung:**
```ts
// vite.config.ts
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%')),
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
});
```

Dies würde `oklch()` automatisch in `rgb()`-Fallbacks konvertieren.

### 5.3 GUT: Vite Code-Splitting

- React + React DOM als separater Vendor-Chunk
- UI-Libraries als eigener Chunk
- Framer Motion isoliert
- 19 lazy-geladene Routen via `React.lazy()`

---

## 6. HTML & Meta-Tags

### 6.1 GUT GELÖST

| Aspekt | Status |
|--------|--------|
| `<html lang="de">` | Korrekt |
| Viewport Meta | Korrekt (`width=device-width, initial-scale=1.0`) |
| `X-UA-Compatible` | Vorhanden (IE Edge) |
| `theme-color` | Vorhanden (`#3730a3`) |
| Open Graph Tags | Vollständig |
| Twitter Card | Vollständig |
| Canonical URL | Vorhanden |
| Hreflang | de + en + x-default |
| Schema.org JSON-LD | LocalBusiness korrekt |
| Noscript-Fallback | Vollständiger Inhalt vorhanden |
| Favicon-Setup | SVG + PNG + ICO + Apple Touch |
| PWA Manifest | Referenziert |

### 6.2 NIEDRIG: PWA-Icons fehlen physisch

`manifest.json` referenziert `/icons/icon-192x192.png` und `/icons/icon-512x512.png`, aber das Verzeichnis `/public/icons/` existiert möglicherweise nicht mit diesen Dateien.

---

## 7. Server-Konfiguration (.htaccess)

### 7.1 GUT GELÖST

| Aspekt | Status |
|--------|--------|
| Gzip-Komprimierung | Alle relevanten MIME-Types |
| Browser-Caching | 1 Jahr für statische Assets |
| MIME-Types | WebP, AVIF, WOFF2 korrekt definiert |
| Security Headers | HSTS, CSP, X-Frame-Options |
| SPA-Routing | Korrekt mit Fallback auf index.html |
| UTF-8 Encoding | Korrekt |
| Alte Browser (BrowserMatch) | Mozilla 4 / MSIE Workarounds |

---

## 8. Priorisierte Maßnahmen-Liste

### Priorität 1 — KRITISCH (Sichtbare Fehler in älteren Browsern)

1. **`oklch()` CSS-Fallbacks hinzufügen**
   *Aufwand:* 2-4h | *Wirkung:* Farben werden in Safari < 15.4, Chrome < 111 korrekt angezeigt
   *Lösung:* LightningCSS mit Targets konfigurieren ODER manuelle Hex-Fallbacks

2. **`browserslist` konfigurieren**
   *Aufwand:* 15min | *Wirkung:* Vite und LightningCSS kennen die Zielbrowser
   *Lösung:* `browserslist`-Feld in `package.json` hinzufügen

### Priorität 2 — MITTEL (Performance & Reichweite)

3. **WebP-Bildvarianten erzeugen + `<picture>`-Fallback**
   *Aufwand:* 2-3h | *Wirkung:* 25-50% kleinere Bilder, volle Browser-Kompatibilität
   *Lösung:* Build-Pipeline mit `vite-plugin-image-optimizer`

4. **LightningCSS-Targets aktivieren**
   *Aufwand:* 30min | *Wirkung:* Automatisches CSS-Downleveling für ältere Browser
   *Lösung:* `css.lightningcss.targets` in `vite.config.ts`

5. **Google Fonts lokal hosten**
   *Aufwand:* 1h | *Wirkung:* DSGVO-Konformität, kein externer CDN-Dependency
   *Lösung:* WOFF2-Dateien herunterladen, `@font-face` lokal definieren

### Priorität 3 — NIEDRIG (Nice-to-have)

6. **Veraltete-Browser-Hinweis** für `@layer`/`:has()`-inkompatible Browser
7. **Responsive `srcSet`** für lokale Bilder
8. **PWA-Icons** generieren und in `/public/icons/` ablegen
9. **Service Worker** für Offline-Support implementieren

---

## 9. Browser-Kompatibilitäts-Matrix (aktueller Stand)

| Feature | Chrome | Firefox | Safari | Edge | Samsung | IE 11 |
|---------|--------|---------|--------|------|---------|-------|
| oklch() Farben | 111+ | 113+ | 15.4+ | 111+ | 22+ | Nein |
| @layer | 99+ | 97+ | 15.4+ | 99+ | 18+ | Nein |
| :has() | 105+ | 121+ | 15.4+ | 105+ | 20+ | Nein |
| clamp() | 79+ | 75+ | 13.1+ | 79+ | 12+ | Nein |
| fetch() | 42+ | 39+ | 10.1+ | 14+ | 4+ | Nein |
| IntersectionObserver | 51+ | 55+ | 12.1+ | 15+ | 5+ | Nein |
| CSS gap (flex) | 84+ | 63+ | 14.1+ | 84+ | 14+ | Nein |
| loading="lazy" | 77+ | 75+ | 15.4+ | 79+ | 12+ | Nein |

**Minimum-Browser für volle Funktionalität:** Chrome/Edge 111+, Firefox 121+, Safari 15.4+

**Realistischer Safe-Floor mit Fallbacks:** Chrome/Edge 99+, Firefox 97+, Safari 15.4+
