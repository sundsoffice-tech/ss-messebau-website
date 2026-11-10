import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import type { ReactNode } from 'react'
import { I18nContext, getTranslation, type Language } from '@/lib/i18n'
import { getConsent } from '@/lib/analytics'
import { useUIStore } from '@/store/ui-store'
import { HINWEIS_HOEHE_VARIABLE } from '@/hooks/use-hinweis-platz'
import CookieConsent from '@/components/CookieConsent'
import { StickyCTA, MobileStickyCTA } from '@/components/StickyCTA'

/**
 * Der Cookie-Hinweis liegt fest am unteren Rand und verdeckte dort den
 * Fuß-Verweis „Impressum" und die Kontaktleiste (Hausmessung 10.11.2026).
 *
 * 1. Solange er steht, trägt er selbst einen Verweis „Impressum".
 * 2. Solange er steht, meldet er seine Höhe als --cookie-hinweis-hoehe; die
 *    Seite hält unten so viel Platz frei, die Kontaktleiste rückt darüber.
 * 3. Nach der Wahl ist der Platz wieder weg.
 *
 * jsdom rechnet kein Layout: Die Höhe des Hinweises kommt hier aus `hoehe`,
 * der Größenbeobachter ist eine Attrappe, die ihren Rückruf herausgibt.
 */

const CONSENT_KEY = 'ss_cookie_consent'

let hoehe = 167
let beobachtet: Element[] = []
let groesseGeaendert: (() => void) | null = null
let getrennt = 0

class BeobachterAttrappe {
  constructor(rueckruf: () => void) {
    groesseGeaendert = rueckruf
  }
  observe(element: Element): void {
    beobachtet.push(element)
  }
  unobserve(): void {}
  disconnect(): void {
    getrennt += 1
  }
}

function mitSprache(lang: Language, kind: ReactNode) {
  return (
    <I18nContext.Provider value={{ lang, setLang: () => {}, t: getTranslation(lang) }}>
      {kind}
    </I18nContext.Provider>
  )
}

function platz(): string {
  return document.documentElement.style.getPropertyValue(HINWEIS_HOEHE_VARIABLE)
}

beforeEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  useUIStore.setState({ cookieSettingsOpen: false, inquiryDialogOpen: false })
  document.documentElement.style.removeProperty(HINWEIS_HOEHE_VARIABLE)
  hoehe = 167
  beobachtet = []
  groesseGeaendert = null
  getrennt = 0
  vi.stubGlobal('ResizeObserver', BeobachterAttrappe)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const h = this.getAttribute('role') === 'dialog' ? hoehe : 0
    return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: h, width: 0, height: h, toJSON: () => ({}) } as DOMRect
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Cookie-Hinweis: Verweise im Hinweis', () => {
  it('offen: „Impressum" und „Datenschutzerklärung" sind Verweise im Hinweis', () => {
    render(mitSprache('de', <CookieConsent />))
    const hinweis = screen.getByRole('dialog', { name: 'Cookie-Einstellungen' })

    expect(within(hinweis).getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/impressum')
    expect(within(hinweis).getByRole('link', { name: 'Datenschutzerklärung' })).toHaveAttribute('href', '/datenschutz')
  })

  it('englisch heißt der Verweis wie im Fuß der Seite', () => {
    render(mitSprache('en', <CookieConsent />))
    const hinweis = screen.getByRole('dialog')

    expect(getTranslation('en')('cookie.imprint')).toBe(getTranslation('en')('footer.legal.imprint'))
    expect(within(hinweis).getByRole('link', { name: 'Imprint' })).toHaveAttribute('href', '/impressum')
  })
})

describe('Cookie-Hinweis: Platz am unteren Rand', () => {
  it('offen: die gemessene Höhe steht als Platz am Dokument', () => {
    render(mitSprache('de', <CookieConsent />))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(platz()).toBe('167px')
  })

  it('wird der Hinweis höher oder niedriger, folgt der Platz', () => {
    render(mitSprache('de', <CookieConsent />))
    expect(beobachtet).toEqual([screen.getByRole('dialog')])

    hoehe = 207
    act(() => groesseGeaendert?.())
    expect(platz()).toBe('207px')

    hoehe = 109
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(platz()).toBe('109px')
  })

  it.each([
    ['Ablehnen', 'denied'],
    ['Akzeptieren', 'granted'],
  ])('nach „%s" ist der Platz weg', (knopf, wahl) => {
    render(mitSprache('de', <CookieConsent />))
    expect(platz()).toBe('167px')

    fireEvent.click(screen.getByRole('button', { name: knopf }))

    expect(getConsent()).toBe(wahl)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(platz()).toBe('')
    expect(getrennt).toBe(1)

    // Kein vergessener Lauscher: Eine spätere Größenänderung setzt nichts mehr
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(platz()).toBe('')
  })

  it('mit gespeicherter Wahl steht kein Platz; erneut geöffnet steht er wieder, nach Escape ist er weg', () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    render(mitSprache('de', <CookieConsent />))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(platz()).toBe('')

    act(() => useUIStore.getState().openCookieSettings())
    expect(platz()).toBe('167px')

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(platz()).toBe('')
  })
})

describe('Cookie-Hinweis: wer den Platz liest', () => {
  it('die Seite hält unten den Platz des Hinweises frei (index.css)', () => {
    const css = readFileSync('src/index.css', 'utf8')

    expect(css).toContain(`padding-bottom: var(${HINWEIS_HOEHE_VARIABLE}, 0px);`)
  })

  it('die Kontaktleiste sitzt über dem Hinweis, mobil bündig und am Desktop mit ihrem Randabstand', () => {
    render(
      <>
        <StickyCTA onClick={() => {}} />
        <MobileStickyCTA onClick={() => {}} />
      </>,
    )
    const [desktop, mobil] = screen.getAllByRole('group', { name: 'sticky.contactOptions' })

    expect(desktop.className.split(/\s+/)).toContain(`bottom-[calc(var(${HINWEIS_HOEHE_VARIABLE},0px)+1.5rem)]`)
    expect(mobil.className.split(/\s+/)).toContain(`bottom-[var(${HINWEIS_HOEHE_VARIABLE},0px)]`)
    // Kein zweiter Abstand nach unten, der den ersten überstimmt
    for (const leiste of [desktop, mobil]) {
      expect(leiste.className.split(/\s+/).filter((klasse) => klasse.startsWith('bottom-'))).toHaveLength(1)
    }
  })
})
