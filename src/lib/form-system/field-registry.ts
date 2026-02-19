export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'select'

export interface FieldToken {
  key: string
  type: FieldType
  labelKey: string
  placeholderKey?: string
  errorKey?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  validation?: {
    required?: boolean
    minLength?: number
    pattern?: RegExp
    patternErrorKey?: string
  }
  options?: Array<{ value: string; labelKey: string }>
}

export const FIELD_TOKENS: Record<string, FieldToken> = {
  name: {
    key: 'name',
    type: 'text',
    labelKey: 'form.name',
    placeholderKey: 'form.name.placeholder',
    errorKey: 'form.name.error',
    autoComplete: 'name',
    validation: { required: true },
  },
  email: {
    key: 'email',
    type: 'email',
    labelKey: 'form.email',
    placeholderKey: 'form.email.placeholder',
    errorKey: 'form.email.error',
    autoComplete: 'email',
    inputMode: 'email',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternErrorKey: 'form.email.invalid',
    },
  },
  company: {
    key: 'company',
    type: 'text',
    labelKey: 'form.company',
    placeholderKey: 'form.company.placeholder',
    errorKey: 'form.company.error',
    autoComplete: 'organization',
    validation: { required: true },
  },
  phone: {
    key: 'phone',
    type: 'tel',
    labelKey: 'form.phone',
    placeholderKey: 'form.phone.placeholder',
    errorKey: 'form.phone.error',
    autoComplete: 'tel',
    inputMode: 'tel',
  },
  message: {
    key: 'message',
    type: 'textarea',
    labelKey: 'form.message',
    placeholderKey: 'form.message.placeholder',
    errorKey: 'form.message.error',
    validation: { required: true, minLength: 10 },
  },
  budget: {
    key: 'budget',
    type: 'text',
    labelKey: 'form.budget',
    placeholderKey: 'form.budget.placeholder',
    errorKey: 'form.budget.error',
  },
  messesProJahr: {
    key: 'messesProJahr',
    type: 'select',
    labelKey: 'form.fairs',
    placeholderKey: 'form.fairs.placeholder',
    options: [
      { value: '1-2', labelKey: 'form.fairs.1' },
      { value: '3-5', labelKey: 'form.fairs.2' },
      { value: '6-10', labelKey: 'form.fairs.3' },
      { value: 'mehr-als-10', labelKey: 'form.fairs.4' },
    ],
  },
  firmaKontakt: {
    key: 'firmaKontakt',
    type: 'text',
    labelKey: 'form.firmaKontakt',
    placeholderKey: 'form.firmaKontakt.placeholder',
    errorKey: 'form.firmaKontakt.error',
    autoComplete: 'organization',
    validation: { required: true, minLength: 2 },
  },
  ansprechpartner: {
    key: 'ansprechpartner',
    type: 'text',
    labelKey: 'form.ansprechpartner',
    placeholderKey: 'form.ansprechpartner.placeholder',
    errorKey: 'form.ansprechpartner.error',
    autoComplete: 'name',
    validation: { required: true, minLength: 3 },
  },
  telefon: {
    key: 'telefon',
    type: 'tel',
    labelKey: 'form.telefon',
    placeholderKey: 'form.telefon.placeholder',
    errorKey: 'form.telefon.error',
    autoComplete: 'tel',
    inputMode: 'tel',
    validation: { required: true, minLength: 8 },
  },
  ustId: {
    key: 'ustId',
    type: 'text',
    labelKey: 'form.ustId',
    placeholderKey: 'form.ustId.placeholder',
  },
  dsgvo: {
    key: 'dsgvo',
    type: 'checkbox',
    labelKey: 'form.dsgvo',
    errorKey: 'form.dsgvo.error',
    validation: { required: true },
  },
  newsletter: {
    key: 'newsletter',
    type: 'checkbox',
    labelKey: 'form.newsletter',
  },
  event: {
    key: 'event',
    type: 'text',
    labelKey: 'form.event',
    placeholderKey: 'form.event.placeholder',
  },
  size: {
    key: 'size',
    type: 'text',
    labelKey: 'form.size',
    placeholderKey: 'form.size.placeholder',
  },
  wunschtermin: {
    key: 'wunschtermin',
    type: 'text',
    labelKey: 'form.wunschtermin',
    placeholderKey: 'form.wunschtermin.placeholder',
  },
  branche: {
    key: 'branche',
    type: 'select',
    labelKey: 'form.branche',
    placeholderKey: 'form.branche.placeholder',
    options: [
      { value: 'automotive', labelKey: 'form.branche.automotive' },
      { value: 'food', labelKey: 'form.branche.food' },
      { value: 'tech', labelKey: 'form.branche.tech' },
      { value: 'pharma', labelKey: 'form.branche.pharma' },
      { value: 'bau', labelKey: 'form.branche.bau' },
      { value: 'handel', labelKey: 'form.branche.handel' },
      { value: 'dienstleistung', labelKey: 'form.branche.dienstleistung' },
      { value: 'sonstige', labelKey: 'form.branche.sonstige' },
    ],
  },
  wieGefunden: {
    key: 'wieGefunden',
    type: 'select',
    labelKey: 'form.wieGefunden',
    placeholderKey: 'form.wieGefunden.placeholder',
    options: [
      { value: 'google', labelKey: 'form.wieGefunden.google' },
      { value: 'empfehlung', labelKey: 'form.wieGefunden.empfehlung' },
      { value: 'social-media', labelKey: 'form.wieGefunden.socialMedia' },
      { value: 'messe', labelKey: 'form.wieGefunden.messe' },
      { value: 'print', labelKey: 'form.wieGefunden.print' },
      { value: 'sonstige', labelKey: 'form.wieGefunden.sonstige' },
    ],
  },
  position: {
    key: 'position',
    type: 'text',
    labelKey: 'form.position',
    placeholderKey: 'form.position.placeholder',
  },
}
