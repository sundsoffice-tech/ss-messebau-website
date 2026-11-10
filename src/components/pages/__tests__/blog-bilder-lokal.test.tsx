import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/react'
import { readFileSync, existsSync } from 'node:fs'
import { installBrowserShims } from '@/test/browser-shims'
import { DEMO_BLOG_POSTS } from '@/lib/demo-blog-posts'
import { blogBild, getBlogFallbackImage, istEigenesBild } from '@/lib/blog-image-defaults'
import { BlogPage } from '@/components/pages/BlogPage'
import deTexte from '@/locales/de.json'

/**
 * Blogbilder kommen vom eigenen Server (Rechtsprüfung 10.11.2026, Auflage 3).
 * Früher riefen sechs Artikel ihre Bilder direkt bei images.unsplash.com und
 * media.istockphoto.com ab; die Betreiber erfuhren dabei die IP-Adresse des Besuchers.
 *
 * Geprüft wird die gerenderte Blogseite samt einem Artikel aus der Verwaltung,
 * der eine fremde Bildadresse trägt, und die CSP in index.html.
 */

const FREMD = 'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=800'

vi.mock('@/lib/admin-content-service', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/admin-content-service')>()
  return {
    ...echt,
    getBlogPosts: vi.fn(async () => [
      {
        id: 'admin-1',
        title: 'Artikel aus der Verwaltung mit fremdem Bild',
        slug: 'artikel-aus-der-verwaltung',
        category: 'messen',
        imageUrl: 'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=800',
        excerpt: 'Kurztext',
        content: 'Inhalt',
        publishedAt: Date.now(),
        createdAt: 0,
        updatedAt: 0,
      },
    ]),
  }
})

const KATEGORIEN = ['messebau', 'messen', 'nachhaltigkeit', 'service', 'branchen', 'sonstiges', 'gibt-es-nicht']

beforeAll(() => {
  installBrowserShims()
})

beforeEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/blog')
})

describe('Blogbilder liegen auf dem eigenen Server', () => {
  it('jeder der sechs Artikel und jedes Kategoriebild zeigt auf eine vorhandene JPEG-Datei unter /images/', () => {
    expect(DEMO_BLOG_POSTS).toHaveLength(6)
    const adressen = [...DEMO_BLOG_POSTS.map((p) => p.imageUrl), ...KATEGORIEN.map(getBlogFallbackImage)]
    for (const adresse of adressen) {
      expect(adresse, adresse).toMatch(/^\/images\/[A-Za-z0-9/_-]+\.jpe?g$/)
      // Pfade relativ zum Arbeitsverzeichnis: vitest läuft in der Repo-Wurzel.
      expect(existsSync(`public${adresse}`), `public${adresse} fehlt`).toBe(true)
    }
    expect(existsSync('public/images/gibt-es-nicht.jpeg')).toBe(false)
    // Generiertes Titelbild mit fremdem Logo bleibt draußen.
    expect(adressen).not.toContain('/images/hero-messebau-startseite.jpg')
    // Sechs verschiedene Bilder in der Übersicht.
    expect(new Set(DEMO_BLOG_POSTS.map((p) => p.imageUrl)).size).toBe(6)
  })

  it('eine fremde Bildadresse wird durch das eigene Kategoriebild ersetzt', () => {
    expect(istEigenesBild(FREMD)).toBe(false)
    expect(istEigenesBild('//images.unsplash.com/x.jpg')).toBe(false)
    expect(istEigenesBild('data:image/png;base64,AAAA')).toBe(false)
    expect(istEigenesBild('')).toBe(false)
    expect(istEigenesBild(undefined)).toBe(false)
    expect(istEigenesBild('/images/messetouren-roadshow-aufbau.jpeg')).toBe(true)
    expect(istEigenesBild(`${window.location.origin}/images/eigenes.jpg`)).toBe(true)

    expect(blogBild(FREMD, 'messen')).toBe(getBlogFallbackImage('messen'))
    expect(blogBild('', 'service')).toBe(getBlogFallbackImage('service'))
    expect(blogBild('/images/eigenes.jpg', 'messen')).toBe('/images/eigenes.jpg')
  })

  it('auf der gerenderten Blogseite zeigt kein Bild auf einen fremden Host', async () => {
    const { container, findByText } = render(<BlogPage />)
    // Anker: Der Artikel aus der Verwaltung mit der fremden Adresse ist auf der Seite.
    await findByText('Artikel aus der Verwaltung mit fremdem Bild')

    const bilder = Array.from(container.querySelectorAll('img'))
    expect(bilder.length).toBeGreaterThanOrEqual(7)
    for (const bild of bilder) {
      const quelle = bild.getAttribute('src') ?? ''
      expect(quelle, bild.getAttribute('alt') ?? '').toMatch(/^\/images\//)
      expect(new URL(bild.src).host).toBe(window.location.host)
    }
    expect(container.innerHTML).not.toMatch(/unsplash|istockphoto/)
  })

  it('auch der einzelne Artikel und seine Angabe für Suchmaschinen nennen nur das eigene Bild', async () => {
    window.history.replaceState({}, '', '/blog/artikel-aus-der-verwaltung')
    const { container, findByRole } = render(<BlogPage />)
    await findByRole('heading', { level: 1, name: 'Artikel aus der Verwaltung mit fremdem Bild' })

    const bild = container.querySelector('img[alt="Artikel aus der Verwaltung mit fremdem Bild"]')
    expect(bild?.getAttribute('src')).toBe(getBlogFallbackImage('messen'))
    for (const jedes of Array.from(container.querySelectorAll('img'))) {
      expect(jedes.getAttribute('src') ?? '').toMatch(/^\/images\//)
    }
    await waitFor(() => {
      const schema = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .find((t) => t.includes('BlogPosting'))
      expect(schema).toBeTruthy()
      expect(JSON.parse(schema as string).image).toBe(`https://sunds-messebau.de${getBlogFallbackImage('messen')}`)
    })
  })
})

describe('CSP und Erklärung passen zu lokalen Bildern', () => {
  it('die Meta-CSP in index.html erlaubt Bilder nur von der eigenen Adresse und als data:', () => {
    const html = readFileSync('index.html', 'utf8')
    const csp = /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/.exec(html)?.[1] ?? ''
    const bilder = csp.split(';').map((r) => r.trim()).find((r) => r.startsWith('img-src'))
    expect(bilder).toBe("img-src 'self' data:")
    expect(csp).not.toMatch(/unsplash|istockphoto/)
  })

  it('Abschnitt 10 der Erklärung sagt: Schrift und Bilder liegen auf dem eigenen Server', () => {
    const de = deTexte as Record<string, string>
    expect(de['privacy.medien.text1']).toContain('Die Schrift und die Bilder der Website liegen auf unserem eigenen Server')
    expect(de['privacy.medien.text2']).toBeUndefined()
  })
})
