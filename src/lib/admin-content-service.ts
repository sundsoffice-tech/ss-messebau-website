/**
 * Admin content service for managing Blog posts, Messe events, and external API keys.
 * Uses localStorage with spark_kv_ prefix for persistent storage.
 */

// ─── Types ───────────────────────────────────────────────────

export interface AdminBlogPost {
  id: string
  title: string
  slug: string
  category: string
  imageUrl: string
  excerpt: string
  content: string
  publishedAt: number
  createdAt: number
  updatedAt: number
}

export interface AdminMesseEvent {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  category: 'food' | 'industrie' | 'versicherungen' | 'allgemein'
  website: string
  description: string
  ssPresent: boolean
  imageUrl: string
  createdAt: number
  updatedAt: number
}

export interface AdminApiKey {
  id: string
  serviceName: string
  maskedKey: string
  description: string
  createdAt: number
  updatedAt: number
}

// ─── Constants ───────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  { value: 'messebau', label: 'Messebau' },
  { value: 'messen', label: 'Messen & Events' },
  { value: 'nachhaltigkeit', label: 'Nachhaltigkeit' },
  { value: 'service', label: 'Service & Tipps' },
  { value: 'branchen', label: 'Branchen' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const

export const MESSE_CATEGORIES = [
  { value: 'food', label: 'Food & Feinkost' },
  { value: 'industrie', label: 'Industrie & Technik' },
  { value: 'versicherungen', label: 'Versicherungen' },
  { value: 'allgemein', label: 'Allgemein' },
] as const

// ─── Storage Helpers ─────────────────────────────────────────

const KV_KEYS = {
  blogPosts: 'admin_blog_posts',
  messeEvents: 'admin_messe_events',
  apiKeys: 'admin_api_keys',
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function maskKey(key: string): string {
  if (key.length <= 4) return '••••••••'
  return '••••••••' + key.slice(-4)
}

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`spark_kv_${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(`spark_kv_${key}`, JSON.stringify(value))
  } catch {
    console.error('Failed to save to storage:', key)
  }
}

// ─── Slug Helper ─────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Blog CRUD ───────────────────────────────────────────────

export function getBlogPosts(): AdminBlogPost[] {
  return getFromStorage<AdminBlogPost[]>(KV_KEYS.blogPosts, [])
}

export function addBlogPost(post: Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>): AdminBlogPost {
  const posts = getBlogPosts()
  const now = Date.now()
  const newPost: AdminBlogPost = {
    ...post,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  posts.push(newPost)
  saveToStorage(KV_KEYS.blogPosts, posts)
  return newPost
}

export function updateBlogPost(id: string, updates: Partial<Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>>): void {
  const posts = getBlogPosts()
  const post = posts.find(p => p.id === id)
  if (post) {
    Object.assign(post, updates, { updatedAt: Date.now() })
    saveToStorage(KV_KEYS.blogPosts, posts)
  }
}

export function deleteBlogPost(id: string): void {
  const posts = getBlogPosts()
  const updated = posts.filter(p => p.id !== id)
  saveToStorage(KV_KEYS.blogPosts, updated)
}

// ─── Messe CRUD ──────────────────────────────────────────────

export function getMesseEvents(): AdminMesseEvent[] {
  return getFromStorage<AdminMesseEvent[]>(KV_KEYS.messeEvents, [])
}

export function addMesseEvent(event: Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>): AdminMesseEvent {
  const events = getMesseEvents()
  const now = Date.now()
  const newEvent: AdminMesseEvent = {
    ...event,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  events.push(newEvent)
  saveToStorage(KV_KEYS.messeEvents, events)
  return newEvent
}

export function updateMesseEvent(id: string, updates: Partial<Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>>): void {
  const events = getMesseEvents()
  const event = events.find(e => e.id === id)
  if (event) {
    Object.assign(event, updates, { updatedAt: Date.now() })
    saveToStorage(KV_KEYS.messeEvents, events)
  }
}

export function deleteMesseEvent(id: string): void {
  const events = getMesseEvents()
  const updated = events.filter(e => e.id !== id)
  saveToStorage(KV_KEYS.messeEvents, updated)
}

// ─── API Keys CRUD ───────────────────────────────────────────

export function getApiKeys(): AdminApiKey[] {
  return getFromStorage<AdminApiKey[]>(KV_KEYS.apiKeys, [])
}

export function addApiKey(serviceName: string, key: string, description: string): AdminApiKey {
  const keys = getApiKeys()
  const now = Date.now()
  const newKey: AdminApiKey = {
    id: generateId(),
    serviceName,
    maskedKey: maskKey(key),
    description,
    createdAt: now,
    updatedAt: now,
  }
  keys.push(newKey)
  saveToStorage(KV_KEYS.apiKeys, keys)
  return newKey
}

export function updateApiKey(id: string, updates: { serviceName?: string; key?: string; description?: string }): void {
  const keys = getApiKeys()
  const entry = keys.find(k => k.id === id)
  if (entry) {
    if (updates.serviceName !== undefined) entry.serviceName = updates.serviceName
    if (updates.key !== undefined) entry.maskedKey = maskKey(updates.key)
    if (updates.description !== undefined) entry.description = updates.description
    entry.updatedAt = Date.now()
    saveToStorage(KV_KEYS.apiKeys, keys)
  }
}

export function deleteApiKey(id: string): void {
  const keys = getApiKeys()
  const updated = keys.filter(k => k.id !== id)
  saveToStorage(KV_KEYS.apiKeys, updated)
}
