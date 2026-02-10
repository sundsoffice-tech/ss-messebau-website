import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Info } from '@phosphor-icons/react'
import { FileUpload, UploadedFile } from '@/components/FileUpload'
import { useState, useEffect } from 'react'

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    if (data.dateien && data.dateien.length > 0) {
      const mapped: UploadedFile[] = data.dateien.map((file, idx) => ({
        id: `${Date.now()}-${idx}`,
        file,
        progress: 100,
        status: 'success' as const,
      }))
      setUploadedFiles(mapped)
    }
  }, [])

  const handleFileChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    const actualFiles = files.map(f => f.file)
    onChange({ dateien: actualFiles })
  }

  const canProceed = () => {
    if (!data.druckdatenVorhanden && !data.designwunsch?.trim()) {
      return false
    }
    return true
  }

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
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="ja" id="druck-ja" />
              <span>Ja, ich lade Daten hoch</span>
            </Label>
            <Label
              htmlFor="druck-nein"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !data.druckdatenVorhanden ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="nein" id="druck-nein" />
              <span>Nein, ich benötige Grafikservice</span>
            </Label>
          </RadioGroup>
        </div>

        {data.druckdatenVorhanden ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <FileUpload
              files={uploadedFiles}
              onChange={handleFileChange}
              maxFiles={10}
              maxFileSize={100 * 1024 * 1024}
              acceptedTypes={['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png', '.tif', '.tiff']}
            />
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Druckdaten-Anforderungen:</strong> Format CMYK, mindestens 100dpi Auflösung, 
                Endformat plus 2cm Beschnitt pro Seite. Bei Fragen hilft unser Team gerne weiter.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <Alert className="border-primary bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                <strong>Grafikservice:</strong> Unser Designteam erstellt Ihre Druckdaten nach Ihren Vorgaben. 
                Die Kosten werden im Angebot separat ausgewiesen (ab 49€ für einfache Layouts).
              </AlertDescription>
            </Alert>
            
            <div>
              <Label htmlFor="designwunsch" className="text-base font-semibold">
                Beschreiben Sie Ihre Designvorstellung *
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Je detaillierter, desto besser können wir Ihre Vorstellung umsetzen.
              </p>
              <Textarea
                id="designwunsch"
                value={data.designwunsch || ''}
                onChange={(e) => onChange({ designwunsch: e.target.value })}
                placeholder="Beispiel: Firmenlogo zentriert oben, Slogan darunter in Rot, Produktfotos unten, Hintergrund in Firmenfarben Blau/Weiß, moderne Optik..."
                className="mt-2 h-40"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {data.designwunsch?.length || 0} / 1000 Zeichen
              </p>
            </div>

            <div>
              <Label htmlFor="logo-upload" className="text-base font-semibold">
                Logo & CI-Elemente hochladen (optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Falls vorhanden, laden Sie Ihr Firmenlogo und weitere Grafiken hoch.
              </p>
              <FileUpload
                files={uploadedFiles}
                onChange={handleFileChange}
                maxFiles={5}
                maxFileSize={50 * 1024 * 1024}
                acceptedTypes={['.pdf', '.ai', '.eps', '.jpg', '.jpeg', '.png', '.svg']}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="kommentar" className="text-base font-semibold">
            Besondere Anforderungen oder Hinweise? (optional)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            z.B. spezielle Deadline, Muster gewünscht, telefonische Rücksprache erforderlich
          </p>
          <Textarea
            id="kommentar"
            value={data.kommentar || ''}
            onChange={(e) => onChange({ kommentar: e.target.value })}
            placeholder="Ihre Hinweise..."
            className="mt-2"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {data.kommentar?.length || 0} / 500 Zeichen
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Zurück
        </Button>
        <Button 
          onClick={onNext} 
          size="lg"
          disabled={!canProceed()}
        >
          Weiter zu Lieferung
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
