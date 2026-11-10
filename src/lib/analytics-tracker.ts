/**
 * First-Party Analytics Tracker - Enterprise Edition
 *
 * Hausstatistik: sammelt Ereignisse und sendet sie an das eigene PHP-Backend
 * (`/api/collect.php`). Einziger Zähler der Seite; GA4 ist entfernt.
 * Respects consent from CookieConsent / isTrackingAllowed(): ohne Zustimmung
 * wird nichts gespeichert und nichts gesendet.
 *
 * Features:
 * - Persistent visitor ID (cross-session identification)
 * - Enhanced device/network fingerprinting
 * - Performance metrics collection (Web Vitals)
 * - Scroll depth tracking with granularity
 * - Page engagement timing
 * - Session end detection
 * - Outbound link tracking
 * - Error tracking
 * - Tab visibility tracking
 */

import { v4 as uuidv4 } from 'uuid'
import { isTrackingAllowed, onConsentChange, CONSENT_STORAGE_KEY } from '@/lib/analytics'
import { getUtmParams } from '@/lib/utm-utils'
import type {
  TrackingEvent,
  TrackingEventName,
  TrackingConfig,
  AnalyticsKPIs,
  AnalyticsStatusInfo,
  ExportFormat,
  RealtimeEvent,
  ActiveVisitorsResponse,
} from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Session & Visitor Management                                       */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'ss_analytics_session'
const VISITOR_KEY = 'ss_analytics_visitor'
const CONFIG_KEY = 'ss_tracking_config'
const VISIT_COUNT_KEY = 'ss_visit_count'
const LAST_VISIT_KEY = 'ss_last_visit'

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = uuidv4()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return uuidv4()
  }
}

/** Persistent visitor ID stored in localStorage (survives sessions) */
function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_KEY)
    if (!vid) {
      vid = uuidv4()
      localStorage.setItem(VISITOR_KEY, vid)
    }
    return vid
  } catch {
    return 'unknown'
  }
}

/** Track visit count for returning visitor detection */
function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function incrementVisitCount(): void {
  try {
    const count = getVisitCount() + 1
    localStorage.setItem(VISIT_COUNT_KEY, String(count))
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
  } catch { /* ignore */ }
}

function getLastVisitDate(): string | null {
  try {
    return localStorage.getItem(LAST_VISIT_KEY)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Config (cached in localStorage, fetched from backend)              */
/* ------------------------------------------------------------------ */

let cachedConfig: TrackingConfig | null = null

export function getTrackingConfig(): TrackingConfig {
  if (cachedConfig) return cachedConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) {
      cachedConfig = JSON.parse(raw) as TrackingConfig
      return cachedConfig
    }
  } catch { /* ignore */ }
  return {
    enabled: true,
    events: {
      page_view: true,
      cta_click: true,
      form_submit: true,
      phone_click: true,
      whatsapp_click: true,
      download: true,
      scroll_depth: true,
      page_engagement: true,
      blog_article_read: true,
      heartbeat: true,
      session_start: true,
      session_end: true,
      form_interaction: true,
      form_abandon: true,
      exit_intent: true,
      configurator_step: true,
      outbound_click: true,
      video_play: true,
      error: true,
      performance: true,
      search: true,
      tab_visibility: true,
    },
    utm_whitelist: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
    domain_whitelist: ['sunds-messebau.de', 'www.sunds-messebau.de', 'localhost'],
    retention_days: 90,
    aggregation_months: 24,
    store_ip: false,
    geo_enabled: false,
    geo_api_key: '',
  }
}

export function setTrackingConfig(config: TrackingConfig): void {
  cachedConfig = config
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  URL Sanitization (no PII)                                          */
/* ------------------------------------------------------------------ */

function sanitizeUrl(url: string, utmWhitelist: string[]): string {
  try {
    const u = new URL(url)
    const params = new URLSearchParams()
    for (const key of utmWhitelist) {
      const v = u.searchParams.get(key)
      if (v) params.set(key, v)
    }
    const qs = params.toString()
    return u.pathname + (qs ? '?' + qs : '') + u.hash
  } catch {
    return url.split('?')[0] || '/'
  }
}

const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

function extractUtm(url: string): Record<string, string> {
  const result: Record<string, string> = {}
  try {
    const u = new URL(url)
    for (const key of UTM_FIELDS) {
      const v = u.searchParams.get(key)
      if (v) result[key] = v
    }
  } catch { /* ignore */ }
  return result
}

/**
 * Gemerkte Einstiegsquelle des Besuchs. Einzige Quelle ist `utm-utils.ts`
 * (Arbeitsspeicher, mit Zustimmung `ss_utm_params`); nach einer Ablehnung ist
 * sie dort geleert. Übernommen werden nur die fünf Felder als Zeichenketten,
 * damit ein Speichereintrag kein anderes Feld des Ereignisses überschreibt.
 */
function entryUtm(): Record<string, string> {
  const result: Record<string, string> = {}
  const remembered: Record<string, unknown> = getUtmParams()
  for (const key of UTM_FIELDS) {
    const v = remembered[key]
    if (typeof v === 'string' && v) result[key] = v
  }
  return result
}

/* ------------------------------------------------------------------ */
/*  Event Queue & Sending                                              */
/* ------------------------------------------------------------------ */

const QUEUE_KEY = 'ss_analytics_queue'
const SESSION_START_KEY = 'ss_session_start_sent'
const SESSION_PAGE_COUNT_KEY = 'ss_page_count'
const API_BASE = '/api'
let flushTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Alle Schlüssel, die die Statistik mit Zustimmung anlegt. `ss_tracking_config`
 * gehört nicht dazu: Den Eintrag schreibt nur das Admin-Panel, er trägt die
 * Schalter der Statistik und keine Angabe über den Besucher.
 */
const STATISTICS_LOCAL_KEYS = [VISITOR_KEY, VISIT_COUNT_KEY, LAST_VISIT_KEY, QUEUE_KEY]
const STATISTICS_SESSION_KEYS = [SESSION_KEY, SESSION_START_KEY, SESSION_PAGE_COUNT_KEY]

/** Entfernt Kennung, Zähler, Sitzungsmarken und die Warteschlange der Statistik. */
function clearStatisticsStorage(): void {
  try {
    for (const key of STATISTICS_LOCAL_KEYS) localStorage.removeItem(key)
  } catch { /* ignore */ }
  try {
    for (const key of STATISTICS_SESSION_KEYS) sessionStorage.removeItem(key)
  } catch { /* ignore */ }
}

function getQueue(): TrackingEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Obergrenzen der Warteschlange. Nimmt der Server länger nichts an (Störung, Bremse,
 * kein Netz), wuchs sie sonst mit jedem Ereignis weiter und blieb im Browser liegen.
 * - Alter: Was länger als 24 Stunden liegt, wird nicht mehr gesendet. Der Server nähme es
 *   zwar an, zählte es aber mit der Ankunftszeit (collect.php, COLLECT_TS_ZURUECK): Es
 *   stünde am falschen Tag und läge länger, als sein wahres Alter erlaubt. Die Grenze
 *   gilt beim Speichern und beim Senden.
 * - Zahl: Bei mehr als 200 fallen zuerst die nachrangigen Ereignisse weg (dieselbe Liste
 *   wie am Server: Herzschlag, Scrolltiefe, Leistung, Sichtbarkeit), die ältesten zuerst.
 *   Reicht das nicht, fallen die jüngsten übrigen weg: Sitzungsstart und Einstiegsseite
 *   stehen vorn und tragen die Herkunft des Besuchs, sie bleiben.
 */
const QUEUE_MAX_EREIGNISSE = 200
const QUEUE_MAX_ALTER_MS = 24 * 60 * 60 * 1000
const QUEUE_NACHRANGIG: readonly string[] = ['heartbeat', 'scroll_depth', 'performance', 'tab_visibility']

function begrenzeQueue(queue: TrackingEvent[]): TrackingEvent[] {
  const fruehestens = Date.now() - QUEUE_MAX_ALTER_MS
  // Ein Ereignis ohne lesbaren Zeitstempel bleibt: Über sein Alter lässt sich nichts sagen.
  let rest = queue.filter((e) => {
    const zeit = Date.parse(e.ts)
    return Number.isNaN(zeit) || zeit >= fruehestens
  })
  let zuViel = rest.length - QUEUE_MAX_EREIGNISSE
  if (zuViel <= 0) return rest
  rest = rest.filter((e) => {
    if (zuViel > 0 && QUEUE_NACHRANGIG.includes(e.event)) {
      zuViel--
      return false
    }
    return true
  })
  return zuViel > 0 ? rest.slice(0, rest.length - zuViel) : rest
}

function saveQueue(queue: TrackingEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(begrenzeQueue(queue)))
  } catch { /* ignore */ }
}

/**
 * Legt einen nicht zugestellten Stapel zurück. Nach einem Widerruf, der während
 * der laufenden Anfrage kam, bleibt die Warteschlange leer.
 */
function requeue(batch: TrackingEvent[]): void {
  if (!isTrackingAllowed()) return
  saveQueue([...batch, ...getQueue()])
}

/**
 * Sendet die Warteschlange. Die Zustimmung wird hier noch einmal geprüft, weil
 * der Aufruf an Zeitgeber, `visibilitychange` und `beforeunload` hängt und die
 * Zustimmung zwischen Einreihen und Senden widerrufen worden sein kann (auch in
 * einem anderen Tab). Ohne Zustimmung wird nichts gesendet und der Rest verworfen.
 */
async function flushQueue(): Promise<void> {
  if (!isTrackingAllowed()) {
    clearStatisticsStorage()
    return
  }
  const queue = begrenzeQueue(getQueue())
  if (queue.length === 0) {
    // Auch die Reste im Speicher räumen, wenn alles Wartende zu alt war.
    saveQueue(queue)
    return
  }

  const batch = queue.splice(0, 20)
  saveQueue(queue)

  try {
    const resp = await fetch(`${API_BASE}/collect.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    })
    if (!resp.ok) {
      requeue(batch)
    }
  } catch {
    requeue(batch)
  }
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushQueue()
  }, 2000)
}

/* ------------------------------------------------------------------ */
/*  Public Tracking API                                                */
/* ------------------------------------------------------------------ */

/** Darf dieses Ereignis jetzt gezählt werden? Zustimmung zuerst, dann die Admin-Schalter. */
function canTrack(eventName: TrackingEventName): boolean {
  if (!isTrackingAllowed()) return false
  const config = getTrackingConfig()
  return Boolean(config.enabled && config.events[eventName])
}

/**
 * Reiht ein Ereignis in die Warteschlange ein.
 * Rückgabe: true, wenn es eingereiht wurde; false, wenn es mangels Zustimmung
 * oder wegen eines Admin-Schalters verworfen wurde.
 */
export function trackFirstPartyEvent(
  eventName: TrackingEventName,
  props?: Record<string, string | number | boolean>,
): boolean {
  return enqueueEvent(eventName, props, false)
}

/**
 * Kampagnen-Angaben stammen aus der aktuellen Adresse. Nur beim Einstieg der
 * Sitzung (`isEntry`: erster gezählter Seitenaufruf und sein Sitzungsstart)
 * gilt ersatzweise die gemerkte Einstiegsquelle, wenn die Adresse keine trägt:
 * Die Abschnittsverfolgung schreibt `/?utm_source=…` zu `/#hero` um, bevor ein
 * Erstbesucher im Banner zustimmt. Alle anderen Ereignisse bleiben bei der
 * Adresse, damit die Auswertung (Zählung je Ereignis) nichts mehrfach zählt.
 */
function enqueueEvent(
  eventName: TrackingEventName,
  props: Record<string, string | number | boolean> | undefined,
  isEntry: boolean,
): boolean {
  if (!canTrack(eventName)) return false

  const config = getTrackingConfig()

  const url = window.location.href
  const fromUrl = extractUtm(url)
  const utm = isEntry && Object.keys(fromUrl).length === 0 ? entryUtm() : fromUrl

  const event: TrackingEvent = {
    event: eventName,
    ts: new Date().toISOString(),
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    url: sanitizeUrl(url, config.utm_whitelist),
    referrer: document.referrer ? sanitizeUrl(document.referrer, []) : undefined,
    ...utm,
    props,
  }

  const queue = getQueue()
  queue.push(event)
  saveQueue(queue)
  scheduleFlush()
  return true
}

/* ------------------------------------------------------------------ */
/*  Device Detection (non-PII) - Enhanced                              */
/* ------------------------------------------------------------------ */

function detectDeviceType(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) return 'mobile'
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Other'
}

function detectBrowserVersion(): string {
  const ua = navigator.userAgent
  const matchers: Array<[string, RegExp]> = [
    ['Firefox', /Firefox\/(\d+)/],
    ['Edge', /Edg\/(\d+)/],
    ['Opera', /OPR\/(\d+)/],
    ['Chrome', /Chrome\/(\d+)/],
    ['Safari', /Version\/(\d+)/],
  ]
  for (const [, regex] of matchers) {
    const match = ua.match(regex)
    if (match) return match[1]
  }
  return 'unknown'
}

function detectOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS X') || ua.includes('Macintosh')) return 'macOS'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
  } catch {
    return 'unknown'
  }
}

function detectConnectionType(): string {
  try {
    const conn = (navigator as any).connection
    if (conn) {
      return conn.effectiveType || conn.type || 'unknown'
    }
  } catch { /* ignore */ }
  return 'unknown'
}

function detectScreenResolution(): string {
  return `${window.screen.width}x${window.screen.height}`
}

function detectColorDepth(): number {
  return window.screen.colorDepth || 0
}

function detectTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function detectDoNotTrack(): boolean {
  return navigator.doNotTrack === '1'
}

function detectCookiesEnabled(): boolean {
  return navigator.cookieEnabled
}

function detectAdBlocker(): boolean {
  try {
    const testAd = document.createElement('div')
    testAd.innerHTML = '&nbsp;'
    testAd.className = 'adsbox ad-placement'
    testAd.style.position = 'absolute'
    testAd.style.left = '-9999px'
    document.body.appendChild(testAd)
    const blocked = testAd.offsetHeight === 0
    document.body.removeChild(testAd)
    return blocked
  } catch {
    return false
  }
}

/**
 * Infer approximate country/region from IANA timezone.
 */
function inferGeoFromTimezone(tz: string): { country: string; region: string } {
  const TIMEZONE_MAP: Record<string, { country: string; region: string }> = {
    'Europe/Berlin': { country: 'DE', region: 'Deutschland' },
    'Europe/Vienna': { country: 'AT', region: 'Oesterreich' },
    'Europe/Zurich': { country: 'CH', region: 'Schweiz' },
    'Europe/Amsterdam': { country: 'NL', region: 'Niederlande' },
    'Europe/Brussels': { country: 'BE', region: 'Belgien' },
    'Europe/Luxembourg': { country: 'LU', region: 'Luxemburg' },
    'Europe/Paris': { country: 'FR', region: 'Frankreich' },
    'Europe/London': { country: 'GB', region: 'Grossbritannien' },
    'Europe/Madrid': { country: 'ES', region: 'Spanien' },
    'Europe/Rome': { country: 'IT', region: 'Italien' },
    'Europe/Warsaw': { country: 'PL', region: 'Polen' },
    'Europe/Prague': { country: 'CZ', region: 'Tschechien' },
    'Europe/Copenhagen': { country: 'DK', region: 'Daenemark' },
    'Europe/Stockholm': { country: 'SE', region: 'Schweden' },
    'Europe/Helsinki': { country: 'FI', region: 'Finnland' },
    'Europe/Oslo': { country: 'NO', region: 'Norwegen' },
    'Europe/Lisbon': { country: 'PT', region: 'Portugal' },
    'Europe/Athens': { country: 'GR', region: 'Griechenland' },
    'Europe/Budapest': { country: 'HU', region: 'Ungarn' },
    'Europe/Bucharest': { country: 'RO', region: 'Rumaenien' },
    'Europe/Moscow': { country: 'RU', region: 'Russland' },
    'Europe/Istanbul': { country: 'TR', region: 'Tuerkei' },
  }

  if (TIMEZONE_MAP[tz]) return TIMEZONE_MAP[tz]

  const continent = tz.split('/')[0]
  const CONTINENT_MAP: Record<string, string> = {
    'Europe': 'Europa (Sonstige)',
    'America': 'Amerika',
    'Asia': 'Asien',
    'Africa': 'Afrika',
    'Australia': 'Ozeanien',
    'Pacific': 'Ozeanien',
  }

  return {
    country: continent,
    region: CONTINENT_MAP[continent] || 'Unbekannt',
  }
}

/**
 * `fruehereBesuche` und `letzterBesuch` sind der Stand VOR diesem Sitzungsstart.
 * Vorher wurde erst hochgezählt und dann gelesen: `is_returning` war bei jedem
 * Sitzungsstart wahr, `last_visit` trug den Zeitpunkt des laufenden Besuchs.
 */
function getDeviceProps(fruehereBesuche: number, letzterBesuch: string | null): Record<string, string | number | boolean> {
  const tz = detectTimezone()
  const geo = inferGeoFromTimezone(tz)
  return {
    device_type: detectDeviceType(),
    browser: detectBrowser(),
    browser_version: detectBrowserVersion(),
    os: detectOS(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    screen_resolution: detectScreenResolution(),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    color_depth: detectColorDepth(),
    pixel_ratio: window.devicePixelRatio || 1,
    language: navigator.language || 'unknown',
    languages: (navigator.languages || []).join(','),
    timezone: tz,
    geo_country: geo.country,
    geo_region: geo.region,
    connection_type: detectConnectionType(),
    touch_support: detectTouchSupport(),
    cookies_enabled: detectCookiesEnabled(),
    do_not_track: detectDoNotTrack(),
    ad_blocker: detectAdBlocker(),
    visit_count: fruehereBesuche + 1,
    is_returning: fruehereBesuche > 0,
    last_visit: letzterBesuch || '',
    page_count: 0,
  }
}

/* ------------------------------------------------------------------ */
/*  Session Start (fired once per session with device info)            */
/* ------------------------------------------------------------------ */

/**
 * Die Marke „Sitzungsstart gesendet" wird erst gesetzt, wenn das Ereignis in der
 * Warteschlange liegt. Vorher setzte sie auch ein verworfener Versuch (keine
 * Zustimmung), und der Sitzungsstart fehlte nach dem „Akzeptieren" für immer.
 */
let sessionListenersInstalled = false

function sendSessionStartIfNeeded(isEntry: boolean): void {
  try {
    if (!canTrack('session_start')) return
    if (sessionStorage.getItem(SESSION_START_KEY)) return
    // Erst lesen, dann zählen: Das Ereignis trägt den Stand vor diesem Besuch.
    const fruehereBesuche = getVisitCount()
    const letzterBesuch = getLastVisitDate()
    incrementVisitCount()
    if (!enqueueEvent('session_start', getDeviceProps(fruehereBesuche, letzterBesuch), isEntry)) return
    sessionStorage.setItem(SESSION_START_KEY, '1')
    // Einmal je Seitenaufruf: Nach Widerruf und erneuter Zustimmung beginnt eine
    // neue Sitzung, die Lauscher hängen aber schon und dürfen nicht doppelt zählen.
    if (sessionListenersInstalled) return
    sessionListenersInstalled = true
    setupSessionEndTracking()
    setupOutboundClickTracking()
    setupErrorTracking()
    collectPerformanceMetrics()
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/*  Session End Detection                                              */
/* ------------------------------------------------------------------ */

function getPageCount(): number {
  try {
    return parseInt(sessionStorage.getItem(SESSION_PAGE_COUNT_KEY) || '0', 10)
  } catch { return 0 }
}

function incrementPageCount(): void {
  try {
    const count = getPageCount() + 1
    sessionStorage.setItem(SESSION_PAGE_COUNT_KEY, String(count))
  } catch { /* ignore */ }
}

function setupSessionEndTracking(): void {
  const sessionStartTime = Date.now()

  window.addEventListener('beforeunload', () => {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000)
    trackFirstPartyEvent('session_end', {
      session_duration_seconds: duration,
      page_count: getPageCount(),
      events_fired: getQueue().length,
    })
    flushQueue()
  })
}

/* ------------------------------------------------------------------ */
/*  Outbound Click Tracking                                            */
/* ------------------------------------------------------------------ */

function setupOutboundClickTracking(): void {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement)?.closest('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href) return

    try {
      const url = new URL(href, window.location.origin)
      if (url.hostname !== window.location.hostname) {
        trackFirstPartyEvent('outbound_click', {
          destination: url.hostname,
          url: href.substring(0, 500),
          text: (link.textContent || '').substring(0, 100).trim(),
        })
      }
    } catch { /* ignore */ }
  })
}

/* ------------------------------------------------------------------ */
/*  Error Tracking                                                     */
/* ------------------------------------------------------------------ */

function setupErrorTracking(): void {
  window.addEventListener('error', (e) => {
    trackFirstPartyEvent('error', {
      error_message: (e.message || 'Unknown error').substring(0, 500),
      error_source: (e.filename || '').substring(0, 200),
      error_line: e.lineno || 0,
      error_col: e.colno || 0,
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    const message = e.reason?.message || e.reason?.toString() || 'Unhandled rejection'
    trackFirstPartyEvent('error', {
      error_message: message.substring(0, 500),
      error_type: 'unhandled_rejection',
    })
  })
}

/* ------------------------------------------------------------------ */
/*  Performance Metrics Collection                                     */
/* ------------------------------------------------------------------ */

function collectPerformanceMetrics(): void {
  if (typeof window === 'undefined' || !window.performance) return

  // Wait for page load to complete
  const reportMetrics = () => {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!nav) return

      trackFirstPartyEvent('performance', {
        page_load_ms: Math.round(nav.loadEventEnd - nav.startTime),
        ttfb_ms: Math.round(nav.responseStart - nav.requestStart),
        dom_interactive_ms: Math.round(nav.domInteractive - nav.startTime),
        dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        transfer_size: nav.transferSize || 0,
        navigation_type: nav.type || 'navigate',
      })

      // FCP via PerformanceObserver
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')
      if (fcp) {
        trackFirstPartyEvent('performance', {
          metric: 'fcp',
          value_ms: Math.round(fcp.startTime),
        })
      }
    } catch { /* ignore */ }
  }

  if (document.readyState === 'complete') {
    setTimeout(reportMetrics, 100)
  } else {
    window.addEventListener('load', () => setTimeout(reportMetrics, 100))
  }
}

/* ------------------------------------------------------------------ */
/*  Scroll Depth Tracking - Enhanced                                   */
/* ------------------------------------------------------------------ */

let maxScrollDepth = 0
let scrollDepthReported = new Set<number>()
// Die Lauscher hängen je Seite im Browser genau einmal. `trackPageView` ruft die
// beiden init-Funktionen bei jedem Seitenaufruf; ohne diese Merker kam mit jedem
// Seitenwechsel ein weiterer Satz Lauscher dazu, `tab_visibility` und
// `page_engagement` gingen dann mehrfach hinaus und die Verweildauer zählte doppelt.
let scrollLauscherHaengt = false
let engagementLauscherHaengen = false

export function initScrollDepthTracking(): void {
  if (typeof window === 'undefined') return

  const thresholds = [25, 50, 75, 90, 100]
  // Je Seitenaufruf beginnt die Messung neu
  maxScrollDepth = 0
  scrollDepthReported = new Set<number>()
  if (scrollLauscherHaengt) return
  scrollLauscherHaengt = true

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    )
    const viewportHeight = window.innerHeight
    const scrollableHeight = docHeight - viewportHeight

    if (scrollableHeight <= 0) return

    const depth = Math.min(100, Math.round((scrollTop / scrollableHeight) * 100))
    maxScrollDepth = Math.max(maxScrollDepth, depth)

    for (const threshold of thresholds) {
      if (depth >= threshold && !scrollDepthReported.has(threshold)) {
        scrollDepthReported.add(threshold)
        trackFirstPartyEvent('scroll_depth', {
          depth_pct: threshold,
          page: window.location.pathname,
        })
      }
    }
  }

  let scrollTimer: ReturnType<typeof setTimeout> | null = null
  window.addEventListener('scroll', () => {
    if (scrollTimer) return
    scrollTimer = setTimeout(() => {
      scrollTimer = null
      handleScroll()
    }, 200)
  }, { passive: true })
}

/* ------------------------------------------------------------------ */
/*  Page Engagement Tracking                                           */
/* ------------------------------------------------------------------ */

let engagementStartTime = 0
let totalEngagementTime = 0
let isEngaged = true

export function initEngagementTracking(): void {
  if (typeof window === 'undefined') return

  // Je Seitenaufruf beginnt die Messung neu
  engagementStartTime = Date.now()
  totalEngagementTime = 0
  isEngaged = true
  if (engagementLauscherHaengen) return
  engagementLauscherHaengen = true

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isEngaged) {
        totalEngagementTime += Date.now() - engagementStartTime
        isEngaged = false
      }
      trackFirstPartyEvent('tab_visibility', { state: 'hidden' })
    } else {
      engagementStartTime = Date.now()
      isEngaged = true
      trackFirstPartyEvent('tab_visibility', { state: 'visible' })
    }
  })

  // Report engagement on page unload
  window.addEventListener('beforeunload', () => {
    if (isEngaged) {
      totalEngagementTime += Date.now() - engagementStartTime
    }
    const engagementSeconds = Math.round(totalEngagementTime / 1000)
    if (engagementSeconds > 1) {
      trackFirstPartyEvent('page_engagement', {
        engagement_seconds: engagementSeconds,
        page: window.location.pathname,
        max_scroll_depth: maxScrollDepth,
      })
    }
  })
}

/* ------------------------------------------------------------------ */
/*  Convenience Wrappers (first-party)                                 */
/* ------------------------------------------------------------------ */

/** Seitenaufruf ohne Zustimmung gesehen: wird nach „Akzeptieren" nachgesendet. */
let pageViewPending = false

export function trackPageView(): void {
  if (!isTrackingAllowed()) {
    // Nichts speichern, nichts senden; nur im Arbeitsspeicher merken, dass
    // der Aufruf der laufenden Seite noch aussteht.
    pageViewPending = true
    return
  }
  pageViewPending = false
  // Einstieg der Sitzung: noch kein Seitenaufruf gezählt (siehe `enqueueEvent`)
  const isEntry = getPageCount() === 0
  sendSessionStartIfNeeded(isEntry)
  incrementPageCount()
  enqueueEvent('page_view', {
    page_count: getPageCount(),
    title: document.title.substring(0, 200),
  }, isEntry)
  initScrollDepthTracking()
  initEngagementTracking()
}

// Nach der Zustimmung im Banner: Sitzungsstart und Seitenaufruf der laufenden
// Seite nachsenden, damit Einstiegsseite und Quelle (UTM) nicht verloren gehen.
// Ist die Adresse inzwischen umgeschrieben, kommt die Quelle aus der gemerkten
// Einstiegsquelle (`utm-utils.ts`).
// Nach „Ablehnen" (auch als Widerruf einer früheren Zustimmung): sofort
// aufhören. Der Zeitgeber wird gestoppt, die Warteschlange verworfen statt
// gesendet, Kennung und Zähler werden entfernt. Stimmt der Besucher später
// wieder zu, beginnt die Zählung mit neuer Kennung und der dann laufenden Seite.
function stopStatistics(): void {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  clearStatisticsStorage()
  pageViewPending = true
}

onConsentChange((value) => {
  if (value === 'granted') {
    if (pageViewPending) trackPageView()
    return
  }
  stopStatistics()
})

// Widerruf in einem anderen Tab: Der Browser meldet die geänderte Entscheidung
// als `storage`-Ereignis; auch dieser Tab hört dann sofort auf.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ereignis) => {
    const name = ereignis.key
    if (name !== null && name !== CONSENT_STORAGE_KEY) return
    // Maßgeblich ist der gemeldete Wert, nicht nur der Zustand beim Verarbeiten: Ein Tab im
    // Hintergrund kann den Widerruf erst bekommen, nachdem dort wieder zugestimmt wurde. Auch
    // dann endet die laufende Zählung; die nächste beginnt mit neuer Kennung.
    const widerrufGemeldet = name !== null && ereignis.newValue !== 'granted'
    if (!isTrackingAllowed()) {
      stopStatistics()
      return
    }
    if (!widerrufGemeldet) return
    // Die Zustimmung besteht schon wieder: Der andere Tab hat beim Widerruf Kennung und
    // Warteschlange entfernt und zählt seitdem neu. Was jetzt im gemeinsamen Speicher liegt,
    // gehört zu dieser neuen Zählung und bleibt. Hier endet nur die alte Sitzung dieses Tabs;
    // die neue beginnt sofort mit Sitzungsstart und Seitenaufruf der laufenden Seite.
    try {
      for (const key of STATISTICS_SESSION_KEYS) sessionStorage.removeItem(key)
    } catch { /* ignore */ }
    trackPageView()
  })
}

/* ------------------------------------------------------------------ */
/*  Kontaktwege: je Weg ein Ereignis, `source` = Ort des Knopfes       */
/* ------------------------------------------------------------------ */

/**
 * Ereignisnamen müssen in der Liste `$validEvents` von `public/api/collect.php`
 * stehen, sonst verwirft der Server sie stillschweigend. Eigene Namen für
 * „Mail" und „Dialog geöffnet" kennt der Server nicht; beide laufen deshalb als
 * `cta_click` und unterscheiden sich über `cta_name`.
 */
export const CTA_INQUIRY_OPEN = 'inquiry_open'
export const CTA_MAIL_CLICK = 'mail_click'

export function trackCTAClick(ctaName: string, source?: string): void {
  trackFirstPartyEvent('cta_click', source ? { cta_name: ctaName, source } : { cta_name: ctaName })
}

/** Anfrage-Dialog geöffnet; `source` nennt den Knopf (z. B. `hero`, `header_desktop`). */
export function trackInquiryOpen(source: string): void {
  trackCTAClick(CTA_INQUIRY_OPEN, source)
}

/** Klick auf einen `mailto:`-Link. */
export function trackMailClick(source: string): void {
  trackCTAClick(CTA_MAIL_CLICK, source)
}

export function trackFormSubmission(formType: string, extraProps?: Record<string, string>): void {
  trackFirstPartyEvent('form_submit', { form_type: formType, ...extraProps })
}

/** Klick auf einen `tel:`-Link. */
export function trackPhoneClick(source: string): void {
  trackFirstPartyEvent('phone_click', { source })
}

/** Klick auf einen WhatsApp-Link (wa.me). */
export function trackWhatsAppLinkClick(source: string): void {
  trackFirstPartyEvent('whatsapp_click', { source })
}

/** Blogartikel länger als die Schwelle gelesen (vorher nur an GA4, also nie gezählt). */
export function trackBlogArticleRead(articleSlug: string, readTimeSeconds: number): void {
  trackFirstPartyEvent('blog_article_read', {
    article_slug: articleSlug.substring(0, 200),
    read_time_seconds: readTimeSeconds,
  })
}

export function trackFormInteraction(formType: string, field: string, action: 'focus' | 'blur' | 'change'): void {
  trackFirstPartyEvent('form_interaction', { form_type: formType, field, action })
}

export function trackFormAbandon(formType: string, lastField: string, filledFields: number, totalFields: number): void {
  trackFirstPartyEvent('form_abandon', {
    form_type: formType,
    last_field: lastField,
    filled_fields: filledFields,
    total_fields: totalFields,
    completion_pct: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0,
  })
}

export function trackExitIntent(pageName: string): void {
  trackFirstPartyEvent('exit_intent', { page: pageName })
}

/* ------------------------------------------------------------------ */
/*  Admin API Helpers                                                  */
/* ------------------------------------------------------------------ */

export async function fetchTrackingConfig(): Promise<TrackingConfig> {
  const resp = await fetch(`${API_BASE}/analytics-config.php`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to fetch tracking config')
  const data = await resp.json()
  setTrackingConfig(data)
  return data
}

export async function saveTrackingConfigToServer(config: TrackingConfig): Promise<void> {
  const resp = await fetch(`${API_BASE}/analytics-config.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  if (!resp.ok) throw new Error('Failed to save tracking config')
  setTrackingConfig(config)
}

export async function fetchAnalyticsKPIs(
  from?: string,
  to?: string,
  eventType?: TrackingEventName,
): Promise<AnalyticsKPIs> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (eventType) params.set('event_type', eventType)

  const resp = await fetch(`${API_BASE}/analytics-export.php?action=kpis&${params}`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to fetch analytics KPIs')
  return resp.json()
}

export async function fetchAnalyticsStatus(): Promise<AnalyticsStatusInfo> {
  const resp = await fetch(`${API_BASE}/analytics-status.php`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to fetch analytics status')
  return resp.json()
}

export async function runAnalyticsCleanup(): Promise<{ deleted: number }> {
  const resp = await fetch(`${API_BASE}/analytics-cleanup.php`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to run cleanup')
  return resp.json()
}

export async function exportAnalyticsData(
  format: ExportFormat,
  from?: string,
  to?: string,
  eventType?: TrackingEventName,
  limit?: number,
): Promise<Blob> {
  const params = new URLSearchParams({ format })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (eventType) params.set('event_type', eventType)
  if (limit) params.set('limit', String(limit))

  const resp = await fetch(`${API_BASE}/analytics-export.php?action=export&${params}`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to export data')
  return resp.blob()
}

export async function fetchRealtimeEvents(limit = 20): Promise<RealtimeEvent[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  const resp = await fetch(`${API_BASE}/analytics-realtime.php?${params}`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to fetch realtime events')
  return resp.json()
}

export async function fetchActiveVisitors(windowSeconds = 90): Promise<ActiveVisitorsResponse> {
  const params = new URLSearchParams({ window: String(windowSeconds) })
  const resp = await fetch(`${API_BASE}/analytics-visitors.php?${params}`, {
    credentials: 'include',
  })
  if (!resp.ok) throw new Error('Failed to fetch active visitors')
  return resp.json()
}

// Flush remaining events on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue()
    }
  })
}
