import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Check, File as FileIcon } from '@phosphor-icons/react'
import type { BannerConfig } from '../BannerBestellenPage'

interface ConfigSummaryProps {
  config: BannerConfig
  currentStep: number
}

export function ConfigSummary({ config, currentStep }: ConfigSummaryProps) {
  const flaeche =
    config.step2.breite && config.step2.hoehe
      ? ((config.step2.breite * config.step2.hoehe) / 10000).toFixed(2)
      : '0'

  const getRahmenartLabel = (value: string) => {
    const labels: Record<string, string> = {
      haengerahmen: 'Hängerahmen',
      standrahmen: 'Standrahmen',
      verkleidung: 'Verkleidungsrahmen',
      beidseitig: 'Beidseitiger Rahmen',
    }
    return labels[value] || value
  }

  const getProfilLabel = (value: string) => {
    const labels: Record<string, string> = {
      standard: 'Standard-Profil',
      premium: 'Premium-Profil',
      sonder: 'Sonder-Profil',
    }
    return labels[value] || value
  }

  const getMaterialLabel = (value?: string) => {
    if (!value) return ''
    const labels: Record<string, string> = {
      frontlit: 'Frontlit 450g',
      blockout: 'Blockout 510g',
      mesh: 'Mesh 350g',
      backlit: 'Backlit 450g',
    }
    return labels[value] || value
  }

  const fileCount = config.step4?.serializedFiles?.length || 0

  return (
    <Card className="p-6 lg:sticky lg:top-6">
      <h3 className="text-lg font-bold mb-4">Ihre Konfiguration</h3>

      <div className="space-y-3 text-sm">
        {currentStep >= 1 && config.step1.einsatzort && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">{getRahmenartLabel(config.step1.rahmenart)}</p>
              <p className="text-muted-foreground text-xs">
                {config.step1.menge}x • {config.step1.indoorOutdoor === 'indoor' ? 'Indoor' : 'Outdoor'}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && config.step2.breite > 0 && config.step2.hoehe > 0 && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">
                {config.step2.breite} × {config.step2.hoehe} cm
              </p>
              <p className="text-muted-foreground text-xs">
                {flaeche} m² • {getProfilLabel(config.step2.profil)}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 2 && config.step2.led && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">LED-Hinterleuchtung</p>
              <p className="text-muted-foreground text-xs">{config.step2.ledStrom || '230V'}</p>
            </div>
          </div>
        )}

        {currentStep >= 3 && config.step3.bannerBenoetigt && config.step3.material && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">Banner-Druck</p>
              <p className="text-muted-foreground text-xs">
                {getMaterialLabel(config.step3.material)}
                {config.step3.brandschutz && ' • B1-Brandschutz'}
              </p>
            </div>
          </div>
        )}

        {currentStep >= 4 && config.step4.druckdatenVorhanden && fileCount > 0 && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">Druckdaten</p>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <FileIcon className="w-3.5 h-3.5" />
                {fileCount} {fileCount === 1 ? 'Datei' : 'Dateien'} hochgeladen
              </p>
            </div>
          </div>
        )}

        {currentStep >= 4 && !config.step4.druckdatenVorhanden && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">Grafikservice</p>
              <p className="text-muted-foreground text-xs">
                Design wird erstellt
              </p>
            </div>
          </div>
        )}

        {currentStep >= 1 && config.step1.montage && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">Montage-Service</p>
              <p className="text-muted-foreground text-xs">{config.step1.montageOrt || 'Wird angegeben'}</p>
            </div>
          </div>
        )}

        {currentStep >= 5 && config.step5.express && (
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium">Express-Service</p>
              <p className="text-muted-foreground text-xs">3-5 Werktage</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="bg-secondary/50 rounded-lg p-4">
        <p className="text-sm font-semibold mb-1">Individuelles Angebot</p>
        <p className="text-xs text-muted-foreground">
          Sie erhalten binnen 24 Stunden ein auf Ihre Konfiguration zugeschnittenes Angebot per E-Mail.
        </p>
      </div>

      {currentStep >= 2 && config.step2.breite > 0 && config.step2.hoehe > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Geschätzte Lieferzeit:</p>
          <p>{config.step5?.express ? '3-5 Werktage' : '5-10 Werktage'} ab Druckfreigabe</p>
        </div>
      )}
    </Card>
  )
}
