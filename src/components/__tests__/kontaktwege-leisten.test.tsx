import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { installBrowserShims, preventNavigation } from '@/test/browser-shims'
import {
  trackInquiryOpen,
  trackPhoneClick,
  trackMailClick,
  trackWhatsAppLinkClick,
} from '@/lib/analytics-tracker'
import { useUIStore } from '@/store/ui-store'
import { StickyCTA, MobileStickyCTA } from '@/components/StickyCTA'
import { GuaranteeBanner } from '@/components/ui/GuaranteeBanner'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

/**
 * T1: Die Aufrufer in Leiste, 48h-Band, Kopf- und Fußzeile melden jeden
 * Kontaktweg mit ihrem Ort an die Hausstatistik. Geprüft wird der Aufruf am
 * gerenderten Bedienelement; die Form des Ereignisses prüft
 * `src/lib/__tests__/analytics-tracker.test.ts`.
 */

vi.mock('@/lib/analytics-tracker', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/analytics-tracker')>()
  return {
    ...echt,
    trackInquiryOpen: vi.fn(),
    trackPhoneClick: vi.fn(),
    trackMailClick: vi.fn(),
    trackWhatsAppLinkClick: vi.fn(),
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

describe.each([
  ['StickyCTA (Desktop)', StickyCTA, 'sticky_desktop'],
  ['MobileStickyCTA (Mobil)', MobileStickyCTA, 'sticky_mobile'],
])('%s', (_name, Component, ort) => {
  // Verdrahtung wie in App.tsx: onClick={openInquiry}
  it('WhatsApp-Link zählt whatsapp_click mit dem Ort der Leiste', () => {
    render(<Component onClick={useUIStore.getState().openInquiry} />)
    fireEvent.click(preventNavigation(screen.getByRole('link', { name: /sticky\.whatsapp/ })))
    expect(trackWhatsAppLinkClick).toHaveBeenCalledTimes(1)
    expect(trackWhatsAppLinkClick).toHaveBeenCalledWith(ort)
    expect(trackInquiryOpen).not.toHaveBeenCalled()
  })

  it('Anfrage-Knopf öffnet den Dialog und zählt die Öffnung mit dem Ort der Leiste', () => {
    render(<Component onClick={useUIStore.getState().openInquiry} />)
    fireEvent.click(screen.getByRole('button', { name: /sticky\.inquiry/ }))
    expect(trackInquiryOpen).toHaveBeenCalledTimes(1)
    expect(trackInquiryOpen).toHaveBeenCalledWith(ort)
    expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
  })
})

describe('GuaranteeBanner (48h-Band)', () => {
  it('Knopf öffnet den Dialog und zählt die Öffnung mit Ort 48h_banner', () => {
    render(<GuaranteeBanner />)
    fireEvent.click(screen.getByRole('button', { name: /guarantee\.cta/ }))
    expect(trackInquiryOpen).toHaveBeenCalledTimes(1)
    expect(trackInquiryOpen).toHaveBeenCalledWith('48h_banner')
    expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
  })
})

describe('Footer', () => {
  it('Telefon-Link zählt phone_click mit Ort footer', () => {
    render(<Footer />)
    fireEvent.click(preventNavigation(screen.getByRole('link', { name: /footer\.contact\.call/ })))
    expect(trackPhoneClick).toHaveBeenCalledTimes(1)
    expect(trackPhoneClick).toHaveBeenCalledWith('footer')
    expect(trackMailClick).not.toHaveBeenCalled()
  })

  it('Mail-Link zählt den Mail-Klick mit Ort footer', () => {
    render(<Footer />)
    fireEvent.click(preventNavigation(screen.getByRole('link', { name: /footer\.contact\.email/ })))
    expect(trackMailClick).toHaveBeenCalledTimes(1)
    expect(trackMailClick).toHaveBeenCalledWith('footer')
    expect(trackPhoneClick).not.toHaveBeenCalled()
  })
})

describe('Header', () => {
  it('die drei Anfrage-Knöpfe (Desktop, Tablet, Mobil) zählen die Öffnung je mit eigenem Ort', () => {
    render(<Header />)
    const knoepfe = screen.getAllByRole('button', { name: 'header.nav.inquiry' })
    expect(knoepfe).toHaveLength(3)
    const orte = ['header_desktop', 'header_tablet', 'header_mobil']
    knoepfe.forEach((knopf, i) => {
      fireEvent.click(knopf)
      expect(trackInquiryOpen).toHaveBeenLastCalledWith(orte[i])
    })
    expect(trackInquiryOpen).toHaveBeenCalledTimes(3)
    expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
  })

  it('Telefon und Mail im mobilen Menü zählen mit Ort header_mobilmenue', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'header.nav.menuOpen' }))

    fireEvent.click(preventNavigation(screen.getByRole('link', { name: /header\.nav\.call/ })))
    expect(trackPhoneClick).toHaveBeenCalledTimes(1)
    expect(trackPhoneClick).toHaveBeenCalledWith('header_mobilmenue')

    fireEvent.click(preventNavigation(screen.getByRole('link', { name: /header\.nav\.email/ })))
    expect(trackMailClick).toHaveBeenCalledTimes(1)
    expect(trackMailClick).toHaveBeenCalledWith('header_mobilmenue')
  })
})
