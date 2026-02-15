import { useState, useEffect } from 'react'
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
import { BlogManager, MesseManager, ExternalApiKeysManager } from '@/components/AdminContentPanels'
import { Badge } from '@/components/ui/badge'
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
} from '@phosphor-icons/react'
import { authApi, ordersApi, inquiriesApi, type AuthUser, type OrderRecord, type InquiryRecord } from '@/lib/api-client'
import { toast } from 'sonner'

interface AdminPageProps {
  onOpenInquiry: () => void
}

export function AdminPage({ onOpenInquiry: _onOpenInquiry }: AdminPageProps) {
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
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('admin.aiChatbot')}
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

          <TabsContent value="ai">
            <AIAdminPanel />
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

function OrdersManager() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

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

  const handleDelete = async (id: number) => {
    if (!confirm('Bestellung wirklich löschen?')) return
    try {
      await ordersApi.delete(id)
      toast.success('Bestellung gelöscht')
      loadOrders()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

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
      {orders.map((order) => {
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
                <Badge>{order.status || t('admin.statusNew')}</Badge>
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
                <Button variant="outline" size="sm">
                  {t('admin.showDetails')}
                </Button>
                <Button variant="outline" size="sm">
                  <Envelope className="w-4 h-4 mr-1" />
                  {t('admin.contact')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(order.id)}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  {t('admin.delete') || 'Löschen'}
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Inquiries Manager (API-backed) ─────────────────────────

function InquiriesManager() {
  const { t } = useTranslation()
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInquiries()
  }, [])

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

  const handleDelete = async (id: number) => {
    if (!confirm('Anfrage wirklich löschen?')) return
    try {
      await inquiriesApi.delete(id)
      toast.success('Anfrage gelöscht')
      loadInquiries()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

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
      {inquiries.map((inq) => (
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
              <Button variant="outline" size="sm">
                <Envelope className="w-4 h-4 mr-1" />
                {t('admin.contact')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(inq.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
