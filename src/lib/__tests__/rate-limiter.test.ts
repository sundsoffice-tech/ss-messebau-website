import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from '../rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    localStorage.clear()
    resetRateLimit()
  })

  it('allows requests under the limit', () => {
    const result = checkRateLimit({ maxRequests: 5, windowMs: 60000, cooldownMs: 30000 })
    expect(result.allowed).toBe(true)
    expect(result.remainingRequests).toBe(4)
    expect(result.retryAfterMs).toBeNull()
  })

  it('blocks after exceeding the limit', () => {
    const config = { maxRequests: 3, windowMs: 60000, cooldownMs: 30000 }

    checkRateLimit(config)
    checkRateLimit(config)
    checkRateLimit(config)

    const result = checkRateLimit(config)
    expect(result.allowed).toBe(false)
    expect(result.remainingRequests).toBe(0)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('tracks remaining requests correctly', () => {
    const config = { maxRequests: 5, windowMs: 60000, cooldownMs: 30000 }

    const r1 = checkRateLimit(config)
    expect(r1.remainingRequests).toBe(4)

    const r2 = checkRateLimit(config)
    expect(r2.remainingRequests).toBe(3)
  })

  it('resets rate limit state', () => {
    const config = { maxRequests: 2, windowMs: 60000, cooldownMs: 30000 }

    checkRateLimit(config)
    checkRateLimit(config)

    resetRateLimit()

    const result = checkRateLimit(config)
    expect(result.allowed).toBe(true)
    expect(result.remainingRequests).toBe(1)
  })

  it('unblocks after cooldown period expires', () => {
    const config = { maxRequests: 1, windowMs: 100, cooldownMs: 100 }

    checkRateLimit(config)
    const blocked = checkRateLimit(config)
    expect(blocked.allowed).toBe(false)

    // Simulate time passing beyond both cooldown and window
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 200)

    const unblocked = checkRateLimit(config)
    expect(unblocked.allowed).toBe(true)

    vi.restoreAllMocks()
  })
})
