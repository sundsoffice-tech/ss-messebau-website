import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Storefront, Building, Confetti, Sun } from '@phosphor-icons/react'

interface Step1Data {
  einsatzort: string
  rahmenart: string
  menge: number
  indoorOutdoor: string
  montage: boolean
  montageOrt?: string
  montageZeitraum?: string
}

interface ConfiguratorStep1Props {
  data: Step1Data
  onChange: (data: Partial<Step1Data>) => void
  onNext: () => void
}

export function ConfiguratorStep1({ data, onChange, onNext }: ConfiguratorStep1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.einsatzort) newErrors.einsatzort = 'Bitte wählen Sie einen Einsatzort'
    if (!data.rahmenart) newErrors.rahmenart = 'Bitte wählen Sie eine Rahmenart'
    if (data.menge < 1 || data.menge > 50) newErrors.menge = 'Menge muss zwischen 1 und 50 liegen'
    if (data.montage && !data.montageOrt) newErrors.montageOrt = 'Bitte geben Sie den Montageort an'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Wofür benötigen Sie die Banner?</h2>
        <p className="text-muted-foreground">
          Damit wir die passende Ausführung empfehlen können, teilen Sie uns den Einsatzzweck mit.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Einsatzort *</Label>
          <RadioGroup
            value={data.einsatzort}
            onValueChange={(value) => onChange({ einsatzort: value })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'messe', label: 'Messe / Ausstellung', icon: Storefront },
                { value: 'laden', label: 'Laden / Showroom', icon: Building },
                { value: 'event', label: 'Event / Veranstaltung', icon: Confetti },
                { value: 'outdoor', label: 'Outdoor / Dauerinstallation', icon: Sun },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`einsatz-${option.value}`}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.einsatzort === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`einsatz-${option.value}`} />
                  <option.icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{option.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {errors.einsatzort && <p className="text-sm text-destructive mt-1">{errors.einsatzort}</p>}
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Rahmenart *</Label>
          <RadioGroup
            value={data.rahmenart}
            onValueChange={(value) => onChange({ rahmenart: value })}
          >
            <div className="space-y-2">
              {[
                { value: 'haengerahmen', label: 'Hängerahmen', desc: 'Zur Deckenmontage' },
                { value: 'standrahmen', label: 'Standrahmen', desc: 'Freistehend mit Standfuß' },
                { value: 'verkleidung', label: 'Verkleidungsrahmen', desc: 'Zur Wandmontage' },
                { value: 'beidseitig', label: 'Beidseitiger Rahmen', desc: 'Für Raumteiler' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`rahmen-${option.value}`}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.rahmenart === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`rahmen-${option.value}`} className="mt-1" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {errors.rahmenart && <p className="text-sm text-destructive mt-1">{errors.rahmenart}</p>}
        </div>

        <div>
          <Label htmlFor="menge" className="text-base font-semibold">Anzahl Rahmen *</Label>
          <Input
            id="menge"
            type="number"
            min={1}
            max={50}
            value={data.menge}
            onChange={(e) => onChange({ menge: parseInt(e.target.value) || 1 })}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">Ab 5 Stück erhalten Sie Mengenrabatt</p>
          {errors.menge && <p className="text-sm text-destructive mt-1">{errors.menge}</p>}
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Einsatzbereich *</Label>
          <RadioGroup
            value={data.indoorOutdoor}
            onValueChange={(value) => onChange({ indoorOutdoor: value })}
          >
            <div className="flex gap-4">
              <Label
                htmlFor="indoor"
                className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                  data.indoorOutdoor === 'indoor' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="indoor" id="indoor" />
                <span className="font-medium">Indoor</span>
              </Label>
              <Label
                htmlFor="outdoor"
                className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                  data.indoorOutdoor === 'outdoor' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="outdoor" id="outdoor" />
                <span className="font-medium">Outdoor (wetterfest)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="montage"
              checked={data.montage}
              onCheckedChange={(checked) => onChange({ montage: checked as boolean })}
            />
            <Label htmlFor="montage" className="font-semibold cursor-pointer">
              Montage durch S&S Messebau gewünscht?
            </Label>
          </div>

          {data.montage && (
            <div className="ml-6 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <Label htmlFor="montageOrt">Montageort *</Label>
                <Input
                  id="montageOrt"
                  value={data.montageOrt || ''}
                  onChange={(e) => onChange({ montageOrt: e.target.value })}
                  placeholder="z.B. Berlin, Messe Halle 5"
                  className="mt-1"
                />
                {errors.montageOrt && <p className="text-sm text-destructive mt-1">{errors.montageOrt}</p>}
              </div>
              <div>
                <Label htmlFor="montageZeitraum">Zeitraum (optional)</Label>
                <Input
                  id="montageZeitraum"
                  value={data.montageZeitraum || ''}
                  onChange={(e) => onChange({ montageZeitraum: e.target.value })}
                  placeholder="z.B. KW 15 oder 10.-12. Mai"
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Wir montieren bundesweit, Preis nach Aufwand im Angebot
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleNext} size="lg">
          Weiter zu Maßen & Ausführung
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
