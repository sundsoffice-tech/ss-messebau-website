import { describe, it, expect, vi } from 'vitest'
import {
  buildLeadPayload,
  relayLeadToHub,
  relayInquiryLead,
  LEAD_ENDPOINT,
  LEAD_KUNDE,
} from '../lead-relay'

const VERTRAGSFELDER = ['kunde', 'name', 'telefon', 'email', 'firma', 'plz', 'nachricht', 'seite', 'botcheck'].sort()

describe('buildLeadPayload', () => {
  it('bildet die Website-Felder auf den Vertrag des Lead-Endpunkts ab', () => {
    const p = buildLeadPayload({
      type: 'kontakt',
      inquiryId: 'inq-123',
      seite: '/kontakt',
      data: {
        name: '  Erika Muster ',
        email: 'erika@example.org',
        company: 'Muster GmbH',
        phone: '+49 2161 123456',
        message: 'Wir brauchen einen Stand.',
        event: 'Anuga 2026',
        size: '50 m²',
        utm_source: 'google',
      },
    })
    expect(p.kunde).toBe(LEAD_KUNDE)
    expect(p.name).toBe('Erika Muster')
    expect(p.email).toBe('erika@example.org')
    expect(p.firma).toBe('Muster GmbH')
    expect(p.telefon).toBe('+49 2161 123456')
    expect(p.seite).toBe('/kontakt')
    expect(p.botcheck).toBe('')
    expect(p.nachricht).toContain('Wir brauchen einen Stand.')
    expect(p.nachricht).toContain('Messe/Event: Anuga 2026')
    expect(p.nachricht).toContain('Standgröße: 50 m²')
    expect(p.nachricht).toContain('UTM-Quelle: google')
    expect(p.nachricht).toContain('Website-Vorgang: inq-123')
  })

  it('sendet genau die zugesagten Felder — nichts darüber hinaus (Zusagenliste, KONVENTION § 8.4)', () => {
    const p = buildLeadPayload({ type: 'inquiry', inquiryId: 'inq-1', seite: '/', data: { name: 'A B', email: 'a@b.de', geheim: 'x' } })
    expect(Object.keys(p).sort()).toEqual(VERTRAGSFELDER)
    expect(JSON.stringify(p)).not.toContain('geheim')
  })

  it('lässt Telefon leer, wenn die Website keins hat (Endpunkt: telefon_pflicht=false für messebau)', () => {
    const p = buildLeadPayload({ type: 'inquiry', inquiryId: 'inq-1', seite: '/', data: { name: 'A B', email: 'a@b.de' } })
    expect(p.telefon).toBe('')
    expect(p.email).toBe('a@b.de')
  })

  it('kürzt auf die Grenzen des Endpunkts', () => {
    const p = buildLeadPayload({
      type: 'inquiry',
      inquiryId: 'inq-1',
      seite: '/',
      data: { name: 'x'.repeat(500), message: 'y'.repeat(5000), company: 'z'.repeat(500) },
    })
    expect(p.name.length).toBe(120)
    expect(p.firma.length).toBe(160)
    expect(p.nachricht.length).toBe(4000)
  })

  it('fällt ohne explizite Seite auf window.location.pathname zurück', () => {
    const p = buildLeadPayload({ type: 'inquiry', inquiryId: 'inq-1', data: { name: 'A B' } })
    expect(p.seite).toBe(window.location.pathname)
  })
})

describe('relayLeadToHub', () => {
  const payload = buildLeadPayload({ type: 'inquiry', inquiryId: 'inq-1', seite: '/', data: { name: 'A B', email: 'a@b.de' } })

  it('meldet ok + Vorgang bei 200 {ok:true}', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true, vorgang: 'abc123' }), { status: 200 }))
    const r = await relayLeadToHub(payload, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r).toEqual({ ok: true, vorgang: 'abc123' })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(LEAD_ENDPOINT)
    expect(init.method).toBe('POST')
    expect(init.keepalive).toBe(true)
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(JSON.parse(String(init.body))).toEqual(payload)
  })

  it('meldet den Fehlertext des Endpunkts bei 4xx', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: false, fehler: 'Herkunft nicht freigegeben' }), { status: 403 }))
    const r = await relayLeadToHub(payload, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.ok).toBe(false)
    expect(r.error).toBe('Herkunft nicht freigegeben')
  })

  it('wirft nie — Netzwerkfehler werden zu ok:false', async () => {
    const fetchImpl = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    const r = await relayLeadToHub(payload, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r).toEqual({ ok: false, error: 'Failed to fetch' })
  })

  it('behandelt eine 200-Antwort ohne JSON als Fehler', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>', { status: 200 }))
    const r = await relayLeadToHub(payload, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.ok).toBe(false)
  })
})

describe('relayInquiryLead', () => {
  it('wirft nie, auch wenn fetch fehlt', async () => {
    const original = globalThis.fetch
    // @ts-expect-error absichtlich entfernt
    globalThis.fetch = undefined
    try {
      const r = await relayInquiryLead({ type: 'inquiry', inquiryId: 'inq-1', seite: '/', data: { name: 'A B' } })
      expect(r.ok).toBe(false)
    } finally {
      globalThis.fetch = original
    }
  })
})
