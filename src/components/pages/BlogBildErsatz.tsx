import { Article, Calculator, Coins, Repeat } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const SYMBOLE: Record<string, Icon> = {
  budget: Calculator,
  kosten: Coins,
  nachhaltigkeit: Repeat,
}

/**
 * Neutrales Feld in Hausfarbe für Blogbeiträge ohne eigenes Bild. Das Feld ist sichtbar blau und das
 * Symbol groß, damit es als Absicht gelesen wird und nicht als Bild, das nicht lädt. Rein schmückend:
 * Titel und Kategorie stehen daneben als Text, deshalb für Vorleseprogramme verborgen.
 */
export function BlogBildErsatz({ category }: { category: string }) {
  const Symbol = SYMBOLE[category.trim().toLowerCase()] ?? Article
  return (
    <div
      data-blog-bild-ersatz
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-primary/20"
    >
      <Symbol className="h-20 w-20 text-primary md:h-24 md:w-24" />
    </div>
  )
}
