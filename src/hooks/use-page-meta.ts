import { useEffect } from 'react'

interface PageMeta {
  title: string
  description: string
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'S&S Messebau – Messestand 20–200 m² | Messebau NRW',
    description: 'S&S Messebau: Messestände 20–200 m² für Food, Finance & Industrie. 48h-Angebot mit persönlicher Beratung. Jetzt beraten lassen!'
  },
  '/leistungen': {
    title: 'Leistungen – Messebau, Eventbau & Showrooms | S&S Messebau',
    description: 'Full-Service Messebau von 20–200 m²: Messestände, Eventbau, Showrooms & Brand Spaces. Planung bis Abbau aus einer Hand.'
  },
  '/branchen': {
    title: 'Branchen-Expertise – Food, Finance & Industrie | S&S Messebau',
    description: 'S&S Messebau: Branchenspezifische Messestände für Food, Versicherungen & Industrie. Erfahrung auf Anuga, DKM, Hannover Messe.'
  },
  '/referenzen': {
    title: 'Referenzen – Messebau-Projekte 20–200 m² | S&S Messebau',
    description: 'Überzeugen Sie sich von unseren Messebau-Projekten: Individuelle Stände für Food, Finance & Industrie. Referenzen ansehen!'
  },
  '/ueber-uns': {
    title: 'Über S&S Messebau – Ihr Messestand-Partner aus NRW',
    description: 'S&S Messebau: Inhabergeführter Full-Service Messebau aus NRW. Persönliche Betreuung, bundesweite Umsetzung, 20–200 m².'
  },
  '/ablauf': {
    title: 'Ablauf – So entsteht Ihr Messestand | S&S Messebau',
    description: 'Von der Erstberatung bis zum Abbau: Der Projektablauf bei S&S Messebau. Transparente Prozesse, 48h-Angebote.'
  },
  '/nachhaltigkeit': {
    title: 'Nachhaltiger Messebau – Systembau & Wiederverwendung | S&S Messebau',
    description: 'Nachhaltige Messestände mit Systembauweise und Wiederverwendung. S&S Messebau für umweltbewusste Messeauftritte.'
  },
  '/blog': {
    title: 'Blog & Ratgeber – Messebau-Tipps | S&S Messebau',
    description: 'Praxis-Tipps rund um Messebau, Standgestaltung und erfolgreiche Messeauftritte. Blog von S&S Messebau.'
  },
  '/kontakt': {
    title: 'Kontakt – Jetzt Messestand anfragen | S&S Messebau',
    description: 'Kontaktieren Sie S&S Messebau für Ihr Messestand-Projekt. 48h-Angebot mit persönlicher Beratung. Jetzt unverbindlich anfragen!'
  },
  '/bannerrahmen': {
    title: 'Bannerrahmen-Systeme für Messe & Event | S&S Messebau',
    description: 'Professionelle Bannerrahmen-Systeme für Messe, Event und POS. Flexible Lösungen von S&S Messebau.'
  },
  '/banner-bestellen': {
    title: 'Banner bestellen – Konfigurator | S&S Messebau',
    description: 'Banner online konfigurieren und bestellen. Individuelle Formate für Messe und Event bei S&S Messebau.'
  },
  '/impressum': {
    title: 'Impressum | S&S Messebau GbR',
    description: 'Impressum der S&S Messebau GbR, Mönchengladbach. Angaben gemäß § 5 TMG.'
  },
  '/datenschutz': {
    title: 'Datenschutzerklärung | S&S Messebau GbR',
    description: 'Datenschutzerklärung der S&S Messebau GbR. Informationen zum Umgang mit Ihren Daten.'
  },
  '/ki-berater': {
    title: 'KI-Messeberater – Intelligente Beratung | S&S Messebau',
    description: 'Lassen Sie sich von unserem KI-Messeberater zu Ihrem Messestand beraten. Sofortige Antworten auf Ihre Fragen.'
  }
}

export function usePageMeta(page: string) {
  useEffect(() => {
    const meta = PAGE_META[page] || PAGE_META['/']
    
    document.title = meta.title
    
    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', meta.description)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description)
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', meta.title)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', meta.description)
    }
  }, [page])
}
