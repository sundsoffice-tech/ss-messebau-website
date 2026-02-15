import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  Package,
  Microphone,
  CalendarDot,
  Storefront,
  ShoppingBag,
  Armchair,
  FrameCorners,
} from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface LeistungenHubPageProps {
  onOpenInquiry: () => void
}

const services = [
  { key: 'messebau', icon: Package, path: '/leistungen' },
  { key: 'eventbau', icon: Microphone, path: '/leistungen' },
  { key: 'touren', icon: CalendarDot, path: '/leistungen' },
  { key: 'showrooms', icon: Storefront, path: '/leistungen' },
  { key: 'ladenbau', icon: ShoppingBag, path: '/leistungen' },
  { key: 'boeden', icon: Armchair, path: '/leistungen' },
  { key: 'bannerrahmen', icon: FrameCorners, path: '/bannerrahmen' },
] as const

export function LeistungenHubPage({ onOpenInquiry }: LeistungenHubPageProps) {
  const { t } = useTranslation()

  const handleTileClick = (path: string) => {
    window.location.hash = path
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
          >
            {t('hub.hero.title')}
          </h1>
          <p
            className="mt-4 max-w-2xl mx-auto text-primary-foreground/80 leading-relaxed"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
          >
            {t('hub.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Service Tiles Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service) => {
              const Icon = service.icon
              const isBanner = service.key === 'bannerrahmen'

              return (
                <Card
                  key={service.key}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                    isBanner ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                  data-track="hub-tile-click"
                  data-service={service.key}
                  onClick={() => handleTileClick(service.path)}
                >
                  <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                    <div
                      className={`flex items-center gap-4 ${
                        isBanner ? 'sm:flex-row' : 'flex-col sm:flex-row'
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon size={28} weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <h2
                          className="font-semibold leading-tight"
                          style={{
                            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                          }}
                        >
                          {t(`hub.${service.key}.title`)}
                        </h2>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                      {t(`hub.${service.key}.desc`)}
                    </p>

                    <div className="mt-auto pt-2">
                      <Button
                        variant="ghost"
                        className="group/btn h-auto p-0 text-primary hover:text-primary/80"
                      >
                        {t(`hub.${service.key}.cta`)}
                        <ArrowRight
                          size={18}
                          className="ml-1.5 transition-transform group-hover/btn:translate-x-1"
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-muted py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
          >
            {t('hub.cta.title')}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            {t('hub.cta.subtitle')}
          </p>
          <Button
            size="lg"
            className="mt-6 bg-accent hover:bg-accent/90 min-h-[48px] text-base"
            onClick={onOpenInquiry}
          >
            {t('hub.cta.button')}
          </Button>
        </div>
      </section>
    </div>
  )
}
