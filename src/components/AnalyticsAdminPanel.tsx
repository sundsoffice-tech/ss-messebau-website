import type React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  ChartLine,
  Gear,
  Export,
  Heartbeat,
  Trash,
  ArrowClockwise,
  ToggleLeft,
  ToggleRight,
  DownloadSimple,
  Eye,
  ShieldCheck,
  Lightning,
  TrendUp,
  Globe,
  ClipboardText,
  Phone,
  ChatCircleDots,
  FileArrowDown,
  UsersThree,
  UserCirclePlus,
  UserCircle,
  DeviceMobile,
  Desktop,
  Browsers,
  FunnelSimple,
  Signpost,
  SignOut as SignOutIcon,
  MapPin,
  GlobeHemisphereWest,
  Translate,
  ArrowUp,
  ArrowDown,
  Timer,
  Fire,
  Warning,
  Monitor,
  WifiHigh,
  CaretRight,
  CalendarBlank,
  Table,
  Bug,
  Gauge,
  Path,
} from '@phosphor-icons/react'
import {
  fetchTrackingConfig,
  saveTrackingConfigToServer,
  fetchAnalyticsKPIs,
  fetchAnalyticsStatus,
  runAnalyticsCleanup,
  exportAnalyticsData,
  fetchRealtimeEvents,
  fetchActiveVisitors,
} from '@/lib/analytics-tracker'
import type {
  TrackingConfig,
  TrackingEventName,
  AnalyticsKPIs,
  AnalyticsStatusInfo,
  ExportFormat,
  RealtimeEvent,
  ActiveVisitor,
  ActiveVisitorsResponse,
  PeriodComparison,
  HeatmapCell,
} from '@/types/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend } from 'recharts'

/* ------------------------------------------------------------------ */
/*  Event labels                                                       */
/* ------------------------------------------------------------------ */

const FLAG_EMOJI: Record<string, string> = {
  DE: '\uD83C\uDDE9\uD83C\uDDEA', AT: '\uD83C\uDDE6\uD83C\uDDF9',
  CH: '\uD83C\uDDE8\uD83C\uDDED', NL: '\uD83C\uDDF3\uD83C\uDDF1',
  FR: '\uD83C\uDDEB\uD83C\uDDF7', GB: '\uD83C\uDDEC\uD83C\uDDE7',
  IT: '\uD83C\uDDEE\uD83C\uDDF9', ES: '\uD83C\uDDEA\uD83C\uDDF8',
  PL: '\uD83C\uDDF5\uD83C\uDDF1', SE: '\uD83C\uDDF8\uD83C\uDDEA',
  NO: '\uD83C\uDDF3\uD83C\uDDF4', DK: '\uD83C\uDDE9\uD83C\uDDF0',
  BE: '\uD83C\uDDE7\uD83C\uDDEA', LU: '\uD83C\uDDF1\uD83C\uDDFA',
  CZ: '\uD83C\uDDE8\uD83C\uDDFF', HU: '\uD83C\uDDED\uD83C\uDDFA',
  RO: '\uD83C\uDDF7\uD83C\uDDF4', PT: '\uD83C\uDDF5\uD83C\uDDF9',
  GR: '\uD83C\uDDEC\uD83C\uDDF7', FI: '\uD83C\uDDEB\uD83C\uDDEE',
  TR: '\uD83C\uDDF9\uD83C\uDDF7', RU: '\uD83C\uDDF7\uD83C\uDDFA',
}

const EVENT_LABELS: Record<TrackingEventName, string> = {
  page_view: 'Seitenaufrufe',
  cta_click: 'CTA-Klicks',
  form_submit: 'Formular-Abschlüsse',
  phone_click: 'Telefon-Klicks',
  whatsapp_click: 'WhatsApp-Klicks',
  download: 'Downloads',
  scroll_depth: 'Scroll-Tiefe',
  page_engagement: 'Verweildauer',
  blog_article_read: 'Blog-Artikel gelesen',
  heartbeat: 'Herzschlag',
  session_start: 'Session-Start',
  session_end: 'Session-Ende',
  form_interaction: 'Formular-Interaktion',
  form_abandon: 'Formular-Abbruch',
  exit_intent: 'Exit-Intent',
  configurator_step: 'Konfigurator-Schritt',
  outbound_click: 'Externer Link',
  video_play: 'Video-Wiedergabe',
  error: 'Fehler',
  performance: 'Performance',
  search: 'Suche',
  tab_visibility: 'Tab-Sichtbarkeit',
}

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const SESSION_QUALITY_COLORS: Record<string, string> = {
  bounce: '#ef4444',
  low: '#f97316',
  medium: '#eab308',
  high: '#22c55e',
  power_user: '#6366f1',
}

const SESSION_QUALITY_LABELS: Record<string, string> = {
  bounce: 'Bounce',
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  power_user: 'Power User',
}

const DATE_PRESETS = [
  { label: 'Heute', days: 0 },
  { label: '7 Tage', days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
  { label: '1 Jahr', days: 365 },
]

/* ================================================================== */
/*  1) Tracking Config Tab                                             */
/* ================================================================== */

function TrackingConfigTab() {
  const [config, setConfig] = useState<TrackingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTrackingConfig()
      .then(setConfig)
      .catch(() => toast.error('Konfiguration konnte nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [])

  const save = async (updated: TrackingConfig) => {
    setSaving(true)
    try {
      await saveTrackingConfigToServer(updated)
      setConfig(updated)
      toast.success('Konfiguration gespeichert')
    } catch {
      toast.error('Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Lade Konfiguration…</p></Card>
  }

  return (
    <div className="space-y-6">
      {/* Global Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Tracking global</h4>
              <p className="text-sm text-muted-foreground">Alle Events aktivieren / deaktivieren</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => save({ ...config, enabled: !config.enabled })}
              disabled={saving}
            >
              {config.enabled
                ? <ToggleRight className="w-8 h-8 text-green-600" weight="fill" />
                : <ToggleLeft className="w-8 h-8 text-muted-foreground" weight="fill" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Per-Event Toggles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Event-Steuerung</CardTitle>
          <CardDescription>Einzelne Event-Typen ein-/ausschalten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(EVENT_LABELS) as TrackingEventName[]).map(evName => (
            <div key={evName} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
              <span className="text-sm">{EVENT_LABELS[evName]}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const events = { ...config.events, [evName]: !config.events[evName] }
                  save({ ...config, events })
                }}
                disabled={saving}
              >
                {config.events[evName]
                  ? <ToggleRight className="w-6 h-6 text-green-600" weight="fill" />
                  : <ToggleLeft className="w-6 h-6 text-muted-foreground" weight="fill" />}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Retention & Privacy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Datenschutz & Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Rohdaten-Aufbewahrung (Tage)</label>
              <Input
                type="number"
                min={1}
                max={365}
                value={config.retention_days}
                onChange={e => setConfig({ ...config, retention_days: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Aggregationen (Monate)</label>
              <Input
                type="number"
                min={1}
                max={60}
                value={config.aggregation_months}
                onChange={e => setConfig({ ...config, aggregation_months: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">IP-Adressen speichern</span>
              <p className="text-xs text-muted-foreground">Standard: AUS (DSGVO-konform)</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfig({ ...config, store_ip: !config.store_ip })}
            >
              {config.store_ip
                ? <ToggleRight className="w-6 h-6 text-orange-500" weight="fill" />
                : <ToggleLeft className="w-6 h-6 text-green-600" weight="fill" />}
            </Button>
          </div>
          {/* Geolocation Settings */}
          <div className="border-t pt-4 mt-2 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <GlobeHemisphereWest className="w-4 h-4" />
              Geolocation (Server-Side)
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Server-Geolocation aktivieren</span>
                <p className="text-xs text-muted-foreground">Stadt-genaue Standortdaten via ip-api.com</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfig({ ...config, geo_enabled: !config.geo_enabled })}
              >
                {config.geo_enabled
                  ? <ToggleRight className="w-6 h-6 text-teal-500" weight="fill" />
                  : <ToggleLeft className="w-6 h-6 text-muted-foreground" weight="fill" />}
              </Button>
            </div>
            {config.geo_enabled && (
              <div className="space-y-1">
                <label className="text-xs font-medium">IP-API Key (optional)</label>
                <Input
                  type="password"
                  placeholder="Leer = kostenloser Zugang (45 req/min)"
                  value={config.geo_api_key || ''}
                  onChange={e => setConfig({ ...config, geo_api_key: e.target.value })}
                  className="h-8 text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Ohne Key: HTTP, 45 Anfragen/min. Mit Pro-Key: HTTPS, hoehere Limits.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => save(config)}
              disabled={saving}
              className="gap-2"
            >
              <Gear className="w-4 h-4" />
              Einstellungen speichern
            </Button>
          </div>

          {config.last_cleanup && (
            <p className="text-xs text-muted-foreground">
              Letzte Bereinigung: {new Date(config.last_cleanup).toLocaleString('de-DE')}
              {config.last_cleanup_count != null && ` · ${config.last_cleanup_count} Einträge gelöscht`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================== */
/*  2) KPI Dashboard Tab                                               */
/* ================================================================== */

function KPIDashboardTab() {
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const load = useCallback(() => {
    setLoading(true)
    fetchAnalyticsKPIs(from, to)
      .then(setKpis)
      .catch(() => toast.error('KPIs konnten nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [from, to])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Lade KPIs…</p></Card>
  }

  if (!kpis) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Keine Daten verfügbar</p></Card>
  }

  return (
    <div className="space-y-4">
      {/* Date filter with presets */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map(preset => {
              const presetFrom = preset.days === 0
                ? new Date().toISOString().split('T')[0]
                : new Date(Date.now() - preset.days * 86400000).toISOString().split('T')[0]
              const isActive = from === presetFrom
              return (
                <Button
                  key={preset.label}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7 gap-1"
                  onClick={() => {
                    setFrom(presetFrom)
                    setTo(new Date().toISOString().split('T')[0])
                  }}
                >
                  <CalendarBlank className="w-3 h-3" />
                  {preset.label}
                </Button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Von</label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bis</label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-sm" />
            </div>
            <Button size="sm" onClick={load} className="gap-2 h-8">
              <ArrowClockwise className="w-4 h-4" />
              Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards with Period Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPICard label="Events gesamt" value={kpis.total_events} icon={<ChartLine className="w-4 h-4" />} comparison={kpis.comparison?.total_events} />
        <KPICard label="Besucher" value={kpis.unique_visitors} icon={<UsersThree className="w-4 h-4" />} comparison={kpis.comparison?.unique_visitors} />
        <KPICard label="Sessions" value={kpis.unique_sessions} icon={<Eye className="w-4 h-4" />} comparison={kpis.comparison?.unique_sessions} />
        <KPICard label="Seitenaufrufe" value={kpis.page_views} icon={<Globe className="w-4 h-4" />} comparison={kpis.comparison?.page_views} />
        <KPICard label="CTA-Klicks" value={kpis.cta_clicks} icon={<TrendUp className="w-4 h-4" />} comparison={kpis.comparison?.cta_clicks} />
        <KPICard label="Formulare" value={kpis.form_submits} icon={<ClipboardText className="w-4 h-4" />} comparison={kpis.comparison?.form_submits} />
        <KPICard label="Telefon" value={kpis.phone_clicks} icon={<Phone className="w-4 h-4" />} />
        <KPICard label="WhatsApp" value={kpis.whatsapp_clicks} icon={<ChatCircleDots className="w-4 h-4" />} />
        <KPICard label="Downloads" value={kpis.downloads} icon={<FileArrowDown className="w-4 h-4" />} />
        <KPICard label="Conversion Rate" value={Number(kpis.conversion_rate?.toFixed(1) ?? 0)} icon={<FunnelSimple className="w-4 h-4" />} />
      </div>

      {/* Engagement Score + Session Quality + Visitor Segments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engagement Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Fire className="w-4 h-4 text-orange-500" />
              Engagement Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <EngagementScoreRing score={kpis.engagement?.engagement_score ?? 0} />
            {kpis.engagement && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs w-full">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ø Dauer</span>
                  <span className="font-medium">{Math.round(kpis.engagement.avg_session_duration_seconds)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ø Seiten</span>
                  <span className="font-medium">{kpis.engagement.avg_pages_per_session.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scroll-Tiefe</span>
                  <span className="font-medium">{kpis.engagement.avg_scroll_depth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interaktion</span>
                  <span className="font-medium">{kpis.engagement.interaction_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Rate</span>
                  <span className="font-medium">{kpis.engagement.return_rate}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Quality Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Session-Qualitaet
            </CardTitle>
            <CardDescription>Verteilung der Session-Tiefe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {kpis.session_quality && kpis.session_quality.length > 0 ? (
              <>
                {/* Stacked bar */}
                <div className="h-6 rounded-full overflow-hidden flex">
                  {kpis.session_quality.map(sq => (
                    <div
                      key={sq.quality}
                      className="h-full transition-all"
                      style={{
                        width: `${sq.pct}%`,
                        backgroundColor: SESSION_QUALITY_COLORS[sq.quality] ?? '#94a3b8',
                        minWidth: sq.pct > 0 ? '4px' : '0',
                      }}
                      title={`${SESSION_QUALITY_LABELS[sq.quality]}: ${sq.pct}% (${sq.count})`}
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="space-y-1.5 mt-3">
                  {kpis.session_quality.map(sq => (
                    <div key={sq.quality} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SESSION_QUALITY_COLORS[sq.quality] }} />
                        <span>{SESSION_QUALITY_LABELS[sq.quality]}</span>
                      </div>
                      <span className="text-muted-foreground">{sq.pct}% ({sq.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            )}
            <div className="pt-2 border-t mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Bounce Rate</span>
                <p className={`font-bold text-lg ${kpis.bounce_rate > 70 ? 'text-red-500' : kpis.bounce_rate > 40 ? 'text-amber-500' : 'text-green-600'}`}>
                  {kpis.bounce_rate}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Ø Events/Session</span>
                <p className="font-bold text-lg">{kpis.avg_session_events}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Segments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Besucher-Segmente
            </CardTitle>
            <CardDescription>Neu vs. Wiederkehrend</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.visitor_segments ? (
              <div className="space-y-4">
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${kpis.visitor_segments.new_pct}%` }}
                  />
                  <div
                    className="h-full bg-violet-500 transition-all"
                    style={{ width: `${kpis.visitor_segments.returning_pct}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <UserCirclePlus className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-xl font-bold">{kpis.visitor_segments.new_visitors}</p>
                    <p className="text-xs text-muted-foreground">Neu ({kpis.visitor_segments.new_pct}%)</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30">
                    <UserCircle className="w-5 h-5 mx-auto mb-1 text-violet-600" />
                    <p className="text-xl font-bold">{kpis.visitor_segments.returning_visitors}</p>
                    <p className="text-xs text-muted-foreground">Wiederkehrend ({kpis.visitor_segments.returning_pct}%)</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events per Day Chart - Multi-Series */}
      {kpis.events_by_day.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Traffic-Verlauf</CardTitle>
            <CardDescription>Events, Sessions, Seitenaufrufe & Conversions pro Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={kpis.events_by_day}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getDate()}.${d.getMonth() + 1}.`
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  labelFormatter={(v: string) => new Date(v).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEvents)" name="Events" />
                <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                <Area type="monotone" dataKey="page_views" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPageViews)" name="Seitenaufrufe" />
                <Area type="monotone" dataKey="conversions" stroke="#22c55e" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Hourly Distribution */}
      {kpis.events_by_hour.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verteilung nach Uhrzeit</CardTitle>
            <CardDescription>Wann sind Besucher am aktivsten?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData(kpis.events_by_hour)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}:00`}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v: number) => `${v}:00 – ${v}:59 Uhr`} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Events" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Pages & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Seiten</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.top_pages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            ) : (
              <div className="space-y-1.5">
                {kpis.top_pages.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 mr-2 font-mono text-xs">{p.url}</span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Quellen (UTM)</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.top_sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine UTM-Daten</p>
            ) : (
              <div className="space-y-1.5">
                {kpis.top_sources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 mr-2">{s.source}</span>
                    <Badge variant="secondary">{s.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referrers & Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Referrer</CardTitle>
            <CardDescription>Woher kommen Besucher?</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.top_referrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Referrer-Daten</p>
            ) : (
              <div className="space-y-2">
                {kpis.top_referrers.map((r, i) => {
                  const maxCount = kpis.top_referrers[0]?.count ?? 1
                  const pct = Math.round((r.count / maxCount) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="truncate flex-1 mr-2 text-xs">{r.referrer}</span>
                        <span className="text-xs text-muted-foreground">{r.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Kampagnen</CardTitle>
            <CardDescription>UTM Campaign Performance</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.top_campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Kampagnen-Daten</p>
            ) : (
              <div className="space-y-2">
                {kpis.top_campaigns.map((c, i) => {
                  const maxCount = kpis.top_campaigns[0]?.count ?? 1
                  const pct = Math.round((c.count / maxCount) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="truncate flex-1 mr-2 font-medium text-xs">{c.campaign}</span>
                        <Badge variant="outline" className="text-xs">{c.count}</Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Conversion Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FunnelSimple className="w-4 h-4" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>Vom Seitenaufruf zur Conversion</CardDescription>
        </CardHeader>
        <CardContent>
          {kpis.conversion_funnel && kpis.conversion_funnel.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-stretch gap-1">
                {kpis.conversion_funnel.map((step, i) => {
                  return (
                    <div key={step.step} className="flex items-center flex-1 min-w-0">
                      <div
                        className="w-full rounded-lg p-3 text-center transition-all relative"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary) / ${0.15 + (1 - i / kpis.conversion_funnel.length) * 0.25}), hsl(var(--primary) / ${0.05 + (1 - i / kpis.conversion_funnel.length) * 0.15}))`,
                          borderLeft: `3px solid hsl(var(--primary) / ${1 - i * 0.2})`,
                        }}
                      >
                        <p className="text-lg font-bold">{step.count.toLocaleString('de-DE')}</p>
                        <p className="text-xs font-medium truncate">{step.label}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">{step.pct_of_total}%</Badge>
                          {i > 0 && step.drop_off > 0 && (
                            <Badge variant="destructive" className="text-[10px] h-4">-{step.drop_off}%</Badge>
                          )}
                        </div>
                      </div>
                      {i < kpis.conversion_funnel.length - 1 && (
                        <CaretRight className="w-4 h-4 text-muted-foreground shrink-0 mx-0.5" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Gesamte Conversion Rate: </span>
                <span className="font-bold text-green-600">{kpis.conversion_rate?.toFixed(2) ?? 0}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FunnelStepCard label="Seitenaufrufe" value={kpis.page_views} pct={100} />
              <CaretRight className="w-4 h-4 text-muted-foreground" />
              <FunnelStepCard label="CTA-Klicks" value={kpis.cta_clicks} pct={kpis.page_views > 0 ? Math.round((kpis.cta_clicks / kpis.page_views) * 100) : 0} />
              <CaretRight className="w-4 h-4 text-muted-foreground" />
              <FunnelStepCard label="Formulare" value={kpis.form_submits} pct={kpis.cta_clicks > 0 ? Math.round((kpis.form_submits / kpis.cta_clicks) * 100) : 0} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Traffic Heatmap */}
      {kpis.heatmap && kpis.heatmap.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Fire className="w-4 h-4" />
              Traffic Heatmap
            </CardTitle>
            <CardDescription>Besucheraktivitaet nach Wochentag & Uhrzeit</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapGrid cells={kpis.heatmap} />
            <div className="flex items-center justify-end gap-1 mt-2">
              <span className="text-[10px] text-muted-foreground">Wenig</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(i => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${0.1 + i * 0.85})` }} />
              ))}
              <span className="text-[10px] text-muted-foreground">Viel</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.device_breakdown && kpis.device_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DeviceMobile className="w-4 h-4" />
                Geräte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.device_breakdown.map((d, i) => {
                  const total = kpis.device_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="flex items-center gap-1.5">
                          {d.device_type === 'desktop' ? <Desktop className="w-3.5 h-3.5" /> : <DeviceMobile className="w-3.5 h-3.5" />}
                          {d.device_type}
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}% ({d.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {kpis.browser_breakdown && kpis.browser_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Browsers className="w-4 h-4" />
                Browser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.browser_breakdown.map((b, i) => {
                  const total = kpis.browser_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((b.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span>{b.browser}</span>
                        <span className="text-xs text-muted-foreground">{pct}% ({b.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {kpis.os_breakdown && kpis.os_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Desktop className="w-4 h-4" />
                Betriebssystem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.os_breakdown.map((o, i) => {
                  const total = kpis.os_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((o.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span>{o.os}</span>
                        <span className="text-xs text-muted-foreground">{pct}% ({o.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Geographic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.country_breakdown && kpis.country_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Herkunft (Land)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.country_breakdown.map((c, i) => {
                  const total = kpis.country_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((c.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="flex items-center gap-1.5">
                          {FLAG_EMOJI[c.country] ?? '\uD83C\uDF0D'} {c.region}
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}% ({c.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {kpis.timezone_breakdown && kpis.timezone_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GlobeHemisphereWest className="w-4 h-4" />
                Zeitzonen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.timezone_breakdown.map((t, i) => {
                  const total = kpis.timezone_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((t.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="text-xs">{t.timezone}</span>
                        <span className="text-xs text-muted-foreground">{pct}% ({t.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {kpis.language_breakdown && kpis.language_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Translate className="w-4 h-4" />
                Sprachen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.language_breakdown.map((l, i) => {
                  const total = kpis.language_breakdown.reduce((s, x) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((l.count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span>{l.language}</span>
                        <span className="text-xs text-muted-foreground">{pct}% ({l.count})</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* City Breakdown (Server-Side Geo) */}
      {kpis.city_breakdown && kpis.city_breakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Top Staedte
            </CardTitle>
            <CardDescription>Besucher nach Stadt (Server-Geolocation)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {kpis.city_breakdown.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <span>{c.city}, {c.country}</span>
                  <Badge variant="secondary" className="ml-2">{c.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Conversion by Type */}
      {kpis.form_conversion_by_type && kpis.form_conversion_by_type.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FunnelSimple className="w-4 h-4" />
              Formular-Conversion nach Typ
            </CardTitle>
            <CardDescription>Abschluss vs. Abbruch pro Formulartyp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.form_conversion_by_type.map((fc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{fc.form_type}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="text-xs">{fc.submits} Abschlüsse</Badge>
                      <Badge variant="destructive" className="text-xs">{fc.abandons} Abbrüche</Badge>
                      <Badge variant="outline" className="text-xs font-bold">{fc.rate}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-green-500 rounded-l-full"
                      style={{ width: `${fc.rate}%` }}
                    />
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${100 - fc.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Performance Table */}
      {kpis.page_performance && kpis.page_performance.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Table className="w-4 h-4" />
              Seiten-Performance
            </CardTitle>
            <CardDescription>Detaillierte Metriken pro Seite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-1 font-medium">Seite</th>
                    <th className="text-right py-2 px-1 font-medium">Views</th>
                    <th className="text-right py-2 px-1 font-medium">Sessions</th>
                    <th className="text-right py-2 px-1 font-medium">Scroll %</th>
                    <th className="text-right py-2 px-1 font-medium">Ø Engage.</th>
                    <th className="text-right py-2 px-1 font-medium">Bounce</th>
                    <th className="text-right py-2 px-1 font-medium">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.page_performance.slice(0, 15).map((p, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-1.5 px-1 font-mono truncate max-w-[200px]" title={p.url}>{p.url}</td>
                      <td className="text-right py-1.5 px-1">{p.views}</td>
                      <td className="text-right py-1.5 px-1">{p.unique_sessions}</td>
                      <td className="text-right py-1.5 px-1">{p.avg_scroll_depth}%</td>
                      <td className="text-right py-1.5 px-1">{Math.round(p.avg_engagement_time)}s</td>
                      <td className="text-right py-1.5 px-1">
                        <span className={p.bounce_rate > 70 ? 'text-red-500' : p.bounce_rate > 40 ? 'text-amber-500' : 'text-green-600'}>
                          {p.bounce_rate}%
                        </span>
                      </td>
                      <td className="text-right py-1.5 px-1">
                        <Badge variant="secondary" className="text-[10px] h-4">{p.conversions}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Paths */}
      {kpis.navigation_paths && kpis.navigation_paths.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Path className="w-4 h-4" />
              Navigation-Pfade
            </CardTitle>
            <CardDescription>Haeufigste Seitenuebergaenge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.navigation_paths.slice(0, 10).map((path, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono truncate flex-1 text-right" title={path.from_page}>{path.from_page}</span>
                  <CaretRight className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono truncate flex-1" title={path.to_page}>{path.to_page}</span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{path.count}</Badge>
                  <span className="text-muted-foreground shrink-0 w-10 text-right">{path.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screen Resolution & Connection Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.screen_resolution_breakdown && kpis.screen_resolution_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Bildschirmaufloesung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.screen_resolution_breakdown.slice(0, 8).map((r, i) => {
                  const total = kpis.screen_resolution_breakdown!.reduce((s, x) => s + x.count, 0)
                  return <PercentageBar key={i} label={r.resolution} value={r.count} total={total} color="bg-cyan-500/60" />
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {kpis.connection_type_breakdown && kpis.connection_type_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <WifiHigh className="w-4 h-4" />
                Verbindungstyp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.connection_type_breakdown.map((c, i) => {
                  const total = kpis.connection_type_breakdown!.reduce((s, x) => s + x.count, 0)
                  return <PercentageBar key={i} label={c.connection} value={c.count} total={total} color="bg-emerald-500/60" />
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Web Performance Metrics */}
      {kpis.performance_metrics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Web Performance (Core Vitals)
            </CardTitle>
            <CardDescription>Durchschnittliche Ladezeiten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={`text-xl font-bold ${
                  kpis.performance_metrics.avg_ttfb_ms < 200 ? 'text-green-600' :
                  kpis.performance_metrics.avg_ttfb_ms < 500 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round(kpis.performance_metrics.avg_ttfb_ms)}ms
                </p>
                <p className="text-xs text-muted-foreground">TTFB</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={`text-xl font-bold ${
                  kpis.performance_metrics.avg_fcp_ms < 1800 ? 'text-green-600' :
                  kpis.performance_metrics.avg_fcp_ms < 3000 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round(kpis.performance_metrics.avg_fcp_ms)}ms
                </p>
                <p className="text-xs text-muted-foreground">FCP</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={`text-xl font-bold ${
                  kpis.performance_metrics.avg_dom_interactive_ms < 2500 ? 'text-green-600' :
                  kpis.performance_metrics.avg_dom_interactive_ms < 4000 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round(kpis.performance_metrics.avg_dom_interactive_ms)}ms
                </p>
                <p className="text-xs text-muted-foreground">DOM Interactive</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className={`text-xl font-bold ${
                  kpis.performance_metrics.avg_page_load_ms < 3000 ? 'text-green-600' :
                  kpis.performance_metrics.avg_page_load_ms < 5000 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round(kpis.performance_metrics.avg_page_load_ms)}ms
                </p>
                <p className="text-xs text-muted-foreground">Page Load</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Monitoring */}
      {kpis.top_errors && kpis.top_errors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Warning className="w-4 h-4 text-red-500" />
              Fehler-Monitoring
            </CardTitle>
            <CardDescription>Haeufigste JavaScript-Fehler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.top_errors.map((err, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                  <Bug className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono truncate" title={err.error_message}>{err.error_message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Zuletzt: {new Date(err.last_seen).toLocaleString('de-DE')}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">{err.count}x</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Source Attribution & Exit Intent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.lead_sources && kpis.lead_sources.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Signpost className="w-4 h-4" />
                Lead-Quellen
              </CardTitle>
              <CardDescription>Welche UTM-Quellen führen zu Conversions?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kpis.lead_sources.map((ls, i) => {
                  const maxCount = kpis.lead_sources[0]?.conversions ?? 1
                  const pct = Math.round((ls.conversions / maxCount) * 100)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className="font-medium">{ls.source}</span>
                        <Badge variant="secondary" className="text-xs">{ls.conversions} Conversions</Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <SignOutIcon className="w-4 h-4" />
              Exit-Intents
            </CardTitle>
            <CardDescription>Wie oft versuchen Nutzer die Seite zu verlassen?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-3xl font-bold">{(kpis.exit_intents ?? 0).toLocaleString('de-DE')}</p>
              <p className="text-sm text-muted-foreground mt-1">Exit-Versuche im Zeitraum</p>
              {kpis.unique_sessions > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(((kpis.exit_intents ?? 0) / kpis.unique_sessions) * 100)}% der Sessions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ label, value, icon, comparison }: {
  label: string
  value: number
  icon?: React.ReactNode
  comparison?: PeriodComparison
}) {
  const changePct = comparison?.change_pct ?? null
  const isPositive = changePct !== null && changePct > 0
  const isNegative = changePct !== null && changePct < 0

  return (
    <Card className="p-3 text-center relative overflow-hidden">
      {icon && <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>}
      <p className="text-2xl font-bold">{value.toLocaleString('de-DE')}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {changePct !== null && (
        <div className={`flex items-center justify-center gap-0.5 mt-1 text-xs font-medium ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {isPositive ? <ArrowUp className="w-3 h-3" weight="bold" /> : isNegative ? <ArrowDown className="w-3 h-3" weight="bold" /> : null}
          {Math.abs(changePct).toFixed(1)}%
          <span className="text-[10px] text-muted-foreground ml-0.5">vs. Vorperiode</span>
        </div>
      )}
    </Card>
  )
}

/** Engagement Score Ring */
function EngagementScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

/** Heatmap Grid Component */
function HeatmapGrid({ cells }: { cells: HeatmapCell[] }) {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  const intensityGrid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))
  cells.forEach(c => {
    if (c.day >= 0 && c.day < 7 && c.hour >= 0 && c.hour < 24) {
      grid[c.day][c.hour] = c.count
      intensityGrid[c.day][c.hour] = c.intensity
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex items-center gap-0.5 mb-1 ml-8">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
              {h % 3 === 0 ? `${h}` : ''}
            </div>
          ))}
        </div>
        {DAY_NAMES.map((day, di) => (
          <div key={di} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-7 text-[10px] text-muted-foreground text-right pr-1">{day}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const intensity = intensityGrid[di][h]
              const count = grid[di][h]
              return (
                <div
                  key={h}
                  className="flex-1 aspect-square rounded-sm cursor-default transition-colors"
                  style={{
                    backgroundColor: intensity > 0
                      ? `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`
                      : 'hsl(var(--muted))',
                  }}
                  title={`${DAY_NAMES[di]} ${h}:00 – ${count} Events`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Percentage bar with label */
function PercentageBar({ label, value, total, color = 'bg-primary/60' }: {
  label: string; value: number; total: number; color?: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-0.5">
        <span className="truncate flex-1 mr-2">{label}</span>
        <span className="text-xs text-muted-foreground">{pct}% ({value})</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Fill all 24 hours so the chart has no gaps */
function hourlyData(data: Array<{ hour: number; count: number }>): Array<{ hour: number; count: number }> {
  const map = new Map(data.map(d => [d.hour, d.count]))
  return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: map.get(i) ?? 0 }))
}

function FunnelStepCard({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="flex-1 text-center p-3 rounded-lg bg-muted/50">
      <p className="text-lg font-bold">{value.toLocaleString('de-DE')}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge variant="outline" className="mt-1 text-xs">{pct}%</Badge>
    </div>
  )
}

/* ================================================================== */
/*  3) Export Tab                                                       */
/* ================================================================== */

function ExportTab() {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportAnalyticsData(format, from, to)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_export_${from}_${to}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export heruntergeladen')
    } catch {
      toast.error('Export fehlgeschlagen')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Export className="w-4 h-4" />
            Daten exportieren
          </CardTitle>
          <CardDescription>Rohdaten als CSV oder JSON herunterladen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Von</label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bis</label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Format</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as ExportFormat)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            <DownloadSimple className="w-4 h-4" />
            {exporting ? 'Exportiere…' : 'Export herunterladen'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================== */
/*  4) System Status Tab                                               */
/* ================================================================== */

function SystemStatusTab() {
  const [status, setStatus] = useState<AnalyticsStatusInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchAnalyticsStatus()
      .then(setStatus)
      .catch(() => toast.error('Status konnte nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleCleanup = async () => {
    setCleaning(true)
    try {
      const result = await runAnalyticsCleanup()
      toast.success(`${result.deleted} Einträge bereinigt`)
      load() // refresh status
    } catch {
      toast.error('Bereinigung fehlgeschlagen')
    } finally {
      setCleaning(false)
    }
  }

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Lade Status…</p></Card>
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.total_events?.toLocaleString('de-DE') ?? '0'}</p>
          <p className="text-xs text-muted-foreground">Events gesamt</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.unique_visitors_total?.toLocaleString('de-DE') ?? '0'}</p>
          <p className="text-xs text-muted-foreground">Besucher gesamt</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.events_today?.toLocaleString('de-DE') ?? '0'}</p>
          <p className="text-xs text-muted-foreground">Events heute</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.sessions_today?.toLocaleString('de-DE') ?? '0'}</p>
          <p className="text-xs text-muted-foreground">Sessions heute</p>
        </Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.unique_sessions_total?.toLocaleString('de-DE') ?? '0'}</p>
          <p className="text-xs text-muted-foreground">Sessions gesamt</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{status?.db_size_bytes ? formatBytes(status.db_size_bytes) : '–'}</p>
          <p className="text-xs text-muted-foreground">DB-Groesse</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-sm font-medium">{status?.oldest_event ? new Date(status.oldest_event).toLocaleDateString('de-DE') : '–'}</p>
          <p className="text-xs text-muted-foreground">Aeltestes Event</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-sm font-medium">{status?.newest_event ? new Date(status.newest_event).toLocaleDateString('de-DE') : '–'}</p>
          <p className="text-xs text-muted-foreground">Neuestes Event</p>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Trash className="w-4 h-4" />
            Daten bereinigen
          </h4>
          <p className="text-sm text-muted-foreground">
            Löscht Events die älter als die eingestellte Aufbewahrungsfrist sind.
          </p>
          {status?.last_cleanup && (
            <p className="text-xs text-muted-foreground">
              Letzte Bereinigung: {new Date(status.last_cleanup).toLocaleString('de-DE')}
              {status.last_cleanup_count != null && ` · ${status.last_cleanup_count} Einträge gelöscht`}
            </p>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCleanup}
            disabled={cleaning}
            className="gap-2"
          >
            <Trash className="w-4 h-4" />
            {cleaning ? 'Bereinige…' : 'Jetzt bereinigen'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================== */
/*  5) Active Visitors Tab                                             */
/* ================================================================== */

function formatTimeWithSeconds(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ts
  }
}

function formatRelativeSeconds(ts: string): string {
  try {
    const d = new Date(ts)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diffSec < 5) return 'gerade eben'
    if (diffSec < 60) return `vor ${diffSec}s`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `vor ${diffMin}m ${diffSec % 60}s`
    return formatTimeWithSeconds(ts)
  } catch {
    return ts
  }
}

function formatDuration(startTs: string): string {
  try {
    const start = new Date(startTs)
    const now = new Date()
    const totalSec = Math.floor((now.getTime() - start.getTime()) / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    if (min === 0) return `${sec}s`
    return `${min}m ${sec}s`
  } catch {
    return '\u2013'
  }
}

function VisitorCard({
  visitor,
  expanded,
  onToggle,
}: {
  visitor: ActiveVisitor
  expanded: boolean
  onToggle: () => void
}) {
  const hue = parseInt(visitor.session_id_hash.slice(0, 4), 16) % 360
  const avatarColor = `hsl(${hue}, 60%, 50%)`

  return (
    <Card
      className="overflow-hidden transition-all cursor-pointer hover:border-primary/30"
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {visitor.session_id.slice(0, 4)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-medium truncate">
                {visitor.current_page}
              </span>
              <Badge variant="outline" className="text-xs">
                {EVENT_LABELS[visitor.last_event as TrackingEventName] ?? visitor.last_event}
              </Badge>
              {visitor.is_returning && (
                <Badge variant="secondary" className="text-[10px] h-4 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  Wiederkehrend
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span>Session: {formatDuration(visitor.session_start)}</span>
              <span>{visitor.event_count} Events</span>
              <span>{visitor.page_count} Seiten</span>
              {visitor.device_type && <span className="flex items-center gap-0.5">{visitor.device_type === 'desktop' ? <Desktop className="w-3 h-3" /> : <DeviceMobile className="w-3 h-3" />}{visitor.device_type}</span>}
              {visitor.browser && <span>{visitor.browser}</span>}
              {visitor.city && visitor.country && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {visitor.city}{visitor.country ? `, ${visitor.country}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-mono">{formatTimeWithSeconds(visitor.last_seen)}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeSeconds(visitor.last_seen)}</p>
          </div>
        </div>

        {expanded && visitor.timeline.length > 0 && (
          <div className="mt-4 pt-3 border-t space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Aktivit\u00e4ts-Verlauf</h4>
            {visitor.timeline.map((entry, i) => (
              <div key={`${entry.ts}-${i}`} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-20 shrink-0">
                  {formatTimeWithSeconds(entry.ts)}
                </span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  entry.event === 'heartbeat' ? 'bg-muted-foreground/40' : 'bg-primary'
                }`} />
                <Badge
                  variant={entry.event === 'heartbeat' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {EVENT_LABELS[entry.event as TrackingEventName] ?? entry.event}
                </Badge>
                <span className="font-mono text-xs truncate text-muted-foreground">
                  {entry.url}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActiveVisitorsTab() {
  const [data, setData] = useState<ActiveVisitorsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchActiveVisitors(90)
      .then(setData)
      .catch(() => toast.error('Besucher-Daten konnten nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, load])

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Lade Besucher-Daten\u2026</p></Card>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <UsersThree className="w-6 h-6 text-primary" weight="fill" />
                {data && data.active_visitors > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-2xl font-bold">
                  {data?.active_visitors ?? 0}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  Besucher online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Server: {formatTimeWithSeconds(data.server_time)}
                </span>
              )}
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-xs gap-1"
              >
                {autoRefresh ? 'Pausieren' : 'Fortsetzen'}
              </Button>
              <Button variant="outline" size="sm" onClick={load} className="text-xs gap-1">
                <ArrowClockwise className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Visitor Summary */}
      {data && data.active_visitors > 0 && data.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Card className="p-2 text-center">
            <p className="text-lg font-bold">{data.summary.desktop}</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Desktop className="w-3 h-3" />Desktop</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold">{data.summary.mobile}</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><DeviceMobile className="w-3 h-3" />Mobile</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold">{data.summary.tablet}</p>
            <p className="text-[10px] text-muted-foreground">Tablet</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-blue-600">{data.summary.new_visitors}</p>
            <p className="text-[10px] text-muted-foreground">Neue</p>
          </Card>
          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-violet-600">{data.summary.returning_visitors}</p>
            <p className="text-[10px] text-muted-foreground">Wiederkehrend</p>
          </Card>
        </div>
      )}

    {(!data || data.visitors.length === 0) ? (
        <Card className="p-8 text-center">
          <UsersThree className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Keine aktiven Besucher</p>
          <p className="text-xs text-muted-foreground mt-1">
            Besucher erscheinen hier, sobald sie die Website besuchen
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.visitors.map((visitor) => (
            <VisitorCard
              key={visitor.session_id_hash}
              visitor={visitor}
              expanded={expandedSession === visitor.session_id_hash}
              onToggle={() => setExpandedSession(
                expandedSession === visitor.session_id_hash ? null : visitor.session_id_hash
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  6) Realtime Tab                                                    */
/* ================================================================== */

const REALTIME_EVENT_ICONS: Record<string, string> = {
  page_view: '\uD83D\uDCC4',
  cta_click: '\uD83D\uDDB1\uFE0F',
  form_submit: '\uD83D\uDCCB',
  phone_click: '\uD83D\uDCDE',
  whatsapp_click: '\uD83D\uDCAC',
  download: '\u2B07\uFE0F',
  scroll_depth: '\uD83D\uDCDC',
  page_engagement: '\u23F1\uFE0F',
  blog_article_read: '\uD83D\uDCF0',
  heartbeat: '\uD83D\uDC93',
  session_start: '\uD83D\uDE80',
  session_end: '\uD83C\uDFC1',
  form_interaction: '\u270F\uFE0F',
  form_abandon: '\uD83D\uDEAA',
  exit_intent: '\uD83D\uDC4B',
  configurator_step: '\u2699\uFE0F',
  outbound_click: '\uD83D\uDD17',
  video_play: '\u25B6\uFE0F',
  error: '\u26A0\uFE0F',
  performance: '\u23F1',
  search: '\uD83D\uDD0D',
  tab_visibility: '\uD83D\uDC41\uFE0F',
}

function RealtimeTab() {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = useCallback(() => {
    fetchRealtimeEvents(30)
      .then(setEvents)
      .catch(() => toast.error('Realtime-Daten konnten nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, load])

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      if (diffMs < 0) return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      const diffSec = Math.floor(diffMs / 1000)
      if (diffSec < 60) return `vor ${diffSec}s`
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `vor ${diffMin}min`
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ts
    }
  }

  if (loading) {
    return <Card className="p-8 text-center"><p className="text-muted-foreground">Lade Live-Events…</p></Card>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-sm font-medium">
                {autoRefresh ? 'Live – aktualisiert alle 10s' : 'Pausiert'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-xs gap-1"
              >
                {autoRefresh ? 'Pausieren' : 'Fortsetzen'}
              </Button>
              <Button variant="outline" size="sm" onClick={load} className="text-xs gap-1">
                <ArrowClockwise className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <Card className="p-8 text-center">
          <Lightning className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Noch keine Events vorhanden</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {events.map((ev, i) => (
            <div
              key={`${ev.ts}-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
            >
              <span className="text-lg shrink-0">{REALTIME_EVENT_ICONS[ev.event] ?? '📊'}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{EVENT_LABELS[ev.event as TrackingEventName] ?? ev.event}</Badge>
                  {ev.utm_source && (
                    <Badge variant="secondary" className="text-xs">via {ev.utm_source}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{ev.url}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatTime(ev.ts)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function AnalyticsAdminPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="w-5 h-5" />
          Analytics & Tracking
        </CardTitle>
        <CardDescription>
          First-Party Event-Tracking verwalten, KPIs einsehen und Daten exportieren
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="visitors" className="gap-2 text-xs sm:text-sm" aria-label="Besucher Live">
              <UsersThree className="w-4 h-4" />
              <span className="hidden sm:inline">Besucher</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm" aria-label="Dashboard">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="gap-2 text-xs sm:text-sm" aria-label="Live Events">
              <Lightning className="w-4 h-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2 text-xs sm:text-sm" aria-label="Steuerung">
              <Gear className="w-4 h-4" />
              <span className="hidden sm:inline">Steuerung</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2 text-xs sm:text-sm" aria-label="Export">
              <Export className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2 text-xs sm:text-sm" aria-label="System Status">
              <Heartbeat className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visitors">
            <ActiveVisitorsTab />
          </TabsContent>

          <TabsContent value="dashboard">
            <KPIDashboardTab />
          </TabsContent>

          <TabsContent value="realtime">
            <RealtimeTab />
          </TabsContent>

          <TabsContent value="config">
            <TrackingConfigTab />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab />
          </TabsContent>

          <TabsContent value="status">
            <SystemStatusTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
