import { describe, it, expect } from 'vitest'
import { blogInhaltZuHtml, tabellenInRahmen, TABELLEN_RAHMEN_KLASSE } from '../blog-inhalt'
import { DEMO_BLOG_POSTS } from '../demo-blog-posts'

function alsDokument(html: string) {
  const d = document.createElement('div')
  d.innerHTML = html
  return d
}

describe('Blogartikel: Tabellen im rollbaren Rahmen', () => {
  it('jede Tabelle liegt in genau einem benannten, per Tastatur erreichbaren Rahmen', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |\n\nText\n\n| C | D |\n|---|---|\n| 3 | 4 |\n'
    const d = alsDokument(blogInhaltZuHtml(md, 'Tabelle, seitlich verschiebbar'))
    const tabellen = d.querySelectorAll('table')
    expect(tabellen.length).toBe(2)
    tabellen.forEach((t) => {
      const rahmen = t.parentElement!
      expect(rahmen.className).toBe(TABELLEN_RAHMEN_KLASSE)
      expect(rahmen.getAttribute('tabindex')).toBe('0')
      expect(rahmen.getAttribute('role')).toBe('region')
      expect(rahmen.getAttribute('aria-label')).toBe('Tabelle, seitlich verschiebbar')
      expect(rahmen.children.length).toBe(1)
    })
    expect(d.querySelectorAll(`.${TABELLEN_RAHMEN_KLASSE}`).length).toBe(2)
  })

  it('Text ohne Tabelle bleibt ohne Rahmen', () => {
    const html = blogInhaltZuHtml('## Titel\n\nAbsatz', 'x')
    expect(html).not.toContain(TABELLEN_RAHMEN_KLASSE)
    expect(html).toContain('<h2>Titel</h2>')
  })

  it('die Beschriftung kann das Attribut nicht verlassen', () => {
    const html = tabellenInRahmen('<table><tr><td>1</td></tr></table>', '"><script>x</script>')
    expect(html).not.toContain('<script>')
    expect(alsDokument(html).querySelectorAll('script').length).toBe(0)
  })

  it('Skripte im Artikeltext werden weiter entfernt', () => {
    const html = blogInhaltZuHtml('Hallo <script>alert(1)</script> <img src=x onerror=alert(1)>', 'x')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })
})

describe('Blogartikel: eine Hauptüberschrift, kein Datum im Fließtext', () => {
  it.each(DEMO_BLOG_POSTS.map((p) => [p.slug, p] as const))('%s', (_slug, post) => {
    const d = alsDokument(blogInhaltZuHtml(post.content, 'x'))
    // Die Hauptüberschrift setzt die Detailseite aus post.title; im Text darf keine zweite stehen.
    expect(d.querySelectorAll('h1').length).toBe(0)
    // Der Titel steht nicht noch einmal als Zwischenüberschrift im Text.
    const titel = post.title.toLowerCase()
    d.querySelectorAll('h2, h3').forEach((h) => {
      const text = (h.textContent || '').trim().toLowerCase()
      expect(text.length > 12 && titel.includes(text), `Überschrift wiederholt den Titel: ${text}`).toBe(false)
    })
    // Das Datum zeigt die Detailseite aus publishedAt; eine zweite Angabe im Text kann nur abweichen.
    expect(post.content).not.toMatch(/Veröffentlicht:/)
    // Jede Tabelle des Artikels liegt im Rahmen.
    d.querySelectorAll('table').forEach((t) => {
      expect(t.parentElement!.className).toBe(TABELLEN_RAHMEN_KLASSE)
    })
  })
})
