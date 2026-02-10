import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Phone, Envelope, MapPin, PaperPlaneRight, ChatCircleDots } from '@phosphor-icons/react'
import { ContactInquiry, ChatMessage } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

interface KontaktPageProps {
  onOpenInquiry: () => void
}

export function KontaktPage({ onOpenInquiry }: KontaktPageProps) {
  const [inquiries, setInquiries] = useKV<ContactInquiry[]>('inquiries', [])
  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hallo! Ich bin Ihr virtueller Messebau-Berater. Wie kann ich Ihnen heute helfen?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

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

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const promptText = `Du bist ein freundlicher Messebau-Berater für S&S Messebau GbR aus Hückelhoven. 
      
Firmeninfo:
- Full-Service Messebau, Eventbau, Ladenbau (20-200 qm)
- Standorte: Hückelhoven, bundesweit tätig
- Leistungen: Konzeption, Design, Produktion, Logistik, Auf-/Abbau, Lagerung
- Stärken: Persönliche Betreuung, starkes Partnernetzwerk, nachhaltige Systeme, faire Preise
- Zielgruppen: Mittelstand (Food/Feinkost, Versicherungen, Industrie)

Grobe Budget-Richtwerte:
- 20-30 qm Systemstand: 8.000-15.000 €
- 50 qm Systemstand: 25.000-35.000 €
- 100 qm Individuell: 60.000-90.000 €
- 200 qm Premium: 120.000-180.000 €

Beantworte die folgende Kundenfrage professionell, freundlich und präzise auf Deutsch. Wenn es um konkrete Projekte geht, empfehle am Ende immer eine persönliche Beratung.

Kundenfrage: ${userMessage}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', false)
      
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      toast.error('Fehler beim Abrufen der Antwort. Bitte versuchen Sie es erneut.')
    } finally {
      setChatLoading(false)
    }
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

              <Card className="bg-muted border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ChatCircleDots className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">AI Messebau-Berater</h3>
                      <p className="text-sm text-muted-foreground">
                        Stellen Sie Fragen zu Kosten, Ablauf, oder lassen Sie sich ein grobes Budget berechnen.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setChatOpen(!chatOpen)} 
                    variant="outline"
                    className="w-full"
                  >
                    {chatOpen ? 'Chat schließen' : 'Chat starten'}
                  </Button>

                  {chatOpen && (
                    <div className="mt-4 border rounded-lg bg-background">
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-4">
                          {chatMessages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">Schreibt...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSubmit())}
                          placeholder="Frage eingeben..."
                          disabled={chatLoading}
                        />
                        <Button
                          onClick={handleChatSubmit}
                          disabled={chatLoading || !chatInput.trim()}
                          size="icon"
                        >
                          <PaperPlaneRight />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
