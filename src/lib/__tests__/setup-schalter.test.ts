// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

// Wächter für die Ersteinrichtung des Admin-Bereichs (public/api/auth.php, Aktion setup).
// Der Schalter SETUP_ERLAUBT muss im ausgelieferten Stand auf false stehen: Sonst würde nach einem
// Verlust der Datenbank der erste Aufrufer aus dem Netz Admin. Dieser Fall läuft mit npm test vor
// jedem Deploy und hält einen Stand mit offenem Schalter auf. Wer den Schalter für eine neue
// Installation bewusst öffnet, ändert diesen Fall im selben Commit und stellt beides danach zurück.
//
// Geprüft werden alle PHP-Dateien unter public/api: Der Name darf nur an der einen Stelle in
// auth.php gesetzt werden. Ein define() in config.php oder db.php liefe vor der const-Zeile und
// gewönne gegen sie.

// Pfade ab der Repo-Wurzel: vitest läuft dort (npm test).
const WURZEL = 'public/api'

function phpDateien(ordner: string): string[] {
  const gefunden: string[] = []
  for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = `${ordner}/${eintrag.name}`
    if (eintrag.isDirectory()) {
      gefunden.push(...phpDateien(pfad))
    } else if (eintrag.name.endsWith('.php')) {
      gefunden.push(pfad)
    }
  }
  return gefunden.sort()
}

const quellen: Record<string, string> = {}
for (const pfad of phpDateien(WURZEL)) {
  quellen[pfad.slice(WURZEL.length + 1)] = readFileSync(pfad, 'utf8')
}

// Eine Zeile setzt den Schalter, wenn sie ihn als const oder per define() festlegt.
const SETZT = /\bconst\s+SETUP_ERLAUBT\b|define\s*\(\s*['"]\\*SETUP_ERLAUBT['"]/i

function schalterFehler(dateien: Record<string, string>): string[] {
  const fehler: string[] = []
  const stellen: string[] = []
  for (const [name, text] of Object.entries(dateien)) {
    text.split(/\r?\n/).forEach((zeile, nr) => {
      if (SETZT.test(zeile)) stellen.push(`${name}:${nr + 1}`)
    })
  }
  if (stellen.length !== 1 || !stellen[0].startsWith('auth.php:')) {
    fehler.push(`SETUP_ERLAUBT wird ${stellen.length}-mal gesetzt (${stellen.join(', ') || 'nirgends'}), erwartet genau einmal in auth.php`)
  }
  const auth = dateien['auth.php'] ?? ''
  if (!auth.split(/\r?\n/).includes('const SETUP_ERLAUBT = false;')) {
    fehler.push('die Zeile "const SETUP_ERLAUBT = false;" fehlt in auth.php')
  }
  if (!/if \(!SETUP_ERLAUBT\) \{\s*http_response_code\(403\);/.test(auth)) {
    fehler.push('setup prüft den Schalter nicht (403 fehlt)')
  }
  return fehler
}

describe('Ersteinrichtung des Admin-Bereichs ist im ausgelieferten Stand gesperrt', () => {
  it('unter public/api setzt nur auth.php den Schalter, mit der Zeile "const SETUP_ERLAUBT = false;", und setup prüft ihn', () => {
    expect(Object.keys(quellen)).toContain('auth.php')
    expect(Object.keys(quellen)).toContain('config.php')
    expect(Object.keys(quellen)).toContain('db.php')
    expect(Object.keys(quellen).length).toBeGreaterThan(15)
    expect(schalterFehler(quellen)).toEqual([])
  })

  it('Gegenprobe: ein offener, eingerückter, fehlender oder ungeprüfter Schalter in auth.php wird genannt', () => {
    const auth = quellen['auth.php']
    const mit = (neu: string) => ({ ...quellen, 'auth.php': neu })
    const offen = auth.replace('const SETUP_ERLAUBT = false;', 'const SETUP_ERLAUBT = true;')
    expect(schalterFehler(mit(offen)).join(' | ')).toContain('fehlt in auth.php')
    const eingerueckt = auth.replace('const SETUP_ERLAUBT = false;', '    const SETUP_ERLAUBT = false; // aus')
    expect(schalterFehler(mit(eingerueckt)).join(' | ')).toContain('fehlt in auth.php')
    const ohne = auth.replace('const SETUP_ERLAUBT = false;', '')
    expect(schalterFehler(mit(ohne)).join(' | ')).toContain('0-mal')
    const ungeprueft = auth.replace(/if \(!SETUP_ERLAUBT\) \{(\s*)http_response_code\(403\);/, 'if (false) {$1http_response_code(403);')
    expect(schalterFehler(mit(ungeprueft)).join(' | ')).toContain('403 fehlt')
    // Die Gegenprobe hat den echten Text vor sich: Jede Ersetzung oben muss gegriffen haben.
    for (const fassung of [offen, eingerueckt, ohne, ungeprueft]) {
      expect(fassung).not.toEqual(auth)
    }
  })

  it('Gegenprobe: ein zweites Setzen in irgendeiner PHP-Datei unter public/api wird mit Fundstelle genannt', () => {
    const zusaetze: Array<[string, string]> = [
      ['config.php', "define('SETUP_ERLAUBT', true);"],
      ['db.php', 'define("SETUP_ERLAUBT", true);'],
      ['config.php', "DEFINE ( 'SETUP_ERLAUBT' , true );"],
      ['db.php', "define('\\\\SETUP_ERLAUBT', true);"],
      ['health.php', 'const SETUP_ERLAUBT = true;'],
      ['auth.php', "define('SETUP_ERLAUBT', true);"],
      ['neu/unterordner.php', "<?php define('SETUP_ERLAUBT', true);"],
    ]
    for (const [datei, zeile] of zusaetze) {
      const fassung = { ...quellen, [datei]: (quellen[datei] ?? '') + '\n' + zeile + '\n' }
      const fehler = schalterFehler(fassung).join(' | ')
      expect(fehler, `${datei}: ${zeile}`).toContain('2-mal')
      expect(fehler, `${datei}: ${zeile}`).toContain(datei + ':')
    }
    // Lesen des Schalters ist kein Setzen.
    const lesend = { ...quellen, 'health.php': quellen['health.php'] + '\nif (SETUP_ERLAUBT) { echo 1; }\n$x = SETUP_ERLAUBT === false;\n' }
    expect(schalterFehler(lesend)).toEqual([])
  })
})
