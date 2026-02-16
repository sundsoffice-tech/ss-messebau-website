import { Button } from '@/components/ui/button'
import { CalendarDot, ArrowRight } from '@phosphor-icons/react'
import { trackHeroCTAClick } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking } from '@/hooks/use-analytics'
import { useTranslation } from '@/lib/i18n'
import { MesseCalendar } from '@/components/MesseCalendar'
import { NewsSection } from '@/components/NewsSection'

interface AktuellesPageProps {
  onOpenInquiry: () => void
}

export function AktuellesPage({ onOpenInquiry }: AktuellesPageProps) {
  const { t } = useTranslation()

  useScrollDepthTracking('aktuelles')
  useDwellTimeTracking('aktuelles')

  return (
    <div>
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
            <CalendarDot className="h-8 w-8 md:h-10 md:w-10 shrink-0" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t('aktuelles.hero.title')}
            </h1>
          </div>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            {t('aktuelles.hero.subtitle')}
          </p>
        </div>
      </section>

      <MesseCalendar />
      <NewsSection />

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">
            {t('aktuelles.cta.heading')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('aktuelles.cta.text')}
          </p>
          <Button
            size="lg"
            onClick={() => { trackHeroCTAClick('aktuelles_cta'); onOpenInquiry() }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg"
          >
            {t('aktuelles.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
