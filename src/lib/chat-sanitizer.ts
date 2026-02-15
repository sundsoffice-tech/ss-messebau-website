/**
 * Input sanitization and prompt injection defense for the AI chat.
 * Filters dangerous patterns from user input before passing to the LLM.
 */

/** Patterns that indicate prompt injection attempts */
const INJECTION_PATTERNS: RegExp[] = [
  // Attempts to override system instructions
  /ignore\s+(all\s+)?previous\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(all\s+)?previous\s+(instructions?|prompts?|context)/i,
  /disregard\s+(all\s+)?previous/i,
  /override\s+(system|instructions?)/i,
  // Attempts to switch roles
  /you\s+are\s+now\s+(a|an|the)\s/i,
  /act\s+as\s+(a|an|the)\s+(different|new)/i,
  /new\s+role\s*:/i,
  /system\s*prompt\s*:/i,
  // Attempts to extract system prompts
  /repeat\s+(the\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(the\s+)?(system\s+)?(prompt|instructions)/i,
  /what\s+(are|is)\s+(your|the)\s+(system\s+)?(prompt|instructions|rules)/i,
  // Attempts to execute code
  /```\s*(javascript|python|bash|sh|exec|eval)/i,
  /<script[\s>]/i,
]

/** Maximum allowed message length */
const MAX_MESSAGE_LENGTH = 2000

/** localStorage key for security logs */
const SECURITY_LOG_STORAGE_KEY = 'chat_security_log'

export interface SanitizeResult {
  sanitized: string
  blocked: boolean
  reason?: string
}

/**
 * Sanitize user input for the chat.
 * Returns the cleaned input or blocks if injection is detected.
 */
export function sanitizeChatInput(input: string): SanitizeResult {
  if (!input || typeof input !== 'string') {
    return { sanitized: '', blocked: true, reason: 'Leere Eingabe' }
  }

  // Trim and limit length
  let cleaned = input.trim()

  if (cleaned.length === 0) {
    return { sanitized: '', blocked: true, reason: 'Leere Eingabe' }
  }

  if (cleaned.length > MAX_MESSAGE_LENGTH) {
    cleaned = cleaned.slice(0, MAX_MESSAGE_LENGTH)
  }

  // Check for prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        sanitized: '',
        blocked: true,
        reason: 'Unzulässige Eingabe erkannt',
      }
    }
  }

  // Remove potential HTML/script tags
  cleaned = cleaned.replace(/<[^>]*>/g, '')

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s{3,}/g, '  ')

  return { sanitized: cleaned, blocked: false }
}

/**
 * Log suspicious chat activity for monitoring.
 */
export function logSuspiciousActivity(input: string, reason: string): void {
  try {
    const raw = localStorage.getItem(SECURITY_LOG_STORAGE_KEY)
    const logs: Array<{ timestamp: number; reason: string; inputPreview: string }> = raw ? JSON.parse(raw) : []

    logs.push({
      timestamp: Date.now(),
      reason,
      inputPreview: input.slice(0, 100),
    })

    // Keep only last 100 entries
    const trimmed = logs.slice(-100)
    localStorage.setItem(SECURITY_LOG_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore storage errors
  }
}

/**
 * Get logged suspicious activities (for admin panel).
 */
export function getSuspiciousActivityLog(): Array<{ timestamp: number; reason: string; inputPreview: string }> {
  try {
    const raw = localStorage.getItem(SECURITY_LOG_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
