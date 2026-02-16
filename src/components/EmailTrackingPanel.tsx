import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChartLine, Eye, MagnifyingGlass, Envelope, CheckCircle } from '@phosphor-icons/react'
import { trackingApi } from '@/lib/api-client'
import type { EmailTrackingRecord, EmailEventType } from '@/types/automation'
import { useTranslation } from '@/lib/i18n'

const STATUS_CONFIG: Record<EmailEventType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  queued: { label: 'In Queue', variant: 'secondary' },
  sent: { label: 'Gesendet', variant: 'outline' },
  delivered: { label: 'Zugestellt', variant: 'default' },
  opened: { label: 'Geöffnet', variant: 'default' },
  bounced: { label: 'Bounced', variant: 'destructive' },
  failed: { label: 'Fehlgeschlagen', variant: 'destructive' },
}

const ITEMS_PER_PAGE = 25

export function EmailTrackingPanel() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<EmailTrackingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [detailRecord, setDetailRecord] = useState<EmailTrackingRecord | null>(null)

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const res = await trackingApi.list()
      setRecords(res.records)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    let result = records
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.to.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          (r.orderId || '').toLowerCase().includes(q) ||
          (r.inquiryId || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }
    return result
  }, [records, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE))
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // Stats
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of records) {
      counts[r.status] = (counts[r.status] || 0) + 1
    }
    return counts
  }, [records])

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('admin.tracking.loading')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('admin.tracking.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.tracking.subtitle')}</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {(Object.entries(STATUS_CONFIG) as [EmailEventType, typeof STATUS_CONFIG[EmailEventType]][]).map(([status, config]) => (
          <Card key={status} className="p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
            <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
            <Badge variant={config.variant} className="mt-1">{config.label}</Badge>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.tracking.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.tracking.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.tracking.allStatuses')}</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadRecords}>
          {t('admin.tracking.refresh')}
        </Button>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card className="p-12 text-center">
          <ChartLine className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">{t('admin.tracking.noRecords')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('admin.tracking.noRecordsHint')}</p>
        </Card>
      ) : (
        paginatedRecords.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Envelope className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{record.to}</span>
                  <Badge variant={STATUS_CONFIG[record.status]?.variant || 'secondary'}>
                    {STATUS_CONFIG[record.status]?.label || record.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{record.subject}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  <span>{new Date(record.createdAt).toLocaleString('de-DE')}</span>
                  {record.orderId && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t('admin.tracking.order')}: #{record.orderId.slice(-8)}
                    </span>
                  )}
                  {record.inquiryId && (
                    <span>{t('admin.tracking.inquiry')}: #{record.inquiryId.slice(-8)}</span>
                  )}
                  {record.events.length > 0 && (
                    <span>{record.events.length} {t('admin.tracking.events')}</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDetailRecord(record)}>
                <Eye className="w-4 h-4 mr-1" />
                {t('admin.tracking.details')}
              </Button>
            </div>
          </Card>
        ))
      )}

      {/* Pagination */}
      {filteredRecords.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('admin.tracking.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('admin.tracking.page')} {page} {t('admin.tracking.of')} {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t('admin.tracking.next')}
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailRecord} onOpenChange={(open) => { if (!open) setDetailRecord(null) }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.tracking.detailTitle')}</DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.tracking.to')}:</span>
                  <span className="text-sm">{detailRecord.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.tracking.subject')}:</span>
                  <span className="text-sm truncate ml-4">{detailRecord.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('admin.tracking.status')}:</span>
                  <Badge variant={STATUS_CONFIG[detailRecord.status]?.variant || 'secondary'}>
                    {STATUS_CONFIG[detailRecord.status]?.label || detailRecord.status}
                  </Badge>
                </div>
                {detailRecord.orderId && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t('admin.tracking.order')}:</span>
                    <span className="text-sm">#{detailRecord.orderId}</span>
                  </div>
                )}
                {detailRecord.inquiryId && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t('admin.tracking.inquiry')}:</span>
                    <span className="text-sm">#{detailRecord.inquiryId}</span>
                  </div>
                )}
              </div>

              {/* Event Timeline */}
              <div>
                <h3 className="font-semibold text-sm mb-3">{t('admin.tracking.eventTimeline')}</h3>
                {detailRecord.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('admin.tracking.noEvents')}</p>
                ) : (
                  <div className="space-y-3">
                    {detailRecord.events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 relative">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={STATUS_CONFIG[event.event]?.variant || 'secondary'} className="text-xs">
                              {STATUS_CONFIG[event.event]?.label || event.event}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString('de-DE')}
                            </span>
                          </div>
                          {event.details && (
                            <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
