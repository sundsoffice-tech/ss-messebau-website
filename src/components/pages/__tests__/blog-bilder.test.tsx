import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import startseite from '../../../../index.html?raw'
import htaccess from '../../../../public/.htaccess?raw'
import { DEMO_BLOG_POSTS } from '@/lib/demo-blog-posts'
import { blogBild, getBlogFallbackImage } from '@/lib/blog-image-defaults'
import { BlogPostCard } from '../BlogPostCard'
import type { BlogPost } from '@/lib/types'

/**
 * Die Blogbilder waren zum Teil eingebundene Vorschaubilder eines Bildanbieters ohne
 * belegte Lizenz (Prüfung Wettbewerbsrecht 10.11.2026). Bilder kommen nur noch aus dem
 * eigenen Ordner oder von der einen Quelle, deren Lizenz die freie Nutzung erlaubt;
 * ein Beitrag ohne Bild zeigt ein neutrales Feld statt eines fremden Fotos.
 */

// Der Name des Anbieters steht hier geteilt, damit die Suche diese Datei nicht selbst trifft.
const ANBIETER = new RegExp(['istock', 'photo'].join(''), 'i')
const ERLAUBT = /^(\/images\/|https:\/\/images\.unsplash\.com\/)/

const quelltexte = import.meta.glob(['../../../**/*.{ts,tsx,json}', '!**/__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const beitrag = (aenderung: Partial<BlogPost>): BlogPost => ({ ...DEMO_BLOG_POSTS[0], ...aenderung })

afterEach(() => cleanup())

describe('Blogbilder nur aus eigener oder frei nutzbarer Quelle', () => {
  it('kein Quelltext, keine Startseite und keine Serverregel nennt den Bildanbieter', () => {
    expect(Object.keys(quelltexte).length).toBeGreaterThan(100)
    const treffer = Object.entries(quelltexte).filter(([, text]) => ANBIETER.test(text)).map(([pfad]) => pfad)
    expect(treffer).toEqual([])
    expect(ANBIETER.test(startseite)).toBe(false)
    expect(ANBIETER.test(htaccess)).toBe(false)
    // Gegenprobe: Die Dateien sind wirklich gelesen worden
    expect(startseite).toContain('img-src')
    expect(htaccess).toContain('img-src')
  })

  it('jeder Beitrag trägt ein Bild aus erlaubter Quelle oder keines', () => {
    expect(DEMO_BLOG_POSTS.length).toBeGreaterThan(3)
    for (const post of DEMO_BLOG_POSTS) {
      const bild = blogBild(post)
      if (bild !== undefined) expect(bild, post.slug).toMatch(ERLAUBT)
    }
    // Beiträge ohne eigenes Bild gibt es, sonst prüfte der Fall darunter nichts Echtes
    expect(DEMO_BLOG_POSTS.some((post) => blogBild(post) === undefined)).toBe(true)
  })

  it('eine Kategorie ohne Eintrag bekommt kein fremdes Rückfallbild', () => {
    expect(getBlogFallbackImage('Budget')).toBeUndefined()
    expect(getBlogFallbackImage('unbekannt')).toBeUndefined()
    expect(blogBild({ imageUrl: '  ', category: 'Kosten' })).toBeUndefined()
    expect(blogBild({ imageUrl: '/images/eigen.jpg', category: 'Kosten' })).toBe('/images/eigen.jpg')
  })

  it('die Karte zeigt ohne Bild das neutrale Feld und kein img', () => {
    const { container } = render(<BlogPostCard post={beitrag({ imageUrl: '', category: 'Budget' })} onNavigate={() => {}} />)
    expect(container.querySelector('img')).toBeNull()
    const feld = container.querySelector('[data-blog-bild-ersatz]')
    expect(feld).not.toBeNull()
    expect(feld?.getAttribute('aria-hidden')).toBe('true')
    expect(feld?.querySelector('svg')).not.toBeNull()
  })

  it('die Karte zeigt mit Bild das Bild und kein Feld', () => {
    const { container } = render(<BlogPostCard post={beitrag({ imageUrl: '/images/eigen.jpg' })} onNavigate={() => {}} />)
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/eigen.jpg')
    expect(container.querySelector('[data-blog-bild-ersatz]')).toBeNull()
  })
})
