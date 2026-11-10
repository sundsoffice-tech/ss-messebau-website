import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Die Warteschlange der Statistik im Browser hat Obergrenzen. Nimmt der Server länger
 * nichts an (503, 429, kein Netz), wuchs sie sonst mit jedem Ereignis und blieb liegen.
 * - höchstens 200 Ereignisse; zuerst fallen nachrangige weg (Herzschlag, Scrolltiefe,
 *   Leistung, Sichtbarkeit), dann die jüngsten übrigen; Sitzungsstart und Einstieg bleiben
 * - nichts, was älter als 24 Stunden ist (der Server verwürfe es ohnehin)
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'

interface Ereignis {
  event: string
  ts: string
  props?: Record<string, string | number | boolean>
}

function warteschlange(): Ereignis[] {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
}

function zahl(name: string): number {
  return warteschlange().filter((e) => e.event === name).length
}

async function besucher() {
  localStorage.setItem(CONSENT_KEY, 'granted')
  vi.resetModules()
  const tracker = await import('@/lib/analytics-tracker')
  tracker.trackPageView()
  return tracker
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-10T10:00:00.000Z'))
  // Der Server nimmt nichts an: Jeder Stapel wird zurückgelegt.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Obergrenzen der Statistik-Warteschlange', () => {
  it('unter der Grenze bleibt alles liegen', async () => {
    const tracker = await besucher()
    for (let i = 0; i < 50; i++) tracker.trackFirstPartyEvent('heartbeat')
    for (let i = 0; i < 50; i++) tracker.trackPhoneClick('footer')

    expect(warteschlange().length).toBe(102)
    expect(zahl('heartbeat')).toBe(50)
    expect(zahl('phone_click')).toBe(50)
  })

  it('über 200 fallen zuerst nachrangige Ereignisse weg, die ältesten zuerst', async () => {
    const tracker = await besucher()
    for (let i = 0; i < 150; i++) tracker.trackFirstPartyEvent('heartbeat', { nr: i })
    for (let i = 0; i < 100; i++) tracker.trackPhoneClick('footer')

    const schlange = warteschlange()
    expect(schlange.length).toBe(200)
    // Alle wichtigen sind noch da, von den Herzschlägen die 98 jüngsten
    expect(zahl('session_start')).toBe(1)
    expect(zahl('page_view')).toBe(1)
    expect(zahl('phone_click')).toBe(100)
    const herz = schlange.filter((e) => e.event === 'heartbeat')
    expect(herz.length).toBe(98)
    expect(herz[0].props?.nr).toBe(52)
    expect(herz[herz.length - 1].props?.nr).toBe(149)
  })

  it('reicht das nicht, fallen die jüngsten übrigen weg; Sitzungsstart und Einstieg bleiben vorn', async () => {
    const tracker = await besucher()
    for (let i = 0; i < 20; i++) tracker.trackFirstPartyEvent('scroll_depth', { depth: 25 })
    for (let i = 0; i < 260; i++) tracker.trackFirstPartyEvent('cta_click', { nr: i })

    const schlange = warteschlange()
    expect(schlange.length).toBe(200)
    expect(schlange.slice(0, 2).map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(zahl('scroll_depth')).toBe(0)
    const klicks = schlange.filter((e) => e.event === 'cta_click')
    expect(klicks.length).toBe(198)
    expect(klicks[0].props?.nr).toBe(0)
    expect(klicks[klicks.length - 1].props?.nr).toBe(197)
  })

  it('nach einem zurückgelegten Stapel gilt die Grenze weiter und die Reihenfolge bleibt', async () => {
    const tracker = await besucher()
    for (let i = 0; i < 230; i++) tracker.trackFirstPartyEvent('cta_click', { nr: i })
    // Der Zeitgeber sendet 20, der Server lehnt ab, der Stapel kommt vorn zurück
    await vi.advanceTimersByTimeAsync(2_100)

    const schlange = warteschlange()
    expect(schlange.length).toBe(200)
    expect(schlange.slice(0, 3).map((e) => e.event)).toEqual(['session_start', 'page_view', 'cta_click'])
    expect(schlange[2].props?.nr).toBe(0)
  })

  it('was älter als 24 Stunden ist, fällt beim nächsten Ereignis weg', async () => {
    const tracker = await besucher()
    for (let i = 0; i < 5; i++) tracker.trackPhoneClick('footer')
    expect(warteschlange().length).toBe(7)

    // 23 Stunden später ist noch alles da
    vi.setSystemTime(new Date('2026-11-11T09:00:00.000Z'))
    tracker.trackPhoneClick('header')
    expect(warteschlange().length).toBe(8)

    // Nach 24 Stunden und einer Minute sind die sieben alten weg, die jüngeren bleiben
    vi.setSystemTime(new Date('2026-11-11T10:01:00.000Z'))
    tracker.trackPhoneClick('header')
    const schlange = warteschlange()
    expect(schlange.length).toBe(2)
    expect(schlange.every((e) => e.event === 'phone_click')).toBe(true)
    expect(schlange.map((e) => e.ts.slice(0, 13))).toEqual(['2026-11-11T09', '2026-11-11T10'])
  })
})
