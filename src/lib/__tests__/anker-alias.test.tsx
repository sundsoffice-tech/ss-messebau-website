import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { installBrowserShims } from '@/test/browser-shims'
import {
  SECTION_MAP,
  SECTION_ALIASES,
  resolveSectionId,
  validateSectionExists,
  findSection,
  parseSectionHash,
  parseCurrentLocation,
} from '@/lib/section-map'
import { navigateToSection, parseDeepLink, isValidDeepLink } from '@/lib/deep-linking'
import { scrollToSection } from '@/lib/scroll-utils'
import { validateSectionMap } from '@/lib/validate-sections'
import { GuaranteeBanner } from '@/components/ui/GuaranteeBanner'

/**
 * Der Anker des 48h-Bands heißt `48h-angebot`; das Wort „Garantie" steht nicht
 * mehr in der Adresszeile. Der frühere Name `48h-garantie` bleibt als Alias
 * erreichbar, damit alte Verweise beim Band landen.
 */

beforeAll(() => {
  installBrowserShims()
})

beforeEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Anker 48h-angebot', () => {
  it('die Abschnittskarte führt nur noch den neuen Namen', () => {
    const namen = Object.values(SECTION_MAP).flatMap((abschnitte) => abschnitte.map((a) => a.id))

    expect(namen).not.toContain('48h-garantie')
    expect(SECTION_MAP['/'].map((a) => a.id)).toContain('48h-angebot')
    expect(SECTION_MAP['/ablauf'].map((a) => a.id)).toContain('48h-angebot')
    expect(validateSectionMap().errors).toEqual([])
  })

  it('jeder Alias zeigt auf einen Abschnitt, den es gibt', () => {
    const namen = new Set(Object.values(SECTION_MAP).flatMap((abschnitte) => abschnitte.map((a) => a.id)))

    expect(Object.keys(SECTION_ALIASES)).toContain('48h-garantie')
    for (const [alt, neu] of Object.entries(SECTION_ALIASES)) {
      expect(namen.has(alt)).toBe(false)
      expect(namen.has(neu)).toBe(true)
    }
  })

  it('der alte Name löst sich überall zum neuen auf, fremde Namen bleiben', () => {
    expect(resolveSectionId('48h-garantie')).toBe('48h-angebot')
    expect(resolveSectionId('48h-angebot')).toBe('48h-angebot')
    expect(resolveSectionId('faq')).toBe('faq')
    expect(resolveSectionId('constructor')).toBe('constructor')

    expect(validateSectionExists('/', '48h-garantie')).toBe(true)
    expect(isValidDeepLink('/ablauf', '48h-garantie')).toBe(true)
    expect(findSection('48h-garantie')?.id).toBe('48h-angebot')
    expect(parseSectionHash('/#48h-garantie')).toEqual({ page: '/', section: '48h-angebot' })
    expect(parseSectionHash('#/ablauf#48h-garantie')).toEqual({ page: '/ablauf', section: '48h-angebot' })
  })

  it('eine alte Adresse wird als neuer Abschnitt gelesen', () => {
    window.history.replaceState(null, '', '/#48h-garantie')

    expect(parseCurrentLocation()).toEqual({ page: '/', section: '48h-angebot' })
    expect(parseDeepLink()).toEqual({ page: '/', section: '48h-angebot' })
  })

  it('das 48h-Band trägt den Anker, und der alte Name findet es', () => {
    // Der Sprung setzt den Fokus zeitversetzt; die Uhr gehört hier dem Test
    vi.useFakeTimers()
    const { container } = render(<GuaranteeBanner />)
    const band = container.querySelector('section') as HTMLElement

    expect(band.id).toBe('48h-angebot')
    expect(document.getElementById('48h-garantie')).toBeNull()
    expect(navigateToSection('48h-garantie')).toBe(true)
    expect(scrollToSection('48h-garantie')).toBe(true)
    expect(navigateToSection('gibt-es-nicht')).toBe(false)

    vi.runAllTimers()
    expect(document.activeElement).toBe(band)
  })
})
