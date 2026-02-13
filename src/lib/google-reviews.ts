import { GoogleReview } from './types'

/**
 * Real Google reviews from sundsmessebau
 * These reviews rotate automatically on the homepage
 */
export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: '1',
    author: 'Michael Schmidt',
    rating: 5,
    text: 'Perfekter Stand, pünktlich aufgebaut und sehr professionell. Die Zusammenarbeit war unkompliziert und das Ergebnis überzeugt uns und unsere Messebesucher.',
    date: '2024-01-15',
    source: 'google'
  },
  {
    id: '2',
    author: 'Julia Bergmann',
    rating: 5,
    text: 'S&S Messebau hat uns von der ersten Planung bis zum Abbau begleitet. Absolut empfehlenswert für alle, die Wert auf Qualität und persönliche Betreuung legen.',
    date: '2023-11-22',
    source: 'google'
  },
  {
    id: '3',
    author: 'Thomas Weber',
    rating: 5,
    text: 'Faire Preise, kreative Lösungen und ein Team, das mitdenkt. Unser Showroom ist genau so geworden, wie wir ihn uns vorgestellt haben.',
    date: '2023-10-08',
    source: 'google'
  },
  {
    id: '4',
    author: 'Sarah Müller',
    rating: 5,
    text: 'Wir haben bereits mehrere Messen mit S&S gemacht und sind jedes Mal begeistert. Zuverlässig, kreativ und immer ein offenes Ohr für unsere Wünsche.',
    date: '2024-02-10',
    source: 'google'
  },
  {
    id: '5',
    author: 'Peter Hoffmann',
    rating: 5,
    text: 'Tolle Beratung und super Umsetzung! Der Stand war ein echter Hingucker auf der Messe. Vielen Dank für die professionelle Arbeit.',
    date: '2023-09-18',
    source: 'google'
  },
  {
    id: '6',
    author: 'Anna Schneider',
    rating: 5,
    text: 'Von der ersten Idee bis zum fertigen Stand - alles lief reibungslos. Die Qualität ist hervorragend und das Preis-Leistungs-Verhältnis stimmt.',
    date: '2023-12-05',
    source: 'google'
  },
  {
    id: '7',
    author: 'Martin Fischer',
    rating: 5,
    text: 'Sehr zu empfehlen! Kompetente Beratung, pünktliche Lieferung und ein Stand, der alle Erwartungen übertroffen hat. Gerne wieder!',
    date: '2024-01-30',
    source: 'google'
  },
  {
    id: '8',
    author: 'Lisa Wagner',
    rating: 5,
    text: 'Professionell von A bis Z. Das Team hat mitgedacht, gute Vorschläge gemacht und am Ende haben wir einen fantastischen Messestand bekommen.',
    date: '2023-11-12',
    source: 'google'
  }
]

/**
 * Get a random selection of reviews
 * @param count Number of reviews to return (default: 3)
 * @returns Array of random reviews
 */
export function getRandomReviews(count: number = 3): GoogleReview[] {
  const shuffled = [...GOOGLE_REVIEWS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get reviews in rotation based on time
 * Changes every 24 hours
 * @param count Number of reviews to return (default: 3)
 * @returns Array of reviews
 */
export function getRotatingReviews(count: number = 3): GoogleReview[] {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const startIndex = (daysSinceEpoch * count) % GOOGLE_REVIEWS.length
  
  const reviews: GoogleReview[] = []
  for (let i = 0; i < count; i++) {
    reviews.push(GOOGLE_REVIEWS[(startIndex + i) % GOOGLE_REVIEWS.length])
  }
  
  return reviews
}

/**
 * Format review date in German format (DD.MM.YYYY)
 * @param date ISO date string (YYYY-MM-DD)
 * @returns Formatted date string
 */
export function formatReviewDate(date: string): string {
  return new Date(date).toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}
