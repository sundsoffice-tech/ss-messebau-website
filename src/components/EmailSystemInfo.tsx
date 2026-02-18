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
import { navigate } from '@/lib/deep-linking'
import { useTranslation } from '@/lib/i18n'

export function EmailSystemInfo() {
  const [status, setStatus] = useState<any>(null)
  const { t } = useTranslation()

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
              📧 {t('emailsys.title')}
              {status && (
                <Badge variant={status.testMode ? 'secondary' : 'default'} className="gap-1">
                  {status.testMode ? (
                    <>
                      <Warning className="w-3 h-3" weight="fill" />
                      {t('emailsys.testMode')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" weight="fill" />
                      {t('emailsys.live')} ({status.provider.toUpperCase()})
                    </>
                  )}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status?.testMode ? (
                <>{t('emailsys.testDesc')}</>
              ) : (
                <>{t('emailsys.liveDesc').replace('{email}', 'info@sundsmessebau.com')}</>
              )}
            </p>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" weight="fill" />
            {t('emailsys.autoSend')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>{t('emailsys.toCompany').replace('{email}', 'info@sundsmessebau.com')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>{t('emailsys.toCustomer')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>{t('emailsys.attachments')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CaretRight className="w-4 h-4 text-primary mt-0.5 shrink-0" weight="bold" />
              <span>{t('emailsys.htmlEmail')}</span>
            </div>
          </div>
        </div>

        {status?.testMode && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>{t('emailsys.testHintLabel')}:</strong> {t('emailsys.testHint')}
            </AlertDescription>
          </Alert>
        )}

        {!status?.testMode && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>{t('emailsys.liveHintLabel')}:</strong> {t('emailsys.liveHint').replace('{provider}', status?.provider?.toUpperCase() || '')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
          >
            {t('emailsys.adminBtn')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" weight="fill" />
            {t('emailsys.integrated')}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
