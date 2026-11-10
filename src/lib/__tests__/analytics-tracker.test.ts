import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * Hausstatistik (`analytics-tracker.ts`):
 * 1. Rechtliche Grenze: ohne Zustimmung wird nichts gespeichert und nichts gesendet.
 * 2. T2: Sitzungsstart und Seitenaufruf werden nach der Zustimmung nachgesendet,
 *    die Marke erst nach dem Einreihen gesetzt.
 * 3. T1: je Kontaktweg ein Ereignis, in der Form, die `public/api/collect.php` annimmt.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'
const MARKE = 'ss_session_start_sent'

interface Ereignis {
  event: string
  ts: string
  session_id: string
  visitor_id: string
  url: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  props?: Record<string, string | number | boolean>
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

/** Frische Module je Test: der Tracker hält Zustand (ausstehender Seitenaufruf, Timer). */
async function lade() {
  vi.resetModules()
  const analytics = await import('@/lib/analytics')
  const tracker = await import('@/lib/analytics-tracker')
  const { useUIStore } = await import('@/store/ui-store')
  return { analytics, tracker, useUIStore }
}

/** Was der Server annimmt: Liste `$validEvents` aus `public/api/collect.php`. */
function serverEreignisnamen(): string[] {
  const php = readFileSync('public/api/collect.php', 'utf8')
  const block = /\$validEvents\s*=\s*\[([\s\S]*?)\];/.exec(php)
  if (!block) throw new Error('$validEvents in collect.php nicht gefunden')
  return Array.from(block[1].matchAll(/'([a-z_]+)'/g), (m) => m[1])
}

/** Felder, die `collect.php` je Ereignis liest; alles andere ginge verloren. */
const SERVER_FELDER = [
  'event', 'ts', 'session_id', 'visitor_id', 'url', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'props',
]

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
})

describe('Rechtliche Grenze: ohne Zustimmung nichts speichern, nichts senden', () => {
  it.each([
    ['keine Entscheidung im Banner', null],
    ['Ablehnung im Banner', 'denied'],
  ])('%s: kein Speichereintrag, keine Anfrage an den Server', async (_name, entscheidung) => {
    const { analytics, tracker, useUIStore } = await lade()
    if (entscheidung === 'denied') analytics.setConsent('denied')

    tracker.trackPageView()
    tracker.trackPageView()
    tracker.trackPhoneClick('footer')
    tracker.trackWhatsAppLinkClick('sticky_mobile')
    tracker.trackMailClick('footer')
    tracker.trackInquiryOpen('hero')
    tracker.trackCTAClick('irgendein_knopf')
    tracker.trackFormSubmission('inquiry', { branche: 'messe' })
    tracker.trackBlogArticleRead('ein-artikel', 130)
    tracker.trackFirstPartyEvent('heartbeat')
    useUIStore.getState().openInquiry('hero')
    await vi.advanceTimersByTimeAsync(10_000)

    // Einzig erlaubter Eintrag: die Entscheidung selbst, wenn eine getroffen wurde
    expect(schluessel(localStorage)).toEqual(entscheidung ? [CONSENT_KEY] : [])
    expect(schluessel(sessionStorage)).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('trackPageView() ohne Zustimmung hinterlässt keinen ss_-Schlüssel (Besuchszähler, Marke, Seitenzähler)', async () => {
    const { tracker } = await lade()

    tracker.trackPageView()
    tracker.trackPageView()

    const alle = [...schluessel(localStorage), ...schluessel(sessionStorage)]
    expect(alle.filter((name) => name.startsWith('ss_'))).toEqual([])
    expect(localStorage.getItem('ss_visit_count')).toBeNull()
    expect(localStorage.getItem('ss_last_visit')).toBeNull()
    expect(sessionStorage.getItem(MARKE)).toBeNull()
    expect(sessionStorage.getItem('ss_page_count')).toBeNull()
  })

  it('nach der Zustimmung wird sauber gezählt: ein Besuch, ein Seitenaufruf', async () => {
    const { analytics, tracker } = await lade()
    tracker.trackPageView()
    tracker.trackPageView()

    analytics.setConsent('granted')

    expect(localStorage.getItem('ss_visit_count')).toBe('1')
    expect(localStorage.getItem('ss_last_visit')).not.toBeNull()
    expect(sessionStorage.getItem(MARKE)).toBe('1')
    // Die beiden Aufrufe vor der Zustimmung wurden nicht mitgezählt
    expect(sessionStorage.getItem('ss_page_count')).toBe('1')
    const seitenaufruf = warteschlange().find((e) => e.event === 'page_view')
    expect(seitenaufruf?.props?.page_count).toBe(1)
  })

  it('Ablehnung nach einem gesehenen Seitenaufruf sendet nichts nach', async () => {
    const { analytics, tracker } = await lade()
    tracker.trackPageView()
    analytics.setConsent('denied')
    await vi.advanceTimersByTimeAsync(10_000)

    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(schluessel(sessionStorage)).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('T2: Sitzungsstart und Einstiegsseite nach der Zustimmung', () => {
  it('sendet session_start und page_view der laufenden Seite nach dem Akzeptieren nach', async () => {
    window.history.pushState({}, '', '/leistungen/messebau?utm_source=google&utm_medium=cpc&gclid=geheim')
    const { analytics, tracker } = await lade()

    tracker.trackPageView()
    // Vor der Zustimmung: keine Marke (früher wurde sie hier schon gesetzt)
    expect(sessionStorage.getItem(MARKE)).toBeNull()

    analytics.setConsent('granted')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    for (const e of ereignisse) {
      expect(e.url).toBe('/leistungen/messebau?utm_source=google&utm_medium=cpc')
      expect(e.utm_source).toBe('google')
      expect(e.utm_medium).toBe('cpc')
    }
    expect(sessionStorage.getItem(MARKE)).toBe('1')

    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [adresse, optionen] = fetchMock.mock.calls[0] as [string, { method: string; body: string }]
    expect(adresse).toBe('/api/collect.php')
    expect(optionen.method).toBe('POST')
    const gesendet = (JSON.parse(optionen.body) as { events: Ereignis[] }).events
    expect(gesendet.map((e) => e.event)).toEqual(['session_start', 'page_view'])
  })

  it('zählt den Sitzungsstart nur einmal, auch bei weiteren Seitenaufrufen', async () => {
    const { analytics, tracker } = await lade()
    tracker.trackPageView()
    analytics.setConsent('granted')
    tracker.trackPageView()
    tracker.trackPageView()

    const namen = warteschlange().map((e) => e.event)
    expect(namen.filter((n) => n === 'session_start')).toHaveLength(1)
    expect(namen.filter((n) => n === 'page_view')).toHaveLength(3)
  })

  it('lag die Zustimmung schon vor, gehen beide Ereignisse sofort in die Warteschlange', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { tracker } = await lade()
    tracker.trackPageView()

    expect(warteschlange().map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(sessionStorage.getItem(MARKE)).toBe('1')
  })

  it('setzt die Marke nicht, wenn session_start verworfen wird (Admin-Schalter aus)', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { tracker } = await lade()
    const config = tracker.getTrackingConfig()
    tracker.setTrackingConfig({ ...config, events: { ...config.events, session_start: false } })

    tracker.trackPageView()

    expect(warteschlange().map((e) => e.event)).toEqual(['page_view'])
    expect(sessionStorage.getItem(MARKE)).toBeNull()
    expect(localStorage.getItem('ss_visit_count')).toBeNull()
  })
})

describe('T1: je Kontaktweg ein Ereignis in der Form von collect.php', () => {
  const wege: Array<[
    string,
    (t: typeof import('@/lib/analytics-tracker')) => void,
    string,
    Record<string, string | number | boolean>,
  ]> = [
    ['Anruf', (t) => t.trackPhoneClick('footer'), 'phone_click', { source: 'footer' }],
    ['WhatsApp', (t) => t.trackWhatsAppLinkClick('sticky_mobile'), 'whatsapp_click', { source: 'sticky_mobile' }],
    ['Mail', (t) => t.trackMailClick('kontakt_seite'), 'cta_click', { cta_name: 'mail_click', source: 'kontakt_seite' }],
    ['Dialog geöffnet', (t) => t.trackInquiryOpen('hero'), 'cta_click', { cta_name: 'inquiry_open', source: 'hero' }],
    ['Formular abgesendet', (t) => t.trackFormSubmission('inquiry', { branche: 'messe' }), 'form_submit', { form_type: 'inquiry', branche: 'messe' }],
    ['Blogartikel gelesen', (t) => t.trackBlogArticleRead('ein-artikel', 130), 'blog_article_read', { article_slug: 'ein-artikel', read_time_seconds: 130 }],
  ]

  it.each(wege)('%s', async (_name, ausloesen, ereignisname, props) => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    window.history.pushState({}, '', '/kontakt')
    const { tracker } = await lade()

    ausloesen(tracker)

    const ereignisse = warteschlange()
    expect(ereignisse).toHaveLength(1)
    const e = ereignisse[0]
    expect(e.event).toBe(ereignisname)
    expect(e.props).toEqual(props)
    expect(e.url).toBe('/kontakt')
    expect(e.session_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(e.visitor_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(Number.isNaN(Date.parse(e.ts))).toBe(false)

    // Vertrag mit dem Server: Name steht in $validEvents, kein unbekanntes Feld
    expect(serverEreignisnamen()).toContain(ereignisname)
    for (const feld of Object.keys(e)) expect(SERVER_FELDER).toContain(feld)

    await vi.advanceTimersByTimeAsync(2_100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [adresse, optionen] = fetchMock.mock.calls[0] as [string, { body: string }]
    expect(adresse).toBe('/api/collect.php')
    const rumpf = JSON.parse(optionen.body) as { events: Ereignis[] }
    expect(Array.isArray(rumpf.events)).toBe(true)
    expect(rumpf.events[0].event).toBe(ereignisname)
    expect(rumpf.events[0].props).toEqual(props)
  })

  it('jeder Ereignisname des Trackers steht in der Annahmeliste von collect.php', async () => {
    const { tracker } = await lade()
    const server = serverEreignisnamen()
    expect(server.length).toBeGreaterThanOrEqual(20)
    for (const name of Object.keys(tracker.getTrackingConfig().events)) {
      expect(server).toContain(name)
    }
  })
})

describe('Anfrage-Dialog: jede Öffnung wird mit dem Ort des Knopfes gezählt', () => {
  it('openInquiry(ort) öffnet den Dialog und reiht cta_click/inquiry_open ein', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { useUIStore } = await lade()

    useUIStore.getState().openInquiry('header_desktop')

    expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
    expect(warteschlange().map((e) => [e.event, e.props])).toEqual([
      ['cta_click', { cta_name: 'inquiry_open', source: 'header_desktop' }],
    ])
  })

  it('ein Knopf ohne Ortsangabe (onClick={openInquiry}) zählt als „unbekannt"', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { useUIStore } = await lade()

    // React übergibt in diesem Fall das Klick-Ereignis als erstes Argument
    useUIStore.getState().openInquiry({ type: 'click' })

    expect(useUIStore.getState().inquiryDialogOpen).toBe(true)
    expect(warteschlange()[0].props).toEqual({ cta_name: 'inquiry_open', source: 'unbekannt' })
  })
})
