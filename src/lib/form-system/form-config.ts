export type FormContext = 'inquiry' | 'kontakt' | 'banner'

export interface FormFieldConfig {
  token: string
  required?: boolean
  group?: string
}

export interface FormConfig {
  id: FormContext
  titleKey: string
  descriptionKey?: string
  fields: FormFieldConfig[]
  submitKey: string
  submittingKey: string
  successKey: string
}

export const FORM_CONFIGS: Record<FormContext, FormConfig> = {
  inquiry: {
    id: 'inquiry',
    titleKey: 'inquiry.title',
    descriptionKey: 'inquiry.desc',
    fields: [
      { token: 'name', required: true, group: 'contact' },
      { token: 'email', required: true, group: 'contact' },
      { token: 'company', required: true, group: 'contact' },
      { token: 'message', required: true, group: 'contact' },
      { token: 'phone', group: 'optional' },
      { token: 'budget', group: 'optional' },
      { token: 'messesProJahr', group: 'optional' },
    ],
    submitKey: 'inquiry.submit',
    submittingKey: 'inquiry.submitting',
    successKey: 'inquiry.success',
  },
  kontakt: {
    id: 'kontakt',
    titleKey: 'kontakt.form.title',
    descriptionKey: 'kontakt.form.desc',
    fields: [
      { token: 'name', required: true, group: 'contact' },
      { token: 'email', required: true, group: 'contact' },
      { token: 'company', group: 'contact' },
      { token: 'phone', group: 'contact' },
      { token: 'event', group: 'details' },
      { token: 'size', group: 'details' },
      { token: 'budget', group: 'details' },
      { token: 'wunschtermin', group: 'details' },
      { token: 'message', required: true, group: 'details' },
    ],
    submitKey: 'kontakt.form.submit',
    submittingKey: 'kontakt.form.submitting',
    successKey: 'kontakt.form.success',
  },
  banner: {
    id: 'banner',
    titleKey: 'banner.step6.title',
    descriptionKey: 'banner.step6.desc',
    fields: [
      { token: 'firmaKontakt', required: true },
      { token: 'ansprechpartner', required: true },
      { token: 'email', required: true },
      { token: 'telefon', required: true },
      { token: 'ustId' },
      { token: 'dsgvo', required: true },
      { token: 'newsletter' },
    ],
    submitKey: 'banner.step6.submit',
    submittingKey: 'banner.step6.submitting',
    successKey: 'banner.step6.success',
  },
}
