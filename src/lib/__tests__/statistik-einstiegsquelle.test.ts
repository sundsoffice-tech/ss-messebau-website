import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Einstiegsquelle in der Hausstatistik.
 *
 * Ein Erstbesucher aus einer Kampagne landet auf `/?utm_source=…`. Die
 * Abschnittsverfolgung (`updateUrlWithSection`) schreibt die Adresse beim ersten
 * sichtbaren Abschnitt ohne Suche neu (`/#hero`). Stimmt der Besucher erst danach
 * im Banner zu, las der Tracker die Kampagnen-Angaben aus der umgeschriebenen
 * Adresse: Der Besuch wurde ohne Quelle gezählt.
 *
 * Regel seit dem Umbau: Der Einstieg der Sitzung (erster gezählter Seitenaufruf
 * mit seinem Sitzungsstart) trägt die Quelle der aktuellen Adresse und, wenn dort
 * keine steht, die gemerkte Einstiegsquelle aus `utm-utils.ts`. Alle anderen
 * Ereignisse lesen wie bisher nur die aktuelle Adresse.
 */

const CONSENT_KEY = 'ss_cookie_consent'
const QUEUE_KEY = 'ss_analytics_queue'
const UTM_KEY = 'ss_utm_params'
const KAMPAGNE = '/?utm_source=google&utm_medium=cpc&utm_campaign=messe-2026&gclid=geheim'
const QUELLE = { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'messe-2026' }
const UTM_FELDER = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/** Felder, die `public/api/collect.php` je Ereignis liest. */
const SERVER_FELDER = [
  'event', 'ts', 'session_id', 'visitor_id', 'url', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'props',
]

type Ereignis = Record<string, unknown> & {
  event: string
  url: string
  session_id: string
  props?: Record<string, string | number | boolean>
}

function schluessel(speicher: Storage): string[] {
  const namen: string[] = []
  for (let i = 0; i < speicher.length; i++) namen.push(speicher.key(i) as string)
  return namen.sort()
}

function warteschlange(): Ereignis[] {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Ereignis[]
}

/** Die Kampagnen-Angaben, die ein Ereignis trägt. */
function quelle(ereignis: Ereignis): Record<string, unknown> {
  const angaben: Record<string, unknown> = {}
  for (const feld of UTM_FELDER) {
    if (feld in ereignis) angaben[feld] = ereignis[feld]
  }
  return angaben
}

function adresse(): string {
  return window.location.pathname + window.location.search + window.location.hash
}

/**
 * Neuer Seitenaufruf mit der gegebenen Adresse: Module frisch laden wie die
 * Anwendung (`utm-utils` über den Anfrage-Dialog, der Tracker über `App`), dann
 * der Seitenaufruf aus `usePageViewTracking` beim ersten Rendern.
 */
async function seiteLaden(ziel: string) {
  window.history.pushState({}, '', ziel)
  vi.resetModules()
  const analytics = await import('@/lib/analytics')
  const utm = await import('@/lib/utm-utils')
  const tracker = await import('@/lib/analytics-tracker')
  const deepLinking = await import('@/lib/deep-linking')
  tracker.trackPageView()
  return { analytics, utm, tracker, deepLinking }
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Erstbesucher aus einer Kampagne, Zustimmung nach dem Umschreiben der Adresse', () => {
  it('der Einstieg (session_start und page_view) trägt die Kampagnenquelle', async () => {
    const { analytics, deepLinking } = await seiteLaden(KAMPAGNE)

    // Die Abschnittsverfolgung meldet den ersten sichtbaren Abschnitt
    deepLinking.updateUrlWithSection('hero')
    // Ausgangslage belegen: Die Adresse trägt keine Kampagnen-Angaben mehr
    expect(adresse()).toBe('/#hero')
    // Vor der Zustimmung liegt nichts im Browser-Speicher
    expect(schluessel(localStorage)).toEqual([])
    expect(schluessel(sessionStorage)).toEqual([])

    analytics.setConsent('granted')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    const seitenaufruf = ereignisse[1]
    expect(seitenaufruf.utm_source).toBe('google')
    expect(seitenaufruf.utm_campaign).toBe('messe-2026')
    for (const e of ereignisse) {
      expect(quelle(e)).toEqual(QUELLE)
      // Die Adresse des Ereignisses bleibt die aktuelle, sie wird nicht erfunden
      expect(e.url).toBe('/#hero')
      for (const feld of Object.keys(e)) expect(SERVER_FELDER).toContain(feld)
    }
    // Was nicht auf der Whitelist steht (gclid), erreicht kein Ereignis
    expect(JSON.stringify(ereignisse)).not.toContain('geheim')
  })

  it('Seitenwechsel und Klicks nach der Zustimmung tragen die Einstiegsquelle nicht noch einmal', async () => {
    const { analytics, tracker, utm, deepLinking } = await seiteLaden(KAMPAGNE)
    deepLinking.updateUrlWithSection('hero')
    analytics.setConsent('granted')

    window.history.pushState(null, '', '/kontakt')
    tracker.trackPageView()
    tracker.trackCTAClick('irgendein_knopf', 'kontakt_seite')
    tracker.trackFormSubmission('inquiry')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual([
      'session_start', 'page_view', 'page_view', 'cta_click', 'form_submit',
    ])
    expect(ereignisse.map(quelle)).toEqual([QUELLE, QUELLE, {}, {}, {}])
    expect(ereignisse[2].props?.page_count).toBe(2)
    // Die Anfrage selbst behält ihre Quelle wie bisher
    expect(utm.getUtmParams()).toEqual(QUELLE)
  })

  it('steht in der aktuellen Adresse eine Quelle, gilt nur sie (kein Mischen mit dem Einstieg)', async () => {
    const { analytics, tracker } = await seiteLaden(KAMPAGNE)
    window.history.pushState(null, '', '/leistungen/messebau?utm_source=newsletter')
    tracker.trackPageView()

    analytics.setConsent('granted')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    for (const e of ereignisse) expect(quelle(e)).toEqual({ utm_source: 'newsletter' })
  })
})

describe('Zustimmung lag schon vor dem Laden vor (zweiter Besuch): unverändert', () => {
  it('der Einstieg liest die Quelle aus der Adresse, spätere Ereignisse nach dem Umschreiben tragen keine', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const { tracker, deepLinking } = await seiteLaden(KAMPAGNE)

    deepLinking.updateUrlWithSection('hero')
    tracker.trackCTAClick('irgendein_knopf', 'hero')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view', 'cta_click'])
    expect(ereignisse.map(quelle)).toEqual([QUELLE, QUELLE, {}])
    expect(ereignisse[0].url).toBe('/?utm_source=google&utm_medium=cpc&utm_campaign=messe-2026')
    expect(ereignisse[1].url).toBe('/?utm_source=google&utm_medium=cpc&utm_campaign=messe-2026')
    expect(ereignisse[2].url).toBe('/#hero')
  })

  it('Neuladen in derselben Sitzung: der zweite Seitenaufruf trägt die gespeicherte Quelle nicht', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    const erste = await seiteLaden(KAMPAGNE)
    erste.deepLinking.updateUrlWithSection('hero')

    const { utm } = await seiteLaden('/#hero')

    // Ausgangslage: Die Quelle liegt gespeichert vor, eine Anfrage bekäme sie
    expect(JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}')).toEqual(QUELLE)
    expect(utm.getUtmParams()).toEqual(QUELLE)
    const seitenaufrufe = warteschlange().filter((e) => e.event === 'page_view')
    expect(seitenaufrufe.map((e) => e.props?.page_count)).toEqual([1, 2])
    expect(seitenaufrufe.map(quelle)).toEqual([QUELLE, {}])
    expect(warteschlange().filter((e) => e.event === 'session_start')).toHaveLength(1)
  })
})

describe('Einstieg ohne Kampagne', () => {
  it('kein Ereignis bekommt eine erfundene Quelle', async () => {
    const { analytics, tracker, deepLinking } = await seiteLaden('/')
    deepLinking.updateUrlWithSection('hero')

    analytics.setConsent('granted')
    tracker.trackCTAClick('irgendein_knopf', 'hero')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view', 'cta_click'])
    expect(ereignisse.map(quelle)).toEqual([{}, {}, {}])
    expect(sessionStorage.getItem(UTM_KEY)).toBeNull()
  })
})

describe('Ablehnen nach Einstieg mit Kampagne, später Zustimmung über „Cookie-Einstellungen"', () => {
  it('die gemerkte Quelle ist vergessen: kein Ereignis trägt sie, auch die Anfrage nicht', async () => {
    const { analytics, utm, deepLinking } = await seiteLaden(KAMPAGNE)
    deepLinking.updateUrlWithSection('hero')

    analytics.setConsent('denied')
    expect(schluessel(localStorage)).toEqual([CONSENT_KEY])
    expect(schluessel(sessionStorage)).toEqual([])

    analytics.setConsent('granted')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(ereignisse.map(quelle)).toEqual([{}, {}])
    expect(utm.getUtmParams()).toEqual({})
    expect(sessionStorage.getItem(UTM_KEY)).toBeNull()
  })

  it('steht die Kampagne bei der späteren Zustimmung noch in der Adresse, zählt sie wie bisher', async () => {
    const { analytics } = await seiteLaden('/leistungen/messebau?utm_source=google&utm_medium=cpc&utm_campaign=messe-2026')

    analytics.setConsent('denied')
    analytics.setConsent('granted')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(ereignisse.map(quelle)).toEqual([QUELLE, QUELLE])
  })

  it('Ablehnung in einem anderen Tab: auch dieser Tab vergisst die Einstiegsquelle', async () => {
    const { tracker, utm, deepLinking } = await seiteLaden(KAMPAGNE)
    deepLinking.updateUrlWithSection('hero')
    // Ausgangslage: Die Quelle ist im Arbeitsspeicher gemerkt
    expect(utm.getUtmParams()).toEqual(QUELLE)

    // Anderer Tab lehnt ab, später stimmt er dort doch zu
    localStorage.setItem(CONSENT_KEY, 'denied')
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY, newValue: 'denied' }))
    localStorage.setItem(CONSENT_KEY, 'granted')
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY, newValue: 'granted' }))

    window.history.pushState(null, '', '/kontakt')
    tracker.trackPageView()

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    expect(ereignisse.map(quelle)).toEqual([{}, {}])
    expect(utm.getUtmParams()).toEqual({})
  })

  it('Gegenprobe: ein fremder Schlüssel im storage-Ereignis lässt die gemerkte Quelle stehen', async () => {
    const { utm, deepLinking } = await seiteLaden(KAMPAGNE)
    deepLinking.updateUrlWithSection('hero')

    window.dispatchEvent(new StorageEvent('storage', { key: 'ss-lang', newValue: 'en' }))

    expect(utm.getUtmParams()).toEqual(QUELLE)
  })
})

describe('Form des Ereignisses bleibt die von collect.php', () => {
  it('aus dem gespeicherten Eintrag kommen nur die fünf Kampagnen-Felder als Zeichenketten', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted')
    sessionStorage.setItem(UTM_KEY, JSON.stringify({
      utm_source: 'google',
      utm_medium: 5,
      event: 'fremd',
      session_id: 'fremd',
      url: '/fremd',
      props: { fremd: true },
    }))

    await seiteLaden('/')

    const ereignisse = warteschlange()
    expect(ereignisse.map((e) => e.event)).toEqual(['session_start', 'page_view'])
    for (const e of ereignisse) {
      expect(quelle(e)).toEqual({ utm_source: 'google' })
      expect(e.url).toBe('/')
      expect(e.session_id).toMatch(/^[0-9a-f-]{36}$/)
      for (const feld of Object.keys(e)) expect(SERVER_FELDER).toContain(feld)
    }
    expect(ereignisse[1].props).toEqual({ page_count: 1, title: document.title.substring(0, 200) })
  })
})
