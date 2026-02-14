import { Reference, BlogPost } from './types'

export const DEMO_REFERENCES: Reference[] = [
  {
    id: '1',
    title: 'Premium Food-Stand für Feinkost Meyer',
    branche: 'food',
    size: '50 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    description: 'Moderner Messestand mit offener Verkostungsküche und Premium-Präsentation',
    challenge: 'Feinkost Meyer benötigte einen Stand, der hochwertige Produkte ansprechend präsentiert und gleichzeitig Verkostungen ermöglicht.',
    solution: 'Wir entwickelten ein offenes Konzept mit integrierter Showküche, LED-beleuchteten Produktvitrinen und einer einladenden Lounge-Area.',
    result: '40% mehr Messebesucher als im Vorjahr, 25 qualifizierte Neukunden-Leads',
    keyfacts: ['50 qm Standfläche', 'Anuga Köln 2023', '3 Tage Aufbau', 'Nachhaltige Systemelemente'],
    kunde: 'Feinkost Meyer',
    messe: 'Anuga Köln',
    zielsetzung: 'Hochwertige Produktpräsentation mit Live-Verkostungen zur Neukundengewinnung'
  },
  {
    id: '2',
    title: 'Versicherungs-Präsenz Allianz Regional',
    branche: 'versicherungen',
    size: '80 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
    description: 'Repräsentativer Messeauftritt mit Beratungszonen und interaktiven Elementen',
    challenge: 'Seriöser, vertrauensvoller Auftritt mit gleichzeitig moderner, zugänglicher Atmosphäre.',
    solution: 'Klare Raumzonierung: Offene Welcome-Area, abgeschirmte Beratungszonen, digitale Infoscreens.',
    result: 'Über 300 Beratungsgespräche, sehr positive Kundenfeedbacks zur Atmosphäre',
    keyfacts: ['80 qm Standfläche', 'DKM Dortmund 2023', 'Modulares System', '6 Beratungsplätze'],
    kunde: 'Allianz Regional',
    messe: 'DKM Dortmund',
    zielsetzung: 'Vertrauensbildende Präsenz mit effizienten Beratungszonen für Kundengespräche'
  },
  {
    id: '3',
    title: 'Industrie-Showroom TechnoPlast GmbH',
    branche: 'industrie',
    size: '120 qm',
    type: 'ladenbau',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    description: 'Permanenter Showroom für Kunststoff-Fertigungstechnik',
    challenge: 'Große Maschinen ansprechend präsentieren und technische Kompetenz vermitteln.',
    solution: 'Industrieller Look mit hochwertigen Details: Sichtbeton-Optik, LED-Spots, interaktive Produktkonfiguratoren.',
    result: 'Dauerhafter Showroom seit 2022, regelmäßige Kundenführungen, positives Markenimage',
    keyfacts: ['120 qm Showroom', 'Permanent-Installation', 'Integrierte Medienwände', 'Barrierefreier Zugang'],
    kunde: 'TechnoPlast GmbH',
    messe: 'Hannover Messe',
    zielsetzung: 'Permanenter Showroom zur Demonstration technischer Kompetenz und Maschinenvielfalt'
  },
  {
    id: '4',
    title: 'BioGourmet Premium-Stand ISM',
    branche: 'food',
    size: '35 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    description: 'Nachhaltiger Messestand für Bio-Feinkost mit Verkostungsbereich und B2B-Kontaktzone',
    challenge: 'Bio-Food-Startup musste Premium-Produkte überzeugend präsentieren und gezielt B2B-Kontakte generieren.',
    solution: 'Warme Materialien, einladende Verkostungsstationen, LED-Produktpräsentation und gezielte Gesprächszonen für Einkäufer.',
    result: '60 neue B2B-Kontakte, 3 Listungsvereinbarungen mit Feinkost-Händlern',
    keyfacts: ['ISM Köln', '35 qm', 'Verkostungstheken', 'Nachhaltige Materialien'],
    kunde: 'BioGourmet',
    messe: 'ISM Köln',
    zielsetzung: 'Premium-Produktpräsentation und B2B-Kontaktgenerierung für Markteintritt'
  },
  {
    id: '5',
    title: 'Confiserie Reichert – Süße Präsentation',
    branche: 'food',
    size: '28 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    description: 'Temperaturkontrollierter Messestand für handgefertigte Confiserie-Produkte',
    challenge: 'Handwerklicher Chocolatier benötigte temperaturkontrollierte Produktpräsentation auf der ISM.',
    solution: 'Integrierte Kühlung, kunstvolle Displayvitrinen und beleuchtete Markenwand für maximale Produktinszenierung.',
    result: '45% mehr Besucherkontakte im Vergleich zum Vorjahr',
    keyfacts: ['ISM Köln', '28 qm', 'Kühlvitrinen', 'Markeninszenierung'],
    kunde: 'Confiserie Reichert',
    messe: 'ISM Köln',
    zielsetzung: 'Optimale Produktpräsentation unter Temperaturkontrolle für Premiumschokolade'
  },
  {
    id: '6',
    title: 'SecurLife Versicherung – Vertrauensraum',
    branche: 'versicherungen',
    size: '60 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    description: 'Vertrauensbildender Messestand mit semi-privaten Beratungsräumen und digitalen Produktwänden',
    challenge: 'Vertrauensaufbau durch Standdesign für Versicherungskunden in offener Messeatmosphäre.',
    solution: 'Semi-private Beratungsräume, warme Beleuchtung und digitale Produktwände für interaktive Tarifberatung.',
    result: '250+ qualifizierte Leads, Auszeichnung als bester Messestand der DKM',
    keyfacts: ['DKM Dortmund', '60 qm', '8 Beratungsplätze', 'Digital Signage'],
    kunde: 'SecurLife Versicherung',
    messe: 'DKM Dortmund',
    zielsetzung: 'Vertrauensbildende Standgestaltung mit maximaler Beratungskapazität'
  },
  {
    id: '7',
    title: 'FinanzPro AG – Roadshow-System',
    branche: 'versicherungen',
    size: '40 qm',
    type: 'eventbau',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
    description: 'Modulares Roadshow-Standsystem für konsistente Markenpräsenz auf regionalen Finanzmessen',
    challenge: 'Konsistente Markenpräsenz über 6 regionale Veranstaltungen pro Jahr bei effizienter Budgetnutzung.',
    solution: 'Modulares, wiederverwendbares Standsystem mit schnellem Auf- und Abbau, transportoptimiert für den Roadshow-Einsatz.',
    result: '40% Kosteneinsparung gegenüber Einzelbauten, konsistente Markenpräsenz auf allen Events',
    keyfacts: ['6 Messen/Jahr', '40 qm Systemstand', '2h Aufbauzeit', 'Wiederverwendbar'],
    kunde: 'FinanzPro AG',
    messe: 'Mehrere Messen',
    zielsetzung: 'Kosteneffiziente, konsistente Markenpräsenz über mehrere regionale Finanzmessen'
  },
  {
    id: '8',
    title: 'MaschTech GmbH – Hannover Messe',
    branche: 'industrie',
    size: '100 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop',
    description: 'Schwerlast-Messestand mit Doppelstock-Meetingbereich für die Hannover Messe',
    challenge: 'Schwere Maschinen (2 Tonnen) erforderten verstärkte Bodeninfrastruktur und Starkstromversorgung.',
    solution: 'Verstärkter Schwerlastboden, integrierte Drehstromversorgung und Doppelstock-Meetingbereich für separate Kundengespräche.',
    result: '15 qualifizierte Projektanfragen, 3 Direktaufträge auf der Messe',
    keyfacts: ['Hannover Messe', '100 qm', 'Doppelstock', 'Schwerlastboden 2t'],
    kunde: 'MaschTech GmbH',
    messe: 'Hannover Messe',
    zielsetzung: 'Professionelle Maschinenpräsentation mit Schwerlastinfrastruktur und VIP-Meetingbereich'
  },
  {
    id: '9',
    title: 'InnoTech Robotics – Automatica München',
    branche: 'industrie',
    size: '75 qm',
    type: 'messebau',
    imageUrl: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&h=600&fit=crop',
    description: 'Robotik-Messestand mit Live-Demo-Fläche und Sicherheitszonen auf der Automatica',
    challenge: 'Robotik-Unternehmen benötigte Live-Demo-Bereich mit Sicherheitszonen für Industrieroboter.',
    solution: 'Transparente Sicherheitsabsperrungen, erhöhte Demo-Plattform und interaktive Touch-Displays für technische Details.',
    result: 'Virale Social-Media-Aufmerksamkeit, 80 qualifizierte Leads',
    keyfacts: ['Automatica München', '75 qm', 'Live-Demo-Fläche', 'Safety-Absperrungen'],
    kunde: 'InnoTech Robotics',
    messe: 'Automatica München',
    zielsetzung: 'Eindrucksvolle Live-Robotik-Demonstration mit höchsten Sicherheitsstandards'
  }
]

export const DEMO_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Die perfekte Messestand-Checkliste: Nichts vergessen!',
    slug: 'messestand-checkliste',
    excerpt: 'Von der ersten Planung bis zum letzten Abbau-Tag: Diese Checkliste stellt sicher, dass Ihr Messeauftritt reibungslos verläuft.',
    content: `Ein erfolgreicher Messeauftritt erfordert sorgfältige Planung. Unsere Checkliste hilft Ihnen, den Überblick zu behalten.

**6-12 Monate vorher:**
- Messeanmeldung und Standplatz-Buchung
- Budget festlegen
- Messebauer kontaktieren (S&S Messebau!)
- Erste Standkonzepte entwickeln

**3-6 Monate vorher:**
- Standdesign finalisieren
- Material- und Ausstattungsplanung
- Marketing-Materialien konzipieren
- Personal-Planung für Messetage

**4-8 Wochen vorher:**
- Produktionsstart
- Technische Anmeldungen (Strom, Wasser, Internet)
- Catering organisieren
- Messepersonal briefen

**1 Woche vorher:**
- Letzte Material-Checks
- Transportlogistik bestätigen
- Ansprechpartner-Listen erstellen

**Während der Messe:**
- Tägliche Stand-Checks
- Lead-Erfassung
- Team-Debriefings

**Nach der Messe:**
- Professioneller Abbau
- Material-Lagerung oder Rücktransport
- Lead-Follow-Up
- Erfolgs-Auswertung`,
    category: 'Planung',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
  },
  {
    id: '2',
    title: 'Messestand-Budget richtig kalkulieren: Kosten-Guide 2024',
    slug: 'messestand-budget-guide',
    excerpt: 'Was kostet ein professioneller Messestand wirklich? Transparente Einblicke in Kostenstrukturen und Sparpotenziale.',
    content: `Messebau-Kosten transparent erklärt - damit Sie besser planen können.

**Hauptkostenfaktoren:**

**1. Standmiete (extern):**
- Variiert stark je nach Messe und Standplatz
- Ecklage premium, Innenflächen günstiger
- Beispiel: 150-400 €/qm für Top-Messen

**2. Standbau & Design:**
- Systemstand: ab 300 €/qm
- Individueller Stand: 600-1.200 €/qm
- Premium-Lösungen: 1.500+ €/qm
- S&S-Vorteil: Wiederverwendbare Systeme senken Kosten

**3. Technik & Ausstattung:**
- Beleuchtung: 500-2.000 €
- AV-Technik: 1.000-5.000 €
- Möbel: 800-3.000 €
- Internet/Strom: 200-800 €

**4. Logistik:**
- Transport: 500-2.500 €
- Auf-/Abbau: 2.000-8.000 € (je nach Größe)
- Lagerung: 150-500 €/Monat

**5. Personal & Sonstiges:**
- Standpersonal: 150-300 €/Tag/Person
- Catering: 20-50 €/Person/Tag
- Marketing-Material: 500-3.000 €

**Beispielrechnung 50 qm-Stand:**
- Standmiete: 12.000 €
- Standbau (System): 15.000 €
- Technik: 3.000 €
- Logistik: 4.000 €
- **Gesamt: ca. 34.000 €**

**Spartipps:**
- Mehrfachnutzung von Systemelementen
- Frühbucher-Rabatte nutzen
- Partnernetzwerk für Logistik
- Effiziente Planung reduziert Aufbauzeit

S&S Messebau bietet faire Komplettpreise - sprechen Sie uns an!`,
    category: 'Budget',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    publishedAt: Date.now() - 14 * 24 * 60 * 60 * 1000
  },
  {
    id: '3',
    title: 'Nachhaltiger Messebau: Gut für Umwelt und Budget',
    slug: 'nachhaltiger-messebau',
    excerpt: 'Wiederverwendbare Systeme, lokale Partner, effiziente Logistik: So geht moderner, nachhaltiger Messebau.',
    content: `Nachhaltigkeit im Messebau ist nicht nur gut für die Umwelt - es schont auch Ihr Budget.

**Unsere nachhaltigen Ansätze:**

**1. Systemelemente statt Einweg:**
Unsere modularen Standsysteme werden mehrfach verwendet. Statt nach jeder Messe alles zu entsorgen, lagern wir Ihre Elemente und nutzen sie bei der nächsten Messe wieder. Das spart:
- Material-Neuproduktion
- Entsorgungskosten
- Produktionszeit
- CO2-Emissionen

**2. Lokales Partnernetzwerk:**
Durch unser starkes Netzwerk in NRW und bundesweit arbeiten wir mit regionalen Partnern:
- Kürzere Transportwege
- Schnellere Reaktionszeiten
- Unterstützung lokaler Wirtschaft
- Reduzierte Logistikkosten

**3. Intelligente Materialwahl:**
- FSC-zertifiziertes Holz
- LED-Beleuchtung (90% weniger Stromverbrauch)
- Recycelbare Materialien
- Langlebige Qualität statt Wegwerf-Lösungen

**4. Effiziente Logistik:**
- Optimierte Transportplanung
- Gebündelte Lieferungen
- Professionelle Lagerung
- Wiederverwendungs-Check nach jeder Messe

**Der Business-Vorteil:**
Nachhaltige Systeme kosten in der ersten Anschaffung eventuell etwas mehr, amortisieren sich aber bereits ab der 2.-3. Messe deutlich. Beispiel: Ein 50 qm-System kostet initial 18.000 €, bei Wiederverwendung nur noch 6.000-8.000 € pro weiterer Messe (nur Logistik/Anpassungen).

**Ihr Image profitiert:**
Immer mehr Messebesucher achten auf Nachhaltigkeit. Ein umweltbewusster Auftritt stärkt Ihre Marke.

S&S Messebau - nachhaltig und wirtschaftlich zugleich.`,
    category: 'Nachhaltigkeit',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
    publishedAt: Date.now() - 21 * 24 * 60 * 60 * 1000
  }
]
