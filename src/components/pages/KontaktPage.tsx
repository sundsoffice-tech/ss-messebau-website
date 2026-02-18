import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Phone, Envelope, MapPin, PaperPlaneRight, ChatCircleDots, Sparkle, Calculator, ClockClockwise, Lightbulb, X, CheckCircle, ArrowRight, Microphone, Stop, Info } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { ContactInquiry, ChatMessage } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { navigate } from '@/lib/deep-linking'
import { useSectionObserver } from '@/hooks/use-deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { trackFormSubmit } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking } from '@/hooks/use-analytics'
import { useFormSystem } from '@/hooks/use-form-system'
import { FormField } from '@/components/form-system/FormField'
import { sendFormNotification } from '@/lib/notification-service'
import { FIELD_TOKENS } from '@/lib/form-system/field-registry'
import { sendChatMessage } from '@/lib/chat-service'

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  prompt: string
  category: string
}

export function KontaktPage() {
  const { t } = useTranslation()
  useSectionObserver(['kontaktformular', 'anfahrt', 'ki-berater'])
  useScrollDepthTracking('kontakt')
  useDwellTimeTracking('kontakt')

  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useKV<ChatMessage[]>('kontakt-chat-history', [
    { role: 'assistant', content: t('kontakt.chat.welcome') }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const form = useFormSystem({
    context: 'kontakt',
    onSubmit: async (data) => {
      const inquiry: ContactInquiry = {
        id: `inq-${Date.now()}`,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        event: data.event,
        size: data.size,
        budget: data.budget,
        message: data.message,
        timestamp: Date.now(),
      }

      setInquiries((current) => [...(current || []), inquiry])

      // Save inquiry to backend API
      try {
        const { inquiriesApi } = await import('@/lib/api-client')
        await inquiriesApi.create({
          inquiry_id: inquiry.id,
          type: 'kontakt',
          name: data.name,
          email: data.email,
          company: data.company,
          phone: data.phone,
          message: data.message,
          form_data: data,
        })
      } catch (error) {
        console.warn('API unavailable, inquiry saved locally only', error)
      }

      // Send notification via centralized service
      const notifResult = await sendFormNotification({
        type: 'kontakt',
        data,
        inquiryId: inquiry.id,
        customerEmail: data.email,
      })

      if (!notifResult.success) {
        toast.error('E-Mail konnte nicht gesendet werden: ' + (notifResult.error || 'Unbekannter Fehler'))
      }

      trackFormSubmit('kontakt', {
        budget: data.budget || 'nicht_angegeben',
        size: data.size || 'nicht_angegeben',
      })

      toast.success(t(form.config.successKey))
      form.reset()
    },
  })
  
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput({
    lang: 'de-DE',
    continuous: false,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setChatInput((prev) => (prev + ' ' + text).trim())
      }
    },
    onError: (error) => {
      toast.error(error)
    }
  })

  const quickActions: QuickAction[] = [
    {
      id: 'budget-calc',
      icon: <Calculator className="h-5 w-5" />,
      label: t('kontakt.quick.budgetCalc.label'),
      prompt: t('kontakt.quick.budgetCalc.prompt'),
      category: t('kontakt.quick.budgetCalc.category')
    },
    {
      id: 'timeline',
      icon: <ClockClockwise className="h-5 w-5" />,
      label: t('kontakt.quick.timeline.label'),
      prompt: t('kontakt.quick.timeline.prompt'),
      category: t('kontakt.quick.timeline.category')
    },
    {
      id: 'materials',
      icon: <Lightbulb className="h-5 w-5" />,
      label: t('kontakt.quick.materials.label'),
      prompt: t('kontakt.quick.materials.prompt'),
      category: t('kontakt.quick.materials.category')
    },
    {
      id: 'sizes',
      icon: <Sparkle className="h-5 w-5" />,
      label: t('kontakt.quick.sizes.label'),
      prompt: t('kontakt.quick.sizes.prompt'),
      category: t('kontakt.quick.sizes.category')
    },
    {
      id: 'logistics',
      icon: <ArrowRight className="h-5 w-5" />,
      label: t('kontakt.quick.logistics.label'),
      prompt: t('kontakt.quick.logistics.prompt'),
      category: t('kontakt.quick.logistics.category')
    },
    {
      id: 'references',
      icon: <CheckCircle className="h-5 w-5" />,
      label: t('kontakt.quick.references.label'),
      prompt: t('kontakt.quick.references.prompt'),
      category: t('kontakt.quick.references.category')
    }
  ]

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isTyping])

  useEffect(() => {
    if (isTyping && typingText) {
      const timer = setTimeout(() => {
        setChatMessages((prev) => {
          const updated = [...(prev || [])]
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1].content = typingText
          }
          return updated
        })
        setIsTyping(false)
        setTypingText('')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isTyping, typingText])

  const handleChatSubmit = async (customPrompt?: string) => {
    const userMessage = customPrompt || chatInput.trim()
    if (!userMessage || chatLoading) return

    if (!customPrompt) {
      setChatInput('')
    }
    
    resetTranscript()
    
    setShowQuickActions(false)
    setChatMessages((prev) => [...(prev || []), { role: 'user', content: userMessage }])
    setChatLoading(true)
    setIsTyping(true)

    try {
      const contextMessages = (chatMessages || []).slice(-6).map(m => 
        `${m.role === 'user' ? 'Kunde' : 'Berater'}: ${m.content}`
      ).join('\n\n')

      const systemPrompt = `Du bist ein professioneller Berater für S&S Messebau GbR aus Hückelhoven. Du hilfst Kunden bei allen Fragen rund um Messebau, Eventbau und Ladenbau.

FIRMENINFO S&S MESSEBAU:
━━━━━━━━━━━━━━━━━━━━━━━
• Standort: Hückelhoven, NRW (bundesweite Projekte)
• Leistungen: Full-Service von Konzeption bis Abbau
  - Messebau (20-200 qm): Systemstände & Individualstände
  - Eventbau & Bühnen
  - Ladenbau & Showrooms
  - Böden, Möbel, Ausstattung
• Services: Design, Konzeptentwicklung, Produktion, Logistik, Auf-/Abbau, Lagerung, Wartung
• USPs:
  - Persönliche Betreuung durch erfahrenes Team
  - Starkes Partnernetzwerk (Logistik, Material, Druck)
  - Nachhaltige, wiederverwendbare Systeme
  - Faire, transparente Preise für Mittelstand
• Zielgruppen: Food/Feinkost, Versicherungen, Industrie, Technik
• Kontakt: Mobil +49 1514 0368754, info@sundsmessebau.com

BUDGET-RICHTWERTE (inkl. Design, Bau, Logistik, Auf-/Abbau):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 20-30 qm Systemstand: 8.000 - 15.000 €
• 40-50 qm Systemstand Plus: 18.000 - 30.000 €
• 60-80 qm Individual-Kombination: 35.000 - 55.000 €
• 100 qm Individuell: 60.000 - 90.000 €
• 150 qm Premium: 95.000 - 140.000 €
• 200 qm Flagship: 120.000 - 200.000 €

Zusatzkosten: Grafikdesign (1.500-5.000€), Möbel/AV-Technik (nach Bedarf), Standpersonal, Catering

TYPISCHER PROJEKTABLAUF:
━━━━━━━━━━━━━━━━━━━━━━━
1. Erstgespräch & Briefing (1-2 Tage)
2. Konzept & 3D-Design (1-2 Wochen)
3. Angebotserstellung & Freigabe (3-5 Tage)
4. Produktion (3-6 Wochen je nach Größe)
5. Logistik & Anlieferung (koordiniert)
6. Aufbau vor Ort (1-3 Tage)
7. Messebetrieb & Betreuung
8. Abbau & Lagerung/Entsorgung (1 Tag)

⏱️ Vorlaufzeit: Mind. 8-12 Wochen vor Messe empfohlen

GESPRÄCHSHISTORIE:
${contextMessages}

ANTWORTRICHTLINIEN:
✓ Antworte präzise, freundlich und professionell auf Deutsch
✓ Nutze maximal 1-2 passende Emojis pro Antwort für visuellen Akzent
✓ Bei Budget-Fragen: Gib konkrete Richtwerte aus der Liste
✓ Bei komplexen Projekten: Empfehle persönliche Beratung
✓ Bei Unsicherheit: Transparent kommunizieren und Rückruf anbieten
✓ Strukturiere längere Antworten mit Absätzen und Aufzählungen
✓ Verweise bei Bedarf auf: Kontaktmöglichkeiten, Referenzen`

      const chatResponse = await sendChatMessage({
        message: userMessage,
        context: contextMessages,
        systemPrompt,
      })

      if (!chatResponse.success) {
        toast.error(chatResponse.message)
        setChatMessages((prev) => {
          const filtered = (prev || []).filter((_, idx) => idx !== (prev || []).length - 1)
          return filtered
        })
        setIsTyping(false)
        setChatLoading(false)
        return
      }

      const response = chatResponse.message
      
      setTypingText(response)
      setChatMessages((prev) => [...(prev || []), { role: 'assistant', content: '' }])
      
      let currentText = ''
      const words = response.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i]
        setTypingText(currentText)
        await new Promise(resolve => setTimeout(resolve, 30))
      }
      
      setChatMessages((prev) => {
        const updated = [...(prev || [])]
        if (updated[updated.length - 1]?.role === 'assistant') {
          updated[updated.length - 1].content = response
        }
        return updated
      })
      setIsTyping(false)
      setTypingText('')
      
    } catch {
      toast.error(t('kontakt.chat.error'))
      setChatMessages((prev) => {
        const filtered = (prev || []).filter((_, idx) => idx !== (prev || []).length - 1)
        return filtered
      })
      setIsTyping(false)
    } finally {
      setChatLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    handleChatSubmit(action.prompt)
  }

  const clearChat = () => {
    setChatMessages([
      { role: 'assistant', content: t('kontakt.chat.reset') }
    ])
    setShowQuickActions(true)
  }

  return (
    <div>
      <section id="kontakt-hero" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t('kontakt.hero.title')}</h1>
          <p className="text-base sm:text-xl opacity-90 max-w-3xl">
            {t('kontakt.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="kontaktformular" className="py-8 sm:py-12 lg:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('kontakt.form.heading')}</h2>
              <form onSubmit={form.handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  {form.config.fields.map((fieldConfig) => {
                    const token = FIELD_TOKENS[fieldConfig.token]
                    if (!token) return null
                    return (
                      <FormField
                        key={token.key}
                        tokenKey={fieldConfig.token}
                        value={form.values[token.key]}
                        error={form.errors[token.key]}
                        required={fieldConfig.required}
                        onChange={(val) => form.setValue(token.key, val)}
                        hintKey={token.key === 'message' ? 'form.message.hint' : undefined}
                      />
                    )
                  })}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={form.loading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 sm:h-11 text-base font-semibold"
                >
                  {form.loading ? t('kontakt.form.sending') : t('kontakt.form.send')}
                  <PaperPlaneRight className="ml-2" weight="fill" />
                </Button>
              </form>
            </div>

            <div className="order-1 lg:order-2" id="anfahrt">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('kontakt.contact.title')}</h2>
              <div className="space-y-4 mb-6 sm:mb-8">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">{t('kontakt.contact.address')}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {t('kontakt.contact.address.line1')}<br />
                          {t('kontakt.contact.address.line2')}<br />
                          {t('kontakt.contact.address.line3')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">{t('kontakt.contact.phone')}</h3>
                        <div className="text-sm sm:text-base text-muted-foreground">
                          <a href="tel:+4915140368754" className="hover:text-primary font-medium">+49 1514 0368754</a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Envelope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">{t('kontakt.contact.email')}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground break-all">
                          <a href="mailto:info@sundsmessebau.com" className="hover:text-primary font-medium">
                            info@sundsmessebau.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card id="ki-berater" className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 shadow-lg scroll-mt-20">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                        <Sparkle className="h-6 w-6 sm:h-7 sm:w-7" weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl mb-1">{t('kontakt.ai.title')}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {t('kontakt.ai.subtitle')}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {t('kontakt.ai.description')}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">{t('kontakt.ai.feature.budget')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <ClockClockwise className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">{t('kontakt.ai.feature.timeline')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">{t('kontakt.ai.feature.materials')}</span>
                    </div>
                    {isVoiceSupported && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-2 border border-accent/30">
                        <Microphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" weight="fill" />
                        <span className="font-semibold text-[11px] sm:text-xs leading-tight">{t('kontakt.ai.feature.voice')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setChatOpen(!chatOpen)} 
                      className="flex-1 bg-primary hover:bg-primary/90 h-11 sm:h-10"
                      size="lg"
                    >
                      {chatOpen ? (
                        <>
                          <X className="mr-2 h-5 w-5" />
                          <span className="text-sm">{t('kontakt.ai.minimize')}</span>
                        </>
                      ) : (
                        <>
                          <ChatCircleDots className="mr-2 h-5 w-5" weight="fill" />
                          <span className="text-sm">{t('kontakt.ai.start')}</span>
                        </>
                      )}
                    </Button>
                    {chatOpen && (chatMessages?.length ?? 0) > 2 && (
                      <Button
                        onClick={clearChat}
                        variant="outline"
                        size="lg"
                        className="h-11 sm:h-10 px-3"
                      >
                        <ClockClockwise className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <Button 
                    onClick={() => navigate('/ki-berater')}
                    variant="outline"
                    className="w-full h-10 text-sm"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    {t('kontakt.ai.learnMore')}
                  </Button>

                  {chatOpen && (
                    <div className="border-2 rounded-xl bg-background shadow-inner overflow-hidden">
                      {isListening && (
                        <div className="bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 border-b border-red-500/30 p-2 sm:p-3 animate-pulse">
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <div className="flex gap-0.5 sm:gap-1">
                              <div className="w-0.5 sm:w-1 h-4 sm:h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
                              <div className="w-0.5 sm:w-1 h-5 sm:h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '100ms', animationDuration: '600ms' }} />
                              <div className="w-0.5 sm:w-1 h-6 sm:h-10 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '600ms' }} />
                              <div className="w-0.5 sm:w-1 h-5 sm:h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
                              <div className="w-0.5 sm:w-1 h-4 sm:h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '600ms' }} />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-red-700">
                              {t('kontakt.ai.listening')}
                            </span>
                          </div>
                        </div>
                      )}
                      <ScrollArea className="h-[400px] sm:h-[500px]" ref={scrollRef}>
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          {(chatMessages || []).map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                              <div
                                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 shadow-sm ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted border border-border'
                                }`}
                              >
                                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 shadow-sm bg-muted border border-border">
                                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{typingText}</p>
                                <div className="flex gap-1 mt-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                          {chatLoading && !isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-2xl p-3 sm:p-4 shadow-sm border border-border">
                                <div className="flex gap-2 items-center">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  <span className="text-xs sm:text-sm text-muted-foreground ml-2">{t('kontakt.ai.analyzing')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                      </ScrollArea>

                      {showQuickActions && !chatLoading && (
                        <div className="p-3 sm:p-4 border-t bg-muted/30">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t('kontakt.ai.quickActions')}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            {quickActions.map((action) => (
                              <Button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                variant="outline"
                                size="sm"
                                className="justify-start text-[11px] sm:text-xs h-auto py-2 hover:bg-primary/10 hover:border-primary/50"
                                disabled={chatLoading}
                              >
                                <span className="mr-1.5 sm:mr-2 shrink-0">{action.icon}</span>
                                <span className="truncate text-left">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3 sm:p-4 border-t bg-background/50">
                        <div className="flex gap-2">
                          <Input
                            value={isListening ? (chatInput + ' ' + interimTranscript).trim() : chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleChatSubmit()
                              }
                            }}
                            placeholder={isListening ? t('kontakt.ai.placeholder.listening') : t('kontakt.ai.placeholder.default')}
                            disabled={chatLoading || isListening}
                            className="flex-1 h-11 sm:h-10 text-sm"
                          />
                          {isVoiceSupported && (
                            <Button
                              onClick={isListening ? stopListening : startListening}
                              disabled={chatLoading}
                              size="icon"
                              variant={isListening ? "destructive" : "outline"}
                              className={`h-11 w-11 sm:h-10 sm:w-10 shrink-0 ${isListening ? "animate-pulse" : ""}`}
                              title={isListening ? t('kontakt.ai.voiceStop') : t('kontakt.ai.voiceStart')}
                            >
                              {isListening ? (
                                <Stop weight="fill" className="h-5 w-5" />
                              ) : (
                                <Microphone weight="fill" className="h-5 w-5" />
                              )}
                            </Button>
                          )}
                          <Button
                            onClick={() => handleChatSubmit()}
                            disabled={chatLoading || !chatInput.trim() || isListening}
                            size="icon"
                            className="shrink-0 bg-primary hover:bg-primary/90 h-11 w-11 sm:h-10 sm:w-10"
                          >
                            <PaperPlaneRight weight="fill" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span>
                            {t('kontakt.ai.poweredBy')}
                          </span>
                          {isVoiceSupported && (
                            <span className="flex items-center gap-1">
                              <Microphone className="h-3 w-3" />
                              {t('kontakt.ai.voiceActive')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2516.847!2d6.223!3d51.056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDAzJzIxLjYiTiA2wrAxMyczMy44IkU!5e0!3m2!1sde!2sde!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title={t('kontakt.map.title')}
            />
          </div>
        </div>
      </section>

      <InternalLinkSection
        title={t('kontakt.links.title')}
        links={[
          { label: t('kontakt.links.services.label'), description: t('kontakt.links.services.desc'), hash: '/leistungen' },
          { label: t('kontakt.links.industries.label'), description: t('kontakt.links.industries.desc'), hash: '/branchen' },
          { label: t('kontakt.links.references.label'), description: t('kontakt.links.references.desc'), hash: '/referenzen' },
          { label: t('kontakt.links.process.label'), description: t('kontakt.links.process.desc'), hash: '/ablauf' },
          { label: t('kontakt.links.sustainability.label'), description: t('kontakt.links.sustainability.desc'), hash: '/nachhaltigkeit' },
          { label: t('kontakt.links.about.label'), description: t('kontakt.links.about.desc'), hash: '/ueber-uns' },
        ]}
      />
    </div>
  )
}
