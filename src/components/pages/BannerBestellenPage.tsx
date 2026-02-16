import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useKV } from '@/hooks/use-kv'
import { kvAdapter } from '@/lib/local-storage-adapter'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Check } from '@phosphor-icons/react'
import { ConfiguratorStep1 } from './configurator/ConfiguratorStep1'
import { ConfiguratorStep2 } from './configurator/ConfiguratorStep2'
import { ConfiguratorStep3 } from './configurator/ConfiguratorStep3'
import { ConfiguratorStep4 } from './configurator/ConfiguratorStep4'
import { ConfiguratorStep5 } from './configurator/ConfiguratorStep5'
import { ConfiguratorStep6 } from './configurator/ConfiguratorStep6'
import { ConfigSummary } from './configurator/ConfigSummary'
import { ThankYouPage } from './configurator/ThankYouPage'
import { SerializedFile } from '@/lib/file-utils'
import { toast } from 'sonner'

export interface BannerConfig {
  step1: {
    einsatzort: string
    rahmenart: 'eco' | 'slim' | 'heavy' | 'double' | 'cabinet' | 'lightbox' | 'cord' | 'curved' | 'freestanding' | 'hanging'
    menge: number
    indoorOutdoor: string
    montage: boolean
    montageOrt?: string
    montageZeitraum?: string
    multiBannerMode?: 'identical' | 'individual'
    bannerConfigs?: Array<{ id: string; label: string; overrides: Partial<BannerConfigStep2> }>
  }
  step2: {
    breite: number
    hoehe: number
    profil: 'eco-25' | 'slim-28' | 'heavy-45' | 'double-50' | 'cabinet-60' | 'lightbox-80' | 'cord-30' | 'curved-35'
    ecken: 'gehrung' | 'verbinder' | 'rund' | 'hexagonal' | 'multi-connector'
    seitigkeit: string
    led: boolean
    ledStrom?: string
    ledEinsatz?: string
    profilFarbe: 'silber' | 'schwarz' | 'weiss' | 'gold' | 'ral-custom'
    ralCode?: string
    zubehoer: ('standplatte' | 'wandhalter' | 'deckenmontage' | 'akustikmaterial' | 'extensionset' | 'connector' | 'deskclamp')[]
  }
  step3: {
    bannerBenoetigt: boolean
    material?: string
    konfektion?: string[]
    brandschutz?: boolean
    druckqualitaet?: string
  }
  step4: {
    druckdatenVorhanden: boolean
    dateien?: File[]
    serializedFiles?: SerializedFile[]
    grafikservice?: boolean
    designwunsch?: string
    kommentar?: string
  }
  step5: {
    firma: string
    strasse: string
    plz: string
    ort: string
    land: string
    wunschDatum?: string
    express: boolean
    lieferart: string
    zeitfenster?: string
  }
  step6: {
    firmaKontakt: string
    ansprechpartner: string
    email: string
    telefon: string
    ustId?: string
    dsgvo: boolean
    newsletter: boolean
  }
}

export type BannerConfigStep2 = BannerConfig['step2']

const initialConfig: BannerConfig = {
  step1: {
    einsatzort: '',
    rahmenart: 'eco',
    menge: 1,
    indoorOutdoor: 'indoor',
    montage: false,
  },
  step2: {
    breite: 0,
    hoehe: 0,
    profil: 'eco-25',
    ecken: 'gehrung',
    seitigkeit: 'einseitig',
    led: false,
    profilFarbe: 'silber',
    zubehoer: [],
  },
  step3: {
    bannerBenoetigt: true,
  },
  step4: {
    druckdatenVorhanden: true,
  },
  step5: {
    firma: '',
    strasse: '',
    plz: '',
    ort: '',
    land: 'Deutschland',
    express: false,
    lieferart: 'spedition',
  },
  step6: {
    firmaKontakt: '',
    ansprechpartner: '',
    email: '',
    telefon: '',
    dsgvo: false,
    newsletter: false,
  },
}

interface BannerBestellenPageProps {
  onOpenInquiry: () => void
}

export function BannerBestellenPage({ onOpenInquiry }: BannerBestellenPageProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useKV<BannerConfig>('banner_config_draft', initialConfig)
  const [submitted, setSubmitted] = useState(false)

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const stepLabels = useMemo(() => [
    t('bannerBestellen.stepEinsatz'),
    t('bannerBestellen.stepMasse'),
    t('bannerBestellen.stepDruck'),
    t('bannerBestellen.stepDaten'),
    t('bannerBestellen.stepLieferung'),
    t('bannerBestellen.stepKontakt'),
  ], [t])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStepChange = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
    }
  }

  const updateConfig = async (step: string, data: any) => {
    if (step === 'step4' && data.dateien) {
      const { filesToSerializable } = await import('@/lib/file-utils')
      const serializedFiles = await filesToSerializable(data.dateien)
      
      setConfig((prev) => {
        if (!prev) return initialConfig
        return {
          ...prev,
          step4: { 
            ...prev.step4, 
            ...data, 
            serializedFiles,
          },
        } as BannerConfig
      })
    } else {
      setConfig((prev) => {
        if (!prev) return initialConfig
        return {
          ...prev,
          [step]: { ...prev[step as keyof BannerConfig], ...data },
        } as BannerConfig
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const configId = `banner_${Date.now()}`
      
      const configToSave = {
        ...config,
        step4: {
          ...config?.step4,
          dateien: undefined,
        },
        timestamp: new Date().toISOString(),
        status: 'neu',
      }
      
      await kvAdapter.set(configId, configToSave)

      // Save order to backend API
      try {
        const { ordersApi } = await import('@/lib/api-client')
        await ordersApi.create(configId, configToSave)
      } catch (error) {
        // Fallback: order already saved to localStorage above
        console.warn('API unavailable, order saved locally only', error)
      }

      if (config) {
        // Send detailed email via email-service (company + customer confirmation)
        const { sendOrderConfirmationEmail } = await import('@/lib/email-service')
        const emailResult = await sendOrderConfirmationEmail({ config, configId })

        if (!emailResult.success) {
          toast.error('E-Mail konnte nicht gesendet werden: ' + (emailResult.error || 'Unbekannter Fehler'))
        }

        // Send webhooks only via notification service (no duplicate email)
        try {
          const { sendWebhooksOnly } = await import('@/lib/notification-service')
          await sendWebhooksOnly({
            type: 'banner',
            data: {
              firmaKontakt: config.step6.firmaKontakt,
              ansprechpartner: config.step6.ansprechpartner,
              email: config.step6.email,
              telefon: config.step6.telefon,
              rahmenart: config.step1.rahmenart,
              menge: config.step1.menge,
              maße: `${config.step2.breite} × ${config.step2.hoehe} mm`,
            },
            inquiryId: configId,
          })
        } catch {
          // Webhooks are best-effort
        }
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Beim Speichern der Bestellung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
    }
  }

  if (submitted && config) {
    return <ThankYouPage config={config} />
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8 text-center px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('bannerBestellen.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('bannerBestellen.stepProgress').replace('{current}', String(currentStep)).replace('{total}', String(totalSteps))}
            </p>
          </div>

          <div className="mb-6 sm:mb-8 px-2">
            <Progress value={progress} className="h-1.5 sm:h-2" />
            <div className="mt-3 sm:mt-4 hidden md:flex justify-between text-sm">
              {stepLabels.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepChange(idx + 1)}
                  className={`flex items-center gap-2 ${
                    idx + 1 < currentStep
                      ? 'text-primary cursor-pointer'
                      : idx + 1 === currentStep
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={idx + 1 > currentStep}
                >
                  {idx + 1 < currentStep ? (
                    <Check className="w-5 h-5" weight="bold" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-current text-xs">
                      {idx + 1}
                    </span>
                  )}
                  {label}
                </button>
              ))}
            </div>
            
            <div className="mt-3 flex md:hidden justify-center gap-1.5">
              {stepLabels.map((label, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx + 1 < currentStep
                      ? 'bg-primary'
                      : idx + 1 === currentStep
                      ? 'bg-primary/60'
                      : 'bg-muted'
                  }`}
                  title={label}
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="p-4 sm:p-6 md:p-8">
                {currentStep === 1 && config && (
                  <ConfiguratorStep1
                    data={config.step1}
                    onChange={(data) => updateConfig('step1', data)}
                    onNext={handleNext}
                  />
                )}
                {currentStep === 2 && config && (
                  <ConfiguratorStep2
                    data={config.step2}
                    step1Data={config.step1}
                    onChange={(data) => updateConfig('step2', data)}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 3 && config && (
                  <ConfiguratorStep3
                    data={config.step3}
                    step1Data={config.step1}
                    step2Data={config.step2}
                    onChange={(data) => updateConfig('step3', data)}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 4 && config && (
                  <ConfiguratorStep4
                    data={config.step4}
                    onChange={(data) => updateConfig('step4', data)}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 5 && config && (
                  <ConfiguratorStep5
                    data={config.step5}
                    onChange={(data) => updateConfig('step5', data)}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 6 && config && (
                  <ConfiguratorStep6
                    data={config.step6}
                    onChange={(data) => updateConfig('step6', data)}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                  />
                )}
              </Card>
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
              {config && <ConfigSummary config={config} currentStep={currentStep} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
