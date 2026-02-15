import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, CalendarDot } from '@phosphor-icons/react'
import { getLatestNews } from '@/lib/messe-data'
import { useTranslation } from '@/lib/i18n'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function NewsSection() {
  const { t } = useTranslation()
  const news = useMemo(() => getLatestNews(), [])

  return (
    <section id="news" className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Newspaper className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            {t('aktuelles.news.title')}
          </h2>
        </div>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mb-8">
          {t('aktuelles.news.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map(item => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDot className="h-3.5 w-3.5" />
                    {formatDate(item.date)}
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {news.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {t('aktuelles.news.noNews')}
          </p>
        )}
      </div>
    </section>
  )
}
