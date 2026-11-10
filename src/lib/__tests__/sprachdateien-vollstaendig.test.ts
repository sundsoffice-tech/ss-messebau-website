import { describe, it, expect } from 'vitest'
import de from '@/locales/de.json'
import en from '@/locales/en.json'
import { getTranslation } from '../i18n'

/**
 * Fehlt ein Schlüssel in en.json, zeigt die englische Fassung an der Stelle den
 * deutschen Text (Rückfall in `getTranslation`). Am 10.11.2026 fehlten so 51 Texte,
 * darunter die ganze Seite /branchen. Jeder neue Text braucht deshalb beide Sprachen.
 */

const deutsch = de as Record<string, string>
const englisch = en as Record<string, string>

describe('Sprachdateien', () => {
  it('jeder deutsche Schlüssel hat eine englische Fassung', () => {
    const fehlt = Object.keys(deutsch).filter((schluessel) => !(schluessel in englisch))
    expect(fehlt).toEqual([])
  })

  it('kein englischer Schlüssel steht ohne deutsche Fassung da', () => {
    const fehlt = Object.keys(englisch).filter((schluessel) => !(schluessel in deutsch))
    expect(fehlt).toEqual([])
  })

  it('kein Text ist leer', () => {
    const leer = [...Object.entries(deutsch), ...Object.entries(englisch)]
      .filter(([, text]) => typeof text !== 'string' || text.trim() === '')
      .map(([schluessel]) => schluessel)
    expect(leer).toEqual([])
  })

  it('die Seite /branchen und die Reiter der Referenzen sind englisch', () => {
    const t = getTranslation('en')
    for (const schluessel of [
      'branchen.tab.messebau',
      'branchen.messebau.desc',
      'branchen.eventbau.cta',
      'branchen.ladenbau.refTitle',
      'branchen.sport.b5',
      'home.references.messebau',
    ]) {
      expect(t(schluessel), schluessel).not.toBe(deutsch[schluessel])
    }
  })
})
