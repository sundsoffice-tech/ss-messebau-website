import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle, Leaf, Recycle, TreeEvergreen, Truck } from '@phosphor-icons/react'
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'
import { useEffect, useState } from 'react'
import { trackHeroCTAClick } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking } from '@/hooks/use-analytics'
import { parseDeepLink } from '@/lib/deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { DEMO_REFERENCES } from '@/lib/demo-references'
import { CaseStudyCard } from '@/components/ui/CaseStudyCard'
import { useTranslation } from '@/lib/i18n'
import { useUIStore } from '@/store/ui-store'

export function BranchenPage() {
  const { openInquiry } = useUIStore()
  const { scrollToSection } = useDeepLinking('/branchen')
  const [activeTab, setActiveTab] = useState<string>('messebau')
  const { t } = useTranslation()
  
  useSectionObserver(['messebau', 'eventbau', 'ladenbau', 'sport'])
  useScrollDepthTracking('branchen')
  useDwellTimeTracking('branchen')

  useEffect(() => {
    const deepLink = parseDeepLink()
    if (deepLink.section && ['messebau', 'eventbau', 'ladenbau', 'sport'].includes(deepLink.section)) {
      setActiveTab(deepLink.section)
      setTimeout(() => {
        if (deepLink.section) {
          scrollToSection(deepLink.section)
        }
      }, 100)
    }
  }, [scrollToSection])

  return (
    <div>
      <section id="branchen-hero" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">{t('branchen.hero.title')}</h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            {t('branchen.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="branchen-content" className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 sm:mb-12 h-auto">
              <TabsTrigger value="messebau" className="text-xs sm:text-sm sm:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">{t('branchen.tab.messebau')}</span>
                <span className="sm:hidden">{t('branchen.tab.messebauShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="eventbau" className="text-xs sm:text-sm sm:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">{t('branchen.tab.eventbau')}</span>
                <span className="sm:hidden">{t('branchen.tab.eventbauShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="ladenbau" className="text-xs sm:text-sm sm:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">{t('branchen.tab.ladenbau')}</span>
                <span className="sm:hidden">{t('branchen.tab.ladenbauShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="sport" className="text-xs sm:text-sm sm:text-base py-2.5 md:py-3 px-2 md:px-4">
                {t('branchen.tab.sport')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messebau" className="space-y-6 sm:space-y-8" id="messebau">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">{t('branchen.messebau.title')}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {t('branchen.messebau.desc')}
                  </p>
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {[
                      t('branchen.messebau.b1'),
                      t('branchen.messebau.b2'),
                      t('branchen.messebau.b3'),
                      t('branchen.messebau.b4'),
                      t('branchen.messebau.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_messebau'); openInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.messebau.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/deligreece-messestand-100qm-food.jpeg"
                    alt={t('branchen.messebau.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('branchen.messebau.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'messebau').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="eventbau" className="space-y-6 sm:space-y-8" id="eventbau">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="lg:order-2">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">{t('branchen.eventbau.title')}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {t('branchen.eventbau.desc')}
                  </p>
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {[
                      t('branchen.eventbau.b1'),
                      t('branchen.eventbau.b2'),
                      t('branchen.eventbau.b3'),
                      t('branchen.eventbau.b4'),
                      t('branchen.eventbau.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_eventbau'); openInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.eventbau.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden lg:order-1 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/e859a873-049d-4f2b-9156-0ac94939c636.jpeg"
                    alt={t('branchen.eventbau.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('branchen.eventbau.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'eventbau').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ladenbau" className="space-y-6 sm:space-y-8" id="ladenbau">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">{t('branchen.ladenbau.title')}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {t('branchen.ladenbau.desc')}
                  </p>
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {[
                      t('branchen.ladenbau.b1'),
                      t('branchen.ladenbau.b2'),
                      t('branchen.ladenbau.b3'),
                      t('branchen.ladenbau.b4'),
                      t('branchen.ladenbau.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_ladenbau'); openInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.ladenbau.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg"
                    alt={t('branchen.ladenbau.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('branchen.ladenbau.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'ladenbau').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sport" className="space-y-6 sm:space-y-8" id="sport">
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="lg:order-2">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">{t('branchen.sport.title')}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {t('branchen.sport.desc')}
                  </p>
                  <div className="space-y-2.5 sm:space-y-3 mb-6">
                    {[
                      t('branchen.sport.b1'),
                      t('branchen.sport.b2'),
                      t('branchen.sport.b3'),
                      t('branchen.sport.b4'),
                      t('branchen.sport.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_sport'); openInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.sport.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden lg:order-1 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/980a1068-ecee-48de-86a3-8635874252e4.jpeg"
                    alt={t('branchen.sport.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 sm:mt-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('branchen.sport.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'sport').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{t('branchen.expertise.title')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('branchen.expertise.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: t('branchen.expertise.concept.title'),
                desc: t('branchen.expertise.concept.desc')
              },
              {
                title: t('branchen.expertise.knowhow.title'),
                desc: t('branchen.expertise.knowhow.desc')
              },
              {
                title: t('branchen.expertise.partners.title'),
                desc: t('branchen.expertise.partners.desc')
              }
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-5 sm:p-6 text-center">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 leading-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="nachhaltigkeit-branchen" className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <Leaf className="h-8 w-8 text-green-600" weight="duotone" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{t('sustainability.branchen.title')}</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('sustainability.branchen.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Recycle, title: t('sustainability.reuse'), desc: t('sustainability.branchen.reuse.desc') },
              { icon: TreeEvergreen, title: t('sustainability.materials'), desc: t('sustainability.branchen.materials.desc') },
              { icon: Truck, title: t('sustainability.logistics'), desc: t('sustainability.branchen.logistics.desc') },
              { icon: Leaf, title: t('sustainability.savings'), desc: t('sustainability.branchen.savings.desc') },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index}>
                  <CardContent className="p-5 sm:p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" weight="duotone" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <InternalLinkSection
        title={t('branchen.links.title')}
        links={[
          { label: t('branchen.links.services.label'), description: t('branchen.links.services.desc'), hash: '/leistungen' },
          { label: t('branchen.links.references.label'), description: t('branchen.links.references.desc'), hash: '/referenzen' },
          { label: t('branchen.links.process.label'), description: t('branchen.links.process.desc'), hash: '/ablauf' },
          { label: t('branchen.links.sustainability.label'), description: t('branchen.links.sustainability.desc'), hash: '/nachhaltigkeit' },
          { label: t('branchen.links.about.label'), description: t('branchen.links.about.desc'), hash: '/ueber-uns' },
          { label: t('branchen.links.contact.label'), description: t('branchen.links.contact.desc'), hash: '/kontakt' },
        ]}
      />
    </div>
  )
}
