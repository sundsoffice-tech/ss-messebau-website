import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Phone, Envelope, Check } from '@phosphor-icons/react'
import type { BannerConfig } from '../BannerBestellenPage'

interface ThankYouPageProps {
  config: BannerConfig
}

export function ThankYouPage({ config }: ThankYouPageProps) {
  const fileCount = config.step4.serializedFiles?.length || 0

  return (
    <div className="min-h-screen bg-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 mx-auto text-primary animate-in zoom-in" weight="fill" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Vielen Dank, {config.step6.ansprechpartner.split(' ')[0]}!
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              Ihre Konfiguration ist bei uns eingegangen.
            </p>

            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary rounded-lg shrink-0">
                  <Envelope className="w-6 h-6 text-primary-foreground" weight="fill" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg mb-2">📧 E-Mail versendet!</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" weight="bold" />
                      <span>Bestätigung an <strong>{config.step6.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" weight="bold" />
                      <span>Bestellung an <strong>info@sunds-messebau.de</strong></span>
                    </div>
                    {fileCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" weight="bold" />
                        <span>{fileCount} Datei{fileCount > 1 ? 'en' : ''} als Anhang übermittelt</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-6 text-left mb-8">
              <h2 className="font-bold mb-4">Wie geht es weiter?</h2>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    1
                  </span>
                  <span>
                    Wir prüfen Ihre Angaben
                    {config.step4.druckdatenVorhanden && fileCount > 0 && ' und Druckdaten'}
                    {!config.step4.druckdatenVorhanden && ' - unser Grafikteam erstellt Ihre Designs'}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    2
                  </span>
                  <span>Sie erhalten binnen 24 Stunden ein individuelles Angebot</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    3
                  </span>
                  <span>Nach Ihrer Freigabe starten wir die Produktion</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    4
                  </span>
                  <span>
                    Lieferung zum Wunschtermin
                    {config.step5.wunschDatum && ` (${new Date(config.step5.wunschDatum).toLocaleDateString('de-DE')})`}
                    {' '}oder nach 5-10 Werktagen
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={() => {
                window.location.hash = '/banner-bestellen'
                window.location.reload()
              }}>
                Weitere Anfrage stellen
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => (window.location.hash = '/')}>
                Zurück zur Startseite
              </Button>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-2">Fragen? Rufen Sie uns an:</p>
              <a href="tel:+4924334427144" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                <Phone className="w-5 h-5" />
                (02433) 4427144
              </a>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Eine Kopie Ihrer Konfiguration wurde an Ihre E-Mail-Adresse gesendet.
              <br />
              Bitte überprüfen Sie ggf. auch Ihren Spam-Ordner.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
