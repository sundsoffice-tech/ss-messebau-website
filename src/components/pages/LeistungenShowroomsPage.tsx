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
  Storefront,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Users,
  Shield,
  Eye,
  PaintBrush,
  Cube,
  Sparkle,
  Package,
  Armchair,
  Envelope,
  ShoppingBag,
} from '@phosphor-icons/react'
import { navigate } from '@/lib/deep-linking'
import { useUIStore } from '@/store/ui-store'

export function LeistungenShowroomLadenbauPage() {
  const { openInquiry } = useUIStore()
  const processSteps = [
    {
      step: 1,
      title: 'Erstgespräch & Bedarfsanalyse',
      desc: 'Wir lernen Ihre Marke, Ihre Zielgruppe und Ihre Raumgegebenheiten kennen. Gemeinsam definieren wir Ziele, Budget und den gewünschten Erlebnischarakter Ihres Showrooms oder Ladenlokals.',
    },
    {
      step: 2,
      title: 'Konzept & 3D-Visualisierung',
      desc: 'Unsere Designer entwickeln ein maßgeschneidertes Raumkonzept mit fotorealistischen 3D-Visualisierungen – inklusive Material-, Farb- und Beleuchtungsvorschlägen.',
    },
    {
      step: 3,
      title: 'Produktion & Fertigung',
      desc: 'Alle Einbauten und Sonderanfertigungen werden in unserer hauseigenen Werkstatt in höchster Qualität gefertigt. Ein Probeaufbau sichert die Passgenauigkeit.',
    },
    {
      step: 4,
      title: 'Montage & Installation',
      desc: 'Unser erfahrenes Montageteam baut Ihren Showroom oder Laden vor Ort auf – termingerecht, sauber und mit Liebe zum Detail.',
    },
    {
      step: 5,
      title: 'Übergabe & Nachbetreuung',
      desc: 'Nach der Fertigstellung übergeben wir Ihr Projekt schlüsselfertig. Auf Wunsch bieten wir Wartung, saisonale Umgestaltungen und Erweiterungen.',
    },
  ]

  const faqs = [
    {
      q: 'Was kostet ein individueller Showroom oder Ladenlokal?',
      a: 'Die Kosten variieren je nach Raumgröße, Designkomplexität und Ausstattung. Einen kleinen Empfangsbereich realisieren wir ab ca. 5.000 €, umfangreiche Brand Spaces ab ca. 20.000 €. Wir erstellen Ihnen kurzfristig ein detailliertes, unverbindliches Angebot.',
    },
    {
      q: 'Wie lange dauert die Umsetzung?',
      a: 'Für einen individuellen Showroom oder Ladenbau empfehlen wir eine Vorlaufzeit von 6–10 Wochen. Bei kleineren Projekten oder Umgestaltungen sind auch kürzere Zeiträume möglich.',
    },
    {
      q: 'Können bestehende Räume umgestaltet werden?',
      a: 'Ja, wir modernisieren und erweitern bestehende Showrooms, Verkaufsräume, Ausstellungsräume und Empfangsbereiche. Das spart Kosten und schont Ressourcen.',
    },
    {
      q: 'Bieten Sie auch interaktive Elemente an?',
      a: 'Selbstverständlich. Wir integrieren Touchscreens, digitale Displays, Produktkonfiguratoren und interaktive Medienstationen in Ihren Showroom oder Verkaufsraum – für ein modernes Markenerlebnis.',
    },
    {
      q: 'In welchen Regionen sind Sie tätig?',
      a: 'Wir sind bundesweit tätig und realisieren Showrooms, Ladenbau und Brand Spaces in ganz Deutschland – von NRW über Frankfurt und München bis Hamburg und Berlin.',
    },
    {
      q: 'Was ist im Full-Service enthalten?',
      a: 'Unser Full-Service umfasst: Beratung, Konzeption, 3D-Design, Produktion, Ladeneinrichtung, Beleuchtungsplanung, Möblierung, Bodengestaltung, Montage und auf Wunsch regelmäßige Wartung und saisonale Anpassungen.',
    },
    {
      q: 'Was unterscheidet Showroom, Ladenbau und Brand Space?',
      a: 'Ein Showroom dient der Produktpräsentation und Markeninszenierung. Ladenbau fokussiert sich auf verkaufsoptimierten Innenausbau. Brand Spaces vereinen beides und schaffen vollumfängliche Markenerlebnisräume. Wir bündeln alle drei Disziplinen aus einer Hand.',
    },
  ]

  const testimonials = [
    {
      text: 'S&S Messebau hat unseren Showroom im Firmensitz komplett neu gestaltet. Das Ergebnis übertrifft alle Erwartungen – unsere Kunden sind begeistert und die Markenwahrnehmung hat sich spürbar verbessert.',
      author: 'Thomas Richter',
      company: 'LuxTech Industries GmbH',
      rating: 5,
    },
    {
      text: 'Vom ersten Entwurf bis zur Übergabe war die Zusammenarbeit erstklassig. Besonders die Liebe zum Detail bei den Materialien und der Beleuchtung hat uns überzeugt.',
      author: 'Sandra Klein',
      company: 'ModaVista AG',
      rating: 5,
    },
    {
      text: 'Unser Ausstellungsraum wurde termingerecht und in Premium-Qualität realisiert. Die interaktiven Elemente kommen bei Besuchern hervorragend an. Klare Empfehlung!',
      author: 'Jürgen Hoffmann',
      company: 'PräzisionsMechanik Hoffmann',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Messebau & Messestände', hash: '/leistungen/messebau' },
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
          { label: 'Showroom & Ladenbau', current: true },
        ]} />
      </div>
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 text-white py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}
            >
              Showroom &amp; Ladenbau | Brandspaces
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Individuelle Raumkonzepte, Shops &amp; Markenräume aus einer Hand: S&amp;S Messebau
              konzipiert und realisiert Showrooms, Ladenlokale, Brand Spaces und Ausstellungsräume
              – von der ersten Idee bis zur schlüsselfertigen Übergabe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openInquiry}
                className="bg-white text-primary hover:bg-white/80"
              >
                Jetzt Projekt anfragen
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

      {/* Bildergalerie Showroom & Ladenbau */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
              <img
                src="/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg"
                alt="Ladenbau Display-Regal mit LED-Beleuchtung – realisiert von S&S Messebau"
                width="800"
                height="450"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="group aspect-video rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
              <img
                src="/images/ladenbau/showroom-bodenproben-ausstellung.jpg"
                alt="Showroom mit Bodenproben-Ausstellung – realisiert von S&S Messebau"
                width="800"
                height="450"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* USP Badge Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 max-w-6xl mx-auto">
            <Card className="p-4 text-center">
              <PaintBrush className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Individuelle Gestaltung</p>
              <p className="text-xs text-muted-foreground">Maßgeschneiderte Konzepte</p>
            </Card>
            <Card className="p-4 text-center">
              <Storefront className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Markenwelten</p>
              <p className="text-xs text-muted-foreground">Showrooms & Brand Spaces</p>
            </Card>
            <Card className="p-4 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Ladenbau</p>
              <p className="text-xs text-muted-foreground">Verkaufsräume & Shops</p>
            </Card>
            <Card className="p-4 text-center">
              <Sparkle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Premium-Materialien</p>
              <p className="text-xs text-muted-foreground">Höchste Qualitätsstandards</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Bundesweit</p>
              <p className="text-xs text-muted-foreground">Montage in ganz Deutschland</p>
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
      <section id="leistungen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Showroom & Ladenbau – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Als erfahrener Partner für Showrooms, Ladenbau und Markenwelten aus NRW bieten wir
            Ihnen das komplette Leistungsspektrum – von der Konzeption bis zur schlüsselfertigen
            Übergabe.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Eye,
                title: 'Konzeption & Beratung',
                desc: 'Strategische Planung Ihres Showrooms oder Ladenlokals mit Markenanalyse, Zielgruppendefinition und Erlebniskonzept.',
              },
              {
                icon: PaintBrush,
                title: 'Raumgestaltung & 3D-Design',
                desc: 'Kreative Raumkonzepte mit fotorealistischen 3D-Visualisierungen. Sie erleben Ihren Raum virtuell, bevor die Produktion beginnt.',
              },
              {
                icon: Sparkle,
                title: 'Beleuchtungsdesign',
                desc: 'Professionelle Lichtplanung für die perfekte Inszenierung Ihrer Produkte und Markenwelt. Von Akzentbeleuchtung bis zu dynamischen Lichtszenarien.',
              },
              {
                icon: Cube,
                title: 'Materialkonzepte',
                desc: 'Hochwertige Materialauswahl passend zu Ihrer Markenidentität. Edle Oberflächen, nachhaltige Werkstoffe und individuelle Sonderanfertigungen.',
              },
              {
                icon: ShoppingBag,
                title: 'Ladeneinrichtung & Präsentationssysteme',
                desc: 'Verkaufsoptimierte Ladeneinrichtungen, Regalsysteme, Warenpräsentationen und Verkaufstheken – abgestimmt auf Ihre Branche und Zielgruppe.',
              },
              {
                icon: CheckCircle,
                title: 'Interaktive Elemente',
                desc: 'Integration von Touchscreens, digitalen Displays, Produktkonfiguratoren und multimedialen Erlebnisstationen für ein modernes Besuchererlebnis.',
              },
              {
                icon: Armchair,
                title: 'Möblierung & Ausstattung',
                desc: 'Komplette Einrichtung mit maßgefertigten Möbeln, Vitrinen, Präsentationssystemen und Empfangsmöbeln.',
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

      {/* Einsatzbereiche Section */}
      <section id="einsatzbereiche" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Einsatzbereiche für Showroom &amp; Ladenbau
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Unsere Showroom- und Ladenbau-Lösungen sind vielseitig einsetzbar – überall dort,
            wo Ihre Marke erlebbar werden soll.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Storefront,
                title: 'Firmenhauptsitz',
                desc: 'Repräsentative Markenwelten im eigenen Unternehmen – für Kunden, Partner und Mitarbeiter.',
              },
              {
                icon: ShoppingBag,
                title: 'Verkaufs- & Ladenlokale',
                desc: 'Verkaufsfördernde Raumkonzepte und Ladeneinrichtungen, die Produkte optimal inszenieren und zum Kauf inspirieren.',
              },
              {
                icon: Cube,
                title: 'Ausstellungsräume',
                desc: 'Permanente oder temporäre Ausstellungen für Produkte, Innovationen und Unternehmensgeschichte.',
              },
              {
                icon: Sparkle,
                title: 'Produktpräsentationen',
                desc: 'Inszenierte Produktwelten für Launches, Fachhändler-Events und Kundenpräsentationen.',
              },
              {
                icon: Armchair,
                title: 'Empfangsbereiche',
                desc: 'Eindrucksvolle Eingangs- und Empfangsbereiche, die den ersten Eindruck Ihrer Marke prägen.',
              },
            ].map((item, index) => (
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
      <section id="prozess" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zum perfekten Raum
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf klar definierten Schritten realisieren wir Ihren Showroom oder Ladenbau –
            transparent, termingerecht und mit höchstem Qualitätsanspruch.
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
            Häufige Fragen zu Showroom &amp; Ladenbau
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Showrooms, Ladenbau, Kosten und Ablauf.
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
            Das sagen unsere Kunden
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Vertrauen Sie auf die Erfahrung zufriedener Showroom-Kunden.
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
            Bereit für Ihren Showroom oder Ladenbau?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam Ihre Markenwelt gestalten. Kontaktieren Sie uns für
            eine unverbindliche Beratung und ein individuelles Angebot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={openInquiry}>
              <Envelope className="mr-2" />
              Angebot anfordern
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

/** @deprecated Use LeistungenShowroomLadenbauPage instead */
export const LeistungenShowroomsPage = LeistungenShowroomLadenbauPage
