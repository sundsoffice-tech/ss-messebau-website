import { useEffect } from 'react'
import seitenMeta from '@/lib/seiten-meta.json'
import seitenMetaEn from '@/lib/seiten-meta-en.json'

interface PageMeta {
  title: string
  description: string
  ogType?: string
}

const SITE_URL = 'https://sunds-messebau.de'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

// Titel und Beschreibung je Pfad liegen in src/lib/seiten-meta.json, weil scripts/seiten-vorab.mjs
// dieselben Werte beim Build in die HTML-Datei jeder Seite schreibt (eine Quelle, zwei Nutzer).
const PAGE_META: Record<string, PageMeta> = seitenMeta
// Englische Titel und Beschreibungen für die englische Fassung. Seiten ohne Eintrag (die
// Blogbeiträge, deren Text deutsch ist) behalten die deutschen Angaben. Die vorab gebaute
// HTML-Datei jeder Seite bleibt deutsch; die englischen Angaben setzt erst die Anwendung.
const PAGE_META_EN: Record<string, PageMeta> = seitenMetaEn

/** Titel und Beschreibung einer Seite in der gewählten Sprache; unbekannte Seiten bekommen die der Startseite. */
export function seitenMetaFuer(page: string, lang: 'de' | 'en' = 'de'): PageMeta {
  const deutsch = PAGE_META[page]
  if (!deutsch) return (lang === 'en' && PAGE_META_EN['/']) || PAGE_META['/']
  const englisch = lang === 'en' ? PAGE_META_EN[page] : undefined
  return englisch ? { ...deutsch, ...englisch } : deutsch
}

export function usePageMeta(page: string, lang: 'de' | 'en' = 'de') {
  useEffect(() => {
    const meta = seitenMetaFuer(page, lang)
    
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

    const ogType = document.querySelector('meta[property="og:type"]')
    if (ogType) {
      ogType.setAttribute('content', meta.ogType || 'website')
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', DEFAULT_OG_IMAGE)
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', meta.title)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', meta.description)
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', DEFAULT_OG_IMAGE)
    }

    // Dynamic canonical URL (clean path without hash)
    const canonicalPath = page === '/' ? '' : page
    const canonicalUrl = `${SITE_URL}${canonicalPath}`

    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl)
    }

    // Dynamic og:url
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl)
    }
  }, [page, lang])
}
