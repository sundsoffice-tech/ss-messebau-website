# 🚀 Hostinger Git-Deployment - Schnellanleitung

## Zusammenfassung

✅ **Problem gelöst:** Repository ist jetzt für Hostinger Git-Deployment optimiert!

Nach jedem Push auf `main` wird automatisch:
1. Das Projekt gebaut (`npm run build`)
2. Der Build-Output auf Branch `hostinger` gepusht
3. Hostinger deployed von Branch `hostinger` (wenn konfiguriert)

## 📋 Hostinger-Konfiguration (Einmalig)

### Schritt 1: In Hostinger hPanel

1. **Navigieren zu Git-Verwaltung:**
   ```
   hPanel → Advanced → Git
   ```

2. **Neues Git-Repository erstellen:**
   - Klicke auf `Create Git Repository`

### Schritt 2: Repository-Einstellungen

Trage folgende Werte ein:

| Feld | Wert |
|------|------|
| **Repository URL** | `git@github.com:sundsoffice-tech/ss-messebau-website.git` |
| **Branch** | `hostinger` |
| **Deployment Path** | `public_html` (oder leer für Root) |

### Schritt 3: SSH-Key Setup

1. **SSH-Key kopieren:**
   - Hostinger zeigt dir einen generierten SSH Public Key
   - Kopiere den gesamten Key (beginnt mit `ssh-rsa` oder `ssh-ed25519`)

2. **Deploy Key in GitHub hinzufügen:**
   ```
   GitHub → Repository → Settings → Deploy keys → Add deploy key
   ```
   
   - **Title:** `Hostinger Deployment`
   - **Key:** [Paste den SSH Key von Hostinger]
   - **Write access:** ❌ NICHT aktivieren (nur Read nötig)
   - Klicke `Add key`

### Schritt 4: Auto-Deployment aktivieren

In Hostinger:
- ✅ Aktiviere `Auto-deployment`
- ✅ (Optional) Aktiviere `Build on deployment` → NEIN (bereits gebaut)

### Schritt 5: Erstes Deployment

**Option A: Manuell in Hostinger auslösen**
```
Git → Actions → Pull & Deploy
```

**Option B: Push auf main (automatisch)**
```bash
git push origin main
# Wartet auf GitHub Action
# Branch 'hostinger' wird automatisch aktualisiert
# Hostinger deployed automatisch
```

## 🔍 Verifikation

### 1. GitHub Action überprüfen

Nach Push auf `main`:
```
GitHub → Actions → "Deploy to Hostinger (Git)"
```

✅ Sollte erfolgreich durchlaufen (grüner Haken)

### 2. Branch 'hostinger' überprüfen

```bash
git fetch origin hostinger:hostinger
git checkout hostinger
ls -la
```

**Erwartetes Ergebnis:**
- `index.html` ist im Root
- `.htaccess` ist im Root
- `assets/` Ordner vorhanden
- **KEIN** `src/` oder `node_modules/`

### 3. Website testen

Nach Deployment in Hostinger:
```
https://www.sunds-messebau.de/
```

✅ Website sollte laden  
✅ Navigation sollte funktionieren  
✅ Assets sollten laden

## 🔧 Workflow-Details

### Automatischer Prozess

```mermaid
graph LR
    A[Push auf main] --> B[GitHub Action startet]
    B --> C[npm ci]
    C --> D[npm run build]
    D --> E[Verifikation index.html]
    E --> F[Push zu 'hostinger' Branch]
    F --> G[Hostinger deployed automatisch]
```

### Was passiert bei jedem Push auf `main`:

1. **Build-Phase:**
   - Dependencies installieren (`npm ci`)
   - TypeScript kompilieren
   - Vite Build ausführen
   - Output: `dist/` Ordner

2. **Verifikation:**
   - Prüft ob `dist/index.html` existiert
   - Prüft ob `.htaccess` existiert
   - Bei Fehler: Workflow bricht ab ❌

3. **Deployment:**
   - Erstellt/aktualisiert Branch `hostinger`
   - Löscht alte Inhalte im Branch
   - Kopiert `dist/*` ins Branch-Root
   - Force-Push zu `origin/hostinger`

4. **Hostinger reagiert:**
   - Erkennt Update auf Branch `hostinger`
   - Pullt automatisch neue Dateien
   - Deployed zu `public_html/`

## 📁 Dateistruktur

### Vor dem Merge (aktuell):

```
Repository Root (main):
├── .github/
│   └── workflows/
│       ├── deploy.yml              # FTP-Deployment (Legacy)
│       └── deploy-hostinger.yml    # Git-Deployment (NEU) ⭐
├── src/                            # Quellcode
├── public/                         # Statische Assets
├── dist/                           # Build-Output (gitignored)
├── index.html                      # Source HTML
├── package.json
├── vite.config.ts
└── HOSTINGER_GIT_SETUP.md          # Diese Anleitung
```

### Nach dem Workflow (Branch 'hostinger'):

```
Branch 'hostinger' Root:
├── .htaccess                       # Im Root! ✅
├── index.html                      # Im Root! ✅
├── 404.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── health.json
├── php.ini
└── assets/
    ├── index-[hash].css
    ├── index-[hash].js
    └── ...
```

## ⚠️ Wichtige Hinweise

### DO's ✅

- ✅ Arbeite normal auf `main` Branch
- ✅ Pushe auf `main` für Deployment
- ✅ Nutze Pull Requests für Code-Reviews
- ✅ Vertraue auf den automatischen Prozess

### DON'Ts ❌

- ❌ **NICHT** manuell in Branch `hostinger` arbeiten
- ❌ **NICHT** direkt auf `hostinger` pushen
- ❌ **NICHT** `hostinger` Branch lokal editieren
- ❌ **NICHT** `dist/` ins Git committen

**Grund:** Branch `hostinger` wird vom Workflow komplett überschrieben!

## 🐛 Troubleshooting

### Problem: Website zeigt "Coming Soon" oder ist leer

**Ursache:** Hostinger hat noch nicht von Branch `hostinger` deployed

**Lösung:**
1. Prüfe ob Branch `hostinger` existiert: `git fetch && git branch -r | grep hostinger`
2. Prüfe GitHub Action Status: Erfolgreich? ✅
3. In Hostinger: Git → Pull & Deploy manuell auslösen
4. Warte 2-3 Minuten für Deployment

### Problem: GitHub Action schlägt fehl

**Fehler:** "index.html not found in dist/"

**Lösung:**
```bash
# Lokal testen:
npm ci
npm run build
ls -la dist/index.html  # Muss existieren!
```

Falls lokal nicht gebaut wird:
- Prüfe `package.json` → `scripts.build` Befehl
- Prüfe `vite.config.ts` Konfiguration

### Problem: Assets laden nicht (404 auf CSS/JS)

**Ursache:** Falsche Base-URL in Vite

**Lösung:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/',  // Muss '/' sein für Hostinger Root
  // ...
});
```

### Problem: SSH-Key Fehler in Hostinger

**Fehler:** "Permission denied (publickey)"

**Lösung:**
1. SSH-Key in GitHub Deploy Keys nochmal prüfen
2. Key muss **Read-Only** sein (kein Write-Access)
3. Key muss vollständig kopiert sein (inkl. `ssh-rsa` Prefix)

## 📞 Support

### Bei Problemen:

1. **GitHub Actions Logs prüfen:**
   ```
   GitHub → Actions → Letzte Run → Logs anschauen
   ```

2. **Hostinger Git-Status prüfen:**
   ```
   hPanel → Git → Repository Status
   ```

3. **Branch 'hostinger' manuell prüfen:**
   ```bash
   git checkout hostinger
   git pull origin hostinger
   ls -la  # index.html im Root?
   ```

## ✅ Erfolgs-Checkliste

Nach dem Setup solltest du:

- [x] GitHub Action `.github/workflows/deploy-hostinger.yml` existiert
- [x] Hostinger Git-Repository konfiguriert
- [x] SSH Deploy Key in GitHub hinzugefügt
- [x] Branch `hostinger` existiert (nach erstem Push)
- [x] Auto-Deployment in Hostinger aktiviert
- [x] Website unter Domain erreichbar
- [x] Assets laden korrekt
- [x] SPA-Routing funktioniert (/#/leistungen etc.)

## 🎯 Zusammenfassung

**Vorher:**
- ❌ Build-Output in `dist/` (nicht im Repo-Root)
- ❌ Hostinger konnte nicht direkt deployen
- ❌ Manuelle FTP-Uploads nötig

**Nachher:**
- ✅ Branch `hostinger` mit `index.html` im Root
- ✅ Automatisches Deployment via Git
- ✅ Keine FTP-Credentials nötig
- ✅ Automatische Updates bei jedem Push auf `main`

---

**Erstellt:** 2026-02-11  
**Workflow-Datei:** `.github/workflows/deploy-hostinger.yml`  
**Status:** ✅ Produktionsbereit
