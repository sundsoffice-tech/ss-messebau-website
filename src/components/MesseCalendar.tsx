import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDot, MapPin, Clock, Star, ArrowSquareOut } from '@phosphor-icons/react'
import { getUpcomingEvents, getNextEvent, getDaysUntil, CATEGORY_LABELS } from '@/lib/messe-data'
import type { MesseEvent } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
  return `${start.toLocaleDateString('de-DE', opts)} – ${end.toLocaleDateString('de-DE', opts)}`
}

function EventCard({ event }: { event: MesseEvent }) {
  const daysUntil = getDaysUntil(event.startDate)
  const isActive = daysUntil === 0

  return (
    <Card className={`relative transition-shadow hover:shadow-md ${event.ssPresent ? 'border-primary/40' : ''}`}>
      {event.ssPresent && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-accent text-accent-foreground gap-1">
            <Star className="h-3 w-3" weight="fill" />
            S&S vor Ort
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Badge variant="secondary" className="text-xs shrink-0">
            {CATEGORY_LABELS[event.category]}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-snug pr-20">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" />
            {event.location}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDot className="h-4 w-4 shrink-0" />
            {formatDateRange(event.startDate, event.endDate)}
          </span>
          {!isActive && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Clock className="h-4 w-4 shrink-0" />
              in {daysUntil} Tagen
            </span>
          )}
          {isActive && (
            <Badge className="bg-green-600 text-white">Läuft jetzt</Badge>
          )}
        </div>
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
          >
            Zur Messewebsite
            <ArrowSquareOut className="h-3.5 w-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}

export function MesseCalendar() {
  const { t } = useTranslation()
  const upcomingEvents = useMemo(() => getUpcomingEvents(), [])
  const nextEvent = useMemo(() => getNextEvent(), [])
  const daysToNext = nextEvent ? getDaysUntil(nextEvent.startDate) : null

  return (
    <section id="messekalender" className="py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <CalendarDot className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {t('aktuelles.calendar.title')}
              </h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              {t('aktuelles.calendar.subtitle')}
            </p>
          </div>

          {nextEvent && daysToNext !== null && (
            <div className="bg-primary text-primary-foreground rounded-xl px-5 py-4 text-center md:text-right shrink-0">
              <div className="text-sm opacity-90">{t('aktuelles.calendar.nextFair')}</div>
              <div className="text-3xl md:text-4xl font-bold">{daysToNext}</div>
              <div className="text-sm opacity-90">{t('aktuelles.calendar.days')}</div>
              <div className="text-xs mt-1 opacity-75">{nextEvent.name} – {nextEvent.location}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {upcomingEvents.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {t('aktuelles.calendar.noEvents')}
          </p>
        )}
      </div>
    </section>
  )
}
