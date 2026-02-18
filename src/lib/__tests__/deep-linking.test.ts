import { describe, it, expect } from 'vitest'
import { normalizePagePath, HEADER_OFFSET } from '../deep-linking'

describe('normalizePagePath', () => {
  it('returns "/" for empty string', () => {
    expect(normalizePagePath('')).toBe('/')
  })

  it('returns "/" for falsy input', () => {
    expect(normalizePagePath('')).toBe('/')
  })

  it('adds leading slash if missing', () => {
    expect(normalizePagePath('kontakt')).toBe('/kontakt')
  })

  it('keeps existing leading slash', () => {
    expect(normalizePagePath('/kontakt')).toBe('/kontakt')
  })

  it('handles nested paths', () => {
    expect(normalizePagePath('leistungen/messebau')).toBe('/leistungen/messebau')
  })

  it('preserves already correct nested paths', () => {
    expect(normalizePagePath('/leistungen/messebau')).toBe('/leistungen/messebau')
  })
})

describe('HEADER_OFFSET', () => {
  it('has a default value of 100', () => {
    expect(HEADER_OFFSET).toBe(100)
  })
})
