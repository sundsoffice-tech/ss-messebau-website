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
  DeviceMobile,
  Desktop,
  Browsers,
  FunnelSimple,
  Signpost,
  SignOut as SignOutIcon,
  MapPin,
  GlobeHemisphereWest,
  Translate,
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
} from '@/types/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

/* ------------------------------------------------------------------ */
/*  Event labels                                                       */
/* ------------------------------------------------------------------ */

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
  form_interaction: 'Formular-Interaktion',
  form_abandon: 'Formular-Abbruch',
  exit_intent: 'Exit-Intent',
  configurator_step: 'Konfigurator-Schritt',
}

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
      {/* Date filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Von</label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bis</label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <Button size="sm" onClick={load} className="gap-2">
              <ArrowClockwise className="w-4 h-4" />
              Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPICard label="Events gesamt" value={kpis.total_events} icon={<ChartLine className="w-4 h-4" />} />
        <KPICard label="Sessions" value={kpis.unique_sessions} icon={<Eye className="w-4 h-4" />} />
        <KPICard label="Seitenaufrufe" value={kpis.page_views} icon={<Globe className="w-4 h-4" />} />
        <KPICard label="CTA-Klicks" value={kpis.cta_clicks} icon={<TrendUp className="w-4 h-4" />} />
        <KPICard label="Formulare" value={kpis.form_submits} icon={<ClipboardText className="w-4 h-4" />} />
        <KPICard label="Telefon" value={kpis.phone_clicks} icon={<Phone className="w-4 h-4" />} />
        <KPICard label="WhatsApp" value={kpis.whatsapp_clicks} icon={<ChatCircleDots className="w-4 h-4" />} />
        <KPICard label="Downloads" value={kpis.downloads} icon={<FileArrowDown className="w-4 h-4" />} />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-2xl font-bold">{kpis.bounce_rate}%</p>
            </div>
            <div className={`p-2 rounded-lg ${kpis.bounce_rate > 70 ? 'bg-red-100' : kpis.bounce_rate > 40 ? 'bg-amber-100' : 'bg-green-100'}`}>
              <TrendUp className={`w-5 h-5 ${kpis.bounce_rate > 70 ? 'text-red-600' : kpis.bounce_rate > 40 ? 'text-amber-600' : 'text-green-600'}`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sessions mit nur 1 Event</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ø Events / Session</p>
              <p className="text-2xl font-bold">{kpis.avg_session_events}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100">
              <Lightning className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Durchschnittliche Interaktionen</p>
        </Card>
      </div>

      {/* Events per Day Chart */}
      {kpis.events_by_day.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Events pro Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={kpis.events_by_day}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getDate()}.${d.getMonth() + 1}.`
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v: string) => new Date(v).toLocaleDateString('de-DE')}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEvents)" name="Events" />
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

      {/* Funnel: page_view → cta_click → form_submit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversion Funnel</CardTitle>
          <CardDescription>page_view → cta_click → form_submit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FunnelStep label="Seitenaufrufe" value={kpis.page_views} pct={100} />
            <span className="text-muted-foreground">→</span>
            <FunnelStep
              label="CTA-Klicks"
              value={kpis.cta_clicks}
              pct={kpis.page_views > 0 ? Math.round((kpis.cta_clicks / kpis.page_views) * 100) : 0}
            />
            <span className="text-muted-foreground">→</span>
            <FunnelStep
              label="Formulare"
              value={kpis.form_submits}
              pct={kpis.cta_clicks > 0 ? Math.round((kpis.form_submits / kpis.cta_clicks) * 100) : 0}
            />
          </div>
        </CardContent>
      </Card>

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

function KPICard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <Card className="p-3 text-center">
      {icon && <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>}
      <p className="text-2xl font-bold">{value.toLocaleString('de-DE')}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}

/** Fill all 24 hours so the chart has no gaps */
function hourlyData(data: Array<{ hour: number; count: number }>): Array<{ hour: number; count: number }> {
  const map = new Map(data.map(d => [d.hour, d.count]))
  return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: map.get(i) ?? 0 }))
}

function FunnelStep({ label, value, pct }: { label: string; value: number; pct: number }) {
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
          <p className="text-2xl font-bold">{status?.db_size_bytes ? formatBytes(status.db_size_bytes) : '–'}</p>
          <p className="text-xs text-muted-foreground">DB-Größe</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-sm font-medium">{status?.oldest_event ? new Date(status.oldest_event).toLocaleDateString('de-DE') : '–'}</p>
          <p className="text-xs text-muted-foreground">Ältestes Event</p>
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
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span>Session: {formatDuration(visitor.session_start)}</span>
              <span>{visitor.event_count} Events</span>
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
  page_view: '📄',
  cta_click: '🖱️',
  form_submit: '📋',
  phone_click: '📞',
  whatsapp_click: '💬',
  download: '⬇️',
  scroll_depth: '📜',
  page_engagement: '⏱️',
  blog_article_read: '📰',
  heartbeat: '💓',
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
