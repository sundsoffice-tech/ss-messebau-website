/**
 * AI Admin service for managing API keys, training data, and audit logs.
 * All data is stored server-side via PHP backend APIs.
 * Keys are never displayed in full in the frontend.
 */

import { aiApi } from './api-client'

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

// ─── Helpers ─────────────────────────────────────────────────

/** Extract the actual error message from a non-ok API response body. */
async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json() as { error?: string }
    return data.error || fallback
  } catch {
    return res.status === 401 ? 'Sitzung abgelaufen – bitte neu anmelden'
      : res.status === 403 ? 'Zugriff verweigert'
      : `${fallback} (${res.status})`
  }
}

// ─── API Key Management ──────────────────────────────────────

export async function getAIKeys(): Promise<AIKeyInfo[]> {
  try {
    // GET has no body – no Content-Type header needed
    const response = await fetch('/api/ai-keys.php', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(await extractError(response, 'Schlüssel konnten nicht geladen werden'))
    }

    const data = await response.json()
    return data.keys || []
  } catch (error) {
    console.error('Failed to fetch AI keys from server:', error)
    return []
  }
}

export async function addAIKey(provider: string, key: string): Promise<AIKeyInfo> {
  const response = await fetch('/api/ai-keys.php', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, key }),
  })

  if (!response.ok) {
    throw new Error(await extractError(response, 'Schlüssel konnte nicht gespeichert werden'))
  }

  const data = await response.json()

  // Add audit log entry (best-effort)
  try {
    await aiApi.addAuditEntry({
      action: 'key_added',
      details: `API-Schlüssel für ${provider} hinzugefügt`,
      category: 'key',
    })
  } catch { /* audit log is best-effort */ }

  return data.key
}

export async function revokeAIKey(keyId: string): Promise<void> {
  const response = await fetch('/api/ai-keys.php', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId }),
  })

  if (!response.ok) {
    throw new Error(await extractError(response, 'Schlüssel konnte nicht widerrufen werden'))
  }

  try {
    await aiApi.addAuditEntry({
      action: 'key_revoked',
      details: `API-Schlüssel ${keyId} widerrufen`,
      category: 'key',
    })
  } catch { /* audit log is best-effort */ }
}

export async function deleteAIKey(keyId: string): Promise<void> {
  // DELETE has no body – no Content-Type header needed
  const response = await fetch(`/api/ai-keys.php?keyId=${encodeURIComponent(keyId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await extractError(response, 'Schlüssel konnte nicht gelöscht werden'))
  }

  try {
    await aiApi.addAuditEntry({
      action: 'key_deleted',
      details: `API-Schlüssel ${keyId} gelöscht`,
      category: 'key',
    })
  } catch { /* audit log is best-effort */ }
}

// ─── Training Data Operations ────────────────────────────────

export async function getTrainingData(): Promise<TrainingDataEntry[]> {
  try {
    const result = await aiApi.getTrainingData()
    return result.data
  } catch (error) {
    console.error('Failed to fetch training data:', error)
    return []
  }
}

export async function addTrainingData(title: string, content: string, category: string, createdBy = 'admin'): Promise<TrainingDataEntry> {
  const result = await aiApi.addTrainingData({ title, content, category, createdBy })
  return result.entry
}

export async function updateTrainingData(id: string, updates: Partial<Pick<TrainingDataEntry, 'title' | 'content' | 'category' | 'active'>>): Promise<void> {
  await aiApi.updateTrainingData(id, updates)
}

export async function deleteTrainingData(id: string): Promise<void> {
  await aiApi.deleteTrainingData(id)
}

// ─── Audit Log Operations ────────────────────────────────────

export async function getAuditLog(): Promise<AIAuditLogEntry[]> {
  try {
    const result = await aiApi.getAuditLog()
    return result.logs.map(log => ({
      ...log,
      category: log.category as AIAuditLogEntry['category'],
    }))
  } catch (error) {
    console.error('Failed to fetch audit log:', error)
    return []
  }
}

export async function clearAuditLog(): Promise<void> {
  await aiApi.clearAuditLog()
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
