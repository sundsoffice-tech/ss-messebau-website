import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Lightbulb } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface Step1Data {
  einsatzort: string
  rahmenart: string
  menge: number
  indoorOutdoor: string
  montage: boolean
  montageOrt?: string
  montageZeitraum?: string
}

interface Step2Data {
  breite: number
  hoehe: number
  profil: string
  ecken: string
  seitigkeit: string
  led: boolean
  ledStrom?: string
  ledEinsatz?: string
}

interface Step3Data {
  bannerBenoetigt: boolean
  material?: string
  konfektion?: string[]
  brandschutz?: boolean
  druckqualitaet?: string
}

interface ConfiguratorStep3Props {
  data: Step3Data
  step1Data: Step1Data
  step2Data: Step2Data
  onChange: (data: Partial<Step3Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep3({ data, step1Data, step2Data, onChange, onNext, onBack }: ConfiguratorStep3Props) {
  const { t } = useTranslation()
  const showOutdoorHint = step1Data.indoorOutdoor === 'outdoor' && data.material === 'frontlit'
  const showBacklitHint = step2Data.led && data.material !== 'backlit'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step3.title')}</h2>
        <p className="text-muted-foreground">
          {t('step3.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step3.bannerNeeded.label')}</Label>
          <RadioGroup
            value={data.bannerBenoetigt ? 'ja' : 'nein'}
            onValueChange={(value) => onChange({ bannerBenoetigt: value === 'ja' })}
          >
            <Label
              htmlFor="banner-ja"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                data.bannerBenoetigt ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="ja" id="banner-ja" />
              <span>{t('step3.bannerNeeded.yes')}</span>
            </Label>
            <Label
              htmlFor="banner-nein"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                !data.bannerBenoetigt ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="nein" id="banner-nein" />
              <span>{t('step3.bannerNeeded.no')}</span>
            </Label>
          </RadioGroup>
        </div>

        {data.bannerBenoetigt && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <Label className="text-base font-semibold mb-3 block">{t('step3.material.label')}</Label>
              <RadioGroup
                value={data.material || 'frontlit'}
                onValueChange={(value) => onChange({ material: value })}
              >
                <div className="space-y-2">
                  {[
                    { value: 'frontlit', label: t('step3.material.frontlit.label'), desc: t('step3.material.frontlit.desc') },
                    { value: 'blockout', label: t('step3.material.blockout.label'), desc: t('step3.material.blockout.desc') },
                    { value: 'mesh', label: t('step3.material.mesh.label'), desc: t('step3.material.mesh.desc') },
                    { value: 'backlit', label: t('step3.material.backlit.label'), desc: t('step3.material.backlit.desc') },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`mat-${option.value}`}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                        data.material === option.value ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`mat-${option.value}`} className="mt-1" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>

              {showOutdoorHint && (
                <Alert className="mt-2 bg-accent/10">
                  <Lightbulb className="w-5 h-5" />
                  <AlertDescription>
                    {t('step3.hints.outdoor')}
                  </AlertDescription>
                </Alert>
              )}

              {showBacklitHint && (
                <Alert className="mt-2 bg-accent/10">
                  <Lightbulb className="w-5 h-5" />
                  <AlertDescription>
                    {t('step3.hints.backlit')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">{t('step3.konfektion.label')}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="keder" defaultChecked disabled />
                  <Label htmlFor="keder" className="text-muted-foreground">
                    {t('step3.konfektion.keder')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="saum" />
                  <Label htmlFor="saum">{t('step3.konfektion.saum')}</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="brandschutz"
                checked={data.brandschutz || false}
                onCheckedChange={(checked) => onChange({ brandschutz: checked as boolean })}
              />
              <Label htmlFor="brandschutz" className="font-semibold cursor-pointer">
                {t('step3.fireProtection.label')}
              </Label>
            </div>
            {step1Data.einsatzort === 'messe' && !data.brandschutz && (
              <Alert className="bg-accent/10">
                <AlertDescription className="text-sm">
                  {t('step3.fireProtection.hint')}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="text-base font-semibold mb-3 block">{t('step3.printQuality.label')}</Label>
              <RadioGroup
                value={data.druckqualitaet || 'standard'}
                onValueChange={(value) => onChange({ druckqualitaet: value })}
              >
                <Label
                  htmlFor="qual-standard"
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    data.druckqualitaet === 'standard' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="standard" id="qual-standard" className="mt-1" />
                  <div>
                    <div className="font-medium">{t('step3.printQuality.standard.label')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('step3.printQuality.standard.desc')}
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="qual-high"
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    data.druckqualitaet === 'high' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="high" id="qual-high" className="mt-1" />
                  <div>
                    <div className="font-medium">{t('step3.printQuality.high.label')}</div>
                    <div className="text-sm text-muted-foreground">{t('step3.printQuality.high.desc')}</div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <Alert>
              <AlertDescription>
                <strong>{t('step3.printDataNotice.title')}</strong> {t('step3.printDataNotice.text')}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('step3.back')}
        </Button>
        <Button onClick={onNext}>
          {t('step3.next')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
