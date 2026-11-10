import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { installBrowserShims } from '@/test/browser-shims'
import { I18nContext, getTranslation, type Language } from '@/lib/i18n'
import { getConsent } from '@/lib/analytics'
import { trackPageView } from '@/lib/analytics-tracker'
import { useUIStore } from '@/store/ui-store'
import { GoogleMapConsent, MAP_EMBED_URL, MAP_LINK_URL } from '@/components/GoogleMapConsent'
import { KontaktPage } from '@/components/pages/KontaktPage'
import { Footer } from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'

/**
 * Was der Besucher von der Einwilligung sieht:
 * 1. B5: Die Google-Karte auf /kontakt steht erst nach einem Klick im Dokument.
 * 2. B3: „Cookie-Einstellungen" im Footer öffnet den Banner erneut; „Ablehnen"
 *    nach früherem „Akzeptieren" räumt die Statistikschlüssel ab.
 */

const CONSENT_KEY = 'ss_cookie_consent'

function mitSprache(lang: Language, kind: ReactNode) {
  return (
    <I18nContext.Provider value={{ lang, setLang: () => {}, t: getTranslation(lang) }}>
      {kind}
    </I18nContext.Provider>
  )
}

function statistikSchluessel(): string[] {
  const namen: string[] = []
  for (const speicher of [localStorage, sessionStorage]) {
    for (let i = 0; i < speicher.length; i++) namen.push(speicher.key(i) as string)
  }
  return namen.filter((name) => name.startsWith('ss_') && name !== CONSENT_KEY).sort()
}

beforeAll(() => {
  installBrowserShims()
})

beforeEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  useUIStore.setState({ cookieSettingsOpen: false, inquiryDialogOpen: false })
})

describe('Google-Karte hinter einem Klick', () => {
  it('ohne Klick steht kein iframe im Dokument; Adresse, Hinweis und Verweis sind sichtbar', () => {
    const { container } = render(mitSprache('de', <GoogleMapConsent />))

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.innerHTML).not.toContain('output=embed')
    expect(screen.getByText('Marienstraße 37, 41836 Hückelhoven')).toBeInTheDocument()
    expect(screen.getByText(/werden Daten wie Ihre IP-Adresse an Google übertragen/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Karte laden (Google Maps)' })).toBeInTheDocument()

    const verweis = screen.getByRole('link', { name: 'In Google Maps öffnen' })
    expect(verweis).toHaveAttribute('href', MAP_LINK_URL)
    expect(verweis).toHaveAttribute('target', '_blank')
    expect(verweis.getAttribute('rel')).toContain('noopener')
    expect(MAP_LINK_URL.startsWith('https://www.google.com/maps/')).toBe(true)
  })

  it('der Klick auf den Knopf lädt die Karte; Adresse und Verweis bleiben stehen', () => {
    const { container } = render(mitSprache('de', <GoogleMapConsent />))

    fireEvent.click(screen.getByRole('button', { name: 'Karte laden (Google Maps)' }))

    const karte = container.querySelector('iframe')
    expect(karte).not.toBeNull()
    expect(karte).toHaveAttribute('src', MAP_EMBED_URL)
    expect(karte).toHaveAttribute('title', 'S&S Messebau Standort')
    expect(screen.queryByRole('button', { name: 'Karte laden (Google Maps)' })).toBeNull()
    expect(screen.getByText('Marienstraße 37, 41836 Hückelhoven')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'In Google Maps öffnen' })).toHaveAttribute('href', MAP_LINK_URL)
  })

  it('englische Fassung: Hinweis, Knopf und Verweis sind übersetzt', () => {
    render(mitSprache('en', <GoogleMapConsent />))

    expect(screen.getByText(/sends data such as your IP address to Google/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load map (Google Maps)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open in Google Maps' })).toBeInTheDocument()
  })

  it('die Kontaktseite bindet die Karte nur über den Platzhalter ein', () => {
    const { container } = render(<KontaktPage />)

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.innerHTML).not.toContain('google.com/maps?')
    // Ohne Sprachkontext liefert t() den Schlüssel
    fireEvent.click(screen.getByRole('button', { name: 'kontakt.map.load' }))
    expect(container.querySelector('iframe')).toHaveAttribute('src', MAP_EMBED_URL)
  })
})

describe('Cookie-Banner und Widerrufsweg', () => {
  it('erster Besuch: Banner sichtbar, nach „Akzeptieren" weg', () => {
    render(<CookieConsent />)

    const banner = screen.getByRole('dialog', { name: 'cookie.ariaLabel' })
    fireEvent.click(within(banner).getByRole('button', { name: 'cookie.accept' }))

    expect(getConsent()).toBe('granted')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('mit gespeicherter Entscheidung bleibt der Banner zu, bis der Footer-Verweis ihn öffnet', () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    render(<><Footer /><CookieConsent /></>)
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'footer.legal.cookies' }))

    expect(screen.getByRole('dialog', { name: 'cookie.ariaLabel' })).toBeInTheDocument()
    // Fokus liegt im Banner, damit die Tastatur dort weitermacht
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'cookie.decline' }))
  })

  it('„Ablehnen" nach früherem „Akzeptieren" entfernt die Statistikschlüssel und schließt den Banner', () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    trackPageView()
    expect(statistikSchluessel()).toEqual([
      'ss_analytics_queue',
      'ss_analytics_session',
      'ss_analytics_visitor',
      'ss_last_visit',
      'ss_page_count',
      'ss_session_start_sent',
      'ss_visit_count',
    ])
    render(<><Footer /><CookieConsent /></>)

    fireEvent.click(screen.getByRole('button', { name: 'footer.legal.cookies' }))
    fireEvent.click(screen.getByRole('button', { name: 'cookie.decline' }))

    expect(getConsent()).toBe('denied')
    expect(statistikSchluessel()).toEqual([])
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(useUIStore.getState().cookieSettingsOpen).toBe(false)
  })

  it('Escape schließt den erneut geöffneten Banner, ohne die Entscheidung zu ändern', () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    render(<><Footer /><CookieConsent /></>)
    const verweis = screen.getByRole('button', { name: 'footer.legal.cookies' })
    verweis.focus()
    fireEvent.click(verweis)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(getConsent()).toBe('granted')
    expect(document.activeElement).toBe(verweis)
  })

  it('ohne Entscheidung schließt Escape den Banner nicht', () => {
    render(<CookieConsent />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(getConsent()).toBeNull()
  })

  it('der Footer-Verweis ist in beiden Sprachen beschriftet', () => {
    expect(getTranslation('de')('footer.legal.cookies')).toBe('Cookie-Einstellungen')
    expect(getTranslation('en')('footer.legal.cookies')).toBe('Cookie settings')
  })
})
