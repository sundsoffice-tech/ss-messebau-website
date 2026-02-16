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
  Warehouse,
  ArrowRight,
  Phone,
  Envelope,
  Clock,
  Users,
  Shield,
  TrendUp,
  Truck,
  Package,
  Star,
  ChatCircleDots,
  Wrench,
} from '@phosphor-icons/react'

export function LeistungenMessebauPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  const processSteps = [
    {
      step: 1,
      title: 'Erstberatung & Briefing',
      desc: 'Wir analysieren Ihre Ziele, Zielgruppe und Messevorgaben. In einem persönlichen Gespräch erarbeiten wir gemeinsam die Grundlage für Ihren perfekten Messeauftritt.',
    },
    {
      step: 2,
      title: 'Konzept & 3D-Entwurf',
      desc: 'Unsere Designer entwickeln ein individuelles Standkonzept mit fotorealistischen 3D-Visualisierungen – inklusive Materialvorschlägen und Beleuchtungskonzept.',
    },
    {
      step: 3,
      title: 'Produktion & Fertigung',
      desc: 'Ihr Messestand wird in unserer hauseigenen Werkstatt gefertigt. Probeaufbau inklusive – damit alles passt, bevor es zur Messe geht.',
    },
    {
      step: 4,
      title: 'Logistik & Aufbau',
      desc: 'Wir kümmern uns um Transport, Anlieferung und den fachgerechten Aufbau vor Ort – termingerecht und stressfrei für Sie.',
    },
    {
      step: 5,
      title: 'Abbau & Einlagerung',
      desc: 'Nach der Messe bauen wir Ihren Stand ab und lagern ihn auf Wunsch für den nächsten Einsatz professionell ein.',
    },
  ]

  const advantages = [
    {
      icon: Shield,
      title: 'Full-Service aus einer Hand',
      desc: 'Von der Planung bis zum Abbau – alles aus einer Hand. Kein Koordinationsaufwand für Sie, maximale Qualitätskontrolle durch uns.',
    },
    {
      icon: TrendUp,
      title: 'Messbar mehr Erfolg',
      desc: 'Unsere Messestände sind auf maximale Besucherfrequenz und Lead-Generierung optimiert. Durchdachte Laufwege und Eyecatcher-Elemente inklusive.',
    },
    {
      icon: Users,
      title: 'Erfahrene Messebauer',
      desc: 'Unser Team hat über 500 Messestände realisiert – von 9m² Reihenständen bis zu 200m² Kopfständen auf internationalen Leitmessen.',
    },
    {
      icon: Clock,
      title: 'Schnell & zuverlässig',
      desc: 'Erstangebot innerhalb von 48 Stunden. Auch bei kurzfristigen Anfragen finden wir eine Lösung – garantiert termingerecht.',
    },
  ]

  const faqs = [
    {
      q: 'Was kostet ein individueller Messestand?',
      a: 'Die Kosten hängen von Standgröße, Design-Komplexität und Ausstattung ab. Ein einfacher Reihenstand ab 9m² beginnt bei ca. 3.000 €, individuelle Kopfstände ab 50m² bei ca. 15.000 €. Wir erstellen Ihnen innerhalb von 48 Stunden ein detailliertes, unverbindliches Angebot.',
    },
    {
      q: 'Wie lange dauert die Planung und Produktion eines Messestands?',
      a: 'Für einen individuellen Messestand empfehlen wir eine Vorlaufzeit von 8–12 Wochen. Bei Systembauständen sind auch kürzere Zeiträume möglich. In dringenden Fällen realisieren wir Projekte auch in 4–6 Wochen.',
    },
    {
      q: 'Bieten Sie auch Mietmessestände an?',
      a: 'Ja, wir bieten sowohl Kauf- als auch Mietsysteme an. Mietmessestände sind ideal für Unternehmen, die flexibel bleiben möchten oder nur gelegentlich ausstellen. Die Miete spart Lager- und Wartungskosten.',
    },
    {
      q: 'In welchen Regionen sind Sie als Messebauer tätig?',
      a: 'Wir sind bundesweit tätig und betreuen Messestände an allen großen Messestandorten in Deutschland – von Düsseldorf, Köln und Essen über Frankfurt, München und Berlin bis Hamburg und Hannover. Auch internationale Projekte realisieren wir auf Anfrage.',
    },
    {
      q: 'Was ist im Full-Service-Paket enthalten?',
      a: 'Unser Full-Service umfasst: Beratung, Konzeption, 3D-Design, Produktion, Grafikgestaltung, Logistik, Auf- und Abbau, Standbeleuchtung, Möblierung, Bodenbelag sowie Einlagerung. Optional: Hostessen, Catering, Medientechnik und Standpersonal-Schulung.',
    },
    {
      q: 'Kann ich meinen bestehenden Messestand umbauen oder erweitern lassen?',
      a: 'Selbstverständlich. Wir modernisieren bestehende Messestände, passen sie an neue Standflächen an oder erweitern sie um zusätzliche Elemente. Das spart Kosten und ist nachhaltig.',
    },
  ]

  const testimonials = [
    {
      text: 'S&S Messebau hat unseren Messestand für die MEDICA in Düsseldorf realisiert. Von der ersten Skizze bis zum fertigen Stand – alles aus einer Hand und in höchster Qualität. Die Besucherfrequenz war so hoch wie nie zuvor.',
      author: 'Dr. Stefan Müller',
      company: 'MedTech Solutions GmbH',
      rating: 5,
    },
    {
      text: 'Kurzfristig brauchten wir einen 60m²-Stand für die Hannover Messe. S&S hat das in nur 5 Wochen realisiert – inklusive Probeaufbau. Absolut professionell und zuverlässig.',
      author: 'Claudia Weber',
      company: 'IndustrieWerk AG',
      rating: 5,
    },
    {
      text: 'Wir arbeiten regelmäßig mit S&S Messebau zusammen. Die Stände werden jedes Mal besser, die Kommunikation ist erstklassig und das Preis-Leistungs-Verhältnis stimmt einfach.',
      author: 'Markus Becker',
      company: 'FoodBrand Deutschland',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Eventbau & Veranstaltungen', hash: '/leistungen/eventbau' },
    { label: 'Showroom & Ladenbau', hash: '/leistungen/showroom-ladenbau' },
    { label: 'Bannerrahmen-Systeme', hash: '/bannerrahmen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Messebau', current: true },
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
              Messebau vom Profi – Ihr individueller Messestand aus NRW
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Von der Konzeption bis zum Abbau: S&S Messebau realisiert Ihren Messeauftritt
              als Full-Service-Partner. Individuell geplant, termingerecht produziert und
              bundesweit aufgebaut – für maximale Wirkung auf jeder Messe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onOpenInquiry}
                className="bg-white text-primary hover:bg-white/80"
              >
                Jetzt Messestand anfragen
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenInquiry}
                className="bg-transparent border-white text-white hover:bg-white/25"
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
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">48h-Angebot</p>
              <p className="text-xs text-muted-foreground">Schnelle Angebotserstellung</p>
            </Card>
            <Card className="p-4 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Full-Service</p>
              <p className="text-xs text-muted-foreground">Alles aus einer Hand</p>
            </Card>
            <Card className="p-4 text-center">
              <Warehouse className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">20–200 m²</p>
              <p className="text-xs text-muted-foreground">Jede Standgröße</p>
            </Card>
            <Card className="p-4 text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Bundesweit</p>
              <p className="text-xs text-muted-foreground">Alle Messestandorte</p>
            </Card>
            <Card className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Persönliche Beratung</p>
              <p className="text-xs text-muted-foreground">Fester Ansprechpartner</p>
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
            Messebau – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Als erfahrener Messebauer aus NRW bieten wir Ihnen das komplette Leistungsspektrum
            für Ihren Messeauftritt. Von der ersten Idee bis zur Einlagerung nach der Messe –
            wir sind Ihr zuverlässiger Partner für Standgestaltung und Messeplanung.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: ChatCircleDots,
                title: 'Konzeption & Beratung',
                desc: 'Strategische Messeplanung mit Zielgruppenanalyse, Standplatzberatung und Budgetoptimierung. Wir entwickeln ein Messekonzept, das Ihre Marke optimal inszeniert.',
              },
              {
                icon: Package,
                title: '3D-Design & Visualisierung',
                desc: 'Fotorealistische 3D-Entwürfe Ihres Messestands mit verschiedenen Designvarianten. Sie sehen Ihren fertigen Stand, bevor die Produktion beginnt.',
              },
              {
                icon: Wrench,
                title: 'Produktion & Fertigung',
                desc: 'Präzise Fertigung in unserer eigenen Werkstatt. Hochwertige Materialien, saubere Verarbeitung und Probeaufbau vor Auslieferung – für einen perfekten Messestand.',
              },
              {
                icon: Truck,
                title: 'Logistik & Transport',
                desc: 'Fachgerechter Transport Ihres Messestands zum Messegelände. Koordination mit der Messespedition, Anmeldung und pünktliche Anlieferung.',
              },
              {
                icon: Warehouse,
                title: 'Auf- & Abbau vor Ort',
                desc: 'Professioneller Aufbau durch unser erfahrenes Montageteam. Wir sorgen für einen reibungslosen Ablauf – auch bei engen Zeitfenstern.',
              },
              {
                icon: Shield,
                title: 'Einlagerung & Wartung',
                desc: 'Nach der Messe lagern wir Ihren Stand fachgerecht ein und bereiten ihn für den nächsten Einsatz vor. Reparaturen und Aktualisierungen inklusive.',
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

      {/* Ablauf/Prozess Section */}
      <section id="prozess" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zum perfekten Messestand
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf klar definierten Schritten realisieren wir Ihren Messeauftritt –
            transparent, termingerecht und stressfrei.
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

      {/* USPs/Vorteile Section */}
      <section id="vorteile" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Warum S&S Messebau?
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Über 500 realisierte Messestände, zufriedene Kunden und ein Team, das für
            perfekte Messeauftritte brennt.
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

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Häufige Fragen zum Messebau
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Messestand, Kosten und Ablauf.
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
            Vertrauen Sie auf die Erfahrung zufriedener Messeaussteller.
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
            Bereit für Ihren nächsten Messeauftritt?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam Ihren Messestand planen. Kontaktieren Sie uns für
            eine unverbindliche Beratung und ein individuelles Angebot – innerhalb von 48 Stunden.
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
