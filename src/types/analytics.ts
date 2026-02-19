/**
 * Analytics & Event Tracking Type Definitions
 * First-party analytics pipeline for S&S Messebau
 */

/* ------------------------------------------------------------------ */
/*  Event Types                                                        */
/* ------------------------------------------------------------------ */

/** All first-party event names */
export type TrackingEventName =
  | 'page_view'
  | 'cta_click'
  | 'form_submit'
  | 'phone_click'
  | 'whatsapp_click'
  | 'download'
  | 'scroll_depth'
  | 'page_engagement'
  | 'blog_article_read'
  | 'heartbeat'
  | 'session_start'
  | 'form_interaction'
  | 'form_abandon'
  | 'exit_intent'
  | 'configurator_step'

/** Standard event payload sent to collect endpoint */
export interface TrackingEvent {
  event: TrackingEventName
  ts: string // ISO timestamp
  session_id: string
  url: string // sanitized, no PII
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  props?: Record<string, string | number | boolean>
}

/* ------------------------------------------------------------------ */
/*  Admin Configuration                                                */
/* ------------------------------------------------------------------ */

/** Tracking config stored in admin / PHP backend */
export interface TrackingConfig {
  enabled: boolean
  events: Record<TrackingEventName, boolean>
  utm_whitelist: string[]
  domain_whitelist: string[]
  retention_days: number
  aggregation_months: number
  store_ip: boolean
  geo_enabled: boolean
  geo_api_key: string
  last_cleanup?: string
  last_cleanup_count?: number
}

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
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
    form_interaction: true,
    form_abandon: true,
    exit_intent: true,
    configurator_step: true,
  },
  utm_whitelist: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
  domain_whitelist: ['sunds-messebau.de', 'www.sunds-messebau.de', 'localhost'],
  retention_days: 90,
  aggregation_months: 24,
  store_ip: false,
  geo_enabled: false,
  geo_api_key: '',
}

/* ------------------------------------------------------------------ */
/*  KPI / Report Types                                                 */
/* ------------------------------------------------------------------ */

export interface AnalyticsKPIs {
  total_events: number
  unique_sessions: number
  page_views: number
  cta_clicks: number
  form_submits: number
  phone_clicks: number
  whatsapp_clicks: number
  downloads: number
  top_pages: Array<{ url: string; count: number }>
  top_referrers: Array<{ referrer: string; count: number }>
  top_sources: Array<{ source: string; count: number }>
  top_campaigns: Array<{ campaign: string; count: number }>
  events_by_day: Array<{ date: string; count: number }>
  events_by_hour: Array<{ hour: number; count: number }>
  bounce_rate: number
  avg_session_events: number
  device_breakdown: Array<{ device_type: string; count: number }>
  browser_breakdown: Array<{ browser: string; count: number }>
  os_breakdown: Array<{ os: string; count: number }>
  country_breakdown: Array<{ country: string; region: string; count: number }>
  timezone_breakdown: Array<{ timezone: string; count: number }>
  language_breakdown: Array<{ language: string; count: number }>
  city_breakdown?: Array<{ city: string; country: string; count: number }>
  form_conversion_by_type: Array<{ form_type: string; submits: number; abandons: number; rate: number }>
  lead_sources: Array<{ source: string; conversions: number }>
  exit_intents: number
}

/** Realtime event for live ticker */
export interface RealtimeEvent {
  event: TrackingEventName
  ts: string
  url: string
  referrer?: string
  utm_source?: string
}

export interface AnalyticsStatusInfo {
  total_events: number
  oldest_event?: string
  newest_event?: string
  db_size_bytes: number
  last_cleanup?: string
  last_cleanup_count?: number
}

/* ------------------------------------------------------------------ */
/*  Export Types                                                        */
/* ------------------------------------------------------------------ */

export type ExportFormat = 'csv' | 'json'

export interface ExportRequest {
  format: ExportFormat
  from?: string // ISO date
  to?: string   // ISO date
  event_type?: TrackingEventName
  limit?: number
}

/* ------------------------------------------------------------------ */
/*  Active Visitor Types (Real-time tracking)                          */
/* ------------------------------------------------------------------ */

/** Timeline entry for a visitor's recent activity */
export interface VisitorTimelineEntry {
  event: string
  ts: string
  url: string
}

/** A currently active visitor (session) */
export interface ActiveVisitor {
  session_id: string
  session_id_hash: string
  current_page: string
  last_event: string
  last_seen: string
  first_seen_in_window: string
  session_start: string
  event_count: number
  timeline: VisitorTimelineEntry[]
}

/** Response from analytics-visitors.php */
export interface ActiveVisitorsResponse {
  active_visitors: number
  window_seconds: number
  server_time: string
  visitors: ActiveVisitor[]
}
