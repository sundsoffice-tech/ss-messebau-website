import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmailQueueManager } from '@/components/EmailQueueManager'
import { SMTPConfigPanel } from '@/components/SMTPConfigPanel'
import { NotificationConfigPanel } from '@/components/NotificationConfigPanel'
import { AIAdminPanel } from '@/components/AIAdminPanel'
import { AutomationPanel } from '@/components/AutomationPanel'
import { TemplateEditorPanel } from '@/components/TemplateEditorPanel'
import { ComposeEmailPanel } from '@/components/ComposeEmailPanel'
import { EmailTrackingPanel } from '@/components/EmailTrackingPanel'
import { AnalyticsAdminPanel } from '@/components/AnalyticsAdminPanel'
import { BlogManager, MesseManager, ExternalApiKeysManager } from '@/components/AdminContentPanels'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Envelope, 
  ShoppingCart, 
  User, 
  Lock,
  CheckCircle,
  Gear,
  Bell,
  Brain,
  Article,
  CalendarDot,
  Key,
  SignOut,
  ChatText,
  Trash,
  MagnifyingGlass,
  Eye,
  Lightning,
  PencilSimple,
  PaperPlaneTilt,
  ChartLine,
  ChartBar,
} from '@phosphor-icons/react'
import { authApi, ordersApi, inquiriesApi, type AuthUser, type OrderRecord, type InquiryRecord } from '@/lib/api-client'
import { toast } from 'sonner'

export function AdminPage() {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<AuthUser | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    emailQueue: 0,
    orders: 0,
    inquiries: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    setLoading(true)
    try {
      const res = await authApi.me()
      setIsAuthenticated(res.authenticated)
      setUserInfo(res.user)
      if (!res.authenticated) {
        const setupRes = await authApi.checkSetup()
        setNeedsSetup(setupRes.needsSetup)
      }
    } catch {
      setIsAuthenticated(false)
      setNeedsSetup(false)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [ordersRes, inquiriesRes, emailRes] = await Promise.all([
        ordersApi.list(),
        inquiriesApi.list(),
        (await import('@/lib/api-client')).emailApi.list(0),
      ])
      setStats({
        orders: ordersRes.total,
        inquiries: inquiriesRes.total,
        emailQueue: emailRes.total,
      })
    } catch {
      // Stats are not critical
    }
  }

  const handleLogout = async () => {
    await authApi.logout()
    setIsAuthenticated(false)
    setUserInfo(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center py-12">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t('admin.loading') || 'Laden...'}</p>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center py-12">
        {needsSetup ? (
          <AdminSetupForm onSuccess={() => checkAuth()} />
        ) : (
          <AdminLoginForm onSuccess={() => checkAuth()} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
              <p className="text-muted-foreground mt-1">
                {t('admin.welcomeBack') + (userInfo?.displayName || userInfo?.username || t('admin.administrator'))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                {userInfo?.username}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <SignOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Envelope className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.emailQueue}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.emailsInQueue')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.orders}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.bannerOrders')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inquiries}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.inquiries')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t('admin.orders')}
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-2">
              <ChatText className="w-4 h-4" />
              {t('admin.inquiries')}
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Envelope className="w-4 h-4" />
              {t('admin.emailQueue')}
              {stats.emailQueue > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.emailQueue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <Article className="w-4 h-4" />
              {t('admin.blog')}
            </TabsTrigger>
            <TabsTrigger value="messe" className="gap-2">
              <CalendarDot className="w-4 h-4" />
              {t('admin.messe')}
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="gap-2">
              <Key className="w-4 h-4" />
              {t('admin.apiKeys')}
            </TabsTrigger>
            <TabsTrigger value="smtp" className="gap-2">
              <Gear className="w-4 h-4" />
              {t('admin.smtpConfig')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              {t('admin.notifications')}
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Lightning className="w-4 h-4" />
              {t('admin.automation')}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <PencilSimple className="w-4 h-4" />
              {t('admin.templates')}
            </TabsTrigger>
            <TabsTrigger value="compose" className="gap-2">
              <PaperPlaneTilt className="w-4 h-4" />
              {t('admin.compose')}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <ChartLine className="w-4 h-4" />
              {t('admin.tracking')}
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('admin.aiChatbot')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <ChartBar className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesManager />
          </TabsContent>

          <TabsContent value="emails">
            <EmailQueueManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="messe">
            <MesseManager />
          </TabsContent>

          <TabsContent value="apikeys">
            <ExternalApiKeysManager />
          </TabsContent>

          <TabsContent value="smtp">
            <SMTPConfigPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationConfigPanel />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationPanel />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateEditorPanel />
          </TabsContent>

          <TabsContent value="compose">
            <ComposeEmailPanel />
          </TabsContent>

          <TabsContent value="tracking">
            <EmailTrackingPanel />
          </TabsContent>

          <TabsContent value="ai">
            <AIAdminPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Login Form ──────────────────────────────────────────────

function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.login(username, password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{t('admin.area')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('admin.pleaseLogin')}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Benutzername</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Anmelden...' : 'Anmelden'}
        </Button>
      </form>
      <Button
        variant="ghost"
        className="mt-4 w-full"
        onClick={() => window.location.hash = '/'}
      >
        {t('admin.backToHome')}
      </Button>
    </Card>
  )
}

// ─── Setup Form ──────────────────────────────────────────────

function AdminSetupForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.setup(username, password, displayName || undefined)
      toast.success('Admin-Konto erstellt!')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h1 className="text-2xl font-bold">Admin-Setup</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Erstellen Sie das erste Admin-Konto
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setup-username">Benutzername</Label>
          <Input
            id="setup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-displayname">Anzeigename (optional)</Label>
          <Input
            id="setup-displayname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-password">Passwort (min. 8 Zeichen)</Label>
          <Input
            id="setup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Erstelle Konto...' : 'Admin-Konto erstellen'}
        </Button>
      </form>
    </Card>
  )
}

// ─── Orders Manager (API-backed) ────────────────────────────

const ORDER_STATUSES = ['Neu', 'In Bearbeitung', 'Abgeschlossen', 'Storniert'] as const
const DEFAULT_STATUS = 'Neu'

function getStatusBadge(status: string) {
  switch (status) {
    case 'In Bearbeitung':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">{status}</Badge>
    case 'Abgeschlossen':
      return <Badge variant="default">{status}</Badge>
    case 'Storniert':
      return <Badge variant="destructive">{status}</Badge>
    case 'Neu':
    default:
      return <Badge variant="secondary">{status || DEFAULT_STATUS}</Badge>
  }
}

const ITEMS_PER_PAGE = 25

function OrdersManager() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await ordersApi.list()
      setOrders(res.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (deleteId === null) return
    try {
      await ordersApi.delete(deleteId)
      toast.success('Bestellung gelöscht')
      loadOrders()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await ordersApi.updateStatus(id, status)
      toast.success('Status aktualisiert')
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      )
    } catch {
      toast.error('Fehler beim Statuswechsel')
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          (o.company || '').toLowerCase().includes(q) ||
          (o.customer_name || '').toLowerCase().includes(q) ||
          (o.customer_email || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((o) => (o.status || DEFAULT_STATUS) === statusFilter)
    }
    return result
  }, [orders, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('admin.loadingOrders')}</p>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground text-lg">{t('admin.noOrders')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Firma, Name, E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paginatedOrders.map((order) => {
        const data = order.order_data as Record<string, any>
        return (
          <Card key={order.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.company || order.customer_name || t('admin.unknown')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name} – {order.customer_email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status || DEFAULT_STATUS)}
                  <Select
                    value={order.status || DEFAULT_STATUS}
                    onValueChange={(v) => handleStatusChange(order.id, v)}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('admin.frameType')}</p>
                  <p className="font-medium">{data?.step1?.rahmenart}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('admin.quantity')}</p>
                  <p className="font-medium">{data?.step1?.menge} {t('admin.pieces')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('admin.dimensions')}</p>
                  <p className="font-medium">
                    {data?.step2?.breite} × {data?.step2?.hoehe} mm
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('admin.date')}</p>
                  <p className="font-medium">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('de-DE')
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailOrder(order)}>
                  <Eye className="w-4 h-4 mr-1" />
                  {t('admin.showDetails')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (order.customer_email) {
                      window.location.href = `mailto:${order.customer_email}?subject=Bestellung ${order.config_id}`
                    } else {
                      toast.error('Keine E-Mail-Adresse vorhanden')
                    }
                  }}
                >
                  <Envelope className="w-4 h-4 mr-1" />
                  {t('admin.contact')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(order.id)}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  {t('admin.delete') || 'Löschen'}
                </Button>
              </div>
            </div>
          </Card>
        )
      })}

      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Zurück
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {page} von {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Weiter
          </Button>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bestellung löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Bestellung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderDetailDialog order={detailOrder} onClose={() => setDetailOrder(null)} />
    </div>
  )
}

// ─── Inquiries Manager (API-backed) ─────────────────────────

function InquiriesManager() {
  const { t } = useTranslation()
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailInquiry, setDetailInquiry] = useState<InquiryRecord | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadInquiries()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const res = await inquiriesApi.list()
      setInquiries(res.inquiries)
    } catch (error) {
      console.error('Failed to load inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (deleteId === null) return
    try {
      await inquiriesApi.delete(deleteId)
      toast.success('Anfrage gelöscht')
      loadInquiries()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  const filteredInquiries = useMemo(() => {
    if (!search.trim()) return inquiries
    const q = search.toLowerCase()
    return inquiries.filter(
      (inq) =>
        (inq.name || '').toLowerCase().includes(q) ||
        (inq.email || '').toLowerCase().includes(q) ||
        (inq.company || '').toLowerCase().includes(q) ||
        (inq.message || '').toLowerCase().includes(q)
    )
  }, [inquiries, search])

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE))
  const paginatedInquiries = filteredInquiries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Anfragen laden...</p>
      </Card>
    )
  }

  if (inquiries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ChatText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground text-lg">{t('admin.noInquiries') || 'Keine Anfragen vorhanden'}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, E-Mail, Firma, Nachricht..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {paginatedInquiries.map((inq) => (
        <Card key={inq.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">{inq.name || 'Unbekannt'}</h3>
              <p className="text-sm text-muted-foreground">{inq.email}</p>
              {inq.company && (
                <p className="text-sm text-muted-foreground">{inq.company}</p>
              )}
              {inq.message && (
                <p className="text-sm mt-2 line-clamp-2">{inq.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                <Badge variant="outline" className="mr-2">{inq.type}</Badge>
                {new Date(inq.created_at).toLocaleString('de-DE')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDetailInquiry(inq)}>
                <Eye className="w-4 h-4 mr-1" />
                {t('admin.showDetails')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (inq.email) {
                    window.location.href = `mailto:${inq.email}?subject=Re: ${inq.type === 'inquiry' ? 'Anfrage' : 'Kontaktanfrage'} ${inq.inquiry_id}`
                  } else {
                    toast.error('Keine E-Mail-Adresse vorhanden')
                  }
                }}
              >
                <Envelope className="w-4 h-4 mr-1" />
                {t('admin.contact')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteId(inq.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {filteredInquiries.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Zurück
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {page} von {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Weiter
          </Button>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anfrage löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Anfrage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InquiryDetailDialog inquiry={detailInquiry} onClose={() => setDetailInquiry(null)} />
    </div>
  )
}

// ─── Detail Row Helper ──────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === '') return null
  const displayValue = typeof value === 'boolean'
    ? (value ? '✅ Ja' : '❌ Nein')
    : String(value)
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-1.5 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground min-w-[160px] shrink-0">{label}</dt>
      <dd className="text-sm break-all">{displayValue}</dd>
    </div>
  )
}

// ─── Order Detail Dialog ────────────────────────────────────

function OrderDetailDialog({ order, onClose }: { order: OrderRecord | null; onClose: () => void }) {
  if (!order) return null
  const data = order.order_data as Record<string, Record<string, unknown>> | null
  const step1 = data?.step1 || {}
  const step2 = data?.step2 || {}
  const step3 = data?.step3 || {}
  const step4 = data?.step4 || ({} as Record<string, unknown>)
  const step5 = data?.step5 || {}
  const step6 = data?.step6 || {}

  return (
    <Dialog open={!!order} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestelldetails – {order.company || order.customer_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kontakt */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">📋 Kunde &amp; Kontakt</h3>
            <dl className="space-y-0">
              <DetailRow label="Firma" value={step6.firmaKontakt} />
              <DetailRow label="Ansprechpartner" value={step6.ansprechpartner} />
              <DetailRow label="E-Mail" value={step6.email} />
              <DetailRow label="Telefon" value={step6.telefon} />
              <DetailRow label="USt-ID" value={step6.ustId} />
              <DetailRow label="Newsletter" value={step6.newsletter} />
            </dl>
          </section>

          {/* Einsatz & System */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">📦 Einsatz &amp; System</h3>
            <dl className="space-y-0">
              <DetailRow label="Einsatzort" value={step1.einsatzort} />
              <DetailRow label="Rahmenart" value={step1.rahmenart} />
              <DetailRow label="Menge" value={step1.menge ? `${step1.menge} Stück` : undefined} />
              <DetailRow label="Indoor/Outdoor" value={step1.indoorOutdoor} />
              <DetailRow label="Montage" value={step1.montage} />
              <DetailRow label="Montageort" value={step1.montageOrt} />
              <DetailRow label="Montagezeitraum" value={step1.montageZeitraum} />
              <DetailRow label="Multi-Banner-Modus" value={step1.multiBannerMode} />
            </dl>
          </section>

          {/* Maße & Ausführung */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">📐 Maße &amp; Ausführung</h3>
            <dl className="space-y-0">
              <DetailRow label="Abmessungen" value={step2.breite && step2.hoehe ? `${step2.breite} × ${step2.hoehe} mm` : undefined} />
              <DetailRow label="Profil" value={step2.profil} />
              <DetailRow label="Profilfarbe" value={step2.profilFarbe} />
              <DetailRow label="RAL-Code" value={step2.ralCode} />
              <DetailRow label="Ecken" value={step2.ecken} />
              <DetailRow label="Seitigkeit" value={step2.seitigkeit} />
              <DetailRow label="Zubehör" value={Array.isArray(step2.zubehoer) && step2.zubehoer.length > 0 ? step2.zubehoer.join(', ') : undefined} />
              <DetailRow label="LED/Backlit" value={step2.led} />
              <DetailRow label="LED Strom" value={step2.ledStrom} />
              <DetailRow label="LED Einsatz" value={step2.ledEinsatz} />
            </dl>
          </section>

          {/* Banner & Druck */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">🖨️ Banner &amp; Druck</h3>
            <dl className="space-y-0">
              <DetailRow label="Banner benötigt" value={step3.bannerBenoetigt} />
              <DetailRow label="Material" value={step3.material} />
              <DetailRow label="Konfektion" value={Array.isArray(step3.konfektion) && step3.konfektion.length > 0 ? step3.konfektion.join(', ') : undefined} />
              <DetailRow label="Brandschutz" value={step3.brandschutz} />
              <DetailRow label="Druckqualität" value={step3.druckqualitaet} />
            </dl>
          </section>

          {/* Druckdaten & Upload */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">📁 Druckdaten &amp; Upload</h3>
            <dl className="space-y-0">
              <DetailRow label="Druckdaten vorhanden" value={step4.druckdatenVorhanden} />
              <DetailRow label="Grafikservice" value={step4.grafikservice} />
              <DetailRow label="Designwunsch" value={step4.designwunsch} />
              <DetailRow label="Kommentar" value={step4.kommentar} />
              {Array.isArray(step4.serializedFiles) && step4.serializedFiles.length > 0 && (
                <div className="py-1.5">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Hochgeladene Dateien ({step4.serializedFiles.length})</p>
                  <div className="space-y-1">
                    {step4.serializedFiles.map((f: { name: string; size?: number; type?: string }, i: number) => (
                      <div key={i} className="text-sm bg-muted/50 px-3 py-1.5 rounded">
                        📎 {f.name} – {f.size != null ? (f.size < 1024 ? `${f.size} B` : `${(f.size / 1024).toFixed(1)} KB`) : ''}
                        {f.type ? ` (${f.type})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </dl>
          </section>

          {/* Lieferung & Termin */}
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">🚚 Lieferung &amp; Termin</h3>
            <dl className="space-y-0">
              <DetailRow label="Firma" value={step5.firma} />
              <DetailRow label="Straße" value={step5.strasse} />
              <DetailRow label="PLZ / Ort" value={step5.plz && step5.ort ? `${step5.plz} ${step5.ort}` : undefined} />
              <DetailRow label="Land" value={step5.land} />
              <DetailRow label="Wunschlieferdatum" value={step5.wunschDatum ? new Date(String(step5.wunschDatum)).toLocaleDateString('de-DE') : undefined} />
              <DetailRow label="Lieferart" value={step5.lieferart} />
              <DetailRow label="Express" value={step5.express} />
              <DetailRow label="Zeitfenster" value={step5.zeitfenster} />
            </dl>
          </section>

          {/* Meta */}
          <section>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Meta</h3>
            <dl className="space-y-0">
              <DetailRow label="Bestell-ID" value={order.config_id} />
              <DetailRow label="Status" value={order.status} />
              <DetailRow label="Erstellt" value={order.created_at ? new Date(order.created_at).toLocaleString('de-DE') : undefined} />
              <DetailRow label="Aktualisiert" value={order.updated_at ? new Date(order.updated_at).toLocaleString('de-DE') : undefined} />
            </dl>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Inquiry Detail Dialog ──────────────────────────────────

function InquiryDetailDialog({ inquiry, onClose }: { inquiry: InquiryRecord | null; onClose: () => void }) {
  if (!inquiry) return null
  const formData = inquiry.form_data || {}

  return (
    <Dialog open={!!inquiry} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anfrage-Details – {inquiry.name || 'Unbekannt'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="font-semibold text-sm text-primary mb-2">📋 Kontaktdaten</h3>
            <dl className="space-y-0">
              <DetailRow label="Name" value={inquiry.name} />
              <DetailRow label="E-Mail" value={inquiry.email} />
              <DetailRow label="Firma" value={inquiry.company} />
              <DetailRow label="Telefon" value={inquiry.phone} />
              <DetailRow label="Typ" value={inquiry.type} />
            </dl>
          </section>

          {inquiry.message && (
            <section>
              <h3 className="font-semibold text-sm text-primary mb-2">💬 Nachricht</h3>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">{inquiry.message}</p>
            </section>
          )}

          {Object.keys(formData).length > 0 && (
            <section>
              <h3 className="font-semibold text-sm text-primary mb-2">📝 Formulardetails</h3>
              <dl className="space-y-0">
                {Object.entries(formData)
                  .filter(([key]) => !['name', 'email', 'company', 'phone', 'message'].includes(key))
                  .filter(([, val]) => val !== undefined && val !== '' && val !== null)
                  .map(([key, val]) => (
                    <DetailRow key={key} label={formatFormDataKey(key)} value={String(val)} />
                  ))}
              </dl>
            </section>
          )}

          <section>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Meta</h3>
            <dl className="space-y-0">
              <DetailRow label="Anfrage-ID" value={inquiry.inquiry_id} />
              <DetailRow label="Erstellt" value={inquiry.created_at ? new Date(inquiry.created_at).toLocaleString('de-DE') : undefined} />
            </dl>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatFormDataKey(key: string): string {
  const map: Record<string, string> = {
    budget: 'Budget',
    messesProJahr: 'Messen/Jahr',
    event: 'Messe/Event',
    size: 'Standgröße',
    wunschtermin: 'Wunschtermin',
    dsgvo: 'Datenschutz',
    newsletter: 'Newsletter',
    telefon: 'Telefon',
    firmaKontakt: 'Firma',
    ansprechpartner: 'Ansprechpartner',
    ustId: 'USt-ID',
  }
  return map[key] || key
}
