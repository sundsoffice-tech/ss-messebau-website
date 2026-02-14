import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n'

interface CaseStudyCardProps {
  title: string
  challenge: string
  solution: string
  result: string
  imageUrl: string
  branche: string
  size: string
  messe?: string
}

export function CaseStudyCard({ title, challenge, solution, result, imageUrl, branche, size, messe }: CaseStudyCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={title}
          width="640"
          height="360"
          className="object-cover w-full h-full"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-background/95 text-foreground shadow text-xs">{size}</Badge>
          {messe && <Badge className="bg-primary text-primary-foreground shadow text-xs">{messe}</Badge>}
        </div>
      </div>
      <CardContent className="p-5 md:p-6 space-y-4">
        <h4 className="text-lg md:text-xl font-semibold leading-tight">{title}</h4>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t('casestudy.problem')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t('casestudy.solution')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{solution}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t('casestudy.result')}</p>
            <p className="text-sm font-medium leading-relaxed">{result}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
