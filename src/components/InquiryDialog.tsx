import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ContactInquiry } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'

interface InquiryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryDialog({ open, onOpenChange }: InquiryDialogProps) {
  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    budget: '',
    messesProJahr: '',
    message: ''
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Bitte geben Sie Ihren Namen ein'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Bitte geben Sie Ihren Firmennamen ein'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Bitte beschreiben Sie Ihr Projekt'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Bitte geben Sie mindestens 10 Zeichen ein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!validateForm()) {
      toast.error('Bitte überprüfen Sie Ihre Eingaben')
      setLoading(false)
      return
    }

    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      ...formData,
      timestamp: Date.now()
    }

    setInquiries((current) => [...(current || []), inquiry])

    toast.success('Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.')
    
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      budget: '',
      messesProJahr: '',
      message: ''
    })
    
    setErrors({})
    setLoading(false)
    onOpenChange(false)
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Unverbindliche Projektberatung</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Wir melden uns innerhalb von 24 Stunden mit ersten Ideen und einer groben Kosteneinschätzung zu Ihrem Messestand oder Ausbauprojekt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">Ihre Kontaktdaten</legend>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive" aria-label="Pflichtfeld">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  clearError('name')
                }}
                placeholder="Max Mustermann"
                className="min-h-[44px] text-base"
                required
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p 
                  id="name-error" 
                  className="text-sm text-destructive mt-1" 
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-Mail <span className="text-destructive" aria-label="Pflichtfeld">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  clearError('email')
                }}
                placeholder="max@mustermann.de"
                className="min-h-[44px] text-base"
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p 
                  id="email-error" 
                  className="text-sm text-destructive mt-1" 
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Firma <span className="text-destructive" aria-label="Pflichtfeld">*</span>
              </Label>
              <Input
                id="company"
                type="text"
                autoComplete="organization"
                value={formData.company}
                onChange={(e) => {
                  setFormData({ ...formData, company: e.target.value })
                  clearError('company')
                }}
                placeholder="Mustermann GmbH"
                className="min-h-[44px] text-base"
                required
                aria-required="true"
                aria-invalid={!!errors.company}
                aria-describedby={errors.company ? "company-error" : undefined}
              />
              {errors.company && (
                <p 
                  id="company-error" 
                  className="text-sm text-destructive mt-1" 
                  role="alert"
                >
                  {errors.company}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Kurz Ihr Projekt <span className="text-destructive" aria-label="Pflichtfeld">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value })
                  clearError('message')
                }}
                placeholder="z.B. Messe/Ort, Zeitraum, ca. m², besondere Wünsche …"
                rows={4}
                className="text-base resize-none"
                required
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : "message-hint"}
              />
              {errors.message ? (
                <p 
                  id="message-error" 
                  className="text-sm text-destructive mt-1" 
                  role="alert"
                >
                  {errors.message}
                </p>
              ) : (
                <p id="message-hint" className="text-xs text-muted-foreground">
                  Tipp: Messe, Ort, Zeitraum, ungefähre Standfläche und besondere Wünsche helfen uns, schneller ein passendes Angebot zu erstellen.
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">
              Optionale Angaben <span className="text-xs font-normal text-muted-foreground ml-2">– helfen uns bei der Ersteinschätzung</span>
            </legend>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+49 123 456789"
                className="min-h-[44px] text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger id="budget" className="min-h-[44px] text-base w-full">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bis-10000">bis 10.000 €</SelectItem>
                    <SelectItem value="10000-30000">10.000 – 30.000 €</SelectItem>
                    <SelectItem value="ueber-30000">über 30.000 €</SelectItem>
                    <SelectItem value="unbekannt">Noch unklar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messesProJahr" className="text-sm font-medium">Messen pro Jahr</Label>
                <Select
                  value={formData.messesProJahr}
                  onValueChange={(value) => setFormData({ ...formData, messesProJahr: value })}
                >
                  <SelectTrigger id="messesProJahr" className="min-h-[44px] text-base w-full">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1–2 Messen</SelectItem>
                    <SelectItem value="3-5">3–5 Messen</SelectItem>
                    <SelectItem value="6-10">6–10 Messen</SelectItem>
                    <SelectItem value="mehr-als-10">Mehr als 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="min-h-[48px] w-full sm:w-auto text-base"
                aria-label="Dialog schließen"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/90 min-h-[48px] w-full sm:flex-1 text-base font-medium"
                aria-label={loading ? 'Anfrage wird gesendet' : 'Projektberatung anfragen'}
              >
                {loading ? 'Wird gesendet...' : 'Projektberatung anfragen'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Wir erstellen jedes Angebot individuell. Unser Fokus: keine unnötigen Kosten und langfristig effiziente Lösungen.
            </p>

            <div className="flex items-start gap-2 text-xs text-muted-foreground justify-center">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" weight="fill" aria-hidden="true" />
              <p>
                Wir nutzen Ihre Daten ausschließlich zur Bearbeitung Ihrer Anfrage.{' '}
                <a
                  href="#/datenschutz"
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = '/datenschutz'
                  }}
                  className="underline hover:text-primary transition-colors"
                >
                  Datenschutzerklärung
                </a>
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
