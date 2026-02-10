import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_REFERENCES } from '@/lib/demo-data'
import { Reference } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle } from '@phosphor-icons/react'

interface ReferenzenPageProps {
  onOpenInquiry: () => void
}

export function ReferenzenPage({ onOpenInquiry }: ReferenzenPageProps) {
  const [selectedBranche, setSelectedBranche] = useState<string>('alle')
  const [selectedType, setSelectedType] = useState<string>('alle')
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)

  const filteredReferences = DEMO_REFERENCES.filter((ref) => {
    if (selectedBranche !== 'alle' && ref.branche !== selectedBranche) return false
    if (selectedType !== 'alle' && ref.type !== selectedType) return false
    return true
  })

  const getBrancheLabel = (branche: string) => {
    switch (branche) {
      case 'food': return 'Food & Feinkost'
      case 'versicherungen': return 'Versicherungen'
      case 'industrie': return 'Industrie'
      default: return branche
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'messebau': return 'Messebau'
      case 'eventbau': return 'Eventbau'
      case 'ladenbau': return 'Ladenbau'
      default: return type
    }
  }

  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Unsere Referenzen</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Überzeugen Sie sich von der Qualität unserer Arbeit. Hier finden Sie eine Auswahl erfolgreicher Projekte, 
            die wir für unsere Kunden realisiert haben.
          </p>
        </div>
      </section>

      <section className="py-12 border-b bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Filter nach Branche</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'alle', label: 'Alle Branchen' },
                  { value: 'food', label: 'Food & Feinkost' },
                  { value: 'versicherungen', label: 'Versicherungen' },
                  { value: 'industrie', label: 'Industrie' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedBranche === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBranche(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Filter nach Typ</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'alle', label: 'Alle Typen' },
                  { value: 'messebau', label: 'Messebau' },
                  { value: 'eventbau', label: 'Eventbau' },
                  { value: 'ladenbau', label: 'Ladenbau' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          {filteredReferences.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-6">
                Keine Projekte in dieser Kategorie gefunden. Kontaktieren Sie uns für Ihr individuelles Projekt!
              </p>
              <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
                Projekt anfragen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReferences.map((reference) => (
                <Card 
                  key={reference.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedReference(reference)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={reference.imageUrl} 
                      alt={reference.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                      {reference.size}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{getBrancheLabel(reference.branche)}</Badge>
                      <Badge variant="outline">{getTypeLabel(reference.type)}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{reference.title}</h3>
                    <p className="text-sm text-muted-foreground">{reference.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedReference} onOpenChange={(open) => !open && setSelectedReference(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedReference && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedReference.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={selectedReference.imageUrl} 
                    alt={selectedReference.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{getBrancheLabel(selectedReference.branche)}</Badge>
                  <Badge variant="outline">{getTypeLabel(selectedReference.type)}</Badge>
                  <Badge variant="secondary">{selectedReference.size}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ausgangslage</h3>
                  <p className="text-muted-foreground">{selectedReference.challenge}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Unsere Lösung</h3>
                  <p className="text-muted-foreground">{selectedReference.solution}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ergebnis</h3>
                  <p className="text-muted-foreground">{selectedReference.result}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Projekt-Facts</h3>
                  <div className="space-y-2">
                    {selectedReference.keyfacts.map((fact, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" weight="fill" />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => {
                    setSelectedReference(null)
                    onOpenInquiry()
                  }} className="w-full bg-accent hover:bg-accent/90">
                    Ähnliches Projekt anfragen
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit für Ihr eigenes Erfolgsprojekt?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lassen Sie uns gemeinsam Ihren perfekten Messeauftritt planen.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Jetzt Projekt besprechen
          </Button>
        </div>
      </section>
    </div>
  )
}
