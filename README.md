# S&S Messebau GbR - Website

Professionelle, deutschsprachige Website für S&S Messebau GbR - Full-Service Messebauer aus Hückelhoven (NRW).

## 🎯 Features

✅ **Vollständige Website:**
- 9 Hauptseiten (Start, Leistungen, Branchen, Referenzen, Über uns, Ablauf, Nachhaltigkeit, Blog, Kontakt)
- Responsives Design (Mobile-First)
- SEO-optimiert
- DSGVO-konform

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

### Deployment

Die Website ist deploy-ready und läuft im Spark Runtime Environment.

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

- **[PRD.md](PRD.md)** - Product Requirements Document
- **[BANNER-KONFIGURATOR-KONZEPT.md](BANNER-KONFIGURATOR-KONZEPT.md)** - Banner-Konfigurator Konzept
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation Summary

## 🔐 Sicherheit

- GitHub-Authentifizierung für Admin-Bereich
- API Keys werden sicher in Browser-Storage gespeichert
- DSGVO-konforme Datenverarbeitung
- Sichere E-Mail-Versand über SendGrid/AWS SES

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
