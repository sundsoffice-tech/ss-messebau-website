import { useEffect } from 'react'
import seitenMeta from '@/lib/seiten-meta.json'

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
  }, [page])
}
