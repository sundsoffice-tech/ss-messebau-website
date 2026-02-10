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

interface SMTPConfig {
  provider: 'sendgrid' | 'ses' | 'test'
  apiKey?: string
  region?: string
  fromEmail: string
  fromName: string
}

export function SMTPConfigPanel() {
  const [config, setConfig] = useState<SMTPConfig>({
    provider: 'test',
    fromEmail: 'noreply@sundsmessebau.de',
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
      const saved = await window.spark.kv.get<SMTPConfig>('smtp_config')
      if (saved) {
        setConfig(saved)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error)
    }
  }

  const loadStatus = async () => {
    try {
      const emailStatus = await getEmailStatus()
      setStatus(emailStatus)
    } catch (error) {
      console.error('Fehler beim Laden des Status:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveEmailConfig(config)
      toast.success('SMTP-Konfiguration gespeichert')
      await loadStatus()
    } catch (error) {
      toast.error('Fehler beim Speichern der Konfiguration')
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
        toast.success('Verbindungstest erfolgreich', {
          description: result.message,
          duration: 5000,
        })
      } else {
        toast.error('Verbindungstest fehlgeschlagen', {
          description: result.message,
          duration: 7000,
        })
      }
    } catch (error) {
      toast.error('Fehler beim Verbindungstest')
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
            SMTP-Konfiguration
          </h2>
          <p className="text-muted-foreground mt-1">
            E-Mail-Provider für echten E-Mail-Versand konfigurieren
          </p>
        </div>
        {status && (
          <Badge variant={status.ready ? 'default' : 'secondary'} className="gap-2">
            {status.ready ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <Warning className="w-4 h-4" weight="fill" />
            )}
            {status.testMode ? 'Test-Modus' : status.provider.toUpperCase()}
          </Badge>
        )}
      </div>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          {status?.testMode ? (
            <>
              <strong>Test-Modus aktiv:</strong> E-Mails werden simuliert und nur in der Konsole angezeigt. 
              Konfigurieren Sie SendGrid oder AWS SES für echten E-Mail-Versand.
            </>
          ) : (
            <>
              <strong>Live-Modus aktiv:</strong> E-Mails werden über {status?.provider.toUpperCase()} versendet.
            </>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="provider" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
          <TabsTrigger value="ses">AWS SES</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">E-Mail Provider</Label>
              <Select
                value={config.provider}
                onValueChange={(value: any) => setConfig({ ...config, provider: value })}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test-Modus (Simulation)</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="ses">AWS SES</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {config.provider === 'test' && 'E-Mails werden nur simuliert (keine echten E-Mails)'}
                {config.provider === 'sendgrid' && 'Einfacher Setup, zuverlässig, 100 E-Mails/Tag kostenlos'}
                {config.provider === 'ses' && 'AWS Service, günstig, erfordert AWS-Account'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">Absender E-Mail</Label>
              <Input
                id="fromEmail"
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="noreply@sundsmessebau.de"
              />
              <p className="text-sm text-muted-foreground">
                Diese E-Mail-Adresse muss bei Ihrem Provider verifiziert sein
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">Absender Name</Label>
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
                Speichern
              </Button>
              <Button onClick={handleTest} variant="outline" disabled={testing}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                Verbindung testen
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sendgrid" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">SendGrid Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                SendGrid ist ein zuverlässiger E-Mail-Service mit 100 kostenlosen E-Mails pro Tag.
              </p>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm space-y-2">
                <p><strong>Setup-Schritte:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Account erstellen auf <a href="https://signup.sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">signup.sendgrid.com</a></li>
                  <li>E-Mail-Adresse verifizieren (Single Sender Verification)</li>
                  <li>API Key erstellen unter Settings → API Keys</li>
                  <li>API Key hier einfügen und speichern</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sendgridKey">SendGrid API Key</Label>
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
                API Key beginnt mit "SG." und hat Full Access Berechtigung
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
                SendGrid aktivieren
              </Button>
              <Button onClick={handleTest} variant="outline" disabled={testing || !config.apiKey}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                Testen
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ses" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">AWS SES Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Amazon Simple Email Service - kostengünstig für hohe Volumina.
              </p>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm space-y-2">
                <p><strong>Setup-Schritte:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>AWS Account erstellen auf <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aws.amazon.com</a></li>
                  <li>SES Service in gewünschter Region aktivieren</li>
                  <li>E-Mail-Adresse verifizieren (Verified Identities)</li>
                  <li>Production Access beantragen (wenn nötig)</li>
                  <li>IAM Credentials erstellen mit SES-Berechtigung</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sesKey">AWS Access Key ID</Label>
              <Input
                id="sesKey"
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AKIA..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sesRegion">AWS Region</Label>
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
                <strong>Hinweis:</strong> AWS SES Integration erfordert zusätzliche Konfiguration 
                (Secret Access Key, Signatur). Für einfachere Integration empfehlen wir SendGrid.
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
                AWS SES aktivieren
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">💡 Empfehlung</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Für den Start:</strong> Verwenden Sie <strong>SendGrid</strong> - einfacher Setup, 
            100 kostenlose E-Mails/Tag, perfekt für Banner-Bestellungen.
          </p>
          <p>
            <strong>Für hohes Volumen:</strong> AWS SES ist günstiger bei &gt;10.000 E-Mails/Monat, 
            aber komplexer in der Einrichtung.
          </p>
          <p className="text-muted-foreground">
            Im Test-Modus werden E-Mails simuliert und nur in der Browser-Konsole angezeigt.
          </p>
        </div>
      </Card>
    </div>
  )
}
