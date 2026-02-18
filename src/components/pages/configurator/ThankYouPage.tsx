import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Phone, Envelope, Check } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { navigate } from '@/lib/deep-linking'
import type { BannerConfig } from '../BannerBestellenPage'

interface ThankYouPageProps {
  config: BannerConfig
}

export function ThankYouPage({ config }: ThankYouPageProps) {
  const { t } = useTranslation()
  const fileCount = config.step4.serializedFiles?.length || 0

  return (
    <div className="min-h-screen bg-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 mx-auto text-primary animate-in zoom-in" weight="fill" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t('thankyou.title')}, {config.step6.ansprechpartner.split(' ')[0]}!
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {t('thankyou.received')}
            </p>

            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary rounded-lg shrink-0">
                  <Envelope className="w-6 h-6 text-primary-foreground" weight="fill" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg mb-2">📧 {t('thankyou.emailSent')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" weight="bold" />
                      <span>{t('thankyou.confirmTo')} <strong>{config.step6.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" weight="bold" />
                      <span>{t('thankyou.orderTo')} <strong>info@sundsmessebau.com</strong></span>
                    </div>
                    {fileCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" weight="bold" />
                        <span>{fileCount} {fileCount > 1 ? t('thankyou.filesAttachedPlural') : t('thankyou.filesAttached')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-6 text-left mb-8">
              <h2 className="font-bold mb-4">{t('thankyou.nextSteps')}</h2>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    1
                  </span>
                  <span>
                    {t('thankyou.step1.check')}
                    {config.step4.druckdatenVorhanden && fileCount > 0 && ` ${t('thankyou.step1.withFiles')}`}
                    {!config.step4.druckdatenVorhanden && ` ${t('thankyou.step1.noFiles')}`}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    2
                  </span>
                  <span>{t('thankyou.step2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    3
                  </span>
                  <span>{t('thankyou.step3')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    4
                  </span>
                  <span>
                    {t('thankyou.step4.delivery')}
                    {config.step5.wunschDatum && ` (${new Date(config.step5.wunschDatum).toLocaleDateString('de-DE')})`}
                    {' '}{t('thankyou.step4.default')}
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={() => {
                navigate('/banner-bestellen')
                window.location.reload()
              }}>
                {t('thankyou.newInquiry')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                {t('thankyou.backHome')}
              </Button>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-2">{t('thankyou.questions')}</p>
              <a href="tel:+4915140368754" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                <Phone className="w-5 h-5" />
                +49 1514 0368754
              </a>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              {t('thankyou.emailCopy')}
              <br />
              {t('thankyou.checkSpam')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
