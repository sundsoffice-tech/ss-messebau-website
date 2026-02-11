import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Phone, Envelope, MapPin, PaperPlaneRight, ChatCircleDots, Sparkle, Calculator, ClockClockwise, Lightbulb, X, CheckCircle, ArrowRight, Microphone, Stop } from '@phosphor-icons/react'
import { ContactInquiry, ChatMessage } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { useVoiceInput } from '@/hooks/use-voice-input'

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

export function KontaktPage({ onOpenInquiry }: KontaktPageProps) {
  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useKV<ChatMessage[]>('kontakt-chat-history', [
    { role: 'assistant', content: 'Hallo! 👋 Ich bin Ihr intelligenter Messebau-Berater, ausgestattet mit umfangreichem Wissen über S&S Messebau.\n\nIch kann Ihnen helfen bei:\n• Budget-Kalkulation für Ihr Projekt\n• Ablauf und Timeline-Planung\n• Materialempfehlungen\n• Logistik und Standortfragen\n• Referenzen und Beispiele\n\nWie kann ich Sie heute unterstützen?' }
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
    transcript,
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

      const promptParts = [
        'Du bist ein exzellenter, freundlicher KI-Berater für S&S Messebau GbR aus Hückelhoven. Du hilfst Kunden bei allen Fragen rund um Messebau, Eventbau und Ladenbau.\n\n',
        'FIRMENINFO S&S MESSEBAU:\n',
        '━━━━━━━━━━━━━━━━━━━━━━━\n',
        '• Standort: Hückelhoven, NRW (bundesweite Projekte)\n',
        '• Leistungen: Full-Service von Konzeption bis Abbau\n',
        '  - Messebau (20-200 qm): Systemstände & Individualstände\n',
        '  - Eventbau & Bühnen\n',
        '  - Ladenbau & Showrooms\n',
        '  - Böden, Möbel, Ausstattung\n',
        '• Services: Design, 3D-Visualisierung, Produktion, Logistik, Auf-/Abbau, Lagerung, Wartung\n',
        '• USPs:\n',
        '  - Persönliche Betreuung durch erfahrenes Team\n',
        '  - Starkes Partnernetzwerk (Logistik, Material, Druck)\n',
        '  - Nachhaltige, wiederverwendbare Systeme\n',
        '  - Faire, transparente Preise für Mittelstand\n',
        '• Zielgruppen: Food/Feinkost, Versicherungen, Industrie, Technik\n',
        '• Kontakt: Tel. (02433) 4427144, Mobil (01514) 0322125, info@sundsmessebau.de\n\n',
        'BUDGET-RICHTWERTE (inkl. Design, Bau, Logistik, Auf-/Abbau):\n',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
        '• 20-30 qm Systemstand: 8.000 - 15.000 €\n',
        '• 40-50 qm Systemstand Plus: 18.000 - 30.000 €\n',
        '• 60-80 qm Individual-Kombination: 35.000 - 55.000 €\n',
        '• 100 qm Individuell: 60.000 - 90.000 €\n',
        '• 150 qm Premium: 95.000 - 140.000 €\n',
        '• 200 qm Flagship: 120.000 - 200.000 €\n\n',
        'Zusatzkosten: Grafikdesign (1.500-5.000€), Möbel/AV-Technik (nach Bedarf), Standpersonal, Catering\n\n',
        'TYPISCHER PROJEKTABLAUF:\n',
        '━━━━━━━━━━━━━━━━━━━━━━━\n',
        '1. Erstgespräch & Briefing (1-2 Tage)\n',
        '2. Konzept & 3D-Design (1-2 Wochen)\n',
        '3. Angebotserstellung & Freigabe (3-5 Tage)\n',
        '4. Produktion (3-6 Wochen je nach Größe)\n',
        '5. Logistik & Anlieferung (koordiniert)\n',
        '6. Aufbau vor Ort (1-3 Tage)\n',
        '7. Messebetrieb & Betreuung\n',
        '8. Abbau & Lagerung/Entsorgung (1 Tag)\n\n',
        '⏱️ Vorlaufzeit: Mind. 8-12 Wochen vor Messe empfohlen\n\n',
        'GESPRÄCHSHISTORIE:\n',
        contextMessages,
        '\n\nAKTUELLE KUNDENFRAGE:\n',
        userMessage,
        '\n\nANTWORTRICHTLINIEN:\n',
        '✓ Antworte präzise, freundlich und professionell auf Deutsch\n',
        '✓ Nutze Emojis sparsam aber gezielt (max. 2-3 pro Antwort)\n',
        '✓ Bei Budget-Fragen: Gib konkrete Richtwerte aus der Liste\n',
        '✓ Bei komplexen Projekten: Empfehle persönliche Beratung\n',
        '✓ Bei Unsicherheit: Transparent kommunizieren und Rückruf anbieten\n',
        '✓ Strukturiere längere Antworten mit Bullet Points oder Absätzen\n',
        '✓ Verweise bei Bedarf auf: Website-Bereiche, Referenzen, Kontaktmöglichkeiten\n\n',
        'Antworte jetzt:'
      ]

      const promptText = promptParts.join('')

      const response = await window.spark.llm(promptText, 'gpt-4o', false)
      
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
      
    } catch (error) {
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
      { role: 'assistant', content: 'Chat wurde zurückgesetzt. 🔄\n\nWie kann ich Ihnen weiterhelfen?' }
    ])
    setShowQuickActions(true)
  }

  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Kontakt</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Haben Sie Fragen oder ein konkretes Projekt? Kontaktieren Sie uns – wir freuen uns auf Ihre Nachricht!
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Schreiben Sie uns</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Max Mustermann"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-company">Firma</Label>
                    <Input
                      id="contact-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Mustermann GmbH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">E-Mail *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="max@mustermann.de"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telefon</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+49 123 456789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-event">Messe / Event</Label>
                    <Input
                      id="contact-event"
                      value={formData.event}
                      onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                      placeholder="z.B. Anuga 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-size">Standgröße</Label>
                    <Input
                      id="contact-size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="z.B. 50 qm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-budget">Budget (optional)</Label>
                  <Input
                    id="contact-budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="z.B. 30.000 - 40.000 €"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Ihre Nachricht *</Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Beschreiben Sie uns Ihr Projekt..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? 'Wird gesendet...' : 'Nachricht absenden'}
                  <PaperPlaneRight className="ml-2" />
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Kontaktdaten</h2>
              <div className="space-y-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Adresse</h3>
                        <p className="text-muted-foreground">
                          Marienstr. 37-42<br />
                          41836 Hückelhoven<br />
                          Deutschland
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telefon</h3>
                        <p className="text-muted-foreground">
                          Festnetz: <a href="tel:+4924334427144" className="hover:text-primary">(02433) 4427144</a><br />
                          Mobil: <a href="tel:+4915140322125" className="hover:text-primary">(01514) 0322125</a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Envelope className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">E-Mail</h3>
                        <p className="text-muted-foreground">
                          <a href="mailto:info@sundsmessebau.de" className="hover:text-primary">
                            info@sundsmessebau.de
                          </a>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                        <Sparkle className="h-7 w-7" weight="fill" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">🤖 KI Messebau-Experte</CardTitle>
                        <CardDescription>
                          Intelligente Beratung mit Kontextwissen über S&S Messebau
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                      <span>Budget-Kalkulation</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                      <span>Timeline-Planung</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                      <span>Materialberatung</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                      <span>24/7 Verfügbar</span>
                    </div>
                    {isVoiceSupported && (
                      <>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-2 border border-accent/30">
                          <Microphone className="h-4 w-4 text-accent" weight="fill" />
                          <span className="font-semibold">Spracheingabe</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2">
                          <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                          <span>Freihändig bedienbar</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setChatOpen(!chatOpen)} 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {chatOpen ? (
                        <>
                          <X className="mr-2" />
                          Chat minimieren
                        </>
                      ) : (
                        <>
                          <ChatCircleDots className="mr-2" weight="fill" />
                          Chat starten
                        </>
                      )}
                    </Button>
                    {chatOpen && (chatMessages?.length ?? 0) > 2 && (
                      <Button
                        onClick={clearChat}
                        variant="outline"
                        size="lg"
                      >
                        <ClockClockwise />
                      </Button>
                    )}
                  </div>

                  {chatOpen && (
                    <div className="border-2 rounded-xl bg-background shadow-inner overflow-hidden">
                      {isListening && (
                        <div className="bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 border-b border-red-500/30 p-3 animate-pulse">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-1 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
                              <div className="w-1 h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '100ms', animationDuration: '600ms' }} />
                              <div className="w-1 h-10 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '600ms' }} />
                              <div className="w-1 h-8 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
                              <div className="w-1 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '600ms' }} />
                            </div>
                            <span className="text-sm font-semibold text-red-700">
                              🎤 Sprechen Sie jetzt...
                            </span>
                          </div>
                        </div>
                      )}
                      <ScrollArea className="h-[500px]" ref={scrollRef}>
                        <div className="p-4 space-y-4">
                          {(chatMessages || []).map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted border border-border'
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="max-w-[85%] rounded-2xl p-4 shadow-sm bg-muted border border-border">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{typingText}</p>
                                <div className="flex gap-1 mt-2">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                          {chatLoading && !isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-2xl p-4 shadow-sm border border-border">
                                <div className="flex gap-2 items-center">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  <span className="text-sm text-muted-foreground ml-2">Analysiere Anfrage...</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                      </ScrollArea>

                      {showQuickActions && !chatLoading && (
                        <div className="p-4 border-t bg-muted/30">
                          <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Schnellaktionen
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => (
                              <Button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                variant="outline"
                                size="sm"
                                className="justify-start text-xs h-auto py-2 hover:bg-primary/10 hover:border-primary/50"
                                disabled={chatLoading}
                              >
                                <span className="mr-2">{action.icon}</span>
                                <span className="truncate">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 border-t bg-background/50">
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
                            placeholder={isListening ? "Ich höre zu..." : "Stellen Sie Ihre Frage..."}
                            disabled={chatLoading || isListening}
                            className="flex-1"
                          />
                          {isVoiceSupported && (
                            <Button
                              onClick={isListening ? stopListening : startListening}
                              disabled={chatLoading}
                              size="icon"
                              variant={isListening ? "destructive" : "outline"}
                              className={isListening ? "animate-pulse" : ""}
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
                            className="shrink-0 bg-primary hover:bg-primary/90"
                          >
                            <PaperPlaneRight weight="fill" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            Powered by GPT-4 • Kontextwissen über S&S Messebau
                          </p>
                          {isVoiceSupported && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Microphone className="h-3 w-3" />
                              Spracheingabe verfügbar
                            </p>
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

      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Sparkle className="h-8 w-8 text-primary" weight="fill" />
            </div>
            <h2 className="text-3xl font-bold mb-4">KI-gestützte Beratung</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unser intelligenter Messebau-Experte nutzt GPT-4 Technologie und verfügt über umfassendes Wissen zu S&S Messebau
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Budget-Kalkulator</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie sofortige, realistische Budget-Schätzungen basierend auf Standgröße und Anforderungen
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ClockClockwise className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Timeline-Planer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detaillierte Zeitpläne von Erstgespräch bis Messetermin mit allen wichtigen Meilensteinen
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Material-Berater</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Empfehlungen zu Systemen, Materialien und nachhaltigen Lösungen für Ihr Projekt
                </p>
              </CardContent>
            </Card>
          </div>

          {isVoiceSupported && (
            <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/30 mb-12">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg">
                    <Microphone className="h-9 w-9" weight="fill" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      🎤 Spracheingabe verfügbar
                      <span className="text-xs bg-accent text-white px-2 py-1 rounded-full font-semibold">NEU</span>
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Stellen Sie Ihre Fragen bequem per Sprache! Klicken Sie im Chat auf das Mikrofon-Symbol und sprechen Sie Ihre Frage. 
                      Die Spracheingabe erfolgt direkt in Ihrem Browser – sicher und privat.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" weight="fill" />
                        <span>Freihändige Bedienung</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" weight="fill" />
                        <span>Deutsche Spracherkennung</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" weight="fill" />
                        <span>Sofortige Verarbeitung</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="p-8">
              <h3 className="font-semibold text-lg mb-4">💡 Beispiel-Fragen, die Sie stellen können{isVoiceSupported && ' (auch per Sprache)'}:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Was kostet ein 50 qm Messestand inklusive Aufbau für die Anuga?"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Wie lange dauert die Planung und Umsetzung eines individuellen Stands?"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Welche nachhaltigen Systemlösungen bieten Sie an?"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Was ist der Unterschied zwischen System- und Individualstand?"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Wie funktioniert die Logistik bei einer Messe in München?"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">•</div>
                  <p className="text-sm">"Können Sie mir Referenzen aus der Food-Branche zeigen?"</p>
                </div>
              </div>
              {isVoiceSupported && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-3 bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <Microphone className="h-5 w-5 text-accent shrink-0 mt-0.5" weight="fill" />
                    <div>
                      <p className="text-sm font-semibold mb-1">💡 Tipp: Spracheingabe nutzen</p>
                      <p className="text-xs text-muted-foreground">
                        Klicken Sie auf das Mikrofon-Symbol im Chat und sprechen Sie Ihre Frage natürlich aus. 
                        Die Spracherkennung funktioniert am besten in ruhiger Umgebung.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="aspect-video rounded-lg overflow-hidden">
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
