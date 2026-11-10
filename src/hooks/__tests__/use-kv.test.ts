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

  it('entfernt den Eintrag auf Verlangen und behält den Wert im Arbeitsspeicher', () => {
    const { result, rerender } = renderHook(() => useKV<{ breite: number }>('entwurf', { breite: 100 }))
    act(() => result.current[1]({ breite: 300 }))
    expect(localStorage.getItem('ss_kv_entwurf')).toBe('{"breite":300}')

    act(() => result.current[2]())
    rerender()

    expect(localStorage.getItem('ss_kv_entwurf')).toBeNull()
    expect(result.current[0]).toEqual({ breite: 300 })
  })

  it('legt den Eintrag nicht wieder an, wenn im selben Zug gesetzt und entfernt wird', () => {
    const { result, rerender } = renderHook(() => useKV<{ breite: number }>('entwurf', { breite: 100 }))

    act(() => {
      result.current[1]({ breite: 300 })
      result.current[2]()
    })
    rerender()

    expect(localStorage.getItem('ss_kv_entwurf')).toBeNull()
  })

  it('schreibt nach dem Entfernen wieder, sobald neu gesetzt wird', () => {
    const { result } = renderHook(() => useKV<{ breite: number }>('entwurf', { breite: 100 }))
    act(() => result.current[1]({ breite: 300 }))
    act(() => result.current[2]())

    act(() => result.current[1]({ breite: 500 }))

    expect(localStorage.getItem('ss_kv_entwurf')).toBe('{"breite":500}')
  })

  it('wirft nicht, wenn der Speicher beim Entfernen gesperrt ist', () => {
    const { result } = renderHook(() => useKV<string[]>('inquiries', []))
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('gesperrt')
    })

    expect(() => act(() => result.current[2]())).not.toThrow()
  })
})
