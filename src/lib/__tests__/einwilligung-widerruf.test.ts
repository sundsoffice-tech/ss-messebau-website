import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Widerruf der Zustimmung (B3, B4): „Ablehnen" nach früherem „Akzeptieren"
 * stoppt die Hausstatistik sofort.
 * 1. Kennung, Zähler, Sitzungsmarken und Warteschlange sind unmittelbar weg.
 * 2. `flushQueue` sendet ohne Zustimmung nichts, egal wer es auslöst
 *    (Zeitgeber, Tab-Wechsel) und egal wie der Rest in den Speicher kam.
 * 3. Ein Stapel, der beim Widerruf unterwegs war, kommt nicht zurück in den Speicher.
 * 4. Ein Widerruf in einem anderen Tab stoppt auch diesen Tab.
 * 5. Tote Exporte, die ohne Zustimmung speichern würden, gibt es nicht mehr.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'
const STATISTIK_LOCAL = ['ss_analytics_queue', 'ss_analytics_visitor', 'ss_last_visit', 'ss_visit_count']
const STATISTIK_SITZUNG = ['ss_analytics_session', 'ss_page_count', 'ss_session_start_sent']

interface Ereignis {
  event: string
  visitor_id: string
  session_id: string
}

type FetchMock = ReturnType<typeof vi.fn>
let fetchMock: FetchMock

function schluessel(speicher: Storage): string[] {
  const namen: string[] = []
  for (let i = 0; i < speicher.length; i++) namen.push(speicher.key(i) as string)
  return namen.sort()
}

function warteschlange(): Ereignis[] {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
}

/** Frische Module je Test: der Tracker hält Zustand (Zeitgeber, ausstehender Seitenaufruf). */
async function lade() {
  vi.resetModules()
  const analytics = await import('@/lib/analytics')
  const tracker = await import('@/lib/analytics-tracker')
  return { analytics, tracker }
}

/** Besucher mit Zustimmung, der schon gezählt wurde: alle Statistikschlüssel liegen im Speicher. */
async function besucherMitZustimmung() {
  localStorage.setItem(CONSENT_KEY, 'granted')
  const module = await lade()
  module.tracker.trackPageView()
  module.tracker.trackPhoneClick('footer')
  // Ausgangslage belegen, sonst prüft der Test nichts
  expect(schluessel(localStorage)).toEqual([CONSENT_KEY, ...STATISTIK_LOCAL].sort())
  expect(schluessel(sessionStorage)).toEqual(STATISTIK_SITZUNG)
  expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view', 'phone_click'])
  return module
}

function tabVerstecken(): void {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  window.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
  fetchMock = vi.fn().mockResolvedValue({ ok: true })
  vi.stubGlobal('fetch', fetchMock)
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
})

describe('Widerruf: „Ablehnen" nach früherem „Akzeptieren"', () => {
  it('entfernt sofort alle Statistikschlüssel, übrig bleibt nur die Entscheidung', async () => {
    const { analytics } = await besucherMitZustimmung()

    analytics.setConsent('denied')

    // Ohne Warten: weder Zeitgeber noch Tab-Wechsel sind bis hier gelaufen
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(localStorage.getItem(CONSENT_KEY)).toBe('denied')
    expect(schluessel(sessionStorage)).toEqual([])
  })

  it('sendet die wartenden Ereignisse nicht mehr, auch nicht beim Tab-Wechsel', async () => {
    const { analytics, tracker } = await besucherMitZustimmung()

    analytics.setConsent('denied')
    await vi.advanceTimersByTimeAsync(10_000)
    tabVerstecken()
    tracker.trackPageView()
    tracker.trackPhoneClick('footer')
    await vi.advanceTimersByTimeAsync(10_000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(schluessel(sessionStorage)).toEqual([])
  })

  it('ein Stapel, der beim Widerruf unterwegs war und scheitert, kommt nicht zurück in den Speicher', async () => {
    let scheitern: (grund: Error) => void = () => {}
    fetchMock.mockImplementationOnce(
      () => new Promise((_ok, fehler) => { scheitern = fehler }),
    )
    const { analytics } = await besucherMitZustimmung()
    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    analytics.setConsent('denied')
    scheitern(new Error('Netz weg'))
    await vi.advanceTimersByTimeAsync(100)

    expect(localStorage.getItem(QUEUE_KEY)).toBeNull()
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
  })

  it('Gegenprobe: mit Zustimmung kommt ein gescheiterter Stapel zurück in die Warteschlange', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Netz weg'))
    await besucherMitZustimmung()
    await vi.advanceTimersByTimeAsync(2_100)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(warteschlange()).toHaveLength(3)
  })

  it('erneutes Akzeptieren zählt mit neuer Kennung und neuem Sitzungsstart', async () => {
    const { analytics } = await besucherMitZustimmung()
    const alt = warteschlange()[0]

    analytics.setConsent('denied')
    analytics.setConsent('granted')

    const neu = warteschlange()
    expect(neu.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(neu[0].visitor_id).not.toBe(alt.visitor_id)
    expect(neu[0].session_id).not.toBe(alt.session_id)
    expect(localStorage.getItem('ss_visit_count')).toBe('1')
  })

  it('nach Widerruf und erneutem Akzeptieren hängt der Klick-Lauscher (Verweise nach außen) einmal, nicht doppelt', async () => {
    // Gezählt wird die Anmeldung am Dokument: Frühere Modulinstanzen dieser
    // Testdatei hängen noch am selben Dokument und würden Klicks mitzählen.
    const anmeldungen = vi.spyOn(document, 'addEventListener')
    const { analytics } = await besucherMitZustimmung()
    analytics.setConsent('denied')
    analytics.setConsent('granted')

    expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(anmeldungen.mock.calls.filter((aufruf) => aufruf[0] === 'click')).toHaveLength(1)
    anmeldungen.mockRestore()
  })
})

describe('flushQueue prüft die Zustimmung selbst', () => {
  it('Zeitgeber: nach einem Widerruf ohne Meldung an den Tracker wird nichts gesendet', async () => {
    await besucherMitZustimmung()

    // Entscheidung ändert sich am Tracker vorbei (z. B. anderer Tab, Ereignis noch nicht zugestellt)
    localStorage.setItem(CONSENT_KEY, 'denied')
    await vi.advanceTimersByTimeAsync(10_000)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(schluessel(sessionStorage)).toEqual([])
  })

  it('Tab-Wechsel: ein Rest in der Warteschlange wird ohne Zustimmung verworfen statt gesendet', async () => {
    localStorage.setItem(CONSENT_KEY, 'denied')
    localStorage.setItem(QUEUE_KEY, JSON.stringify([{ event: 'page_view', visitor_id: 'alt', session_id: 'alt' }]))
    localStorage.setItem('ss_analytics_visitor', 'alt')
    await lade()

    tabVerstecken()
    await vi.advanceTimersByTimeAsync(100)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
  })

  it('Gegenprobe: mit Zustimmung sendet der Tab-Wechsel die Warteschlange', async () => {
    await besucherMitZustimmung()

    tabVerstecken()
    await vi.advanceTimersByTimeAsync(100)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/collect.php')
  })
})

describe('Widerruf in einem anderen Tab', () => {
  it('das storage-Ereignis der Entscheidung stoppt auch diesen Tab sofort', async () => {
    await besucherMitZustimmung()

    localStorage.setItem(CONSENT_KEY, 'denied')
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY, newValue: 'denied' }))

    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(schluessel(sessionStorage)).toEqual([])
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Gegenprobe: ein fremder Schlüssel im storage-Ereignis ändert nichts', async () => {
    await besucherMitZustimmung()

    window.dispatchEvent(new StorageEvent('storage', { key: 'ss-lang', newValue: 'en' }))

    expect(warteschlange()).toHaveLength(3)
    expect(localStorage.getItem('ss_analytics_visitor')).not.toBeNull()
  })
})

describe('Tote Exporte', () => {
  it('analytics.ts kennt nur noch die Zustimmung (kein getABVariant, kein ss_ab_-Schreiber)', async () => {
    const { analytics } = await lade()
    expect(Object.keys(analytics).sort()).toEqual([
      'CONSENT_STORAGE_KEY',
      'getConsent',
      'isTrackingAllowed',
      'onConsentChange',
      'setConsent',
    ])
  })

  it('der Tracker exportiert die Funktionen ohne Aufrufer nicht mehr', async () => {
    const { tracker } = await lade()
    const namen = Object.keys(tracker)
    for (const tot of ['trackConfiguratorStep', 'trackDownloadClick', 'trackSearch', 'trackVideoPlay']) {
      expect(namen).not.toContain(tot)
    }
    // Gegenprobe: genutzte Exporte sind noch da
    expect(namen).toEqual(expect.arrayContaining(['trackPageView', 'trackFormAbandon', 'trackExitIntent']))
  })
})
