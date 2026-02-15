import { Button } from '@/components/ui/button'
import { ArrowLeft, PaperPlaneTilt } from '@phosphor-icons/react'
import { useFormSystem } from '@/hooks/use-form-system'
import { FormField } from '@/components/form-system/FormField'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'
import { useTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()

  const form = useFormSystem({
    context: 'banner',
    initialValues: data,
    onSubmit: async () => {
      await onSubmit()
    },
  })

  // Sync parent data into form values when data changes externally
  const handleFieldChange = (key: string, value: any) => {
    form.setValue(key, value)
    onChange({ [key]: value } as Partial<Step6Data>)
  }

  // Use the form config fields, but separate checkboxes for special styling
  const inputFields = form.config.fields.filter(
    (f) => f.token !== 'dsgvo' && f.token !== 'newsletter'
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('banner.step6.title')}</h2>
        <p className="text-muted-foreground">
          {t('banner.step6.desc')}
        </p>
      </div>

      <div className="space-y-4">
        {inputFields.map((fieldConfig) => {
          const token = FIELD_TOKENS[fieldConfig.token]
          if (!token) return null
          return (
            <FormField
              key={token.key}
              tokenKey={fieldConfig.token}
              value={form.values[token.key]}
              error={form.errors[token.key]}
              required={fieldConfig.required}
              onChange={(val) => handleFieldChange(token.key, val)}
              hintKey={
                token.key === 'email' ? 'banner.step6.emailHint' :
                token.key === 'telefon' ? 'banner.step6.phoneHint' :
                undefined
              }
            />
          )
        })}

        <div className="border-t pt-4 space-y-3">
          <FormField
            tokenKey="dsgvo"
            value={form.values.dsgvo}
            error={form.errors.dsgvo}
            required={true}
            onChange={(val) => handleFieldChange('dsgvo', val)}
          />
          <FormField
            tokenKey="newsletter"
            value={form.values.newsletter}
            error={form.errors.newsletter}
            onChange={(val) => handleFieldChange('newsletter', val)}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Zurück
        </Button>
        <Button onClick={() => form.handleSubmit()} size="lg" disabled={form.loading}>
          {form.loading ? t('banner.step6.submitting') : t('banner.step6.submit')}
          <PaperPlaneTilt className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
