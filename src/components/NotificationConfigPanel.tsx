import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bell,
  Plus,
  Trash,
  FloppyDisk,
  PaperPlaneTilt,
  CheckCircle,
  Warning,
  WebhooksLogo,
  Envelope,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  getNotificationConfig,
  saveNotificationConfig,
  type NotificationConfig,
  type WebhookConfig,
  type NotificationType,
} from '@/lib/notification-service'

export function NotificationConfigPanel() {
  const [config, setConfig] = useState<NotificationConfig>({
    recipients: ['info@sundsmessebau.com'],
    webhooks: [],
    sendCustomerConfirmation: true,
  })
  const [loading, setLoading] = useState(false)
  const [newRecipient, setNewRecipient] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookChannel, setNewWebhookChannel] = useState('')
  const [testingWebhook, setTestingWebhook] = useState<number | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const saved = await getNotificationConfig()
      setConfig(saved)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveNotificationConfig(config)
      toast.success('Benachrichtigungskonfiguration gespeichert')
    } catch (error) {
      toast.error('Fehler beim Speichern')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const addRecipient = () => {
    const email = newRecipient.trim()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }
    if (config.recipients.includes(email)) {
      toast.error('Diese E-Mail-Adresse ist bereits vorhanden')
      return
    }
    setConfig((prev) => ({
      ...prev,
      recipients: [...prev.recipients, email],
    }))
    setNewRecipient('')
  }

  const removeRecipient = (email: string) => {
    if (config.recipients.length <= 1) {
      toast.error('Mindestens ein Empfänger muss konfiguriert sein')
      return
    }
    setConfig((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== email),
    }))
  }

  const addWebhook = () => {
    const url = newWebhookUrl.trim()
    if (!url) return
    try {
      new URL(url)
    } catch {
      toast.error('Bitte geben Sie eine gültige URL ein')
      return
    }
    const webhook: WebhookConfig = {
      url,
      enabled: true,
      channel: newWebhookChannel.trim() || 'allgemein',
      types: ['inquiry', 'kontakt', 'banner'],
    }
    setConfig((prev) => ({
      ...prev,
      webhooks: [...prev.webhooks, webhook],
    }))
    setNewWebhookUrl('')
    setNewWebhookChannel('')
  }

  const removeWebhook = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      webhooks: prev.webhooks.filter((_, i) => i !== index),
    }))
  }

  const toggleWebhook = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      webhooks: prev.webhooks.map((w, i) =>
        i === index ? { ...w, enabled: !w.enabled } : w
      ),
    }))
  }

  const toggleWebhookType = (index: number, type: NotificationType) => {
    setConfig((prev) => ({
      ...prev,
      webhooks: prev.webhooks.map((w, i) => {
        if (i !== index) return w
        const types = w.types.includes(type)
          ? w.types.filter((t) => t !== type)
          : [...w.types, type]
        return { ...w, types }
      }),
    }))
  }

  const testWebhook = async (index: number) => {
    setTestingWebhook(index)
    const webhook = config.webhooks[index]
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '🧪 Test-Nachricht von S&S Messebau Benachrichtigungssystem',
          type: 'test',
          inquiryId: 'test_' + Date.now(),
          data: { name: 'Test', email: 'test@example.com' },
        }),
      })
      if (response.ok) {
        toast.success('Test-Webhook erfolgreich gesendet')
      } else {
        toast.error(`Webhook-Test fehlgeschlagen: ${response.status}`)
      }
    } catch (error) {
      toast.error('Webhook-Test fehlgeschlagen: Verbindungsfehler')
    } finally {
      setTestingWebhook(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Recipients */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Envelope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">E-Mail-Empfänger</h3>
            <p className="text-sm text-muted-foreground">
              Alle Formular-Benachrichtigungen werden an diese Adressen gesendet
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {config.recipients.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between bg-secondary/50 px-4 py-2 rounded-lg"
            >
              <span className="text-sm font-medium">{email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRecipient(email)}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="neue@email-adresse.de"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
            className="flex-1"
          />
          <Button variant="outline" onClick={addRecipient}>
            <Plus className="w-4 h-4 mr-1" />
            Hinzufügen
          </Button>
        </div>
      </Card>

      {/* Customer confirmation */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Kunden-Bestätigung</h3>
            <p className="text-sm text-muted-foreground">
              Automatische Empfangsbestätigung an den Kunden senden
            </p>
          </div>
          <Checkbox
            checked={config.sendCustomerConfirmation}
            onCheckedChange={(checked) =>
              setConfig((prev) => ({
                ...prev,
                sendCustomerConfirmation: checked as boolean,
              }))
            }
          />
        </div>
        <Alert>
          <AlertDescription className="text-sm">
            Wenn aktiviert, erhält jeder Kunde eine automatische E-Mail-Bestätigung nach dem Absenden eines Formulars.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Webhooks */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary rounded-lg">
            <WebhooksLogo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Webhooks</h3>
            <p className="text-sm text-muted-foreground">
              Echtzeit-Benachrichtigungen an Slack, Teams oder andere Dienste
            </p>
          </div>
        </div>

        {config.webhooks.length > 0 && (
          <div className="space-y-4 mb-4">
            {config.webhooks.map((webhook, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                        {webhook.enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <span className="text-sm font-medium">{webhook.channel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testWebhook(index)}
                      disabled={testingWebhook === index}
                    >
                      <PaperPlaneTilt className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWebhook(index)}
                    >
                      {webhook.enabled ? '⏸' : '▶'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWebhook(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Label className="text-xs text-muted-foreground">Formulartypen:</Label>
                  {(['inquiry', 'kontakt', 'banner'] as NotificationType[]).map((type) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`webhook-${index}-${type}`}
                        checked={webhook.types.includes(type)}
                        onCheckedChange={() => toggleWebhookType(index, type)}
                      />
                      <Label
                        htmlFor={`webhook-${index}-${type}`}
                        className="text-xs cursor-pointer"
                      >
                        {type === 'inquiry' ? 'Anfragen' : type === 'kontakt' ? 'Kontakt' : 'Banner'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://hooks.slack.com/services/..."
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Kanal"
              value={newWebhookChannel}
              onChange={(e) => setNewWebhookChannel(e.target.value)}
              className="w-32"
            />
            <Button variant="outline" onClick={addWebhook}>
              <Plus className="w-4 h-4 mr-1" />
              Webhook
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Unterstützt Slack Incoming Webhooks, Microsoft Teams Connectors und benutzerdefinierte Endpoints.
          </p>
        </div>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <FloppyDisk className="w-5 h-5 mr-2" />
          {loading ? 'Wird gespeichert...' : 'Konfiguration speichern'}
        </Button>
      </div>
    </div>
  )
}
