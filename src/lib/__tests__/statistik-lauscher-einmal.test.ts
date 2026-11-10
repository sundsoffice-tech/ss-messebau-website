import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * `trackPageView` läuft bei jedem Seitenwechsel der Anwendung und ruft dabei
 * `initScrollDepthTracking` und `initEngagementTracking`. Beide hängten jedes Mal
 * neue Lauscher an: Nach drei Seitenaufrufen kam je Tabwechsel dreimal
 * `tab_visibility`, beim Verlassen dreimal `page_engagement`, und die
 * Verweildauer wurde mehrfach aufaddiert. Die Lauscher hängen jetzt einmal.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'

type Ereignis = { event: string; props?: Record<string, string | number | boolean> }
type Ziel = Window | Document
type Lauscher = EventListenerOrEventListenerObject

let angehaengt: Array<[Ziel, string, Lauscher]> = []
let gesendet: Ereignis[] = []

/** Alles, was die Statistik eingereiht oder schon abgeschickt hat. */
function ereignisse(name: string): Ereignis[] {
  const wartend = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
  return [...gesendet, ...wartend].filter((e) => e.event === name)
}

function sichtbarkeit(verborgen: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => verborgen })
  document.dispatchEvent(new Event('visibilitychange'))
}

async function trackerLaden() {
  vi.resetModules()
  return import('@/lib/analytics-tracker')
}

function seitenwechsel(tracker: { trackPageView: () => void }, pfad: string) {
  window.history.pushState(null, '', pfad)
  tracker.trackPageView()
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem(CONSENT_KEY, 'granted')
  vi.useFakeTimers()
  gesendet = []
  vi.stubGlobal('fetch', vi.fn(async (_adresse: string, optionen: { body: string }) => {
    gesendet.push(...(JSON.parse(optionen.body).events as Ereignis[]))
    return { ok: true }
  }))
  window.history.pushState({}, '', '/')
  // Jeder Fall lädt das Modul neu; im Browser gibt es je Seite genau ein Modul. Die Lauscher
  // früherer Fälle werden deshalb wieder entfernt, sonst antworteten sie mit.
  angehaengt = []
  for (const ziel of [window, document] as Ziel[]) {
    const anhaengen = ziel.addEventListener.bind(ziel)
    vi.spyOn(ziel, 'addEventListener').mockImplementation(((typ: string, lauscher: Lauscher, optionen?: boolean | AddEventListenerOptions) => {
      angehaengt.push([ziel, typ, lauscher])
      anhaengen(typ, lauscher, optionen)
    }) as typeof ziel.addEventListener)
  }
})

afterEach(() => {
  for (const [ziel, typ, lauscher] of angehaengt) ziel.removeEventListener(typ, lauscher)
  vi.restoreAllMocks()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
})

describe('Lauscher der Statistik hängen je Seite einmal', () => {
  it('drei Seitenaufrufe hängen je einen Lauscher für Scrollen, Sichtbarkeit und Verlassen an', async () => {
    const tracker = await trackerLaden()
    tracker.trackPageView()
    const nachErstem = angehaengt.length
    seitenwechsel(tracker, '/leistungen')
    seitenwechsel(tracker, '/kontakt')

    // Die weiteren Seitenaufrufe hängen nichts mehr an
    expect(angehaengt.length).toBe(nachErstem)
    const zahl = (ziel: Ziel, typ: string) => angehaengt.filter(([z, t]) => z === ziel && t === typ).length
    expect(zahl(window, 'scroll')).toBe(1)
    expect(zahl(document, 'visibilitychange')).toBe(1)
  })

  it('nach drei Seitenaufrufen meldet ein Tabwechsel genau ein Ereignis je Richtung', async () => {
    const tracker = await trackerLaden()
    tracker.trackPageView()
    seitenwechsel(tracker, '/leistungen')
    seitenwechsel(tracker, '/kontakt')

    sichtbarkeit(true)
    sichtbarkeit(false)

    const meldungen = ereignisse('tab_visibility')
    expect(meldungen.map((e) => e.props?.state)).toEqual(['hidden', 'visible'])
  })

  it('beim Verlassen geht die Verweildauer einmal hinaus und zählt nicht mehrfach', async () => {
    const tracker = await trackerLaden()
    tracker.trackPageView()
    seitenwechsel(tracker, '/leistungen')
    seitenwechsel(tracker, '/kontakt')

    vi.advanceTimersByTime(10_000)
    window.dispatchEvent(new Event('beforeunload'))

    const meldungen = ereignisse('page_engagement')
    expect(meldungen.length).toBe(1)
    expect(meldungen[0].props?.engagement_seconds).toBe(10)
    expect(meldungen[0].props?.page).toBe('/kontakt')
  })

  it('die Messung beginnt mit jedem Seitenaufruf neu', async () => {
    const tracker = await trackerLaden()
    tracker.trackPageView()
    vi.advanceTimersByTime(30_000)
    seitenwechsel(tracker, '/kontakt')
    vi.advanceTimersByTime(4_000)

    window.dispatchEvent(new Event('beforeunload'))

    const meldungen = ereignisse('page_engagement')
    expect(meldungen.map((e) => e.props?.engagement_seconds)).toEqual([4])
  })

  it('verborgene Zeit zählt nicht zur Verweildauer', async () => {
    const tracker = await trackerLaden()
    tracker.trackPageView()
    seitenwechsel(tracker, '/kontakt')

    vi.advanceTimersByTime(5_000)
    sichtbarkeit(true)
    vi.advanceTimersByTime(60_000)
    sichtbarkeit(false)
    vi.advanceTimersByTime(3_000)
    window.dispatchEvent(new Event('beforeunload'))

    expect(ereignisse('page_engagement').map((e) => e.props?.engagement_seconds)).toEqual([8])
  })
})
