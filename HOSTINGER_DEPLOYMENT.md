# Hostinger Deployment Guide

## Übersicht

Dieses Projekt ist vollständig für das Hosting auf **Hostinger** (HostingEr) optimiert. Alle notwendigen Konfigurationsdateien für maximale Kompatibilität mit Apache-Servern sind enthalten.

## ✅ Implementierte Kompatibilitätsfeatures

### 1. Apache .htaccess Konfiguration
- **Datei:** `public/.htaccess`
- **Features:**
  - ✅ SPA (Single Page Application) Routing
  - ✅ HTTPS-Weiterleitung (HTTP → HTTPS)
  - ✅ Gzip-Kompression für Assets
  - ✅ Browser-Caching (1 Jahr für statische Assets)
  - ✅ Sicherheits-Header (X-Frame-Options, X-Content-Type-Options, etc.)
  - ✅ MIME-Type Definitionen
  - ✅ Custom Error Pages (404 → index.html)
  - ✅ Schutz sensibler Dateien
  - ✅ UTF-8 Encoding
  - ✅ Directory Listing deaktiviert

### 2. SEO & Crawling
- **robots.txt:** Suchmaschinen-Konfiguration
- **sitemap.xml:** XML-Sitemap für besseres Ranking
- **Canonical URLs:** Duplicate Content vermeiden

### 3. Progressive Web App (PWA)
- **manifest.json:** PWA-Konfiguration
- **Meta-Tags:** Apple Touch Icons, Theme Color
- **Offline-Fähigkeit:** Vorbereitet für Service Worker

### 4. Monitoring & Health Checks
- **health.json:** Status-Endpoint für Monitoring
- **404.html:** Custom 404-Seite mit automatischer Weiterleitung

### 5. PHP-Kompatibilität
- **php.ini:** PHP-Konfiguration für Hostinger
- Memory Limits, Upload-Größen, Security-Settings

### 6. Meta-Tags & Social Media
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Schema.org Markup-ready

## 🚀 Deployment

Das Projekt unterstützt **zwei Deployment-Methoden**:

### Methode 1: Git-basiertes Deployment (EMPFOHLEN) ⭐

**Workflow:** `.github/workflows/deploy-hostinger.yml`

Dies ist die **bevorzugte Methode** für Hostinger, da sie die native Git-Integration nutzt.

#### Deployment-Prozess:
1. ✅ Code wird ausgecheckt
2. ✅ Node.js 20.x wird installiert
3. ✅ Dependencies werden installiert (`npm ci`)
4. ✅ Projekt wird gebaut (`npm run build`)
5. ✅ `index.html` im Build wird verifiziert (Abbruch bei Fehler)
6. ✅ Build-Output wird zu Branch `hostinger` gepusht (clean deployment)
7. ✅ Hostinger deployed automatisch von Branch `hostinger`

#### Vorteile:
- ✅ **Keine FTP-Zugangsdaten nötig** (nur Git)
- ✅ **Automatische Updates** bei jedem Push auf `main`
- ✅ **Sauberer Deployment-Branch** (nur Production-Dateien)
- ✅ **Versionskontrolle** des Deployments
- ✅ **index.html garantiert im Root** des Branches

#### Hostinger Git-Konfiguration:

1. **In Hostinger hPanel:**
   - Navigiere zu: `Advanced → Git`
   - Klicke auf `Create Git Repository`

2. **Repository-Einstellungen:**
   ```
   Repository URL:     git@github.com:sundsoffice-tech/ss-messebau-website.git
   Branch:             hostinger
   Deployment Path:    public_html (oder leer lassen für Root)
   ```

3. **SSH-Key hinzufügen:**
   - Hostinger generiert einen SSH-Key
   - Füge diesen als **Deploy Key** in GitHub hinzu:
     - GitHub → Settings → Deploy keys → Add deploy key
     - Paste Hostinger SSH-Key
     - **WICHTIG:** Nur Read-Zugriff nötig

4. **Auto-Deploy aktivieren:**
   - In Hostinger: `Auto-deployment` aktivieren
   - Bei jedem Push auf `hostinger` wird automatisch deployed

#### Testen:
```bash
# Nach Push auf main:
git checkout hostinger
git pull origin hostinger
ls -la  # index.html sollte im Root sein
```

---

### Methode 2: FTP-basiertes Deployment (Legacy)

**Workflow:** `.github/workflows/deploy.yml`

#### Deployment-Prozess:
1. ✅ Code wird ausgecheckt
2. ✅ Node.js 20.x wird installiert
3. ✅ Dependencies werden installiert (`npm ci`)
4. ✅ Projekt wird gebaut (`npm run build`)
5. ✅ `.htaccess` wird verifiziert
6. ✅ Build-Artefakte werden via FTPS zu Hostinger hochgeladen
7. ✅ Deployment-Summary wird erstellt

#### Benötigte GitHub Secrets:
```
FTP_SERVER    - Hostinger FTP Server (z.B. ftp.example.com)
FTP_USERNAME  - FTP Benutzername
FTP_PASSWORD  - FTP Passwort
```

**Hinweis:** Diese Methode wird weiterhin unterstützt, aber Git-Deployment (Methode 1) wird empfohlen.

### Manuelles Deployment

Falls manuelles Deployment nötig ist:

```bash
# 1. Projekt bauen
npm run build

# 2. Inhalt des dist/ Ordners per FTP/FTPS hochladen
# Zielverzeichnis: /public_html/

# 3. Verifizieren, dass .htaccess hochgeladen wurde
```

## 📁 Build-Output Struktur

Nach `npm run build` enthält der `dist/` Ordner:

```
dist/
├── .htaccess          # Apache-Konfiguration (WICHTIG!)
├── index.html         # Haupt-HTML-Datei
├── 404.html          # Custom 404-Seite
├── manifest.json     # PWA Manifest
├── robots.txt        # SEO Crawling-Regeln
├── sitemap.xml       # XML Sitemap
├── health.json       # Health Check Endpoint
├── php.ini           # PHP-Konfiguration
└── assets/           # CSS, JS, Images
    ├── index-[hash].css
    ├── index-[hash].js
    ├── react-vendor-[hash].js
    ├── ui-vendor-[hash].js
    └── ...
```

## 🌿 Branch-Struktur

### `main` Branch
- **Enthält:** Quellcode, Entwicklungs-Setup, Dokumentation
- **Verwendung:** Entwicklung, PRs, Code-Reviews
- **Nicht deployed:** Hostinger sieht diesen Branch nicht

### `hostinger` Branch ⭐
- **Enthält:** Nur Production-Build (`dist/` Inhalte im Root)
- **Verwendung:** Automatisches Deployment durch GitHub Action
- **Deployed von:** Hostinger Git-Integration
- **Struktur:**
  ```
  hostinger/
  ├── .htaccess          # Im Root!
  ├── index.html         # Im Root!
  ├── 404.html
  ├── manifest.json
  ├── robots.txt
  ├── sitemap.xml
  ├── health.json
  ├── php.ini
  └── assets/
      └── ...
  ```

**Wichtig:** 
- ⚠️ Niemals manuell in `hostinger` Branch arbeiten
- ⚠️ Wird automatisch von GitHub Actions überschrieben
- ✅ Nur für Hostinger-Deployment gedacht

## 🔧 Hostinger-Spezifische Konfiguration

### Apache Module
Das Projekt nutzt folgende Apache-Module (meist standardmäßig aktiviert):
- `mod_rewrite` - URL Rewriting
- `mod_deflate` - Gzip-Kompression
- `mod_expires` - Cache-Control
- `mod_headers` - HTTP Headers
- `mod_mime` - MIME-Types

### PHP-Einstellungen (optional)
Falls PHP benötigt wird:
- Memory Limit: 256M
- Upload Max Filesize: 20M
- Post Max Size: 20M
- Display Errors: Off (Production)

### Datei-Permissions
Empfohlene Permissions auf Hostinger:
- Ordner: `755`
- Dateien: `644`
- `.htaccess`: `644`

## 🌐 Domain-Konfiguration

### DNS-Einstellungen
1. A-Record auf Hostinger-IP zeigen lassen
2. CNAME für `www` → Hauptdomain (optional)

### SSL/HTTPS
- Hostinger bietet kostenloses Let's Encrypt SSL
- HTTPS-Weiterleitung ist in `.htaccess` bereits konfiguriert
- Bei SSL-Aktivierung automatisch aktiv

## 🔍 Verifizierung nach Deployment

Nach erfolgreichem Deployment prüfen:

### 1. SPA-Routing funktioniert
```
✓ https://www.sundsmessebau.de/
✓ https://www.sundsmessebau.de/#/leistungen
✓ https://www.sundsmessebau.de/#/kontakt
✓ Direkter Aufruf: https://www.sundsmessebau.de/leistungen
  sollte auf /#/leistungen weiterleiten
```

### 2. HTTPS-Weiterleitung
```
✓ http://www.sundsmessebau.de
  → https://www.sundsmessebau.de
```

### 3. Kompression aktiv
```bash
curl -H "Accept-Encoding: gzip" -I https://www.sundsmessebau.de
# Sollte "Content-Encoding: gzip" enthalten
```

### 4. Caching-Header
```bash
curl -I https://www.sundsmessebau.de/assets/index-[hash].css
# Sollte "Cache-Control: max-age=31536000" enthalten
```

### 5. Sicherheits-Header
```bash
curl -I https://www.sundsmessebau.de
# Sollte enthalten:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
```

### 6. Health Check
```
✓ https://www.sundsmessebau.de/health.json
  Sollte JSON mit "status": "ok" zurückgeben
```

### 7. SEO-Dateien
```
✓ https://www.sundsmessebau.de/robots.txt
✓ https://www.sundsmessebau.de/sitemap.xml
```

## 🐛 Troubleshooting

### Problem: 404-Fehler bei direkten URLs
**Lösung:** `.htaccess` fehlt oder wird nicht geladen
- Verifizieren: `.htaccess` in `/public_html/` vorhanden?
- `mod_rewrite` aktiviert? (meist standardmäßig aktiv)
- `.htaccess` Permissions: 644

### Problem: Keine Gzip-Kompression
**Lösung:** `mod_deflate` nicht aktiviert
- Bei Hostinger Support nachfragen
- Alternative: Hostinger Control Panel → Advanced → Apache Modules

### Problem: CSS/JS nicht geladen
**Lösung:** Falsche Pfade
- Base-URL in Vite-Config prüfen
- Browser-Konsole auf Fehler prüfen

### Problem: HTTPS-Redirect Loop
**Lösung:** `.htaccess` und Server-Konfiguration konflikt
- Bei aktivem SSL: Zeilen 13-14 in `.htaccess` kommentieren
- Hostinger macht HTTPS-Redirect oft automatisch

## 📊 Performance

### Erwartete Performance-Metriken:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Lighthouse Score:** 85-95+

### Optimierungen aktiviert:
- ✅ Gzip/Brotli Kompression
- ✅ Browser-Caching (1 Jahr für Assets)
- ✅ Code-Splitting (React, UI, Animation, Icons)
- ✅ CSS & JS Minification
- ✅ Image-Optimization (WebP, AVIF)
- ✅ Lazy-Loading für Below-the-Fold Content

## 📞 Support

Bei Problemen mit dem Hosting:

1. **Hostinger Support:** 24/7 Live-Chat
2. **GitHub Issues:** Repository Issues
3. **Dokumentation:** README.md, TESTING_GUIDE.md

## 🔄 Updates & Wartung

### Regelmäßige Updates:
1. **Dependencies:** `npm update` (monatlich)
2. **Sitemap:** Bei neuen Seiten aktualisieren
3. **robots.txt:** Bei Struktur-Änderungen anpassen
4. **Security Headers:** Jährlich Review

### Build-Verifizierung vor Deployment:
```bash
npm run build
ls -la dist/.htaccess  # Muss existieren!
```

## ✅ Checkliste: Maximale Hostinger-Kompatibilität

- [x] `.htaccess` mit SPA-Routing
- [x] HTTPS-Weiterleitung
- [x] Gzip-Kompression
- [x] Browser-Caching
- [x] Sicherheits-Header
- [x] SEO-Optimierung (robots.txt, sitemap.xml)
- [x] PWA-Support (manifest.json)
- [x] Custom 404-Seite
- [x] Health Check Endpoint
- [x] PHP-Konfiguration
- [x] Meta-Tags (OG, Twitter)
- [x] UTF-8 Encoding
- [x] MIME-Types definiert
- [x] GitHub Actions Deployment
- [x] Build-Verifizierung

---

**Status:** ✅ Vollständig für Hostinger optimiert  
**Letzte Aktualisierung:** 2026-02-11  
**Version:** 1.0.0
