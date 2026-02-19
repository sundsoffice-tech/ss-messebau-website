/**
 * Analytics & Event Tracking Type Definitions
 * Enterprise-grade first-party analytics pipeline for S&S Messebau
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
  | 'session_end'
  | 'form_interaction'
  | 'form_abandon'
  | 'exit_intent'
  | 'configurator_step'
  | 'outbound_click'
  | 'video_play'
  | 'error'
  | 'performance'
  | 'search'
  | 'tab_visibility'

/** Standard event payload sent to collect endpoint */
export interface TrackingEvent {
  event: TrackingEventName
  ts: string // ISO timestamp
  session_id: string
  visitor_id: string // persistent cross-session identifier
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

/* ------------------------------------------------------------------ */
/*  KPI / Report Types                                                 */
/* ------------------------------------------------------------------ */

/** Period comparison delta */
export interface PeriodComparison {
  current: number
  previous: number
  change_pct: number // positive = growth, negative = decline
}

/** Session quality bucketing */
export interface SessionQualityBucket {
  quality: 'bounce' | 'low' | 'medium' | 'high' | 'power_user'
  count: number
  pct: number
}

/** Page performance entry */
export interface PagePerformance {
  url: string
  views: number
  unique_sessions: number
  avg_scroll_depth: number
  avg_engagement_time: number
  bounce_rate: number
  exit_rate: number
  conversions: number
}

/** Hourly heatmap data */
export interface HeatmapCell {
  day: number // 0=Mon, 6=Sun
  hour: number // 0-23
  count: number
  intensity: number // 0.0-1.0 normalized
}

/** User journey / navigation path */
export interface NavigationPath {
  from_page: string
  to_page: string
  count: number
  pct: number
}

/** Returning vs new visitor stats */
export interface VisitorSegment {
  new_visitors: number
  returning_visitors: number
  new_pct: number
  returning_pct: number
}

/** Conversion funnel step */
export interface FunnelStep {
  step: string
  label: string
  count: number
  pct_of_total: number
  pct_of_previous: number
  drop_off: number
}

/** Engagement score breakdown */
export interface EngagementMetrics {
  avg_session_duration_seconds: number
  avg_pages_per_session: number
  avg_scroll_depth: number
  interaction_rate: number // % of sessions with CTA/form interaction
  return_rate: number // % of visitors who return
  engagement_score: number // 0-100 composite score
}

export interface AnalyticsKPIs {
  // Core metrics
  total_events: number
  unique_sessions: number
  page_views: number
  unique_visitors: number
  cta_clicks: number
  form_submits: number
  phone_clicks: number
  whatsapp_clicks: number
  downloads: number

  // Period comparison
  comparison?: {
    total_events: PeriodComparison
    unique_sessions: PeriodComparison
    page_views: PeriodComparison
    unique_visitors: PeriodComparison
    form_submits: PeriodComparison
    cta_clicks: PeriodComparison
  }

  // Engagement
  bounce_rate: number
  avg_session_events: number
  engagement: EngagementMetrics
  session_quality: SessionQualityBucket[]

  // Visitor segments
  visitor_segments: VisitorSegment

  // Conversion funnel
  conversion_funnel: FunnelStep[]
  conversion_rate: number // overall session -> form_submit rate

  // Time series
  events_by_day: Array<{ date: string; count: number; sessions: number; page_views: number; conversions: number }>
  events_by_hour: Array<{ hour: number; count: number }>
  heatmap: HeatmapCell[]

  // Page analytics
  top_pages: Array<{ url: string; count: number }>
  page_performance: PagePerformance[]
  navigation_paths: NavigationPath[]

  // Traffic sources
  top_referrers: Array<{ referrer: string; count: number }>
  top_sources: Array<{ source: string; count: number }>
  top_campaigns: Array<{ campaign: string; count: number }>

  // Technology
  device_breakdown: Array<{ device_type: string; count: number }>
  browser_breakdown: Array<{ browser: string; count: number }>
  os_breakdown: Array<{ os: string; count: number }>
  screen_resolution_breakdown: Array<{ resolution: string; count: number }>
  connection_type_breakdown: Array<{ connection: string; count: number }>

  // Geography
  country_breakdown: Array<{ country: string; region: string; count: number }>
  timezone_breakdown: Array<{ timezone: string; count: number }>
  language_breakdown: Array<{ language: string; count: number }>
  city_breakdown?: Array<{ city: string; country: string; count: number }>

  // Forms
  form_conversion_by_type: Array<{ form_type: string; submits: number; abandons: number; rate: number }>
  lead_sources: Array<{ source: string; conversions: number }>
  exit_intents: number

  // Performance
  performance_metrics?: {
    avg_page_load_ms: number
    avg_ttfb_ms: number
    avg_fcp_ms: number
    avg_dom_interactive_ms: number
  }

  // Errors
  top_errors?: Array<{ error_message: string; count: number; last_seen: string }>
}

/** Realtime event for live ticker */
export interface RealtimeEvent {
  event: TrackingEventName
  ts: string
  url: string
  referrer?: string
  utm_source?: string
  session_id?: string
  props?: Record<string, string | number | boolean>
}

export interface AnalyticsStatusInfo {
  total_events: number
  oldest_event?: string
  newest_event?: string
  db_size_bytes: number
  last_cleanup?: string
  last_cleanup_count?: number
  unique_sessions_total: number
  unique_visitors_total: number
  events_today: number
  sessions_today: number
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
  props?: Record<string, string | number | boolean>
}

/** A currently active visitor (session) */
export interface ActiveVisitor {
  session_id: string
  session_id_hash: string
  visitor_id_hash: string
  current_page: string
  last_event: string
  last_seen: string
  first_seen_in_window: string
  session_start: string
  event_count: number
  page_count: number
  is_returning: boolean
  device_type: string
  browser: string
  os: string
  country: string
  region: string
  city: string
  timeline: VisitorTimelineEntry[]
}

/** Response from analytics-visitors.php */
export interface ActiveVisitorsResponse {
  active_visitors: number
  window_seconds: number
  server_time: string
  visitors: ActiveVisitor[]
  summary: {
    desktop: number
    mobile: number
    tablet: number
    new_visitors: number
    returning_visitors: number
    top_pages: Array<{ url: string; count: number }>
  }
}
