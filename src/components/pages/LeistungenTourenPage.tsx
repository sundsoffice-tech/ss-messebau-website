import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CalendarDot,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Users,
  Truck,
  Package,
  MapPin,
  Recycle,
  TrendUp,
  Shield,
  Path,
} from '@phosphor-icons/react'
import { navigate } from '@/lib/deep-linking'
import { useUIStore } from '@/store/ui-store'

export function LeistungenTourenPage() {
  const { openInquiry } = useUIStore()
  const processSteps = [
    {
      step: 1,
      title: 'Bedarf analysieren',
      desc: 'Wir erfassen Ihre Tourenziele, Messekalender und Standanforderungen. Gemeinsam definieren wir den optimalen Systemansatz für wiederkehrende Messeauftritte.',
    },
    {
      step: 2,
      title: 'Modulares System entwickeln',
      desc: 'Unser Designteam entwickelt ein flexibles Standsystem, das an verschiedene Standgrößen und Messeformate angepasst werden kann – mit einheitlichem Markenauftritt.',
    },
    {
      step: 3,
      title: 'Logistik koordinieren',
      desc: 'Wir planen die optimale Routenführung, koordinieren Transportwege und organisieren die termingerechte Anlieferung an allen Messestandorten.',
    },
    {
      step: 4,
      title: 'Rollout durchführen',
      desc: 'Unser Montageteam baut Ihren Stand an jedem Messestandort professionell auf und ab – zuverlässig, termingerecht und in gleichbleibender Qualität.',
    },
    {
      step: 5,
      title: 'Optimierung & Auswertung',
      desc: 'Nach jeder Tour analysieren wir den Ablauf, optimieren Prozesse und passen das System bei Bedarf an – für stetig bessere Ergebnisse.',
    },
  ]

  const advantages = [
    {
      icon: Recycle,
      title: 'Kosteneinsparung durch Wiederverwendung',
      desc: 'Modulare Standsysteme werden mehrfach eingesetzt. Das reduziert Material- und Produktionskosten pro Messe erheblich – bei gleichbleibend hoher Qualität.',
    },
    {
      icon: Shield,
      title: 'Einheitlicher Markenauftritt',
      desc: 'Ihr Unternehmen präsentiert sich an jedem Messestandort mit einem konsistenten, professionellen Erscheinungsbild – für maximale Wiedererkennbarkeit.',
    },
    {
      icon: Package,
      title: 'Flexible Standgrößen',
      desc: 'Unser modulares System lässt sich flexibel an verschiedene Standflächen anpassen – ob 9 m² Reihenstand oder 100 m² Inselstand.',
    },
    {
      icon: Users,
      title: 'Zentrale Koordination',
      desc: 'Ein Ansprechpartner für alle Messestandorte. Wir koordinieren Logistik, Auf- und Abbau sowie Einlagerung – Sie konzentrieren sich auf Ihr Kerngeschäft.',
    },
  ]

  const faqs = [
    {
      q: 'Was ist ein Tourenpaket im Messebau?',
      a: 'Ein Tourenpaket umfasst die Planung, Produktion und den wiederkehrenden Einsatz eines modularen Standsystems an mehreren Messestandorten. Statt für jede Messe einen neuen Stand zu bauen, wird ein flexibles System entwickelt, das an verschiedene Standgrößen angepasst werden kann.',
    },
    {
      q: 'Wie viel kann ich mit einem Tourenpaket sparen?',
      a: 'Durch die Wiederverwendung modularer Standelemente sparen unsere Kunden durchschnittlich 30–50 % der Gesamtkosten im Vergleich zu Einzelbeauftragungen. Je mehr Messetermine, desto größer die Kostenersparnis.',
    },
    {
      q: 'Können die Stände an verschiedene Standgrößen angepasst werden?',
      a: 'Ja, unsere modularen Systeme sind so konzipiert, dass sie flexibel an unterschiedliche Standflächen angepasst werden können – vom kleinen Reihenstand bis zum großen Kopf- oder Inselstand. Grafikelemente werden je nach Fläche skaliert oder ergänzt.',
    },
    {
      q: 'In welchen Regionen bieten Sie Touren an?',
      a: 'Wir betreuen Messetouren bundesweit an allen großen Messestandorten – von Düsseldorf, Köln und Essen über Frankfurt, München und Berlin bis Hamburg und Hannover. Auch Standorte im DACH-Raum realisieren wir auf Anfrage.',
    },
    {
      q: 'Was passiert mit dem Stand zwischen den Messen?',
      a: 'Zwischen den Einsätzen lagern wir Ihren Messestand fachgerecht in unserem Zentrallager in NRW ein. Bei Bedarf führen wir Reparaturen, Reinigungen oder Grafikaktualisierungen durch, damit Ihr Stand für den nächsten Einsatz bereit ist.',
    },
    {
      q: 'Ab wie vielen Messen lohnt sich ein Tourenpaket?',
      a: 'Bereits ab drei Messeterminen pro Jahr rechnet sich ein Tourenpaket gegenüber Einzelbeauftragungen. Bei mehr als fünf Terminen ist die Kostenersparnis besonders deutlich. Wir beraten Sie gerne individuell.',
    },
  ]

  const testimonials = [
    {
      text: 'Dank des Tourenpakets von S&S Messebau sind wir auf sechs Fachmessen pro Jahr vertreten – mit einem einheitlichen, professionellen Auftritt. Die Koordination läuft reibungslos und die Kosteneinsparung ist enorm.',
      author: 'Thomas Richter',
      company: 'ProTech Industrielösungen GmbH',
      rating: 5,
    },
    {
      text: 'Unser modulares Standsystem passt sich an jede Messefläche an – ob 12 m² oder 80 m². S&S kümmert sich um alles: Transport, Aufbau, Abbau und Einlagerung. Besser geht es nicht.',
      author: 'Sandra Klein',
      company: 'HealthVision AG',
      rating: 5,
    },
    {
      text: 'Seit wir mit S&S Messebau als Tourenpartner arbeiten, sparen wir nicht nur Kosten, sondern auch enorm viel Zeit bei der Messeplanung. Absolute Empfehlung für Unternehmen mit mehreren Messeauftritten.',
      author: 'Frank Meier',
      company: 'EcoSystems Deutschland',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Messebau', hash: '/leistungen/messebau' },
    { label: 'Eventbau & Veranstaltungen', hash: '/leistungen/eventbau' },
    { label: 'Böden & Ausstattung', hash: '/leistungen/boeden-ausstattung' },
    { label: 'Bannerrahmen-Systeme', hash: '/bannerrahmen' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Touren', current: true },
        ]} />
      </div>
      {/* Hero Section */}
      <section id="hero" className="hero-gradient text-white py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}
            >
              Touren &amp; Roadshows – Bundesweite Messeauftritte aus einer Hand
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Skalierbare Tourenpakete für wiederkehrende Messeauftritte: S&amp;S Messebau
              entwickelt modulare Standsysteme, koordiniert die Logistik und sorgt an
              jedem Standort für einen einheitlichen, professionellen Markenauftritt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openInquiry}
                className="bg-white text-primary hover:bg-white/80"
              >
                Tourenpaket anfragen
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openInquiry}
                className="bg-transparent border-white text-white hover:bg-white/25"
              >
                <Phone className="mr-2" />
                Kostenlose Beratung
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Image */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
            <img
              src="/images/WhatsApp Image 2026-02-15 at 18.25.23.jpeg"
              alt="Galerie-Ausstellung mit hochwertigen Marken-Countern und eleganter Produktpräsentation"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* USP Badge Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Zentrale Logistik NRW</p>
              <p className="text-xs text-muted-foreground">Lager & Koordination</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Modulare Systeme</p>
              <p className="text-xs text-muted-foreground">Flexibel anpassbar</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Kostenoptimiert</p>
              <p className="text-xs text-muted-foreground">Bis 50 % sparen</p>
            </Card>
            <Card className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Bundesweit / DACH</p>
              <p className="text-xs text-muted-foreground">Alle Messestandorte</p>
            </Card>
            <Card className="p-4 text-center">
              <Recycle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Wiederverwendbar</p>
              <p className="text-xs text-muted-foreground">Nachhaltig & effizient</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leistungsübersicht Section */}
      <section id="leistungen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Touren &amp; Roadshows – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Von der Routenplanung bis zur Tourenkoordination: Wir bieten Ihnen ein
            lückenloses Leistungspaket für wiederkehrende Messeauftritte und Roadshows
            – effizient, zuverlässig und aus einer Hand.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Path,
                title: 'Routenplanung',
                desc: 'Strategische Planung Ihrer Messetour mit optimaler Routenführung, Terminkoordination und Standplatzberatung an allen Messestandorten.',
              },
              {
                icon: Package,
                title: 'Modulare Standsysteme',
                desc: 'Entwicklung flexibler Standsysteme, die an verschiedene Standgrößen und Messeformate angepasst werden können – mit einheitlichem Design.',
              },
              {
                icon: Truck,
                title: 'Zentrales Lager & Logistik',
                desc: 'Fachgerechte Einlagerung in unserem Zentrallager in NRW. Koordination aller Transporte und termingerechte Anlieferung an jedem Messestandort.',
              },
              {
                icon: CalendarDot,
                title: 'Auf- & Abbau bundesweit',
                desc: 'Professioneller Auf- und Abbau durch unser erfahrenes Montageteam an allen deutschen Messestandorten – auch bei engen Zeitfenstern.',
              },
              {
                icon: MapPin,
                title: 'Logistikmanagement',
                desc: 'Komplettes Logistikmanagement inklusive Speditionskoordination, Anmeldung bei Messegesellschaften und Terminüberwachung für jede Station.',
              },
              {
                icon: CheckCircle,
                title: 'Tourenkoordination',
                desc: 'Zentrale Steuerung aller Messetermine, Standvarianten und Sonderanforderungen. Ein Ansprechpartner koordiniert Ihre gesamte Messetour.',
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

      {/* Vorteile Section */}
      <section id="vorteile" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Warum Tourenpakete von S&amp;S Messebau?
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Wiederkehrende Messeauftritte effizient, einheitlich und kostengünstig
            realisiert – mit einem erfahrenen Partner an Ihrer Seite.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {advantages.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf/Prozess Section */}
      <section id="prozess" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zum Tourenpaket
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf Schritten zu Ihrem maßgeschneiderten Tourenpaket – von der
            Bedarfsanalyse bis zur kontinuierlichen Optimierung.
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
      <section id="faq" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Häufige Fragen zu Touren &amp; Roadshows
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Tourenpakete, modularen
            Messebau und wiederkehrende Messeauftritte.
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
      <section id="referenzen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Das sagen unsere Tourenkunden
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Unternehmen, die auf unsere Tourenpakete für wiederkehrende Messeauftritte vertrauen.
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
                onClick={() => navigate(page.hash)}
              >
                {page.label}
                <ArrowRight className="ml-2 shrink-0" />
              </Button>
            ))}
            <Button
              variant="ghost"
              className="justify-between min-h-[48px] text-muted-foreground"
              onClick={() => navigate('/leistungen')}
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
            Bereit für Ihre nächste Messetour?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam Ihr Tourenpaket planen. Kontaktieren Sie uns für
            eine unverbindliche Beratung und ein individuelles Angebot – wir optimieren
            Ihre wiederkehrenden Messeauftritte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={openInquiry}>
              <CalendarDot className="mr-2" />
              Tourenpaket anfragen
            </Button>
            <Button size="lg" variant="outline" onClick={openInquiry}>
              <Phone className="mr-2" />
              Rückruf vereinbaren
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
