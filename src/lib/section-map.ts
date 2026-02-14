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
    { id: 'testimonials', label: 'Kundenstimmen', page: '/' },
    { id: 'cta', label: 'Kontakt', page: '/' }
  ],
  '/leistungen': [
    { id: 'messebau', label: 'Messebau', page: '/leistungen' },
    { id: 'touren', label: 'Touren & Messeauftritte', page: '/leistungen' },
    { id: 'showrooms', label: 'Showrooms & Brand Spaces', page: '/leistungen' },
    { id: 'eventbau', label: 'Eventbau & Bühnen', page: '/leistungen' },
    { id: 'ladenbau', label: 'Ladenbau & Showrooms', page: '/leistungen' },
    { id: 'boeden-ausstattung', label: 'Böden & Ausstattung', page: '/leistungen' }
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
  'home-to-messebau': { page: '/leistungen', section: 'messebau', label: 'Messebau' },
  'home-to-touren': { page: '/leistungen', section: 'touren', label: 'Touren & Messeauftritte' },
  'home-to-trockenbau': { page: '/leistungen', section: 'showrooms', label: 'Showrooms & Brand Spaces' },
  'home-to-eventbau': { page: '/leistungen', section: 'eventbau', label: 'Eventbau' },
  'home-to-ladenbau': { page: '/leistungen', section: 'ladenbau', label: 'Ladenbau' },
  'home-to-boeden': { page: '/leistungen', section: 'boeden-ausstattung', label: 'Böden & Möbel' },
  
  'nav-to-food': { page: '/branchen', section: 'food', label: 'Food & Feinkost' },
  'nav-to-versicherungen': { page: '/branchen', section: 'versicherungen', label: 'Versicherungen' },
  'nav-to-industrie': { page: '/branchen', section: 'industrie', label: 'Industrie & Technik' },
  
  'footer-to-kontakt': { page: '/kontakt', section: 'kontaktformular', label: 'Kontakt' },
  'footer-to-anfahrt': { page: '/kontakt', section: 'anfahrt', label: 'Anfahrt' }
}

export function getThematicLink(key: string): { page: string; section: string; label: string } | undefined {
  return THEMATIC_LINKS[key]
}
