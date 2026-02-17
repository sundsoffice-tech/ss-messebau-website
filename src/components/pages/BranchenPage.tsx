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
import { DEMO_REFERENCES } from '@/lib/demo-data'
import { CaseStudyCard } from '@/components/ui/CaseStudyCard'
import { useTranslation } from '@/lib/i18n'

interface BranchenPageProps {
  onOpenInquiry: () => void
}

export function BranchenPage({ onOpenInquiry }: BranchenPageProps) {
  const { scrollToSection } = useDeepLinking('/branchen')
  const [activeTab, setActiveTab] = useState<string>('food')
  const { t } = useTranslation()
  
  useSectionObserver(['food', 'versicherungen', 'industrie'])
  useScrollDepthTracking('branchen')
  useDwellTimeTracking('branchen')

  useEffect(() => {
    const deepLink = parseDeepLink(window.location.hash)
    if (deepLink.section && ['food', 'versicherungen', 'industrie'].includes(deepLink.section)) {
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
      <section id="branchen-hero" className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">{t('branchen.hero.title')}</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            {t('branchen.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="branchen-content" className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 md:mb-12 h-auto">
              <TabsTrigger value="food" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">{t('branchen.tab.food')}</span>
                <span className="sm:hidden">{t('branchen.tab.foodShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="versicherungen" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">{t('branchen.tab.insurance')}</span>
                <span className="sm:hidden">{t('branchen.tab.insuranceShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="industrie" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">{t('branchen.tab.industry')}</TabsTrigger>
            </TabsList>

            <TabsContent value="food" className="space-y-6 md:space-y-8" id="food">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">{t('branchen.food.title')}</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    {t('branchen.food.desc')}
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      t('branchen.food.b1'),
                      t('branchen.food.b2'),
                      t('branchen.food.b3'),
                      t('branchen.food.b4'),
                      t('branchen.food.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_food'); onOpenInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.food.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/deligreece-messestand-100qm-food.jpeg"
                    alt={t('branchen.food.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('branchen.food.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'food').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                      messe={ref.messe}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versicherungen" className="space-y-6 md:space-y-8" id="versicherungen">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="lg:order-2">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">{t('branchen.insurance.title')}</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    {t('branchen.insurance.desc')}
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      t('branchen.insurance.b1'),
                      t('branchen.insurance.b2'),
                      t('branchen.insurance.b3'),
                      t('branchen.insurance.b4'),
                      t('branchen.insurance.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_versicherungen'); onOpenInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.insurance.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden lg:order-1 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/fda8df74-ab46-44c7-a6ca-ebfc6c9b4850.jpeg"
                    alt="Messestand Stylee – Premium Design-Stand für Finanz- und Versicherungsbranche"
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('branchen.insurance.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'versicherungen').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                      messe={ref.messe}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="industrie" className="space-y-6 md:space-y-8" id="industrie">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">{t('branchen.industry.title')}</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    {t('branchen.industry.desc')}
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      t('branchen.industry.b1'),
                      t('branchen.industry.b2'),
                      t('branchen.industry.b3'),
                      t('branchen.industry.b4'),
                      t('branchen.industry.b5')
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => { trackHeroCTAClick('branchen_industrie'); onOpenInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    {t('branchen.industry.cta')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="/images/1a5f3965-6bc4-478c-95e1-a97df5fec326.jpeg"
                    alt={t('branchen.industry.alt')}
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('branchen.industry.refTitle')}</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DEMO_REFERENCES.filter(r => r.branche === 'industrie').slice(0, 2).map((ref) => (
                    <CaseStudyCard
                      key={ref.id}
                      title={ref.title}
                      challenge={ref.challenge}
                      solution={ref.solution}
                      result={ref.result}
                      imageUrl={ref.imageUrl}
                      branche={ref.branche}
                      size={ref.size}
                      messe={ref.messe}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">{t('branchen.expertise.title')}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('branchen.expertise.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                <CardContent className="p-5 md:p-6 text-center">
                  <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 leading-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="nachhaltigkeit-branchen" className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <Leaf className="h-8 w-8 text-green-600" weight="duotone" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{t('sustainability.branchen.title')}</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
                  <CardContent className="p-5 md:p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" weight="duotone" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2 leading-tight">{item.title}</h3>
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
