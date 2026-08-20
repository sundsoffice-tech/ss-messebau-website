import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { StickyCTA, MobileStickyCTA } from '@/components/StickyCTA'
import { CONTACT } from '@/lib/contact'

vi.mock('@/lib/analytics', () => ({
  trackWhatsAppClick: vi.fn(),
  trackHeroCTAClick: vi.fn(),
}))

/** Simuliert Scrollen nach unten, so dass die Leiste visuell eingeklappt wird. */
function scrollDown() {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true, writable: true })
    window.dispatchEvent(new Event('scroll'))
    Object.defineProperty(window, 'scrollY', { value: 600, configurable: true, writable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true })
})

describe.each([
  ['StickyCTA (Desktop)', StickyCTA],
  ['MobileStickyCTA (Mobil)', MobileStickyCTA],
])('%s – Barrierefreiheit', (_name, Component) => {
  it('WhatsApp ist ein echter Link auf wa.me mit der zentralen Nummer, öffnet sicher in neuem Tab', () => {
    render(<Component onClick={() => {}} />)
    const link = screen.getByRole('link', { name: /sticky\.whatsapp/ })
    expect(link).toHaveAttribute('href', expect.stringContaining(`https://wa.me/${CONTACT.whatsappNumber}?text=`))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    // Sichtbare Beschriftung ist Teil des zugänglichen Namens (WCAG 2.5.3)
    expect(link).toHaveAccessibleName(expect.stringContaining('sticky.whatsapp'))
  })

  it('Anfrage ist ein Button, der einen Dialog ankündigt und den Handler ruft', () => {
    const onClick = vi.fn()
    render(<Component onClick={onClick} />)
    const button = screen.getByRole('button', { name: /sticky\.inquiry/ })
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('Leiste ist als Gruppe beschriftet und nie per aria-hidden versteckt', () => {
    render(<Component onClick={() => {}} />)
    const group = screen.getByRole('group', { name: 'sticky.contactOptions' })
    expect(group).not.toHaveAttribute('aria-hidden')
    scrollDown()
    // Auch visuell eingeklappt: kein aria-hidden, Bedienelemente bleiben im Accessibility-Tree
    expect(group).not.toHaveAttribute('aria-hidden')
    expect(group).toHaveAttribute('data-state', 'hidden')
    expect(screen.getByRole('link', { name: /sticky\.whatsapp/ })).toBeInTheDocument()
  })

  it('klappt wieder aus, sobald ein Bedienelement Tastaturfokus erhält (Fokus nie verdeckt)', () => {
    render(<Component onClick={() => {}} />)
    const group = screen.getByRole('group', { name: 'sticky.contactOptions' })
    scrollDown()
    expect(group).toHaveAttribute('data-state', 'hidden')

    const link = screen.getByRole('link', { name: /sticky\.whatsapp/ })
    act(() => link.focus())
    expect(group).toHaveAttribute('data-state', 'visible')
    expect(group.className).not.toContain('pointer-events-none')

    // Fokus wandert innerhalb der Gruppe weiter: bleibt sichtbar
    const button = screen.getByRole('button', { name: /sticky\.inquiry/ })
    act(() => button.focus())
    expect(group).toHaveAttribute('data-state', 'visible')

    // Fokus verlässt die Gruppe: Scroll-Zustand gilt wieder
    act(() => button.blur())
    expect(group).toHaveAttribute('data-state', 'hidden')
  })

  it('Icons sind dekorativ (aria-hidden), Zielflächen mindestens 44 px hoch', () => {
    const { container } = render(<Component onClick={() => {}} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(2)
    svgs.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'))
    expect(screen.getByRole('link', { name: /sticky\.whatsapp/ }).className).toContain('min-h-[44px]')
    expect(screen.getByRole('button', { name: /sticky\.inquiry/ }).className).toContain('min-h-[44px]')
  })
})
