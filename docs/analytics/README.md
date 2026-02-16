# Analytics & Event-Tracking – S&S Messebau

## Überblick

First-Party Event-Tracking-Pipeline für sunds-messebau.de.
Alle Daten werden auf eigenem Server (Hostinger) gespeichert – keine externen Tracking-Tools.

## Architektur

```
Browser (React)          →  PHP Backend (Hostinger)    →  SQLite DB
─────────────────           ─────────────────────          ──────────
analytics-tracker.ts        collect.php                    analytics_events
 ↓ consent check            analytics-config.php           analytics_config
 ↓ event queue              analytics-export.php
 ↓ batch POST               analytics-cleanup.php
                            analytics-status.php
```

## Consent / DSGVO

- Events werden **nur** gesendet wenn `isTrackingAllowed() === true`
- Consent wird über die bestehende `CookieConsent.tsx` Komponente eingeholt
- Consent-Status gespeichert in `localStorage` (`ss_cookie_consent`)
- Tracking kann zusätzlich im Admin-Panel global deaktiviert werden

## Event-Schema

Jedes Event enthält:

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `event` | string | Event-Name (siehe unten) |
| `ts` | ISO timestamp | Zeitstempel |
| `session_id` | UUID | Erste-Party Session-ID (sessionStorage) |
| `url` | string | Bereinigte URL (ohne PII, nur whitelisted UTM) |
| `referrer` | string? | Referrer URL |
| `utm_source` | string? | UTM Source |
| `utm_medium` | string? | UTM Medium |
| `utm_campaign` | string? | UTM Campaign |
| `utm_content` | string? | UTM Content |
| `utm_term` | string? | UTM Term |
| `props` | object? | Zusätzliche Properties (kein PII) |

## Pflicht-Events

| Event | Beschreibung | Props |
|-------|-------------|-------|
| `page_view` | Seitenaufruf (Hash-basiert) | – |
| `cta_click` | CTA-Klick | `cta_name` |
| `form_submit` | Formular abgesendet | `form_type` (kein Inhalt!) |
| `phone_click` | Telefon-Link geklickt | – |
| `whatsapp_click` | WhatsApp-Link geklickt | – |
| `download` | Download-Klick | `file_name` |
| `scroll_depth` | Scroll-Tiefe erreicht | `depth_percent` |
| `page_engagement` | Verweildauer | `dwell_time_seconds` |
| `blog_article_read` | Blog-Artikel gelesen | `article_slug`, `read_time_seconds` |

## PHP-Endpoints

| Endpoint | Methode | Auth | Beschreibung |
|----------|---------|------|-------------|
| `collect.php` | POST | Nein | Event-Ingestion (rate-limited, max 50/Batch) |
| `analytics-config.php` | GET | Nein | Tracking-Config lesen |
| `analytics-config.php` | POST | Ja | Tracking-Config schreiben |
| `analytics-export.php?action=kpis` | GET | Ja | KPI-Aggregationen |
| `analytics-export.php?action=export` | GET | Ja | Rohdaten-Export (CSV/JSON) |
| `analytics-cleanup.php` | POST | Ja | Retention-Cleanup |
| `analytics-status.php` | GET | Ja | System-Status |

## Admin-Dashboard

Im Admin-Panel unter dem Tab "Analytics" verfügbar:

### Dashboard
- KPIs: Events, Sessions, Seitenaufrufe, CTA-Klicks, Formulare
- Events-pro-Tag Chart (recharts)
- Top Seiten, Top UTM-Quellen
- Conversion Funnel: page_view → cta_click → form_submit

### Steuerung
- Global Toggle: Tracking EIN/AUS
- Per-Event Toggles
- Retention-Einstellungen (Tage/Monate)
- IP-Speicherung (Standard: AUS)

### Export
- CSV/JSON Export mit Zeitraum-Filter
- Download-Button

### System
- Event-Zähler, DB-Größe
- Ältestes/Neuestes Event
- Cleanup-Button mit Bestätigung

## Datenschutz

- **Keine PII** in Events (keine Namen, E-Mail, Telefon, IP)
- **IP-Speicherung** standardmäßig deaktiviert
- **Retention** konfigurierbar (Standard: 90 Tage Rohdaten)
- **Consent** erforderlich vor Event-Sendung
- **URL-Sanitization**: Nur whitelisted UTM-Parameter bleiben erhalten

## Dateien

### Frontend
- `src/types/analytics.ts` – TypeScript Typdefinitionen
- `src/lib/analytics-tracker.ts` – First-Party Tracking Service
- `src/hooks/use-page-view-tracking.ts` – Page-View Hook
- `src/components/AnalyticsAdminPanel.tsx` – Admin Dashboard

### Backend
- `public/api/collect.php` – Event-Ingestion
- `public/api/analytics-config.php` – Config-Endpoint
- `public/api/analytics-export.php` – KPIs & Export
- `public/api/analytics-cleanup.php` – Retention-Cleanup
- `public/api/analytics-status.php` – System-Status
- `public/api/db.php` – DB-Schema (analytics_events, analytics_config Tabellen)
