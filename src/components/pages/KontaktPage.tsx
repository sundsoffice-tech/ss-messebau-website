import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Phone, Envelope, MapPin, PaperPlaneRight, ChatCircleDots, Sparkle, Calculator, ClockClockwise, Lightbulb, X, CheckCircle, ArrowRight, Microphone, Stop, Info } from '@phosphor-icons/react'
import { ContactInquiry, ChatMessage } from '@/lib/types'
import { useKV } from '@/hooks/use-kv'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useSectionObserver } from '@/hooks/use-deep-linking'

interface KontaktPageProps {
  onOpenInquiry: () => void
}

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  prompt: string
  category: string
}

export function KontaktPage({ _onOpenInquiry }: KontaktPageProps) {
  useSectionObserver(['kontaktformular', 'anfahrt', 'ki-berater'])

  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useKV<ChatMessage[]>('kontakt-chat-history', [
    { role: 'assistant', content: 'Guten Tag! Ich unterstütze Sie gerne bei allen Fragen rund um Ihren Messeauftritt.\n\nStellen Sie mir Fragen zu:\n• Budget und Kosten\n• Planung und Ablauf\n• Materialien und Systeme\n• Logistik und Organisation\n\nWie kann ich Ihnen weiterhelfen?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
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

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    event: '',
    size: '',
    budget: '',
    message: ''
  })

  const quickActions: QuickAction[] = [
    {
      id: 'budget-calc',
      icon: <Calculator className="h-5 w-5" />,
      label: 'Budget berechnen',
      prompt: 'Ich möchte ein ungefähres Budget für meinen Messestand berechnen lassen.',
      category: 'Planung'
    },
    {
      id: 'timeline',
      icon: <ClockClockwise className="h-5 w-5" />,
      label: 'Timeline & Ablauf',
      prompt: 'Wie lange dauert es von der Anfrage bis zum fertigen Stand? Welche Schritte sind nötig?',
      category: 'Planung'
    },
    {
      id: 'materials',
      icon: <Lightbulb className="h-5 w-5" />,
      label: 'Materialberatung',
      prompt: 'Welche Materialien und Systeme empfehlen Sie für nachhaltigen Messebau?',
      category: 'Beratung'
    },
    {
      id: 'sizes',
      icon: <Sparkle className="h-5 w-5" />,
      label: 'Standgrößen',
      prompt: 'Was sind typische Standgrößen und was kann man damit realisieren?',
      category: 'Grundlagen'
    },
    {
      id: 'logistics',
      icon: <ArrowRight className="h-5 w-5" />,
      label: 'Logistik & Transport',
      prompt: 'Wie funktioniert die Logistik bei einem Messeprojekt?',
      category: 'Organisation'
    },
    {
      id: 'references',
      icon: <CheckCircle className="h-5 w-5" />,
      label: 'Referenzprojekte',
      prompt: 'Können Sie mir Beispiele für erfolgreiche Messestände zeigen?',
      category: 'Inspiration'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      setLoading(false)
      return
    }

    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      ...formData,
      timestamp: Date.now()
    }

    setInquiries((current) => [...(current || []), inquiry])

    toast.success('Vielen Dank! Wir melden uns innerhalb von 24 Stunden bei Ihnen.')
    
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      event: '',
      size: '',
      budget: '',
      message: ''
    })
    
    setLoading(false)
  }

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

      const prompt = `Du bist ein professioneller Berater für S&S Messebau GbR aus Mönchengladbach. Du hilfst Kunden bei allen Fragen rund um Messebau, Eventbau und Ladenbau.

FIRMENINFO S&S MESSEBAU:
━━━━━━━━━━━━━━━━━━━━━━━
• Standort: Mönchengladbach, NRW (bundesweite Projekte)
• Leistungen: Full-Service von Konzeption bis Abbau
  - Messebau (20-200 qm): Systemstände & Individualstände
  - Eventbau & Bühnen
  - Ladenbau & Showrooms
  - Böden, Möbel, Ausstattung
• Services: Design, 3D-Visualisierung, Produktion, Logistik, Auf-/Abbau, Lagerung, Wartung
• USPs:
  - Persönliche Betreuung durch erfahrenes Team
  - Starkes Partnernetzwerk (Logistik, Material, Druck)
  - Nachhaltige, wiederverwendbare Systeme
  - Faire, transparente Preise für Mittelstand
• Zielgruppen: Food/Feinkost, Versicherungen, Industrie, Technik
• Kontakt: Tel. +49 176 31570041, sunds-messebau@gmx.de

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

AKTUELLE KUNDENFRAGE:
${userMessage}

ANTWORTRICHTLINIEN:
✓ Antworte präzise, freundlich und professionell auf Deutsch
✓ Nutze maximal 1-2 passende Emojis pro Antwort für visuellen Akzent
✓ Bei Budget-Fragen: Gib konkrete Richtwerte aus der Liste
✓ Bei komplexen Projekten: Empfehle persönliche Beratung
✓ Bei Unsicherheit: Transparent kommunizieren und Rückruf anbieten
✓ Strukturiere längere Antworten mit Absätzen und Aufzählungen
✓ Verweise bei Bedarf auf: Kontaktmöglichkeiten, Referenzen

Antworte jetzt:`

      const response = await window.spark.llm(prompt, 'gpt-4o', false)
      
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
      toast.error('Fehler beim Abrufen der Antwort. Bitte versuchen Sie es erneut.')
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
      { role: 'assistant', content: 'Chat wurde zurückgesetzt.\n\nWie kann ich Ihnen weiterhelfen?' }
    ])
    setShowQuickActions(true)
  }

  return (
    <div>
      <section id="kontakt-hero" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Kontakt</h1>
          <p className="text-base sm:text-xl opacity-90 max-w-3xl">
            Haben Sie Fragen oder ein konkretes Projekt? Kontaktieren Sie uns – wir freuen uns auf Ihre Nachricht!
          </p>
        </div>
      </section>

      <section id="kontaktformular" className="py-8 sm:py-12 lg:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Schreiben Sie uns</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-sm sm:text-base">Name *</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Max Mustermann"
                      required
                      className="h-11 sm:h-10"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-company" className="text-sm sm:text-base">Firma</Label>
                    <Input
                      id="contact-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Mustermann GmbH"
                      className="h-11 sm:h-10"
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-sm sm:text-base">E-Mail *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="max@mustermann.de"
                      required
                      className="h-11 sm:h-10"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-sm sm:text-base">Telefon</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+49 123 456789"
                      className="h-11 sm:h-10"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-event" className="text-sm sm:text-base">Messe / Event</Label>
                    <Input
                      id="contact-event"
                      value={formData.event}
                      onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                      placeholder="z.B. Anuga"
                      className="h-11 sm:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-size" className="text-sm sm:text-base">Standgröße</Label>
                    <Input
                      id="contact-size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="z.B. 50 qm"
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-budget" className="text-sm sm:text-base">Budget (optional)</Label>
                  <Input
                    id="contact-budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="z.B. 30.000 - 40.000 €"
                    className="h-11 sm:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm sm:text-base">Ihre Nachricht *</Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Beschreiben Sie uns Ihr Projekt..."
                    rows={4}
                    required
                    className="resize-y min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 h-12 sm:h-11 text-base font-semibold"
                >
                  {loading ? 'Wird gesendet...' : 'Nachricht absenden'}
                  <PaperPlaneRight className="ml-2" weight="fill" />
                </Button>
              </form>
            </div>

            <div className="order-1 lg:order-2" id="anfahrt">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Kontaktdaten</h2>
              <div className="space-y-4 mb-6 sm:mb-8">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Adresse</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Bonnenbroicherstraße 93<br />
                          41238 Mönchengladbach<br />
                          Deutschland
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
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Telefon</h3>
                        <div className="text-sm sm:text-base text-muted-foreground">
                          <a href="tel:+4917631570041" className="hover:text-primary font-medium">+49 176 31570041</a>
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
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">E-Mail</h3>
                        <p className="text-sm sm:text-base text-muted-foreground break-all">
                          <a href="mailto:sunds-messebau@gmx.de" className="hover:text-primary font-medium">
                            sunds-messebau@gmx.de
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
                        <CardTitle className="text-lg sm:text-xl mb-1">KI-Messebau-Berater</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Sofortige Antworten rund um die Uhr
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Stellen Sie Fragen zu Budget, Planung und Materialien – per Text oder Spracheingabe. 
                    Unser intelligenter Berater unterstützt Sie bei allen Aspekten Ihres Messeprojekts.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">Budget-Kalkulation</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <ClockClockwise className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">Timeline-Planung</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" weight="fill" />
                      <span className="font-medium text-[11px] sm:text-xs leading-tight">Materialberatung</span>
                    </div>
                    {isVoiceSupported && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-2 border border-accent/30">
                        <Microphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" weight="fill" />
                        <span className="font-semibold text-[11px] sm:text-xs leading-tight">Spracheingabe</span>
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
                          <span className="text-sm">Minimieren</span>
                        </>
                      ) : (
                        <>
                          <ChatCircleDots className="mr-2 h-5 w-5" weight="fill" />
                          <span className="text-sm">Chat starten</span>
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
                    onClick={() => window.location.hash = '/ki-berater'}
                    variant="outline"
                    className="w-full h-10 text-sm"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Mehr über den KI-Berater erfahren
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
                              Sprechen Sie jetzt...
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
                                  <span className="text-xs sm:text-sm text-muted-foreground ml-2">Analysiere Anfrage...</span>
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
                            Schnellaktionen
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
                            placeholder={isListening ? "Ich höre zu..." : "Ihre Frage eingeben..."}
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
                              title={isListening ? "Aufnahme stoppen" : "Spracheingabe starten"}
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
                            Powered by GPT-4
                          </span>
                          {isVoiceSupported && (
                            <span className="flex items-center gap-1">
                              <Microphone className="h-3 w-3" />
                              Spracheingabe aktiv
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
              title="S&S Messebau Standort"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
