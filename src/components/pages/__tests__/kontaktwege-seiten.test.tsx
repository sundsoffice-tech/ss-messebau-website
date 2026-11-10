import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { installBrowserShims, preventNavigation } from '@/test/browser-shims'
import { trackInquiryOpen, trackPhoneClick, trackMailClick } from '@/lib/analytics-tracker'
import { useUIStore } from '@/store/ui-store'
import { HomePage } from '@/components/pages/HomePage'
import { KontaktPage } from '@/components/pages/KontaktPage'
import { LeistungenMessebauPage } from '@/components/pages/LeistungenMessebauPage'

/**
 * T1: Die Aufrufer auf Startseite, Leistungsseite Messebau und Kontaktseite
 * melden jeden Kontaktweg mit ihrem Ort an die Hausstatistik.
 */

vi.mock('@/lib/analytics-tracker', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/analytics-tracker')>()
  return {
    ...echt,
    trackInquiryOpen: vi.fn(),
    trackPhoneClick: vi.fn(),
    trackMailClick: vi.fn(),
  }
})

beforeAll(() => {
  installBrowserShims()
})

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  useUIStore.setState({ inquiryDialogOpen: false })
})

function oeffnetDialogMitOrt(knopf: HTMLElement, ort: string) {
  fireEvent.click(knopf)
  expect(trackInquiryOpen).toHaveBeenCalledTimes(1)
  expect(trackInquiryOpen).toHaveBeenCalledWith(ort)
  expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
}

describe('HomePage', () => {
  it('Hero-Knopf zählt die Öffnung mit Ort hero', () => {
    render(<HomePage />)
    oeffnetDialogMitOrt(screen.getByRole('button', { name: 'home.hero.ctaAria' }), 'hero')
  })

  it('Knopf im Abschlussblock zählt die Öffnung mit Ort cta_section', () => {
    render(<HomePage />)
    oeffnetDialogMitOrt(screen.getByRole('button', { name: /home\.cta\.button/ }), 'cta_section')
  })
})

describe('LeistungenMessebauPage', () => {
  it.each([
    ['Jetzt Messestand anfragen', 'leistungen_messebau_hero'],
    ['Kostenlose Beratung', 'leistungen_messebau_hero_beratung'],
    ['Angebot anfordern', 'leistungen_messebau_cta'],
    ['Rückruf vereinbaren', 'leistungen_messebau_cta_rueckruf'],
  ])('Knopf „%s" zählt die Öffnung mit Ort %s', (beschriftung, ort) => {
    render(<LeistungenMessebauPage />)
    oeffnetDialogMitOrt(screen.getByRole('button', { name: beschriftung }), ort)
  })
})

describe('KontaktPage', () => {
  it('Telefon-Link zählt phone_click mit Ort kontakt_seite', () => {
    render(<KontaktPage />)
    fireEvent.click(preventNavigation(screen.getByRole('link', { name: '+49 1514 0368754' })))
    expect(trackPhoneClick).toHaveBeenCalledTimes(1)
    expect(trackPhoneClick).toHaveBeenCalledWith('kontakt_seite')
  })

  it('Mail-Link zählt den Mail-Klick mit Ort kontakt_seite', () => {
    render(<KontaktPage />)
    fireEvent.click(preventNavigation(screen.getByRole('link', { name: 'info@sundsmessebau.com' })))
    expect(trackMailClick).toHaveBeenCalledTimes(1)
    expect(trackMailClick).toHaveBeenCalledWith('kontakt_seite')
  })
})
