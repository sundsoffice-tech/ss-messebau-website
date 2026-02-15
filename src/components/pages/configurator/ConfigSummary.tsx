import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/lib/i18n'
import { Check, File as FileIcon } from '@phosphor-icons/react'
import type { BannerConfig } from '../BannerBestellenPage'

interface ConfigSummaryProps {
  config: BannerConfig
  currentStep: number
}

export function ConfigSummary({ config, currentStep }: ConfigSummaryProps) {
  const { t } = useTranslation()

  const flaeche =
    config.step2.breite && config.step2.hoehe
      ? ((config.step2.breite * config.step2.hoehe) / 10000).toFixed(2)
      : '0'

  const getRahmenartLabel = (value: string) => {
    return t(`configSummary.rahmenart.${value}`) || value
  }

  const getProfilLabel = (value: string) => {
    return t(`configSummary.profil.${value}`) || value
  }

  const getEckenLabel = (value: string) => {
    return t(`configSummary.ecken.${value}`) || value
  }

  const getProfilFarbeLabel = (value: string) => {
    return t(`configSummary.profilFarbe.${value}`) || value
  }

  const getMaterialLabel = (value?: string) => {
    if (!value) return ''
    const labels: Record<string, string> = {
      frontlit: t('configSummary.material.frontlit'),
      blockout: t('configSummary.material.blockout'),
      mesh: t('configSummary.material.mesh'),
      backlit: t('configSummary.material.backlit'),
    }
    return labels[value] || value
  }

  const getZubehoerLabel = (value: string) => {
    return t(`configSummary.zubehoer.${value}`) || value
  }

  const fileCount = config.step4?.serializedFiles?.length || 0

  return (
    <Card className="p-4 sm:p-6 lg:sticky lg:top-6">
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('configSummary.title')}</h3>

      <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
        {currentStep >= 1 && config.step1.einsatzort && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{getRahmenartLabel(config.step1.rahmenart)}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">
                {config.step1.menge}x • {config.step1.indoorOutdoor === 'indoor' ? 'Indoor' : 'Outdoor'}
                {config.step1.multiBannerMode === 'individual' && (
                  <> • {t('configSummary.multiBanner.individual')}</>
                )}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && config.step2.breite > 0 && config.step2.hoehe > 0 && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">
                {config.step2.breite} × {config.step2.hoehe} cm
              </p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">
                {flaeche} m² • {getProfilLabel(config.step2.profil)}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{getEckenLabel(config.step2.ecken)}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">
                {t('configSummary.profilFarbe')}: {getProfilFarbeLabel(config.step2.profilFarbe)}
                {config.step2.ralCode && ` (${config.step2.ralCode})`}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && config.step2.zubehoer && config.step2.zubehoer.length > 0 && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.zubehoer')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">
                {config.step2.zubehoer.map(getZubehoerLabel).join(', ')}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && config.step2.led && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.ledBacklight')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">{config.step2.ledStrom || '230V'}</p>
            </div>
          </div>
        )}

        {currentStep >= 3 && config.step3.bannerBenoetigt && config.step3.material && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.bannerPrint')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs break-words">
                {getMaterialLabel(config.step3.material)}
                {config.step3.brandschutz && ` • ${t('configSummary.fireProtection')}`}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 4 && config.step4.druckdatenVorhanden && fileCount > 0 && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.printData')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs flex items-center gap-1">
                <FileIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                {fileCount} {fileCount === 1 ? t('configSummary.fileSingular') : t('configSummary.filePlural')} {t('configSummary.uploaded')}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 4 && !config.step4.druckdatenVorhanden && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.graphicService')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">
                {t('configSummary.designBeingCreated')}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 1 && config.step1.montage && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.installationService')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs break-words">{config.step1.montageOrt || t('configSummary.toBeDetermined')}</p>
            </div>
          </div>
        )}

        {currentStep >= 5 && config.step5.express && (
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">{t('configSummary.expressService')}</p>
              <p className="text-muted-foreground text-[11px] sm:text-xs">{t('configSummary.expressDelivery')}</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-3 sm:my-4" />

      <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm font-semibold mb-1">{t('configSummary.customQuote')}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          {t('configSummary.customQuoteDescription')}
        </p>
      </div>

      {currentStep >= 2 && config.step2.breite > 0 && config.step2.hoehe > 0 && (
        <div className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-muted-foreground">
          <p className="font-medium mb-1">{t('configSummary.estimatedDelivery')}</p>
          <p>{config.step5?.express ? t('configSummary.expressDelivery') : t('configSummary.standardDelivery')} {t('configSummary.afterPrintApproval')}</p>
        </div>
      )}
    </Card>
  )
}
