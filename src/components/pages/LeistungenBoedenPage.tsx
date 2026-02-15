import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Armchair,
  ArrowRight,
  Phone,
  Envelope,
  CheckCircle,
  Star,
  Shield,
  Package,
  Leaf,
  Recycle,
  PaintBrush,
  Cube,
  Wrench,
} from '@phosphor-icons/react'

export function LeistungenBoedenPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  const processSteps = [
    {
      step: 1,
      title: 'Bedarfsanalyse & Beratung',
      desc: 'Wir besprechen Ihre Anforderungen an Boden, Möblierung und Ausstattung. Standgröße, Nutzung und Corporate Design fließen in unsere Empfehlung ein.',
    },
    {
      step: 2,
      title: 'Materialauswahl & Muster',
      desc: 'Sie erhalten Materialproben und Farbmuster zur Auswahl. Gemeinsam finden wir die perfekte Kombination aus Optik, Haptik und Funktionalität.',
    },
    {
      step: 3,
      title: 'Planung & Kalkulation',
      desc: 'Wir erstellen einen detaillierten Ausstattungsplan mit transparenter Kostenübersicht – inklusive aller Materialien, Möbel und Accessoires.',
    },
    {
      step: 4,
      title: 'Anlieferung & Montage',
      desc: 'Unser erfahrenes Team verlegt Böden, stellt Möbel auf und richtet Ihren Stand komplett ein – termingerecht und sauber.',
    },
    {
      step: 5,
      title: 'Abbau & Rücknahme',
      desc: 'Nach der Messe kümmern wir uns um den fachgerechten Abbau und die Entsorgung oder Einlagerung aller Materialien.',
    },
  ]

  const flooringTypes = [
    {
      title: 'Messeteppich',
      features: ['Große Farbauswahl', 'Schnelle Verlegung', 'Schallabsorbierend', 'Kostengünstig'],
    },
    {
      title: 'Vinylboden',
      features: ['Holz- & Steinoptik', 'Pflegeleicht', 'Strapazierfähig', 'Wiederverwendbar'],
    },
    {
      title: 'Parkett',
      features: ['Edle Optik', 'Hochwertige Ausstrahlung', 'Nachhaltig', 'Langlebig'],
    },
    {
      title: 'Laminat',
      features: ['Vielfältige Dekore', 'Gutes Preis-Leistungs-Verhältnis', 'Robust', 'Schnell verlegt'],
    },
    {
      title: 'Podestböden',
      features: ['Höhenausgleich', 'Kabelführung möglich', 'Stabil & belastbar', 'Individuelle Formen'],
    },
    {
      title: 'Outdoor-Böden',
      features: ['Wetterfest', 'Rutschsicher', 'UV-beständig', 'Schwerlastfähig'],
    },
  ]

  const faqs = [
    {
      q: 'Welcher Bodenbelag eignet sich am besten für Messestände?',
      a: 'Das hängt von Ihren Anforderungen ab. Messeteppich ist der Klassiker – günstig, schnell verlegt und in vielen Farben erhältlich. Für eine hochwertigere Optik empfehlen wir Vinylboden in Holz- oder Steinoptik. Bei Premiumständen setzen wir auf Echtparkett oder Podestböden mit integrierten Kabelkanälen.',
    },
    {
      q: 'Können die Böden an unser Corporate Design angepasst werden?',
      a: 'Ja, wir bieten Böden in nahezu allen RAL-Farben und mit individuellen Druckmotiven an. Messeteppich ist in über 50 Farben verfügbar. Vinylböden und Laminat gibt es in zahlreichen Dekoren, die wir passend zu Ihrem Markenauftritt auswählen.',
    },
    {
      q: 'Wie lange dauert die Verlegung des Bodens?',
      a: 'Messeteppich kann innerhalb weniger Stunden verlegt werden. Vinylboden und Laminat benötigen je nach Fläche 4–8 Stunden. Podestböden erfordern mehr Vorlaufzeit und werden in der Regel einen Tag vor Messeöffnung installiert.',
    },
    {
      q: 'Bieten Sie auch Möbel und Ausstattung zur Miete an?',
      a: 'Ja, wir bieten ein umfangreiches Mietprogramm für Messemöbel – von Loungemöbeln über Theken und Stehtische bis hin zu Vitrinen und Regalsystemen. Miete spart Lager- und Anschaffungskosten und ermöglicht maximale Flexibilität.',
    },
    {
      q: 'Werden die Böden nach der Messe entsorgt oder wiederverwendet?',
      a: 'Messeteppich wird in der Regel nach einmaliger Nutzung recycelt. Hochwertigere Böden wie Vinyl, Parkett und Podestflächen können mehrfach eingesetzt und bei uns eingelagert werden. Wir beraten Sie gerne zum nachhaltigen Einsatz.',
    },
    {
      q: 'Können Sie auch Beleuchtung und Dekoration übernehmen?',
      a: 'Selbstverständlich. Wir bieten einen Full-Service für die komplette Standausstattung: Bodenbelag, Möblierung, Beleuchtungskonzept, Wandsysteme, Pflanzen, Dekoration und Akustiklösungen – alles aus einer Hand.',
    },
  ]

  const testimonials = [
    {
      text: 'Der Vinylboden in Eichenoptik hat unserem Messestand auf der EuroShop ein ganz neues Niveau gegeben. Die Besucher waren begeistert – und wir auch. Perfekte Verarbeitung und pünktliche Lieferung.',
      author: 'Andrea Schulz',
      company: 'DesignHaus Retail GmbH',
      rating: 5,
    },
    {
      text: 'Böden, Möbel, Beleuchtung – alles aus einer Hand. S&S hat unseren 80m²-Stand komplett ausgestattet. Die Koordination war erstklassig und der Stand sah fantastisch aus.',
      author: 'Thomas Richter',
      company: 'ProTech Industries AG',
      rating: 5,
    },
    {
      text: 'Wir nutzen seit zwei Jahren die Mietmöbel von S&S Messebau. Immer top-gepflegt, pünktlich geliefert und flexibel konfigurierbar. Absolute Empfehlung für die Standausstattung.',
      author: 'Sabine Hartmann',
      company: 'Eventwerk Köln',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Messebau & Standgestaltung', hash: '/leistungen/messebau' },
    { label: 'Showrooms & Ausstellungsräume', hash: '/leistungen/showrooms' },
    { label: 'Bannerrahmen-Systeme', hash: '/bannerrahmen' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}
            >
              Böden & Ausstattung – Premium-Ambiente für Ihren Messestand
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Hochwertige Bodenbeläge, stilvolle Möblierung und durchdachte Ausstattungslösungen
              für einen professionellen Messeauftritt. Von Messeteppich bis Parkett, von
              Loungemöbeln bis Beleuchtungskonzept – alles aus einer Hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onOpenInquiry}
                className="bg-white text-primary hover:bg-white/90"
              >
                Jetzt Ausstattung anfragen
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenInquiry}
                className="border-white text-white hover:bg-white/10"
              >
                <Phone className="mr-2" />
                Kostenlose Beratung
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* USP Badge Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-primary" weight="fill" />
              <p className="font-semibold text-sm">Premium-Qualität</p>
              <p className="text-xs text-muted-foreground">Hochwertige Materialien</p>
            </Card>
            <Card className="p-4 text-center">
              <PaintBrush className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Große Materialauswahl</p>
              <p className="text-xs text-muted-foreground">Über 200 Varianten</p>
            </Card>
            <Card className="p-4 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Schnelle Montage</p>
              <p className="text-xs text-muted-foreground">Termingerechte Verlegung</p>
            </Card>
            <Card className="p-4 text-center">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Nachhaltiger Ansatz</p>
              <p className="text-xs text-muted-foreground">Recycling & Wiederverwertung</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Full-Service</p>
              <p className="text-xs text-muted-foreground">Alles aus einer Hand</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leistungsübersicht Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Böden & Ausstattung – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Von der Bodenverlegung bis zur kompletten Standausstattung bieten wir Ihnen
            alle Services für ein perfektes Messe-Ambiente. Professionell, stilvoll und
            passgenau auf Ihre Marke abgestimmt.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Cube,
                title: 'Bodenbeläge',
                desc: 'Messeteppich, Vinyl, Parkett, Laminat und Podestböden – wir bieten für jede Anforderung den passenden Bodenbelag. Professionelle Verlegung inklusive.',
              },
              {
                icon: Armchair,
                title: 'Möblierung',
                desc: 'Loungemöbel, Theken, Stehtische, Vitrinen und Regalsysteme – zur Miete oder zum Kauf. Individuell auf Ihren Standtyp und Ihr Branding abgestimmt.',
              },
              {
                icon: Package,
                title: 'Beleuchtung',
                desc: 'Stimmungsvolle Standbeleuchtung mit LED-Technik, Spots, Profilschienen und indirekter Beleuchtung. Wir setzen Ihren Stand ins richtige Licht.',
              },
              {
                icon: PaintBrush,
                title: 'Wandsysteme',
                desc: 'Trennwände, Rückwandsysteme und Grafik-Wände in verschiedenen Materialien. Bedruckt, beschichtet oder als Leuchtwand – nach Ihren Wünschen.',
              },
              {
                icon: Leaf,
                title: 'Dekoration',
                desc: 'Pflanzen, Blumenarrangements, Teppichläufer und Accessoires. Wir sorgen für eine einladende Atmosphäre, die Ihre Besucher begeistert.',
              },
              {
                icon: Recycle,
                title: 'Akustiklösungen',
                desc: 'Schallabsorbierende Materialien und Akustikpaneele für eine angenehme Gesprächsatmosphäre am Messestand – besonders auf lauten Messen wichtig.',
              },
            ].map((item, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Materialien & Bodenarten Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Materialien & Bodenarten im Überblick
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Für jeden Messestand die richtige Bodenlösung – von kostengünstig bis premium,
            von klassisch bis modern.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {flooringTypes.map((type, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">{type.title}</h3>
                  <ul className="space-y-2">
                    {type.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" weight="fill" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf/Prozess Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zur perfekten Standausstattung
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf Schritten zum perfekt ausgestatteten Messestand –
            von der Beratung bis zur Montage vor Ort.
          </p>

          <div className="max-w-4xl mx-auto space-y-6">
            {processSteps.map((item, index) => (
              <div key={item.step} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg sm:text-xl">
                    {item.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-6 sm:pb-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Häufige Fragen zu Böden & Ausstattung
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Messeböden, Möblierung und Standausstattung.
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Kundenstimmen Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Das sagen unsere Kunden
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Überzeugen Sie sich von der Qualität unserer Bodenbeläge und Ausstattungslösungen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500" weight="fill" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <Separator className="my-4" />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interne Verlinkung Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Weitere Leistungen entdecken
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Entdecken Sie unser gesamtes Leistungsspektrum für Ihren Markenauftritt.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {relatedPages.map((page, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-between min-h-[48px]"
                onClick={() => window.location.hash = page.hash}
              >
                {page.label}
                <ArrowRight className="ml-2 shrink-0" />
              </Button>
            ))}
            <Button
              variant="ghost"
              className="justify-between min-h-[48px] text-muted-foreground"
              onClick={() => window.location.hash = '/leistungen'}
            >
              ← Zurück zur Übersicht
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2
            className="font-bold mb-6"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Bereit für die perfekte Standausstattung?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam die ideale Boden- und Ausstattungslösung für Ihren
            Messestand planen. Kontaktieren Sie uns für eine unverbindliche Beratung
            und ein individuelles Angebot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onOpenInquiry}>
              <Envelope className="mr-2" />
              Angebot anfordern
            </Button>
            <Button size="lg" variant="outline" onClick={onOpenInquiry}>
              <Phone className="mr-2" />
              Rückruf vereinbaren
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
