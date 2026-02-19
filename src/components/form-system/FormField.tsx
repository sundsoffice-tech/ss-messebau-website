import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'
import { useTranslation } from '@/lib/i18n'

interface FormFieldProps {
  tokenKey: string
  value: any
  error?: string
  required?: boolean
  onChange: (value: any) => void
  className?: string
  hintKey?: string
}

export function FormField({ tokenKey, value, error, required, onChange, className, hintKey }: FormFieldProps) {
  const token = FIELD_TOKENS[tokenKey]
  const { t } = useTranslation()

  if (!token) return null

  const isRequired = required || token.validation?.required
  const fieldId = `form-field-${token.key}`

  if (token.type === 'checkbox') {
    return (
      <div className={`flex items-start space-x-2 ${className || ''}`}>
        <Checkbox
          id={fieldId}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor={fieldId} className="cursor-pointer leading-relaxed">
          {t(token.labelKey)}
          {isRequired && ' *'}
        </Label>
        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}
      </div>
    )
  }

  if (token.type === 'select' && token.options) {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {t(token.labelKey)}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger id={fieldId} className="min-h-[44px] text-base w-full">
            <SelectValue placeholder={token.placeholderKey ? t(token.placeholderKey) : ''} />
          </SelectTrigger>
          <SelectContent>
            {token.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive mt-1" role="alert">{error}</p>
        )}
      </div>
    )
  }

  if (token.type === 'textarea') {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {t(token.labelKey)}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Textarea
          id={fieldId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={token.placeholderKey ? t(token.placeholderKey) : ''}
          rows={4}
          className="text-base resize-none"
          required={isRequired}
          aria-required={isRequired}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hintKey ? `${fieldId}-hint` : undefined}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-sm text-destructive mt-1" role="alert">{error}</p>
        ) : hintKey ? (
          <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">{t(hintKey)}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {t(token.labelKey)}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        type={token.type}
        autoComplete={token.autoComplete}
        inputMode={token.inputMode}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={token.placeholderKey ? t(token.placeholderKey) : ''}
        className="min-h-[44px] text-base"
        required={isRequired}
        aria-required={isRequired}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hintKey ? `${fieldId}-hint` : undefined}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive mt-1" role="alert">{error}</p>
      ) : hintKey ? (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">{t(hintKey)}</p>
      ) : null}
    </div>
  )
}
