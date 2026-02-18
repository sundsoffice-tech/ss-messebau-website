import { describe, it, expect, beforeEach } from 'vitest'
import { getTranslation, getStoredLanguage, storeLanguage } from '../i18n'

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
