import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ArrowLeft, Lightbulb } from '@phosphor-icons/react'

interface Step1Data {
  einsatzort: string
  rahmenart: string
  menge: number
  indoorOutdoor: string
  montage: boolean
  montageOrt?: string
  montageZeitraum?: string
}

interface Step2Data {
  breite: number
  hoehe: number
  profil: string
  ecken: string
  seitigkeit: string
  led: boolean
  ledStrom?: string
  ledEinsatz?: string
}

interface Step3Data {
  bannerBenoetigt: boolean
  material?: string
  konfektion?: string[]
  brandschutz?: boolean
  druckqualitaet?: string
}

interface ConfiguratorStep3Props {
  data: Step3Data
  step1Data: Step1Data
  step2Data: Step2Data
  onChange: (data: Partial<Step3Data>) => void
  onNext: () => void
  onBack: () => void
}

export function ConfiguratorStep3({ data, step1Data, step2Data, onChange, onNext, onBack }: ConfiguratorStep3Props) {
  const showOutdoorHint = step1Data.indoorOutdoor === 'outdoor' && data.material === 'frontlit'
  const showBacklitHint = step2Data.led && data.material !== 'backlit'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Benötigen Sie auch den Druck?</h2>
        <p className="text-muted-foreground">
          Wir können Banner in verschiedenen Materialien bedrucken oder Sie liefern eigene Banner.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Banner benötigt? *</Label>
          <RadioGroup
            value={data.bannerBenoetigt ? 'ja' : 'nein'}
            onValueChange={(value) => onChange({ bannerBenoetigt: value === 'ja' })}
          >
            <Label
              htmlFor="banner-ja"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                data.bannerBenoetigt ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="ja" id="banner-ja" />
              <span>Ja, S&S soll Banner drucken</span>
            </Label>
            <Label
              htmlFor="banner-nein"
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                !data.bannerBenoetigt ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="nein" id="banner-nein" />
              <span>Nein, ich habe eigene Banner</span>
            </Label>
          </RadioGroup>
        </div>

        {data.bannerBenoetigt && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <Label className="text-base font-semibold mb-3 block">Material *</Label>
              <RadioGroup
                value={data.material || 'frontlit'}
                onValueChange={(value) => onChange({ material: value })}
              >
                <div className="space-y-2">
                  {[
                    { value: 'frontlit', label: 'Frontlit 450g', desc: 'Standard, Indoor/leichtes Outdoor' },
                    { value: 'blockout', label: 'Blockout 510g', desc: 'Blickdicht, beidseitiger Druck' },
                    { value: 'mesh', label: 'Mesh 350g', desc: 'Windurchlässig, Outdoor' },
                    { value: 'backlit', label: 'Backlit 450g', desc: 'Transluzent für LED-Beleuchtung' },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`mat-${option.value}`}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                        data.material === option.value ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`mat-${option.value}`} className="mt-1" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>

              {showOutdoorHint && (
                <Alert className="mt-2 bg-accent/10">
                  <Lightbulb className="w-5 h-5" />
                  <AlertDescription>
                    Für Outdoor empfehlen wir Mesh (windurchlässig) oder Blockout (extra stabil)
                  </AlertDescription>
                </Alert>
              )}

              {showBacklitHint && (
                <Alert className="mt-2 bg-accent/10">
                  <Lightbulb className="w-5 h-5" />
                  <AlertDescription>
                    Für LED-Hinterleuchtung ist transluzentes Backlit-Material optimal
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Konfektion</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="keder" defaultChecked disabled />
                  <Label htmlFor="keder" className="text-muted-foreground">
                    Keder 6mm (Standard für Rahmen)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="saum" />
                  <Label htmlFor="saum">Saum ringsum</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="brandschutz"
                checked={data.brandschutz || false}
                onCheckedChange={(checked) => onChange({ brandschutz: checked as boolean })}
              />
              <Label htmlFor="brandschutz" className="font-semibold cursor-pointer">
                B1-Brandschutz-Zertifikat erforderlich?
              </Label>
            </div>
            {step1Data.einsatzort === 'messe' && !data.brandschutz && (
              <Alert className="bg-accent/10">
                <AlertDescription className="text-sm">
                  Die meisten Messen verlangen B1-Brandschutz. Wir liefern Zertifikat mit.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="text-base font-semibold mb-3 block">Druckqualität *</Label>
              <RadioGroup
                value={data.druckqualitaet || 'standard'}
                onValueChange={(value) => onChange({ druckqualitaet: value })}
              >
                <Label
                  htmlFor="qual-standard"
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    data.druckqualitaet === 'standard' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="standard" id="qual-standard" className="mt-1" />
                  <div>
                    <div className="font-medium">Standard (720dpi)</div>
                    <div className="text-sm text-muted-foreground">
                      Für normale Betrachtung – für 95% der Fälle ausreichend
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="qual-high"
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    data.druckqualitaet === 'high' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="high" id="qual-high" className="mt-1" />
                  <div>
                    <div className="font-medium">High (1440dpi)</div>
                    <div className="text-sm text-muted-foreground">Für Nahbetrachtung/Premium</div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Hinweis zu Druckdaten:</strong> Sie laden Ihre Druckdaten im nächsten Schritt hoch. 
                Format: PDF, AI, EPS (CMYK, 100dpi, Endformat + 2cm Beschnitt)
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Zurück
        </Button>
        <Button onClick={onNext}>
          Weiter zu Daten
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
