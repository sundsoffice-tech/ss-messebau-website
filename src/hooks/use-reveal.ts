import { useEffect, useRef } from 'react'

/**
 * Adds `.is-visible` to elements with the `.reveal` class inside the
 * referenced container once they scroll into view. Pair with the CSS in
 * index.css; the global prefers-reduced-motion killswitch shows elements
 * immediately without animation.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = container.classList.contains('reveal')
      ? [container]
      : Array.from(container.querySelectorAll<HTMLElement>('.reveal'))
    if (targets.length === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return ref
}
