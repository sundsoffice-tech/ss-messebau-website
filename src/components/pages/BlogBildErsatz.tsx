import { Article, Calculator, Coins, Stack } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const SYMBOLE: Record<string, Icon> = {
  budget: Calculator,
  kosten: Coins,
  nachhaltigkeit: Stack,
}

/**
 * Neutrales Feld in Hausfarbe für Blogbeiträge ohne eigenes Bild. Rein schmückend:
 * Titel und Kategorie stehen daneben als Text, deshalb für Vorleseprogramme verborgen.
 */
export function BlogBildErsatz({ category }: { category: string }) {
  const Symbol = SYMBOLE[category.trim().toLowerCase()] ?? Article
  return (
    <div
      data-blog-bild-ersatz
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-primary/10"
    >
      <Symbol className="h-14 w-14 text-primary md:h-16 md:w-16" />
    </div>
  )
}
