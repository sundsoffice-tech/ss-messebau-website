import type { Reference } from './types'

type TranslateFn = (key: string) => string

const BRANCHE_KEYS: Record<Reference['branche'], string> = {
  food: 'referenzen.filter.food',
  sport: 'referenzen.filter.sport',
  kleidung: 'referenzen.filter.kleidung',
  industrie: 'referenzen.filter.industry',
}

const TYPE_KEYS: Record<Reference['type'], string> = {
  messebau: 'referenzen.filter.messebau',
  eventbau: 'referenzen.filter.eventbau',
  ladenbau: 'referenzen.filter.ladenbau',
}

export function getBrancheLabel(t: TranslateFn, branche: string): string {
  const key = BRANCHE_KEYS[branche as Reference['branche']]
  return key ? t(key) : branche
}

export function getTypeLabel(t: TranslateFn, type: string): string {
  const key = TYPE_KEYS[type as Reference['type']]
  return key ? t(key) : type
}
