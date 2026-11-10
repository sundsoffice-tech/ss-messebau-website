// Rotprobe für die Zählung der Kontaktwege (T1) und den Sitzungsstart (T2).
//
// Je Mutation wird genau ein Aufruf entfernt; der zugehörige Test muss rot werden.
// Anker-Zwang: Jeder Anker muss genau einmal in der Datei stehen, sonst bricht
// der Lauf ab (eine Mutation, die nichts ändert, beweist nichts).
// Nach jeder Mutation wird die Datei zurückgeschrieben und gegen das Original
// verglichen. Vorher läuft jede Testdatei einmal unverändert und muss grün sein.
//
// Aufruf im Projektordner (auf einem Server, nicht auf dem PC):
//   node ops/messung/rotprobe.mjs
// Ende 0: alle Mutationen rot. Ende 1: mindestens ein Zeuge blieb grün.
// Ende 2: Anker fehlt oder Ausgangslage nicht grün.
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const TRACKER = 'src/lib/analytics-tracker.ts'
const T_TRACKER = 'src/lib/__tests__/analytics-tracker.test.ts'
const T_LEISTEN = 'src/components/__tests__/kontaktwege-leisten.test.tsx'
const T_SEITEN = 'src/components/pages/__tests__/kontaktwege-seiten.test.tsx'
const T_HOOK = 'src/hooks/__tests__/use-analytics.test.ts'

/** [Name, Datei, [[Anker, Ersatz], ...], Testdatei] */
const MUTATIONEN = [
  // Rechtliche Grenze
  ['Grenze: Ereignis ohne Zustimmung einreihen', TRACKER,
    [["  if (!canTrack(eventName)) return false\n", ""]], T_TRACKER],
  ['Grenze: Seitenaufruf ohne Zustimmung weiterlaufen lassen', TRACKER,
    [["    pageViewPending = true\n    return\n", "    pageViewPending = true\n"]], T_TRACKER],
  ['Grenze P2: alter Stand, Zähler und Marke vor der Zustimmungsprüfung schreiben', TRACKER,
    [["    pageViewPending = true\n    return\n", "    pageViewPending = true\n"],
     ["    if (!canTrack('session_start')) return\n", ""],
     ["    if (!trackFirstPartyEvent('session_start', getDeviceProps())) return\n", "    trackFirstPartyEvent('session_start', getDeviceProps())\n"]], T_TRACKER],
  // T2
  ['T2: Marke auch ohne eingereihtes Ereignis setzen', TRACKER,
    [["    if (!canTrack('session_start')) return\n", ""],
     ["    if (!trackFirstPartyEvent('session_start', getDeviceProps())) return\n", "    trackFirstPartyEvent('session_start', getDeviceProps())\n"]], T_TRACKER],
  ['T2: nach der Zustimmung nicht nachsenden', TRACKER,
    [["  if (value === 'granted' && pageViewPending) trackPageView()\n", ""]], T_TRACKER],
  ['T2: Lauscher der Zustimmung nicht rufen', 'src/lib/analytics.ts',
    [["      listener(value);\n", ""]], T_TRACKER],
  // T1 Ereignisse im Tracker
  ['T1 Tracker: Anruf', TRACKER, [["  trackFirstPartyEvent('phone_click', { source })\n", ""]], T_TRACKER],
  ['T1 Tracker: WhatsApp', TRACKER, [["  trackFirstPartyEvent('whatsapp_click', { source })\n", ""]], T_TRACKER],
  ['T1 Tracker: Mail', TRACKER, [["  trackCTAClick(CTA_MAIL_CLICK, source)\n", ""]], T_TRACKER],
  ['T1 Tracker: Dialog geöffnet', TRACKER, [["  trackCTAClick(CTA_INQUIRY_OPEN, source)\n", ""]], T_TRACKER],
  ['T1 Tracker: Formular abgesendet', TRACKER,
    [["  trackFirstPartyEvent('form_submit', { form_type: formType, ...extraProps })\n", ""]], T_TRACKER],
  ['T1 Tracker: Blogartikel gelesen', TRACKER,
    [["  trackFirstPartyEvent('blog_article_read', {\n", "  void ({\n"]], T_TRACKER],
  ['T1 Store: Öffnung des Dialogs zählen', 'src/store/ui-store.ts',
    [["    trackInquiryOpen(typeof source === 'string' && source ? source : INQUIRY_SOURCE_UNKNOWN)\n", ""]], T_TRACKER],
  // T1 Aufrufer: Leiste, Band, Kopf, Fuß
  ['T1 StickyCTA: WhatsApp', 'src/components/StickyCTA.tsx',
    [["          onClick={() => trackWhatsAppLinkClick(source)}\n", ""]], T_LEISTEN],
  ['T1 StickyCTA: Ort des Anfrage-Knopfes', 'src/components/StickyCTA.tsx',
    [["onClick={() => onInquiry(source)}", "onClick={() => onInquiry()}"]], T_LEISTEN],
  ['T1 GuaranteeBanner: Ort', 'src/components/ui/GuaranteeBanner.tsx',
    [["openInquiry('48h_banner')", "openInquiry()"]], T_LEISTEN],
  ['T1 Footer: Anruf', 'src/components/Footer.tsx',
    [["                  onClick={() => trackPhoneClick('footer')}\n", ""]], T_LEISTEN],
  ['T1 Footer: Mail', 'src/components/Footer.tsx',
    [["                  onClick={() => trackMailClick('footer')}\n", ""]], T_LEISTEN],
  ['T1 Header: Ort Desktop', 'src/components/Header.tsx',
    [["openInquiry('header_desktop')", "openInquiry()"]], T_LEISTEN],
  ['T1 Header: Ort Tablet', 'src/components/Header.tsx',
    [["openInquiry('header_tablet')", "openInquiry()"]], T_LEISTEN],
  ['T1 Header: Ort Mobil', 'src/components/Header.tsx',
    [["openInquiry('header_mobil')", "openInquiry()"]], T_LEISTEN],
  ['T1 Header: Anruf im mobilen Menü', 'src/components/Header.tsx',
    [["                        onClick={() => trackPhoneClick('header_mobilmenue')}\n", ""]], T_LEISTEN],
  ['T1 Header: Mail im mobilen Menü', 'src/components/Header.tsx',
    [["                        onClick={() => trackMailClick('header_mobilmenue')}\n", ""]], T_LEISTEN],
  // T1 Aufrufer: Seiten
  ['T1 HomePage: Ort hero', 'src/components/pages/HomePage.tsx',
    [["openInquiry('hero')", "openInquiry()"]], T_SEITEN],
  ['T1 HomePage: Ort cta_section', 'src/components/pages/HomePage.tsx',
    [["openInquiry('cta_section')", "openInquiry()"]], T_SEITEN],
  ['T1 Leistungen Messebau: Hero', 'src/components/pages/LeistungenMessebauPage.tsx',
    [["openInquiry('leistungen_messebau_hero')", "openInquiry()"]], T_SEITEN],
  ['T1 Leistungen Messebau: Hero Beratung', 'src/components/pages/LeistungenMessebauPage.tsx',
    [["openInquiry('leistungen_messebau_hero_beratung')", "openInquiry()"]], T_SEITEN],
  ['T1 Leistungen Messebau: Abschluss', 'src/components/pages/LeistungenMessebauPage.tsx',
    [["openInquiry('leistungen_messebau_cta')", "openInquiry()"]], T_SEITEN],
  ['T1 Leistungen Messebau: Rückruf', 'src/components/pages/LeistungenMessebauPage.tsx',
    [["openInquiry('leistungen_messebau_cta_rueckruf')", "openInquiry()"]], T_SEITEN],
  ['T1 KontaktPage: Anruf', 'src/components/pages/KontaktPage.tsx',
    [[" onClick={() => trackPhoneClick('kontakt_seite')}", ""]], T_SEITEN],
  ['T1 KontaktPage: Mail', 'src/components/pages/KontaktPage.tsx',
    [[" onClick={() => trackMailClick('kontakt_seite')}", ""]], T_SEITEN],
  // Blog
  ['Blog: Hook meldet den gelesenen Artikel', 'src/hooks/use-analytics.ts',
    [["        trackBlogArticleRead(articleSlug, elapsed);\n", ""]], T_HOOK],
]

function vitest(datei) {
  const lauf = spawnSync('npx', ['vitest', 'run', datei], { encoding: 'utf8' })
  return { rc: lauf.status, aus: (lauf.stdout || '') + (lauf.stderr || '') }
}

function kurz(aus) {
  const zeile = aus.split('\n').filter((z) => /Tests\s/.test(z)).pop() || ''
  // Farbcodes entfernen
  return zeile.replace(/\u001b\[[0-9;]*m/g, '').trim()
}

// 1. Ausgangslage: jede Testdatei unverändert grün
const testdateien = [...new Set(MUTATIONEN.map((m) => m[3]))]
for (const datei of testdateien) {
  const { rc, aus } = vitest(datei)
  console.log(`AUSGANG ${rc === 0 ? 'gruen' : 'ROT'} ${datei} | ${kurz(aus)}`)
  if (rc !== 0) {
    console.log(aus.split('\n').slice(-40).join('\n'))
    console.log('ABBRUCH: Ausgangslage nicht gruen')
    process.exit(2)
  }
}

// 2. Anker-Zwang vor dem ersten Lauf
for (const [name, datei, paare] of MUTATIONEN) {
  const text = readFileSync(datei, 'utf8')
  for (const [anker] of paare) {
    const zahl = text.split(anker).length - 1
    if (zahl !== 1) {
      console.log(`ABBRUCH: Anker ${zahl}-mal statt 1-mal in ${datei} (${name}): ${JSON.stringify(anker.slice(0, 70))}`)
      process.exit(2)
    }
  }
}

// 3. Mutationen
let gruenGeblieben = 0
let nr = 0
for (const [name, datei, paare, test] of MUTATIONEN) {
  nr += 1
  const original = readFileSync(datei, 'utf8')
  let mutiert = original
  for (const [anker, ersatz] of paare) mutiert = mutiert.replace(anker, ersatz)
  writeFileSync(datei, mutiert)
  let ergebnis
  try {
    ergebnis = vitest(test)
  } finally {
    writeFileSync(datei, original)
  }
  if (readFileSync(datei, 'utf8') !== original) {
    console.log(`ABBRUCH: ${datei} nicht wiederhergestellt`)
    process.exit(2)
  }
  const rot = ergebnis.rc !== 0
  if (!rot) gruenGeblieben += 1
  console.log(`${String(nr).padStart(2, '0')} ${rot ? 'ROT ' : 'GRUEN (Zeuge fehlt)'} ${name} | ${datei} | ${kurz(ergebnis.aus)}`)
}

console.log(`ROTPROBE: ${MUTATIONEN.length - gruenGeblieben} von ${MUTATIONEN.length} Mutationen rot, ${gruenGeblieben} gruen geblieben`)
process.exit(gruenGeblieben === 0 ? 0 : 1)
