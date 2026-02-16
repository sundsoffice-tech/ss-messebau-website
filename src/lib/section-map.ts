export interface SectionConfig {
  id: string
  label: string
  page: string
}

export const SECTION_MAP: Record<string, SectionConfig[]> = {
  '/': [
    { id: 'hero', label: 'Startseite', page: '/' },
    { id: 'services', label: 'Leistungsübersicht', page: '/' },
    { id: 'advantages', label: 'Unsere Vorteile', page: '/' },
    { id: '48h-garantie', label: '48h-Angebotsgarantie', page: '/' },
    { id: 'references', label: 'Referenzen', page: '/' },
    { id: 'process', label: 'Ablauf', page: '/' },
    { id: 'testimonials', label: 'Kundenstimmen', page: '/' },
    { id: 'cta', label: 'Kontakt', page: '/' }
  ],
  '/leistungen': [
    { id: 'services-grid', label: 'Leistungsübersicht', page: '/leistungen' },
    { id: 'cta', label: 'Kontakt', page: '/leistungen' }
  ],
  '/leistungen/messebau': [
    { id: 'hero', label: 'Messebau', page: '/leistungen/messebau' },
    { id: 'leistungen', label: 'Leistungen im Detail', page: '/leistungen/messebau' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/messebau' },
    { id: 'vorteile', label: 'Vorteile', page: '/leistungen/messebau' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/messebau' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/messebau' }
  ],
  '/leistungen/eventbau': [
    { id: 'hero', label: 'Eventbau', page: '/leistungen/eventbau' },
    { id: 'leistungen', label: 'Leistungen im Detail', page: '/leistungen/eventbau' },
    { id: 'einsatzbereiche', label: 'Einsatzbereiche', page: '/leistungen/eventbau' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/eventbau' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/eventbau' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/eventbau' }
  ],
  '/leistungen/showroom-ladenbau': [
    { id: 'hero', label: 'Showroom & Ladenbau', page: '/leistungen/showroom-ladenbau' },
    { id: 'leistungen', label: 'Leistungen im Detail', page: '/leistungen/showroom-ladenbau' },
    { id: 'einsatzbereiche', label: 'Einsatzbereiche', page: '/leistungen/showroom-ladenbau' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/showroom-ladenbau' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/showroom-ladenbau' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/showroom-ladenbau' }
  ],
  '/leistungen/touren': [
    { id: 'hero', label: 'Touren & Roadshows', page: '/leistungen/touren' },
    { id: 'leistungen', label: 'Leistungen im Detail', page: '/leistungen/touren' },
    { id: 'vorteile', label: 'Vorteile', page: '/leistungen/touren' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/touren' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/touren' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/touren' }
  ],
  '/leistungen/boeden-ausstattung': [
    { id: 'hero', label: 'Böden & Ausstattung', page: '/leistungen/boeden-ausstattung' },
    { id: 'leistungen', label: 'Leistungen im Detail', page: '/leistungen/boeden-ausstattung' },
    { id: 'materialien', label: 'Materialien', page: '/leistungen/boeden-ausstattung' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/boeden-ausstattung' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/boeden-ausstattung' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/boeden-ausstattung' }
  ],
  '/leistungen/digital-experience': [
    { id: 'hero', label: 'Digital Experience', page: '/leistungen/digital-experience' },
    { id: 'leistungen', label: 'Digitale Messelösungen', page: '/leistungen/digital-experience' },
    { id: 'technologien', label: 'Technologie-Bereiche', page: '/leistungen/digital-experience' },
    { id: 'prozess', label: 'Ablauf', page: '/leistungen/digital-experience' },
    { id: 'faq', label: 'Häufige Fragen', page: '/leistungen/digital-experience' },
    { id: 'referenzen', label: 'Kundenstimmen', page: '/leistungen/digital-experience' }
  ],
  '/branchen': [
    { id: 'food', label: 'Food & Feinkost', page: '/branchen' },
    { id: 'versicherungen', label: 'Versicherungen & Dienstleistungen', page: '/branchen' },
    { id: 'industrie', label: 'Industrie & Technik', page: '/branchen' }
  ],
  '/referenzen': [
    { id: 'filter', label: 'Projektfilter', page: '/referenzen' },
    { id: 'projekte', label: 'Projekte', page: '/referenzen' }
  ],
  '/ueber-uns': [
    { id: 'story', label: 'Unsere Geschichte', page: '/ueber-uns' },
    { id: 'team', label: 'Unser Team', page: '/ueber-uns' },
    { id: 'werte', label: 'Unsere Werte', page: '/ueber-uns' },
    { id: 'arbeitsweise', label: 'Unsere Arbeitsweise', page: '/ueber-uns' },
    { id: 'vergleich', label: 'Warum S&S Messebau', page: '/ueber-uns' }
  ],
  '/ablauf': [
    { id: 'prozess', label: 'Unser Prozess', page: '/ablauf' },
    { id: 'timeline', label: 'Projekt-Ablauf', page: '/ablauf' },
    { id: '48h-garantie', label: '48h-Angebotsgarantie', page: '/ablauf' },
    { id: 'faq', label: 'Häufige Fragen', page: '/ablauf' }
  ],
  '/nachhaltigkeit': [
    { id: 'systeme', label: 'Nachhaltige Systeme', page: '/nachhaltigkeit' },
    { id: 'partnernetzwerk', label: 'Partnernetzwerk', page: '/nachhaltigkeit' },
    { id: 'vorteile', label: 'Vorteile', page: '/nachhaltigkeit' }
  ],
  '/blog': [
    { id: 'artikel', label: 'Blog-Artikel', page: '/blog' }
  ],
  '/aktuelles': [
    { id: 'messekalender', label: 'Messekalender', page: '/aktuelles' },
    { id: 'news', label: 'News', page: '/aktuelles' }
  ],
  '/kontakt': [
    { id: 'kontaktformular', label: 'Kontaktformular', page: '/kontakt' },
    { id: 'anfahrt', label: 'Anfahrt', page: '/kontakt' },
    { id: 'ki-berater', label: 'KI-Berater', page: '/kontakt' }
  ],
  '/bannerrahmen': [
    { id: 'overview', label: 'Übersicht Bannerrahmen', page: '/bannerrahmen' },
    { id: 'arten', label: 'Rahmenarten', page: '/bannerrahmen' },
    { id: 'systeme', label: 'Systemlösungen', page: '/bannerrahmen' },
    { id: 'konfiguration', label: 'Konfiguration', page: '/bannerrahmen' }
  ],
  '/banner-bestellen': [
    { id: 'konfigurator', label: 'Konfigurator', page: '/banner-bestellen' },
    { id: 'ablauf', label: 'Bestellablauf', page: '/banner-bestellen' }
  ]
}

export function getSectionsByPage(page: string): SectionConfig[] {
  return SECTION_MAP[page] || []
}

export function findSection(sectionId: string): SectionConfig | undefined {
  for (const sections of Object.values(SECTION_MAP)) {
    const found = sections.find(s => s.id === sectionId)
    if (found) return found
  }
  return undefined
}

export function validateSectionExists(page: string, sectionId: string): boolean {
  const sections = SECTION_MAP[page]
  return sections ? sections.some(s => s.id === sectionId) : false
}

export function createSectionHash(page: string, sectionId?: string): string {
  if (!sectionId) return `#${page}`
  return `#${page}#${sectionId}`
}

export function parseSectionHash(hash: string): { page: string; section?: string } {
  const cleanHash = hash.replace(/^#/, '')
  const parts = cleanHash.split('#')
  
  if (parts.length === 1) {
    return { page: parts[0] || '/' }
  }
  
  return {
    page: parts[0] || '/',
    section: parts[1]
  }
}

export const THEMATIC_LINKS: Record<string, { page: string; section: string; label: string }> = {
  'home-to-messebau': { page: '/leistungen/messebau', section: 'hero', label: 'Messebau' },
  'home-to-touren': { page: '/leistungen/touren', section: 'hero', label: 'Touren & Messeauftritte' },
  'home-to-trockenbau': { page: '/leistungen/showroom-ladenbau', section: 'hero', label: 'Showroom & Ladenbau | Brandspaces' },
  'home-to-eventbau': { page: '/leistungen/eventbau', section: 'hero', label: 'Eventbau' },
  'home-to-ladenbau': { page: '/leistungen/showroom-ladenbau', section: 'hero', label: 'Showroom & Ladenbau' },
  'home-to-boeden': { page: '/leistungen/boeden-ausstattung', section: 'hero', label: 'Böden & Möbel' },
  
  'nav-to-food': { page: '/branchen', section: 'food', label: 'Food & Feinkost' },
  'nav-to-versicherungen': { page: '/branchen', section: 'versicherungen', label: 'Versicherungen' },
  'nav-to-industrie': { page: '/branchen', section: 'industrie', label: 'Industrie & Technik' },
  
  'footer-to-kontakt': { page: '/kontakt', section: 'kontaktformular', label: 'Kontakt' },
  'footer-to-anfahrt': { page: '/kontakt', section: 'anfahrt', label: 'Anfahrt' }
}

export function getThematicLink(key: string): { page: string; section: string; label: string } | undefined {
  return THEMATIC_LINKS[key]
}
