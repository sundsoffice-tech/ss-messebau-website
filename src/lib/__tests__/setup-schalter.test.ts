// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Wächter für die Ersteinrichtung des Admin-Bereichs (public/api/auth.php, Aktion setup).
// Der Schalter SETUP_ERLAUBT muss im ausgelieferten Stand auf false stehen: Sonst würde nach einem
// Verlust der Datenbank der erste Aufrufer aus dem Netz Admin. Dieser Fall läuft mit npm test vor
// jedem Deploy und hält einen Stand mit offenem Schalter auf. Wer den Schalter für eine neue
// Installation bewusst öffnet, ändert diesen Fall im selben Commit und stellt beides danach zurück.

// Pfad ab der Repo-Wurzel: vitest läuft dort (npm test).
const quelltext = readFileSync('public/api/auth.php', 'utf8')

function schalterFehler(text: string): string[] {
  const fehler: string[] = []
  const zeilen = text.split(/\r?\n/)
  const zuweisungen = zeilen.filter((zeile) => /\bSETUP_ERLAUBT\b\s*=(?!=)/.test(zeile) || /define\(\s*['"]SETUP_ERLAUBT['"]/.test(zeile))
  if (zuweisungen.length !== 1) {
    fehler.push(`SETUP_ERLAUBT wird ${zuweisungen.length}-mal gesetzt, erwartet genau einmal`)
  }
  if (!zeilen.includes('const SETUP_ERLAUBT = false;')) {
    fehler.push('die Zeile "const SETUP_ERLAUBT = false;" fehlt')
  }
  if (!/if \(!SETUP_ERLAUBT\) \{\s*http_response_code\(403\);/.test(text)) {
    fehler.push('setup prüft den Schalter nicht (403 fehlt)')
  }
  return fehler
}

describe('Ersteinrichtung des Admin-Bereichs ist im ausgelieferten Stand gesperrt', () => {
  it('public/api/auth.php trägt genau die Zeile "const SETUP_ERLAUBT = false;" und prüft sie in setup', () => {
    expect(schalterFehler(quelltext)).toEqual([])
  })

  it('Gegenprobe: ein offener, doppelter, fehlender oder ungeprüfter Schalter wird genannt', () => {
    const offen = quelltext.replace('const SETUP_ERLAUBT = false;', 'const SETUP_ERLAUBT = true;')
    expect(schalterFehler(offen).join(' | ')).toContain('fehlt')
    const eingerueckt = quelltext.replace('const SETUP_ERLAUBT = false;', '    const SETUP_ERLAUBT = false; // aus')
    expect(schalterFehler(eingerueckt).join(' | ')).toContain('fehlt')
    const doppelt = quelltext + "\ndefine('SETUP_ERLAUBT', true);\n"
    expect(schalterFehler(doppelt).join(' | ')).toContain('2-mal')
    const ohne = quelltext.replace('const SETUP_ERLAUBT = false;', '')
    expect(schalterFehler(ohne).join(' | ')).toContain('0-mal')
    const ungeprueft = quelltext.replace(/if \(!SETUP_ERLAUBT\) \{(\s*)http_response_code\(403\);/, 'if (false) {$1http_response_code(403);')
    expect(schalterFehler(ungeprueft).join(' | ')).toContain('403 fehlt')
    // Die Gegenprobe hat den echten Text vor sich: Jede Ersetzung oben muss gegriffen haben.
    for (const fassung of [offen, eingerueckt, ohne, ungeprueft]) {
      expect(fassung).not.toEqual(quelltext)
    }
  })
})
