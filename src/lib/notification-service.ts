import { notificationsApi, emailApi } from './api-client'

export type NotificationType = 'inquiry' | 'kontakt' | 'banner'

export interface WebhookConfig {
  url: string
  enabled: boolean
  channel: string
  types: NotificationType[]
}

export interface NotificationConfig {
  recipients: string[]
  webhooks: WebhookConfig[]
  sendCustomerConfirmation: boolean
}

export interface FormNotificationPayload {
  type: NotificationType
  data: Record<string, unknown>
  inquiryId: string
  customerEmail?: string
}

const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  recipients: ['info@sundsmessebau.com'],
  webhooks: [],
  sendCustomerConfirmation: true,
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function getNotificationConfig(): Promise<NotificationConfig> {
  try {
    const config = await notificationsApi.getConfig()
    return config as NotificationConfig
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG
  }
}

export async function saveNotificationConfig(config: NotificationConfig): Promise<void> {
  await notificationsApi.saveConfig(config)
}

function generateSubject(type: NotificationType, data: Record<string, unknown>): string {
  switch (type) {
    case 'inquiry':
      return `Neue Anfrage von ${escapeHtml(String(data.name || 'Unbekannt'))} – ${escapeHtml(String(data.company || ''))}`
    case 'kontakt':
      return `Neue Kontaktanfrage von ${escapeHtml(String(data.name || 'Unbekannt'))}`
    case 'banner':
      return `Neue Banner-Bestellung: ${escapeHtml(String(data.firmaKontakt || data.company || 'Unbekannt'))}`
    default:
      return 'Neue Formularanfrage'
  }
}

function getTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    inquiry: 'Anfrage',
    kontakt: 'Kontaktanfrage',
    banner: 'Banner-Bestellung',
  }
  return labels[type] || 'Formularanfrage'
}

function generateCompanyEmailHtml(type: NotificationType, data: Record<string, unknown>, inquiryId: string): string {
  const rows = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `
      <div style="display:flex;margin:8px 0;">
        <div style="font-weight:bold;min-width:180px;color:#555;">${escapeHtml(formatLabel(k))}:</div>
        <div style="color:#333;">${typeof v === 'boolean' ? (v ? '✅ Ja' : '❌ Nein') : escapeHtml(String(v))}</div>
      </div>
    `)
    .join('')

  const typeLabel = type === 'inquiry' ? 'Anfrage' : type === 'kontakt' ? 'Kontaktanfrage' : 'Banner-Bestellung'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
  <div style="max-width:700px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#3B4CC0 0%,#2A3A9F 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;">📨 Neue ${typeLabel}</h1>
      <p style="margin:10px 0 0;opacity:0.9;">S&amp;S Messebau GbR</p>
    </div>
    <div style="background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;border-top:none;">
      <p style="color:#888;font-size:13px;">ID: ${escapeHtml(inquiryId)}</p>
      ${rows}
    </div>
    <div style="background:#333;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px;margin-top:20px;">
      <p style="margin:0 0 10px;"><strong>S&amp;S Messebau GbR</strong></p>
      <p style="margin:0;font-size:14px;opacity:0.9;">
        Marienstraße 37 | 41836 Hückelhoven<br>
        Mobil: +49 1514 0368754 | info@sundsmessebau.com
      </p>
    </div>
  </div>
</body>
</html>`.trim()
}

function generateCustomerConfirmationHtml(type: NotificationType, data: Record<string, unknown>, inquiryId: string): string {
  const name = escapeHtml(String(data.ansprechpartner || data.name || 'Kunde'))
  const typeLabel = type === 'inquiry' ? 'Anfrage' : type === 'kontakt' ? 'Kontaktanfrage' : 'Banner-Bestellung'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#3B4CC0 0%,#2A3A9F 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;">✅ ${typeLabel} eingegangen!</h1>
      <p style="margin:10px 0 0;opacity:0.9;">Vielen Dank für Ihre Nachricht</p>
    </div>
    <div style="background:white;padding:30px;border:1px solid #e0e0e0;">
      <p>Sehr geehrte/r ${name},</p>
      <p>vielen Dank für Ihre ${typeLabel} bei S&amp;S Messebau GbR!</p>
      <p>Wir haben Ihre Nachricht erfolgreich erhalten und werden uns <strong>innerhalb von 24 Stunden</strong> bei Ihnen melden.</p>
      <div style="background:#f5f7fa;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #3B4CC0;">
        <p style="margin:0;"><strong>Referenz-Nr.:</strong> #${escapeHtml(inquiryId.slice(-8))}</p>
      </div>
      <p style="margin-top:30px;">
        Mit freundlichen Grüßen<br>
        <strong>Ihr S&amp;S Messebau Team</strong>
      </p>
    </div>
    <div style="background:#333;color:white;padding:20px;text-align:center;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 10px;"><strong>S&amp;S Messebau GbR</strong></p>
      <p style="margin:0;font-size:14px;opacity:0.9;">
        Marienstraße 37 | 41836 Hückelhoven<br>
        Mobil: +49 1514 0368754 | info@sundsmessebau.com
      </p>
    </div>
  </div>
</body>
</html>`.trim()
}

function convertHtmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}

function formatLabel(key: string): string {
  const map: Record<string, string> = {
    name: 'Name',
    email: 'E-Mail',
    company: 'Firma',
    phone: 'Telefon',
    message: 'Nachricht',
    budget: 'Budget',
    messesProJahr: 'Messen/Jahr',
    firmaKontakt: 'Firma',
    ansprechpartner: 'Ansprechpartner',
    telefon: 'Telefon',
    ustId: 'USt-ID',
    dsgvo: 'Datenschutz',
    newsletter: 'Newsletter',
    event: 'Messe/Event',
    size: 'Standgröße',
    wunschtermin: 'Wunschtermin',
  }
  return map[key] || key
}

export async function sendFormNotification(payload: FormNotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getNotificationConfig()
    const { type, data, inquiryId, customerEmail } = payload

    const subject = generateSubject(type, data)
    const htmlBody = generateCompanyEmailHtml(type, data, inquiryId)
    const textBody = convertHtmlToText(htmlBody)

    // Send to all configured recipients via backend email queue
    for (const recipient of config.recipients) {
      const queueId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      // Add customer confirmation email if enabled
      const recipientEmail = customerEmail || String(data.email || '')
      let customerEmailField: string | undefined
      let customerSubjectField: string | undefined
      let customerHtmlBodyField: string | undefined
      let customerTextBodyField: string | undefined

      if (config.sendCustomerConfirmation && recipientEmail) {
        const customerHtml = generateCustomerConfirmationHtml(type, data, inquiryId)
        customerEmailField = recipientEmail
        customerSubjectField = `Eingangsbestätigung: Ihre ${getTypeLabel(type)} #${inquiryId.slice(-8)}`
        customerHtmlBodyField = customerHtml
        customerTextBodyField = convertHtmlToText(customerHtml)
      }

      await emailApi.autoSend({
        queue_id: queueId,
        to_email: recipient,
        subject,
        html_body: htmlBody,
        text_body: textBody,
        customer_email: customerEmailField,
        customer_subject: customerSubjectField,
        customer_html_body: customerHtmlBodyField,
        customer_text_body: customerTextBodyField,
      })
    }

    // Send webhooks via backend (server-side)
    for (const webhook of config.webhooks) {
      if (webhook.enabled && webhook.types.includes(type)) {
        try {
          const webhookPayload = {
            text: `📨 Neue ${getTypeLabel(type)} von ${escapeHtml(String(data.name || data.firmaKontakt || 'Unbekannt'))} (#${inquiryId.slice(-8)})`,
            type,
            inquiryId,
            data,
          }
          await notificationsApi.sendWebhook(webhook.url, webhookPayload)
        } catch (error) {
          console.error('Webhook-Fehler:', error)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Notification-Fehler:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
  }
}

export interface WebhookOnlyPayload {
  type: NotificationType
  data: Record<string, unknown>
  inquiryId: string
}

export async function sendWebhooksOnly(payload: WebhookOnlyPayload): Promise<void> {
  try {
    const config = await getNotificationConfig()
    const { type, data, inquiryId } = payload

    for (const webhook of config.webhooks) {
      if (webhook.enabled && webhook.types.includes(type)) {
        try {
          const webhookPayload = {
            text: `📨 Neue ${getTypeLabel(type)} von ${escapeHtml(String(data.name || data.firmaKontakt || 'Unbekannt'))} (#${inquiryId.slice(-8)})`,
            type,
            inquiryId,
            data,
          }
          await notificationsApi.sendWebhook(webhook.url, webhookPayload)
        } catch (error) {
          console.error('Webhook-Fehler:', error)
        }
      }
    }
  } catch (error) {
    console.error('Webhook-Versand fehlgeschlagen:', error)
  }
}
