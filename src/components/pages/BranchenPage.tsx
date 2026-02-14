import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle, Leaf, Recycle, TreeEvergreen, Truck } from '@phosphor-icons/react'
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'
import { useEffect, useState } from 'react'
import { parseDeepLink } from '@/lib/deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { DEMO_REFERENCES } from '@/lib/demo-data'
import { CaseStudyCard } from '@/components/ui/CaseStudyCard'

interface BranchenPageProps {
  onOpenInquiry: () => void
}

export function BranchenPage({ onOpenInquiry }: BranchenPageProps) {
  const { scrollToSection } = useDeepLinking('/branchen')
  const [activeTab, setActiveTab] = useState<string>('food')
  
  useSectionObserver(['food', 'versicherungen', 'industrie'])

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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">Branchen-Expertise – Messebau für Food, Finance & Industrie</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            Spezialisiert auf die Anforderungen von Mittelständlern in Food, Versicherungen und Industrie. 
            Wir kennen Ihre Branche und wissen, worauf es ankommt.
          </p>
        </div>
      </section>

      <section id="branchen-content" className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 md:mb-12 h-auto">
              <TabsTrigger value="food" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">Food & Feinkost</span>
                <span className="sm:hidden">Food</span>
              </TabsTrigger>
              <TabsTrigger value="versicherungen" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">
                <span className="hidden sm:inline">Versicherungen</span>
                <span className="sm:hidden">Versich.</span>
              </TabsTrigger>
              <TabsTrigger value="industrie" className="text-xs sm:text-sm md:text-base py-2.5 md:py-3 px-2 md:px-4">Industrie</TabsTrigger>
            </TabsList>

            <TabsContent value="food" className="space-y-6 md:space-y-8" id="food">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Food & Feinkost</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    Ihre Produkte müssen schmecken UND gut aussehen. Wir schaffen Messestände, 
                    die Appetit machen und optimal für Verkostungen geeignet sind.
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      'Hygienische Verkostungsküchen',
                      'Ansprechende Produktpräsentation',
                      'Kühlung & Lagerung vor Ort',
                      'Hochwertige Beleuchtung für Lebensmittel',
                      'Lounge-Bereiche für Kundengespräche'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    Food-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop&fm=webp&q=75"
                    alt="Food Messestand"
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Referenzprojekte Food & Feinkost</h3>
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
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Versicherungen & Dienstleistungen</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    Vertrauen aufbauen durch professionelle Präsenz. Unsere Messestände für 
                    Versicherungen und Dienstleister vermitteln Seriosität und Kompetenz.
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      'Diskrete Beratungszonen',
                      'Moderne, vertrauensvolle Atmosphäre',
                      'Integrierte Technik für Präsentationen',
                      'Flexible Raumgestaltung',
                      'Barrierefreie Zugänge'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    Versicherungs-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden lg:order-1 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=800&fit=crop&fm=webp&q=75"
                    alt="Versicherungs Messestand"
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Referenzprojekte Versicherungen</h3>
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
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Industrie & Technik</h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                    Große Maschinen, komplexe Produkte – professionell präsentiert. 
                    Wir realisieren Messestände mit der nötigen Tragfähigkeit und technischen Infrastruktur.
                  </p>
                  <div className="space-y-2.5 md:space-y-3 mb-6">
                    {[
                      'Tragfähige Konstruktionen für schwere Exponate',
                      'Integrierte Stromanschlüsse & Medientechnik',
                      'Industrieller, hochwertiger Look',
                      'Interaktive Produktkonfiguratoren',
                      'Separate Besprechungsräume'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                    Industrie-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="group aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop&fm=webp&q=75"
                    alt="Industrie Messestand"
                    width="800"
                    height="800"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Referenzprojekte Industrie</h3>
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Warum Branchen-Expertise zählt</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Jede Branche hat spezifische Anforderungen. Wir kennen sie und setzen sie um.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Zielgruppengerechte Konzepte',
                desc: 'Wir wissen, was Ihre Messebesucher erwarten und gestalten entsprechend.'
              },
              {
                title: 'Technisches Know-how',
                desc: 'Von Kühltechnik bis Schwerlast – wir kennen die technischen Anforderungen.'
              },
              {
                title: 'Branchenspezifische Partner',
                desc: 'Unser Netzwerk umfasst Spezialisten für jede Branche.'
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
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">Nachhaltiger Messebau für jede Branche</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Umweltbewusster Messeauftritt – ohne Kompromisse bei Qualität und Wirkung.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Recycle, title: 'Wiederverwendbare Systeme', desc: 'Modulare Stände, die mehrfach eingesetzt werden – spart bis zu 60 % Material.' },
              { icon: TreeEvergreen, title: 'Nachhaltige Materialien', desc: 'FSC-Holz, LED-Beleuchtung und recycelbare Werkstoffe als Standard.' },
              { icon: Truck, title: 'Effiziente Logistik', desc: 'Regionale Partner, gebündelte Transporte und CO₂-optimierte Planung.' },
              { icon: Leaf, title: 'Kosteneinsparung', desc: 'Nachhaltige Systeme amortisieren sich ab der 2. Messe deutlich.' },
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
        title="Weiterführende Informationen"
        links={[
          { label: 'Leistungen im Detail', description: 'Messebau, Eventbau, Showrooms & Brand Spaces – alle Leistungen.', hash: '/leistungen' },
          { label: 'Referenzen ansehen', description: 'Erfolgreiche Messebau-Projekte aus Food, Finance & Industrie.', hash: '/referenzen' },
          { label: 'Unser Ablauf', description: 'Vom Erstgespräch bis zum fertigen Messestand.', hash: '/ablauf' },
          { label: 'Nachhaltiger Messebau', description: 'Systembau mit Wiederverwendung – für umweltbewusste Auftritte.', hash: '/nachhaltigkeit' },
          { label: 'Über S&S Messebau', description: 'Inhabergeführt, persönlich, bundesweit.', hash: '/ueber-uns' },
          { label: 'Kontakt aufnehmen', description: '48h-Angebot mit 3D-Visualisierung – jetzt anfragen.', hash: '/kontakt' },
        ]}
      />
    </div>
  )
}
