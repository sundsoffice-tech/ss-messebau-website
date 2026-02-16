/**
 * Secure chat service that wraps LLM calls with:
 * - Rate limiting
 * - Input sanitization (prompt injection defense)
 * - Audit logging
 * - Safe error handling
 * 
 * The API key is managed server-side (via admin config / PHP backend).
 * No API key is ever exposed to the client.
 */

import { checkRateLimit, type RateLimitResult } from './rate-limiter'
import { sanitizeChatInput, logSuspiciousActivity } from './chat-sanitizer'

export interface ChatRequest {
  message: string
  context: string
  systemPrompt: string
}

export interface ChatResponse {
  success: boolean
  message: string
  error?: string
  rateLimitInfo?: RateLimitResult
}

/** Audit log entry for chat interactions */
interface ChatAuditEntry {
  timestamp: number
  action: 'chat_request' | 'chat_blocked' | 'chat_error'
  details: string
  inputPreview?: string
}

const CHAT_AUDIT_STORAGE_KEY = 'chat_audit_log'

function addAuditEntry(entry: ChatAuditEntry): void {
  try {
    const raw = localStorage.getItem(CHAT_AUDIT_STORAGE_KEY)
    const logs: ChatAuditEntry[] = raw ? JSON.parse(raw) : []
    logs.push(entry)
    // Keep only last 200 entries
    const trimmed = logs.slice(-200)
    localStorage.setItem(CHAT_AUDIT_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore storage errors
  }
}

/**
 * Get chat audit logs (for admin panel).
 */
export function getChatAuditLog(): ChatAuditEntry[] {
  try {
    const raw = localStorage.getItem(CHAT_AUDIT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Get the custom system prompt from training data, if configured.
 * Training data is now loaded server-side in chat.php,
 * so we return empty here (backend appends it).
 */
async function getTrainingContext(): Promise<string> {
  // Training context is loaded server-side by chat.php from the database
  return ''
}

/**
 * Send a chat message through the secure pipeline.
 * This is the only function that should be used for chat requests.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // 1. Rate limiting
  const rateLimitResult = checkRateLimit()
  if (!rateLimitResult.allowed) {
    const retrySeconds = Math.ceil((rateLimitResult.retryAfterMs || 30000) / 1000)
    addAuditEntry({
      timestamp: Date.now(),
      action: 'chat_blocked',
      details: `Rate limit überschritten. Retry nach ${retrySeconds}s`,
    })
    return {
      success: false,
      message: `Zu viele Anfragen. Bitte warten Sie ${retrySeconds} Sekunden.`,
      error: 'RATE_LIMIT',
      rateLimitInfo: rateLimitResult,
    }
  }

  // 2. Input sanitization
  const sanitizeResult = sanitizeChatInput(request.message)
  if (sanitizeResult.blocked) {
    logSuspiciousActivity(request.message, sanitizeResult.reason || 'blocked')
    addAuditEntry({
      timestamp: Date.now(),
      action: 'chat_blocked',
      details: `Eingabe blockiert: ${sanitizeResult.reason}`,
      inputPreview: request.message.slice(0, 50),
    })
    return {
      success: false,
      message: 'Ihre Nachricht konnte nicht verarbeitet werden. Bitte formulieren Sie Ihre Frage neu.',
      error: 'BLOCKED',
      rateLimitInfo: rateLimitResult,
    }
  }

  // 3. Build prompt with training context
  const trainingContext = await getTrainingContext()
  const fullSystemPrompt = request.systemPrompt + trainingContext

  // 4. Call LLM via server-side proxy (/api/chat.php)
  try {
    addAuditEntry({
      timestamp: Date.now(),
      action: 'chat_request',
      details: 'Chat-Anfrage gesendet',
      inputPreview: sanitizeResult.sanitized.slice(0, 50),
    })

    const response = await fetch('/api/chat.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: sanitizeResult.sanitized,
        systemPrompt: fullSystemPrompt,
        context: request.context,
      }),
    })

    // Better error handling: parse text first for detailed error messages
    const responseText = await response.text()
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText)
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return {
      success: true,
      message: data.message,
      rateLimitInfo: rateLimitResult,
    }
  } catch (error) {
    // Safe error handling - don't expose internal details to user
    const errorMessage = error instanceof Error ? error.message : 'unknown'
    console.error('Chat-Service Fehler:', errorMessage)

    addAuditEntry({
      timestamp: Date.now(),
      action: 'chat_error',
      details: `LLM-Fehler: ${errorMessage.slice(0, 100)}`,
    })

    return {
      success: false,
      message: 'Der KI-Berater ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut oder nutzen Sie unser Kontaktformular.',
      error: 'SERVICE_ERROR',
      rateLimitInfo: rateLimitResult,
    }
  }
}
