import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from '@phosphor-icons/react'
import type { BannerConfig } from './BannerBestellenPage'

interface GitHubUserInfo {
  login: string
  name?: string
  avatar_url?: string
  email?: string
}

interface AdminPageProps {
  _onOpenInquiry: () => void
}

export function AdminPage({ _onOpenInquiry }: AdminPageProps) {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<GitHubUserInfo | null>(null)
  const [stats, setStats] = useState({
    emailQueue: 0,
    orders: 0,
    inquiries: 0,
  })

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await window.spark.user()
      setUserInfo(user)
      setIsAuthenticated(user?.isOwner || false)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    }
  }

  const loadStats = async () => {
    try {
      const keys = await window.spark.kv.keys()
      
      const emailQueueCount = keys.filter(k => k.startsWith('email_queue_')).length
      const ordersCount = keys.filter(k => k.startsWith('banner_')).length
      const inquiriesCount = keys.filter(k => k.startsWith('inquiry_')).length
      
      setStats({
        emailQueue: emailQueueCount,
        orders: ordersCount,
        inquiries: inquiriesCount,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center py-12">
        <Card className="p-12 max-w-md text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">{t('admin.area')}</h1>
          <p className="text-muted-foreground mb-6">
            {userInfo 
              ? t('admin.noPermission')
              : t('admin.pleaseLogin')}
          </p>
          {userInfo && (
            <div className="bg-secondary/50 p-4 rounded-lg text-sm">
              <p className="font-medium">{t('admin.loggedInAs')}</p>
              <p className="text-muted-foreground">{userInfo.login || userInfo.email}</p>
            </div>
          )}
          <Button 
            className="mt-6"
            onClick={() => window.location.hash = '/'}
          >
            {t('admin.backToHome')}
          </Button>
        </Card>
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
                {t('admin.welcomeBack') + (userInfo?.login || t('admin.administrator'))}
              </p>
            </div>
            <Badge variant="secondary" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              {t('admin.loggedIn')}
            </Badge>
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

        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
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
            <TabsTrigger value="emails" className="gap-2">
              <Envelope className="w-4 h-4" />
              {t('admin.emailQueue')}
              {stats.emailQueue > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.emailQueue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="smtp" className="gap-2">
              <Gear className="w-4 h-4" />
              {t('admin.smtpConfig')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t('admin.orders')}
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

          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="messe">
            <MesseManager />
          </TabsContent>

          <TabsContent value="apikeys">
            <ExternalApiKeysManager />
          </TabsContent>

          <TabsContent value="emails">
            <EmailQueueManager />
          </TabsContent>

          <TabsContent value="smtp">
            <SMTPConfigPanel />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
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

function OrdersManager() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Array<{ id: string; data: BannerConfig; timestamp: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const keys = await window.spark.kv.keys()
      const orderKeys = keys.filter((key) => key.startsWith('banner_'))

      const loadedOrders: Array<{ id: string; data: BannerConfig; timestamp: string }> = []
      for (const key of orderKeys) {
        const data = await window.spark.kv.get<BannerConfig>(key)
        if (data) {
          loadedOrders.push({
            id: key,
            ...data,
          })
        }
      }

      loadedOrders.sort((a, b) => 
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      )
      setOrders(loadedOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
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
      {orders.map((order) => (
        <Card key={order.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {order.step6?.firmaKontakt || t('admin.unknown')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {order.step6?.ansprechpartner}
                </p>
              </div>
              <Badge>{order.status || t('admin.statusNew')}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('admin.frameType')}</p>
                <p className="font-medium">{order.step1?.rahmenart}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('admin.quantity')}</p>
                <p className="font-medium">{order.step1?.menge} {t('admin.pieces')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('admin.dimensions')}</p>
                <p className="font-medium">
                  {order.step2?.breite} × {order.step2?.hoehe} mm
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('admin.date')}</p>
                <p className="font-medium">
                  {order.timestamp 
                    ? new Date(order.timestamp).toLocaleDateString('de-DE')
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
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
