import { BannerConfig } from '@/components/pages/BannerBestellenPage'
import { sendEmail } from './smtp-service'
import type { SerializedFile } from '@/types/email'
import type { FileAttachment } from '@/types/email'

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

interface EmailData {
  config: BannerConfig
  configId: string
  sendImmediately?: boolean
}

function formatConfigForEmail(config: BannerConfig): string {
  const { step1, step2, step3, step4, step5, step6 } = config

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B4CC0 0%, #2A3A9F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3B4CC0; }
    .section h2 { color: #3B4CC0; margin-top: 0; font-size: 18px; }
    .row { display: flex; margin: 10px 0; }
    .label { font-weight: bold; min-width: 200px; color: #555; }
    .value { color: #333; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px; }
    .badge { display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
    .files { background: #e8f5e9; padding: 15px; border-radius: 6px; margin-top: 10px; }
    .file-item { padding: 8px; background: white; margin: 5px 0; border-radius: 4px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 Neue Banner-Bestellung</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">S&S Messebau GbR</p>
    </div>

    <div class="section">
      <h2>📋 Kunde & Kontakt</h2>
      <div class="row">
        <div class="label">Firma:</div>
        <div class="value">${step6.firmaKontakt}</div>
      </div>
      <div class="row">
        <div class="label">Ansprechpartner:</div>
        <div class="value">${step6.ansprechpartner}</div>
      </div>
      <div class="row">
        <div class="label">E-Mail:</div>
        <div class="value"><a href="mailto:${step6.email}">${step6.email}</a></div>
      </div>
      <div class="row">
        <div class="label">Telefon:</div>
        <div class="value"><a href="tel:${step6.telefon}">${step6.telefon}</a></div>
      </div>
      ${step6.ustId ? `
      <div class="row">
        <div class="label">USt-ID:</div>
        <div class="value">${step6.ustId}</div>
      </div>` : ''}
    </div>

    <div class="section">
      <h2>📦 Bestellung - Einsatz & System</h2>
      <div class="row">
        <div class="label">Einsatzort:</div>
        <div class="value">${step1.einsatzort}</div>
      </div>
      <div class="row">
        <div class="label">Rahmenart:</div>
        <div class="value">${formatRahmenart(step1.rahmenart)}</div>
      </div>
      <div class="row">
        <div class="label">Menge:</div>
        <div class="value">${step1.menge} Stück</div>
      </div>
      <div class="row">
        <div class="label">Indoor/Outdoor:</div>
        <div class="value">${step1.indoorOutdoor === 'indoor' ? '🏢 Indoor' : '🌤️ Outdoor'}</div>
      </div>
      ${step1.montage ? `
      <div class="row">
        <div class="label">Montage:</div>
        <div class="value">✅ Ja ${step1.montageOrt ? `- Ort: ${step1.montageOrt}` : ''} ${step1.montageZeitraum ? `(${step1.montageZeitraum})` : ''}</div>
      </div>` : ''}
    </div>

    <div class="section">
      <h2>📐 Maße & Ausführung</h2>
      <div class="row">
        <div class="label">Abmessungen:</div>
        <div class="value"><strong>${step2.breite} × ${step2.hoehe} mm</strong></div>
      </div>
      <div class="row">
        <div class="label">Profil:</div>
        <div class="value">${formatProfil(step2.profil)}</div>
      </div>
      <div class="row">
        <div class="label">Ecken:</div>
        <div class="value">${step2.ecken === 'gehrung' ? 'Gehrung' : 'Verbinder'}</div>
      </div>
      <div class="row">
        <div class="label">Seitigkeit:</div>
        <div class="value">${step2.seitigkeit === 'einseitig' ? 'Einseitig' : 'Zweiseitig'}</div>
      </div>
      ${step2.led ? `
      <div class="row">
        <div class="label">LED/Backlit:</div>
        <div class="value">💡 Ja ${step2.ledStrom ? `- ${step2.ledStrom}` : ''} ${step2.ledEinsatz ? `(${step2.ledEinsatz})` : ''}</div>
      </div>` : ''}
    </div>

    <div class="section">
      <h2>🖨️ Banner & Druck</h2>
      ${step3.bannerBenoetigt ? `
      <div class="row">
        <div class="label">Banner benötigt:</div>
        <div class="value">✅ Ja</div>
      </div>
      ${step3.material ? `
      <div class="row">
        <div class="label">Material:</div>
        <div class="value">${formatMaterial(step3.material)}</div>
      </div>` : ''}
      ${step3.konfektion && step3.konfektion.length > 0 ? `
      <div class="row">
        <div class="label">Konfektion:</div>
        <div class="value">${step3.konfektion.join(', ')}</div>
      </div>` : ''}
      ${step3.brandschutz ? `
      <div class="row">
        <div class="label">Brandschutz:</div>
        <div class="value"><span class="badge">B1 zertifiziert</span></div>
      </div>` : ''}
      ${step3.druckqualitaet ? `
      <div class="row">
        <div class="label">Druckqualität:</div>
        <div class="value">${step3.druckqualitaet === 'high' ? 'High Quality' : 'Standard'}</div>
      </div>` : ''}
      ` : `
      <div class="row">
        <div class="label">Banner benötigt:</div>
        <div class="value">❌ Nein</div>
      </div>
      `}
    </div>

    <div class="section">
      <h2>📁 Druckdaten & Upload</h2>
      ${step4.druckdatenVorhanden ? `
      <div class="row">
        <div class="label">Druckdaten:</div>
        <div class="value">✅ Vorhanden</div>
      </div>
      ${step4.serializedFiles && step4.serializedFiles.length > 0 ? `
      <div class="files">
        <strong>Hochgeladene Dateien (${step4.serializedFiles.length}):</strong>
        ${step4.serializedFiles.map((file: SerializedFile) => `
          <div class="file-item">
            📎 <strong>${file.name}</strong> - ${formatFileSize(file.size)}
            <br><small style="color: #666;">Typ: ${file.type}</small>
          </div>
        `).join('')}
      </div>
      ` : '<p style="color: #666; margin-top: 10px;">ℹ️ Keine Dateien hochgeladen</p>'}
      ` : `
      <div class="row">
        <div class="label">Druckdaten:</div>
        <div class="value">❌ Noch nicht vorhanden</div>
      </div>
      ${step4.grafikservice ? `
      <div class="row">
        <div class="label">Grafikservice:</div>
        <div class="value">✅ Gewünscht</div>
      </div>
      ${step4.designwunsch ? `
      <div class="row">
        <div class="label">Designwunsch:</div>
        <div class="value">${step4.designwunsch}</div>
      </div>` : ''}
      ` : ''}
      `}
      ${step4.kommentar ? `
      <div class="row">
        <div class="label">Kommentar:</div>
        <div class="value" style="white-space: pre-wrap;">${step4.kommentar}</div>
      </div>` : ''}
    </div>

    <div class="section">
      <h2>🚚 Lieferung & Termin</h2>
      <div class="row">
        <div class="label">Lieferadresse:</div>
        <div class="value">
          ${step5.firma}<br>
          ${step5.strasse}<br>
          ${step5.plz} ${step5.ort}<br>
          ${step5.land}
        </div>
      </div>
      ${step5.wunschDatum ? `
      <div class="row">
        <div class="label">Wunschlieferdatum:</div>
        <div class="value">📅 ${new Date(step5.wunschDatum).toLocaleDateString('de-DE')}</div>
      </div>` : ''}
      <div class="row">
        <div class="label">Lieferart:</div>
        <div class="value">${formatLieferart(step5.lieferart)} ${step5.express ? '<span class="badge">EXPRESS</span>' : ''}</div>
      </div>
      ${step5.zeitfenster ? `
      <div class="row">
        <div class="label">Zeitfenster:</div>
        <div class="value">${step5.zeitfenster}</div>
      </div>` : ''}
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>S&S Messebau GbR</strong></p>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">
        Marienstr. 37-42 | 41836 Hückelhoven<br>
        Tel: (02433) 4427144 | Mobil: (01514) 0322125<br>
        E-Mail: info@sundsmessebau.de
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function formatRahmenart(art: string): string {
  const map: Record<string, string> = {
    haengerahmen: 'Hängerahmen',
    standrahmen: 'Standrahmen',
    verkleidungsrahmen: 'Verkleidungsrahmen',
  }
  return map[art] || art
}

function formatProfil(profil: string): string {
  const map: Record<string, string> = {
    standard: 'Standard',
    premium: 'Premium',
    sonder: 'Sonder',
  }
  return map[profil] || profil
}

function formatMaterial(material: string): string {
  const map: Record<string, string> = {
    frontlit: 'Frontlit (Standard)',
    blockout: 'Blockout',
    backlit: 'Backlit',
  }
  return map[material] || material
}

function formatLieferart(art: string): string {
  const map: Record<string, string> = {
    spedition: '🚛 Spedition',
    abholung: '🏪 Abholung',
    kurier: '🏃 Kurier',
  }
  return map[art] || art
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export async function sendOrderConfirmationEmail(data: EmailData): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    const { config, configId, sendImmediately = false } = data
    
    const emailSubject = `Neue Banner-Bestellung: ${config.step6.firmaKontakt} - ${config.step1.menge}x ${formatRahmenart(config.step1.rahmenart)}`
    const emailBody = formatConfigForEmail(config)
    
    const customerEmailBody = generateCustomerConfirmationEmail(config, configId)
    
    const attachmentInfo = config.step4.serializedFiles && config.step4.serializedFiles.length > 0
      ? `\n\n📎 Anhänge: ${config.step4.serializedFiles.length} Datei(en) (${config.step4.serializedFiles.map(f => f.name).join(', ')})`
      : ''

    const emailData = {
      to: 'info@sundsmessebau.com',
      subject: emailSubject,
      htmlBody: emailBody,
      textBody: convertHtmlToText(emailBody) + attachmentInfo,
      customerEmail: config.step6.email,
      customerSubject: `Auftragsbestätigung: Banner-Bestellung #${configId.slice(-8)}`,
      customerHtmlBody: customerEmailBody,
      customerTextBody: convertHtmlToText(customerEmailBody),
      attachments: config.step4.serializedFiles || [],
      configId,
      timestamp: new Date().toISOString(),
      sent: false,
    }

    const queueId = `email_queue_${configId}`
    await window.spark.kv.set(queueId, emailData)

    if (sendImmediately) {
      const sendResult = await sendQueuedEmail(queueId)
      
      if (sendResult.success) {
        return { success: true, queueId }
      } else {
        return { success: false, queueId, error: sendResult.error }
      }
    }
    
    return { success: true, queueId }
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return { success: false, error: errorMessage }
  }
}

export async function sendQueuedEmail(queueId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const emailData = await window.spark.kv.get<EmailQueueItem>(queueId)
    
    if (!emailData) {
      return { success: false, error: 'E-Mail nicht in Queue gefunden' }
    }

    const companyResult = await sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      htmlBody: emailData.htmlBody,
      textBody: emailData.textBody,
      attachments: emailData.attachments,
    })

    if (!companyResult.success) {
      return { success: false, error: `Firmen-E-Mail: ${companyResult.error}` }
    }

    const customerResult = await sendEmail({
      to: emailData.customerEmail,
      subject: emailData.customerSubject,
      htmlBody: emailData.customerHtmlBody,
      textBody: emailData.customerTextBody,
    })

    if (!customerResult.success) {
      return { success: false, error: `Kunden-E-Mail: ${customerResult.error}` }
    }

    emailData.sent = true
    emailData.sentAt = new Date().toISOString()
    await window.spark.kv.set(queueId, emailData)
    
    return { success: true }
  } catch (error) {
    console.error('❌ Fehler beim Versenden der E-Mail:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return { success: false, error: errorMessage }
  }
}

function generateCustomerConfirmationEmail(config: BannerConfig, configId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B4CC0 0%, #2A3A9F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .box { background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B4CC0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    h2 { color: #3B4CC0; margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Bestellung eingegangen!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Vielen Dank für Ihre Anfrage</p>
    </div>
    
    <div class="content">
      <p>Sehr geehrte/r ${config.step6.ansprechpartner},</p>
      
      <p>vielen Dank für Ihre Banner-Bestellung bei S&S Messebau GbR!</p>
      
      <p>Wir haben Ihre Konfiguration erfolgreich erhalten und werden uns <strong>innerhalb von 24 Stunden</strong> mit einem individuellen Angebot bei Ihnen melden.</p>
      
      <div class="box">
        <h2>📋 Ihre Bestellung im Überblick</h2>
        <p><strong>Bestellnummer:</strong> #${configId.slice(-8)}</p>
        <p><strong>Rahmenart:</strong> ${formatRahmenart(config.step1.rahmenart)}</p>
        <p><strong>Menge:</strong> ${config.step1.menge} Stück</p>
        <p><strong>Maße:</strong> ${config.step2.breite} × ${config.step2.hoehe} mm</p>
        ${config.step5.wunschDatum ? `<p><strong>Wunschlieferung:</strong> ${new Date(config.step5.wunschDatum).toLocaleDateString('de-DE')}</p>` : ''}
      </div>
      
      <h2>🚀 Wie geht es weiter?</h2>
      <ol>
        <li><strong>Prüfung:</strong> Wir prüfen Ihre Anfrage und alle Anforderungen</li>
        <li><strong>Angebot:</strong> Sie erhalten ein detailliertes Angebot mit Festpreisen</li>
        <li><strong>Produktion:</strong> Nach Ihrer Freigabe starten wir die Fertigung</li>
        <li><strong>Lieferung:</strong> Pünktliche Lieferung zum Wunschtermin</li>
      </ol>
      
      <p>Bei Rückfragen stehen wir Ihnen jederzeit zur Verfügung!</p>
      
      <p style="margin-top: 30px;">
        Mit freundlichen Grüßen<br>
        <strong>Ihr S&S Messebau Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>S&S Messebau GbR</strong></p>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">
        Marienstr. 37-42 | 41836 Hückelhoven<br>
        Tel: (02433) 4427144 | Mobil: (01514) 0322125<br>
        E-Mail: info@sundsmessebau.de
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
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
