import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, PaperPlaneTilt } from '@phosphor-icons/react'

interface Step6Data {
  firmaKontakt: string
  ansprechpartner: string
  email: string
  telefon: string
  ustId?: string
  dsgvo: boolean
  newsletter: boolean
}

interface ConfiguratorStep6Props {
  data: Step6Data
  onChange: (data: Partial<Step6Data>) => void
  onBack: () => void
  onSubmit: () => void
}

export function ConfiguratorStep6({ data, onChange, onBack, onSubmit }: ConfiguratorStep6Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.firmaKontakt || data.firmaKontakt.length < 2) newErrors.firmaKontakt = 'Bitte geben Sie Ihre Firma an'
    if (!data.ansprechpartner || data.ansprechpartner.length < 3) newErrors.ansprechpartner = 'Bitte geben Sie Ihren Namen an'
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Bitte geben Sie eine gültige E-Mail an'
    if (!data.telefon || data.telefon.length < 8) newErrors.telefon = 'Bitte geben Sie eine gültige Telefonnummer an'
    if (!data.dsgvo) newErrors.dsgvo = 'Bitte akzeptieren Sie die Datenschutzbestimmungen'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validate()) {
      setSubmitting(true)
      await onSubmit()
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Fast geschafft!</h2>
        <p className="text-muted-foreground">
          Noch Ihre Kontaktdaten, dann erhalten Sie binnen 24h Ihr individuelles Angebot.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="firmaKontakt">Firma *</Label>
          <Input
            id="firmaKontakt"
            value={data.firmaKontakt}
            onChange={(e) => onChange({ firmaKontakt: e.target.value })}
            placeholder="Ihre Firma"
            className="mt-1"
          />
          {errors.firmaKontakt && <p className="text-sm text-destructive mt-1">{errors.firmaKontakt}</p>}
        </div>

        <div>
          <Label htmlFor="ansprechpartner">Vor- und Nachname *</Label>
          <Input
            id="ansprechpartner"
            value={data.ansprechpartner}
            onChange={(e) => onChange({ ansprechpartner: e.target.value })}
            placeholder="Max Mustermann"
            className="mt-1"
          />
          {errors.ansprechpartner && <p className="text-sm text-destructive mt-1">{errors.ansprechpartner}</p>}
        </div>

        <div>
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="max@musterfirma.de"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">An diese Adresse senden wir die Angebotsbestätigung</p>
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="telefon">Telefon *</Label>
          <Input
            id="telefon"
            type="tel"
            value={data.telefon}
            onChange={(e) => onChange({ telefon: e.target.value })}
            placeholder="+49 123 456789"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">Für Rückfragen zu technischen Details</p>
          {errors.telefon && <p className="text-sm text-destructive mt-1">{errors.telefon}</p>}
        </div>

        <div>
          <Label htmlFor="ustId">Umsatzsteuer-ID (optional)</Label>
          <Input
            id="ustId"
            value={data.ustId || ''}
            onChange={(e) => onChange({ ustId: e.target.value })}
            placeholder="DE123456789"
            className="mt-1"
          />
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="dsgvo"
              checked={data.dsgvo}
              onCheckedChange={(checked) => onChange({ dsgvo: checked as boolean })}
              className="mt-1"
            />
            <Label htmlFor="dsgvo" className="cursor-pointer leading-relaxed">
              Ich habe die{' '}
              <a href="/#/datenschutz" className="text-primary hover:underline" target="_blank">
                Datenschutzerklärung
              </a>{' '}
              gelesen und stimme der Verarbeitung meiner Daten zu. *
            </Label>
          </div>
          {errors.dsgvo && <p className="text-sm text-destructive">{errors.dsgvo}</p>}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="newsletter"
              checked={data.newsletter}
              onCheckedChange={(checked) => onChange({ newsletter: checked as boolean })}
              className="mt-1"
            />
            <Label htmlFor="newsletter" className="cursor-pointer leading-relaxed">
              Ich möchte Infos zu Produkten und Angeboten erhalten (jederzeit kündbar)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Zurück
        </Button>
        <Button onClick={handleSubmit} size="lg" disabled={submitting}>
          {submitting ? 'Wird gesendet...' : 'Konfiguration senden'}
          <PaperPlaneTilt className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
