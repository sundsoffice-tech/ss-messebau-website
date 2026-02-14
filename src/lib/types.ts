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
