/**
 * Client-side rate limiter for chat requests.
 * Tracks request timestamps per session to prevent abuse.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Cooldown period in milliseconds after limit is exceeded */
  cooldownMs: number
}

interface RateLimitState {
  timestamps: number[]
  blockedUntil: number | null
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000, // 1 minute
  cooldownMs: 30_000, // 30 seconds cooldown
}

const KV_KEY = 'chat_rate_limit'

function getState(): RateLimitState {
  try {
    const raw = localStorage.getItem(KV_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore parse errors
  }
  return { timestamps: [], blockedUntil: null }
}

function saveState(state: RateLimitState): void {
  try {
    localStorage.setItem(KV_KEY, JSON.stringify(state))
  } catch {
    // localStorage might be unavailable
  }
}

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  retryAfterMs: number | null
}

/**
 * Check if a chat request is allowed under the rate limit.
 * Call this before each chat request.
 */
export function checkRateLimit(config: RateLimitConfig = DEFAULT_CONFIG): RateLimitResult {
  const now = Date.now()
  const state = getState()

  // Check if currently blocked
  if (state.blockedUntil && now < state.blockedUntil) {
    return {
      allowed: false,
      remainingRequests: 0,
      retryAfterMs: state.blockedUntil - now,
    }
  }

  // Clear expired block
  if (state.blockedUntil && now >= state.blockedUntil) {
    state.blockedUntil = null
  }

  // Remove timestamps outside the current window
  state.timestamps = state.timestamps.filter(ts => now - ts < config.windowMs)

  if (state.timestamps.length >= config.maxRequests) {
    // Rate limit exceeded - apply cooldown
    state.blockedUntil = now + config.cooldownMs
    saveState(state)
    return {
      allowed: false,
      remainingRequests: 0,
      retryAfterMs: config.cooldownMs,
    }
  }

  // Request allowed - record timestamp
  state.timestamps.push(now)
  saveState(state)

  return {
    allowed: true,
    remainingRequests: config.maxRequests - state.timestamps.length,
    retryAfterMs: null,
  }
}

/**
 * Reset the rate limiter (e.g. for admin/testing purposes).
 */
export function resetRateLimit(): void {
  try {
    localStorage.removeItem(KV_KEY)
  } catch {
    // ignore
  }
}
