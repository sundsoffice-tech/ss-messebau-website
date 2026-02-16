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
  },
  utm_whitelist: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
  domain_whitelist: ['sunds-messebau.de', 'www.sunds-messebau.de', 'localhost'],
  retention_days: 90,
  aggregation_months: 24,
  store_ip: false,
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
