import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKV } from '@/hooks/use-kv'

/**
 * `useKV` schreibt erst, wenn der Aufrufer einen Wert setzt. Beim Einhängen
 * entsteht kein Eintrag: Vorher lag nach jedem ersten Seitenaufruf
 * `ss_kv_inquiries` mit `[]` im Browser, ohne dass der Besucher etwas getan hatte.
 */

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useKV', () => {
  it('legt beim Einhängen keinen Eintrag für den Vorgabewert an', () => {
    const { result, rerender } = renderHook(() => useKV<string[]>('inquiries', []))
    rerender()

    expect(result.current[0]).toEqual([])
    expect(localStorage.length).toBe(0)
  })

  it('schreibt, sobald der Aufrufer einen Wert setzt', () => {
    const { result } = renderHook(() => useKV<string[]>('inquiries', []))

    act(() => result.current[1]((bisher) => [...bisher, 'anfrage-1']))

    expect(result.current[0]).toEqual(['anfrage-1'])
    expect(localStorage.getItem('ss_kv_inquiries')).toBe('["anfrage-1"]')
  })

  it('liest einen vorhandenen Eintrag und schreibt ihn beim Einhängen nicht neu', () => {
    localStorage.setItem('ss_kv_entwurf', '{"breite":300}')
    const schreiben = vi.spyOn(Storage.prototype, 'setItem')

    const { result } = renderHook(() => useKV<{ breite: number }>('entwurf', { breite: 100 }))

    expect(result.current[0]).toEqual({ breite: 300 })
    expect(schreiben).not.toHaveBeenCalled()
  })

  it('schreibt auch das Zurücksetzen auf den Vorgabewert, wenn der Aufrufer es verlangt', () => {
    localStorage.setItem('ss_kv_entwurf', '{"breite":300}')
    const { result } = renderHook(() => useKV<{ breite: number }>('entwurf', { breite: 100 }))

    act(() => result.current[1]({ breite: 100 }))

    expect(localStorage.getItem('ss_kv_entwurf')).toBe('{"breite":100}')
  })
})
