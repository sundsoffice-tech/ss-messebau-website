import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { RouterLink } from '@/components/RouterLink'

/**
 * RouterLink wechselt die Seite ohne Neuladen. Wer mit Strg, Meta, Umschalt,
 * Alt oder der mittleren Taste klickt, will einen neuen Tab oder ein neues
 * Fenster: Diesen Klick lässt RouterLink an den Browser durch.
 *
 * jsdom navigiert nicht. Der Lauscher am Dokument läuft nach React, hält fest,
 * ob React den Klick abgefangen hat, und fängt ihn dann selbst ab.
 */

let abgefangenVonReact: boolean | null = null
const merken = (ereignis: MouseEvent) => {
  abgefangenVonReact = ereignis.defaultPrevented
  ereignis.preventDefault()
}

beforeEach(() => {
  cleanup()
  abgefangenVonReact = null
  window.history.replaceState(null, '', '/')
  vi.stubGlobal('scrollTo', vi.fn())
  document.addEventListener('click', merken)
})

afterEach(() => {
  document.removeEventListener('click', merken)
  vi.unstubAllGlobals()
})

describe('RouterLink', () => {
  it('ein einfacher Klick wechselt die Seite über den Router und ruft onClick', () => {
    const onClick = vi.fn()
    render(<RouterLink to="/impressum" onClick={onClick}>Impressum</RouterLink>)
    const verweis = screen.getByRole('link', { name: 'Impressum' })
    expect(verweis).toHaveAttribute('href', '/impressum')

    fireEvent.click(verweis)

    expect(abgefangenVonReact).toBe(true)
    expect(window.location.pathname).toBe('/impressum')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['Strg', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Umschalt', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['mittlere Taste', { button: 1 }],
  ])('ein Klick mit %s geht an den Browser durch', (_name, zusatz) => {
    const onClick = vi.fn()
    render(<RouterLink to="/impressum" onClick={onClick}>Impressum</RouterLink>)

    fireEvent.click(screen.getByRole('link', { name: 'Impressum' }), zusatz)

    expect(abgefangenVonReact).toBe(false)
    expect(window.location.pathname).toBe('/')
    expect(onClick).not.toHaveBeenCalled()
  })
})
