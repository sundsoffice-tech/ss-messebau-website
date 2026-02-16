import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaperPlaneTilt, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { composeApi, ordersApi, inquiriesApi, templatesApi, type OrderRecord, type InquiryRecord } from '@/lib/api-client'
import type { EmailTemplate, ComposeRecipientType } from '@/types/automation'
import { useTranslation } from '@/lib/i18n'

const RECIPIENT_TYPE_LABELS: Record<ComposeRecipientType, string> = {
  customer: 'Kunde',
  delivery: 'Lieferadresse',
  info: 'info@sundsmessebau.com',
}

export function ComposeEmailPanel() {
  const { t } = useTranslation()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [recipientType, setRecipientType] = useState<ComposeRecipientType>('customer')
  const [relatedOrderId, setRelatedOrderId] = useState('')
  const [relatedInquiryId, setRelatedInquiryId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [sending, setSending] = useState(false)

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingRefs, setLoadingRefs] = useState(false)

  useEffect(() => {
    loadReferences()
  }, [])

  const loadReferences = async () => {
    setLoadingRefs(true)
    try {
      const [ordersRes, inquiriesRes, templatesRes] = await Promise.all([
        ordersApi.list().catch(() => ({ orders: [], total: 0 })),
        inquiriesApi.list().catch(() => ({ inquiries: [], total: 0 })),
        templatesApi.list().catch(() => ({ templates: [], total: 0 })),
      ])
      setOrders(ordersRes.orders)
      setInquiries(inquiriesRes.inquiries)
      setTemplates(templatesRes.templates)
    } catch {
      // References are optional
    } finally {
      setLoadingRefs(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId === 'none') {
      return
    }
    const template = templates.find((tpl) => tpl.id === templateId)
    if (template) {
      setSubject(template.subject)
      setHtmlBody(template.htmlContent)
    }
  }

  const handleOrderSelect = (orderId: string) => {
    setRelatedOrderId(orderId)
    if (orderId === 'none') {
      setTo('')
      return
    }
    const order = orders.find((o) => String(o.id) === orderId || o.config_id === orderId)
    if (order) {
      setTo(order.customer_email || '')
      if (!subject) {
        setSubject(`Bestellung ${order.config_id}`)
      }
    }
  }

  const handleInquirySelect = (inquiryId: string) => {
    setRelatedInquiryId(inquiryId)
    if (inquiryId === 'none') {
      setTo('')
      return
    }
    const inquiry = inquiries.find((i) => String(i.id) === inquiryId || i.inquiry_id === inquiryId)
    if (inquiry) {
      setTo(inquiry.email || '')
      if (!subject) {
        setSubject(`Re: ${inquiry.type === 'inquiry' ? 'Anfrage' : 'Kontaktanfrage'} ${inquiry.inquiry_id}`)
      }
    }
  }

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error(t('admin.compose.recipientRequired'))
      return
    }
    if (!subject.trim()) {
      toast.error(t('admin.compose.subjectRequired'))
      return
    }
    if (!htmlBody.trim()) {
      toast.error(t('admin.compose.bodyRequired'))
      return
    }

    setSending(true)
    try {
      const result = await composeApi.send({
        to: to.trim(),
        subject: subject.trim(),
        html_body: htmlBody,
        text_body: htmlBody.replace(/<[^>]+>/g, ''),
        related_order_id: relatedOrderId || undefined,
        related_inquiry_id: relatedInquiryId || undefined,
        template_id: selectedTemplateId || undefined,
      })

      if (result.success) {
        toast.success(t('admin.compose.sent'))
        // Reset form
        setTo('')
        setSubject('')
        setHtmlBody('')
        setRelatedOrderId('')
        setRelatedInquiryId('')
        setSelectedTemplateId('')
      } else {
        toast.error(result.error || t('admin.compose.sendError'))
      }
    } catch {
      toast.error(t('admin.compose.sendError'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('admin.compose.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.compose.subtitle')}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Recipient Type & Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.compose.recipientType')}</Label>
              <Select value={recipientType} onValueChange={(v) => setRecipientType(v as ComposeRecipientType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECIPIENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.compose.relatedOrder')}</Label>
              <Select value={relatedOrderId || 'none'} onValueChange={handleOrderSelect} disabled={loadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.compose.selectOrder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('admin.compose.noAssignment')}</SelectItem>
                  {orders.slice(0, 50).map((order) => (
                    <SelectItem key={order.id} value={String(order.id)}>
                      {order.company || order.customer_name} – {order.config_id?.slice(-8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.compose.relatedInquiry')}</Label>
              <Select value={relatedInquiryId || 'none'} onValueChange={handleInquirySelect} disabled={loadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.compose.selectInquiry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('admin.compose.noAssignment')}</SelectItem>
                  {inquiries.slice(0, 50).map((inq) => (
                    <SelectItem key={inq.id} value={String(inq.id)}>
                      {inq.name} – {inq.inquiry_id?.slice(-8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Selector */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>{t('admin.compose.template')}</Label>
              <Select value={selectedTemplateId || 'none'} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.compose.selectTemplate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('admin.compose.noTemplate')}</SelectItem>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>{tpl.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* To */}
          <div className="space-y-2">
            <Label>{t('admin.compose.to')}</Label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={t('admin.compose.toPlaceholder')}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>{t('admin.compose.subject')}</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('admin.compose.subjectPlaceholder')}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label>{t('admin.compose.body')}</Label>
            <Textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder={t('admin.compose.bodyPlaceholder')}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTo('')
                setSubject('')
                setHtmlBody('')
                setRelatedOrderId('')
                setRelatedInquiryId('')
                setSelectedTemplateId('')
              }}
            >
              {t('admin.compose.reset')}
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ? (
                <Envelope className="w-4 h-4 animate-pulse" />
              ) : (
                <PaperPlaneTilt className="w-4 h-4" />
              )}
              {sending ? t('admin.compose.sending') : t('admin.compose.send')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
