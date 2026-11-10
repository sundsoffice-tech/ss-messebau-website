/**
 * Bilder der Blogartikel. Alle liegen auf dem eigenen Server unter `public/images/`:
 * Die Datenschutzerklärung sagt zu, dass der Browser Bilder nicht von einem fremden
 * Dienst lädt (`privacy.medien.text1`), und die CSP erlaubt nur `img-src 'self' data:`.
 * Verwendet werden nur eigene Projektfotos, keine Stockbilder.
 *
 * Hat ein Artikel kein eigenes Bild und seine Kategorie keinen Eintrag hier, gibt es
 * kein Bild: Die Karte zeigt dann ein neutrales Feld mit Symbol (`BlogBildErsatz`),
 * im Beitrag entfällt der Bildblock. Ein neues Bild kommt nur als eigenes Foto unter
 * `public/images/` hierher.
 */

const BLOG_CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  messebau: '/images/deligreece-messestand-100qm-food-2.jpeg',
  messen: '/images/messetouren-roadshow-aufbau.jpeg',
  nachhaltigkeit: '/images/ladenbau/showroom-bodenproben-ausstellung.jpg',
  service: '/images/boeden/besprechungsraum-vinylboden-moebel.jpg',
  branchen: '/images/deligreece-messestand-100qm-food-2.jpeg',
  sonstiges: '/images/messetouren-roadshow-aufbau.jpeg',
}

/** Das Bild der Kategorie; Groß- und Kleinschreibung zählt nicht. Ohne Eintrag gibt es keines. */
export function getBlogFallbackImage(category: string): string | undefined {
  return BLOG_CATEGORY_FALLBACK_IMAGES[category.trim().toLowerCase()]
}

/**
 * Wahr, wenn die Adresse auf den eigenen Server zeigt: ein Pfad ab der Wurzel oder
 * eine volle Adresse mit dem Ursprung der Seite. `//host/…`, `/\host/…` (Browser lesen
 * beides als fremden Host), fremde Hosts und `data:` zählen nicht.
 */
export function istEigenesBild(url: string | null | undefined): url is string {
  if (!url) return false
  if (url.startsWith('/')) return !url.startsWith('//') && !url.startsWith('/\\')
  try {
    return new URL(url).origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Das Bild eines Artikels: sein eigenes, sonst das der Kategorie, sonst keines.
 * Trägt ein Artikel aus der Verwaltung eine fremde Adresse, zählt sie nicht: Die Seite
 * schickt den Browser des Besuchers nicht zu einem fremden Server.
 */
export function blogBild(post: { imageUrl?: string | null; category: string }): string | undefined {
  return istEigenesBild(post.imageUrl) ? post.imageUrl : getBlogFallbackImage(post.category)
}
