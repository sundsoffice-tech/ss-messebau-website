# S&S Messebau GbR Website

Professionelle, deutschsprachige Website für einen Full-Service-Messebauer aus Hückelhoven, die Leads generiert und Vertrauen durch erstklassiges Design und klare Kommunikation aufbaut.

**Experience Qualities**:
1. **Professionell** - Jedes Element kommuniziert Kompetenz und Zuverlässigkeit eines etablierten Messebauers
2. **Vertrauenswürdig** - Transparente Prozesse, echte Referenzen und klare Kontaktmöglichkeiten schaffen Sicherheit
3. **Effizient** - Schneller Zugang zu Informationen und direkte Conversion-Pfade ohne unnötige Hürden

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
Die Website umfasst 9 Hauptseiten mit unterschiedlichen Funktionen: Content-Präsentation, Formular-Handling, AI-Chatbot, Filterbare Referenzen, Admin-Funktionen für den Owner, und persistente Datenspeicherung für Anfragen und Content.

## Essential Features

### Multi-Page Navigation & Routing
- **Functionality**: 9 Hauptseiten mit nahtloser Navigation (Startseite, Leistungen, Branchen, Referenzen, Über uns, Ablauf, Nachhaltigkeit, Blog, Kontakt)
- **Purpose**: Strukturierte Informationsarchitektur für verschiedene Zielgruppen-Bedürfnisse
- **Trigger**: Klick auf Navigation, Logo, oder interne Links
- **Progression**: User klickt Link → Smooth Scroll oder Page Transition → Neue Seite lädt → Aktiver Nav-State aktualisiert
- **Success criteria**: Alle Seiten erreichbar, Browser-Back funktioniert, Mobile Navigation klappt ein

### Projekt-Anfrage System
- **Functionality**: Modal-Formular für Projektanfragen mit Validierung und Persistierung
- **Purpose**: Primärer Lead-Generation-Kanal - Conversion optimiert
- **Trigger**: "Projekt anfragen" CTA-Buttons (Hero, Navigation, Sticky Button)
- **Progression**: Button-Klick → Modal öffnet → User füllt Formular → Validierung → Daten gespeichert (spark.kv) → Bestätigung
- **Success criteria**: Formular validiert Pflichtfelder, speichert Daten persistent, zeigt Erfolgsbestätigung

### AI Messebau-Berater Chatbot
- **Functionality**: Interaktiver Chatbot für Budget-Kalkulation und Messebau-Beratung
- **Purpose**: Qualifizierung von Leads und sofortige Hilfe ohne menschliche Intervention
- **Trigger**: Chatbot-Icon auf Startseite/Kontakt oder explizite Buttons
- **Progression**: Icon-Klick → Chat öffnet → User stellt Frage/wählt Thema → LLM generiert Antwort → Weiteres Gespräch oder Anfrage
- **Success criteria**: Chatbot antwortet kontextuell auf Messebau-Fragen, kann grobe Budgets schätzen (z.B. "50qm Stand")

### Filterbare Referenz-Galerie
- **Functionality**: Grid mit Case Studies, filterbar nach Branche, Größe, Typ
- **Purpose**: Social Proof und Vertrauen durch konkrete Projekte
- **Trigger**: Navigation zu /referenzen oder Case-Teaser auf Startseite
- **Progression**: Seite lädt → User wählt Filter → Grid aktualisiert → Klick auf Case → Detail-View
- **Success criteria**: Filter funktionieren sofort, mindestens 3 Demo-Cases, Bilder laden schnell

### Admin Content-Verwaltung (Owner-Only)
- **Functionality**: Geschützter Bereich für Owner zum Hinzufügen von Referenzen und Blog-Posts
- **Purpose**: Selbstständige Pflege von Content ohne Code-Änderungen
- **Trigger**: Owner ruft /admin auf, spark.user() prüft isOwner
- **Progression**: Owner navigiert zu /admin → Authentifizierung via spark.user() → Dashboard → Neuen Content erstellen → In spark.kv speichern
- **Success criteria**: Nur Owner sieht Admin-UI, neue Referenzen/Posts erscheinen sofort auf der Site

## Edge Case Handling

- **Fehlende Formulardaten**: Inline-Validierung mit klaren deutschen Fehlermeldungen ("Bitte E-Mail-Adresse eingeben")
- **Chatbot-Überlastung**: Bei unverständlichen Fragen leitet Bot zu Kontaktformular um
- **Keine Referenzen gefunden**: Freundlicher Empty State "Keine Projekte in dieser Kategorie - kontaktieren Sie uns für Ihr individuelles Projekt"
- **Admin-Zugriff ohne Owner**: Redirect zu Startseite mit Hinweis "Dieser Bereich ist geschützt"
- **Mobile Navigation**: Hamburger-Menü mit vollständiger Seitenübersicht, schließt nach Link-Klick

## Design Direction

Die Website soll **Kompetenz durch Klarheit** vermitteln: Großzügiger Weißraum, klare Hierarchien und professionelle Fotografie schaffen Vertrauen. Gleichzeitig sollen kräftige Akzentfarben und moderne Interaktionen Energie und Innovation kommunizieren - ein etablierter Messebauer, der mit der Zeit geht.

## Color Selection

Modern und professionell mit kräftigen Akzenten für Conversion-Elemente.

- **Primary Color**: Kräftiges Blau `oklch(0.45 0.15 250)` - Kommuniziert Vertrauen, Professionalität und Zuverlässigkeit, dominante Farbe für Header und wichtige Elemente
- **Secondary Colors**: 
  - Dunkles Anthrazit `oklch(0.25 0.01 260)` für Text und Seriosität
  - Helles Grau `oklch(0.96 0 0)` für Hintergründe und Weißraum
- **Accent Color**: Kräftiges Rot `oklch(0.55 0.22 25)` - Attention-Grabbing für CTAs, "Projekt anfragen" Buttons, wichtige Highlights
- **Foreground/Background Pairings**:
  - Primary Blue auf White: `oklch(0.45 0.15 250)` on `oklch(1 0 0)` - Ratio 6.1:1 ✓
  - Accent Red auf White: `oklch(0.55 0.22 25)` on `oklch(1 0 0)` - Ratio 5.8:1 ✓
  - Dark Text auf White: `oklch(0.25 0.01 260)` on `oklch(1 0 0)` - Ratio 12.5:1 ✓
  - White auf Primary Blue: `oklch(1 0 0)` on `oklch(0.45 0.15 250)` - Ratio 6.1:1 ✓
  - White auf Accent Red: `oklch(1 0 0)` on `oklch(0.55 0.22 25)` - Ratio 5.8:1 ✓

## Font Selection

Moderne, professionelle Sans-Serif-Typografie die Klarheit und Lesbarkeit über alle Gerätegrößen sicherstellt.

**Primary Font**: Inter - Modern, technisch, excellent hinting für Bildschirme, perfekt für B2B-Kommunikation

- **Typographic Hierarchy**:
  - H1 (Hero Headlines): Inter Bold / 56px / -0.02em letter-spacing / line-height 1.1
  - H2 (Section Headers): Inter SemiBold / 40px / -0.01em / line-height 1.2
  - H3 (Subsections): Inter SemiBold / 28px / normal / line-height 1.3
  - H4 (Card Titles): Inter Medium / 20px / normal / line-height 1.4
  - Body Large (Intros): Inter Regular / 18px / normal / line-height 1.6
  - Body (Main Text): Inter Regular / 16px / normal / line-height 1.6
  - Small (Captions): Inter Regular / 14px / normal / line-height 1.5
  - Button Text: Inter SemiBold / 16px / normal

## Animations

Subtile, funktionale Animationen die Orientierung geben und Premium-Qualität signalisieren ohne zu stören. Primär: Smooth Scrolling zwischen Sections, Fade-In für Cards beim Scroll-In, Hover-States für Buttons (Scale 1.02, Shadow-Intensität), Modal-Transitions (Fade + Scale from center). Delight-Momente: Hero-Parallax-Effekt, CTA-Button Pulse-Animation (subtil), Chatbot-Entrance Bounce.

## Component Selection

- **Components**:
  - **Dialog**: Projekt-Anfrage Modal, vollflächig auf Mobile
  - **Card**: Leistungs-Kacheln, Referenz-Tiles, Team-Portraits - mit hover:shadow-lg
  - **Button**: Primär (Rot), Sekundär (Blau Outline), Ghost für Navigation - alle mit Phosphor Icons
  - **Form + Input + Label**: Kontakt und Anfrage-Formulare - große Touch-Targets, klare Focus-States
  - **Accordion**: FAQ-Sektion auf Ablauf-Seite
  - **Tabs**: Branchen-Übersicht (Food, Versicherungen, Industrie)
  - **Badge**: Kategorie-Tags auf Blog und Referenzen
  - **Separator**: Horizontale Trenner zwischen Sections
  - **Sheet**: Mobile Navigation (von links)
  - **Scroll-Area**: Chatbot-Message-History
  - **Toast (Sonner)**: Formular-Bestätigungen, Error-Messages

- **Customizations**:
  - **Sticky CTA Button**: Fixed bottom-right (mobile: bottom-center), "Projekt anfragen", Accent-Red, mit subtle shadow
  - **Hero Background**: Gradient-Overlay über Messebau-Bild für Text-Readability
  - **Service Icons**: Phosphor-Icons in Custom-Size (48px) mit Brand-Color-Fills
  - **Timeline Component**: Custom für 7-Schritte Ablauf, vertical line mit animated dots
  - **Comparison Table**: Custom responsive Table mit Highlight-Column für S&S

- **States**:
  - **Buttons**: Default → Hover (Scale + Shadow) → Active (Scale down 0.98) → Disabled (Opacity 0.5)
  - **Inputs**: Default (Border) → Focus (Ring + Border-Blue) → Error (Ring + Border-Red) → Success (Ring + Border-Green)
  - **Cards**: Rest → Hover (Lift + Shadow-lg) → Active (Border-Blue)
  - **Navigation Links**: Default → Hover (Color-Blue) → Active (Bold + Color-Blue + Underline)

- **Icon Selection**:
  - **Navigation**: House (Home), Briefcase (Leistungen), Buildings (Branchen), Images (Referenzen), Users (Über uns), Path (Ablauf), Leaf (Nachhaltigkeit), Article (Blog), Envelope (Kontakt)
  - **Services**: Warehouse (Messebau), CalendarDot (Eventbau), Storefront (Ladenbau), Armchair (Möbel)
  - **Actions**: PaperPlaneRight (Senden), Phone (Anruf), ChatCircleDots (Chatbot), Plus (Hinzufügen), X (Schließen)
  - **Social Proof**: Star (Bewertungen), CheckCircle (Vorteile), Users (Team)

- **Spacing**:
  - Section Padding: py-16 (Desktop), py-12 (Mobile)
  - Container Max-Width: max-w-7xl, px-6 (Mobile), px-8 (Tablet+)
  - Card Padding: p-6 (Mobile), p-8 (Desktop)
  - Element Gaps: gap-4 (Tight), gap-6 (Default), gap-8 (Generous), gap-12 (Sections)
  - Button Padding: px-6 py-3 (Default), px-8 py-4 (Hero CTA)

- **Mobile**:
  - Navigation: Hamburger → Full-Screen Sheet mit Large Touch-Targets
  - Hero: Text-Size reduziert (H1: 36px), CTA-Buttons stack vertical
  - Service-Grid: 1 Column auf Mobile, 2 auf Tablet, 4 auf Desktop
  - Sticky CTA: Full-Width Bottom-Bar auf Mobile
  - Forms: Single-Column, große Input-Felder (min-height 48px)
  - Chatbot: Full-Screen auf Mobile, Popup auf Desktop
