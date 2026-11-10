import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Herkunftsmessung (`utm-utils.ts`, B3): `ss_utm_params` entsteht nur mit
 * Zustimmung. Ohne Entscheidung liegt die Quelle der Einstiegsadresse nur im
 * Arbeitsspeicher der laufenden Seite, nach einer Ablehnung nirgends.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const UTM_KEY = 'ss_utm_params'
const KAMPAGNE = '/?utm_source=google&utm_medium=cpc&utm_campaign=messe&gclid=geheim'
const QUELLE = { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'messe' }

function schluessel(speicher: Storage): string[] {
  const namen: string[] = []
  for (let i = 0; i < speicher.length; i++) namen.push(speicher.key(i) as string)
  return namen.sort()
}

/** Lädt die Module frisch, wie ein neuer Seitenaufruf mit der aktuellen Adresse. */
async function seiteLaden(adresse: string) {
  window.history.pushState({}, '', adresse)
  vi.resetModules()
  const analytics = await import('@/lib/analytics')
  const utm = await import('@/lib/utm-utils')
  return { analytics, utm }
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('ohne Entscheidung im Banner', () => {
  it('schreibt beim Laden einer Kampagnenadresse nichts in den Browser-Speicher', async () => {
    await seiteLaden(KAMPAGNE)

    expect(schluessel(sessionStorage)).toEqual([])
    expect(schluessel(localStorage)).toEqual([])
  })

  it('hält die Quelle im Arbeitsspeicher: eine Anfrage nach dem Seitenwechsel behält sie', async () => {
    const { utm } = await seiteLaden(KAMPAGNE)
    window.history.pushState({}, '', '/kontakt')

    expect(utm.getUtmParams()).toEqual(QUELLE)
    expect(schluessel(sessionStorage)).toEqual([])
  })

  it('nach einem Neuladen ohne Kampagnenadresse ist die Quelle weg', async () => {
    await seiteLaden(KAMPAGNE)
    const { utm } = await seiteLaden('/kontakt')

    expect(utm.getUtmParams()).toEqual({})
  })

  it('liest einen vorhandenen Eintrag ohne Zustimmung nicht aus', async () => {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(QUELLE))
    const { utm } = await seiteLaden('/kontakt')

    expect(utm.getUtmParams()).toEqual({})
  })
})

describe('mit Zustimmung', () => {
  it('lag sie beim Laden vor, wird die Quelle gespeichert und übersteht ein Neuladen', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    await seiteLaden(KAMPAGNE)
    expect(JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}')).toEqual(QUELLE)

    const { utm } = await seiteLaden('/kontakt')
    expect(utm.getUtmParams()).toEqual(QUELLE)
  })

  it('kommt sie erst nach dem Laden, wird die Einstiegsquelle dann gespeichert', async () => {
    const { analytics } = await seiteLaden(KAMPAGNE)
    window.history.pushState({}, '', '/kontakt')
    expect(sessionStorage.getItem(UTM_KEY)).toBeNull()

    analytics.setConsent('granted')

    expect(JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}')).toEqual(QUELLE)
  })

  it('ohne Kampagnenadresse entsteht auch mit Zustimmung kein Eintrag', async () => {
    const { analytics } = await seiteLaden('/kontakt')
    analytics.setConsent('granted')

    expect(sessionStorage.getItem(UTM_KEY)).toBeNull()
  })
})

describe('Ablehnung und Widerruf', () => {
  it('Ablehnung: nichts gespeichert, die Anfrage geht ohne Quelle hinaus', async () => {
    const { analytics, utm } = await seiteLaden(KAMPAGNE)
    // Vor der Entscheidung trägt die Anfrage die Quelle (sonst prüft der Test nichts)
    expect(utm.getUtmParams()).toEqual(QUELLE)

    analytics.setConsent('denied')

    expect(utm.getUtmParams()).toEqual({})
    window.history.pushState({}, '', '/kontakt')
    expect(utm.getUtmParams()).toEqual({})
    expect(schluessel(sessionStorage)).toEqual([])
  })

  it('Widerruf: der gespeicherte Eintrag wird entfernt', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { analytics, utm } = await seiteLaden(KAMPAGNE)
    expect(sessionStorage.getItem(UTM_KEY)).not.toBeNull()

    analytics.setConsent('denied')

    expect(sessionStorage.getItem(UTM_KEY)).toBeNull()
    expect(utm.getUtmParams()).toEqual({})
  })

  it('war beim Laden schon abgelehnt, wird die Kampagnenadresse gar nicht erfasst', async () => {
    localStorage.setItem(CONSENT_KEY, 'denied')
    const { utm } = await seiteLaden(KAMPAGNE)

    expect(utm.getUtmParams()).toEqual({})
    expect(schluessel(sessionStorage)).toEqual([])
  })
})
