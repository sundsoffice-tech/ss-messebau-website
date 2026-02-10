import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Warehouse, CalendarDot, Storefront, Armchair, ArrowRight, CheckCircle } from '@phosphor-icons/react'

interface LeistungenPageProps {
  onOpenInquiry: () => void
}

export function LeistungenPage({ onOpenInquiry }: LeistungenPageProps) {
  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Unsere Leistungen</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Von der ersten Idee bis zum professionellen Abbau – wir begleiten Sie durch alle Phasen Ihres Messeprojekts. 
            Unser Full-Service-Ansatz spart Zeit, Kosten und Nerven.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Warehouse className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Messebau</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Professionelle Messestände von 20 bis 200 qm für Messen bundesweit und international. 
                Ob Systemstand oder individuelle Konstruktion – wir realisieren Ihren perfekten Messeauftritt.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Konzeption & 3D-Design',
                  'Produktion & Bau',
                  'Logistik & Transport',
                  'Auf- und Abbau vor Ort',
                  'Lagerung für Wiederverwendung'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                Messestand anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Unser Messebau-Ablauf</h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Beratung & Konzept', desc: 'Wir analysieren Ihre Anforderungen und entwickeln erste Ideen' },
                    { step: '2', title: 'Design & Planung', desc: '3D-Visualisierung, Materialauswahl, technische Planung' },
                    { step: '3', title: 'Produktion', desc: 'Hochwertige Fertigung in unseren Partnerwerkstätten' },
                    { step: '4', title: 'Aufbau & Betreuung', desc: 'Pünktlicher Aufbau, technischer Support während der Messe' }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <Card className="lg:order-2">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Event-Typ-Beispiele</h3>
                <div className="space-y-4">
                  {[
                    'Firmenjubiläen & Galas',
                    'Produktpräsentationen',
                    'Konferenzen & Tagungen',
                    'Outdoor-Events & Festivals',
                    'Pop-Up-Stores'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDot className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Eventbau & Bühnen</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Beeindruckende Event-Inszenierungen: Von Bühnenbauten über Präsentationsflächen bis zu kompletten Event-Ausstattungen. 
                Wir machen Ihre Veranstaltung zum unvergesslichen Erlebnis.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Bühnenbau & Podeste',
                  'Event-Architektur',
                  'Licht- und Tontechnik-Integration',
                  'Dekoration & Ausstattung',
                  'Sicherheitskonzepte'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                Event planen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Storefront className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Ladenbau & Showrooms</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Permanente Verkaufs- und Präsentationsflächen, die Ihre Produkte optimal in Szene setzen. 
                Vom Konzept bis zur schlüsselfertigen Übergabe – professioneller Ladenbau mit Wiedererkennungswert.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Showroom-Design',
                  'Ladeneinrichtungen',
                  'Pop-Up-Stores',
                  'Ausstellungsräume',
                  'Corporate Identity Integration'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                Showroom anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" 
                alt="Ladenbau"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="aspect-video rounded-lg overflow-hidden lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=800" 
                alt="Ausstattung"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <Armchair className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Böden & Ausstattung</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Die perfekte Ergänzung für jeden Stand: Hochwertige Messeböden, stilvolle Möblierung, 
                professionelle Beleuchtung und moderne Technik.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Messeboden-Systeme (Teppich, Vinyl, Parkett)',
                  'Lounge-Möbel & Sitzgruppen',
                  'Theken & Empfangsbereiche',
                  'LED-Beleuchtungskonzepte',
                  'Multimedia & Präsentationstechnik'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                Ausstattung anfragen
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Alles aus einer Hand</h2>
              <p className="text-lg text-muted-foreground">
                Mit S&S Messebau haben Sie einen Ansprechpartner für alle Gewerke. 
                Das spart Abstimmungsaufwand und garantiert reibungslose Abläufe.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Konzeption & Design', desc: '3D-Visualisierung Ihres Stands noch vor der Produktion' },
                { title: 'Produktion & Bau', desc: 'Hochwertige Verarbeitung durch erfahrene Partner' },
                { title: 'Logistik', desc: 'Bundesweiter Transport und termingerechte Anlieferung' },
                { title: 'Auf- & Abbau', desc: 'Professionelles Team kümmert sich vor Ort um alles' },
                { title: 'Lagerung', desc: 'Sichere Einlagerung für Wiederverwendung bei Folgemessen' },
                { title: 'Service vor Ort', desc: 'Technischer Support während der gesamten Messezeit' }
              ].map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interessiert? Lassen Sie uns sprechen.</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Beschreiben Sie uns Ihr Projekt und wir erstellen Ihnen ein individuelles Angebot.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Unverbindliches Angebot einholen
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
