import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Package, Truck, Shield, Wrench } from '@phosphor-icons/react'

interface BannerrahmenPageProps {
  onOpenInquiry: () => void
}

export function BannerrahmenPage({ onOpenInquiry }: BannerrahmenPageProps) {
  return (
    <div className="min-h-screen">
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bannerrahmen & Großformatdruck
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Professionelle Bannerrahmen in allen Größen – von Standard bis LED-Backlit. 
              Mit optionalem Druck und Montageservice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.hash = '/banner-bestellen'}
                className="bg-white text-primary hover:bg-white/90"
              >
                Jetzt Banner konfigurieren
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenInquiry}
                className="border-white text-white hover:bg-white/10"
              >
                Beratung anfordern
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">5-10 Werktage</p>
              <p className="text-xs text-muted-foreground">Lieferzeit</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Deutschlandweit</p>
              <p className="text-xs text-muted-foreground">Lieferung & Montage</p>
            </Card>
            <Card className="p-4 text-center">
              <Check className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Premium-Qualität</p>
              <p className="text-xs text-muted-foreground">Hochwertige Profile</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">B1-Zertifiziert</p>
              <p className="text-xs text-muted-foreground">Brandschutz</p>
            </Card>
            <Card className="p-4 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Full-Service</p>
              <p className="text-xs text-muted-foreground">Druck bis Montage</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Bannerrahmen-Systeme</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hängerahmen</h3>
              <p className="text-muted-foreground mb-4">
                Zur Deckenmontage oder Abhängung. Ideal für Messestände und Ausstellungen. 
                Einfacher Bannerwechsel durch Keder-System.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Größen von 50×50 bis 800×400 cm</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Leichte Aluminium-Profile</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Optional mit LED-Beleuchtung</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Standrahmen</h3>
              <p className="text-muted-foreground mb-4">
                Freistehend mit stabilem Standfuß. Perfekt für Events, Läden und wechselnde Standorte. 
                Mobil und schnell aufgebaut.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Ein- oder beidseitig nutzbar</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Stabile Standfüße oder Bodenplatte</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Höhen bis 350 cm möglich</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verkleidungsrahmen</h3>
              <p className="text-muted-foreground mb-4">
                Zur Wandmontage oder als Verkleidung. Ideal für Ladenbau und dauerhafte Installationen. 
                Elegante Optik durch rahmenlose Montage möglich.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Flache Wandmontage</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Auch als Raumteiler einsetzbar</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Individuelle Sonderformen möglich</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Druckmaterialien & Optionen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <h3 className="font-bold mb-2">Frontlit Standard</h3>
              <p className="text-sm text-muted-foreground mb-3">450g/m²</p>
              <p className="text-sm">
                Universal-Material für Indoor und leichten Outdoor-Einsatz. 
                Brillante Farben, langlebig.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Blockout Premium</h3>
              <p className="text-sm text-muted-foreground mb-3">510g/m²</p>
              <p className="text-sm">
                Blickdicht für beidseitigen Druck. Extra stabil für Outdoor-Dauereinsatz.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Mesh Outdoor</h3>
              <p className="text-sm text-muted-foreground mb-3">350g/m²</p>
              <p className="text-sm">
                Windurchlässig, ideal für Fassaden und Outdoor-Großformate. 
                Reduziert Windlast.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Backlit LED</h3>
              <p className="text-sm text-muted-foreground mb-3">450g/m²</p>
              <p className="text-sm">
                Transluzent für LED-Hinterleuchtung. Maximale Leuchtkraft und Fernwirkung.
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">Zusätzliche Optionen</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>B1-Brandschutz-Zertifikat</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>LED-Beleuchtung</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>Grafikservice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Bereit zu starten?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Konfigurieren Sie jetzt Ihre Banner online und erhalten Sie binnen 24 Stunden 
            ein individuelles Angebot – oder lassen Sie sich persönlich beraten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.hash = '/banner-bestellen'}
            >
              Jetzt konfigurieren
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenInquiry}
            >
              Kostenlose Beratung
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
