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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
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
    
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Projekt anfragen</DialogTitle>
          <DialogDescription>
            Beschreiben Sie uns Ihr Projekt und wir erstellen Ihnen ein individuelles Angebot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Max Mustermann"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Firma</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Mustermann GmbH"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="max@mustermann.de"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+49 123 456789"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event">Messe / Event</Label>
              <Input
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="z.B. Anuga 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Standgröße</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="z.B. 50 qm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (optional)</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="z.B. 30.000 - 40.000 €"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Ihre Nachricht *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Beschreiben Sie uns Ihr Projekt..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90"
            >
              {loading ? 'Wird gesendet...' : 'Anfrage absenden'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
