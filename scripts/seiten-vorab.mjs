#!/usr/bin/env node
// Erzeugt nach dem Vite-Build je Seite eine eigene HTML-Datei unter dist/_s/<pfad>.html.
//
// Grund (gemessen 10.11.2026): Die Seite ist eine Ein-Seiten-Anwendung. Der Server lieferte
// für jede Adresse dieselbe index.html, also Titel, Beschreibung, Canonical und Rückfalltext
// der Startseite, und für nicht vorhandene Adressen den Status 200. Wer kein JavaScript
// ausführt (Vorschau in WhatsApp, LinkedIn, Mail, viele Suchroboter), sah auf jeder Unterseite
// die Startseite. Mit den Dateien aus diesem Skript bekommt jede Adresse ihren eigenen Kopf
// und Rückfalltext; die Anwendung startet danach unverändert.
//
// Quellen:
//   src/lib/seiten-meta.json    Titel und Beschreibung je Pfad (dieselbe Datei nutzt use-page-meta.ts)
//   scripts/seiten-inhalt.json  Überschriften und Absätze je Pfad für den Rückfalltext
//   src/lib/rechtsseiten.json   Aufbau von /impressum und /datenschutz (dieselbe Datei nutzt OtherPages.tsx);
//   src/locales/de.json         ihr Wortlaut: Diese zwei Seiten stehen mit vollem Text im Rückfalltext
//   public/sitemap.xml          jede Adresse der Sitemap muss eine Datei bekommen, sonst Abbruch
//
// Aufruf: node scripts/seiten-vorab.mjs [dist-Ordner]   (Teil von "npm run build")

import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ADRESSE = 'https://sunds-messebau.de'
const ZIELORDNER = '_s'

export function maskiere(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ersetzeGenauEinmal(html, muster, ersatz, name) {
  const treffer = html.match(new RegExp(muster.source, muster.flags.replace('g', '') + 'g'))
  if (!treffer || treffer.length !== 1) {
    throw new Error(`index.html: "${name}" ${treffer ? treffer.length : 0}-mal gefunden, erwartet genau 1`)
  }
  return html.replace(muster, () => ersatz)
}

// Voller Text einer Rechtsseite (Impressum, Datenschutzerklärung) aus denselben Quellen wie die
// Anwendung: Aufbau aus src/lib/rechtsseiten.json, Wortlaut aus src/locales/de.json. Ohne JavaScript
// kamen von diesen zwei Seiten nur rund 140 Wörter an (gemessen 10.11.2026); eine zweite Handkopie
// des Textes in seiten-inhalt.json wäre bei der nächsten Änderung auseinandergelaufen.
export function rechtsInhalt(pfad, struktur, texte) {
  const seite = struktur[pfad]
  if (!seite) throw new Error(`rechtsseiten.json: kein Eintrag für ${pfad}`)
  const t = (schluessel) => {
    if (typeof texte[schluessel] !== 'string' || texte[schluessel] === '') {
      throw new Error(`de.json: Schlüssel "${schluessel}" fehlt (rechtsseiten.json, ${pfad})`)
    }
    return texte[schluessel]
  }
  const bloecke = []
  for (const abschnitt of seite.abschnitte) {
    bloecke.push(['h2', t(abschnitt.titel)])
    for (const [art, schluessel] of abschnitt.inhalt) {
      bloecke.push([art, t(schluessel)])
    }
  }
  return { h1: t(seite.titel), bloecke }
}

// Rückfalltext je Pfad: seiten-inhalt.json für die gewöhnlichen Seiten, dazu die Rechtsseiten mit
// vollem Text. Ein Pfad in beiden Quellen ist ein Fehler, sonst gäbe es wieder zwei Fassungen.
export function ladeInhalte(wurzel = WURZEL) {
  const inhalte = JSON.parse(readFileSync(join(wurzel, 'scripts/seiten-inhalt.json'), 'utf8'))
  const struktur = JSON.parse(readFileSync(join(wurzel, 'src/lib/rechtsseiten.json'), 'utf8'))
  const texte = JSON.parse(readFileSync(join(wurzel, 'src/locales/de.json'), 'utf8'))
  for (const pfad of Object.keys(struktur)) {
    if (inhalte[pfad]) {
      throw new Error(`${pfad} steht in seiten-inhalt.json und in rechtsseiten.json, erlaubt ist nur rechtsseiten.json`)
    }
    inhalte[pfad] = rechtsInhalt(pfad, struktur, texte)
  }
  return inhalte
}

function vollerText(bloecke) {
  const teile = []
  for (const [art, text] of bloecke) {
    if (art === 'h2' || art === 'h3') {
      teile.push(`<${art}>${maskiere(text)}</${art}>`)
    } else if (art === 'p') {
      teile.push(`<p>${maskiere(text)}</p>`)
    } else if (art === 'zeilen') {
      teile.push(`<p>${text.split('\n').map(maskiere).join('<br>')}</p>`)
    } else if (art === 'ul') {
      teile.push('<ul>')
      for (const punkt of text.split('\n')) {
        teile.push(`  <li>${maskiere(punkt)}</li>`)
      }
      teile.push('</ul>')
    } else {
      throw new Error(`rechtsseiten.json: unbekannte Blockart "${art}"`)
    }
  }
  return teile
}

export function rueckfalltext(inhalt, beschreibung) {
  const teile = []
  teile.push(`<h1>${maskiere(inhalt.h1)}</h1>`)
  if (inhalt.bloecke) {
    teile.push(...vollerText(inhalt.bloecke))
  } else {
    teile.push(`<p>${maskiere(beschreibung)}</p>`)
    for (const absatz of inhalt.absaetze || []) {
      teile.push(`<p>${maskiere(absatz)}</p>`)
    }
    if ((inhalt.abschnitte || []).length > 0) {
      teile.push('<ul>')
      for (const abschnitt of inhalt.abschnitte) {
        teile.push(`  <li>${maskiere(abschnitt)}</li>`)
      }
      teile.push('</ul>')
    }
  }
  teile.push(
    '<p><a href="/kontakt">Messestand anfragen</a> · <a href="/leistungen">Alle Leistungen</a> · ' +
      '<a href="/referenzen">Referenzen</a> · <a href="/">Startseite</a></p>'
  )
  return teile.map((zeile) => '        ' + zeile).join('\n')
}

export function baueSeite(vorlage, pfad, meta, inhalt, { ohneIndex = false } = {}) {
  const url = pfad === '/' ? `${ADRESSE}/` : `${ADRESSE}${pfad}`
  const titel = maskiere(meta.title)
  const beschreibung = maskiere(meta.description)
  let html = vorlage

  html = ersetzeGenauEinmal(html, /<title>[\s\S]*?<\/title>/, `<title>${titel}</title>`, 'title')
  html = ersetzeGenauEinmal(
    html,
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${beschreibung}" />`,
    'description'
  )
  for (const [eigenschaft, wert] of [
    ['og:title', titel],
    ['og:description', beschreibung],
    ['og:url', url],
  ]) {
    html = ersetzeGenauEinmal(
      html,
      new RegExp(`<meta property="${eigenschaft}" content="[^"]*"\\s*/>`),
      `<meta property="${eigenschaft}" content="${wert}" />`,
      eigenschaft
    )
  }
  for (const [name, wert] of [
    ['twitter:title', titel],
    ['twitter:description', beschreibung],
  ]) {
    html = ersetzeGenauEinmal(
      html,
      new RegExp(`<meta name="${name}" content="[^"]*"\\s*/>`),
      `<meta name="${name}" content="${wert}" />`,
      name
    )
  }
  html = ersetzeGenauEinmal(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
    'canonical'
  )
  const englisch = pfad === '/' ? `${ADRESSE}/?lang=en` : `${url}?lang=en`
  for (const [sprache, ziel] of [
    ['de', url],
    ['en', englisch],
    ['x-default', url],
  ]) {
    html = ersetzeGenauEinmal(
      html,
      new RegExp(`<link rel="alternate" hreflang="${sprache}" href="[^"]*"\\s*/>`),
      `<link rel="alternate" hreflang="${sprache}" href="${ziel}" />`,
      `hreflang ${sprache}`
    )
  }
  if (ohneIndex) {
    html = ersetzeGenauEinmal(
      html,
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<meta name="robots" content="noindex" />`,
      'canonical (noindex)'
    )
    html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/>/g, '')
  }
  // Der <noscript>-Block der Vorlage wiederholt den Text der Startseite samt eigener
  // Hauptüberschrift. Auf Unterseiten bleibt davon nur der Hinweis und die Navigation,
  // der Seitentext steht schon im Rückfalltext oben.
  const noscript = /(<noscript>\s*<div\b[^>]*>\s*<p>[\s\S]*?<\/p>)\s*<h1>[\s\S]*?(<nav\b)/
  if (!noscript.test(html)) throw new Error('index.html: noscript-Block mit <p>, <h1> und <nav> nicht gefunden')
  html = html.replace(noscript, (_, hinweis, nav) => `${hinweis}\n\n        ${nav}`)
  const mainAuf = vorlage.match(/<main\b[^>]*>/)
  if (!mainAuf) throw new Error('index.html: <main> fehlt')
  html = ersetzeGenauEinmal(
    html,
    /<main\b[^>]*>[\s\S]*?<\/main>/,
    `${mainAuf[0]}\n${rueckfalltext(inhalt, meta.description)}\n      </main>`,
    'main'
  )
  return html
}

export function pfadeDerSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((t) => {
    const pfad = t[1].replace(ADRESSE, '')
    return pfad === '' ? '/' : pfad
  })
}

export function erzeuge(dist) {
  const vorlage = readFileSync(join(dist, 'index.html'), 'utf8')
  const meta = JSON.parse(readFileSync(join(WURZEL, 'src/lib/seiten-meta.json'), 'utf8'))
  const inhalte = ladeInhalte()
  const sitemap = pfadeDerSitemap(readFileSync(join(WURZEL, 'public/sitemap.xml'), 'utf8'))

  const fehlend = sitemap.filter((pfad) => pfad !== '/' && (!meta[pfad] || !inhalte[pfad]))
  if (fehlend.length > 0) {
    throw new Error(
      `Adressen der Sitemap ohne Eintrag in seiten-meta.json oder seiten-inhalt.json: ${fehlend.join(', ')}`
    )
  }

  const geschrieben = []
  for (const pfad of Object.keys(inhalte)) {
    if (pfad === '/') continue // die Startseite ist dist/index.html selbst
    if (!meta[pfad]) throw new Error(`seiten-inhalt.json nennt ${pfad}, seiten-meta.json nicht`)
    const ziel = join(dist, ZIELORDNER, `${pfad.slice(1)}.html`)
    mkdirSync(dirname(ziel), { recursive: true })
    writeFileSync(ziel, baueSeite(vorlage, pfad, meta[pfad], inhalte[pfad]))
    geschrieben.push(pfad)
  }

  // Antwort für Adressen, die es nicht gibt. In Stufe 1 hängt sie noch an keiner Serverregel;
  // Stufe 2 stellt ErrorDocument 404 in .htaccess darauf, die Anwendung zeigt darin ihre 404-Ansicht.
  const nichtGefunden = baueSeite(
    vorlage,
    '/nicht-gefunden',
    {
      title: 'Seite nicht gefunden | S&S Messebau',
      description: 'Diese Seite gibt es nicht. Zur Startseite, zu den Leistungen oder direkt zur Anfrage.',
    },
    { h1: 'Seite nicht gefunden', absaetze: [], abschnitte: [] },
    { ohneIndex: true }
  )
  mkdirSync(join(dist, ZIELORDNER), { recursive: true })
  writeFileSync(join(dist, ZIELORDNER, 'nicht-gefunden.html'), nichtGefunden)

  return geschrieben
}

// realpath, weil der Vergleich über eine Junction sonst still ungleich ist und nichts erzeugt wird
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const dist = resolve(process.argv[2] || join(WURZEL, 'dist'))
  if (!existsSync(join(dist, 'index.html'))) {
    console.error(`seiten-vorab: ${join(dist, 'index.html')} fehlt, erst "vite build"`)
    process.exit(1)
  }
  const geschrieben = erzeuge(dist)
  console.log(`seiten-vorab: ${geschrieben.length} Seiten und nicht-gefunden.html nach ${join(dist, ZIELORDNER)}`)
}
