import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ContactInquiry } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

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
    event: '',
    size: '',
    budget: '',
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
      event: '',
      size: '',
      budget: '',
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
          <DialogTitle className="text-xl sm:text-2xl">Projekt anfragen</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Beschreiben Sie uns Ihr Projekt und wir erstellen Ihnen ein individuelles Angebot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">Persönliche Daten</legend>
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
              <Label htmlFor="company" className="text-sm font-medium">Firma</Label>
              <Input
                id="company"
                type="text"
                autoComplete="organization"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Mustermann GmbH"
                className="min-h-[44px] text-base"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">Kontaktdaten</legend>
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
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">Projektdetails</legend>
            <div className="space-y-2">
              <Label htmlFor="event" className="text-sm font-medium">Messe / Event</Label>
              <Input
                id="event"
                type="text"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="z.B. Anuga 2024"
                className="min-h-[44px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm font-medium">Standgröße</Label>
              <Input
                id="size"
                type="text"
                inputMode="numeric"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="z.B. 50 qm"
                className="min-h-[44px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium">Budget (optional)</Label>
              <Input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="z.B. 30.000 - 40.000 €"
                className="min-h-[44px] text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Ihre Nachricht <span className="text-destructive" aria-label="Pflichtfeld">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value })
                  clearError('message')
                }}
                placeholder="Beschreiben Sie uns Ihr Projekt..."
                rows={4}
                className="text-base resize-none"
                required
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p 
                  id="message-error" 
                  className="text-sm text-destructive mt-1" 
                  role="alert"
                >
                  {errors.message}
                </p>
              )}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="min-h-[44px] w-full sm:w-auto text-base"
              aria-label="Dialog schließen"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90 min-h-[44px] w-full sm:w-auto text-base font-medium"
              aria-label={loading ? 'Anfrage wird gesendet' : 'Anfrage absenden'}
            >
              {loading ? 'Wird gesendet...' : 'Anfrage absenden'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
