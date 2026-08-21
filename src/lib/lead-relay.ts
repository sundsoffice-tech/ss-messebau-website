/**
 * Lead-Relay: zweiter, unabhängiger Zustellweg für Anfragen.
 *
 * Jede Anfrage (Dialog „Anfrage" und Kontaktseite) geht zusätzlich zum eigenen
 * Backend (api/inquiries.php + SendGrid) an den Lead-Endpunkt des S&S-Ökosystems:
 *
 *     POST https://leads.sundsconnect.de/lead   (kunde = "messebau")
 *
 * Der Endpunkt speichert zuerst auf Platte (fsync) und verschickt erst danach die
 * Mail an Info@sundsmessebau.com — eine Anfrage kann ab dem 200 nicht mehr
 * verloren gehen, auch wenn SendGrid oder das Hostinger-Backend ausfallen.
 *
 * Vertrag: SCHNITTSTELLE-LEADS.md (Repo-Wurzel) bzw.
 * /opt/sunds-hub/schnittstellen/messebau-website-leads.md auf sunds-hub.
 *
 * Regeln dieses Moduls:
 * - wirft nie; ein Fehler hier darf das Formular nicht brechen
 * - sendet genau die im Vertrag zugesagten Felder, nichts darüber hinaus
 * - `botcheck` bleibt leer (Honigtopf des Endpunkts; gefüllt = Bot)
 */

export const LEAD_ENDPOINT = 'https://leads.sundsconnect.de/lead'
export const LEAD_KUNDE = 'messebau'

/** Felder, die der Lead-Endpunkt kennt (Vertrag § 2). */
export interface LeadPayload {
  kunde: typeof LEAD_KUNDE
  name: string
  telefon: string
  email: string
  firma: string
  plz: string
  nachricht: string
  seite: string
  botcheck: ''
}

export interface LeadRelayResult {
  ok: boolean
  vorgang?: string
  error?: string
}

/** Grenzen des Endpunkts (dienst.py → pruefe()). Wir schneiden vorher ab. */
const GRENZEN = { name: 120, telefon: 60, email: 180, firma: 160, plz: 10, nachricht: 4000, seite: 300 }

/** Zusatzfelder, die in die Nachricht übernommen werden (Reihenfolge = Anzeige). */
const ZUSATZ: Array<[key: string, label: string]> = [
  ['event', 'Messe/Event'],
  ['size', 'Standgröße'],
  ['budget', 'Budget'],
  ['messesProJahr', 'Messen/Jahr'],
  ['wunschtermin', 'Wunschtermin'],
  ['branche', 'Branche'],
  ['position', 'Position/Rolle'],
  ['wieGefunden', 'Gefunden über'],
  ['utm_source', 'UTM-Quelle'],
  ['utm_medium', 'UTM-Medium'],
  ['utm_campaign', 'UTM-Kampagne'],
]

const text = (v: unknown): string => (v === undefined || v === null ? '' : String(v)).trim()
const kuerze = (v: string, n: number): string => (v.length > n ? v.slice(0, n) : v)

export interface BuildLeadInput {
  /** Formularkontext, z. B. 'inquiry' | 'kontakt' */
  type: string
  /** Rohe Formulardaten (inkl. UTM) */
  data: Record<string, unknown>
  /** Interne Anfrage-ID der Website (inq-…), landet in der Nachricht */
  inquiryId: string
  /** Pfad der Seite; Standard: window.location.pathname */
  seite?: string
}

/** Baut die Nutzlast für POST /lead. Rein, ohne Seiteneffekte — testbar. */
export function buildLeadPayload(input: BuildLeadInput): LeadPayload {
  const d = input.data || {}
  const zeilen: string[] = []
  const nachricht = text(d.message)
  if (nachricht) zeilen.push(nachricht)

  const zusatz = ZUSATZ.map(([key, label]) => [label, text(d[key])] as const).filter(([, v]) => v)
  if (zusatz.length) {
    zeilen.push('', '— Angaben aus dem Formular —')
    for (const [label, v] of zusatz) zeilen.push(`${label}: ${v}`)
  }
  zeilen.push('', `Formular: ${input.type} · Website-Vorgang: ${input.inquiryId}`)

  let seite = input.seite
  if (seite === undefined) {
    seite = typeof window !== 'undefined' && window.location ? window.location.pathname : ''
  }

  return {
    kunde: LEAD_KUNDE,
    name: kuerze(text(d.name), GRENZEN.name),
    telefon: kuerze(text(d.phone ?? d.telefon), GRENZEN.telefon),
    email: kuerze(text(d.email), GRENZEN.email),
    firma: kuerze(text(d.company ?? d.firma ?? d.firmaKontakt), GRENZEN.firma),
    plz: kuerze(text(d.plz ?? d.zip), GRENZEN.plz),
    nachricht: kuerze(zeilen.join('\n'), GRENZEN.nachricht),
    seite: kuerze(seite, GRENZEN.seite),
    botcheck: '',
  }
}

/**
 * Schickt die Nutzlast an den Lead-Endpunkt. Wirft nie.
 * `keepalive` sorgt dafür, dass der Request auch dann noch rausgeht, wenn die
 * Seite direkt nach dem Absenden wechselt (Danke-Seite).
 */
export async function relayLeadToHub(
  payload: LeadPayload,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch; endpoint?: string } = {},
): Promise<LeadRelayResult> {
  const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined)
  if (!fetchImpl) return { ok: false, error: 'fetch nicht verfügbar' }
  const endpoint = options.endpoint ?? LEAD_ENDPOINT
  const timeoutMs = options.timeoutMs ?? 8000
  const controller = typeof AbortController === 'function' ? new AbortController() : undefined
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller?.signal,
    })
    let body: { ok?: boolean; vorgang?: string; fehler?: string } = {}
    try {
      body = (await res.json()) as typeof body
    } catch {
      /* keine/ungültige JSON-Antwort — unten als Fehler behandelt */
    }
    if (res.ok && body.ok) return { ok: true, vorgang: body.vorgang }
    return { ok: false, error: body.fehler || `HTTP ${res.status}` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Netzwerkfehler' }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Bequemer Einstieg für die Formulare: bauen + senden, nie werfen. */
export async function relayInquiryLead(input: BuildLeadInput): Promise<LeadRelayResult> {
  try {
    return await relayLeadToHub(buildLeadPayload(input))
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unbekannter Fehler' }
  }
}
