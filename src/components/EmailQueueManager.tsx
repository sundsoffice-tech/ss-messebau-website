import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Envelope, Eye, Trash, CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { sendQueuedEmail } from '@/lib/email-service'
import type { FileAttachment } from '@/types/email'
import { useTranslation } from '@/lib/i18n'

interface EmailQueueItem {
  id: string
  to: string
  subject: string
  htmlBody: string
  textBody: string
  customerEmail: string
  customerSubject: string
  customerHtmlBody: string
  customerTextBody: string
  attachments: FileAttachment[]
  configId: string
  timestamp?: string
}

export function EmailQueueManager() {
  const { t } = useTranslation()
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [previewEmail, setPreviewEmail] = useState<EmailQueueItem | null>(null)
  const [previewType, setPreviewType] = useState<'company' | 'customer'>('company')

  useEffect(() => {
    loadEmailQueue()
  }, [])

  const loadEmailQueue = async () => {
    setLoading(true)
    try {
      const keys = await window.spark.kv.keys()
      const emailKeys = keys.filter((key) => key.startsWith('email_queue_'))

      const emails: EmailQueueItem[] = []
      for (const key of emailKeys) {
        const data = await window.spark.kv.get<EmailQueueItem>(key)
        if (data) {
          emails.push({
            id: key,
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          })
        }
      }

      emails.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      setEmailQueue(emails)
    } catch (error) {
      console.error(t('emailQueue.loadError'), error)
      toast.error(t('emailQueue.loadErrorToast'))
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (email: EmailQueueItem, type: 'company' | 'customer') => {
    setPreviewEmail(email)
    setPreviewType(type)
  }

  const handleSendEmail = async (email: EmailQueueItem) => {
    const loadingToast = toast.loading(t('emailQueue.sending'), {
      description: t('emailQueue.sendingTo').replace('{to}', email.to).replace('{customer}', email.customerEmail),
    })

    try {
      const result = await sendQueuedEmail(email.id)

      if (result.success) {
        toast.success(t('emailQueue.sentSuccess'), {
          id: loadingToast,
          description: t('emailQueue.sentSuccessDesc').replace('{to}', email.to).replace('{customer}', email.customerEmail),
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

  const handleDelete = async (emailId: string) => {
    if (confirm(t('emailQueue.confirmDelete'))) {
      await window.spark.kv.delete(emailId)
      toast.success(t('emailQueue.deleted'))
      await loadEmailQueue()
    }
  }

  const handleSendAll = async () => {
    if (emailQueue.length === 0) return

    if (confirm(t('emailQueue.confirmSendAll').replace('{count}', String(emailQueue.length)))) {
      const loadingToast = toast.loading(t('emailQueue.sendingAll').replace('{count}', String(emailQueue.length)))
      
      let successCount = 0
      let errorCount = 0

      for (const email of emailQueue) {
        try {
          const result = await sendQueuedEmail(email.id)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            console.error(t('emailQueue.sendErrorLog'), email.id, result.error)
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          errorCount++
          console.error(t('emailQueue.sendErrorLog'), email.id, error)
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
  }

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
        {emailQueue.length > 0 && (
          <Button onClick={handleSendAll} size="lg">
            <PaperPlaneTilt className="w-4 h-4 mr-2" />
            {t('emailQueue.sendAll').replace('{count}', String(emailQueue.length))}
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t('emailQueue.loading')}</p>
        </Card>
      ) : emailQueue.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">{t('emailQueue.empty')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('emailQueue.emptyHint')}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {emailQueue.map((email) => (
            <Card key={email.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Envelope className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{email.subject}</h3>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('emailQueue.toCompany')}</span>
                      <span className="font-mono">{email.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t('emailQueue.toCustomer')}</span>
                      <span className="font-mono">{email.customerEmail}</span>
                    </div>
                    {email.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          📎 {email.attachments.length} {email.attachments.length > 1 ? t('emailQueue.attachments') : t('emailQueue.attachment')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {email.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(email.timestamp).toLocaleString('de-DE')}
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
                  <Button
                    onClick={() => handleSendEmail(email)}
                    size="sm"
                  >
                    <PaperPlaneTilt className="w-4 h-4 mr-1" />
                    {t('emailQueue.send')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(email.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
                    {previewType === 'company' ? previewEmail.to : previewEmail.customerEmail}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[100px]">{t('emailQueue.subject')}</span>
                  <span>
                    {previewType === 'company' ? previewEmail.subject : previewEmail.customerSubject}
                  </span>
                </div>
                {previewType === 'company' && previewEmail.attachments.length > 0 && (
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[100px]">{t('emailQueue.attachmentsLabel')}</span>
                    <div className="flex flex-wrap gap-1">
                      {previewEmail.attachments.map((file, idx) => (
                        <Badge key={idx} variant="secondary">
                          📎 {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[500px] border rounded-lg">
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{
                    __html: previewType === 'company' 
                      ? previewEmail.htmlBody 
                      : previewEmail.customerHtmlBody,
                  }}
                />
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewEmail(null)}>
              {t('emailQueue.close')}
            </Button>
            {previewEmail && (
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
    </div>
  )
}
