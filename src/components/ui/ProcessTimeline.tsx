import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface ProcessTimelineProps {
  onOpenInquiry: () => void
}

const steps = [
  { titleKey: 'process.step1.title', descKey: 'process.step1.desc' },
  { titleKey: 'process.step2.title', descKey: 'process.step2.desc' },
  { titleKey: 'process.step3.title', descKey: 'process.step3.desc' },
  { titleKey: 'process.step4.title', descKey: 'process.step4.desc' },
  { titleKey: 'process.step5.title', descKey: 'process.step5.desc' },
  { titleKey: 'process.step6.title', descKey: 'process.step6.desc' },
]

export function ProcessTimeline({ onOpenInquiry }: ProcessTimelineProps) {
  const { t } = useTranslation()
  return (
    <section id="process" className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>
            {t('process.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('process.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.titleKey} className="relative text-center group">
              <div className="flex items-center justify-center mx-auto mb-3 h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-primary/20" />
              )}
              <h3 className="font-semibold text-sm sm:text-base mb-1">{t(step.titleKey)}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            {t('process.cta')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
