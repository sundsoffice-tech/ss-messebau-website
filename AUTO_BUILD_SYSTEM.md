# Auto-Build System für Hostinger Deployment

## 🎯 Übersicht

Dieses Repository verwendet ein **automatisches Build-System**, das bei jedem Push auf den `main` Branch automatisch den `dist/` Ordner baut und committed. Dadurch kann Hostinger direkt vom `main` Branch deployen, ohne dass manuelle Build-Schritte erforderlich sind.

## ✨ Features

- ✅ **Automatischer Build**: Bei jedem Push auf `main` wird automatisch `npm run build` ausgeführt
- ✅ **Automatisches Commit**: Der gebaute `dist/` Ordner wird automatisch zurück zum `main` Branch committed
- ✅ **Endlosschleifen-Schutz**: `[skip ci]` in Commit-Messages verhindert Endlosschleifen
- ✅ **Change Detection**: Nur wenn sich etwas geändert hat, wird committed
- ✅ **Sofortiges Deployment**: Hostinger erkennt den Push und deployed automatisch

## 🔄 Workflow-Ablauf

```
1. Developer pusht Code zu `main`
   ↓
2. GitHub Actions triggert auto-build.yml
   ↓
3. npm run build wird ausgeführt
   ↓
4. dist/ Ordner wird zu `main` committed (mit [skip ci])
   ↓
5. Hostinger erkennt den Push und deployed automatisch
   ↓
6. Website ist live mit allen Assets
```

## 📋 Implementierte Workflows

### 1. `.github/workflows/auto-build.yml` (NEU)

**Zweck**: Automatisches Bauen und Committen des `dist/` Ordners

**Trigger**:
- Push auf `main` Branch
- Manuell via `workflow_dispatch`

**Verhindert Endlosschleifen durch**:
- `paths-ignore: ['dist/**']` - Ignoriert Änderungen im dist/ Ordner
- `[skip ci]` in der Commit-Message

**Schritte**:
1. Checkout des Codes
2. Node.js Setup (v20)
3. Dependencies installieren (`npm ci`)
4. Build ausführen (`npm run build`)
5. Build-Output verifizieren
6. Änderungen prüfen
7. Falls Änderungen: Commit und Push zu `main`

### 2. `.github/workflows/deploy-hostinger.yml` (OPTIONAL)

**Status**: Jetzt optional, da `auto-build.yml` den `dist/` Ordner bereits zu `main` committed

**Zweck**: Backup-Deployment zum separaten `hostinger` Branch

**Verwendung**: Kann deaktiviert werden, wenn Hostinger direkt von `main` deployed

## 🛠️ Änderungen am Repository

### 1. `.gitignore` Update

```gitignore
# dist/ ist NICHT mehr ignoriert
node_modules
# dist - IMPORTANT: dist/ is NOT ignored - needed for Hostinger deployment
dist-ssr
```

**Wichtig**: `dist/` wird jetzt committed und ist Teil der Git-History

### 2. Build-Artefakte im Repository

Der `dist/` Ordner enthält:
- `index.html` - Haupt-HTML-Datei
- `assets/` - Gebündelte JS/CSS Dateien
- `manifest.json` - PWA Manifest
- `favicon.ico` - Website Icon
- `.htaccess` - Apache Konfiguration
- `robots.txt`, `sitemap.xml` - SEO Dateien
- `404.html` - Custom Error Page
- `health.json` - Health Check Endpoint

## 🌐 Hostinger Konfiguration

### Nach dem Merge dieses PRs:

#### Option A: Deploy direkt von `main` (EMPFOHLEN)

1. **Git Integration in Hostinger**:
   - Repository: `https://github.com/sundsoffice-tech/ss-messebau-website.git`
   - Branch: `main`
   - Deploy Path: `public_html`
   - **Wichtig**: Stelle sicher, dass Hostinger die notwendigen Git-Credentials hat (SSH-Key oder Personal Access Token)

2. **Website Root**:
   - Setze Website Root auf `public_html/dist`
   - Oder konfiguriere Git-Deploy, um `dist/*` nach `public_html/` zu kopieren

3. **Auto-Deploy**:
   - Aktiviere "Auto-deploy on push" in Hostinger
   - Hostinger pullt automatisch bei jedem Push

#### Option B: Deploy vom `hostinger` Branch (wie bisher)

- Behalte die aktuelle Konfiguration
- Der `deploy-hostinger.yml` Workflow funktioniert weiterhin
- `dist/` wird zum separaten `hostinger` Branch gepusht

## ✅ Erwartetes Verhalten

### Erfolgreicher Workflow:

1. ✅ Code-Änderung wird zu `main` gepusht
2. ✅ `auto-build.yml` wird getriggert
3. ✅ Build läuft erfolgreich durch
4. ✅ `dist/` wird automatisch committed (mit `[skip ci]`)
5. ✅ Hostinger erkennt den Push
6. ✅ Website deployed automatisch
7. ✅ Alle Assets laden korrekt
8. ✅ Keine MIME-Type Fehler
9. ✅ `manifest.json` und `favicon.ico` verfügbar

### Verhinderte Probleme:

- ❌ Keine `/src/main.tsx` mit `text/plain` MIME-Type mehr
- ❌ Keine 404 Fehler für `/favicon.ico`
- ❌ Keine 404 Fehler für `/manifest.json`
- ❌ Keine Endlosschleifen durch Build-Commits

## 🧪 Testing

### Lokal testen:

```bash
# Build ausführen
npm run build

# Prüfen, ob dist/ erstellt wurde
ls -lah dist/

# Prüfen, ob index.html existiert
test -f dist/index.html && echo "✅ Build erfolgreich"
```

### Workflow testen:

1. Mache eine kleine Änderung im Code
2. Pushe zu `main` (oder erstelle einen PR)
3. Gehe zu GitHub Actions → "Auto-Build and Commit dist"
4. Prüfe, ob der Workflow erfolgreich durchläuft
5. Prüfe, ob ein neuer Commit mit `🤖 Auto-build: Update dist/ [skip ci]` erstellt wurde
6. Prüfe, ob `dist/` aktualisiert wurde

### Deployment testen:

1. Warte, bis Hostinger den neuen Commit pulled
2. Öffne `https://sunds-messebau.de`
3. Prüfe Browser-Konsole auf Fehler
4. Prüfe, ob alle Assets laden (keine 404-Fehler)
5. Prüfe, ob PWA-Features funktionieren

## 📊 Vorteile des neuen Systems

### ✅ Vorteile:

1. **Einfacheres Deployment**: Kein manueller Build-Schritt nötig
2. **Sofortige Updates**: Änderungen sind sofort nach dem Push live
3. **Keine MIME-Type Fehler**: Hostinger served nur gebaute Dateien
4. **Konsistenz**: Jeder Commit hat eine funktionsfähige Build-Version
5. **Transparenz**: Build-Artefakte sind versioniert

### ⚠️ Nachteile:

1. **Größere Repository-Größe**: `dist/` Ordner ist in Git-History
2. **Mehr Commits**: Jeder Build erstellt einen zusätzlichen Commit
3. **Git-History**: Build-Änderungen verschmutzen die History

### 💡 Alternativen:

Wenn die größere Repository-Größe ein Problem ist:
1. Verwende den separaten `hostinger` Branch (aktueller Workflow)
2. Nutze GitHub Pages mit automatischem Build
3. Verwende ein separates Deployment-Repository
4. Nutze Hostinger's Node.js Build-Features (falls verfügbar)

## 🔧 Wartung

### Workflow deaktivieren:

Um den Auto-Build zu deaktivieren:
1. Lösche `.github/workflows/auto-build.yml`
2. Oder kommentiere den `on:` Trigger aus

### Zurück zum alten System:

1. Füge `dist/` wieder zu `.gitignore` hinzu
2. Deaktiviere `auto-build.yml`
3. Nutze nur `deploy-hostinger.yml` für den `hostinger` Branch
4. Konfiguriere Hostinger, um vom `hostinger` Branch zu deployen

## 📝 Commit-Konventionen

### Auto-Build Commits:

```
🤖 Auto-build: Update dist/ [skip ci]
```

- Emoji: 🤖 für automatische Commits
- Präfix: "Auto-build:"
- Suffix: `[skip ci]` verhindert Endlosschleife

### Manuelle Commits:

Wie gewohnt - folge den bestehenden Commit-Konventionen

## 🆘 Troubleshooting

### Problem: Workflow läuft nicht

**Lösung**:
1. Prüfe, ob `paths-ignore` korrekt konfiguriert ist
2. Prüfe GitHub Actions Permissions
3. Prüfe, ob `GITHUB_TOKEN` verfügbar ist

### Problem: Endlosschleife

**Lösung**:
1. Prüfe, ob `[skip ci]` in der Commit-Message ist
2. Prüfe, ob `paths-ignore: ['dist/**']` konfiguriert ist
3. Deaktiviere den Workflow temporär

### Problem: Build schlägt fehl

**Lösung**:
1. Prüfe Build-Logs in GitHub Actions
2. Teste Build lokal: `npm run build`
3. Prüfe, ob alle Dependencies installiert sind
4. Prüfe TypeScript-Fehler

### Problem: Hostinger deployed nicht

**Lösung**:
1. Prüfe Hostinger Git-Integration
2. Prüfe, ob Auto-Deploy aktiviert ist
3. Prüfe Hostinger-Logs
4. Triggere manuellen Pull in Hostinger

## 📚 Weitere Dokumentation

- [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md) - Allgemeine Deployment-Anleitung
- [`HOSTINGER_GIT_SETUP.md`](./HOSTINGER_GIT_SETUP.md) - Git-Setup für Hostinger
- [`.github/workflows/auto-build.yml`](./.github/workflows/auto-build.yml) - Workflow-Konfiguration

## 🎉 Zusammenfassung

Das neue Auto-Build-System macht das Deployment zu Hostinger so einfach wie möglich:

1. **Push Code** → GitHub Actions baut automatisch
2. **Commit & Push** → Hostinger deployed automatisch
3. **Live** → Website ist sofort verfügbar

Keine manuellen Schritte, keine MIME-Type Fehler, keine fehlenden Assets. 🚀
