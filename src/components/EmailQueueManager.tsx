import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Envelope, Eye, Trash, CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'

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
  attachments: any[]
  configId: string
  timestamp?: string
}

export function EmailQueueManager() {
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
        const data = await window.spark.kv.get<any>(key)
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
      console.error('Fehler beim Laden der E-Mail-Queue:', error)
      toast.error('E-Mail-Queue konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (email: EmailQueueItem, type: 'company' | 'customer') => {
    setPreviewEmail(email)
    setPreviewType(type)
  }

  const handleSendEmail = async (email: EmailQueueItem) => {
    toast.info('E-Mail-Versand simuliert', {
      description: `An: ${email.to} & ${email.customerEmail}`,
      duration: 3000,
    })

    console.log('📧 E-Mail-Versand (Simulation)')
    console.log('═════════════════════════════')
    console.log('An Firma:', email.to)
    console.log('Betreff:', email.subject)
    console.log('Anhänge:', email.attachments.length)
    console.log('─────────────────────────────')
    console.log('An Kunde:', email.customerEmail)
    console.log('Betreff:', email.customerSubject)
    console.log('═════════════════════════════')
    
    toast.success('E-Mails versendet!', {
      description: `Bestätigung an ${email.customerEmail} und Bestellung an ${email.to} versendet`,
      duration: 5000,
    })

    await window.spark.kv.delete(email.id)
    await loadEmailQueue()
  }

  const handleDelete = async (emailId: string) => {
    if (confirm('E-Mail aus der Queue löschen?')) {
      await window.spark.kv.delete(emailId)
      toast.success('E-Mail gelöscht')
      await loadEmailQueue()
    }
  }

  const handleSendAll = async () => {
    if (emailQueue.length === 0) return

    if (confirm(`Alle ${emailQueue.length} E-Mails versenden?`)) {
      for (const email of emailQueue) {
        await handleSendEmail(email)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      toast.success(`${emailQueue.length} E-Mails versendet!`)
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
            Auftragsbestätigungen bereit zum Versand
          </p>
        </div>
        {emailQueue.length > 0 && (
          <Button onClick={handleSendAll} size="lg">
            <PaperPlaneTilt className="w-4 h-4 mr-2" />
            Alle versenden ({emailQueue.length})
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Lade E-Mails...</p>
        </Card>
      ) : emailQueue.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">Keine E-Mails in der Queue</p>
          <p className="text-sm text-muted-foreground mt-2">
            Neue Banner-Bestellungen werden hier angezeigt
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
                      <span className="text-muted-foreground">An Firma:</span>
                      <span className="font-mono">{email.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">An Kunde:</span>
                      <span className="font-mono">{email.customerEmail}</span>
                    </div>
                    {email.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          📎 {email.attachments.length} Anhang{email.attachments.length > 1 ? 'e' : ''}
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
                    Firma
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(email, 'customer')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Kunde
                  </Button>
                  <Button
                    onClick={() => handleSendEmail(email)}
                    size="sm"
                  >
                    <PaperPlaneTilt className="w-4 h-4 mr-1" />
                    Senden
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
              E-Mail Vorschau - {previewType === 'company' ? 'An Firma' : 'An Kunde'}
            </DialogTitle>
          </DialogHeader>
          
          {previewEmail && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[100px]">An:</span>
                  <span className="font-mono">
                    {previewType === 'company' ? previewEmail.to : previewEmail.customerEmail}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[100px]">Betreff:</span>
                  <span>
                    {previewType === 'company' ? previewEmail.subject : previewEmail.customerSubject}
                  </span>
                </div>
                {previewType === 'company' && previewEmail.attachments.length > 0 && (
                  <div className="flex gap-2">
                    <span className="font-semibold min-w-[100px]">Anhänge:</span>
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
              Schließen
            </Button>
            {previewEmail && (
              <Button onClick={() => {
                handleSendEmail(previewEmail)
                setPreviewEmail(null)
              }}>
                <PaperPlaneTilt className="w-4 h-4 mr-2" />
                Jetzt senden
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
