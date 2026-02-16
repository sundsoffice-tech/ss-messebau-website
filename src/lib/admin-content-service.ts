/**
 * Admin content service for managing Blog posts, Messe events, and external API keys.
 * All data is stored server-side via PHP backend APIs.
 */

import { blogApi, messenApi, apiKeysApi } from './api-client'

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

export async function getBlogPosts(): Promise<AdminBlogPost[]> {
  try {
    const result = await blogApi.list()
    return result.posts as AdminBlogPost[]
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}

export async function addBlogPost(post: Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminBlogPost> {
  const result = await blogApi.create({
    title: post.title,
    slug: post.slug,
    category: post.category,
    imageUrl: post.imageUrl,
    excerpt: post.excerpt,
    content: post.content,
    publishedAt: post.publishedAt,
  })
  return result.post as AdminBlogPost
}

export async function updateBlogPost(id: string, updates: Partial<Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await blogApi.update(id, updates)
}

export async function deleteBlogPost(id: string): Promise<void> {
  await blogApi.delete(id)
}

// ─── Messe CRUD ──────────────────────────────────────────────

export async function getMesseEvents(): Promise<AdminMesseEvent[]> {
  try {
    const result = await messenApi.list()
    return result.events as AdminMesseEvent[]
  } catch (error) {
    console.error('Failed to fetch messe events:', error)
    return []
  }
}

export async function addMesseEvent(event: Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminMesseEvent> {
  const result = await messenApi.create(event)
  return result.event as AdminMesseEvent
}

export async function updateMesseEvent(id: string, updates: Partial<Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await messenApi.update(id, updates)
}

export async function deleteMesseEvent(id: string): Promise<void> {
  await messenApi.delete(id)
}

// ─── API Keys CRUD ───────────────────────────────────────────

export async function getApiKeys(): Promise<AdminApiKey[]> {
  try {
    const result = await apiKeysApi.list()
    return result.keys
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    return []
  }
}

export async function addApiKey(serviceName: string, key: string, description: string): Promise<AdminApiKey> {
  const result = await apiKeysApi.create(serviceName, key, description)
  return result.key
}

export async function updateApiKey(id: string, updates: { serviceName?: string; key?: string; description?: string }): Promise<void> {
  await apiKeysApi.update(id, updates)
}

export async function deleteApiKey(id: string): Promise<void> {
  await apiKeysApi.delete(id)
}
