import { MesseEvent, NewsItem } from './types'

/**
 * Curated list of trade fairs for 2025/2026/2027.
 * API-ready: Can be replaced by AUMA/Eventbrite API data later.
 */
export const MESSE_EVENTS: MesseEvent[] = [
  {
    id: 'anuga-2025',
    name: 'Anuga',
    location: 'Köln',
    startDate: '2025-10-04',
    endDate: '2025-10-08',
    category: 'food',
    website: 'https://www.anuga.com',
    description: 'Weltleitmesse für Ernährungswirtschaft und Nahrungsmittelindustrie.',
    ssPresent: true,
  },
  {
    id: 'ism-2026',
    name: 'ISM',
    location: 'Köln',
    startDate: '2026-02-01',
    endDate: '2026-02-04',
    category: 'food',
    website: 'https://www.ism-cologne.de',
    description: 'Internationale Süßwarenmesse – die weltweit größte Messe für Süßwaren und Snacks.',
    ssPresent: true,
  },
  {
    id: 'hannover-messe-2026',
    name: 'Hannover Messe',
    location: 'Hannover',
    startDate: '2026-04-20',
    endDate: '2026-04-24',
    category: 'industrie',
    website: 'https://www.hannovermesse.de',
    description: 'Weltleitmesse der Industrie – Technologie, Innovation und Zukunft.',
    ssPresent: true,
  },
  {
    id: 'internorga-2026',
    name: 'Internorga',
    location: 'Hamburg',
    startDate: '2026-03-13',
    endDate: '2026-03-17',
    category: 'food',
    website: 'https://www.internorga.com',
    description: 'Internationale Leitmesse für den gesamten Außer-Haus-Markt.',
    ssPresent: false,
  },
  {
    id: 'dkm-2026',
    name: 'DKM',
    location: 'Dortmund',
    startDate: '2026-10-27',
    endDate: '2026-10-28',
    category: 'versicherungen',
    website: 'https://www.die-leitmesse.de',
    description: 'Die Leitmesse der Finanz- und Versicherungsbranche.',
    ssPresent: true,
  },
  {
    id: 'biofach-2026',
    name: 'BIOFACH',
    location: 'Nürnberg',
    startDate: '2026-02-10',
    endDate: '2026-02-13',
    category: 'food',
    website: 'https://www.biofach.de',
    description: 'Weltleitmesse für Bio-Lebensmittel.',
    ssPresent: false,
  },
  {
    id: 'iba-2027',
    name: 'iba',
    location: 'München',
    startDate: '2027-10-24',
    endDate: '2027-10-28',
    category: 'food',
    website: 'https://www.iba.de',
    description: 'Weltleitmesse für Bäckerei, Konditorei und Snacks.',
    ssPresent: false,
  },
  {
    id: 'hannover-messe-2027',
    name: 'Hannover Messe',
    location: 'Hannover',
    startDate: '2027-04-19',
    endDate: '2027-04-23',
    category: 'industrie',
    website: 'https://www.hannovermesse.de',
    description: 'Weltleitmesse der Industrie – Technologie, Innovation und Zukunft.',
    ssPresent: true,
  },
  {
    id: 'anuga-2027',
    name: 'Anuga',
    location: 'Köln',
    startDate: '2027-10-09',
    endDate: '2027-10-13',
    category: 'food',
    website: 'https://www.anuga.com',
    description: 'Weltleitmesse für Ernährungswirtschaft und Nahrungsmittelindustrie.',
    ssPresent: true,
  },
]

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'S&S Messebau auf der Anuga 2025',
    excerpt: 'Wir sind als Messebau-Partner auf der Anuga 2025 in Köln vertreten. Besuchen Sie uns und entdecken Sie unsere neuesten Standkonzepte für die Food-Branche.',
    date: '2025-08-15',
    category: 'Messen',
  },
  {
    id: 'news-2',
    title: 'Neues Nachhaltigkeitskonzept für Messestände',
    excerpt: 'Ab sofort bieten wir ein erweitertes Nachhaltigkeitskonzept: Wiederverwendbare Systemelemente, CO₂-reduzierte Materialien und zertifizierte Recycling-Partner.',
    date: '2025-06-01',
    category: 'Nachhaltigkeit',
  },
  {
    id: 'news-3',
    title: 'Hannover Messe 2026 – Jetzt Standplanung starten',
    excerpt: 'Die Hannover Messe 2026 wirft ihre Schatten voraus. Sichern Sie sich frühzeitig Ihren individuellen Messestand – wir beraten Sie gerne.',
    date: '2025-11-10',
    category: 'Messen',
  },
  {
    id: 'news-4',
    title: '48h-Angebotsgarantie jetzt auch für Großprojekte',
    excerpt: 'Unsere beliebte 48h-Angebotsgarantie gilt ab sofort auch für Standprojekte über 100 m². Schnelle Planung, transparente Kosten.',
    date: '2026-01-20',
    category: 'Service',
  },
]

/**
 * Returns upcoming events sorted chronologically.
 * API-ready: This function can be replaced with a fetch call later.
 */
export function getUpcomingEvents(referenceDate?: Date): MesseEvent[] {
  const now = referenceDate ?? new Date()
  return MESSE_EVENTS
    .filter(event => new Date(event.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

/**
 * Returns the next upcoming event.
 */
export function getNextEvent(referenceDate?: Date): MesseEvent | undefined {
  const upcoming = getUpcomingEvents(referenceDate)
  return upcoming[0]
}

/**
 * Calculates the number of days until a given date.
 */
export function getDaysUntil(dateStr: string, referenceDate?: Date): number {
  const now = referenceDate ?? new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Returns news items sorted by date (newest first).
 */
export function getLatestNews(): NewsItem[] {
  return [...NEWS_ITEMS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Category label mapping for display.
 */
export const CATEGORY_LABELS: Record<MesseEvent['category'], string> = {
  food: 'Food & Feinkost',
  industrie: 'Industrie & Technik',
  versicherungen: 'Versicherungen',
  allgemein: 'Allgemein',
}
