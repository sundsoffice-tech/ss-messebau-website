/**
 * Rückfallbilder je Blog-Kategorie für Beiträge ohne eigenes Bild.
 *
 * Für eine Kategorie ohne Eintrag gibt es kein Bild: Die Karte zeigt dann ein neutrales
 * Feld mit Symbol (`BlogBildErsatz`) statt eines fremden Fotos, im Beitrag entfällt der Bildblock.
 * Die früheren Einträge für „messebau“, „nachhaltigkeit“ und „sonstiges“ waren
 * eingebundene Vorschaubilder eines Bildanbieters ohne belegte Lizenz und sind
 * entfernt (Prüfung Wettbewerbsrecht 10.11.2026). Ein neues Bild kommt nur mit
 * Lizenz oder als eigenes Foto unter `public/images/` hierher.
 */

const BLOG_CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  messen: 'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=800&h=450&fit=crop',
  service: 'https://images.unsplash.com/photo-1553034545-32d4cd2168f1?w=800&h=450&fit=crop',
  branchen: 'https://images.unsplash.com/photo-1503147658877-b6636154a299?w=800&h=450&fit=crop',
}

export function getBlogFallbackImage(category: string): string | undefined {
  return BLOG_CATEGORY_FALLBACK_IMAGES[category]
}

/** Das Bild eines Beitrags: sein eigenes, sonst das der Kategorie, sonst keines. */
export function blogBild(post: { imageUrl?: string; category: string }): string | undefined {
  return (post.imageUrl || '').trim() || getBlogFallbackImage(post.category)
}
