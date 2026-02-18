import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ContactInquiry } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'
import { trackFormSubmit } from '@/lib/analytics'
import { useTranslation } from '@/lib/i18n'
import { useFormSystem } from '@/hooks/use-form-system'
import { FormField } from '@/components/form-system/FormField'
import { sendFormNotification } from '@/lib/notification-service'
import { navigate } from '@/lib/deep-linking'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'

interface InquiryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryDialog({ open, onOpenChange }: InquiryDialogProps) {
  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const { t } = useTranslation()

  const form = useFormSystem({
    context: 'inquiry',
    onSubmit: async (data) => {
      const inquiry: ContactInquiry = {
        id: `inq-${Date.now()}`,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        budget: data.budget,
        messesProJahr: data.messesProJahr,
        message: data.message,
        timestamp: Date.now(),
      }

      setInquiries((current) => [...(current || []), inquiry])

      // Save inquiry to backend API
      try {
        const { inquiriesApi } = await import('@/lib/api-client')
        await inquiriesApi.create({
          inquiry_id: inquiry.id,
          type: 'inquiry',
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          message: data.message,
          form_data: data,
        })
      } catch {
        console.warn('API unavailable, inquiry saved locally only')
      }

      // Send notification via centralized service
      const notifResult = await sendFormNotification({
        type: 'inquiry',
        data,
        inquiryId: inquiry.id,
        customerEmail: data.email,
      })

      if (!notifResult.success) {
        toast.error('E-Mail konnte nicht gesendet werden: ' + (notifResult.error || 'Unbekannter Fehler'))
      }

      trackFormSubmit('inquiry', {
        budget: data.budget || 'nicht_angegeben',
        messen_pro_jahr: data.messesProJahr || 'nicht_angegeben',
      })

      toast.success(t('inquiry.success'))
      form.reset()
      onOpenChange(false)
    },
  })

  const contactFields = form.config.fields.filter((f) => f.group === 'contact')
  const optionalFields = form.config.fields.filter((f) => f.group === 'optional')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t('inquiry.title')}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {t('inquiry.desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">{t('inquiry.contact')}</legend>
            {contactFields.map((fieldConfig) => {
              const token = FIELD_TOKENS[fieldConfig.token]
              if (!token) return null
              return (
                <FormField
                  key={token.key}
                  tokenKey={fieldConfig.token}
                  value={form.values[token.key]}
                  error={form.errors[token.key]}
                  required={fieldConfig.required}
                  onChange={(val) => form.setValue(token.key, val)}
                  hintKey={token.key === 'message' ? 'form.message.hint' : undefined}
                />
              )
            })}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold mb-2 text-foreground">
              {t('inquiry.optional')} <span className="text-xs font-normal text-muted-foreground ml-2">{t('inquiry.optional.hint')}</span>
            </legend>
            {optionalFields.map((fieldConfig) => {
              const token = FIELD_TOKENS[fieldConfig.token]
              if (!token) return null
              return (
                <FormField
                  key={token.key}
                  tokenKey={fieldConfig.token}
                  value={form.values[token.key]}
                  error={form.errors[token.key]}
                  required={fieldConfig.required}
                  onChange={(val) => form.setValue(token.key, val)}
                />
              )
            })}
          </fieldset>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.loading}
                className="min-h-[48px] w-full sm:w-auto text-base"
                aria-label={t('inquiry.cancelAria')}
              >
                {t('inquiry.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={form.loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 min-h-[48px] w-full sm:flex-1 text-base font-medium"
                aria-label={form.loading ? t('inquiry.submittingAria') : t('inquiry.submitAria')}
              >
                {form.loading ? t('inquiry.submitting') : t('inquiry.submit')}
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
                  href="/datenschutz"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/datenschutz')
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
