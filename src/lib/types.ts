export interface ContactInquiry {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  event?: string
  size?: string
  budget?: string
  messesProJahr?: string
  message: string
  timestamp: number
}

export interface Reference {
  id: string
  title: string
  branche: 'food' | 'versicherungen' | 'industrie'
  size: string
  type: 'messebau' | 'eventbau' | 'ladenbau'
  imageUrl: string
  description: string
  challenge: string
  solution: string
  result: string
  keyfacts: string[]
  kunde?: string
  messe?: string
  zielsetzung?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  imageUrl: string
  publishedAt: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface MesseEvent {
  id: string
  name: string
  location: string
  startDate: string // ISO date string
  endDate: string   // ISO date string
  category: 'food' | 'industrie' | 'versicherungen' | 'allgemein'
  website?: string
  description: string
  ssPresent: boolean // S&S Messebau vor Ort
}

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  date: string // ISO date string
  category: string
  link?: string
}
