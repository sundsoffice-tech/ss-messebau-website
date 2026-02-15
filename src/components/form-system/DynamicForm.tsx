import { FormField } from './FormField'
import { useFormSystem } from '@/hooks/use-form-system'
import type { FormContext } from '@/lib/form-system/form-config'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface DynamicFormProps {
  context: FormContext
  initialValues?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  className?: string
  submitLabel?: string
  submittingLabel?: string
  showCancel?: boolean
  onCancel?: () => void
  cancelLabel?: string
  children?: React.ReactNode
  renderFooter?: (props: { loading: boolean; handleSubmit: (e?: React.FormEvent) => Promise<void> }) => React.ReactNode
}

export function DynamicForm({
  context,
  initialValues,
  onSubmit,
  className,
  submitLabel,
  submittingLabel,
  showCancel,
  onCancel,
  cancelLabel,
  children,
  renderFooter,
}: DynamicFormProps) {
  const { t } = useTranslation()
  const form = useFormSystem({ context, initialValues, onSubmit })

  const groups = new Map<string, typeof form.config.fields>()
  for (const field of form.config.fields) {
    const group = field.group || 'default'
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(field)
  }

  return (
    <form onSubmit={form.handleSubmit} className={`space-y-4 ${className || ''}`}>
      {Array.from(groups.entries()).map(([_group, fields]) => (
        <fieldset key={_group} className="space-y-4">
          {fields.map((fieldConfig) => {
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
      ))}

      {children}

      {renderFooter ? (
        renderFooter({ loading: form.loading, handleSubmit: form.handleSubmit })
      ) : (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={form.loading}
              className="min-h-[48px] w-full sm:w-auto text-base"
            >
              {cancelLabel || t('form.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={form.loading}
            className="bg-accent hover:bg-accent/90 min-h-[48px] w-full sm:flex-1 text-base font-medium"
          >
            {form.loading
              ? (submittingLabel || t(form.config.submittingKey))
              : (submitLabel || t(form.config.submitKey))}
          </Button>
        </div>
      )}
    </form>
  )
}
