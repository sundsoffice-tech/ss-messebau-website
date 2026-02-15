import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Storefront, Building, Confetti, Sun, Copy, ArrowsClockwise, Info } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import type { BannerConfig } from '../BannerBestellenPage'

type Step1Data = BannerConfig['step1']

interface ConfiguratorStep1Props {
  data: Step1Data
  onChange: (data: Partial<Step1Data>) => void
  onNext: () => void
}

const EFKA_FRAME_TYPES = [
  { value: 'eco', category: 'standard' },
  { value: 'slim', category: 'standard' },
  { value: 'heavy', category: 'heavy' },
  { value: 'double', category: 'heavy' },
  { value: 'cabinet', category: 'special' },
  { value: 'lightbox', category: 'special' },
  { value: 'cord', category: 'flexible' },
  { value: 'curved', category: 'flexible' },
  { value: 'freestanding', category: 'mounting' },
  { value: 'hanging', category: 'mounting' },
] as const

export function ConfiguratorStep1({ data, onChange, onNext }: ConfiguratorStep1Props) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.einsatzort) newErrors.einsatzort = t('step1.error.einsatzort')
    if (!data.rahmenart) newErrors.rahmenart = t('step1.error.rahmenart')
    if (data.menge < 1 || data.menge > 50) newErrors.menge = t('step1.error.menge')
    if (data.montage && !data.montageOrt) newErrors.montageOrt = t('step1.error.montageOrt')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const handleMengeChange = (menge: number) => {
    const updates: Partial<Step1Data> = { menge }
    if (menge <= 1) {
      updates.multiBannerMode = undefined
      updates.bannerConfigs = undefined
    }
    onChange(updates)
  }

  const handleMultiBannerModeChange = (mode: 'identical' | 'individual') => {
    if (mode === 'individual') {
      const configs = Array.from({ length: data.menge }, (_, i) => ({
        id: `banner-${i + 1}`,
        label: t('step1.multiBanner.tab').replace('{n}', String(i + 1)),
        overrides: {},
      }))
      onChange({ multiBannerMode: mode, bannerConfigs: configs })
    } else {
      onChange({ multiBannerMode: mode, bannerConfigs: undefined })
    }
  }

  const handleDuplicateBanner = (index: number) => {
    if (!data.bannerConfigs) return
    const source = data.bannerConfigs[index]
    const newConfigs = data.bannerConfigs.map((cfg, i) =>
      i !== index ? { ...cfg, overrides: { ...source.overrides } } : cfg
    )
    onChange({ bannerConfigs: newConfigs })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('step1.title')}</h2>
        <p className="text-muted-foreground">
          {t('step1.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step1.einsatzort.label')}</Label>
          <RadioGroup
            value={data.einsatzort}
            onValueChange={(value) => onChange({ einsatzort: value })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'messe', label: t('step1.einsatzort.messe'), icon: Storefront },
                { value: 'laden', label: t('step1.einsatzort.laden'), icon: Building },
                { value: 'event', label: t('step1.einsatzort.event'), icon: Confetti },
                { value: 'outdoor', label: t('step1.einsatzort.outdoor'), icon: Sun },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`einsatz-${option.value}`}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.einsatzort === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`einsatz-${option.value}`} />
                  <option.icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{option.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {errors.einsatzort && <p className="text-sm text-destructive mt-1">{errors.einsatzort}</p>}
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step1.rahmenart.label')}</Label>
          <RadioGroup
            value={data.rahmenart}
            onValueChange={(value) => onChange({ rahmenart: value as Step1Data['rahmenart'] })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EFKA_FRAME_TYPES.map((frame) => (
                <Label
                  key={frame.value}
                  htmlFor={`rahmen-${frame.value}`}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.rahmenart === frame.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={frame.value} id={`rahmen-${frame.value}`} className="mt-1" />
                  <div className="min-w-0">
                    <div className="font-medium">{t(`step1.rahmenart.${frame.value}`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`step1.rahmenart.${frame.value}.desc`)}</div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {errors.rahmenart && <p className="text-sm text-destructive mt-1">{errors.rahmenart}</p>}
        </div>

        <div>
          <Label htmlFor="menge" className="text-base font-semibold">{t('step1.menge.label')}</Label>
          <Input
            id="menge"
            type="number"
            min={1}
            max={50}
            value={data.menge}
            onChange={(e) => handleMengeChange(parseInt(e.target.value) || 1)}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">{t('step1.menge.hint')}</p>
          {errors.menge && <p className="text-sm text-destructive mt-1">{errors.menge}</p>}
        </div>

        {data.menge > 1 && (
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <Label className="text-base font-semibold mb-3 block">{t('step1.multiBanner.label')}</Label>
            <RadioGroup
              value={data.multiBannerMode || 'identical'}
              onValueChange={(value) => handleMultiBannerModeChange(value as 'identical' | 'individual')}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="multi-identical"
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    (!data.multiBannerMode || data.multiBannerMode === 'identical')
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="identical" id="multi-identical" className="mt-0.5" />
                  <div>
                    <div className="font-medium">{t('step1.multiBanner.identical')}</div>
                    <div className="text-sm text-muted-foreground">{t('step1.multiBanner.identical.desc')}</div>
                  </div>
                </Label>
                <Label
                  htmlFor="multi-individual"
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.multiBannerMode === 'individual'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="individual" id="multi-individual" className="mt-0.5" />
                  <div>
                    <div className="font-medium">{t('step1.multiBanner.individual')}</div>
                    <div className="text-sm text-muted-foreground">{t('step1.multiBanner.individual.desc')}</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {data.multiBannerMode === 'individual' && data.bannerConfigs && (
              <div className="mt-4 space-y-2">
                <Alert className="bg-accent/10">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {t('step1.multiBanner.individual.desc')}
                  </AlertDescription>
                </Alert>
                <div className="flex flex-wrap gap-2">
                  {data.bannerConfigs.map((cfg, idx) => (
                    <div key={cfg.id} className="flex items-center gap-1">
                      <span className="text-sm font-medium px-3 py-1.5 bg-primary/10 rounded-md">
                        {cfg.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDuplicateBanner(idx)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        title={t('step1.multiBanner.applyAll')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => data.bannerConfigs && handleDuplicateBanner(0)}
                  className="mt-2"
                >
                  <ArrowsClockwise className="w-4 h-4 mr-1" />
                  {t('step1.multiBanner.applyAll')}
                </Button>
              </div>
            )}
          </div>
        )}

        <div>
          <Label className="text-base font-semibold mb-3 block">{t('step1.indoorOutdoor.label')}</Label>
          <RadioGroup
            value={data.indoorOutdoor}
            onValueChange={(value) => onChange({ indoorOutdoor: value })}
          >
            <div className="flex gap-4">
              <Label
                htmlFor="indoor"
                className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                  data.indoorOutdoor === 'indoor' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="indoor" id="indoor" />
                <span className="font-medium">{t('step1.indoorOutdoor.indoor')}</span>
              </Label>
              <Label
                htmlFor="outdoor"
                className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                  data.indoorOutdoor === 'outdoor' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="outdoor" id="outdoor" />
                <span className="font-medium">{t('step1.indoorOutdoor.outdoor')}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="montage"
              checked={data.montage}
              onCheckedChange={(checked) => onChange({ montage: checked as boolean })}
            />
            <Label htmlFor="montage" className="font-semibold cursor-pointer">
              {t('step1.montage.label')}
            </Label>
          </div>

          {data.montage && (
            <div className="ml-6 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <Label htmlFor="montageOrt">{t('step1.montage.ortLabel')}</Label>
                <Input
                  id="montageOrt"
                  value={data.montageOrt || ''}
                  onChange={(e) => onChange({ montageOrt: e.target.value })}
                  placeholder={t('step1.montage.ortPlaceholder')}
                  className="mt-1"
                />
                {errors.montageOrt && <p className="text-sm text-destructive mt-1">{errors.montageOrt}</p>}
              </div>
              <div>
                <Label htmlFor="montageZeitraum">{t('step1.montage.zeitraumLabel')}</Label>
                <Input
                  id="montageZeitraum"
                  value={data.montageZeitraum || ''}
                  onChange={(e) => onChange({ montageZeitraum: e.target.value })}
                  placeholder={t('step1.montage.zeitraumPlaceholder')}
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('step1.montage.hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleNext} size="lg">
          {t('step1.nextButton')}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
