/**
 * Default fallback images per blog category.
 * Used when a blog post has no imageUrl set.
 */

const BLOG_CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  messebau: 'https://media.istockphoto.com/id/1350544847/de/foto/messestand-f%C3%BCr-mockup-und-corporate-identity-display-design-leerstand-design-retail.webp?a=1&b=1&s=612x612&w=0&k=20&c=xgg_tJcwyuWFvckoZsLN6cq-96DksORO9hx8-6dKBz8=',
  messen: 'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=800&h=450&fit=crop',
  nachhaltigkeit: 'https://media.istockphoto.com/id/1340881556/de/foto/eine-ikone-eines-erf%C3%BCllten-ziels-in-form-eines-klaren-teiches-inmitten-eines-%C3%BCppigen-waldes-3d.webp?a=1&b=1&s=612x612&w=0&k=20&c=j04yU1pWJWyja6tCMNW1ATl_zixPCCtlFahWRxj4kXQ=',
  service: 'https://images.unsplash.com/photo-1553034545-32d4cd2168f1?w=800&h=450&fit=crop',
  branchen: 'https://images.unsplash.com/photo-1503147658877-b6636154a299?w=800&h=450&fit=crop',
  sonstiges: 'https://media.istockphoto.com/id/2242753700/de/foto/budget-projektdaten-im-gesch%C3%A4ftsordner-mit-grafik.webp?a=1&b=1&s=612x612&w=0&k=20&c=C_OpRqf8xQE7JzY-LLcrPG2WezUJ61xcKNTzovZI96Y=',
}

export function getBlogFallbackImage(category: string): string {
  return BLOG_CATEGORY_FALLBACK_IMAGES[category]
    || BLOG_CATEGORY_FALLBACK_IMAGES['messebau']
}
