import { describe, it, expect } from 'vitest'
import { CONTACT, PHONE_HREF, EMAIL_HREF, whatsappUrl } from '@/lib/contact'

describe('contact', () => {
  it('hält Rufnummer, WhatsApp-Nummer und Anzeigeform konsistent', () => {
    // E.164 = "+" + WhatsApp-Nummer; Anzeigeform ohne Leerzeichen = E.164
    expect(CONTACT.phoneE164).toBe('+' + CONTACT.whatsappNumber)
    expect(CONTACT.phoneDisplay.replace(/\s+/g, '')).toBe(CONTACT.phoneE164)
    expect(CONTACT.whatsappNumber).toMatch(/^\d+$/)
  })

  it('baut tel:- und mailto:-Links aus den zentralen Daten', () => {
    expect(PHONE_HREF).toBe(`tel:${CONTACT.phoneE164}`)
    expect(EMAIL_HREF).toBe(`mailto:${CONTACT.email}`)
  })

  it('baut den wa.me-Link mit URL-kodierter Nachricht', () => {
    const url = new URL(whatsappUrl('Hallo S&S Messebau, Frage zu Messebau & Co.'))
    expect(url.origin).toBe('https://wa.me')
    expect(url.pathname).toBe(`/${CONTACT.whatsappNumber}`)
    expect(url.searchParams.get('text')).toBe('Hallo S&S Messebau, Frage zu Messebau & Co.')
    // Das "&" aus "S&S" darf den Query-String nicht aufbrechen
    expect([...url.searchParams.keys()]).toEqual(['text'])
  })

  it('liefert ohne Nachricht einen Link ohne Query', () => {
    expect(whatsappUrl()).toBe(`https://wa.me/${CONTACT.whatsappNumber}`)
    expect(whatsappUrl('   ')).toBe(`https://wa.me/${CONTACT.whatsappNumber}`)
  })
})
