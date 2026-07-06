# Scroll-Erlebnis Test-Checkliste

## Quick-Test (5 Minuten)

### Desktop
- [ ] Direktlink `#/leistungen#messebau` → Scrollt zu Messebau, Überschrift sichtbar über Header
- [ ] F5 Reload mit Hash → Section bleibt angesprungen
- [ ] Navigation: Home → Leistungen#eventbau → Korrekte Position, kein Verdecken
- [ ] Tab-Taste → Skip-Link erscheint oben links → Enter → Springt zu Content
- [ ] System auf Reduced-Motion → Scroll ist sofort (kein Smooth)

### Mobile (iOS Safari oder Android Chrome)
- [ ] Link mit Hash öffnen → Section korrekt positioniert
- [ ] Reload → Section bleibt angesprungen
- [ ] Zurück-Button → Navigation funktioniert
- [ ] Hoch/Runter scrollen → Adressleiste ein/aus → Offset bleibt korrekt
- [ ] Portrait ↔ Landscape → Keine Positionsprobleme

---

## Vollständige Test-Suite

### 1. Direktlink & Initial-Load
- [ ] URL mit Hash eingeben: `#/leistungen#messebau`
- [ ] Seite lädt → Scrollt automatisch zu Messebau
- [ ] Überschrift "Messebau" ist vollständig sichtbar über Header-Linie
- [ ] Kein Flackern, keine Layout-Shifts

### 2. Reload & Persistence
- [ ] Auf Section navigieren: `#/leistungen#eventbau`
- [ ] F5 / Cmd+R → Seite neu laden
- [ ] Section bleibt angesprungen
- [ ] Position ist identisch zu vorher

### 3. Navigation zwischen Sections
#### Gleiche Seite
- [ ] Leistungen: Messebau → Eventbau (Button/Link klicken)
- [ ] Smooth-Scroll (falls nicht reduced-motion)
- [ ] Eventbau-Überschrift landet sauber unter Header
- [ ] Kein Ruckeln, flüssige Animation

#### Unterschiedliche Seiten
- [ ] Home → Leistungen#messebau (Link klicken)
- [ ] Page wechselt → Scrollt zu Messebau
- [ ] Überschrift sichtbar, nicht verdeckt

### 4. Browser Back/Forward
- [ ] Navigation: Home → Leistungen → Branchen
- [ ] Zurück-Button (2×) → Landet wieder auf Home
- [ ] Forward-Button (2×) → Landet wieder auf Branchen
- [ ] URL-Hash aktualisiert sich korrekt

### 5. Skip-Link (Accessibility)
- [ ] Seite laden → Tab-Taste drücken
- [ ] Skip-Link erscheint oben links: "Zum Hauptinhalt springen"
- [ ] Visuell sichtbar, gut lesbar, über Header
- [ ] Enter drücken → Springt zu `#main-content`
- [ ] Fokus landet auf main-Element

### 6. Fokus-Management
- [ ] Section-Navigation durchführen
- [ ] Section bekommt Fokus (gestrichelte Outline sichtbar)
- [ ] Tab-Taste → Nächstes interaktives Element
- [ ] Keine Fokus-Fallen, logische Tab-Reihenfolge

### 7. Reduced-Motion
- [ ] System-Einstellung aktivieren:
  - macOS: Systemeinstellungen → Bedienungshilfen → Anzeige → Bewegung reduzieren
  - Windows: Einstellungen → Erleichterte Bedienung → Animationen
- [ ] Seite neu laden
- [ ] Section-Navigation → Scroll ist sofort (kein Smooth-Effekt)
- [ ] Keine Animationen auf der Seite

### 8. iOS Safari Spezial
- [ ] Link mit Hash in Safari Mobile öffnen
- [ ] Section korrekt positioniert bei Laden
- [ ] Nach unten scrollen → Adressleiste verschwindet
- [ ] Section bleibt korrekt positioniert (nicht verrutscht)
- [ ] Swipe-Zurück (von links nach rechts) → Vorherige Seite → Section OK
- [ ] Gerät drehen (Portrait → Landscape) → Section bleibt korrekt
- [ ] Bounce-Scrolling (über-scrollen) → Kein Layout-Shift

### 9. Android Chrome Spezial
- [ ] Link mit Hash in Chrome Mobile öffnen
- [ ] Section korrekt positioniert
- [ ] Toolbar ein/ausblenden durch Scrollen → Offset passt sich an
- [ ] Tab wechseln → Zurück zur App → Position erhalten
- [ ] Gerät drehen → Keine Positionsprobleme
- [ ] Schnelles Touch-Scrolling → Performant, kein Stottern

### 10. Screenreader (Optional, aber empfohlen)
- [ ] NVDA/JAWS (Windows) oder VoiceOver (macOS/iOS) aktivieren
- [ ] Section-Navigation durchführen
- [ ] Screenreader kündigt an: "Navigation zu [Section]" (via aria-live)
- [ ] Screenreader liest Section-Überschrift vor (weil Fokus gesetzt)
- [ ] Skip-Link wird beim Tab-Durchlauf angekündigt

---

## Edge-Cases

### Sehr lange Seite
- [ ] Zu Section ganz unten scrollen
- [ ] Zu Section ganz oben scrollen
- [ ] Funktioniert in beiden Richtungen

### Langsame Verbindung
- [ ] Network Throttling: Slow 3G
- [ ] Section-Navigation durchführen
- [ ] Retry-Mechanismus greift (max. 20 Versuche)
- [ ] Funktioniert trotzdem nach kurzer Wartezeit

### Nicht-existierende Section
- [ ] Manuell Hash ändern: `#/leistungen#gibts-nicht`
- [ ] Console-Warning: "Section not found after 20 attempts"
- [ ] Keine JavaScript-Fehler
- [ ] Seite bleibt funktional

### Header-Höhe ändert sich
- [ ] Auf mobile Viewport wechseln (Header wird höher)
- [ ] Section navigieren → Offset passt sich an
- [ ] Zurück zu Desktop → Offset passt sich wieder an
- [ ] Keine manuellen Code-Änderungen nötig

---

## Performance-Check

### Lighthouse (Mobile)
- [ ] Performance Score > 90
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] INP (Interaction to Next Paint) < 200ms

### Timing
- [ ] Erster Section-Jump: < 500ms (Klick bis Section sichtbar)
- [ ] Weitere Jumps: < 300ms (bereits gerenderte Sections)
- [ ] Smooth-Scroll-Dauer: ~400ms (fühlt sich flüssig an)

---

## Regression-Check (Nach Änderungen)

Nach Code-Änderungen an Header, Sections oder Scroll-Utilities:

1. [ ] Quick-Test durchführen (siehe oben)
2. [ ] Desktop: Chrome, Firefox, Safari testen
3. [ ] Mobile: iOS Safari + Android Chrome testen
4. [ ] Skip-Link prüfen
5. [ ] Reduced-Motion prüfen

---

## Test-Protokoll Vorlage

```
Datum: _______________
Tester: _______________
Browser/Gerät: _______________

Direktlink:          [ ] Pass  [ ] Fail  Notizen: _____________
Reload:              [ ] Pass  [ ] Fail  Notizen: _____________
Navigation:          [ ] Pass  [ ] Fail  Notizen: _____________
Back/Forward:        [ ] Pass  [ ] Fail  Notizen: _____________
Skip-Link:           [ ] Pass  [ ] Fail  Notizen: _____________
Fokus:               [ ] Pass  [ ] Fail  Notizen: _____________
Reduced-Motion:      [ ] Pass  [ ] Fail  Notizen: _____________
Mobile-Stabilität:   [ ] Pass  [ ] Fail  Notizen: _____________

Gesamtergebnis:      [ ] Bestanden  [ ] Fehlgeschlagen

Kritische Bugs: 
_____________________________________________________________
_____________________________________________________________
```

---

## Status

Nach vollständigem Test ausfüllen:

- [ ] Alle Tests bestanden (Desktop)
- [ ] Alle Tests bestanden (iOS Safari)
- [ ] Alle Tests bestanden (Android Chrome)
- [ ] Accessibility-Tests bestanden
- [ ] Performance-Ziele erreicht

**Production-Ready:** [ ] Ja  [ ] Nein

**Nächste Schritte:** _________________________________
