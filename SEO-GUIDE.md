# SEO-Anleitung: S&S Messebau Website

Erstellt am: 20.02.2026
Letzte Aktualisierung: 20.02.2026

---

## Inhaltsverzeichnis

1. [Zusammenfassung der SEO-Analyse](#1-zusammenfassung-der-seo-analyse)
2. [Google Search Console einrichten](#2-google-search-console-einrichten)
3. [Google Business Profile erstellen](#3-google-business-profile-erstellen)
4. [Google Analytics (GA4) aktivieren](#4-google-analytics-ga4-aktivieren)
5. [Domain-Weiterleitung einrichten](#5-domain-weiterleitung-einrichten)
6. [Brancheneintraege anlegen](#6-brancheneintraege-anlegen)
7. [Bilder optimieren](#7-bilder-optimieren)
8. [Content-Strategie](#8-content-strategie)
9. [Lokale SEO](#9-lokale-seo)
10. [Wettbewerber-Analyse](#10-wettbewerber-analyse)
11. [Technische SEO-Checkliste](#11-technische-seo-checkliste)
12. [Regelmaessige Wartung](#12-regelmaessige-wartung)

---

## 1. Zusammenfassung der SEO-Analyse

### Was bereits gut funktioniert

| Aspekt | Bewertung | Details |
|--------|-----------|---------|
| Strukturierte Daten | Sehr gut | LocalBusiness, FAQPage, BreadcrumbList, WebSite Schema |
| Meta-Tags | Gut | Individuelle Title/Description pro Seite |
| Technische Basis | Gut | Sitemap, Robots.txt, HTTPS, Security Headers |
| SEO-Fallback | Gut | Statisches HTML fuer Crawler im Root-Element |
| Performance | Gut | Code-Splitting, Lazy Loading, Font-Optimierung |
| Barrierefreiheit | Gut | Skip-to-Content, ARIA-Labels, lang-Attribut |
| DSGVO | Gut | Cookie-Consent-Banner vorhanden |

### Kritische Probleme

| Problem | Prioritaet | Status |
|---------|-----------|--------|
| Website NICHT in Google indexiert | KRITISCH | Offen |
| Google Business Profile fehlt | KRITISCH | Offen |
| Domain-Diskrepanz (sunds-messebau.de vs sundsmessebau.de) | KRITISCH | Offen |
| Google Analytics nicht konfiguriert | HOCH | Offen |
| Keine Backlinks/Brancheneintraege | HOCH | Offen |
| OG-Image fehlte | HOCH | Behoben (Placeholder erstellt) |

---

## 2. Google Search Console einrichten

**Warum:** Ohne Google Search Console kann Google die Website nicht zuverlaessig finden und indexieren. Die Sitemap muss manuell eingereicht werden.

### Schritt-fuer-Schritt

1. Oeffne https://search.google.com/search-console
2. Melde dich mit dem Google-Konto der Firma an
3. Klicke auf "Property hinzufuegen"
4. Waehle "URL-Praefix" und gib ein: `https://sunds-messebau.de`
5. **Verifizierung** - waehle eine Methode:
   - **Empfohlen: HTML-Tag** - Kopiere das Meta-Tag und fuege es in `index.html` im `<head>` ein (z.B. `<meta name="google-site-verification" content="DEIN_CODE" />`)
   - **Alternative: DNS** - Fuege einen TXT-Record bei Hostinger hinzu
6. Nach der Verifizierung:
   - Gehe zu "Sitemaps" im linken Menue
   - Gib ein: `https://sunds-messebau.de/sitemap.xml`
   - Klicke "Senden"
7. Gehe zu "URL-Pruefung" und gib ein: `https://sunds-messebau.de/`
8. Klicke auf "Indexierung beantragen"
9. Wiederhole Schritt 7-8 fuer die wichtigsten Seiten:
   - `https://sunds-messebau.de/leistungen`
   - `https://sunds-messebau.de/kontakt`
   - `https://sunds-messebau.de/branchen`
   - `https://sunds-messebau.de/referenzen`

### Nach der Einrichtung pruefen

- **Abdeckung**: Zeigt an, welche Seiten indexiert sind und welche Fehler haben
- **Core Web Vitals**: Zeigt Performance-Daten der Website
- **Suchergebnisse**: Zeigt, fuer welche Keywords die Website gefunden wird

---

## 3. Google Business Profile erstellen

**Warum:** Google Business Profile ist der wichtigste Faktor fuer lokale Suchergebnisse. Ohne Profil erscheint die Firma nicht in Google Maps und nicht im "Local Pack" (die 3 Firmen-Eintraege oben in den Suchergebnissen).

### Schritt-fuer-Schritt

1. Oeffne https://business.google.com
2. Klicke "Unternehmen hinzufuegen" > "Unternehmen hinzufuegen"
3. **Unternehmensname:** `S&S Messebau GbR`
4. **Kategorie:** `Messebauunternehmen` (oder `Messebau` / `Exhibition stand contractor`)
5. **Standort:** Ja, Kunden besuchen den Standort
6. **Adresse:** Marienstrasse 37, 41836 Hueckelhoven
   - **WICHTIG:** Diese Adresse muss mit der Website und ALLEN Brancheneintraegen uebereinstimmen!
7. **Einzugsgebiet:** NRW / Deutschland / Europa
8. **Telefon:** +49 1514 0368754
9. **Website:** `https://sunds-messebau.de`
10. **Verifizierung** per Postkarte oder Telefon

### Nach der Verifizierung optimieren

- **Oeffnungszeiten:** Mo-Fr 08:00-18:00
- **Beschreibung:** "S&S Messebau - Full-Service Messebau, Eventbau und Showrooms aus NRW. Spezialisiert auf Food, Finance und Industrie. Unverbindliches 48h-Angebot mit persoenlicher Beratung. Bundesweite Umsetzung."
- **Fotos hochladen** (min. 10 Fotos):
  - Logo
  - Aussen-/Innenansicht des Bueros
  - Fertige Messestaende (min. 5 verschiedene Projekte)
  - Team-Fotos
  - Aufbau-Fotos
- **Services/Leistungen** hinzufuegen:
  - Messebau
  - Eventbau
  - Ladenbau
  - Showrooms
  - Bannerrahmen
- **FAQ** hinzufuegen (die gleichen wie auf der Website)

### Google-Bewertungen sammeln

- Nach jedem abgeschlossenen Projekt den Kunden per E-Mail um eine Bewertung bitten
- Link zum Bewertungsformular: Im Google Business Profile unter "Bewertung erhalten" den kurzen Link kopieren
- Ziel: Mindestens 10 Bewertungen mit 4.5+ Sternen

---

## 4. Google Analytics (GA4) aktivieren

**Warum:** Ohne Analytics weisst du nicht, ob jemand die Website besucht, woher die Besucher kommen und was sie tun.

### Schritt-fuer-Schritt

1. Oeffne https://analytics.google.com
2. Erstelle ein GA4-Konto (oder nutze ein bestehendes)
3. Erstelle eine neue Property:
   - Name: "S&S Messebau Website"
   - Zeitzone: Europa/Berlin
   - Waehrung: EUR
4. Erstelle einen Web-Datenstream:
   - URL: `https://sunds-messebau.de`
   - Stream-Name: "S&S Messebau Website"
5. **Kopiere die Measurement-ID** (Format: `G-XXXXXXXXXX`)
6. Oeffne die Datei `index.html` im Projekt
7. Ersetze ALLE Vorkommen von `G-XXXXXXXXXX` durch die echte ID
8. Deploye die Website neu (git push)

### Wichtige GA4-Einstellungen

- **Datenaufbewahrung:** Einstellungen > Dateneinstellungen > Datenaufbewahrung > 14 Monate
- **Google Search Console verknuepfen:** Einstellungen > Verknuepfungen > Search Console
- **Conversions einrichten:**
  - Kontaktformular-Absendung als Conversion markieren
  - Telefon-Klicks als Conversion markieren
  - E-Mail-Klicks als Conversion markieren

---

## 5. Domain-Weiterleitung einrichten

**Warum:** Aktuell existieren zwei Domains: `sundsmessebau.de` (alt, ohne Bindestrich) und `sunds-messebau.de` (neu, mit Bindestrich). Das spaltet die SEO-Autoritaet.

### Option A: sunds-messebau.de als Hauptdomain (empfohlen, da die neue Website hierauf konfiguriert ist)

1. Im Hostinger-Dashboard:
   - DNS fuer `sundsmessebau.de` konfigurieren
   - A-Record auf den gleichen Server wie `sunds-messebau.de` zeigen
2. In der `.htaccess` der alten Domain einen 301-Redirect einrichten:
   ```
   RewriteEngine On
   RewriteCond %{HTTP_HOST} ^(www\.)?sundsmessebau\.de$ [NC]
   RewriteRule ^(.*)$ https://sunds-messebau.de/$1 [R=301,L]
   ```
3. Bei messen.de die URL aktualisieren auf `https://sunds-messebau.de`

### Option B: sundsmessebau.de als Hauptdomain behalten

Falls die alte Domain mehr Autoritaet hat:
1. Alle URLs in der Website-Codebasis aendern (index.html, sitemap.xml, robots.txt, use-page-meta.ts)
2. 301-Redirect von sunds-messebau.de auf sundsmessebau.de

### Adress-Konsistenz (NAP)

Die folgenden Daten muessen UEBERALL identisch sein:

- **Name:** S&S Messebau GbR
- **Adresse:** Marienstrasse 37, 41836 Hueckelhoven (oder die korrekte aktuelle Adresse)
- **Phone:** +49 1514 0368754
- **Email:** info@sundsmessebau.com
- **Website:** https://sunds-messebau.de

Aktuell gibt es Unterschiede zwischen Website und messen.de-Eintrag (Hueckelhoven vs. Moenchengladbach). Dies MUSS korrigiert werden.

---

## 6. Brancheneintraege anlegen

**Warum:** Brancheneintraege (Citations) sind ein wichtiger Rankingfaktor fuer lokale SEO und liefern Backlinks.

### Pflicht-Eintraege

| Plattform | URL | Prioritaet |
|-----------|-----|-----------|
| Google Business Profile | https://business.google.com | KRITISCH |
| messen.de | https://www.messen.de (Eintrag aktualisieren!) | HOCH |
| Wer liefert was (wlw) | https://www.wlw.de | HOCH |
| AUMA | https://www.auma.de | HOCH |
| Gelbe Seiten | https://www.gelbeseiten.de | MITTEL |
| Das Oertliche | https://www.dasoertliche.de | MITTEL |
| LinkedIn | https://www.linkedin.com/company/create | MITTEL |
| Facebook | https://www.facebook.com/business | MITTEL |
| Instagram | https://www.instagram.com (Profil-Link aktualisieren) | MITTEL |
| Yelp | https://biz.yelp.de | NIEDRIG |

### Bei jedem Eintrag beachten

- Exakt gleiche Firmendaten (NAP) verwenden
- Website-URL auf `https://sunds-messebau.de` setzen
- Leistungen und Branchen-Keywords eintragen
- Fotos von Messestaenden hochladen
- Oeffnungszeiten angeben

---

## 7. Bilder optimieren

### Bereits implementiert

- `vite-plugin-image-optimizer` wurde installiert (komprimiert Bilder beim Build)
- Lokale Bilder (Logo, Loading Screen) werden automatisch optimiert

### Empfehlungen fuer externe Bilder

Die Website nutzt aktuell Bilder von Unsplash und iStockPhoto. Fuer bessere SEO:

1. **Eigene Fotos verwenden** - Echte Messestand-Fotos sind authentischer und einzigartig
2. **WebP-Format** - Bilder lokal als WebP speichern (30-50% kleiner als JPG)
3. **Beschreibende Dateinamen** - Statt `IMG-20230807-WA0009.jpg` besser `messestand-anuga-2023-food-branche.webp`
4. **Alt-Texte** - Jedes `<img>` sollte ein beschreibendes `alt`-Attribut haben (bereits groesstenteils vorhanden)
5. **Bilder-Sitemap** - Optional: Bilder in der Sitemap mit `<image:image>` auflisten

---

## 8. Content-Strategie

### Blog-Themen (Long-Tail Keywords)

Veroeffentliche mindestens 1 Artikel pro Monat zu diesen Themen:

| Thema | Ziel-Keywords |
|-------|--------------|
| Messestand-Kosten Rechner | "messestand kosten", "was kostet ein messestand" |
| Messebau Duesseldorf Guide | "messebau duesseldorf", "messestand duesseldorf" |
| Messebau Koeln Guide | "messebau koeln", "messestand koeln" |
| Anuga Messestand Tipps | "anuga messestand", "anuga 2026" |
| DKM Messe Versicherung | "dkm messe", "messestand versicherung" |
| Hannover Messe Stand | "hannover messe messestand", "hannover messe aussteller" |
| Messestand mieten vs. kaufen | "messestand mieten", "messestand kaufen" |
| Nachhaltiger Messebau Trends | "nachhaltiger messebau", "oeko messebau" |
| Messeplanung Checkliste 2026 | "messe checkliste", "messeplanung" |
| ROI Messeauftritt berechnen | "messe roi", "messeauftritt kosten nutzen" |

### Bestehende Inhalte optimieren

- Referenzen-Seite mit echten Projektfotos und Kundenstimmen fuellen
- Branchen-Seite mit konkreten Messe-Namen und Terminen aktualisieren
- Blog-Artikel mit aktuellen Jahreszahlen und Daten aktualisieren

---

## 9. Lokale SEO

### Google Maps Optimierung

1. Google Business Profile einrichten (siehe Punkt 3)
2. Google Maps Embed auf Kontaktseite beibehalten
3. Lokale Keywords in Ueberschriften verwenden:
   - "Messebau NRW" (Hauptkeyword)
   - "Messebau Hueckelhoven"
   - "Messebau Duesseldorf"
   - "Messebau Koeln"

### Stadtseiten (mittelfristig)

Erstelle Unterseiten fuer die wichtigsten Staedte:
- `/messebau-duesseldorf` - "Messebau Duesseldorf - Ihr Partner fuer die Messe Duesseldorf"
- `/messebau-koeln` - "Messebau Koeln - Messestande fuer Anuga, ISM & mehr"
- `/messebau-essen` - "Messebau Essen - Professionelle Messestande"

Jede Seite sollte enthalten:
- Lokale Referenzen (Projekte in der Stadt)
- Anfahrtsbeschreibung
- Relevante Messen in der Stadt
- Lokale Schema.org Markup

---

## 10. Wettbewerber-Analyse

### Direkte Wettbewerber "Messebau NRW"

| Firma | Website | Google Business | Backlinks |
|-------|---------|----------------|-----------|
| Messebau NRW | messebau-nrw.de | Ja | Viele |
| Blickfang Messebau | blickfang.de | Ja | Viele |
| Profil & Design | profil-design.de | Ja | Mittel |
| Prisma Plan | prismaplan.de | Ja | Viele (25+ Jahre) |
| LOEWE Messebau NRW | loewe-messebau-nrw.de | Ja | Mittel |
| SPA Messebau | spamessebau.de | Ja | Mittel |
| **S&S Messebau** | **sunds-messebau.de** | **Nein** | **Fast keine** |

### Was die Wettbewerber besser machen

1. **Alle haben Google Business Profile** mit Bewertungen
2. **Server-Side Rendering** oder traditionelle Websites (besser fuer Google)
3. **Mehr Brancheneintraege** und Backlinks
4. **Laengere Online-Praesenz** (teilweise 20+ Jahre)
5. **Video-Content** auf YouTube und Website

### Differenzierung

S&S Messebau kann sich abheben durch:
- "48h-Angebot" USP staerker kommunizieren
- Branchen-Spezialisierung (Food, Finance, Industrie) hervorheben
- Blog/Ratgeber als Expertise-Nachweis
- Moderne Website-Technik (PWA, interaktive Elemente)

---

## 11. Technische SEO-Checkliste

### Bereits erledigt

- [x] `lang="de"` auf `<html>` Element
- [x] Meta-Tags (title, description) pro Seite
- [x] Open Graph Tags
- [x] Twitter Card Tags
- [x] Canonical URLs
- [x] hreflang Tags (de/en)
- [x] robots.txt
- [x] sitemap.xml
- [x] Structured Data (LocalBusiness, FAQPage, BreadcrumbList, WebSite)
- [x] HTTPS mit HSTS
- [x] www-zu-non-www Redirect
- [x] Gzip-Kompression
- [x] Cache-Headers
- [x] Lazy Loading fuer Bilder
- [x] Code-Splitting
- [x] Font-Optimierung (Fallback, Preload, display=swap)
- [x] Statischer HTML-Fallback fuer Crawler
- [x] Noscript-Fallback
- [x] Cookie-Consent (DSGVO)
- [x] Skip-to-Content Link
- [x] OG-Image erstellt

### Noch zu erledigen

- [ ] Google Search Console einrichten
- [ ] Google Business Profile erstellen
- [ ] GA4 Measurement-ID eintragen
- [ ] Domain-Redirect einrichten
- [ ] Brancheneintraege anlegen
- [ ] Google-Bewertungen sammeln
- [ ] Eigene Projekt-Fotos auf der Website verwenden
- [ ] Blog regelmaessig aktualisieren

### Mittelfristig empfohlen

- [ ] Pre-Rendering fuer bessere Social-Media-Vorschauen
- [ ] Stadtseiten fuer lokale SEO
- [ ] Video-Content erstellen
- [ ] E-E-A-T-Signale staerken (Team-Fotos, Zertifikate)

---

## 12. Regelmaessige Wartung

### Woechentlich

- Google Search Console auf Fehler pruefen
- Google Analytics Zugriffszahlen pruefen

### Monatlich

- 1 neuen Blog-Artikel veroeffentlichen
- Google Business Profile aktualisieren (neue Fotos, Beitraege)
- Bewertungen beantworten
- Sitemap-Datum aktualisieren (`lastmod` in sitemap.xml)

### Vierteljaehrlich

- Lighthouse-Audit durchfuehren (Chrome DevTools > Lighthouse)
- Core Web Vitals in Search Console pruefen
- Keyword-Rankings ueberpruefen
- Wettbewerber-Analyse aktualisieren
- Brancheneintraege auf Konsistenz pruefen

### Tools fuer die laufende Optimierung

| Tool | Zweck | URL |
|------|-------|-----|
| Google Search Console | Indexierung, Keywords, Fehler | https://search.google.com/search-console |
| Google Analytics | Traffic, Nutzerverhalten | https://analytics.google.com |
| Google PageSpeed Insights | Core Web Vitals | https://pagespeed.web.dev |
| Google Rich Results Test | Structured Data pruefen | https://search.google.com/test/rich-results |
| Facebook Sharing Debugger | OG-Tags pruefen | https://developers.facebook.com/tools/debug |
| Twitter Card Validator | Twitter-Vorschau | https://cards-dev.twitter.com/validator |
| Lighthouse | Performance-Audit | Chrome DevTools (F12) |

---

## Quellen

- [SPA SEO Guide 2026](https://jesperseo.com/blog/seo-for-single-page-applications-complete-2026-guide/)
- [Core Web Vitals 2026](https://whitelabelcoders.com/blog/how-important-are-core-web-vitals-for-seo-in-2026/)
- [React SEO Guide](https://www.linkgraph.com/blog/seo-for-react-applications/)
- [SEO Best Practices KMU](https://www.seoagentur.de/magazin/seo-best-practices/)
- [SEO Optimierung 2026](https://www.seoagentur.de/magazin/seo-optimierung/)
- [Core Web Vitals SPA FAQ (web.dev)](https://web.dev/articles/vitals-spa-faq)
- [SEO Trends 2026](https://www.gruender.de/website/seo-trends-2026/)
