import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, CheckCircle, Calculator } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface StandCalculatorProps {
  onOpenInquiry: () => void
}

type Industry = 'food' | 'insurance' | 'industrial' | 'other'
type Size = 'small' | 'medium' | 'large' | 'xlarge'
type Level = 'standard' | 'premium' | 'exclusive'

const SIZE_RANGES: Record<Size, { min: number; max: number }> = {
  small: { min: 20, max: 40 },
  medium: { min: 40, max: 80 },
  large: { min: 80, max: 150 },
  xlarge: { min: 150, max: 200 },
}

const PRICE_PER_SQM: Record<Level, { min: number; max: number }> = {
  standard: { min: 300, max: 600 },
  premium: { min: 600, max: 1200 },
  exclusive: { min: 1200, max: 2000 },
}

function calculatePrice(size: Size, level: Level): { min: number; max: number } {
  const sizeRange = SIZE_RANGES[size]
  const priceRange = PRICE_PER_SQM[level]
  return {
    min: sizeRange.min * priceRange.min,
    max: sizeRange.max * priceRange.max,
  }
}

export function StandCalculator({ onOpenInquiry }: StandCalculatorProps) {
  const { t, lang } = useTranslation()
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [level, setLevel] = useState<Level | null>(null)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-DE' : 'de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
  }

  const industries: { key: Industry; label: string }[] = [
    { key: 'food', label: t('calculator.industry.food') },
    { key: 'insurance', label: t('calculator.industry.insurance') },
    { key: 'industrial', label: t('calculator.industry.industrial') },
    { key: 'other', label: t('calculator.industry.other') },
  ]

  const sizes: { key: Size; label: string }[] = [
    { key: 'small', label: t('calculator.size.small') },
    { key: 'medium', label: t('calculator.size.medium') },
    { key: 'large', label: t('calculator.size.large') },
    { key: 'xlarge', label: t('calculator.size.xlarge') },
  ]

  const levels: { key: Level; label: string; desc: string }[] = [
    { key: 'standard', label: t('calculator.level.standard'), desc: t('calculator.level.standard.desc') },
    { key: 'premium', label: t('calculator.level.premium'), desc: t('calculator.level.premium.desc') },
    { key: 'exclusive', label: t('calculator.level.exclusive'), desc: t('calculator.level.exclusive.desc') },
  ]

  const stepLabels = [
    t('calculator.step1'),
    t('calculator.step2'),
    t('calculator.step3'),
    t('calculator.step4'),
  ]

  const price = size && level ? calculatePrice(size, level) : null

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Calculator className="h-8 w-8 text-primary" weight="duotone" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{t('calculator.title')}</h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('calculator.subtitle')}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {i + 1 < step ? <CheckCircle className="h-5 w-5" weight="fill" /> : i + 1}
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground">{label}</span>
              {i < stepLabels.length - 1 && <div className="w-6 md:w-10 h-px bg-muted-foreground/30" />}
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Industry */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-semibold mb-4">{t('calculator.step1')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {industries.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setIndustry(key); setStep(2) }}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                        industry === key ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Size */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-semibold mb-4">{t('calculator.step2')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sizes.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setSize(key); setStep(3) }}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                        size === key ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
                  <ArrowLeft className="mr-2" /> {t('calculator.back')}
                </Button>
              </div>
            )}

            {/* Step 3: Level */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-semibold mb-4">{t('calculator.step3')}</h3>
                <div className="space-y-3">
                  {levels.map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => { setLevel(key); setStep(4) }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                        level === key ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <span className="font-semibold block mb-1">{label}</span>
                      <span className="text-sm text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setStep(2)} className="mt-4">
                  <ArrowLeft className="mr-2" /> {t('calculator.back')}
                </Button>
              </div>
            )}

            {/* Step 4: Result */}
            {step === 4 && price && (
              <div className="space-y-6 text-center">
                <h3 className="text-lg md:text-xl font-semibold">{t('calculator.result.title')}</h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <Badge variant="secondary">{industries.find(i => i.key === industry)?.label}</Badge>
                  <Badge variant="secondary">{sizes.find(s => s.key === size)?.label}</Badge>
                  <Badge variant="secondary">{levels.find(l => l.key === level)?.label}</Badge>
                </div>
                <div className="bg-primary/5 rounded-xl p-6 md:p-8">
                  <p className="text-sm text-muted-foreground mb-2">{t('calculator.result.range')}</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {formatCurrency(price.min)} – {formatCurrency(price.max)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('calculator.result.note')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 min-h-[52px] text-base">
                    {t('calculator.result.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => { setStep(1); setIndustry(null); setSize(null); setLevel(null) }} className="min-h-[52px]">
                    {t('calculator.back')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
