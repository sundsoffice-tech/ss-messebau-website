import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Der Sitzungsstart trägt, ob der Besucher schon einmal da war. Der Zähler wurde
 * vor dem Lesen erhöht: `is_returning` war bei jedem Sitzungsstart wahr (die
 * Rückkehrquote der Auswertung damit 100 Prozent), und `last_visit` trug den
 * Zeitpunkt des laufenden Besuchs statt des vorigen.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'
const ERSTER_BESUCH = new Date('2026-11-03T09:15:00.000Z')
const ZWEITER_BESUCH = new Date('2026-11-10T14:40:00.000Z')

type Ereignis = { event: string; props?: Record<string, string | number | boolean> }
type Ziel = Window | Document
type Lauscher = EventListenerOrEventListenerObject

let angehaengt: Array<[Ziel, string, Lauscher]> = []
let gesendet: Ereignis[] = []

/** Alles, was die Statistik eingereiht oder schon abgeschickt hat. */
function sitzungsstarts(): Ereignis[] {
  const wartend = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
  return [...gesendet, ...wartend].filter((e) => e.event === 'session_start')
}

async function laden() {
  vi.resetModules()
  const analytics = await import('@/lib/analytics')
  const tracker = await import('@/lib/analytics-tracker')
  return { analytics, tracker }
}

/** Ein neuer Besuch: neuer Tab (leerer Sitzungsspeicher), frisch geladene Seite. */
async function neuerBesuch(zeitpunkt: Date) {
  sessionStorage.clear()
  vi.setSystemTime(zeitpunkt)
  const geladen = await laden()
  geladen.tracker.trackPageView()
  return geladen
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
  // Jeder Besuch lädt das Modul neu; die Lauscher früherer Modulsätze werden wieder entfernt.
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
})

describe('Sitzungsstart: neu oder wiederkehrend', () => {
  it('der erste Besuch gilt als neu', async () => {
    await neuerBesuch(ERSTER_BESUCH)

    const starts = sitzungsstarts()
    expect(starts.length).toBe(1)
    expect(starts[0].props?.is_returning).toBe(false)
    expect(starts[0].props?.visit_count).toBe(1)
    expect(starts[0].props?.last_visit).toBe('')
  })

  it('der zweite Besuch gilt als wiederkehrend und nennt den Zeitpunkt des ersten', async () => {
    await neuerBesuch(ERSTER_BESUCH)
    await neuerBesuch(ZWEITER_BESUCH)

    const starts = sitzungsstarts()
    expect(starts.map((e) => e.props?.is_returning)).toEqual([false, true])
    expect(starts.map((e) => e.props?.visit_count)).toEqual([1, 2])
    expect(starts[1].props?.last_visit).toBe(ERSTER_BESUCH.toISOString())
    // Der Speicher trägt danach den Stand nach diesem Besuch
    expect(localStorage.getItem('ss_visit_count')).toBe('2')
    expect(localStorage.getItem('ss_last_visit')).toBe(ZWEITER_BESUCH.toISOString())
  })

  it('weitere Seitenaufrufe derselben Sitzung zählen keinen weiteren Besuch', async () => {
    const { tracker } = await neuerBesuch(ERSTER_BESUCH)
    window.history.pushState(null, '', '/leistungen')
    tracker.trackPageView()
    window.history.pushState(null, '', '/kontakt')
    tracker.trackPageView()

    expect(sitzungsstarts().length).toBe(1)
    expect(localStorage.getItem('ss_visit_count')).toBe('1')
  })

  it('nach Widerruf und erneuter Zustimmung beginnt die Zählung neu', async () => {
    await neuerBesuch(ERSTER_BESUCH)
    const { analytics, tracker } = await neuerBesuch(ZWEITER_BESUCH)

    analytics.setConsent('denied')
    expect(localStorage.getItem('ss_visit_count')).toBeNull()
    gesendet = []
    analytics.setConsent('granted')
    tracker.trackPageView()

    const starts = sitzungsstarts()
    expect(starts.length).toBeGreaterThan(0)
    expect(starts.every((e) => e.props?.is_returning === false)).toBe(true)
    expect(starts.every((e) => e.props?.last_visit === '')).toBe(true)
  })
})
