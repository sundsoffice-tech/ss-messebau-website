/**
 * Bilder der Blogartikel. Alle liegen auf dem eigenen Server unter `public/images/`:
 * Die Datenschutzerklärung sagt zu, dass der Browser Bilder nicht von einem fremden
 * Dienst lädt (`privacy.medien.text1`), und die CSP erlaubt nur `img-src 'self' data:`.
 * Verwendet werden nur eigene Projektfotos, keine Stockbilder.
 */

const BLOG_CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  messebau: '/images/deligreece-messestand-100qm-food-2.jpeg',
  messen: '/images/messetouren-roadshow-aufbau.jpeg',
  nachhaltigkeit: '/images/ladenbau/showroom-bodenproben-ausstellung.jpg',
  service: '/images/boeden/besprechungsraum-vinylboden-moebel.jpg',
  branchen: '/images/deligreece-messestand-100qm-food-2.jpeg',
  sonstiges: '/images/messetouren-roadshow-aufbau.jpeg',
}

export function getBlogFallbackImage(category: string): string {
  return BLOG_CATEGORY_FALLBACK_IMAGES[category]
    || BLOG_CATEGORY_FALLBACK_IMAGES['messebau']
}

/**
 * Wahr, wenn die Adresse auf den eigenen Server zeigt: ein Pfad ab der Wurzel oder
 * eine volle Adresse mit dem Ursprung der Seite. `//host/…`, fremde Hosts und
 * `data:` zählen nicht.
 */
export function istEigenesBild(url: string | null | undefined): url is string {
  if (!url) return false
  if (url.startsWith('/')) return !url.startsWith('//')
  try {
    return new URL(url).origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Bildadresse eines Artikels. Trägt ein Artikel aus der Verwaltung eine fremde
 * Adresse, zeigt die Seite das eigene Kategoriebild, statt den Browser des Besuchers
 * zu einem fremden Server zu schicken.
 */
export function blogBild(imageUrl: string | null | undefined, category: string): string {
  return istEigenesBild(imageUrl) ? imageUrl : getBlogFallbackImage(category)
}
