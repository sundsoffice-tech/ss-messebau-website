import { marked } from 'marked'
import DOMPurify from 'dompurify'

/** Klasse des Rahmens um jede Tabelle; die Regeln dazu stehen in BlogPostDetail.tsx. */
export const TABELLEN_RAHMEN_KLASSE = 'tabelle-rollbar'

function maskiereAttribut(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Setzt jede Tabelle in einen seitlich rollbaren Rahmen.
 *
 * Grund (gemessen 10.11.2026): Tabellen mit drei und vier Spalten machten zwei Artikel auf dem Telefon
 * 528 und 562 Punkt breit, bei 390 Punkt Schirm, und die ganze Seite wackelte seitlich. Der Rahmen rollt
 * für sich; er ist per Tastatur erreichbar (tabindex) und für Vorleseprogramme benannt.
 */
export function tabellenInRahmen(html: string, beschriftung: string): string {
  const oeffnen = `<div class="${TABELLEN_RAHMEN_KLASSE}" role="region" tabindex="0" aria-label="${maskiereAttribut(beschriftung)}">`
  return html
    .replace(/<table(?=[\s>])/g, (treffer) => oeffnen + treffer)
    .replace(/<\/table>/g, '</table></div>')
}

/** Wandelt den Markdown-Text eines Artikels in geprüftes HTML für die Detailseite. */
export function blogInhaltZuHtml(markdown: string, tabellenBeschriftung: string): string {
  const rohHtml = marked.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(tabellenInRahmen(rohHtml, tabellenBeschriftung), {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'span', 'div', 'figure', 'figcaption'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height', 'loading', 'decoding', 'role', 'tabindex', 'aria-label'],
  })
}
