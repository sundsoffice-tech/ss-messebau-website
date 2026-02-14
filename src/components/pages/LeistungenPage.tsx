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
    'touren',
    'trockenbau',
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

          <div id="touren" className="py-12 md:py-16 scroll-mt-20">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Touren & wiederkehrende Messeauftritte</h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Sie bestreiten mehrere kleinere Messen pro Jahr oder führen Roadshows durch? Wir bieten Ihnen skalierbare, wiederverwendbare Systemlösungen, die zentral ab NRW koordiniert werden.
                </p>
                <h3 className="text-xl font-semibold mb-4">Ihre Vorteile:</h3>
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
                  <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Beispiel-Pakete für Touren</h3>
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
                  'Individuelle Ladenkonzepte',
                  'Showroom-Ausstellungssysteme',
                  'Verkaufsflächen & Produktpräsentation',
                  'Maßgefertigte Möbel & Regalsysteme',
                  'LED-Beleuchtung & Digitale Displays',
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
            <div className="grid grid-cols-2 gap-4 mt-6 lg:mt-0">
              <div className="col-span-2 group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                <img 
                  src="/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg"
                  alt="Maßgefertigtes Display-Regal mit LED-Beleuchtung und integriertem Monitor – Ladenbau von S&S Messebau"
                  width="800"
                  height="450"
                  loading="lazy"
                  decoding="async"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="col-span-2 group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
                <img 
                  src="/images/ladenbau/showroom-bodenproben-ausstellung.jpg"
                  alt="Professioneller Showroom mit Bodenproben-Ausstellungssystem – Ladenbau und Messebau von S&S"
                  width="800"
                  height="450"
                  loading="lazy"
                  decoding="async"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Böden & Ausstattung - World-Class Section */}
          <div id="boeden-ausstattung" className="scroll-mt-20 space-y-12 md:space-y-16">
            {/* Hero Section */}
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
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">Böden & Ausstattung</h2>
                </div>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                  Die perfekte Ergänzung für jeden Stand: Hochwertige Messeböden (Teppich, Vinyl, Parkett), 
                  stilvolle Möblierung, professionelle Beleuchtung und moderne Technik. Von Messeständen 
                  bis zu kompletten Küchen- und Raumausstattungen – wir liefern die Komplettlösung.
                </p>
                <div className="bg-primary/5 rounded-lg p-4 md:p-6 mb-6">
                  <h3 className="font-semibold text-base md:text-lg mb-3">Unser Versprechen</h3>
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

      <section id="trockenbau" className="py-12 md:py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 leading-tight">Trockenbau & Innenausbau</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                Neben unserem Messebau-Know-how bieten wir Ihnen professionelle Trockenbau- und Ausbauprojekte: Shops, Büros, Showrooms – Planung und Ausführung aus einer Hand durch unseren großen Pool an Facharbeitern.
              </p>
              <h3 className="text-xl font-semibold mb-4">Das können wir für Sie tun:</h3>
              <div className="space-y-2.5 md:space-y-3 mb-6">
                {[
                  'Ausbau von Shops, Büros und Showrooms',
                  'Planung und Ausführung durch erfahrene Facharbeiter',
                  'Einsatz desselben Monteur-Teams wie im Messebau',
                  'Kostenoptimierte Lösungen für langfristige Projekte',
                  'Keine unnötigen Kosten – effizient und termingerecht'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 md:gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span className="text-sm md:text-base leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90 w-full md:w-auto min-h-[48px] text-base">
                Trockenbau-Projekt anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-5 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-5">Unsere Ausbau-Leistungen</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Shop-Ausbau', desc: 'Verkaufsflächen, Theken, Präsentationswände' },
                    { name: 'Büro-Ausbau', desc: 'Trennwände, Akustiklösungen, Deckenausbau' },
                    { name: 'Showroom-Gestaltung', desc: 'Produktpräsentationen, Beleuchtungskonzepte' },
                    { name: 'Innenausbau', desc: 'Individuelle Raumgestaltung nach Ihren Wünschen' }
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
      </section>

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
