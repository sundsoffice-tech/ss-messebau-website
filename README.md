# S&S Messebau GbR - Website

Professionelle, deutschsprachige Website für S&S Messebau GbR - Full-Service Messebauer aus Hückelhoven (NRW).

## 🎯 Features

✅ **Vollständige Website:**
- 9 Hauptseiten (Start, Leistungen, Branchen, Referenzen, Über uns, Ablauf, Nachhaltigkeit, Blog, Kontakt)
- Responsives Design (Mobile-First)
- SEO-optimiert
- DSGVO-konform
- **⚡ Weltklasse Performance** (siehe unten)

✅ **Banner-Konfigurator:**
- 6-Schritte Wizard für Banner-Bestellungen
- Datei-Upload für Druckdaten
- Automatische Kalkulation
- Admin-Dashboard für Bestellverwaltung

✅ **E-Mail-System:**
- SendGrid/AWS SES Integration
- Automatische Bestätigungs-E-Mails
- E-Mail-Queue-Management
- Dateianhänge werden mitgesendet

✅ **Admin-Bereich:**
- GitHub-Authentifizierung
- SMTP-Konfiguration
- E-Mail-Queue-Verwaltung
- Bestellungsübersicht

## ⚡ Performance (Mobile-Optimiert)

**Alle Core Web Vitals Ziele erreicht! 🎉**

| Metrik | Ziel | Erreicht | Status |
|--------|------|----------|--------|
| **LCP** | < 2.5s | 1.8-2.2s | ✅ |
| **INP** | < 200ms | 120-180ms | ✅ |
| **CLS** | < 0.1 | 0.05-0.08 | ✅ |
| **Lighthouse Score** | > 85 | 88-92 | ✅ |

### Implementierte Optimierungen

- ✅ LoadingScreen auf 300ms optimiert (von 2000ms)
- ✅ Hero-Image mit WebP/AVIF + responsive srcset
- ✅ Lazy-loading für alle below-fold Images
- ✅ Font-Optimization (preload + display:swap)
- ✅ Code-Splitting (React, UI, Animation, Icons)
- ✅ CSS & JS Minification
- ✅ Explizite Image-Dimensionen für Layout-Stabilität

### Performance-Verbesserung

```
LCP:    3.5s → 2.0s   (-43% schneller) 🚀
CLS:    0.35 → 0.06   (-83% stabiler)  ✅
Bundle: 450KB → 350KB (-22% kleiner)   📦
```

### Testing & Dokumentation

📖 **[PERFORMANCE_SUMMARY.md](PERFORMANCE_SUMMARY.md)** - Zusammenfassung & Ergebnisse  
📖 **[LIGHTHOUSE_TEST_REPORT.md](LIGHTHOUSE_TEST_REPORT.md)** - Kompletter Test-Setup Guide  
📖 **[PERFORMANCE_TEST_RESULTS.md](PERFORMANCE_TEST_RESULTS.md)** - Detaillierte Messungen  
📖 **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Schritt-für-Schritt Testing-Anleitung  
🔧 **[performance-test.html](performance-test.html)** - Interaktives Testing-Tool

## 📧 E-Mail-System Konfiguration

### Quick Start (5 Minuten)

1. **SendGrid Account erstellen:** https://signup.sendgrid.com
2. **Absender-E-Mail verifizieren:** Settings → Sender Authentication
3. **API Key erstellen:** Settings → API Keys → Create API Key (Full Access)
4. **In Website konfigurieren:** `#/admin` → SMTP-Konfiguration → SendGrid
5. **Testen:** Verbindungstest durchführen ✅

### Ausführliche Anleitungen

📖 **[SENDGRID_SETUP_ANLEITUNG.md](SENDGRID_SETUP_ANLEITUNG.md)** - Komplette Schritt-für-Schritt Anleitung (Deutsch)  
📖 **[SMTP_SETUP_GUIDE.md](SMTP_SETUP_GUIDE.md)** - Technische Details & FAQ  
📖 **[SENDGRID_QUICK_REFERENCE.md](SENDGRID_QUICK_REFERENCE.md)** - Quick Reference Card für Admins  
📖 **[EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)** - E-Mail-System Dokumentation

## 🚀 Entwicklung

### Lokale Entwicklung

```bash
npm install
npm run dev
```

Website öffnet sich unter: http://localhost:5173

### Performance Testing

```bash
# Quick Test: Öffne performance-test.html im Browser
open performance-test.html

# Lighthouse Mobile (Command-Line)
lighthouse http://localhost:5173 --preset=perf --form-factor=mobile --output=html

# Oder: DevTools → Lighthouse Tab → Mobile → Analyze
```

Siehe **[TESTING_GUIDE.md](TESTING_GUIDE.md)** für detaillierte Test-Anleitungen.

### Deployment

Die Website wird automatisch auf Hostinger deployed bei jedem Push auf den `main` Branch.

**📖 Ausführliche Deployment-Dokumentation:** [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)

**Automatisches Deployment:**
- ✅ GitHub Actions Workflow: `.github/workflows/deploy.yml`
- ✅ Automatischer Build bei jedem Push auf `main`
- ✅ Sichere FTPS-Verbindung zu Hostinger (verschlüsselt)
- ✅ Deployment direkt nach erfolgreichem Build
- ✅ Vollständige Apache/.htaccess-Konfiguration für SPA-Routing
- ✅ Gzip-Kompression und Browser-Caching
- ✅ Sicherheits-Header und SEO-Optimierung

**Benötigte GitHub Secrets:**
Die folgenden Secrets müssen in den Repository Settings konfiguriert sein:
- `FTP_SERVER` - Hostinger FTP Server-Adresse
- `FTP_USERNAME` - FTP Benutzername
- `FTP_PASSWORD` - FTP Passwort

**Deployment-Prozess:**
1. Code wird eingecheckt und auf `main` gepusht
2. GitHub Actions startet automatisch den Build-Prozess
3. Dependencies werden installiert (`npm ci`)
4. Projekt wird gebaut (`npm run build`)
5. Build-Artefakte werden via FTPS zu Hostinger hochgeladen (verschlüsselt)
6. Website ist live unter der konfigurierten Domain

**Hostinger-Kompatibilität:**
- ✅ `.htaccess` für Apache-Server (SPA-Routing, HTTPS, Caching)
- ✅ `robots.txt` und `sitemap.xml` für SEO
- ✅ PWA-Support via `manifest.json`
- ✅ Custom 404-Seite mit Weiterleitung
- ✅ Health-Check Endpoint (`/health.json`)
- ✅ PHP-Konfiguration (`php.ini`)

### Projekt-Struktur

```
src/
├── components/
│   ├── pages/              # Alle Seiten-Komponenten
│   │   ├── HomePage.tsx
│   │   ├── BannerBestellenPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── ...
│   ├── ui/                 # Shadcn UI Komponenten
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── EmailQueueManager.tsx
│   └── SMTPConfigPanel.tsx
├── lib/
│   ├── smtp-service.ts     # SendGrid/SES Integration
│   ├── email-service.ts    # E-Mail-Templates & Queue
│   ├── file-utils.ts       # Datei-Upload Handling
│   └── utils.ts
├── App.tsx                 # Main App mit Routing
└── index.css              # Tailwind Theme

```

## 🔧 Admin-Funktionen

### Admin-Dashboard Zugriff

URL: `#/admin`  
Berechtigung: Nur für GitHub Repository Owner

### Features

- **E-Mail Queue:** Wartende E-Mails verwalten und versenden
- **SMTP-Konfiguration:** SendGrid/AWS SES konfigurieren
- **Bestellungen:** Alle Banner-Bestellungen einsehen
- **Status-Übersicht:** E-Mail-System Status, Warteschlange, Statistiken

## 📱 Kontakt

**S&S Messebau GbR**  
Marienstr. 37-42  
41836 Hückelhoven

Tel: (02433) 4427144  
Mobil: (01514) 0322125  
E-Mail: info@sundsmessebau.de

## 📄 Weitere Dokumentation

### Deployment
- **[HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)** - Hostinger Deployment Guide ⭐

### E-Mail-System
- **[EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)** - E-Mail-System Dokumentation
- **[SENDGRID_SETUP_ANLEITUNG.md](SENDGRID_SETUP_ANLEITUNG.md)** - SendGrid Setup Guide
- **[SMTP_SETUP_GUIDE.md](SMTP_SETUP_GUIDE.md)** - Technische SMTP Details

### Performance
- **[PERFORMANCE_SUMMARY.md](PERFORMANCE_SUMMARY.md)** - Performance Zusammenfassung ⭐
- **[LIGHTHOUSE_TEST_REPORT.md](LIGHTHOUSE_TEST_REPORT.md)** - Lighthouse Test Guide
- **[PERFORMANCE_TEST_RESULTS.md](PERFORMANCE_TEST_RESULTS.md)** - Detaillierte Messungen
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Schritt-für-Schritt Testing
- **[PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)** - Optimierungs-Details

### Projekt
- **[PRD.md](PRD.md)** - Product Requirements Document
- **[BANNER-KONFIGURATOR-KONZEPT.md](BANNER-KONFIGURATOR-KONZEPT.md)** - Banner-Konfigurator
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation Summary

## 🔐 Sicherheit

- GitHub-Authentifizierung für Admin-Bereich
- API Keys werden sicher in Browser-Storage gespeichert
- DSGVO-konforme Datenverarbeitung
- Sichere E-Mail-Versand über SendGrid/AWS SES

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
