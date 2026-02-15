import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Envelope, Eye, Trash, CheckCircle, PaperPlaneTilt, MagnifyingGlass, Funnel } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { emailApi, type EmailQueueRecord } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n'

export function EmailQueueManager() {
  const { t } = useTranslation()
  const [emailQueue, setEmailQueue] = useState<EmailQueueRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [previewEmail, setPreviewEmail] = useState<EmailQueueRecord | null>(null)
  const [previewType, setPreviewType] = useState<'company' | 'customer'>('company')
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<string | number | null>(null)
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false)
  const PAGE_SIZE = 25

  useEffect(() => {
    loadEmailQueue()
  }, [showAll])

  const loadEmailQueue = async () => {
    setLoading(true)
    try {
      const res = await emailApi.list(showAll ? undefined : 0)
      setEmailQueue(res.emails)
      setCurrentPage(1)
    } catch (error) {
      console.error(t('emailQueue.loadError'), error)
      toast.error(t('emailQueue.loadErrorToast'))
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (email: EmailQueueRecord, type: 'company' | 'customer') => {
    setPreviewEmail(email)
    setPreviewType(type)
  }

  const handleSendEmail = async (email: EmailQueueRecord) => {
    const loadingToast = toast.loading(t('emailQueue.sending'), {
      description: t('emailQueue.sendingTo').replace('{to}', email.to_email).replace('{customer}', email.customer_email),
    })

    try {
      const result = await emailApi.send(email.queue_id)

      if (result.success) {
        toast.success(t('emailQueue.sentSuccess'), {
          id: loadingToast,
          description: t('emailQueue.sentSuccessDesc').replace('{to}', email.to_email).replace('{customer}', email.customer_email),
          duration: 5000,
        })
        await loadEmailQueue()
      } else {
        toast.error(t('emailQueue.sendFailed'), {
          id: loadingToast,
          description: result.error || t('emailQueue.unknownError'),
          duration: 7000,
        })
      }
    } catch (error) {
      toast.error(t('emailQueue.sendError'), {
        id: loadingToast,
        description: error instanceof Error ? error.message : t('emailQueue.unknownError'),
        duration: 7000,
      })
    }
  }

  const handleDelete = async (emailId: string | number) => {
    setDeleteTarget(emailId)
  }

  const confirmDelete = async () => {
    if (deleteTarget === null) return
    try {
      await emailApi.delete(deleteTarget)
      toast.success(t('emailQueue.deleted'))
      await loadEmailQueue()
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSendAll = async () => {
    const unsent = emailQueue.filter(e => !e.sent)
    if (unsent.length === 0) return
    setShowSendAllConfirm(true)
  }

  const confirmSendAll = async () => {
    setShowSendAllConfirm(false)
    const unsent = emailQueue.filter(e => !e.sent)
    if (unsent.length === 0) return

    const loadingToast = toast.loading(t('emailQueue.sendingAll').replace('{count}', String(unsent.length)))
    
    let successCount = 0
    let errorCount = 0

    for (const email of unsent) {
      try {
        const result = await emailApi.send(email.queue_id)
        if (result.success) {
          successCount++
        } else {
          errorCount++
          console.error(t('emailQueue.sendErrorLog'), email.queue_id, result.error)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        errorCount++
        console.error(t('emailQueue.sendErrorLog'), email.queue_id, error)
      }
    }

    if (errorCount === 0) {
      toast.success(t('emailQueue.allSentSuccess').replace('{count}', String(successCount)), {
        id: loadingToast,
        duration: 5000,
      })
    } else {
      toast.warning(t('emailQueue.partialSend').replace('{success}', String(successCount)).replace('{errors}', String(errorCount)), {
        id: loadingToast,
        description: t('emailQueue.checkConsole'),
        duration: 7000,
      })
    }

    await loadEmailQueue()
  }

  const unsentEmails = emailQueue.filter(e => !e.sent)

  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emailQueue
    const q = searchQuery.toLowerCase()
    return emailQueue.filter(
      (e) =>
        e.subject?.toLowerCase().includes(q) ||
        e.to_email?.toLowerCase().includes(q) ||
        e.customer_email?.toLowerCase().includes(q)
    )
  }, [emailQueue, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / PAGE_SIZE))
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Envelope className="w-6 h-6" />
            E-Mail Queue
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('emailQueue.subtitle')}
          </p>
        </div>
        {unsentEmails.length > 0 && (
          <Button onClick={handleSendAll} size="lg">
            <PaperPlaneTilt className="w-4 h-4 mr-2" />
            {t('emailQueue.sendAll').replace('{count}', String(unsentEmails.length))}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Betreff, Empfänger oder Kunden-E-Mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showAll ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAll(!showAll)}
        >
          <Funnel className="w-4 h-4 mr-1" />
          {showAll ? 'Alle' : 'Nur ungesendet'}
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t('emailQueue.loading')}</p>
        </Card>
      ) : filteredEmails.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'Keine E-Mails gefunden' : t('emailQueue.empty')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Versuchen Sie einen anderen Suchbegriff.' : t('emailQueue.emptyHint')}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedEmails.map((email) => (
            <Card key={email.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Envelope className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{email.subject}</h3>
                    {email.sent ? (
                      <Badge variant="default" className="ml-2">✓ Gesendet</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">Ausstehend</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('emailQueue.toCompany')}</span>
                      <span className="font-mono">{email.to_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('emailQueue.toCustomer')}</span>
                      <span className="font-mono">{email.customer_email}</span>
                    </div>
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          📎 {email.attachments.length} {email.attachments.length > 1 ? t('emailQueue.attachments') : t('emailQueue.attachment')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {email.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(email.created_at).toLocaleString('de-DE')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(email, 'company')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('emailQueue.previewCompany')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(email, 'customer')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('emailQueue.previewCustomer')}
                  </Button>
                  {!email.sent && (
                    <Button
                      onClick={() => handleSendEmail(email)}
                      size="sm"
                    >
                      <PaperPlaneTilt className="w-4 h-4 mr-1" />
                      {t('emailQueue.send')}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(email.queue_id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredEmails.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Zurück
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Seite {currentPage} von {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Weiter
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!previewEmail} onOpenChange={() => setPreviewEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {t('emailQueue.previewTitle').replace('{type}', previewType === 'company' ? t('emailQueue.previewToCompany') : t('emailQueue.previewToCustomer'))}
            </DialogTitle>
          </DialogHeader>
          
          {previewEmail && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[100px]">{t('emailQueue.to')}</span>
                  <span className="font-mono">
                    {previewType === 'company' ? previewEmail.to_email : previewEmail.customer_email}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[100px]">{t('emailQueue.subject')}</span>
                  <span>
                    {previewType === 'company' ? previewEmail.subject : previewEmail.customer_subject}
                  </span>
                </div>
              </div>

              <div className="h-[500px] border rounded-lg overflow-hidden">
                <iframe
                  sandbox=""
                  title={previewType === 'company' ? t('emailQueue.previewToCompany') : t('emailQueue.previewToCustomer')}
                  srcDoc={previewType === 'company' 
                    ? previewEmail.html_body 
                    : previewEmail.customer_html_body}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewEmail(null)}>
              {t('emailQueue.close')}
            </Button>
            {previewEmail && !previewEmail.sent && (
              <Button onClick={() => {
                handleSendEmail(previewEmail)
                setPreviewEmail(null)
              }}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                {t('emailQueue.sendNow')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>E-Mail löschen</AlertDialogTitle>
            <AlertDialogDescription>
              {t('emailQueue.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send all confirmation dialog */}
      <AlertDialog open={showSendAllConfirm} onOpenChange={setShowSendAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle E-Mails senden</AlertDialogTitle>
            <AlertDialogDescription>
              {t('emailQueue.confirmSendAll').replace('{count}', String(unsentEmails.length))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendAll}>Alle senden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
