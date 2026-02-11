interface EmailAttachment {
  name: string
  type: string
  size: number
  dataUrl: string
}

interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody: string
  attachments?: EmailAttachment[]
  from?: string
  replyTo?: string
}

interface SMTPConfig {
  provider: 'sendgrid' | 'ses' | 'test'
  apiKey?: string
  region?: string
  fromEmail: string
  fromName: string
}

const DEFAULT_CONFIG: SMTPConfig = {
  provider: 'test',
  fromEmail: 'noreply@sundsmessebau.de',
  fromName: 'S&S Messebau GbR',
}

async function getEmailConfig(): Promise<SMTPConfig> {
  try {
    const config = await window.spark.kv.get<SMTPConfig>('smtp_config')
    return config || DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveEmailConfig(config: Partial<SMTPConfig>): Promise<void> {
  const currentConfig = await getEmailConfig()
  const newConfig = { ...currentConfig, ...config }
  await window.spark.kv.set('smtp_config', newConfig)
}

async function sendViaSendGrid(options: EmailOptions, config: SMTPConfig): Promise<boolean> {
  if (!config.apiKey) {
    throw new Error('SendGrid API Key nicht konfiguriert')
  }

  const attachments = options.attachments?.map(att => {
    const base64Content = att.dataUrl.split(',')[1]
    return {
      content: base64Content,
      filename: att.name,
      type: att.type,
      disposition: 'attachment',
    }
  }) || []

  const payload = {
    personalizations: [
      {
        to: [{ email: options.to }],
        subject: options.subject,
      },
    ],
    from: {
      email: options.from || config.fromEmail,
      name: config.fromName,
    },
    reply_to: options.replyTo ? {
      email: options.replyTo,
    } : undefined,
    content: [
      {
        type: 'text/plain',
        value: options.textBody,
      },
      {
        type: 'text/html',
        value: options.htmlBody,
      },
    ],
    attachments: attachments.length > 0 ? attachments : undefined,
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SendGrid API Fehler: ${response.status} - ${errorText}`)
  }

  return true
}

async function sendViaSES(options: EmailOptions, config: SMTPConfig): Promise<boolean> {
  if (!config.apiKey) {
    throw new Error('AWS SES Credentials nicht konfiguriert')
  }

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`
  
  let rawMessage = `From: ${config.fromName} <${options.from || config.fromEmail}>\n`
  rawMessage += `To: ${options.to}\n`
  if (options.replyTo) {
    rawMessage += `Reply-To: ${options.replyTo}\n`
  }
  rawMessage += `Subject: ${options.subject}\n`
  rawMessage += `MIME-Version: 1.0\n`
  rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`
  
  rawMessage += `--${boundary}\n`
  rawMessage += `Content-Type: multipart/alternative; boundary="${boundary}_alt"\n\n`
  
  rawMessage += `--${boundary}_alt\n`
  rawMessage += `Content-Type: text/plain; charset=UTF-8\n\n`
  rawMessage += `${options.textBody}\n\n`
  
  rawMessage += `--${boundary}_alt\n`
  rawMessage += `Content-Type: text/html; charset=UTF-8\n\n`
  rawMessage += `${options.htmlBody}\n\n`
  
  rawMessage += `--${boundary}_alt--\n\n`
  
  if (options.attachments && options.attachments.length > 0) {
    for (const att of options.attachments) {
      const base64Content = att.dataUrl.split(',')[1]
      rawMessage += `--${boundary}\n`
      rawMessage += `Content-Type: ${att.type}; name="${att.name}"\n`
      rawMessage += `Content-Disposition: attachment; filename="${att.name}"\n`
      rawMessage += `Content-Transfer-Encoding: base64\n\n`
      rawMessage += `${base64Content}\n\n`
    }
  }
  
  rawMessage += `--${boundary}--`

  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))

  const sesEndpoint = `https://email.${config.region || 'eu-central-1'}.amazonaws.com/`
  
  const payload = {
    Action: 'SendRawEmail',
    'RawMessage.Data': encodedMessage,
  }

  const response = await fetch(sesEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload).toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AWS SES API Fehler: ${response.status} - ${errorText}`)
  }

  return true
}

function simulateEmailSend(options: EmailOptions): boolean {
  console.log('📧 ═══════════════════════════════════════')
  console.log('📨 E-MAIL SIMULATION (TEST MODE)')
  console.log('═══════════════════════════════════════')
  console.log('An:', options.to)
  console.log('Betreff:', options.subject)
  console.log('Von:', options.from || DEFAULT_CONFIG.fromEmail)
  if (options.replyTo) {
    console.log('Antwort an:', options.replyTo)
  }
  if (options.attachments && options.attachments.length > 0) {
    console.log('Anhänge:', options.attachments.map(a => `${a.name} (${formatBytes(a.size)})`).join(', '))
  }
  console.log('─────────────────────────────────────────')
  console.log('HTML Body:', options.htmlBody.substring(0, 200) + '...')
  console.log('═══════════════════════════════════════')
  return true
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig()

    switch (config.provider) {
      case 'sendgrid':
        await sendViaSendGrid(options, config)
        break

      case 'ses':
        await sendViaSES(options, config)
        break

      case 'test':
      default:
        simulateEmailSend(options)
        break
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    console.error('❌ E-Mail-Versand fehlgeschlagen:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getEmailConfig()

    if (config.provider === 'test') {
      return {
        success: true,
        message: 'Test-Modus aktiv. E-Mails werden simuliert (keine echten E-Mails versendet).',
      }
    }

    const testEmail: EmailOptions = {
      to: 'test@sundsmessebau.de',
      subject: 'Test-E-Mail von S&S Messebau',
      htmlBody: '<html><body><h1>Test erfolgreich!</h1><p>Die E-Mail-Konfiguration funktioniert.</p></body></html>',
      textBody: 'Test erfolgreich! Die E-Mail-Konfiguration funktioniert.',
    }

    const result = await sendEmail(testEmail)

    if (result.success) {
      return {
        success: true,
        message: `Verbindung zu ${config.provider.toUpperCase()} erfolgreich getestet.`,
      }
    } else {
      return {
        success: false,
        message: result.error || 'Verbindungstest fehlgeschlagen.',
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Verbindungstest fehlgeschlagen.',
    }
  }
}

export async function getEmailStatus(): Promise<{
  provider: string
  configured: boolean
  ready: boolean
  testMode: boolean
}> {
  const config = await getEmailConfig()
  const isTestMode = config.provider === 'test'
  const hasApiKey = !!config.apiKey
  
  return {
    provider: config.provider,
    configured: isTestMode || hasApiKey,
    ready: isTestMode || hasApiKey,
    testMode: isTestMode,
  }
}
