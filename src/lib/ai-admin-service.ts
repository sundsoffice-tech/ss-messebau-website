/**
 * AI Admin service for managing API keys, training data, and audit logs.
 * All API key management happens server-side only.
 * Keys are never displayed in full in the frontend.
 */

// ─── Types ───────────────────────────────────────────────────

export interface AIKeyInfo {
  id: string
  provider: string
  /** Masked key - only last 4 characters visible */
  maskedKey: string
  createdAt: number
  lastUsedAt: number | null
  status: 'active' | 'revoked'
}

export interface TrainingDataEntry {
  id: string
  title: string
  content: string
  category: string
  active: boolean
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface AIAuditLogEntry {
  id: string
  timestamp: number
  action: string
  actor: string
  details: string
  category: 'key' | 'training' | 'config' | 'security'
}

// ─── API Key Management ──────────────────────────────────────

const KV_KEYS = {
  aiKeys: 'ai_api_keys',
  trainingData: 'ai_training_data',
  auditLog: 'ai_audit_log',
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function maskKey(key: string): string {
  if (key.length <= 4) return '****'
  return '•'.repeat(key.length - 4) + key.slice(-4)
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

function addAuditLog(action: string, details: string, category: AIAuditLogEntry['category'], actor = 'admin'): void {
  const logs = getFromStorage<AIAuditLogEntry[]>(KV_KEYS.auditLog, [])
  logs.push({
    id: generateId(),
    timestamp: Date.now(),
    action,
    actor,
    details,
    category,
  })
  // Keep last 500 entries
  saveToStorage(KV_KEYS.auditLog, logs.slice(-500))
}

// ─── API Key Operations ──────────────────────────────────────

export async function getAIKeys(): Promise<AIKeyInfo[]> {
  try {
    const response = await fetch('/api/ai-keys.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch keys')
    }
    
    const data = await response.json()
    return data.keys || []
  } catch (error) {
    console.error('Failed to fetch AI keys from server, using localStorage fallback:', error)
    // Fallback to localStorage
    return getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
  }
}

export async function addAIKey(provider: string, key: string): Promise<AIKeyInfo> {
  try {
    const response = await fetch('/api/ai-keys.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to add key')
    }
    
    const data = await response.json()
    addAuditLog('key_added', `API-Schlüssel für ${provider} hinzugefügt`, 'key')
    
    // Refresh cache from server to avoid race conditions
    const updatedKeys = await getAIKeys()
    saveToStorage(KV_KEYS.aiKeys, updatedKeys)
    
    return data.key
  } catch (error) {
    console.error('Failed to add AI key to server, using localStorage fallback:', error)
    // Fallback to localStorage-only
    const keys = getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
    const newKey: AIKeyInfo = {
      id: generateId(),
      provider,
      maskedKey: maskKey(key),
      createdAt: Date.now(),
      lastUsedAt: null,
      status: 'active',
    }
    keys.push(newKey)
    saveToStorage(KV_KEYS.aiKeys, keys)
    saveToStorage(`ai_key_${newKey.id}`, { encrypted: true, provider })
    addAuditLog('key_added', `API-Schlüssel für ${provider} hinzugefügt (lokal)`, 'key')
    return newKey
  }
}

export async function revokeAIKey(keyId: string): Promise<void> {
  try {
    const response = await fetch('/api/ai-keys.php', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to revoke key')
    }
    
    // Update localStorage cache
    const keys = getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
    const key = keys.find(k => k.id === keyId)
    if (key) {
      key.status = 'revoked'
      saveToStorage(KV_KEYS.aiKeys, keys)
      addAuditLog('key_revoked', `API-Schlüssel ${key.maskedKey} (${key.provider}) widerrufen`, 'key')
    }
  } catch (error) {
    console.error('Failed to revoke AI key on server, using localStorage fallback:', error)
    // Fallback to localStorage
    const keys = getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
    const key = keys.find(k => k.id === keyId)
    if (key) {
      key.status = 'revoked'
      saveToStorage(KV_KEYS.aiKeys, keys)
      addAuditLog('key_revoked', `API-Schlüssel ${key.maskedKey} (${key.provider}) widerrufen (lokal)`, 'key')
    }
  }
}

export async function deleteAIKey(keyId: string): Promise<void> {
  try {
    const response = await fetch(`/api/ai-keys.php?keyId=${encodeURIComponent(keyId)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete key')
    }
    
    // Update localStorage cache
    const keys = getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
    const key = keys.find(k => k.id === keyId)
    if (key) {
      const updated = keys.filter(k => k.id !== keyId)
      saveToStorage(KV_KEYS.aiKeys, updated)
      try {
        localStorage.removeItem(`spark_kv_ai_key_${keyId}`)
      } catch { /* ignore */ }
      addAuditLog('key_deleted', `API-Schlüssel ${key.maskedKey} (${key.provider}) gelöscht`, 'key')
    }
  } catch (error) {
    console.error('Failed to delete AI key on server, using localStorage fallback:', error)
    // Fallback to localStorage
    const keys = getFromStorage<AIKeyInfo[]>(KV_KEYS.aiKeys, [])
    const key = keys.find(k => k.id === keyId)
    if (key) {
      const updated = keys.filter(k => k.id !== keyId)
      saveToStorage(KV_KEYS.aiKeys, updated)
      try {
        localStorage.removeItem(`spark_kv_ai_key_${keyId}`)
      } catch { /* ignore */ }
      addAuditLog('key_deleted', `API-Schlüssel ${key.maskedKey} (${key.provider}) gelöscht (lokal)`, 'key')
    }
  }
}

// ─── Training Data Operations ────────────────────────────────

export function getTrainingData(): TrainingDataEntry[] {
  return getFromStorage<TrainingDataEntry[]>(KV_KEYS.trainingData, [])
}

export function addTrainingData(title: string, content: string, category: string, createdBy = 'admin'): TrainingDataEntry {
  const data = getTrainingData()
  const entry: TrainingDataEntry = {
    id: generateId(),
    title,
    content,
    category,
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy,
  }
  data.push(entry)
  saveToStorage(KV_KEYS.trainingData, data)
  addAuditLog('training_added', `Wissensdatei "${title}" hinzugefügt (Kategorie: ${category})`, 'training', createdBy)
  return entry
}

export function updateTrainingData(id: string, updates: Partial<Pick<TrainingDataEntry, 'title' | 'content' | 'category' | 'active'>>): void {
  const data = getTrainingData()
  const entry = data.find(d => d.id === id)
  if (entry) {
    Object.assign(entry, updates, { updatedAt: Date.now() })
    saveToStorage(KV_KEYS.trainingData, data)
    addAuditLog('training_updated', `Wissensdatei "${entry.title}" aktualisiert`, 'training')
  }
}

export function deleteTrainingData(id: string): void {
  const data = getTrainingData()
  const entry = data.find(d => d.id === id)
  if (entry) {
    const updated = data.filter(d => d.id !== id)
    saveToStorage(KV_KEYS.trainingData, updated)
    addAuditLog('training_deleted', `Wissensdatei "${entry.title}" gelöscht`, 'training')
  }
}

// ─── Audit Log Operations ────────────────────────────────────

export function getAuditLog(): AIAuditLogEntry[] {
  return getFromStorage<AIAuditLogEntry[]>(KV_KEYS.auditLog, [])
}

export function clearAuditLog(): void {
  addAuditLog('audit_cleared', 'Audit-Log gelöscht', 'config')
  saveToStorage(KV_KEYS.auditLog, [])
}

// ─── Training Data Categories ────────────────────────────────

export const TRAINING_CATEGORIES = [
  { value: 'faq', label: 'FAQ / Häufige Fragen' },
  { value: 'product', label: 'Produkte & Leistungen' },
  { value: 'pricing', label: 'Preise & Budget' },
  { value: 'process', label: 'Ablauf & Prozesse' },
  { value: 'company', label: 'Unternehmensinformationen' },
  { value: 'other', label: 'Sonstiges' },
] as const
