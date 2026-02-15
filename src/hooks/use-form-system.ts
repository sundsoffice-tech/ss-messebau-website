import { useState, useCallback } from 'react'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'
import { FORM_CONFIGS, type FormContext } from '@/lib/form-system/form-config'
import { useTranslation } from '@/lib/i18n'

interface UseFormSystemOptions {
  context: FormContext
  initialValues?: Record<string, any>
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
}

interface UseFormSystemReturn {
  values: Record<string, any>
  errors: Record<string, string>
  loading: boolean
  config: typeof FORM_CONFIGS[FormContext]
  setValue: (key: string, value: any) => void
  setValues: (data: Record<string, any>) => void
  clearError: (key: string) => void
  validate: () => boolean
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
}

export function useFormSystem({
  context,
  initialValues,
  onSubmit,
}: UseFormSystemOptions): UseFormSystemReturn {
  const formConfig = FORM_CONFIGS[context]
  const { t } = useTranslation()

  const buildDefaults = useCallback(() => {
    const defaults: Record<string, any> = {}
    for (const fieldConfig of formConfig.fields) {
      const token = FIELD_TOKENS[fieldConfig.token]
      if (token) {
        if (token.type === 'checkbox') {
          defaults[token.key] = false
        } else {
          defaults[token.key] = ''
        }
      }
    }
    return { ...defaults, ...initialValues }
  }, [formConfig, initialValues])

  const [values, setValuesState] = useState<Record<string, any>>(buildDefaults)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const setValue = useCallback((key: string, value: any) => {
    setValuesState((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return prev
    })
  }, [])

  const setValues = useCallback((data: Record<string, any>) => {
    setValuesState((prev) => ({ ...prev, ...data }))
  }, [])

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return prev
    })
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    for (const fieldConfig of formConfig.fields) {
      const token = FIELD_TOKENS[fieldConfig.token]
      if (!token) continue

      const value = values[token.key]
      const isRequired = fieldConfig.required || token.validation?.required

      if (isRequired) {
        if (token.type === 'checkbox') {
          if (!value) {
            newErrors[token.key] = t(token.errorKey || 'form.required')
          }
        } else if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[token.key] = t(token.errorKey || 'form.required')
        }
      }

      if (value && typeof value === 'string' && value.trim()) {
        const validation = token.validation
        if (validation?.minLength && value.trim().length < validation.minLength) {
          newErrors[token.key] = t(token.errorKey || 'form.minLength')
        }
        if (validation?.pattern && !validation.pattern.test(value)) {
          newErrors[token.key] = t(validation.patternErrorKey || token.errorKey || 'form.invalid')
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formConfig, values, t])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(values)
      }
    } finally {
      setLoading(false)
    }
  }, [validate, onSubmit, values])

  const reset = useCallback(() => {
    setValuesState(buildDefaults())
    setErrors({})
  }, [buildDefaults])

  return {
    values,
    errors,
    loading,
    config: formConfig,
    setValue,
    setValues,
    clearError,
    validate,
    handleSubmit,
    reset,
  }
}
