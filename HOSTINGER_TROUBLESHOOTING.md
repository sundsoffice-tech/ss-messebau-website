# 🔧 Hostinger Deployment - Troubleshooting Guide

## Quick Diagnostics Checklist

Wenn die Website auf Hostinger nicht läuft, gehe diese Checkliste durch:

### ✅ 1. Build-Verifizierung (Lokal)

```bash
# Stelle sicher, dass der Build lokal funktioniert
npm ci
npm run build

# Verifiziere kritische Dateien
ls -la dist/index.html    # Muss existieren
ls -la dist/.htaccess     # Muss existieren
ls -la dist/assets/       # Muss Dateien enthalten
```

**Erwartetes Ergebnis:**
- ✅ Build erfolgreich ohne Fehler
- ✅ `dist/index.html` existiert
- ✅ `dist/.htaccess` existiert
- ✅ `dist/assets/` enthält CSS/JS Dateien

---

### ✅ 2. GitHub Actions Workflow-Status

**Prüfen:** https://github.com/sundsoffice-tech/ss-messebau-website/actions

**Fragen:**
- ✅ Ist der letzte Workflow-Run erfolgreich? (Grüner Haken)
- ✅ Wurde der `hostinger` Branch aktualisiert?
- ✅ Gibt es Fehlermeldungen in den Logs?

**Häufige Fehler:**

#### "index.html not found in dist/"
**Ursache:** Build schlägt fehl  
**Lösung:** Lokal `npm run build` ausführen und Fehler beheben

#### "Permission denied"
**Ursache:** Git-Schreibrechte fehlen  
**Lösung:** Repository Permissions → Actions müssen "Read and write" haben

---

### ✅ 3. Hostinger Branch-Verifizierung

```bash
# Branch 'hostinger' lokal auschecken
git fetch origin hostinger:hostinger
git checkout hostinger
ls -la
```

**Erwartetes Ergebnis:**
```
✅ index.html      - Im ROOT des Branches
✅ .htaccess       - Im ROOT des Branches
✅ assets/         - Ordner mit gehashten Dateien
✅ favicon.ico     - Favicon vorhanden
✅ manifest.json   - PWA Manifest
✅ robots.txt      - SEO
✅ sitemap.xml     - SEO
✅ 404.html        - Error Page
✅ health.json     - Health Check

❌ NICHT vorhanden: src/, node_modules/, package.json
```

**Falls falsch:**
- Branch `hostinger` manuell löschen
- GitHub Action nochmal ausführen (Push auf `main`)

---

### ✅ 4. Hostinger Git-Konfiguration

**In Hostinger hPanel prüfen:** Advanced → Git

#### 4.1 Repository-Einstellungen

| Setting | Erwarteter Wert |
|---------|----------------|
| **Repository URL** | `git@github.com:sundsoffice-tech/ss-messebau-website.git` |
| **Branch** | `hostinger` ⚠️ WICHTIG |
| **Path** | `public_html` oder leer |
| **Auto-Deploy** | ✅ Aktiviert |

**Häufiger Fehler:** Branch ist `main` statt `hostinger`  
→ **Lösung:** Auf Branch `hostinger` ändern!

#### 4.2 SSH Deploy Key

**Prüfen:**
1. Hostinger zeigt SSH Public Key
2. GitHub → Settings → Deploy keys → Key muss vorhanden sein
3. Key muss **Read-only** sein (kein Write-Zugriff)

**Falls fehlerhaft:**
1. Alten Key in GitHub löschen
2. Neuen Key von Hostinger kopieren
3. In GitHub als Deploy Key hinzufügen

#### 4.3 Manuelles Deployment testen

**In Hostinger hPanel:**
```
Git → Actions → Pull & Deploy
```

**Erwartetes Verhalten:**
- ✅ "Pulling from branch hostinger..."
- ✅ "Deployment successful"
- ✅ Dateien in `public_html/` aktualisiert

---

### ✅ 5. Website-Zugriff testen

**Öffne im Browser:**
```
https://www.sundsmessebau.de/
```

#### Test 1: Homepage lädt
**Erwartung:** Website wird angezeigt (kein "Coming Soon")

**Falls nicht:**
- Prüfe Browser-Konsole (F12) auf Fehler
- Prüfe ob HTML-Quelle korrekt ist (View Source)
- Leere Browser-Cache (Ctrl+Shift+R / Cmd+Shift+R)

#### Test 2: Assets laden
**Erwartung:** Keine 404-Fehler in Browser-Konsole

**Häufige 404-Fehler:**
```
❌ /assets/index-[hash].css not found
❌ /assets/index-[hash].js not found
```

**Ursache:** Assets nicht deployed oder falscher Path  
**Lösung:**
1. Prüfe ob `public_html/assets/` Dateien enthält
2. Prüfe Vite Base-URL: `vite.config.ts` → `base: '/'`

#### Test 3: SPA-Routing funktioniert
**Teste URLs:**
```
✅ https://www.sundsmessebau.de/
✅ https://www.sundsmessebau.de/#/leistungen
✅ https://www.sundsmessebau.de/#/kontakt
```

**Falls Seiten 404:**
- Prüfe ob `.htaccess` in `public_html/` vorhanden ist
- Prüfe Apache `mod_rewrite` ist aktiviert (meist standard)

#### Test 4: HTTPS-Redirect
**Test:**
```bash
curl -I http://www.sundsmessebau.de/
```

**Erwartung:**
```
HTTP/1.1 301 Moved Permanently
Location: https://www.sundsmessebau.de/
```

**Falls Redirect-Loop (zu viele Redirects):**
→ **Lösung:** `.htaccess` Lines 13-15 auskommentieren
```apache
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🚨 Häufige Probleme & Lösungen

### Problem 1: "Coming Soon" Seite statt Website

**Symptome:**
- Website zeigt Hostinger "Coming Soon" Placeholder
- Keine Fehler in GitHub Actions

**Ursachen & Lösungen:**

#### Ursache A: Git-Deployment nicht konfiguriert
**Lösung:**
1. Hostinger hPanel → Advanced → Git
2. Create Git Repository
3. Branch: `hostinger` (NICHT `main`)
4. SSH Key zu GitHub hinzufügen

#### Ursache B: Auto-Deploy nicht aktiviert
**Lösung:**
1. Hostinger → Git → Auto-deployment: ✅ ON
2. Manuell "Pull & Deploy" auslösen

#### Ursache C: Falscher Branch
**Lösung:**
1. Prüfe Branch-Setting in Hostinger (sollte `hostinger` sein)
2. Ändere von `main` zu `hostinger`
3. Pull & Deploy manuell auslösen

---

### Problem 2: CSS/JS Dateien laden nicht (404)

**Symptome:**
- Website lädt, aber unstyled (weißer Hintergrund, keine Formatierung)
- Browser-Konsole zeigt 404 für `/assets/index-*.css`

**Ursache:** Assets wurden nicht deployed

**Lösung:**
```bash
# 1. Prüfe ob Assets im hostinger Branch sind
git checkout hostinger
ls -la assets/

# 2. Prüfe ob Assets auf Server sind
# In Hostinger File Manager: public_html/assets/

# 3. Falls leer → Manuell deployen
# Hostinger → Git → Pull & Deploy
```

**Alternative Ursache:** Base-URL falsch

**Lösung:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/',  // Muss '/' sein für Root-Deployment
});
```

---

### Problem 3: Direct URLs funktionieren nicht

**Symptome:**
- `https://domain.de/` funktioniert ✅
- `https://domain.de/#/leistungen` funktioniert ✅
- `https://domain.de/leistungen` zeigt 404 ❌

**Ursache:** `.htaccess` wird nicht geladen oder fehlt

**Lösung:**

#### 1. Prüfe ob .htaccess existiert
```bash
# Im Hostinger File Manager oder via SSH
ls -la public_html/.htaccess
```

**Falls nicht vorhanden:**
```bash
# Lokal prüfen
ls -la dist/.htaccess  # Muss nach Build existieren

# Falls fehlt → public/.htaccess prüfen
ls -la public/.htaccess
```

#### 2. Prüfe .htaccess Permissions
```bash
# Permissions sollten 644 sein
chmod 644 public_html/.htaccess
```

#### 3. Prüfe mod_rewrite
**Info:** Auf Hostinger ist `mod_rewrite` normalerweise aktiviert.

**Test:**
```bash
# In .htaccess erste Zeile ändern zu:
RewriteEngine On
RewriteRule ^test$ /index.html [L]

# Dann testen:
https://domain.de/test
# Sollte Homepage zeigen
```

---

### Problem 4: Infinite Redirect (zu viele Weiterleitungen)

**Symptome:**
- Browser zeigt "ERR_TOO_MANY_REDIRECTS"
- Website lädt gar nicht

**Ursache:** HTTPS-Redirect Konflikt

**Lösung:**

#### Option A: HTTPS-Redirect in .htaccess deaktivieren
```apache
# In public/.htaccess Lines 13-15 auskommentieren:
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### Option B: Alternative HTTPS-Check
```apache
# Ersetze Lines 13-14 mit:
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Warum:** Hostinger verwendet oft Reverse Proxy mit eigener HTTPS-Terminierung.

---

### Problem 5: Deployment erfolgreich, aber alte Version sichtbar

**Symptome:**
- GitHub Action erfolgreich ✅
- Branch `hostinger` aktualisiert ✅
- Website zeigt alte Version ❌

**Ursachen & Lösungen:**

#### Ursache A: Browser-Cache
**Lösung:**
- Hard Reload: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Private/Incognito Window öffnen
- Browser-Cache komplett leeren

#### Ursache B: Hostinger-Cache
**Lösung:**
1. Hostinger hPanel → Website → Clear Cache
2. Warte 2-3 Minuten
3. Erneut testen

#### Ursache C: CDN-Cache (falls aktiviert)
**Lösung:**
1. Hostinger → CDN Settings → Purge Cache
2. Warte 5-10 Minuten
3. Erneut testen

---

### Problem 6: GitHub Action schlägt fehl

#### Fehler: "index.html not found in dist/"

**Ursache:** Build schlägt fehl

**Lösung:**
```bash
# Lokal reproduzieren
npm ci
npm run build

# Falls Fehler → Beheben
# Dann push auf main
```

#### Fehler: "Permission denied while writing objects"

**Ursache:** GitHub Actions hat keine Schreibrechte

**Lösung:**
1. GitHub → Settings → Actions → General
2. Workflow permissions → "Read and write permissions" ✅
3. Workflow erneut ausführen

#### Fehler: "remote: Support for password authentication was removed"

**Ursache:** HTTPS statt SSH für Git

**Lösung:**
```yaml
# In .github/workflows/deploy-hostinger.yml
# Sollte bereits korrekt sein - keine Änderung nötig
# Workflow nutzt GITHUB_TOKEN automatisch
```

---

## 🔍 Debugging-Tools

### 1. Browser DevTools

**Öffnen:** F12 oder Rechtsklick → Inspect

**Wichtige Tabs:**

#### Console Tab
- Zeigt JavaScript-Fehler
- Zeigt 404-Fehler für fehlende Assets

#### Network Tab
- Zeigt alle HTTP-Requests
- Filter auf "All" für komplette Übersicht
- Rote Einträge = Fehler

**Was zu prüfen:**
- ✅ index.html lädt (Status 200)
- ✅ CSS-Dateien laden (Status 200)
- ✅ JS-Dateien laden (Status 200)
- ❌ Keine 404-Fehler
- ❌ Keine 500-Fehler

#### Application Tab
- Service Worker Status (falls PWA)
- LocalStorage (Admin-Config)

### 2. cURL Commands

**Homepage testen:**
```bash
curl -I https://www.sundsmessebau.de/
```

**HTTPS-Redirect testen:**
```bash
curl -I http://www.sundsmessebau.de/
```

**Compression testen:**
```bash
curl -H "Accept-Encoding: gzip" -I https://www.sundsmessebau.de/
# Sollte enthalten: Content-Encoding: gzip
```

**Health Check:**
```bash
curl https://www.sundsmessebau.de/health.json
# Sollte JSON zurückgeben: {"status":"ok"}
```

### 3. Hostinger File Manager

**Zugriff:** hPanel → Files → File Manager

**Zu prüfen:**
```
public_html/
├── index.html          ✅ Muss existieren
├── .htaccess           ✅ Muss existieren
├── assets/             ✅ Muss Dateien enthalten
│   ├── index-*.css
│   ├── index-*.js
│   └── *.png
├── favicon.ico
├── manifest.json
├── robots.txt
└── sitemap.xml
```

### 4. SSH-Zugriff (Optional)

**Falls SSH verfügbar:**

```bash
ssh username@server.hostinger.com

# Navigiere zu Website
cd public_html/

# Prüfe Dateien
ls -la

# Prüfe .htaccess
cat .htaccess

# Prüfe Permissions
ls -la | grep -E "(index.html|.htaccess)"
# Sollte 644 sein
```

---

## ✅ Finale Verifikation nach Fix

Nach jedem Fix diese Checkliste durchgehen:

### Build & Deployment
- [ ] Lokal `npm run build` erfolgreich
- [ ] GitHub Action erfolgreich (grüner Haken)
- [ ] Branch `hostinger` aktualisiert
- [ ] Hostinger Auto-Deploy ausgelöst

### Website-Zugriff
- [ ] Homepage lädt: https://www.sundsmessebau.de/
- [ ] Keine 404-Fehler in Browser-Konsole
- [ ] CSS/JS laden korrekt
- [ ] Bilder werden angezeigt

### Funktionalität
- [ ] Navigation funktioniert (alle Links)
- [ ] Hash-Routing funktioniert (/#/leistungen etc.)
- [ ] Kontaktformular lädt
- [ ] Banner-Konfigurator lädt

### SEO & Performance
- [ ] robots.txt erreichbar: /robots.txt
- [ ] sitemap.xml erreichbar: /sitemap.xml
- [ ] Favicon wird angezeigt
- [ ] HTTPS-Redirect funktioniert (HTTP → HTTPS)
- [ ] Keine Redirect-Loops

### Sicherheit
- [ ] HTTPS aktiviert (grünes Schloss)
- [ ] Security Headers vorhanden (X-Frame-Options, etc.)
- [ ] Keine sensiblen Dateien erreichbar (/package.json → 403)

---

## 📞 Weitere Hilfe

### Wenn nichts funktioniert:

1. **GitHub Issues prüfen:**
   - https://github.com/sundsoffice-tech/ss-messebau-website/issues

2. **Hostinger Support kontaktieren:**
   - 24/7 Live-Chat im hPanel
   - Fragen nach:
     - mod_rewrite Status
     - .htaccess Support
     - Git-Deployment Logs

3. **Logs anschauen:**
   - **GitHub Actions:** Actions Tab → Letzte Run → Logs
   - **Hostinger:** Advanced → Error Logs
   - **Browser:** DevTools → Console

---

**Letzte Aktualisierung:** 2026-02-12  
**Status:** ✅ Produktionsbereit
