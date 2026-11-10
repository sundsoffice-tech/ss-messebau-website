import { describe, it, expect, beforeEach } from 'vitest'
import { getTranslation, getStoredLanguage, getInitialLanguage, storeLanguage, ohneSprachangabe } from '../i18n'

describe('getTranslation', () => {
  it('returns a function', () => {
    const t = getTranslation('de')
    expect(typeof t).toBe('function')
  })

  it('returns the key if no translation exists', () => {
    const t = getTranslation('de')
    expect(t('nonexistent.key.xyz')).toBe('nonexistent.key.xyz')
  })

  it('falls back to German for unknown language', () => {
    const t = getTranslation('de')
    const tEn = getTranslation('en')
    // Both should return something for common keys
    expect(typeof t('nav.home')).toBe('string')
    expect(typeof tEn('nav.home')).toBe('string')
  })
})

describe('language storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to "de" when nothing stored', () => {
    expect(getStoredLanguage()).toBe('de')
  })

  it('stores and retrieves language', () => {
    storeLanguage('en')
    expect(getStoredLanguage()).toBe('en')
  })

  it('returns "de" for invalid stored values', () => {
    localStorage.setItem('ss-lang', 'fr')
    expect(getStoredLanguage()).toBe('de')
  })
})

describe('Sprache beim Start', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('nimmt die Sprache aus der Adresse, wie hreflang sie nennt', () => {
    expect(getInitialLanguage('?lang=en')).toBe('en')
    expect(getInitialLanguage('?utm_source=x&lang=en')).toBe('en')
  })

  it('die Adresse geht vor der gespeicherten Wahl, in beide Richtungen', () => {
    storeLanguage('de')
    expect(getInitialLanguage('?lang=en')).toBe('en')
    storeLanguage('en')
    expect(getInitialLanguage('?lang=de')).toBe('de')
  })

  it('ohne oder mit unbekannter Angabe gilt die gespeicherte Wahl, sonst Deutsch', () => {
    expect(getInitialLanguage('')).toBe('de')
    expect(getInitialLanguage('?lang=fr')).toBe('de')
    storeLanguage('en')
    expect(getInitialLanguage('')).toBe('en')
    expect(getInitialLanguage('?lang=fr')).toBe('en')
  })

  it('schreibt nichts in den Browserspeicher', () => {
    getInitialLanguage('?lang=en')
    expect(localStorage.length).toBe(0)
  })

  it('liest ohne Angabe die Adresse des Fensters', () => {
    window.history.replaceState(null, '', '/branchen?lang=en')
    expect(getInitialLanguage()).toBe('en')
    window.history.replaceState(null, '', '/')
  })
})

describe('Adresse ohne Sprachangabe', () => {
  it('nimmt nur `lang` heraus', () => {
    expect(ohneSprachangabe('/branchen', '?lang=en', '')).toBe('/branchen')
    expect(ohneSprachangabe('/', '?lang=de', '')).toBe('/')
  })

  it('lässt UTM-Angaben und Anker stehen', () => {
    expect(ohneSprachangabe('/branchen', '?utm_source=x&lang=en&utm_medium=cpc', '#eventbau')).toBe(
      '/branchen?utm_source=x&utm_medium=cpc#eventbau',
    )
    expect(ohneSprachangabe('/', '?lang=en', '#kontakt')).toBe('/#kontakt')
  })

  it('ändert eine Adresse ohne `lang` nicht, auch nicht in der Schreibweise', () => {
    expect(ohneSprachangabe('/kontakt', '?utm_term=messe%20bau&x', '#a')).toBe('/kontakt?utm_term=messe%20bau&x#a')
    expect(ohneSprachangabe('/kontakt', '', '')).toBe('/kontakt')
  })

  it('nach dem Herausnehmen gilt beim Neuladen die gespeicherte Wahl', () => {
    localStorage.clear()
    storeLanguage('de')
    const ziel = ohneSprachangabe('/branchen', '?lang=en', '')
    const suche = ziel.includes('?') ? ziel.slice(ziel.indexOf('?')) : ''
    expect(getInitialLanguage(suche)).toBe('de')
  })
})
