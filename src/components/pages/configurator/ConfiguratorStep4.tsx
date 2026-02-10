import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, UploadSimple } from '@phosphor-icons/react'

interface Step4Data {
  druckdatenVorhanden: boolean
  dateien?: File[]
  grafikservice?: boolean
  designwunsch?: string
  kommentar?: string
}

interface ConfiguratorStep4Props {
  data: Step4Data
  onChange: (data: Partial<Step4Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep4({ data, onChange, onNext, onBack }: ConfiguratorStep4Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Druckdaten hochladen</h2>
        <p className="text-muted-foreground">
          Laden Sie Ihre Druckdaten hoch oder buchen Sie unseren Grafikservice.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Druckdaten vorhanden? *</Label>
          <RadioGroup
            value={data.druckdatenVorhanden ? 'ja' : 'nein'}
            onValueChange={(value) => onChange({ druckdatenVorhanden: value === 'ja' })}
          >
            <Label
              htmlFor="druck-ja"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="ja" id="druck-ja" />
              <span>Ja, ich lade Daten hoch</span>
            </Label>
            <Label
              htmlFor="druck-nein"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                !data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="nein" id="druck-nein" />
              <span>Nein, ich benötige Grafikservice</span>
            </Label>
          </RadioGroup>
        </div>

        {data.druckdatenVorhanden ? (
          <div className="space-y-3 animate-in fade-in">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <UploadSimple className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Dateien hier ablegen oder klicken</p>
              <p className="text-sm text-muted-foreground mb-3">
                PDF, AI, EPS, JPG, PNG, TIF - max. 100 MB pro Datei
              </p>
              <Button variant="outline" size="sm">
                Dateien auswählen
              </Button>
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                Format: CMYK, 100dpi, Endformat + 2cm Beschnitt pro Seite
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in">
            <Alert>
              <AlertDescription>
                Unser Grafikteam erstellt Ihre Druckdaten nach Ihren Vorgaben. 
                Kosten werden im Angebot separat ausgewiesen.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="designwunsch">Beschreiben Sie Ihre Designvorstellung *</Label>
              <Textarea
                id="designwunsch"
                value={data.designwunsch || ''}
                onChange={(e) => onChange({ designwunsch: e.target.value })}
                placeholder="z.B. Firmenlogo zentriert, Slogan darunter, Hintergrund weiß..."
                className="mt-2 h-32"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="kommentar">Besondere Anforderungen oder Hinweise? (optional)</Label>
          <Textarea
            id="kommentar"
            value={data.kommentar || ''}
            onChange={(e) => onChange({ kommentar: e.target.value })}
            placeholder="z.B. spezielle Deadline, Skizze per E-Mail folgt, Muster gewünscht..."
            className="mt-2"
            maxLength={500}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Zurück
        </Button>
        <Button onClick={onNext}>
          Weiter zu Lieferung
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
