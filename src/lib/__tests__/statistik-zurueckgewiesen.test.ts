import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * collect.php antwortet mit 429, wenn der Anteil der Adresse vom Stapel nichts
 * annimmt (und mit 503, wenn ein Zähler ausfällt). Der Tracker wertet nur den
 * Status aus:
 * 1. Der Stapel bleibt in der Warteschlange, in seiner Reihenfolge.
 * 2. Der Tracker wiederholt nicht von selbst: ohne neues Ereignis kein weiterer Abruf.
 * 3. Mit dem nächsten Ereignis geht derselbe Stapel wieder mit, die älteren zuerst,
 *    auch wenn das Ereignis während des abgelehnten Abrufs dazukam.
 * 4. Nimmt der Server ihn dann an (200), ist die Warteschlange leer.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'

interface Ereignis {
  event: string
  session_id: string
}

type FetchMock = ReturnType<typeof vi.fn>
let fetchMock: FetchMock

function warteschlange(): Ereignis[] {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
}

function gesendet(aufruf: number): string[] {
  const init = fetchMock.mock.calls[aufruf][1] as { body: string }
  return (JSON.parse(init.body) as { events: Ereignis[] }).events.map((e) => e.event)
}

async function besucherMitZustimmung() {
  localStorage.setItem(CONSENT_KEY, 'granted')
  vi.resetModules()
  const tracker = await import('@/lib/analytics-tracker')
  tracker.trackPageView()
  tracker.trackPhoneClick('footer')
  expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view', 'phone_click'])
  return tracker
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
  vi.stubGlobal('fetch', fetchMock)
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe.each([429, 503])('Antwort %i von collect.php', (status) => {
  it('der Stapel bleibt liegen, der Tracker wiederholt nicht von selbst und sendet ihn mit dem nächsten Ereignis wieder', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status })
    const tracker = await besucherMitZustimmung()

    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(gesendet(0)).toEqual(['session_start', 'page_view', 'phone_click'])
    expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view', 'phone_click'])

    // Zehn Minuten ohne neues Ereignis: kein weiterer Abruf, keine Schleife
    await vi.advanceTimersByTimeAsync(600_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(warteschlange()).toHaveLength(3)

    // Das nächste Ereignis nimmt den liegengebliebenen Stapel mit, die älteren zuerst
    tracker.trackPhoneClick('header')
    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(gesendet(1)).toEqual(['session_start', 'page_view', 'phone_click', 'phone_click'])
    expect(warteschlange()).toEqual([])
  })

  it('ein Ereignis, das während des Abrufs dazukommt, steht nach der Ablehnung hinter dem zurückgelegten Stapel', async () => {
    let antworten: (antwort: { ok: boolean; status: number }) => void = () => {}
    fetchMock.mockImplementationOnce(() => new Promise((ok) => { antworten = ok }))
    const tracker = await besucherMitZustimmung()

    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    tracker.trackCTAClick('angebot')
    antworten({ ok: false, status })
    await vi.advanceTimersByTimeAsync(100)

    expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view', 'phone_click', 'cta_click'])

    // Der nächste Abruf sendet in dieser Reihenfolge: der Sitzungsstart zuerst
    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(gesendet(1)).toEqual(['session_start', 'page_view', 'phone_click', 'cta_click'])
    expect(warteschlange()).toEqual([])
  })

  it('wiederholte Ablehnung vervielfacht die Ereignisse nicht', async () => {
    fetchMock.mockResolvedValue({ ok: false, status })
    const tracker = await besucherMitZustimmung()

    await vi.advanceTimersByTimeAsync(2_100)
    tracker.trackPhoneClick('header')
    await vi.advanceTimersByTimeAsync(2_100)
    tracker.trackPhoneClick('kontakt')
    await vi.advanceTimersByTimeAsync(2_100)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(warteschlange().map((e) => e.event)).toEqual([
      'session_start', 'page_view', 'phone_click', 'phone_click', 'phone_click',
    ])
  })
})
