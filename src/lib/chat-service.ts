/**
 * Secure chat service that wraps LLM calls with:
 * - Rate limiting
 * - Input sanitization (prompt injection defense)
 * - Safe error handling
 *
 * The API key is managed server-side (via admin config / PHP backend).
 * No API key is ever exposed to the client.
 *
 * Kein Protokoll im Browser: `chat_audit_log` und `chat_security_log` hatten keinen
 * Leser mit Wirkung für den Besucher und sind seit 10.11.2026 entfernt; Altbestände
 * räumt `speicher-altbestand.ts`. Im Browser bleibt nur der Zähler `chat_rate_limit`.
 */

import { checkRateLimit, type RateLimitResult } from './rate-limiter'
import { sanitizeChatInput } from './chat-sanitizer'

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

    return {
      success: false,
      message: 'Der KI-Berater ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut oder nutzen Sie unser Kontaktformular.',
      error: 'SERVICE_ERROR',
      rateLimitInfo: rateLimitResult,
    }
  }
}
