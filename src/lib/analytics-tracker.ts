/**
 * First-Party Analytics Tracker
 *
 * Extends the existing GA4 analytics (src/lib/analytics.ts) with
 * first-party event collection that sends events to our own PHP backend.
 * Respects consent from CookieConsent / isTrackingAllowed().
 */

import { v4 as uuidv4 } from 'uuid'
import { isTrackingAllowed } from '@/lib/analytics'
import type {
  TrackingEvent,
  TrackingEventName,
  TrackingConfig,
  AnalyticsKPIs,
  AnalyticsStatusInfo,
  ExportFormat,
  RealtimeEvent,
} from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Session Management                                                 */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'ss_analytics_session'
const CONFIG_KEY = 'ss_tracking_config'

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
  // Return default inline to avoid circular import
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
    },
    utm_whitelist: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
    domain_whitelist: ['sunds-messebau.de', 'www.sunds-messebau.de', 'localhost'],
    retention_days: 90,
    aggregation_months: 24,
    store_ip: false,
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
    return u.pathname + u.hash + (qs ? '?' + qs : '')
  } catch {
    return url.split('?')[0] || '/'
  }
}

function extractUtm(url: string): Record<string, string> {
  const result: Record<string, string> = {}
  try {
    const u = new URL(url)
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = u.searchParams.get(key)
      if (v) result[key] = v
    }
  } catch { /* ignore */ }
  return result
}

/* ------------------------------------------------------------------ */
/*  Event Queue & Sending                                              */
/* ------------------------------------------------------------------ */

const QUEUE_KEY = 'ss_analytics_queue'
const API_BASE = '/api'
let flushTimer: ReturnType<typeof setTimeout> | null = null

function getQueue(): TrackingEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: TrackingEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch { /* ignore */ }
}

async function flushQueue(): Promise<void> {
  const queue = getQueue()
  if (queue.length === 0) return

  const batch = queue.splice(0, 20) // send up to 20 events at a time
  saveQueue(queue)

  try {
    const resp = await fetch(`${API_BASE}/collect.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    })
    if (!resp.ok) {
      // Re-queue on failure
      saveQueue([...batch, ...getQueue()])
    }
  } catch {
    // Re-queue on network error
    saveQueue([...batch, ...getQueue()])
  }
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushQueue()
  }, 2000) // batch events for 2s
}

/* ------------------------------------------------------------------ */
/*  Public Tracking API                                                */
/* ------------------------------------------------------------------ */

/**
 * Track a first-party analytics event.
 * Respects consent and admin config (event toggles).
 */
export function trackFirstPartyEvent(
  eventName: TrackingEventName,
  props?: Record<string, string | number | boolean>,
): void {
  // Gate: consent
  if (!isTrackingAllowed()) return

  // Gate: global tracking toggle
  const config = getTrackingConfig()
  if (!config.enabled) return

  // Gate: per-event toggle
  if (!config.events[eventName]) return

  const url = window.location.href
  const utm = extractUtm(url)

  const event: TrackingEvent = {
    event: eventName,
    ts: new Date().toISOString(),
    session_id: getSessionId(),
    url: sanitizeUrl(url, config.utm_whitelist),
    referrer: document.referrer ? sanitizeUrl(document.referrer, []) : undefined,
    ...utm,
    props,
  }

  const queue = getQueue()
  queue.push(event)
  saveQueue(queue)
  scheduleFlush()
}

/* ------------------------------------------------------------------ */
/*  Convenience Wrappers (first-party)                                 */
/* ------------------------------------------------------------------ */

export function trackPageView(): void {
  trackFirstPartyEvent('page_view')
}

export function trackCTAClick(ctaName: string): void {
  trackFirstPartyEvent('cta_click', { cta_name: ctaName })
}

export function trackFormSubmission(formType: string): void {
  trackFirstPartyEvent('form_submit', { form_type: formType })
}

export function trackPhoneClick(): void {
  trackFirstPartyEvent('phone_click')
}

export function trackWhatsAppLinkClick(): void {
  trackFirstPartyEvent('whatsapp_click')
}

export function trackDownloadClick(fileName: string): void {
  trackFirstPartyEvent('download', { file_name: fileName })
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

// Flush remaining events on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue()
    }
  })
}
