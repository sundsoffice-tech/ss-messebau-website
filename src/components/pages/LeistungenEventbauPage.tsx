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
  Microphone,
  CalendarDot,
  ArrowRight,
  Phone,
  Envelope,
  CheckCircle,
  Star,
  Users,
  Shield,
  Wrench,
  Lightning,
  Package,
  Sparkle,
} from '@phosphor-icons/react'

export function LeistungenEventbauPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  const processSteps = [
    {
      step: 1,
      title: 'Bedarfsanalyse & Briefing',
      desc: 'Wir lernen Ihr Event kennen: Anlass, Zielgruppe, Location, Budget und Ihre kreativen Vorstellungen. Gemeinsam definieren wir die Rahmenbedingungen für eine unvergessliche Veranstaltung.',
    },
    {
      step: 2,
      title: 'Kreativkonzept & Entwurf',
      desc: 'Unser Team entwickelt ein maßgeschneidertes Event-Konzept mit 3D-Visualisierungen, Licht- und Tonplanung sowie detaillierten Grundrissen – damit Sie vorab sehen, wie Ihr Event aussehen wird.',
    },
    {
      step: 3,
      title: 'Produktion & Vorbereitung',
      desc: 'Bühnenelemente, Deko und Sonderkonstruktionen werden in unserer Werkstatt gefertigt. Parallel koordinieren wir Technikpartner, Genehmigungen und Logistik.',
    },
    {
      step: 4,
      title: 'Aufbau & Technische Einrichtung',
      desc: 'Unser erfahrenes Montageteam baut vor Ort auf: Bühne, Beleuchtung, Ton, Dekoration und Branding. Alles wird getestet, bevor Ihre Gäste eintreffen.',
    },
    {
      step: 5,
      title: 'Betreuung & Abbau',
      desc: 'Während des Events stehen wir auf Wunsch mit einem technischen Team bereit. Nach der Veranstaltung kümmern wir uns um den fachgerechten Abbau und die Rückführung aller Materialien.',
    },
  ]

  const eventTypes = [
    {
      icon: CalendarDot,
      title: 'Firmenjubiläen & Mitarbeiterevents',
      desc: 'Wir schaffen den passenden Rahmen für Ihr Firmenjubiläum – von der festlichen Bühne bis zur emotionalen Inszenierung Ihrer Unternehmensgeschichte.',
    },
    {
      icon: Microphone,
      title: 'Produktpräsentationen & Launches',
      desc: 'Ihr Produkt verdient eine Bühne. Wir bauen eindrucksvolle Präsentationsflächen mit perfekter Licht- und Medientechnik für maximale Wirkung.',
    },
    {
      icon: Users,
      title: 'Konferenzen & Tagungen',
      desc: 'Professionelle Bühnen, Rednerpulte und Bestuhlungskonzepte für Konferenzen jeder Größe – von 50 bis 5.000 Teilnehmer.',
    },
    {
      icon: Lightning,
      title: 'Outdoor-Events & Festivals',
      desc: 'Wetterfeste Bühnenkonstruktionen, Zeltbauten und Open-Air-Lösungen. Wir realisieren Outdoor-Events mit durchdachten Sicherheitskonzepten.',
    },
    {
      icon: Sparkle,
      title: 'Galas & Abendveranstaltungen',
      desc: 'Elegante Bühnenbilder, stimmungsvolle Beleuchtung und hochwertige Dekoration für unvergessliche Gala-Abende und Preisverleihungen.',
    },
    {
      icon: Package,
      title: 'Pop-Up-Stores & Erlebniswelten',
      desc: 'Temporäre Markenwelten, die begeistern: Pop-Up-Stores, Brand Experiences und interaktive Erlebnisräume – individuell und aufmerksamkeitsstark.',
    },
  ]

  const faqs = [
    {
      q: 'Welche Eventgrößen realisieren Sie?',
      a: 'Wir realisieren Events jeder Größenordnung – von intimen Firmenevents mit 30 Gästen bis zu Großveranstaltungen mit mehreren Tausend Besuchern. Bühnen bauen wir in Größen von 3×2 m bis über 20×12 m.',
    },
    {
      q: 'Wie lange im Voraus sollte ich mein Event planen?',
      a: 'Für größere Veranstaltungen empfehlen wir eine Vorlaufzeit von 8–16 Wochen. Kleinere Events können wir auch mit 4–6 Wochen Vorlauf realisieren. In dringenden Fällen sind auch kurzfristigere Umsetzungen möglich – sprechen Sie uns an.',
    },
    {
      q: 'Übernehmen Sie auch die Licht- und Tontechnik?',
      a: 'Ja, wir bieten die komplette technische Ausstattung an: Bühnenlicht, Effektbeleuchtung, Beschallungsanlagen, Mikrofontechnik und Medientechnik. Entweder aus eigenem Bestand oder über unsere bewährten Technikpartner.',
    },
    {
      q: 'Kümmern Sie sich auch um Genehmigungen und Sicherheit?',
      a: 'Selbstverständlich. Wir unterstützen Sie bei Genehmigungsverfahren, erstellen Sicherheitskonzepte und sorgen für die Einhaltung aller relevanten Vorschriften (Versammlungsstättenverordnung, Brandschutz, Statik).',
    },
    {
      q: 'Was kostet der Eventbau ungefähr?',
      a: 'Die Kosten variieren stark je nach Umfang: Eine einfache Bühne mit Grundausstattung beginnt bei ca. 2.500 €, komplette Event-Inszenierungen mit Bühnenbau, Dekoration und Technik ab ca. 10.000 €. Wir erstellen Ihnen ein detailliertes, unverbindliches Angebot.',
    },
    {
      q: 'Sind Sie auch außerhalb von NRW tätig?',
      a: 'Ja, wir sind bundesweit im Einsatz und realisieren Events an allen Standorten in Deutschland. Auch internationale Projekte setzen wir auf Anfrage um.',
    },
  ]

  const testimonials = [
    {
      text: 'S&S hat unser 25-jähriges Firmenjubiläum in eine unvergessliche Veranstaltung verwandelt. Die Bühne, die Beleuchtung, die Dekoration – alles war perfekt aufeinander abgestimmt. Unsere Mitarbeiter schwärmen heute noch davon.',
      author: 'Andrea Hoffmann',
      company: 'TechVision GmbH',
      rating: 5,
    },
    {
      text: 'Für unsere Produktpräsentation brauchten wir eine beeindruckende Bühne mit modernster Technik. S&S hat nicht nur geliefert, sondern unsere Erwartungen übertroffen. Der Launch war ein voller Erfolg.',
      author: 'Thomas Richter',
      company: 'InnoWare Solutions AG',
      rating: 5,
    },
    {
      text: 'Wir arbeiten seit zwei Jahren mit S&S Messebau für unsere Konferenzen und Galas zusammen. Die Zusammenarbeit ist unkompliziert, das Ergebnis immer erstklassig. Absolute Empfehlung für professionellen Eventbau!',
      author: 'Julia Engel',
      company: 'EventPartner Deutschland',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Messebau & Messestände', hash: '/leistungen/messebau' },
    { label: 'Showroom & Ladenbau', hash: '/leistungen/showroom-ladenbau' },
    { label: 'Touren & Roadshows', hash: '/leistungen/touren' },
    { label: 'Bannerrahmen-Systeme', hash: '/bannerrahmen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Eventbau', current: true },
        ]} />
      </div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}
            >
              Eventbau & Bühnenbau – Unvergessliche Erlebnisse schaffen
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Von der Bühne bis zur kompletten Event-Inszenierung: S&S Messebau realisiert
              Ihren Veranstaltungsbau als Full-Service-Partner. Kreativ konzipiert, professionell
              umgesetzt und bundesweit verfügbar – für Events, die begeistern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onOpenInquiry}
                className="bg-white text-primary hover:bg-white/90"
              >
                Jetzt Event anfragen
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
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Full-Service</p>
              <p className="text-xs text-muted-foreground">Planung bis Abbau</p>
            </Card>
            <Card className="p-4 text-center">
              <Sparkle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Kreative Inszenierung</p>
              <p className="text-xs text-muted-foreground">Einzigartige Konzepte</p>
            </Card>
            <Card className="p-4 text-center">
              <Lightning className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Bundesweit</p>
              <p className="text-xs text-muted-foreground">Alle Veranstaltungsorte</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Sicherheitskonzepte</p>
              <p className="text-xs text-muted-foreground">Normen & Vorschriften</p>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Alles aus einer Hand</p>
              <p className="text-xs text-muted-foreground">Ein Ansprechpartner</p>
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
            Eventbau – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Als erfahrener Eventbau-Partner aus NRW bieten wir Ihnen das komplette
            Leistungsspektrum für Ihre Veranstaltung. Von der Bühne über die Dekoration
            bis zur technischen Ausstattung – alles aus einer Hand.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Microphone,
                title: 'Bühnenbau & Podeste',
                desc: 'Individuelle Bühnen und Podeste in jeder Größe und Form. Mobile Bühnen, Laufstege, Rednerpulte und mehrstöckige Bühnenkonstruktionen – statisch geprüft und sicher.',
              },
              {
                icon: Sparkle,
                title: 'Eventarchitektur & Dekoration',
                desc: 'Eindrucksvolle Raumgestaltung, Eingangsportale, Wandverkleidungen und thematische Dekorationen. Wir verwandeln jede Location in eine einzigartige Erlebniswelt.',
              },
              {
                icon: Lightning,
                title: 'Licht- & Ton-Integration',
                desc: 'Professionelle Beleuchtungskonzepte, Effektlicht, Beschallungsanlagen und Medientechnik. Perfekt abgestimmte Technik für maximale Wirkung.',
              },
              {
                icon: Package,
                title: 'Pop-Up-Stores & Markenwelten',
                desc: 'Temporäre Verkaufs- und Markenflächen, die Aufmerksamkeit erzeugen. Individuelle Gestaltung, schneller Aufbau und flexible Laufzeiten.',
              },
              {
                icon: Shield,
                title: 'Sicherheit & Genehmigungen',
                desc: 'Sicherheitskonzepte nach Versammlungsstättenverordnung, Statikprüfungen, Brandschutzmaßnahmen und Unterstützung bei behördlichen Genehmigungen.',
              },
              {
                icon: Wrench,
                title: 'Auf- & Abbau Service',
                desc: 'Unser erfahrenes Montageteam kümmert sich um den kompletten Auf- und Abbau vor Ort. Termingerecht, sauber und mit technischer Betreuung während des Events.',
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

      {/* Event-Typen Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Für jedes Event die passende Lösung
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Ob Firmenjubiläum, Produktlaunch oder Gala – wir haben die Erfahrung und
            Kreativität für Ihre Veranstaltung.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {eventTypes.map((item, index) => (
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
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zum perfekten Event
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf klar definierten Schritten realisieren wir Ihre Veranstaltung –
            kreativ, termingerecht und stressfrei.
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
            Häufige Fragen zum Eventbau
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Bühnenbau, Event-Inszenierung und Ablauf.
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
            Das sagen unsere Event-Kunden
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Vertrauen Sie auf die Erfahrung zufriedener Veranstalter und Unternehmen.
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
            Bereit für Ihr nächstes Event?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam Ihre Veranstaltung planen. Kontaktieren Sie uns für
            eine unverbindliche Beratung und ein individuelles Angebot – wir freuen uns auf Ihr Projekt.
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
