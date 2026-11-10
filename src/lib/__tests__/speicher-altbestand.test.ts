import { describe, it, expect, beforeEach } from 'vitest'
import { entferneSpeicherAltbestand } from '../speicher-altbestand'
import deTexte from '@/locales/de.json'
import enTexte from '@/locales/en.json'

/**
 * Browserspeicher: Die Website schreibt nur Einträge, die Abschnitt 9 der
 * Datenschutzerklärung nennt, und räumt die vier Einträge früherer Fassungen ab,
 * die nie gelesen wurden (Rechtsprüfung 10.11.2026, Auflage 2).
 *
 * Der zweite Block liest den Quelltext: Jede Schreibstelle von localStorage,
 * sessionStorage, useKV und kvAdapter wird auf ihren Schlüssel aufgelöst und mit
 * den Listen in de.json verglichen. Ein neuer Schreiber ohne Zeile in der
 * Erklärung macht den Test rot, eine Zeile ohne Schreiber ebenso.
 */

const de = deTexte as Record<string, string>
const en = enTexte as Record<string, string>

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('Altbestand im Browserspeicher', () => {
  it('entfernt die vier Einträge ohne Leser und lässt alles andere stehen', () => {
    localStorage.setItem('ss_kv_inquiries', '[{"name":"Erika Muster","email":"erika@example.org"}]')
    localStorage.setItem('ss_kv_banner_1762700000000', '{"step6":{"email":"erika@example.org"}}')
    localStorage.setItem('ss_kv_banner_1762700000001', '{}')
    localStorage.setItem('chat_audit_log', '[{"inputPreview":"Was kostet"}]')
    localStorage.setItem('chat_security_log', '[{"inputPreview":"ignore"}]')
    // Einträge mit Leser bleiben
    localStorage.setItem('ss_kv_banner_config_draft', '{"step1":{"menge":2}}')
    localStorage.setItem('ss_kv_kontakt-chat-history', '[]')
    localStorage.setItem('chat_rate_limit', '{"timestamps":[]}')
    localStorage.setItem('ss_cookie_consent', 'declined')
    localStorage.setItem('ss-lang', 'en')

    const entfernt = entferneSpeicherAltbestand()

    expect(entfernt.sort()).toEqual([
      'chat_audit_log',
      'chat_security_log',
      'ss_kv_banner_1762700000000',
      'ss_kv_banner_1762700000001',
      'ss_kv_inquiries',
    ])
    expect(Object.keys(localStorage).sort()).toEqual([
      'chat_rate_limit',
      'ss-lang',
      'ss_cookie_consent',
      'ss_kv_banner_config_draft',
      'ss_kv_kontakt-chat-history',
    ])
    expect(localStorage.getItem('ss_kv_banner_config_draft')).toBe('{"step1":{"menge":2}}')
  })

  it('ein zweiter Lauf findet nichts mehr und ein leerer Speicher bleibt leer', () => {
    localStorage.setItem('ss_kv_inquiries', '[]')
    expect(entferneSpeicherAltbestand()).toEqual(['ss_kv_inquiries'])
    expect(entferneSpeicherAltbestand()).toEqual([])
    expect(localStorage.length).toBe(0)
  })

  it('wirft nicht, wenn der Speicher gesperrt ist', () => {
    const gesperrt = {
      get length(): number {
        throw new Error('SecurityError')
      },
    } as unknown as Storage
    expect(entferneSpeicherAltbestand(gesperrt)).toEqual([])
  })
})

describe('Schreiber im Quelltext gegen Abschnitt 9 der Datenschutzerklärung', () => {
  const quellen = import.meta.glob('/src/**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>
  const dateien = Object.entries(quellen).filter(
    ([pfad]) => !pfad.includes('/__tests__/') && !pfad.includes('/src/test/') && !/\.(test|spec)\.tsx?$/.test(pfad),
  )

  /** Löst einen Bezeichner wie VISITOR_KEY zu seinem Text auf, auch über eine Zwischenkonstante. */
  function konstante(name: string, zuerst: string, tiefe = 0): string {
    if (tiefe > 3) throw new Error(`Konstante ${name} nicht auflösbar`)
    const muster = new RegExp(`const\\s+${name}\\s*=\\s*(?:'([^']+)'|([A-Z_][A-Z0-9_]*))`)
    for (const text of [zuerst, ...dateien.map(([, t]) => t)]) {
      const treffer = muster.exec(text)
      if (treffer?.[1]) return treffer[1]
      if (treffer?.[2]) return konstante(treffer[2], text, tiefe + 1)
    }
    throw new Error(`Konstante ${name} nicht gefunden`)
  }

  /** Alle Schlüssel, die der Quelltext in localStorage oder sessionStorage schreibt. */
  function geschriebeneSchluessel(): string[] {
    const schluessel: string[] = []
    for (const [pfad, text] of dateien) {
      for (const treffer of text.matchAll(/(?:localStorage|sessionStorage)\.setItem\(\s*([^,]+?)\s*,/g)) {
        const ausdruck = treffer[1]
        // Die zwei allgemeinen Schreiber: ihre Schlüssel kommen von den Aufrufern unten.
        if (pfad.endsWith('/hooks/use-kv.ts') && ausdruck === '`${KV_PREFIX}${key}`') continue
        if (pfad.endsWith('/lib/local-storage-adapter.ts') && ausdruck === 'KV_PREFIX + key') continue
        if (/^'[^']+'$/.test(ausdruck)) schluessel.push(ausdruck.slice(1, -1))
        else if (/^[A-Z_][A-Z0-9_]*$/.test(ausdruck)) schluessel.push(konstante(ausdruck, text))
        else throw new Error(`${pfad}: Schlüssel-Ausdruck ${ausdruck} ist nicht auflösbar`)
      }
      for (const treffer of text.matchAll(/useKV(?:<[^(]*>)?\(\s*'([^']+)'/g)) {
        schluessel.push(`ss_kv_${treffer[1]}`)
      }
    }
    return schluessel
  }

  /** Namen vor dem ersten Doppelpunkt jeder Listenzeile, z. B. „a, b und c: …". */
  function genannt(liste: string): string[] {
    return liste.split('\n').flatMap((zeile) => zeile.split(':')[0].match(/[a-z]+[_-][A-Za-z0-9_-]+/g) ?? [])
  }

  it('der Quelltext hat Schreiber, und der allgemeine kvAdapter hat keinen Aufrufer', () => {
    expect(dateien.length).toBeGreaterThan(50)
    expect(geschriebeneSchluessel().length).toBeGreaterThan(8)
    for (const [pfad, text] of dateien) {
      expect(text.includes('kvAdapter.set('), `${pfad} ruft kvAdapter.set`).toBe(false)
    }
  })

  it('jeder geschriebene Schlüssel steht in der Erklärung, jeder genannte hat einen Schreiber', () => {
    const imCode = new Set(geschriebeneSchluessel())
    // Schreibt nur das Admin-Panel der Statistik, trägt keine Angabe über Besucher.
    expect(imCode.delete('ss_tracking_config')).toBe(true)

    const inDerErklaerung = [
      ...genannt(de['privacy.speicher.noetig.liste']),
      ...genannt(de['privacy.speicher.statistik.liste']),
    ]
    expect(inDerErklaerung.length).toBeGreaterThan(8)
    expect(Array.from(imCode).sort()).toEqual([...inDerErklaerung].sort())
  })

  it('die vier entfernten Einträge hat weder ein Schreiber noch die Erklärung, deutsch wie englisch', () => {
    const imCode = geschriebeneSchluessel()
    for (const weg of ['ss_kv_inquiries', 'chat_audit_log', 'chat_security_log']) {
      expect(imCode, weg).not.toContain(weg)
    }
    expect(imCode.filter((k) => /^ss_kv_banner_/.test(k))).toEqual(['ss_kv_banner_config_draft'])
    for (const texte of [de, en]) {
      const abschnitt = Object.entries(texte)
        .filter(([k]) => k.startsWith('privacy.'))
        .map(([, v]) => v)
        .join('\n')
      expect(abschnitt).not.toMatch(/ss_kv_inquiries|chat_audit_log|chat_security_log/)
      expect(abschnitt).not.toMatch(/ip-api|unsplash|istockphoto/)
    }
    expect(genannt(en['privacy.speicher.noetig.liste'])).toEqual(genannt(de['privacy.speicher.noetig.liste']))
  })
})
