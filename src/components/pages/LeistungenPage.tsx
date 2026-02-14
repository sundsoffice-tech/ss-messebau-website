import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Warehouse, CalendarDot, Storefront, Armchair, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { useSectionObserver } from '@/hooks/use-deep-linking'

interface LeistungenPageProps {
  onOpenInquiry: () => void
}

export function LeistungenPage({ onOpenInquiry }: LeistungenPageProps) {
  useSectionObserver([
    'messebau',
    'eventbau',
    'ladenbau',
    'boeden-ausstattung'
  ])

  return (
    <div>
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">Unsere Leistungen</h1>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            Von der ersten Idee bis zum professionellen Abbau – wir begleiten Sie durch alle Phasen Ihres Messeprojekts. 
            Unser Full-Service-Ansatz spart Zeit, Kosten und Nerven.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div id="messebau" className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16 scroll-mt-20">
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Warehouse className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">Messebau</h2>
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
                <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Unser Messebau-Ablauf</h3>
                <div className="space-y-5 md:space-y-6">
                  {[
                    { step: '1', title: 'Beratung & Konzept', desc: 'Wir analysieren Ihre Anforderungen und entwickeln erste Ideen' },
                    { step: '2', title: 'Design & Planung', desc: '3D-Visualisierung, Materialauswahl, technische Planung' },
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

          <div id="eventbau" className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16 scroll-mt-20">
            <Card className="lg:order-2 mt-8 lg:mt-0">
              <CardContent className="p-5 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Event-Typ-Beispiele</h3>
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
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">Eventbau & Bühnen</h2>
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

          <div id="ladenbau" className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16 scroll-mt-20">
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Storefront className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">Ladenbau & Showrooms</h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                Permanente Verkaufs- und Präsentationsflächen, die Ihre Produkte optimal in Szene setzen. 
                Vom Konzept bis zur schlüsselfertigen Übergabe – professioneller Ladenbau mit Wiedererkennungswert.
              </p>
              <div className="space-y-2.5 md:space-y-3 mb-6">
                {[
                  'Showroom-Design',
                  'Ladeneinrichtungen',
                  'Pop-Up-Stores',
                  'Ausstellungsräume',
                  'Corporate Identity Integration'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 md:gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span className="text-sm md:text-base leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                Showroom anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
            <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop" 
                alt="Ladenbau"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          <div id="boeden-ausstattung" className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start scroll-mt-20">
            <div className="group aspect-video rounded-lg overflow-hidden lg:order-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary mt-6 lg:mt-0">
              <img 
                src="/images/boeden/vinylboden-raum-einrichtung.svg" 
                alt="Moderner Vinylboden in Grau mit stilvoller Einrichtung – Bodenverlegung von S&S Messebau"
                width="800"
                height="600"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="lg:order-1">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Armchair className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">Böden & Ausstattung</h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                Die perfekte Ergänzung für jeden Stand: Hochwertige Messeböden, stilvolle Möblierung, 
                professionelle Beleuchtung und moderne Technik.
              </p>
              <div className="space-y-2.5 md:space-y-3 mb-6">
                {[
                  'Messeboden-Systeme (Teppich, Vinyl, Parkett)',
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
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                Ausstattung anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>

          {/* Image Gallery: Floor and Furniture Examples */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
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
      </section>

      <section className="py-12 md:py-16 bg-muted">
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
                { title: 'Konzeption & Design', desc: '3D-Visualisierung Ihres Stands noch vor der Produktion' },
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
