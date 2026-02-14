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
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">Wir schaffen Räume, die Ihre Marke verkaufen.</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            S&S Messebau – Ihre Erlebnis-Architekten. Wir sind nicht einfach Standbauer, sondern strategische Partner
            für Markenräume, die begeistern, überzeugen und verkaufen. Von der Messe über den Showroom bis zum Event.
          </p>
        </div>
      </section>

      {/* Solution Module 1: Brand Activation */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="brand-activation" className="scroll-mt-20 space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Brand Activation</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                So aktiviert S&S Ihre Marke auf Messen und Events – mit Messeständen, Bühnenbauten und skalierbaren Touren-Paketen.
              </p>
            </div>

            {/* Messebau */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Warehouse className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Messebau</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Professionelle Messestände von 20 bis 200 qm für Messen bundesweit und international.
                  Ob Systemstand oder individuelle Konstruktion – wir realisieren Ihren perfekten Messeauftritt.
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    'Konzeption & 3D-Design',
                    'Produktion & Bau',
                    'Logistik & Transport',
                    'Auf- und Abbau vor Ort',
                    'Lagerung für Wiederverwendung'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Messestand anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Unser Messebau-Ablauf</h4>
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { step: '1', title: 'Beratung & Konzept', desc: 'Wir analysieren Ihre Anforderungen und entwickeln erste Ideen' },
                      { step: '2', title: 'Design & Planung', desc: 'Konzeptentwicklung, Materialauswahl, technische Planung' },
                      { step: '3', title: 'Produktion', desc: 'Hochwertige Fertigung in unseren Partnerwerkstätten' },
                      { step: '4', title: 'Aufbau & Betreuung', desc: 'Pünktlicher Aufbau, technischer Support während der Messe' }
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
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Event-Typ-Beispiele</h4>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      'Firmenjubiläen & Galas',
                      'Produktpräsentationen',
                      'Konferenzen & Tagungen',
                      'Outdoor-Events & Festivals',
                      'Pop-Up-Stores'
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
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Eventbau & Bühnen</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Beeindruckende Event-Inszenierungen: Von Bühnenbauten über Präsentationsflächen bis zu kompletten Event-Ausstattungen.
                  Wir machen Ihre Veranstaltung zum unvergesslichen Erlebnis.
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    'Bühnenbau & Podeste',
                    'Event-Architektur',
                    'Licht- und Tontechnik-Integration',
                    'Dekoration & Ausstattung',
                    'Sicherheitskonzepte'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Event planen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Touren */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Touren & wiederkehrende Messeauftritte</h3>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Sie bestreiten mehrere kleinere Messen pro Jahr oder führen Roadshows durch? Wir bieten Ihnen skalierbare, wiederverwendbare Systemlösungen, die zentral ab NRW koordiniert werden.
                </p>
                <h4 className="text-xl font-semibold mb-4">Ihre Vorteile:</h4>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    'Zentrale Logistik ab NRW – kurze Wege, schnelle Reaktionszeiten',
                    'Modulare Systemstände für flexible Standgrößen',
                    'Wiederverwendbare Komponenten senken Ihre Kosten',
                    'Kostenoptimierte Routen- und Transportplanung',
                    'Bundesweite Verfügbarkeit für DACH-Region'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Touren-Paket anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Beispiel-Pakete für Touren</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Starter-Tour', desc: '3×3m Systemstand, 5 Messen/Jahr', price: 'ab 12.500€/Jahr' },
                      { name: 'Professional-Tour', desc: '5×3m Systemstand, 10 Messen/Jahr', price: 'ab 22.000€/Jahr' },
                      { name: 'Enterprise-Tour', desc: 'Individuelle Lösungen für große Roadshows', price: 'auf Anfrage' }
                    ].map((pkg, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <p className="font-semibold">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                        <p className="text-sm font-semibold text-primary mt-1">{pkg.price}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Preise inkl. Logistik und Aufbau, zzgl. MwSt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Module 2: Tech & Data Experience */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="digital-experience" className="scroll-mt-20 space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <Sparkle className="h-5 w-5 text-primary" weight="fill" />
                <span className="text-sm font-semibold text-primary">Innovation & Präzision</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Tech & Data Experience</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Bei S&S ist digitale Erlebnisarchitektur selbstverständlich. Wir kombinieren modernste Technologien mit präzisem Handwerk – 
                für mehr Sichtbarkeit, messbare Erfolge und unvergessliche Markenerlebnisse.
              </p>
            </div>

            {/* AR/VR & Virtual Trade Show Tours */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Cube className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">AR/VR & Virtuelle Standbegehung</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Erleben Sie Ihren Messestand schon vor dem ersten Aufbau. Mit Virtual Reality und Augmented Reality 
                  visualisieren wir Ihr Konzept und ermöglichen virtuelle Standbegehungen – für optimale Planungssicherheit.
                </p>
                <div className="bg-primary/5 rounded-lg p-4 md:p-6 mb-6">
                  <h4 className="font-semibold text-base md:text-lg mb-3">Unsere VR/AR Leistungen</h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {[
                      'VR-Showrooms für immersive Produktpräsentationen',
                      'Virtuelle Standbegehung vor der Messe',
                      'AR-Produktvisualisierung direkt am Stand',
                      '360°-Touren für Remote-Teilnehmer',
                      'Digitale Zwillinge Ihrer Messestände',
                      'Interaktive 3D-Konfiguration in Echtzeit'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">💡 Use Case: VR-Showroom für internationales Publikum</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ein Technologie-Unternehmen konnte durch unseren VR-Showroom seine Produktpalette bereits vor Messebeginn 
                    weltweit präsentieren. Ergebnis: 40% mehr qualifizierte Leads und messbar höhere Besucherzahlen am physischen Stand.
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  VR/AR-Lösung anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Ihr Weg zur digitalen Präsenz</h4>
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { step: '1', title: '3D-Modellierung', desc: 'Wir erstellen ein detailgetreues 3D-Modell Ihres Stands' },
                      { step: '2', title: 'VR-Integration', desc: 'Umwandlung in eine begehbare Virtual-Reality-Erfahrung' },
                      { step: '3', title: 'Testing & Freigabe', desc: 'Sie testen und optimieren vor der physischen Umsetzung' },
                      { step: '4', title: 'Live-Einsatz', desc: 'VR-Station am Stand oder als Remote-Erlebnis' }
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
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Besuchertracking & Analytics</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Machen Sie Ihren Messeerfolg messbar. Mit intelligenten Tracking-Systemen analysieren wir Besucherströme, 
                  Verweildauer und Interaktionspunkte – für datenbasierte Optimierung und ROI-Nachweise.
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    'Heatmaps: Wo halten sich Besucher am längsten auf?',
                    'Besucherzählung & demografische Analyse',
                    'Interaktionsrate an digitalen Touchpoints',
                    'Lead-Qualifizierung durch Verhaltensanalyse',
                    'Live-Dashboards während der Messe',
                    'Post-Event Reports mit Handlungsempfehlungen'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">📊 Use Case: Heatmap-Analyse optimiert Standlayout</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ein Automobilzulieferer nutzte unsere Heatmap-Analyse und stellte fest, dass 70% der Besucher die linke 
                    Standhälfte ignorierten. Nach Layout-Anpassung: +55% mehr Interaktionen und 30% höhere Lead-Conversion.
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Analytics-Lösung anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card className="lg:order-1 mt-8 lg:mt-0">
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Messbare Erfolge</h4>
                  <div className="space-y-4">
                    {[
                      { metric: 'Besucherströme', desc: 'Erfassen Sie, wie Besucher durch Ihren Stand navigieren', icon: Eye },
                      { metric: 'Verweildauer', desc: 'Messen Sie die Aufmerksamkeitsspanne pro Zone', icon: TrendUp },
                      { metric: 'Hot Zones', desc: 'Identifizieren Sie die beliebtesten Bereiche', icon: Crosshair },
                      { metric: 'Conversion-Pfade', desc: 'Verstehen Sie den Weg vom Besucher zum Lead', icon: Lightning }
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
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Interaktive Präsentationstechnik</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Von Touchscreens über Videowalls bis zu KI-gestützten Assistenten – wir integrieren modernste 
                  Präsentationstechnik nahtlos in Ihr Standkonzept.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { title: 'Touchscreen-Terminals', desc: 'Interaktive Produktkataloge & Konfiguratoren' },
                    { title: 'LED-Videowalls', desc: 'Großformatige Displays für maximale Aufmerksamkeit' },
                    { title: 'KI-Chatbots', desc: 'Digitale Assistenten für Erstberatung' },
                    { title: 'Live-Produktdemos', desc: 'Integrierte Präsentationssysteme' }
                  ].map((item, index) => (
                    <div key={index} className="bg-primary/5 p-4 rounded-lg">
                      <p className="font-semibold text-sm md:text-base mb-1">{item.title}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6 rounded">
                  <p className="text-sm md:text-base font-semibold mb-2 text-accent">🤖 Use Case: KI-Produktberater steigert Qualifizierung</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ein B2B-Software-Anbieter setzte unseren KI-Chatbot ein, der Besucherfragen vorqualifizierte. 
                    Das Vertriebsteam konnte sich auf hochwertige Gespräche fokussieren – Effizienz +65%.
                  </p>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Interaktive Technik anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <div className="space-y-6 mt-8 lg:mt-0">
                <Card>
                  <CardContent className="p-5 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-8 w-8 text-primary" weight="bold" />
                      <h4 className="text-lg md:text-xl font-semibold">Smart Stand Lösungen</h4>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                      IoT-vernetzte Stände mit intelligenter Steuerung von Licht, Klima und Content – 
                      für ein perfekt orchestriertes Markenerlebnis.
                    </p>
                    <div className="space-y-2.5">
                      {[
                        'Automatische Beleuchtungsanpassung',
                        'Content-Management-Systeme',
                        'Sensor-gesteuerte Interaktionen',
                        'Zentrale Steuerung aller Systeme'
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
                  <h4 className="font-bold text-lg mb-2">Innovation als Standard</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Bei S&S Messebau ist digitale Exzellenz kein Aufpreis, sondern fester Bestandteil unserer DNA. 
                    Wir denken digital first – für messbare Erfolge und zukunftssichere Markenräume.
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
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Showrooms & Brand Spaces</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Permanente Markenräume mit digitaler Integration – vom klassischen Showroom bis zum vollvernetzten Brand Space.
                </p>
                <div className="space-y-2.5 md:space-y-3 mb-6">
                  {[
                    'Showrooms mit integrierter Digital-Experience',
                    'Interaktive Produktpräsentationen',
                    'Smart Lighting & automatisierte Szenarien',
                    'Content-Management für wechselnde Inhalte',
                    'Analytics für Showroom-Besucher'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 md:gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Showroom-Projekt anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-5 md:p-8">
                  <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Unsere Ausbau-Leistungen</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Shop-Ausbau', desc: 'Verkaufsflächen mit digitaler Integration' },
                      { name: 'Büro-Ausbau', desc: 'Smart Office Lösungen & Akustikkonzepte' },
                      { name: 'Showroom-Gestaltung', desc: 'Interaktive Produktpräsentationen' },
                      { name: 'Brand Spaces', desc: 'Vollvernetzte Markenerlebnisräume' }
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
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="ausstattung-ambiente" className="scroll-mt-20 space-y-12 md:space-y-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Ausstattung & Ambiente</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Das richtige Ambiente verkauft die Marke. Böden, Möbel und Technik – perfekt aufeinander abgestimmt für Ihren Markenraum.
              </p>
            </div>

            {/* Böden & Ausstattung Hero */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="lg:order-2 grid grid-cols-2 gap-4">
                <div className="col-span-2 group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
                  <img
                    src="/images/boeden/besprechungsraum-vinylboden-moebel.jpg"
                    alt="Besprechungsraum mit modernem Vinylboden und hochwertigen Möbeln – Komplettausstattung von S&S Messebau"
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
                    alt="Professionell verlegter Holz-Laminatboden in modernem Raum"
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
                    alt="Moderne Küche mit Hochglanz-Fronten, Marmor-Rückwand und hochwertigem Fliesenboden"
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
                    alt="Einbauküche mit weißen Hochglanz-Fronten, dunkler Holz-Arbeitsplatte und modernem Fliesenboden"
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
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">Böden & Ausstattung</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Die perfekte Ergänzung für jeden Stand: Hochwertige Messeböden (Teppich, Vinyl, Parkett),
                  stilvolle Möblierung, professionelle Beleuchtung und moderne Technik. Von Messeständen
                  bis zu kompletten Küchen- und Raumausstattungen – wir liefern die Komplettlösung.
                </p>
                <div className="bg-primary/5 rounded-lg p-4 md:p-6 mb-6">
                  <h4 className="font-semibold text-base md:text-lg mb-3">Unser Versprechen</h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {[
                      'Messeboden-Systeme (Teppich, Vinyl, Parkett)',
                      'Komplette Küchen- und Raumausstattungen',
                      'Lounge-Möbel & Sitzgruppen',
                      'Theken & Empfangsbereiche',
                      'LED-Beleuchtungskonzepte',
                      'Multimedia & Präsentationstechnik'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="text-sm md:text-base leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                  Ausstattung anfragen
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Flooring Types Section */}
            <div className="bg-muted/50 rounded-2xl p-6 md:p-8 lg:p-10">
              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Premium Messeboden-Systeme</h3>
                <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
                  Wählen Sie aus verschiedenen hochwertigen Bodenbelägen – perfekt abgestimmt auf Ihr Standkonzept,
                  Ihre Branche und Ihr Budget.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Vinyl-Bodenbelag',
                    desc: 'Modern, pflegeleicht und in vielen Designs erhältlich. Perfekt für hochfrequentierte Messestände.',
                    features: ['Wasserabweisend', 'Rutschfest', 'Echtholz-Optik', 'Schnelle Verlegung'],
                    price: 'ab 35€/qm'
                  },
                  {
                    name: 'Messebau-Teppich',
                    desc: 'Klassisch und bewährt. Schallabsorbierend und in allen Farben verfügbar.',
                    features: ['Große Farbauswahl', 'Weiche Haptik', 'Schalldämmend', 'Wirtschaftlich'],
                    price: 'ab 18€/qm'
                  },
                  {
                    name: 'Klick-Parkett',
                    desc: 'Hochwertige Holzoptik für Premium-Stände. Wiederverwendbar und nachhaltig.',
                    features: ['Edle Optik', 'Wiederverwendbar', 'Robust', 'Natürlich'],
                    price: 'ab 45€/qm'
                  },
                  {
                    name: 'Design-Laminat',
                    desc: 'Vielseitig und strapazierfähig. Ideal für moderne Standkonzepte.',
                    features: ['Kratzfest', 'Viele Designs', 'Pflegeleicht', 'Langlebig'],
                    price: 'ab 28€/qm'
                  }
                ].map((floor, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{floor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{floor.desc}</p>
                      <div className="space-y-2">
                        {floor.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" weight="fill" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-sm font-semibold text-primary">{floor.price}</p>
                        <p className="text-xs text-muted-foreground">inkl. Verlegung & Unterkonstruktion</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Preise verstehen sich zzgl. MwSt. Individuelle Angebote auf Anfrage.
                </p>
              </div>
            </div>

            {/* Furniture & Equipment Section */}
            <div>
              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Hochwertige Möblierung & Technik</h3>
                <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
                  Von der stilvollen Lounge-Ecke bis zur beleuchteten Produktpräsentation –
                  wir statten Ihren Stand komplett aus.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                {[
                  {
                    title: 'Lounge-Möbel & Sitzgruppen',
                    desc: 'Komfortable Sofas, Sessel und Couchtische für entspannte Kundengespräche',
                    items: ['Designer-Sofas', 'Lounge-Sessel', 'Stehtische', 'Besprechungstische']
                  },
                  {
                    title: 'Theken & Empfangsbereiche',
                    desc: 'Repräsentative Empfangstheken mit integrierter Beleuchtung und Stauraum',
                    items: ['LED-Theken', 'Info-Counter', 'Bar-Lösungen', 'Modulare Systeme']
                  },
                  {
                    title: 'Präsentations-Möbel',
                    desc: 'Vitrinen, Regale und Display-Systeme für perfekte Produktinszenierung',
                    items: ['Glasvitrinen', 'Wandregale', 'Produktdisplays', 'LED-Beleuchtung']
                  }
                ].map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {category.desc}
                      </p>
                      <div className="space-y-2">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" weight="fill" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Gallery */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                  <img
                    src="/images/moebel/showroom-ausstellungsmoebel.svg"
                    alt="Professioneller Showroom mit Ausstellungsmöbeln und Bodenproben – Möbelbau von S&S Messebau"
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
                    alt="Maßgefertigtes Display-Regal mit LED-Beleuchtung – individueller Möbelbau von S&S Messebau"
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Technical Equipment Section */}
            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 lg:p-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Technik & Beleuchtung</h3>
                  <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                    Professionelle Beleuchtungskonzepte und moderne Präsentationstechnik setzen
                    Ihre Produkte perfekt in Szene und schaffen die richtige Atmosphäre.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      'LED-Strahler & Spots',
                      'Akzentbeleuchtung',
                      'Displays & Monitore',
                      'Sound-Systeme',
                      'Interaktive Terminals',
                      'Video-Walls'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2.5 md:gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span className="text-sm md:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="font-semibold text-lg mb-4">Beliebte Ausstattungs-Pakete</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Basis-Paket', items: 'Boden, Grundmöblierung, Basis-Beleuchtung', price: 'ab 2.500€' },
                      { name: 'Komfort-Paket', items: 'Boden, Lounge-Möbel, LED-Konzept, Display', price: 'ab 5.000€' },
                      { name: 'Premium-Paket', items: 'Alles inklusive + Multimedia & Sonderanfertigungen', price: 'ab 8.500€' }
                    ].map((pkg, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <p className="font-semibold">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">{pkg.items}</p>
                        <p className="text-sm font-semibold text-primary mt-1">{pkg.price}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Preise für 50 qm Stand, zzgl. MwSt. und Logistik
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-10 text-center text-primary-foreground">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Bereit für die perfekte Stand-Ausstattung?
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                Lassen Sie uns gemeinsam die ideale Boden- und Möblierungslösung für Ihren Messestand entwickeln.
              </p>
              <Button
                size="lg"
                onClick={onOpenInquiry}
                className="bg-white text-primary hover:bg-white/90 min-h-[52px] text-base md:text-lg"
              >
                Jetzt Ausstattung planen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Methoden- & Qualitätsabschnitt */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="methodik" className="scroll-mt-20">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Der S&S-Ansatz: Methodik trifft Leidenschaft</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Vier Prinzipien, die jeden unserer Markenräume prägen.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Lightning, title: 'Flexibilität', desc: 'Keine Schablone – jeder Markenraum wird individuell auf Ihre Ziele zugeschnitten.' },
                { icon: Crosshair, title: 'Präzision', desc: 'Millimetergenau geplant und gebaut – von der 3D-Visualisierung bis zur Endabnahme.' },
                { icon: Package, title: 'Modularität', desc: 'Wiederverwendbare Systeme, die sich anpassen – skalierbar von 20 bis 200 m².' },
                { icon: ChatCircleDots, title: 'Beratung', desc: 'Persönliche Ansprechpartner, die Ihr Projekt von A bis Z begleiten.' },
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

      {/* Erfolgskacheln / Story-Kacheln */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="erfolge" className="scroll-mt-20">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Unsere Erfolgsbilanz</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Zahlen, die für sich sprechen – und für die Qualität unserer Arbeit.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { metric: '120+ Messeprojekte', desc: 'Erfolgreich realisiert in DACH, Skandinavien und Benelux.' },
                { metric: '98% Kundenzufriedenheit', desc: 'Gemessen an Wiederbuchungsquote und Kundenfeedback.' },
                { metric: 'Ø 30% Kostenersparnis', desc: 'Durch modulare Systeme und intelligente Wiederverwendung.' },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 md:p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4">
                      <TrendUp className="h-6 w-6 text-primary" weight="duotone" />
                    </div>
                    <p className="font-bold text-xl md:text-2xl mb-2 leading-tight text-primary">{item.metric}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alles aus einer Hand */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Alles aus einer Hand</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Mit S&S Messebau haben Sie einen Ansprechpartner für alle Gewerke.
                Das spart Abstimmungsaufwand und garantiert reibungslose Abläufe.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { title: 'Konzeption & Design', desc: 'Individuelle Entwürfe und Konzeptentwicklung für Ihren Stand' },
                { title: 'Produktion & Bau', desc: 'Hochwertige Verarbeitung durch erfahrene Partner' },
                { title: 'Logistik', desc: 'Bundesweiter Transport und termingerechte Anlieferung' },
                { title: 'Auf- & Abbau', desc: 'Professionelles Team kümmert sich vor Ort um alles' },
                { title: 'Lagerung', desc: 'Sichere Einlagerung für Wiederverwendung bei Folgemessen' },
                { title: 'Service vor Ort', desc: 'Technischer Support während der gesamten Messezeit' }
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
      <section id="lead-magnet" className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <CubeTransparent className="h-10 w-10" weight="duotone" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{t('cta.free3d')}</h2>
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
      <section id="nachhaltigkeit-leistungen" className="py-12 md:py-16 bg-green-50/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Emotional Intro */}
          <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <Leaf className="h-8 w-8 text-green-600" weight="duotone" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{t('leistungen.sustainability.title')}</h2>
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
        title="Mehr erfahren"
        links={[
          { label: 'Branchen-Expertise', description: 'Messebau für Food, Finance & Industrie – mit Branchenkenntnis.', hash: '/branchen' },
          { label: 'Referenzen ansehen', description: 'Realisierte Messebau-Projekte von 20–200 m² im Überblick.', hash: '/referenzen' },
          { label: 'Unser Ablauf', description: 'Vom Erstgespräch bis zum Abbau – so arbeiten wir.', hash: '/ablauf' },
          { label: 'Nachhaltiger Messebau', description: 'Systembau und Wiederverwendung für umweltbewusste Auftritte.', hash: '/nachhaltigkeit' },
          { label: 'Über S&S Messebau', description: 'Inhabergeführt, persönlich, bundesweit – lernen Sie uns kennen.', hash: '/ueber-uns' },
          { label: 'Kontakt aufnehmen', description: '48h-Angebot mit persönlicher Beratung anfordern.', hash: '/kontakt' },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">Interessiert? Lassen Sie uns sprechen.</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Beschreiben Sie uns Ihr Projekt und wir erstellen Ihnen ein individuelles Angebot.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg">
            Unverbindliches Angebot einholen
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
