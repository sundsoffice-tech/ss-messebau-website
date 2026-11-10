import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { installBrowserShims } from '@/test/browser-shims'
import { I18nContext, getTranslation } from '@/lib/i18n'

/**
 * Der Entwurf des Banner-Konfigurators (`ss_kv_banner_config_draft`) trägt
 * Firma, Ansprechpartner, E-Mail, Telefon und die Druckdateien. Er hat eine
 * Aufgabe, solange die Bestellung nicht abgeschickt ist. Sobald Backend oder
 * Mail sie angenommen haben, wird er aus dem Browser entfernt; scheitern beide
 * Wege, bleibt er stehen, damit nichts neu eingegeben werden muss.
 *
 * Die sechs Schritte sind hier durch Knöpfe ersetzt: geprüft wird der Weg der
 * Seite, nicht das Formular der Schritte.
 */

const ENTWURF = 'ss_kv_banner_config_draft'

const wege = vi.hoisted(() => ({
  bestellung: vi.fn(),
  mail: vi.fn(),
  webhook: vi.fn(),
  fehlermeldung: vi.fn(),
}))

vi.mock('@/lib/api-client', () => ({ ordersApi: { create: wege.bestellung } }))
vi.mock('@/lib/email-service', () => ({ sendOrderConfirmationEmail: wege.mail }))
vi.mock('@/lib/notification-service', () => ({ sendWebhooksOnly: wege.webhook }))
vi.mock('sonner', () => ({ toast: { error: wege.fehlermeldung, success: vi.fn() } }))

type SchrittProps = {
  onChange?: (daten: Record<string, unknown>) => void
  onNext?: () => void
  onSubmit?: () => void
}

function schritt(nummer: number) {
  return ({ onChange, onNext, onSubmit }: SchrittProps) => (
    <div>
      <span>Schritt {nummer}</span>
      {nummer === 6 && (
        <button onClick={() => onChange?.({ firmaKontakt: 'Probe GmbH', email: 'probe@example.org', telefon: '0123' })}>
          Kontakt eintragen
        </button>
      )}
      {onNext && <button onClick={onNext}>Weiter</button>}
      {onSubmit && <button onClick={onSubmit}>Absenden</button>}
    </div>
  )
}

vi.mock('@/components/pages/configurator/ConfiguratorStep1', () => ({ ConfiguratorStep1: schritt(1) }))
vi.mock('@/components/pages/configurator/ConfiguratorStep2', () => ({ ConfiguratorStep2: schritt(2) }))
vi.mock('@/components/pages/configurator/ConfiguratorStep3', () => ({ ConfiguratorStep3: schritt(3) }))
vi.mock('@/components/pages/configurator/ConfiguratorStep4', () => ({ ConfiguratorStep4: schritt(4) }))
vi.mock('@/components/pages/configurator/ConfiguratorStep5', () => ({ ConfiguratorStep5: schritt(5) }))
vi.mock('@/components/pages/configurator/ConfiguratorStep6', () => ({ ConfiguratorStep6: schritt(6) }))
vi.mock('@/components/pages/configurator/ConfigSummary', () => ({ ConfigSummary: () => null }))
vi.mock('@/components/pages/configurator/ThankYouPage', () => ({
  ThankYouPage: ({ config }: { config: { step6: { firmaKontakt: string } } }) => (
    <div>Danke, {config.step6.firmaKontakt}</div>
  ),
}))

import { BannerBestellenPage } from '@/components/pages/BannerBestellenPage'

function mitSprache(kind: ReactNode) {
  return (
    <I18nContext.Provider value={{ lang: 'de', setLang: () => {}, t: getTranslation('de') }}>
      {kind}
    </I18nContext.Provider>
  )
}

/** Geht bis Schritt 6, trägt Kontaktdaten ein und schickt ab. */
async function bestelle() {
  render(mitSprache(<BannerBestellenPage />))
  for (let i = 1; i <= 5; i++) fireEvent.click(screen.getByText('Weiter'))
  expect(screen.getByText('Schritt 6')).toBeTruthy()
  fireEvent.click(screen.getByText('Kontakt eintragen'))
  await waitFor(() => expect(localStorage.getItem(ENTWURF)).toContain('Probe GmbH'))
  fireEvent.click(screen.getByText('Absenden'))
}

beforeAll(() => {
  installBrowserShims()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

beforeEach(() => {
  localStorage.clear()
  wege.bestellung.mockReset().mockResolvedValue({})
  wege.mail.mockReset().mockResolvedValue({ success: true })
  wege.webhook.mockReset().mockResolvedValue(undefined)
  wege.fehlermeldung.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('Banner-Bestellung: Entwurf im Browser', () => {
  it('liegt vor dem Absenden mit den Kontaktdaten im Browser', async () => {
    render(mitSprache(<BannerBestellenPage />))
    for (let i = 1; i <= 5; i++) fireEvent.click(screen.getByText('Weiter'))
    fireEvent.click(screen.getByText('Kontakt eintragen'))

    await waitFor(() => expect(localStorage.getItem(ENTWURF)).toContain('probe@example.org'))
    expect(wege.bestellung).not.toHaveBeenCalled()
  })

  it('ist nach angenommener Bestellung entfernt, die Dankeseite zeigt den Stand trotzdem', async () => {
    await bestelle()

    await waitFor(() => expect(screen.getByText('Danke, Probe GmbH')).toBeTruthy())
    expect(wege.bestellung).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(ENTWURF)).toBeNull()
    // Auch sonst bleibt keine Kopie der Bestellung zurück
    expect(Object.keys(localStorage).filter((name) => name.startsWith('ss_kv_'))).toEqual([])
  })

  it('ist auch entfernt, wenn nur die Mail durchging', async () => {
    wege.bestellung.mockRejectedValue(new Error('Backend nicht erreichbar'))

    await bestelle()

    await waitFor(() => expect(screen.getByText('Danke, Probe GmbH')).toBeTruthy())
    expect(localStorage.getItem(ENTWURF)).toBeNull()
  })

  it('bleibt stehen, wenn weder Backend noch Mail die Bestellung annehmen', async () => {
    wege.bestellung.mockRejectedValue(new Error('Backend nicht erreichbar'))
    wege.mail.mockResolvedValue({ success: false })

    await bestelle()

    await waitFor(() => expect(wege.fehlermeldung).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/Danke/)).toBeNull()
    expect(localStorage.getItem(ENTWURF)).toContain('Probe GmbH')
  })

  it('beginnt nach angenommener Bestellung beim nächsten Aufruf leer', async () => {
    await bestelle()
    await waitFor(() => expect(screen.getByText('Danke, Probe GmbH')).toBeTruthy())
    cleanup()

    render(mitSprache(<BannerBestellenPage />))

    expect(screen.getByText('Schritt 1')).toBeTruthy()
    expect(localStorage.getItem(ENTWURF)).toBeNull()
  })
})
