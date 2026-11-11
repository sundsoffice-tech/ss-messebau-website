// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Zeuge für die feste Anweisung des KI-Beraters (public/api/chat.php): Der Berater gibt keine
// Rechtsauskunft, auch nicht zur Zulässigkeit von Werbe- oder Umweltaussagen, und verweist an
// Anwalt oder Rechtsabteilung. Der Fall läuft mit npm test vor jedem Deploy und hält einen Stand
// auf, in dem die Regel fehlt oder nach das Zusatzwissen aus der Datenbank gerutscht ist.
// Er belegt die Vorgabe an das Modell, nicht dessen Antwort.

// Pfad ab der Repo-Wurzel: vitest läuft dort (npm test).
const quelltext = readFileSync('public/api/chat.php', 'utf8')

const SAETZE = [
  'Du gibst keine Rechtsauskunft. ',
  'beantwortest du nicht in der Sache',
  'verweise an eine Anwältin, einen Anwalt oder die eigene Rechtsabteilung. ',
  'die rechtliche Bewertung im Einzelfall nicht. ',
]

function regelFehler(text: string): string[] {
  const fehler: string[] = []
  const beginn = text.indexOf("$systemPrompt = '")
  // Die feste Anweisung endet mit dem ersten Semikolon am Zeilenende nach ihrem Beginn.
  const ende = beginn < 0 ? -1 : text.indexOf("';\n", beginn)
  if (beginn < 0 || ende < 0) {
    return ['die feste Anweisung ($systemPrompt) ist in chat.php nicht zu finden']
  }
  const anweisung = text.slice(beginn, ende)
  for (const satz of SAETZE) {
    if (!anweisung.includes(satz)) fehler.push(`in der festen Anweisung fehlt: „${satz.trim()}“`)
  }
  // Die Regel muss vor dem angehängten Zusatzwissen stehen, also in der festen Anweisung selbst.
  const zusatz = text.indexOf('$systemPrompt .= $trainingContext')
  if (zusatz >= 0 && zusatz < ende) fehler.push('das Zusatzwissen wird vor dem Ende der festen Anweisung angehängt')
  // Eine Vorgabe des Browsers darf die Anweisung nicht ersetzen.
  if (/\$systemPrompt\s*=\s*\$(input|_POST|_GET|data|body)\b/.test(text)) {
    fehler.push('die Anweisung wird aus einer Eingabe des Browsers gesetzt')
  }
  return fehler
}

describe('KI-Berater: keine Rechtsauskunft', () => {
  it('die feste Anweisung in chat.php trägt die Regel', () => {
    expect(regelFehler(quelltext)).toEqual([])
  })

  it('Gegenprobe: fehlende Regel, fehlender Verweis und Anweisung aus dem Browser werden genannt', () => {
    const ohneRegel = quelltext.replace('Du gibst keine Rechtsauskunft. ', '')
    expect(regelFehler(ohneRegel)).toEqual(['in der festen Anweisung fehlt: „Du gibst keine Rechtsauskunft.“'])

    const ohneVerweis = quelltext.replace('verweise an eine Anwältin, einen Anwalt oder die eigene Rechtsabteilung. ', 'hilf trotzdem. ')
    expect(regelFehler(ohneVerweis).length).toBe(1)

    const ausBrowser = quelltext + "\n$systemPrompt = $input['systemPrompt'];\n"
    expect(regelFehler(ausBrowser)).toContain('die Anweisung wird aus einer Eingabe des Browsers gesetzt')

    expect(regelFehler('<?php echo 1;')).toEqual(['die feste Anweisung ($systemPrompt) ist in chat.php nicht zu finden'])
  })
})
