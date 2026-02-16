import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Gear, 
  CheckCircle, 
  Warning, 
  Info,
  FloppyDisk,
  PaperPlaneTilt,
  Eye,
  EyeSlash
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { saveEmailConfig, testEmailConnection, getEmailStatus } from '@/lib/smtp-service'
import { useTranslation } from '@/lib/i18n'

interface SMTPConfig {
  provider: 'sendgrid' | 'ses' | 'test'
  apiKey?: string
  region?: string
  fromEmail: string
  fromName: string
}

export function SMTPConfigPanel() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<SMTPConfig>({
    provider: 'test',
    fromEmail: 'noreply@sunds-messebau.de',
    fromName: 'S&S Messebau GbR',
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    loadConfig()
    loadStatus()
  }, [])

  const loadConfig = async () => {
    try {
      // Load config from backend API
      const { emailApi } = await import('@/lib/api-client')
      const serverConfig = await emailApi.getConfig()
      setConfig({
        provider: (serverConfig.provider as SMTPConfig['provider']) || 'test',
        fromEmail: serverConfig.fromEmail || 'noreply@sunds-messebau.de',
        fromName: serverConfig.fromName || 'S&S Messebau GbR',
      })
    } catch (error) {
      console.error(t('smtp.loadConfigError'), error)
    }
  }

  const loadStatus = async () => {
    try {
      // Try backend API first for server-side status
      const { emailApi } = await import('@/lib/api-client')
      const apiStatus = await emailApi.status()
      setStatus(apiStatus)
    } catch {
      // Fallback to local status
      try {
        const emailStatus = await getEmailStatus()
        setStatus(emailStatus)
      } catch (error) {
        console.error(t('smtp.loadStatusError'), error)
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveEmailConfig(config)
      toast.success(t('smtp.savedSuccess'))
      await loadStatus()
    } catch (error) {
      toast.error(t('smtp.saveError'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testEmailConnection()
      if (result.success) {
        toast.success(t('smtp.testSuccess'), {
          description: result.message,
          duration: 5000,
        })
      } else {
        toast.error(t('smtp.testFailed'), {
          description: result.message,
          duration: 7000,
        })
      }
    } catch (error) {
      toast.error(t('smtp.testError'))
      console.error(error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gear className="w-6 h-6" />
            {t('smtp.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('smtp.subtitle')}
          </p>
        </div>
        {status && (
          <Badge variant={status.ready ? 'default' : 'secondary'} className="gap-2">
            {status.ready ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <Warning className="w-4 h-4" weight="fill" />
            )}
            {status.testMode ? t('smtp.testMode') : status.provider.toUpperCase()}
          </Badge>
        )}
      </div>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          {status?.testMode ? (
            <>
              <strong>{t('smtp.testModeActive')}</strong> {t('smtp.testModeDesc')}
            </>
          ) : (
            <>
              <strong>{t('smtp.liveModeActive')}</strong> {t('smtp.liveModeDesc').replace('{provider}', status?.provider.toUpperCase())}
            </>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="provider" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="provider">{t('smtp.tabProvider')}</TabsTrigger>
          <TabsTrigger value="sendgrid">{t('smtp.tabSendgrid')}</TabsTrigger>
          <TabsTrigger value="ses">{t('smtp.tabSes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">{t('smtp.emailProvider')}</Label>
              <Select
                value={config.provider}
                onValueChange={(value: any) => setConfig({ ...config, provider: value })}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">{t('smtp.providerTest')}</SelectItem>
                  <SelectItem value="sendgrid">{t('smtp.providerSendgrid')}</SelectItem>
                  <SelectItem value="ses">{t('smtp.providerSes')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {config.provider === 'test' && t('smtp.providerTestDesc')}
                {config.provider === 'sendgrid' && t('smtp.providerSendgridDesc')}
                {config.provider === 'ses' && t('smtp.providerSesDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">{t('smtp.fromEmail')}</Label>
              <Input
                id="fromEmail"
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="noreply@sunds-messebau.de"
              />
              <p className="text-sm text-muted-foreground">
                {t('smtp.fromEmailHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">{t('smtp.fromName')}</Label>
              <Input
                id="fromName"
                value={config.fromName}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                placeholder="S&S Messebau GbR"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                <FloppyDisk className="w-4 h-4 mr-2" />
                {t('smtp.save')}
              </Button>
              <Button onClick={handleTest} variant="outline" disabled={testing}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                {t('smtp.testConnection')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sendgrid" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('smtp.sendgridSetup')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('smtp.sendgridDesc')}
              </p>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm space-y-2">
                <p><strong>{t('smtp.setupSteps')}</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t('smtp.sendgridStep1')} <a href="https://signup.sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">signup.sendgrid.com</a></li>
                  <li>{t('smtp.sendgridStep2')}</li>
                  <li>{t('smtp.sendgridStep3')}</li>
                  <li>{t('smtp.sendgridStep4')}</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sendgridKey">{t('smtp.sendgridApiKey')}</Label>
              <div className="flex gap-2">
                <Input
                  id="sendgridKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('smtp.sendgridApiKeyHint')}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setConfig({ ...config, provider: 'sendgrid' })
                  handleSave()
                }}
                disabled={loading || !config.apiKey}
              >
                <FloppyDisk className="w-4 h-4 mr-2" />
                {t('smtp.activateSendgrid')}
              </Button>
              <Button onClick={handleTest} variant="outline" disabled={testing || !config.apiKey}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                {t('smtp.test')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ses" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('smtp.sesSetup')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('smtp.sesDesc')}
              </p>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm space-y-2">
                <p><strong>{t('smtp.setupSteps')}</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>{t('smtp.sesStep1')} <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aws.amazon.com</a></li>
                  <li>{t('smtp.sesStep2')}</li>
                  <li>{t('smtp.sesStep3')}</li>
                  <li>{t('smtp.sesStep4')}</li>
                  <li>{t('smtp.sesStep5')}</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sesKey">{t('smtp.awsAccessKeyId')}</Label>
              <Input
                id="sesKey"
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AKIA..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sesRegion">{t('smtp.awsRegion')}</Label>
              <Select
                value={config.region || 'eu-central-1'}
                onValueChange={(value) => setConfig({ ...config, region: value })}
              >
                <SelectTrigger id="sesRegion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-central-1">EU Central 1 (Frankfurt)</SelectItem>
                  <SelectItem value="eu-west-1">EU West 1 (Ireland)</SelectItem>
                  <SelectItem value="us-east-1">US East 1 (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West 2 (Oregon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert variant="destructive">
              <Warning className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <strong>{t('smtp.sesWarningLabel')}</strong> {t('smtp.sesWarning')}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setConfig({ ...config, provider: 'ses' })
                  handleSave()
                }}
                disabled={loading || !config.apiKey}
              >
                <FloppyDisk className="w-4 h-4 mr-2" />
                {t('smtp.activateSes')}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">{t('smtp.recommendation')}</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>{t('smtp.recStart')}</strong> {t('smtp.recStartDesc')}
          </p>
          <p>
            <strong>{t('smtp.recVolume')}</strong> {t('smtp.recVolumeDesc')}
          </p>
          <p className="text-muted-foreground">
            {t('smtp.recTestMode')}
          </p>
        </div>
      </Card>
    </div>
  )
}
