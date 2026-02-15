import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Warehouse, CalendarDot, Storefront, Armchair, ArrowRight, CheckCircle, Leaf, Recycle, TreeEvergreen, Truck, CubeTransparent, Lightning, Crosshair, Package, ChatCircleDots, TrendUp, DeviceMobile, ChartLine, Cube, Eye, Brain, Sparkle } from '@phosphor-icons/react'
import { useSectionObserver } from '@/hooks/use-deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { StandCalculator } from '@/components/ui/StandCalculator'
import { useTranslation } from '@/lib/i18n'

interface LeistungenPageProps {
  onOpenInquiry: () => void
}

export function LeistungenPage({ onOpenInquiry }: LeistungenPageProps) {
  const { t } = useTranslation()
  useSectionObserver([
    'brand-activation',
    'digital-experience',
    'ausstattung-ambiente',
    'methodik',
    'erfolge'
  ])

  return (
    <div>
      {/* Hero Section – Narrative Claim */}
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-bold mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3.5rem)', lineHeight: '1.2' }}>{t('leistungen.hero.title')}</h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            {t('leistungen.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Solution Module 1: Brand Activation */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="brand-activation" className="scroll-mt-20 space-y-8 sm:space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.brand.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('leistungen.brand.subtitle')}
              </p>
            </div>

            {/* Messebau */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Warehouse className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.messebau.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.messebau.desc')}
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    t('leistungen.messebau.b1'),
                    t('leistungen.messebau.b2'),
                    t('leistungen.messebau.b3'),
                    t('leistungen.messebau.b4'),
                    t('leistungen.messebau.b5')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.messebau.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.messebau.processTitle')}</h4>
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { step: '1', title: t('leistungen.messebau.step1.title'), desc: t('leistungen.messebau.step1.desc') },
                      { step: '2', title: t('leistungen.messebau.step2.title'), desc: t('leistungen.messebau.step2.desc') },
                      { step: '3', title: t('leistungen.messebau.step3.title'), desc: t('leistungen.messebau.step3.desc') },
                      { step: '4', title: t('leistungen.messebau.step4.title'), desc: t('leistungen.messebau.step4.desc') }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3 md:gap-4">
                        <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">
                          {item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 text-sm md:text-base">{item.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Eventbau */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <Card className="lg:order-2 mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.eventbau.typesTitle')}</h4>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      t('leistungen.eventbau.b1'),
                      t('leistungen.eventbau.b2'),
                      t('leistungen.eventbau.b3'),
                      t('leistungen.eventbau.b4'),
                      t('leistungen.eventbau.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 rounded-lg bg-muted">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="font-medium text-sm md:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="lg:order-1">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <CalendarDot className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.eventbau.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.eventbau.desc')}
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    t('leistungen.eventbau.b6'),
                    t('leistungen.eventbau.b7'),
                    t('leistungen.eventbau.b8'),
                    t('leistungen.eventbau.b9'),
                    t('leistungen.eventbau.b10')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.eventbau.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Touren */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">{t('leistungen.touren.title')}</h3>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.touren.desc')}
                </p>
                <h4 className="text-xl font-semibold mb-4">{t('leistungen.touren.advantagesTitle')}</h4>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    t('leistungen.touren.b1'),
                    t('leistungen.touren.b2'),
                    t('leistungen.touren.b3'),
                    t('leistungen.touren.b4'),
                    t('leistungen.touren.b5')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.touren.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.touren.processTitle')}</h4>
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { step: '1', title: t('leistungen.touren.step1.title'), desc: t('leistungen.touren.step1.desc') },
                      { step: '2', title: t('leistungen.touren.step2.title'), desc: t('leistungen.touren.step2.desc') },
                      { step: '3', title: t('leistungen.touren.step3.title'), desc: t('leistungen.touren.step3.desc') },
                      { step: '4', title: t('leistungen.touren.step4.title'), desc: t('leistungen.touren.step4.desc') }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3 md:gap-4">
                        <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">
                          {item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 text-sm md:text-base">{item.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Module 2: Tech & Data Experience */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="digital-experience" className="scroll-mt-20 space-y-8 sm:space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <Sparkle className="h-5 w-5 text-primary" weight="fill" />
                <span className="text-sm font-semibold text-primary">{t('leistungen.digital.badge')}</span>
              </div>
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.digital.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('leistungen.digital.subtitle')}
              </p>
            </div>

            {/* AR/VR & Virtual Trade Show Tours */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Cube className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.digital.arvr.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.digital.arvr.desc')}
                </p>
                <div className="bg-primary/5 rounded-lg p-4 md:p-6 mb-6">
                  <h4 className="font-semibold text-base md:text-lg mb-3">{t('leistungen.digital.arvr.servicesTitle')}</h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {[
                      t('leistungen.digital.arvr.b1'),
                      t('leistungen.digital.arvr.b2'),
                      t('leistungen.digital.arvr.b3'),
                      t('leistungen.digital.arvr.b4'),
                      t('leistungen.digital.arvr.b5'),
                      t('leistungen.digital.arvr.b6')
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">{t('leistungen.digital.arvr.useCaseTitle')}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('leistungen.digital.arvr.useCaseText')}
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.digital.arvr.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.digital.arvr.processTitle')}</h4>
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { step: '1', title: t('leistungen.digital.arvr.step1.title'), desc: t('leistungen.digital.arvr.step1.desc') },
                      { step: '2', title: t('leistungen.digital.arvr.step2.title'), desc: t('leistungen.digital.arvr.step2.desc') },
                      { step: '3', title: t('leistungen.digital.arvr.step3.title'), desc: t('leistungen.digital.arvr.step3.desc') },
                      { step: '4', title: t('leistungen.digital.arvr.step4.title'), desc: t('leistungen.digital.arvr.step4.desc') }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3 md:gap-4">
                        <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">
                          {item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1 text-sm md:text-base">{item.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visitor Tracking & Analytics */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="lg:order-2">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <ChartLine className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.digital.tracking.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.digital.tracking.desc')}
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    t('leistungen.digital.tracking.b1'),
                    t('leistungen.digital.tracking.b2'),
                    t('leistungen.digital.tracking.b3'),
                    t('leistungen.digital.tracking.b4'),
                    t('leistungen.digital.tracking.b5'),
                    t('leistungen.digital.tracking.b6')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">{t('leistungen.digital.tracking.useCaseTitle')}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('leistungen.digital.tracking.useCaseText')}
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.digital.tracking.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="lg:order-1 mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.digital.tracking.metricsTitle')}</h4>
                  <div className="space-y-4">
                    {[
                      { metric: t('leistungen.digital.tracking.metric1.title'), desc: t('leistungen.digital.tracking.metric1.desc'), icon: Eye },
                      { metric: t('leistungen.digital.tracking.metric2.title'), desc: t('leistungen.digital.tracking.metric2.desc'), icon: TrendUp },
                      { metric: t('leistungen.digital.tracking.metric3.title'), desc: t('leistungen.digital.tracking.metric3.desc'), icon: Crosshair },
                      { metric: t('leistungen.digital.tracking.metric4.title'), desc: t('leistungen.digital.tracking.metric4.desc'), icon: Lightning }
                    ].map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div key={index} className="flex gap-3 items-start border-l-4 border-primary/30 pl-4">
                          <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="bold" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">{item.metric}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Presentation & Smart Solutions */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <DeviceMobile className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.digital.interactive.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.digital.interactive.desc')}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { title: t('leistungen.digital.interactive.card1.title'), desc: t('leistungen.digital.interactive.card1.desc') },
                    { title: t('leistungen.digital.interactive.card2.title'), desc: t('leistungen.digital.interactive.card2.desc') },
                    { title: t('leistungen.digital.interactive.card3.title'), desc: t('leistungen.digital.interactive.card3.desc') },
                    { title: t('leistungen.digital.interactive.card4.title'), desc: t('leistungen.digital.interactive.card4.desc') }
                  ].map((item, index) => (
                    <div key={index} className="bg-primary/5 p-4 rounded-lg">
                      <p className="font-semibold text-sm md:text-base mb-1">{item.title}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">{t('leistungen.digital.interactive.useCaseTitle')}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('leistungen.digital.interactive.useCaseText')}
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.digital.interactive.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <div className="space-y-6 mt-8 lg:mt-0">
                <Card>
                  <CardContent className="p-5 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-8 w-8 text-primary" weight="bold" />
                      <h4 className="text-lg md:text-xl font-semibold">{t('leistungen.digital.smart.title')}</h4>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                      {t('leistungen.digital.smart.desc')}
                    </p>
                    <div className="space-y-2.5">
                      {[
                        t('leistungen.digital.smart.b1'),
                        t('leistungen.digital.smart.b2'),
                        t('leistungen.digital.smart.b3'),
                        t('leistungen.digital.smart.b4')
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" weight="fill" />
                          <span className="text-xs md:text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
                  <h4 className="font-bold text-lg mb-2">{t('leistungen.digital.innovation.title')}</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {t('leistungen.digital.innovation.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Showrooms & Brand Spaces - moved here */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mt-12">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Storefront className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.digital.showrooms.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.digital.showrooms.desc')}
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    t('leistungen.digital.showrooms.b1'),
                    t('leistungen.digital.showrooms.b2'),
                    t('leistungen.digital.showrooms.b3'),
                    t('leistungen.digital.showrooms.b4'),
                    t('leistungen.digital.showrooms.b5')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.digital.showrooms.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">{t('leistungen.digital.showrooms.servicesTitle')}</h4>
                  <div className="space-y-4">
                    {[
                      { name: t('leistungen.digital.showrooms.service1.name'), desc: t('leistungen.digital.showrooms.service1.desc') },
                      { name: t('leistungen.digital.showrooms.service2.name'), desc: t('leistungen.digital.showrooms.service2.desc') },
                      { name: t('leistungen.digital.showrooms.service3.name'), desc: t('leistungen.digital.showrooms.service3.desc') },
                      { name: t('leistungen.digital.showrooms.service4.name'), desc: t('leistungen.digital.showrooms.service4.desc') }
                    ].map((category, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Module 3: Ausstattung & Ambiente */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="ausstattung-ambiente" className="scroll-mt-20 space-y-8 sm:space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.ausstattung.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('leistungen.ausstattung.subtitle')}
              </p>
            </div>

            {/* Böden & Ausstattung Hero */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="lg:order-2 grid grid-cols-2 gap-4">
                <div className="col-span-2 group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img
                    src="/images/boeden/besprechungsraum-vinylboden-moebel.jpg"
                    alt={t('leistungen.ausstattung.boeden.alt1')}
                    width="800"
                    height="450"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                  <img
                    src="/images/boeden/holzboden-laminat-verlegung-raum.jpg"
                    alt={t('leistungen.ausstattung.boeden.alt2')}
                    width="400"
                    height="300"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                  <img
                    src="/images/boeden/kueche-hochglanz-marmor-led-beleuchtung.jpg"
                    alt={t('leistungen.ausstattung.boeden.alt3')}
                    width="400"
                    height="300"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                  <img
                    src="/images/boeden/kueche-hochglanz-holz-arbeitsplatte.jpg"
                    alt={t('leistungen.ausstattung.boeden.alt4')}
                    width="400"
                    height="300"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="lg:order-1">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Armchair className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{t('leistungen.ausstattung.boeden.title')}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  {t('leistungen.ausstattung.boeden.desc')}
                </p>
                <div className="bg-primary/5 rounded-lg p-4 md:p-6 mb-6">
                  <h4 className="font-semibold text-base md:text-lg mb-3">{t('leistungen.ausstattung.boeden.promiseTitle')}</h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {[
                      t('leistungen.ausstattung.boeden.b1'),
                      t('leistungen.ausstattung.boeden.b2'),
                      t('leistungen.ausstattung.boeden.b3'),
                      t('leistungen.ausstattung.boeden.b4'),
                      t('leistungen.ausstattung.boeden.b5'),
                      t('leistungen.ausstattung.boeden.b6')
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  {t('leistungen.ausstattung.boeden.cta')}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Flooring Types Section */}
            <div className="bg-muted/50 rounded-2xl p-6 md:p-8 lg:p-10">
              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{t('leistungen.ausstattung.flooring.title')}</h3>
                <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
                  {t('leistungen.ausstattung.flooring.subtitle')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: t('leistungen.ausstattung.flooring.type1.name'), desc: t('leistungen.ausstattung.flooring.type1.desc') },
                  { name: t('leistungen.ausstattung.flooring.type2.name'), desc: t('leistungen.ausstattung.flooring.type2.desc') },
                  { name: t('leistungen.ausstattung.flooring.type3.name'), desc: t('leistungen.ausstattung.flooring.type3.desc') },
                  { name: t('leistungen.ausstattung.flooring.type4.name'), desc: t('leistungen.ausstattung.flooring.type4.desc') }
                ].map((floor, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow text-center">
                    <p className="font-semibold text-base md:text-lg mb-2">{floor.name}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{floor.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('leistungen.ausstattung.flooring.calcPrefix')}{' '}
                  <button onClick={onOpenInquiry} className="text-primary font-semibold hover:underline">
                    {t('leistungen.ausstattung.flooring.calcLink')}
                  </button>
                </p>
              </div>
            </div>

            {/* Furniture & Equipment Section */}
            <div>
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">{t('leistungen.ausstattung.furniture.title')}</h3>
                  <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                    {t('leistungen.ausstattung.furniture.subtitle')}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: t('leistungen.ausstattung.furniture.card1.title'), desc: t('leistungen.ausstattung.furniture.card1.desc') },
                      { title: t('leistungen.ausstattung.furniture.card2.title'), desc: t('leistungen.ausstattung.furniture.card2.desc') },
                      { title: t('leistungen.ausstattung.furniture.card3.title'), desc: t('leistungen.ausstattung.furniture.card3.desc') },
                      { title: t('leistungen.ausstattung.furniture.card4.title'), desc: t('leistungen.ausstattung.furniture.card4.desc') }
                    ].map((item, index) => (
                      <div key={index} className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm md:text-base mb-1">{item.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8 lg:mt-0">
                  <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                    <img
                      src="/images/moebel/showroom-ausstellungsmoebel.svg"
                      alt={t('leistungen.ausstattung.furniture.alt1')}
                      width="800"
                      height="600"
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                    <img
                      src="/images/moebel/individuelles-display-regal-led.svg"
                      alt={t('leistungen.ausstattung.furniture.alt2')}
                      width="800"
                      height="600"
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transparente Kalkulation & Kostenersparnis */}
            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 lg:p-10">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('leistungen.ausstattung.kalkulation.title')}</h3>
                <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
                  {t('leistungen.ausstattung.kalkulation.desc')}
                </p>
                <div className="inline-flex items-center gap-4 bg-white rounded-xl p-6 shadow-lg">
                  <TrendUp className="h-10 w-10 text-primary shrink-0" weight="duotone" />
                  <div className="text-left">
                    <p className="font-bold text-xl md:text-2xl text-primary">{t('leistungen.ausstattung.kalkulation.saving')}</p>
                    <p className="text-sm text-muted-foreground">{t('leistungen.ausstattung.kalkulation.savingDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-10 text-center text-primary-foreground">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t('leistungen.ausstattung.cta.title')}
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                {t('leistungen.ausstattung.cta.desc')}
              </p>
              <Button
                size="lg"
                onClick={onOpenInquiry}
                className="bg-white text-primary hover:bg-white/90 min-h-[52px] text-base md:text-lg"
              >
                {t('leistungen.ausstattung.cta.button')}
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Methoden- & Qualitätsabschnitt */}
      <section className="py-12 sm:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="methodik" className="scroll-mt-20">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.methodik.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('leistungen.methodik.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Lightning, title: t('leistungen.methodik.card1.title'), desc: t('leistungen.methodik.card1.desc') },
                { icon: Crosshair, title: t('leistungen.methodik.card2.title'), desc: t('leistungen.methodik.card2.desc') },
                { icon: Package, title: t('leistungen.methodik.card3.title'), desc: t('leistungen.methodik.card3.desc') },
                { icon: ChatCircleDots, title: t('leistungen.methodik.card4.title'), desc: t('leistungen.methodik.card4.desc') },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-5 md:p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <h3 className="font-semibold text-base md:text-lg mb-2 leading-tight">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Erfolgsbilanz – inline integriert */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="erfolge" className="scroll-mt-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.erfolge.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('leistungen.erfolge.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alles aus einer Hand */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.allesauseinerhand.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('leistungen.allesauseinerhand.subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { title: t('leistungen.allesauseinerhand.card1.title'), desc: t('leistungen.allesauseinerhand.card1.desc') },
                { title: t('leistungen.allesauseinerhand.card2.title'), desc: t('leistungen.allesauseinerhand.card2.desc') },
                { title: t('leistungen.allesauseinerhand.card3.title'), desc: t('leistungen.allesauseinerhand.card3.desc') },
                { title: t('leistungen.allesauseinerhand.card4.title'), desc: t('leistungen.allesauseinerhand.card4.desc') },
                { title: t('leistungen.allesauseinerhand.card5.title'), desc: t('leistungen.allesauseinerhand.card5.desc') },
                { title: t('leistungen.allesauseinerhand.card6.title'), desc: t('leistungen.allesauseinerhand.card6.desc') }
              ].map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet: 3D Visualization When Commissioned */}
      <section id="lead-magnet" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <CubeTransparent className="h-10 w-10" weight="duotone" />
              <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('cta.free3d')}</h2>
            </div>
            <p className="text-base md:text-lg opacity-90 mb-6 md:mb-8 leading-relaxed">
              {t('cta.free3d.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onOpenInquiry} className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg font-semibold">
                {t('cta.free3d.button')}
                <ArrowRight className="ml-2" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm opacity-80">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" weight="fill" /> {t('cta.free3d.free')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" weight="fill" /> {t('cta.free3d.nonbinding')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" weight="fill" /> {t('cta.free3d.days')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section – Emotional, non-duplicating */}
      <section id="nachhaltigkeit-leistungen" className="py-12 sm:py-16 bg-green-50/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Emotional Intro */}
          <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <Leaf className="h-8 w-8 text-green-600" weight="duotone" />
              <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.sustainability.title')}</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('leistungen.sustainability.intro')}
            </p>
          </div>

          {/* Key-Anker Boxes */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10 md:mb-12">
            {[
              { icon: Truck, title: t('leistungen.sustainability.co2.title'), desc: t('leistungen.sustainability.co2.desc') },
              { icon: Recycle, title: t('leistungen.sustainability.systembau.title'), desc: t('leistungen.sustainability.systembau.desc') },
              { icon: Leaf, title: t('leistungen.sustainability.projekt.title'), desc: t('leistungen.sustainability.projekt.desc') },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 md:p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" weight="duotone" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2 leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Anecdote / Best Practice */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-green-200 p-6 md:p-8 mb-10 md:mb-12">
            <h3 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
              <TreeEvergreen className="h-6 w-6 text-green-600" weight="duotone" />
              {t('leistungen.sustainability.anecdote.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground text-sm md:text-base leading-relaxed">
              <p>{t('leistungen.sustainability.anecdote.text1')}</p>
              <p>{t('leistungen.sustainability.anecdote.text2')}</p>
            </div>
          </div>

          {/* Emotional CTA to Nachhaltigkeit page */}
          <div className="text-center">
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              {t('leistungen.sustainability.outro')}
            </p>
            <a
              href="#/nachhaltigkeit"
              onClick={(e) => { e.preventDefault(); window.location.hash = '/nachhaltigkeit' }}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors min-h-[48px] text-base"
            >
              {t('leistungen.sustainability.cta')}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Stand Calculator */}
      <StandCalculator onOpenInquiry={onOpenInquiry} />

      <InternalLinkSection
        title={t('leistungen.links.title')}
        links={[
          { label: t('leistungen.links.branchen.label'), description: t('leistungen.links.branchen.desc'), hash: '/branchen' },
          { label: t('leistungen.links.referenzen.label'), description: t('leistungen.links.referenzen.desc'), hash: '/referenzen' },
          { label: t('leistungen.links.ablauf.label'), description: t('leistungen.links.ablauf.desc'), hash: '/ablauf' },
          { label: t('leistungen.links.nachhaltigkeit.label'), description: t('leistungen.links.nachhaltigkeit.desc'), hash: '/nachhaltigkeit' },
          { label: t('leistungen.links.ueber.label'), description: t('leistungen.links.ueber.desc'), hash: '/ueber-uns' },
          { label: t('leistungen.links.kontakt.label'), description: t('leistungen.links.kontakt.desc'), hash: '/kontakt' },
        ]}
      />

      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-3 sm:mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('leistungen.bottomCta.title')}</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('leistungen.bottomCta.desc')}
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg">
            {t('leistungen.bottomCta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
