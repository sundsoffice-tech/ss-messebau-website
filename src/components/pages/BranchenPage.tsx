import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

interface BranchenPageProps {
  onOpenInquiry: () => void
}

export function BranchenPage({ onOpenInquiry }: BranchenPageProps) {
  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Branchen-Expertise</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Spezialisiert auf die Anforderungen von Mittelständlern in Food, Versicherungen und Industrie. 
            Wir kennen Ihre Branche und wissen, worauf es ankommt.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <Tabs defaultValue="food" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="food">Food & Feinkost</TabsTrigger>
              <TabsTrigger value="versicherungen">Versicherungen</TabsTrigger>
              <TabsTrigger value="industrie">Industrie</TabsTrigger>
            </TabsList>

            <TabsContent value="food" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Food & Feinkost</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Ihre Produkte müssen schmecken UND gut aussehen. Wir schaffen Messestände, 
                    die Appetit machen und optimal für Verkostungen geeignet sind.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      'Hygienische Verkostungsküchen',
                      'Ansprechende Produktpräsentation',
                      'Kühlung & Lagerung vor Ort',
                      'Hochwertige Beleuchtung für Lebensmittel',
                      'Lounge-Bereiche für Kundengespräche'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                    Food-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800" 
                    alt="Food Messestand"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versicherungen" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2">
                  <h2 className="text-3xl font-bold mb-6">Versicherungen & Dienstleistungen</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Vertrauen aufbauen durch professionelle Präsenz. Unsere Messestände für 
                    Versicherungen und Dienstleister vermitteln Seriosität und Kompetenz.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      'Diskrete Beratungszonen',
                      'Moderne, vertrauensvolle Atmosphäre',
                      'Integrierte Technik für Präsentationen',
                      'Flexible Raumgestaltung',
                      'Barrierefreie Zugänge'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                    Versicherungs-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden lg:order-1">
                  <img 
                    src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800" 
                    alt="Versicherungs Messestand"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="industrie" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Industrie & Technik</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Große Maschinen, komplexe Produkte – professionell präsentiert. 
                    Wir realisieren Messestände mit der nötigen Tragfähigkeit und technischen Infrastruktur.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      'Tragfähige Konstruktionen für schwere Exponate',
                      'Integrierte Stromanschlüsse & Medientechnik',
                      'Industrieller, hochwertiger Look',
                      'Interaktive Produktkonfiguratoren',
                      'Separate Besprechungsräume'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                    Industrie-Stand anfragen
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800" 
                    alt="Industrie Messestand"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Warum Branchen-Expertise zählt</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jede Branche hat spezifische Anforderungen. Wir kennen sie und setzen sie um.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
