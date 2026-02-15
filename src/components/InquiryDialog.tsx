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
import { trackFormSubmit } from '@/lib/analytics'
import { useTranslation } from '@/lib/i18n'

interface InquiryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryDialog({ open, onOpenChange }: InquiryDialogProps) {
  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { t } = useTranslation()

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
      newErrors.name = t('inquiry.name.error')
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('inquiry.email.error')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('inquiry.email.invalid')
    }
    
    if (!formData.company.trim()) {
      newErrors.company = t('inquiry.company.error')
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('inquiry.message.error')
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('inquiry.message.minLength')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!validateForm()) {
      toast.error(t('inquiry.validation'))
      setLoading(false)
      return
    }

    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      ...formData,
      timestamp: Date.now()
    }

    setInquiries((current) => [...(current || []), inquiry])

    trackFormSubmit('inquiry', {
      budget: formData.budget || 'nicht_angegeben',
      messen_pro_jahr: formData.messesProJahr || 'nicht_angegeben',
    })

    toast.success(t('inquiry.success'))
    
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
          <DialogTitle className="text-xl sm:text-2xl">{t('inquiry.title')}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {t('inquiry.desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">{t('inquiry.contact')}</legend>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('inquiry.name')} <span className="text-destructive" aria-label={t('inquiry.required')}>*</span>
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
                placeholder={t('inquiry.name.placeholder')}
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
                {t('inquiry.email')} <span className="text-destructive" aria-label={t('inquiry.required')}>*</span>
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
                placeholder={t('inquiry.email.placeholder')}
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
                {t('inquiry.company')} <span className="text-destructive" aria-label={t('inquiry.required')}>*</span>
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
                placeholder={t('inquiry.company.placeholder')}
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
                {t('inquiry.message')} <span className="text-destructive" aria-label={t('inquiry.required')}>*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value })
                  clearError('message')
                }}
                placeholder={t('inquiry.message.placeholder')}
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
                  {t('inquiry.message.hint')}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">
              {t('inquiry.optional')} <span className="text-xs font-normal text-muted-foreground ml-2">{t('inquiry.optional.hint')}</span>
            </legend>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">{t('inquiry.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('inquiry.phone.placeholder')}
                className="min-h-[44px] text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">{t('inquiry.budget')}</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger id="budget" className="min-h-[44px] text-base w-full">
                    <SelectValue placeholder={t('inquiry.budget.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bis-10000">{t('inquiry.budget.small')}</SelectItem>
                    <SelectItem value="10000-30000">{t('inquiry.budget.medium')}</SelectItem>
                    <SelectItem value="ueber-30000">{t('inquiry.budget.large')}</SelectItem>
                    <SelectItem value="unbekannt">{t('inquiry.budget.unknown')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messesProJahr" className="text-sm font-medium">{t('inquiry.fairs')}</Label>
                <Select
                  value={formData.messesProJahr}
                  onValueChange={(value) => setFormData({ ...formData, messesProJahr: value })}
                >
                  <SelectTrigger id="messesProJahr" className="min-h-[44px] text-base w-full">
                    <SelectValue placeholder={t('inquiry.budget.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">{t('inquiry.fairs.1')}</SelectItem>
                    <SelectItem value="3-5">{t('inquiry.fairs.2')}</SelectItem>
                    <SelectItem value="6-10">{t('inquiry.fairs.3')}</SelectItem>
                    <SelectItem value="mehr-als-10">{t('inquiry.fairs.4')}</SelectItem>
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
                aria-label={t('inquiry.cancelAria')}
              >
                {t('inquiry.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/90 min-h-[48px] w-full sm:flex-1 text-base font-medium"
                aria-label={loading ? t('inquiry.submittingAria') : t('inquiry.submitAria')}
              >
                {loading ? t('inquiry.submitting') : t('inquiry.submit')}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {t('inquiry.note')}
            </p>

            <div className="flex items-start gap-2 text-xs text-muted-foreground justify-center">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" weight="fill" aria-hidden="true" />
              <p>
                {t('inquiry.privacy')}{' '}
                <a
                  href="#/datenschutz"
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = '/datenschutz'
                  }}
                  className="underline hover:text-primary transition-colors"
                >
                  {t('inquiry.privacyLink')}
                </a>
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
