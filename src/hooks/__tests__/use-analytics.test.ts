import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { trackBlogArticleRead } from '@/lib/analytics-tracker'
import { useArticleReadTracking } from '@/hooks/use-analytics'

/**
 * Der Lesezähler für Blogartikel ging früher nur an GA4 (nie geladen) und
 * läuft jetzt in die Hausstatistik (`blog_article_read`).
 */

vi.mock('@/lib/analytics-tracker', async (importOriginal) => {
  const echt = await importOriginal<typeof import('@/lib/analytics-tracker')>()
  return { ...echt, trackBlogArticleRead: vi.fn() }
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useArticleReadTracking', () => {
  it('meldet den gelesenen Artikel nach der Schwelle einmal an die Hausstatistik', () => {
    localStorage.setItem('ss_cookie_consent', 'granted')
    renderHook(() => useArticleReadTracking('mein-artikel', 120))

    vi.advanceTimersByTime(110_000)
    expect(trackBlogArticleRead).not.toHaveBeenCalled()

    vi.advanceTimersByTime(60_000)
    expect(trackBlogArticleRead).toHaveBeenCalledTimes(1)
    expect(trackBlogArticleRead).toHaveBeenCalledWith('mein-artikel', 120)
  })

  it('meldet ohne Zustimmung nichts', () => {
    renderHook(() => useArticleReadTracking('mein-artikel', 120))
    vi.advanceTimersByTime(600_000)
    expect(trackBlogArticleRead).not.toHaveBeenCalled()
  })
})
