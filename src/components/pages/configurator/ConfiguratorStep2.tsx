import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Lightbulb } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

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

interface ConfiguratorStep2Props {
  data: Step2Data
  onChange: (data: Partial<Step2Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep2({ data, onChange, onNext, onBack }: ConfiguratorStep2Props) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (data.breite < 50 || data.breite > 800) newErrors.breite = t('step2.error.breite')
    if (data.hoehe < 50 || data.hoehe > 400) newErrors.hoehe = t('step2.error.hoehe')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const flaeche = data.breite && data.hoehe ? ((data.breite * data.hoehe) / 10000).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step2.title')}</h2>
        <p className="text-muted-foreground">{t('step2.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="breite">{t('step2.breite.label')}</Label>
            <Input
              id="breite"
              type="number"
              min={50}
              max={800}
              value={data.breite || ''}
              onChange={(e) => onChange({ breite: parseInt(e.target.value) || 0 })}
              placeholder={t('step2.breite.placeholder')}
              className="mt-1"
            />
            {errors.breite && <p className="text-sm text-destructive mt-1">{errors.breite}</p>}
          </div>
          <div>
            <Label htmlFor="hoehe">{t('step2.hoehe.label')}</Label>
            <Input
              id="hoehe"
              type="number"
              min={50}
              max={400}
              value={data.hoehe || ''}
              onChange={(e) => onChange({ hoehe: parseInt(e.target.value) || 0 })}
              placeholder={t('step2.hoehe.placeholder')}
              className="mt-1"
            />
            {errors.hoehe && <p className="text-sm text-destructive mt-1">{errors.hoehe}</p>}
          </div>
        </div>

        {data.breite > 0 && data.hoehe > 0 && (
          <Alert>
            <AlertDescription>
              <strong>{t('step2.area')}: {flaeche} m²</strong>
              {data.breite > 400 && ` • ${t('step2.largeFormat')}`}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step2.profil.label')}</Label>
          <RadioGroup
            value={data.profil}
            onValueChange={(value) => onChange({ profil: value })}
          >
            <div className="space-y-2">
              {[
                { value: 'standard', label: t('step2.profil.standard'), desc: t('step2.profil.standard.desc') },
                { value: 'premium', label: t('step2.profil.premium'), desc: t('step2.profil.premium.desc') },
                { value: 'sonder', label: t('step2.profil.sonder'), desc: t('step2.profil.sonder.desc') },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`profil-${option.value}`}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    data.profil === option.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`profil-${option.value}`} className="mt-1" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">{t('step2.ecken.label')}</Label>
            <RadioGroup
              value={data.ecken}
              onValueChange={(value) => onChange({ ecken: value })}
            >
              <Label
                htmlFor="gehrung"
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.ecken === 'gehrung' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="gehrung" id="gehrung" />
                <span>{t('step2.ecken.gehrung')}</span>
              </Label>
              <Label
                htmlFor="verbinder"
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.ecken === 'verbinder' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="verbinder" id="verbinder" />
                <span>{t('step2.ecken.verbinder')}</span>
              </Label>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">{t('step2.seitigkeit.label')}</Label>
            <RadioGroup
              value={data.seitigkeit}
              onValueChange={(value) => onChange({ seitigkeit: value })}
            >
              <Label
                htmlFor="einseitig"
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.seitigkeit === 'einseitig' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="einseitig" id="einseitig" />
                <span>{t('step2.seitigkeit.einseitig')}</span>
              </Label>
              <Label
                htmlFor="beidseitig"
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.seitigkeit === 'beidseitig' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="beidseitig" id="beidseitig" />
                <span>{t('step2.seitigkeit.beidseitig')}</span>
              </Label>
            </RadioGroup>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="led"
              checked={data.led}
              onCheckedChange={(checked) => onChange({ led: checked as boolean })}
            />
            <Label htmlFor="led" className="font-semibold cursor-pointer">
              {t('step2.led.label')}
            </Label>
          </div>

          {data.led && (
            <div className="ml-6 space-y-3 animate-in fade-in">
              <Alert className="bg-accent/10">
                <Lightbulb className="w-5 h-5" />
                <AlertDescription>
                  {t('step2.led.hint')}
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('step2.led.power')}</Label>
                  <RadioGroup
                    value={data.ledStrom || '230v'}
                    onValueChange={(value) => onChange({ ledStrom: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="230v" id="230v" />
                      <Label htmlFor="230v">230V</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="akku" id="akku" />
                      <Label htmlFor="akku">{t('step2.led.battery')}</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="ledEinsatz">{t('step2.led.duration')}</Label>
                  <Input
                    id="ledEinsatz"
                    value={data.ledEinsatz || ''}
                    onChange={(e) => onChange({ ledEinsatz: e.target.value })}
                    placeholder={t('step2.led.duration.placeholder')}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('common.back')}
        </Button>
        <Button onClick={handleNext}>
          {t('step2.next')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
