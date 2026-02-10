import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Envelope, 
  CheckCircle, 
  Info,
  ArrowRight,
  CaretRight,
  Warning
} from '@phosphor-icons/react'
import { getEmailStatus } from '@/lib/smtp-service'

export function EmailSystemInfo() {
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const emailStatus = await getEmailStatus()
      setStatus(emailStatus)
    } catch (error) {
      console.error('Fehler beim Laden des Status:', error)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-lg shrink-0">
            <Envelope className="w-6 h-6 text-primary-foreground" weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              📧 E-Mail-Versand
              {status && (
                <Badge variant={status.testMode ? 'secondary' : 'default'} className="gap-1">
                  {status.testMode ? (
                    <>
                      <Warning className="w-3 h-3" weight="fill" />
                      Test-Modus
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" weight="fill" />
                      Live ({status.provider.toUpperCase()})
                    </>
                  )}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status?.testMode ? (
                <>E-Mails werden simuliert. Konfigurieren Sie SendGrid/AWS SES im Admin-Dashboard für echten Versand.</>
              ) : (
                <>Auftragsbestätigungen werden automatisch an <strong>info@sundsmessebau.com</strong> und den Kunden versendet.</>
              )}
            </p>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" weight="fill" />
            Automatischer Versand
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>E-Mail an <strong>info@sundsmessebau.com</strong> mit vollständigen Bestelldetails</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>Bestätigung an Kunden mit Bestellnummer und nächsten Schritten</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>Hochgeladene Druckdaten werden als Anhang mitgesendet</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>Professionelles HTML-E-Mail-Design mit Firmenbranding</span>
            </div>
          </div>
        </div>

        {status?.testMode && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Hinweis:</strong> Im Test-Modus werden E-Mails nur simuliert und in der Browser-Konsole angezeigt. 
              Öffnen Sie das Admin-Dashboard, um SendGrid oder AWS SES zu konfigurieren.
            </AlertDescription>
          </Alert>
        )}

        {!status?.testMode && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Live-Modus aktiv:</strong> E-Mails werden über {status?.provider.toUpperCase()} versendet. 
              Alle Nachrichten werden an echte E-Mail-Adressen zugestellt.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.hash = '/admin'}
          >
            Admin Dashboard öffnen
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" weight="fill" />
            Integriert
          </Badge>
        </div>
      </div>
    </Card>
  )
}
