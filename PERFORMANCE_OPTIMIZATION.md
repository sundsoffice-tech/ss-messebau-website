# Mobile Performance Optimierung - S&S Messebau

## Ziele
- **LCP (Largest Contentful Paint)**: < 2,5s
- **INP (Interaction to Next Paint)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0,1

## Performance-Bremsen (priorisiert nach Impact)

### 🔴 KRITISCH - Sofort beheben

#### 1. LoadingScreen blockiert Initial Render (2000ms Delay)
**Problem**: Künstlicher 2-Sekunden-Delay vor dem eigentlichen Content-Rendering.
**Impact**: LCP >= 2000ms garantiert, bevor überhaupt Content geladen wird.
**Lösung**: LoadingScreen komplett entfernen oder auf max 300ms reduzieren.

#### 2. Hero-Hintergrundbild nicht optimiert
**Problem**: Unsplash-Bild (1600px) wird bei jedem Seitenaufruf neu geladen, keine srcset/WebP.
**Impact**: LCP +800-1500ms auf Mobile, besonders auf Slow 3G.
**Lösung**: 
- WebP/AVIF Format mit Fallback
- Responsive srcset (320w, 640w, 1024w, 1600w)
- preload für LCP-Image
- Feste aspect-ratio gegen CLS

#### 3. Logo-Import in Header & LoadingScreen
**Problem**: Logo wird doppelt geladen, keine Optimierung, kein preload.
**Impact**: LCP +200-400ms, CLS durch spätes Laden.
**Lösung**: 
- Logo preloaden
- width/height explizit setzen
- WebP konvertieren
- Inline-SVG für kleine Logos erwägen

#### 4. Keine CSS-Optimierung
**Problem**: Komplettes Tailwind-Bundle, unused CSS, kein kritisches CSS inline.
**Impact**: FCP +300-600ms, INP durch Parse-Blocking.
**Lösung**:
- PurgeCSS in Production
- Kritisches CSS inline in index.html
- Nicht-kritisches CSS defer

#### 5. Framer Motion Bundle-Size
**Problem**: Framer Motion (LoadingScreen, Animationen) = ~50KB gzipped.
**Impact**: TTI +400-700ms, INP durch lange JS-Parse-Zeit.
**Lösung**:
- LoadingScreen-Animation entfernen oder mit CSS
- Framer Motion nur für essentielle Animationen
- Code-Splitting für Animation-Heavy Components

#### 6. Keine Font-Optimierung
**Problem**: Google Fonts ohne preload, font-display fehlt, alle Weights geladen.
**Impact**: LCP +200-500ms, FOUT/FOIT Probleme.
**Lösung**:
- Nur benötigte Weights (400, 500, 600, 700)
- font-display: swap
- preconnect/preload
- Subset für Latin-Extended

### 🟡 HOCH - Wichtige Optimierung

#### 7. Bilder ohne lazy-loading
**Problem**: Alle Service-Cards, Testimonials, Referenzen laden sofort.
**Impact**: Initial Load +1-3s, unnötiger Bandwidth-Verbrauch.
**Lösung**:
- loading="lazy" für below-the-fold images
- Intersection Observer für custom lazy-loading
- Blur-Placeholder oder aspect-ratio Box

#### 8. Keine Image-Dimensionen
**Problem**: width/height fehlt bei den meisten Bildern.
**Impact**: CLS 0,2-0,5 (sehr schlecht).
**Lösung**:
- Explizite width/height oder aspect-ratio
- Placeholder mit korrektem Aspect Ratio

#### 9. Third-Party Scripts (Google Fonts)
**Problem**: Blocking Request zu fonts.googleapis.com.
**Impact**: FCP +100-300ms.
**Lösung**:
- preconnect
- Self-hosted fonts erwägen
- font-display: swap

#### 10. Keine Compression-Headers
**Problem**: Vite Dev-Server komprimiert nicht, Production-Setup unklar.
**Impact**: Transfer Size 2-3x größer.
**Lösung**:
- Vite Build mit Compression
- Server-side Brotli/Gzip

### 🟢 MITTEL - Performance-Gewinn

#### 11. React Bundle nicht optimiert
**Problem**: Kein Code-Splitting nach Routes.
**Impact**: Initial Bundle zu groß (>200KB).
**Lösung**:
- React.lazy() für Page-Components
- Route-based Code-Splitting

#### 12. Keine Cache-Strategie
**Problem**: Keine Cache-Headers, kein Service Worker.
**Impact**: Repeat Visits so langsam wie First Visit.
**Lösung**:
- Vite PWA Plugin
- Cache-Control Headers
- Asset Versioning

#### 13. INP durch Event Handler
**Problem**: Scroll-Events, Navigation ohne Debouncing/Throttling.
**Impact**: INP 200-400ms bei schnellen Interaktionen.
**Lösung**:
- requestAnimationFrame für Scroll
- Event Delegation
- Passive Event Listeners

---

## Konkrete Maßnahmen mit Code

### Maßnahme 1: LoadingScreen reduzieren (KRITISCH)
**File**: `src/components/LoadingScreen.tsx`

**Problem**: 2000ms künstlicher Delay blockiert alle Inhalte.

**Lösung**: Delay auf 300ms reduzieren oder komplett entfernen.

```typescript
// ALT: setTimeout(() => setIsLoading(false), 2000)
// NEU: setTimeout(() => setIsLoading(false), 300)
// ODER: LoadingScreen komplett entfernen
```

**Erwarteter Gewinn**: LCP -1700ms

---

### Maßnahme 2: Hero-Image optimieren (KRITISCH)
**File**: `src/components/pages/HomePage.tsx`

**Problem**: Unsplash 1600px, keine srcset, kein WebP.

**Lösung A - Optimierte externe Bilder**:
```tsx
{/* ALT */}
<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600')] bg-cover bg-center opacity-20" />

{/* NEU */}
<picture>
  <source
    type="image/avif"
    srcSet="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&fm=avif&q=80 640w,
            https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1024&fm=avif&q=80 1024w,
            https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&fm=avif&q=80 1600w"
    sizes="100vw"
  />
  <source
    type="image/webp"
    srcSet="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&fm=webp&q=80 640w,
            https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1024&fm=webp&q=80 1024w,
            https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&fm=webp&q=80 1600w"
    sizes="100vw"
  />
  <img
    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1024&q=80"
    alt=""
    className="absolute inset-0 w-full h-full object-cover opacity-20"
    style={{ aspectRatio: '16/9' }}
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

**Lösung B - CSS mit optimiertem Background** (einfacher):
```tsx
<div 
  className="absolute inset-0 bg-cover bg-center opacity-20"
  style={{
    backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1024&fm=webp&q=80&auto=format')`,
    aspectRatio: '16/9'
  }}
/>
```

**Erwarteter Gewinn**: LCP -500-1000ms

---

### Maßnahme 3: Font-Optimierung (KRITISCH)
**File**: `index.html`

**Problem**: Google Fonts ohne Optimierung.

**Lösung**:
```html
<!-- ALT -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- NEU -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link 
  rel="preload" 
  as="style"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=latin"
>
<link 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=latin" 
  rel="stylesheet"
  media="print"
  onload="this.media='all'"
>
<noscript>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</noscript>
```

**Erwarteter Gewinn**: FCP -200-400ms, CLS -0,05

---

### Maßnahme 4: Logo preloaden (KRITISCH)
**File**: `index.html`

**Lösung**:
```html
<head>
  <!-- ... -->
  <link rel="preload" as="image" href="/src/assets/images/IMG-20230807-WA0009_(1).png">
</head>
```

**Erwarteter Gewinn**: LCP -200ms, CLS -0,05

---

### Maßnahme 5: Lazy-Loading für Below-Fold Images (HOCH)
**File**: Alle Page-Components

**Problem**: Service-Cards, Referenzen laden alle sofort.

**Lösung**:
```tsx
{/* Service Cards - nicht im Viewport */}
<img
  src={service.image}
  alt={service.title}
  loading="lazy"
  decoding="async"
  width="400"
  height="250"
  className="w-full h-48 object-cover"
/>
```

**Erwarteter Gewinn**: Initial Load -1-2s, Bandwidth -50%

---

### Maßnahme 6: Image Dimensions überall (HOCH)
**Lösung**: width/height Attribute für jedes Image.

```tsx
{/* ALT */}
<img src={logo} alt="Logo" className="h-32" />

{/* NEU */}
<img 
  src={logo} 
  alt="Logo" 
  width="128"
  height="128"
  className="h-32 w-auto"
/>
```

**Erwarteter Gewinn**: CLS -0,15-0,3

---

### Maßnahme 7: Vite Build Optimization (HOCH)
**File**: `vite.config.ts`

**Lösung**:
```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

**Erwarteter Gewinn**: Bundle Size -30-40%, TTI -400ms

---

### Maßnahme 8: Route-based Code Splitting (MITTEL)
**File**: `src/App.tsx`

**Problem**: Alle Pages im Initial Bundle.

**Lösung**:
```typescript
import { lazy, Suspense } from 'react'

// Lazy load pages
const HomePage = lazy(() => import('./components/pages/HomePage'))
const LeistungenPage = lazy(() => import('./components/pages/LeistungenPage'))
const BranchenPage = lazy(() => import('./components/pages/BranchenPage'))
// ... etc

function App() {
  // ...
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      {/* render pages */}
    </Suspense>
  )
}
```

**Erwarteter Gewinn**: Initial Bundle -40-60%, FCP -300ms

---

### Maßnahme 9: INP Optimization - Passive Listeners (MITTEL)
**File**: Alle Components mit Scroll/Touch Events

**Lösung**:
```typescript
// Wenn Scroll-Events verwendet werden
useEffect(() => {
  const handleScroll = () => {
    // ...
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

**Erwarteter Gewinn**: INP -50-100ms

---

### Maßnahme 10: Kritisches CSS Inline (MITTEL)
**File**: `index.html`

**Lösung**: Inline kritisches CSS für Above-the-Fold.

```html
<head>
  <style>
    /* Kritisches CSS für initial render */
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      background: oklch(1 0 0);
      color: oklch(0.25 0.01 260);
    }
    .hero-gradient {
      background: linear-gradient(135deg, oklch(0.45 0.15 250) 0%, oklch(0.35 0.12 250) 100%);
    }
    /* Minimal Button/CTA Styles */
  </style>
</head>
```

**Erwarteter Gewinn**: FCP -200ms

---

## Messplan

### Tools
1. **Lighthouse CI** (Chrome DevTools)
   - Mobile Emulation (Moto G4)
   - Slow 4G Throttling
   - CPU: 4x slowdown
   
2. **WebPageTest**
   - Location: Frankfurt/Germany
   - Device: Moto G4
   - Connection: 3G (1.6 Mbps/768 Kbps, 300ms RTT)

3. **Real Device Testing**
   - iPhone 12 Mini (iOS)
   - Samsung Galaxy A52 (Android)
   - Slow 3G via DevTools

### Vorher/Nachher Tabelle

| Metrik | Ziel | Vorher (geschätzt) | Nach Quick Wins | Nach Vollständig | Maßnahmen |
|--------|------|-------------------|----------------|-----------------|-----------|
| **LCP** | < 2,5s | ~3,5-4,5s | ~2,8s | < 2,0s | LoadingScreen, Hero-Image, Logo, Fonts |
| **FCP** | < 1,8s | ~2,5-3,0s | ~1,6s | < 1,3s | CSS Inline, Fonts, Defer JS |
| **INP** | < 200ms | ~250-350ms | ~180ms | < 150ms | Passive Listeners, Event Delegation |
| **CLS** | < 0,1 | ~0,25-0,4 | ~0,08 | < 0,05 | Image Dimensions, Logo, Fonts |
| **TTI** | < 3,8s | ~5,0-6,0s | ~3,5s | < 3,0s | Code Splitting, Bundle Optimization |
| **TBT** | < 200ms | ~400-600ms | ~250ms | < 150ms | Smaller Bundles, defer Scripts |
| **Speed Index** | < 3,4s | ~4,5-5,5s | ~3,2s | < 2,8s | Above-the-Fold Optimization |
| **Bundle Size** | < 200KB | ~350KB | ~220KB | < 180KB | Tree-shaking, Code Splitting |
| **Image Weight** | < 500KB | ~2-3MB | ~800KB | < 400KB | WebP/AVIF, srcset, lazy-load |

### Test-Szenarien

1. **Cold Load** (First Visit)
   - Cache leer
   - Slow 3G
   - Mobile Device

2. **Warm Load** (Repeat Visit)
   - Cache aktiv
   - Slow 3G
   - Mobile Device

3. **Interaction Test**
   - Navigation zwischen Pages
   - Form-Interaktionen
   - Menu-Toggle
   - Gemessene INP-Werte

4. **Layout Stability**
   - Scroll-Test
   - Font-Loading
   - Image-Loading
   - Gemessene CLS-Werte

---

## Implementierungs-Priorität

### Phase 1: Quick Wins (heute)
1. ✅ LoadingScreen reduzieren/entfernen
2. ✅ Font-Optimierung (preload, display:swap)
3. ✅ Logo preload
4. ✅ Hero-Image WebP + srcset
5. ✅ Image dimensions überall

**Erwarteter Gesamt-Gewinn**: LCP -2,0s, CLS -0,2

### Phase 2: Build-Optimierung (heute)
6. ✅ Vite Build Config
7. ✅ CSS Minification
8. ✅ Lazy-loading Images
9. ✅ Kritisches CSS inline

**Erwarteter Gesamt-Gewinn**: FCP -500ms, Bundle -30%

### Phase 3: Code-Splitting (optional)
10. ⚠️ Route-based Code Splitting
11. ⚠️ Component-level lazy loading
12. ⚠️ Framer Motion conditional loading

**Erwarteter Gesamt-Gewinn**: Initial Bundle -50KB, TTI -400ms

---

## Konkrete Code-Änderungen (wird umgesetzt)

Siehe folgende Files:
- ✅ `src/components/LoadingScreen.tsx` - Delay reduziert
- ✅ `index.html` - Font + Logo preload
- ✅ `src/components/pages/HomePage.tsx` - Hero optimiert
- ✅ `vite.config.ts` - Build optimization
- ✅ `src/index.css` - Kritisches CSS
- ✅ Alle Image-Tags - width/height + loading

