import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Lightbulb, Warning, Info } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import type { BannerConfig } from '../BannerBestellenPage'

type Step2Data = BannerConfig['step2']

interface ConfiguratorStep2Props {
  data: Step2Data
  step1Data?: BannerConfig['step1']
  onChange: (data: Partial<Step2Data>) => void
  onNext: () => void
  onBack: () => void
}

const EFKA_PROFILES = [
  'eco-25', 'slim-28', 'heavy-45', 'double-50',
  'cabinet-60', 'lightbox-80', 'cord-30', 'curved-35',
] as const

const CORNER_OPTIONS = [
  'gehrung', 'verbinder', 'rund', 'hexagonal', 'multi-connector',
] as const

const PROFILE_COLORS = [
  { value: 'silber', colorHex: '#C0C0C0' },
  { value: 'schwarz', colorHex: '#1a1a1a' },
  { value: 'weiss', colorHex: '#FAFAFA' },
  { value: 'gold', colorHex: '#D4AF37' },
  { value: 'ral-custom', colorHex: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)' },
] as const

const ACCESSORIES = [
  'standplatte', 'wandhalter', 'deckenmontage',
  'akustikmaterial', 'extensionset', 'connector', 'deskclamp',
] as const

export function ConfiguratorStep2({ data, step1Data, onChange, onNext, onBack }: ConfiguratorStep2Props) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isCurvedFrame = step1Data?.rahmenart === 'curved'

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

  const handleZubehoerToggle = (item: string, checked: boolean) => {
    const current = data.zubehoer || []
    const updated = checked
      ? [...current, item as Step2Data['zubehoer'][number]]
      : current.filter((z) => z !== item)
    onChange({ zubehoer: updated })
  }

  const flaeche = data.breite && data.hoehe ? ((data.breite * data.hoehe) / 10000).toFixed(2) : '0'

  const showMinWarning = (data.breite > 0 && data.breite < 50) || (data.hoehe > 0 && data.hoehe < 50)
  const showLargeWarning = data.breite > 400 || data.hoehe > 400
  const showExtensionHint = showLargeWarning && !(data.zubehoer || []).includes('extensionset')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step2.title')}</h2>
        <p className="text-muted-foreground">{t('step2.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {/* Dimensions */}
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

        {/* Smart Warnings */}
        {showMinWarning && (
          <Alert className="border-amber-300 bg-amber-50">
            <Warning className="w-5 h-5 text-amber-600" />
            <AlertDescription className="text-amber-800">{t('step2.warning.minSize')}</AlertDescription>
          </Alert>
        )}

        {showLargeWarning && (
          <Alert className="border-blue-300 bg-blue-50">
            <Info className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800">{t('step2.warning.largeSize')}</AlertDescription>
          </Alert>
        )}

        {showExtensionHint && (
          <button
            type="button"
            onClick={() => handleZubehoerToggle('extensionset', true)}
            className="w-full text-left p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-sm"
          >
            <span className="font-medium text-primary">💡 {t('step2.warning.extensionHint')}</span>
          </button>
        )}

        {data.breite > 0 && data.hoehe > 0 && (
          <Alert>
            <AlertDescription>
              <strong>{t('step2.area')}: {flaeche} m²</strong>
              {data.breite > 400 && ` • ${t('step2.largeFormat')}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step2.profil.label')}</Label>
          <RadioGroup
            value={data.profil}
            onValueChange={(value) => onChange({ profil: value as Step2Data['profil'] })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EFKA_PROFILES.map((profile) => (
                <Label
                  key={profile}
                  htmlFor={`profil-${profile}`}
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.profil === profile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={profile} id={`profil-${profile}`} className="mt-1" />
                  <div className="min-w-0">
                    <div className="font-medium">{t(`step2.profil.${profile}`)}</div>
                    <div className="text-xs text-muted-foreground">{t(`step2.profil.${profile}.desc`)}</div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Profile Color */}
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step2.profilFarbe.label')}</Label>
          <div className="flex flex-wrap gap-3">
            {PROFILE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onChange({ profilFarbe: color.value as Step2Data['profilFarbe'] })}
                className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-colors ${
                  data.profilFarbe === color.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                  style={{ background: color.colorHex }}
                />
                <span className="text-sm font-medium">{t(`step2.profilFarbe.${color.value}`)}</span>
              </button>
            ))}
          </div>
          {data.profilFarbe === 'ral-custom' && (
            <div className="mt-3 animate-in fade-in">
              <Label htmlFor="ralCode">{t('step2.profilFarbe.ralCode.label')}</Label>
              <Input
                id="ralCode"
                value={data.ralCode || ''}
                onChange={(e) => onChange({ ralCode: e.target.value })}
                placeholder={t('step2.profilFarbe.ralCode.placeholder')}
                className="mt-1 max-w-xs"
              />
            </div>
          )}
        </div>

        {/* Corners */}
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step2.ecken.label')}</Label>
          {isCurvedFrame ? (
            <Alert className="bg-muted/50">
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">{t('step2.ecken.curvedInfo')}</AlertDescription>
            </Alert>
          ) : (
            <RadioGroup
              value={data.ecken}
              onValueChange={(value) => onChange({ ecken: value as Step2Data['ecken'] })}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {CORNER_OPTIONS.map((corner) => (
                  <Label
                    key={corner}
                    htmlFor={`ecken-${corner}`}
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.ecken === corner ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={corner} id={`ecken-${corner}`} className="mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{t(`step2.ecken.${corner}`)}</div>
                      <div className="text-xs text-muted-foreground">{t(`step2.ecken.${corner}.desc`)}</div>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        {/* Sides */}
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step2.seitigkeit.label')}</Label>
          <RadioGroup
            value={data.seitigkeit}
            onValueChange={(value) => onChange({ seitigkeit: value })}
          >
            <div className="flex gap-3">
              <Label
                htmlFor="einseitig"
                className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.seitigkeit === 'einseitig' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="einseitig" id="einseitig" />
                <span>{t('step2.seitigkeit.einseitig')}</span>
              </Label>
              <Label
                htmlFor="beidseitig"
                className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                  data.seitigkeit === 'beidseitig' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="beidseitig" id="beidseitig" />
                <span>{t('step2.seitigkeit.beidseitig')}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Accessories */}
        <div className="border-t pt-4">
          <Label className="text-base font-semibold mb-2 block">{t('step2.zubehoer.label')}</Label>
          <p className="text-sm text-muted-foreground mb-3">{t('step2.zubehoer.hint')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACCESSORIES.map((item) => (
              <label
                key={item}
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  (data.zubehoer || []).includes(item)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={(data.zubehoer || []).includes(item)}
                  onCheckedChange={(checked) => handleZubehoerToggle(item, checked as boolean)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{t(`step2.zubehoer.${item}`)}</div>
                  <div className="text-xs text-muted-foreground">{t(`step2.zubehoer.${item}.desc`)}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* LED */}
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
