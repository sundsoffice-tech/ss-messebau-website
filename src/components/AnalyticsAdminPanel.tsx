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
} from '@phosphor-icons/react'
import {
  fetchTrackingConfig,
  saveTrackingConfigToServer,
  fetchAnalyticsKPIs,
  fetchAnalyticsStatus,
  runAnalyticsCleanup,
  exportAnalyticsData,
} from '@/lib/analytics-tracker'
import type {
  TrackingConfig,
  TrackingEventName,
  AnalyticsKPIs,
  AnalyticsStatusInfo,
  ExportFormat,
} from '@/types/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard label="Events gesamt" value={kpis.total_events} />
        <KPICard label="Sessions" value={kpis.unique_sessions} />
        <KPICard label="Seitenaufrufe" value={kpis.page_views} />
        <KPICard label="CTA-Klicks" value={kpis.cta_clicks} />
        <KPICard label="Formulare" value={kpis.form_submits} />
      </div>

      {/* Events per Day Chart */}
      {kpis.events_by_day.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Events pro Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kpis.events_by_day}>
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
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Events" />
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
    </div>
  )
}

function KPICard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-2xl font-bold">{value.toLocaleString('de-DE')}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
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
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2 text-xs sm:text-sm">
              <Gear className="w-4 h-4" />
              Steuerung
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2 text-xs sm:text-sm">
              <Export className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2 text-xs sm:text-sm">
              <Heartbeat className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <KPIDashboardTab />
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
