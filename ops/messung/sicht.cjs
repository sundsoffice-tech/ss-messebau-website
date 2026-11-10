// Sichtprobe und Messprobe am gebauten Artefakt (dist), lokal auf dem Server, nie gegen die Live-Seite.
//
// Je Seite, Breite (390, 1280) und Farbschema (hell, dunkel):
//   - Bild des oberen Sichtfensters,
//   - Layoutsprung (CLS) seit dem Laden,
//   - Speichereinträge und Anfragen an /api/collect.php VOR einer Entscheidung im Banner.
// Auf der Startseite bei 390 hell zusätzlich: „Akzeptieren" klicken, Anruf-Link im Footer und
// Anfrage-Knopf der Leiste auslösen und mitschreiben, welche Ereignisse an /api/collect.php gehen.
//
// Schutz: Jede Anfrage außer GET wird im Browser beantwortet oder abgebrochen und nur mitgeschrieben;
// Anfragen an die echte Domain werden abgebrochen. Es erreicht kein Ereignis einen Server.
//
// Aufruf im Container: node sicht.cjs <basisadresse> <zielordner>
'use strict'
const fs = require('fs')
const puppeteer = require('puppeteer-core')
const chromium = require('@sparticuz/chromium').default || require('@sparticuz/chromium')

const [basis, aus] = process.argv.slice(2)
if (!basis || !aus) {
  console.error('Aufruf: node sicht.cjs <basisadresse> <zielordner>')
  process.exit(2)
}
const SEITEN = [['start', '/'], ['leistungen-messebau', '/leistungen/messebau'], ['referenzen', '/referenzen'], ['kontakt', '/kontakt']]
const BREITEN = [[390, 844], [1280, 800]]
const SCHEMATA = ['light', 'dark']
const schlaf = (ms) => new Promise((f) => setTimeout(f, ms))

function ereignisse(posts) {
  const liste = []
  for (const p of posts) {
    if (!p.pfad.endsWith('/collect.php')) continue
    try {
      for (const e of JSON.parse(p.rumpf).events) {
        const props = e.event === 'session_start' ? '{…}' : JSON.stringify(e.props || {})
        liste.push(`${e.event} ${e.url} ${props}`.slice(0, 140))
      }
    } catch (err) {
      liste.push('unlesbar')
    }
  }
  return liste
}

;(async () => {
  const programm = await chromium.executablePath()
  const ergebnis = []
  for (const [name, pfad] of SEITEN) {
    for (const [breite, hoehe] of BREITEN) {
      for (const schema of SCHEMATA) {
        // Je Ansicht ein frischer Browser: leerer Speicher, also immer „noch keine Entscheidung im Banner".
        // Das Chromium aus dem Paket läuft nur als „shell" und kennt keine getrennten Kontexte.
        const browser = await puppeteer.launch({
          args: [...chromium.args, '--lang=de-DE'],
          executablePath: programm,
          headless: 'shell',
        })
        const seite = await browser.newPage()
        const posts = []
        const fehler = []
        const eintrag = { name, pfad, breite, schema }
        try {
          await seite.setViewport({ width: breite, height: hoehe, deviceScaleFactor: 1, isMobile: breite < 500, hasTouch: breite < 500 })
          await seite.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: schema },
            { name: 'prefers-reduced-motion', value: 'reduce' },
          ])
          await seite.setRequestInterception(true)
          seite.on('request', (anfrage) => {
            const u = new URL(anfrage.url())
            if (anfrage.method() !== 'GET') {
              posts.push({ pfad: u.pathname, rumpf: anfrage.postData() || '' })
              if (u.pathname.endsWith('/collect.php')) {
                return anfrage.respond({ status: 200, contentType: 'application/json', body: '{"ok":true,"stored":0}' })
              }
              return anfrage.abort()
            }
            if (/sunds-?messebau/.test(u.hostname)) return anfrage.abort()
            return anfrage.continue()
          })
          seite.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 160)) })
          seite.on('pageerror', (e) => fehler.push('pageerror ' + String(e).slice(0, 160)))
          await seite.evaluateOnNewDocument(() => {
            window.__cls = 0
            window.__spruenge = []
            new PerformanceObserver((l) => {
              for (const e of l.getEntries()) {
                if (e.hadRecentInput) continue
                window.__cls += e.value
                window.__spruenge.push([Math.round(e.startTime), Number(e.value.toFixed(4))])
              }
            }).observe({ type: 'layout-shift', buffered: true })
          })
          const antwort = await seite.goto(basis + pfad, { waitUntil: 'networkidle2', timeout: 45000 })
          await schlaf(3500)
          const vor = await seite.evaluate(() => ({
            cls: Number(window.__cls.toFixed(4)),
            spruenge: window.__spruenge.slice(0, 6),
            ls: Object.keys(localStorage).sort(),
            ss: Object.keys(sessionStorage).sort(),
            hoehe: document.documentElement.scrollHeight,
          }))
          Object.assign(eintrag, {
            status: antwort ? antwort.status() : 0,
            cls: vor.cls,
            spruenge: vor.spruenge,
            hoehe: vor.hoehe,
            speicher_vor_entscheidung: { localStorage: vor.ls, sessionStorage: vor.ss },
            collect_vor_entscheidung: ereignisse(posts),
            andere_posts_vor_entscheidung: posts.filter((p) => !p.pfad.endsWith('/collect.php')).map((p) => p.pfad),
          })
          await seite.screenshot({ path: `${aus}/${name}-${breite}-${schema}.png` })

          if (name === 'start' && breite === 390 && schema === 'light') {
            const vorher = posts.length
            const knopf = await seite.evaluate(() => {
              const k = [...document.querySelectorAll('div[role=dialog].fixed button')].pop()
              if (!k) return null
              k.click()
              return (k.textContent || '').trim()
            })
            await schlaf(2600)
            const nachZustimmung = ereignisse(posts.slice(vorher))
            const mitte = posts.length
            const klicks = await seite.evaluate(() => {
              const getan = []
              const tel = document.querySelector('footer a[href^="tel:"]')
              if (tel) {
                tel.addEventListener('click', (e) => e.preventDefault())
                tel.click()
                getan.push('footer tel')
              }
              const anfrage = document.querySelector('div[role=group].lg\\:hidden button[aria-haspopup=dialog]')
              if (anfrage) {
                anfrage.click()
                getan.push('leiste mobil anfrage')
              }
              return getan
            })
            await schlaf(2600)
            eintrag.nach_zustimmung = {
              knopf,
              collect: nachZustimmung,
              klicks,
              collect_nach_klicks: ereignisse(posts.slice(mitte)),
              dialog_offen: await seite.evaluate(() => document.querySelectorAll('[role=dialog]').length),
            }
            await seite.screenshot({ path: `${aus}/${name}-${breite}-${schema}-dialog.png` })
          }
        } catch (err) {
          eintrag.fehler_lauf = String(err).slice(0, 300)
        }
        eintrag.konsolenfehler = fehler
        ergebnis.push(eintrag)
        console.log(
          `${name}\t${breite}\t${schema}\tstatus ${eintrag.status}\tCLS ${eintrag.cls}\tHoehe ${eintrag.hoehe}` +
          `\tSpeicher ${JSON.stringify(eintrag.speicher_vor_entscheidung)}\tcollect_vor ${JSON.stringify(eintrag.collect_vor_entscheidung)}` +
          `\tKonsolenfehler ${fehler.length}${eintrag.fehler_lauf ? '\tFEHLER ' + eintrag.fehler_lauf : ''}`,
        )
        if (eintrag.nach_zustimmung) console.log('  nach Zustimmung: ' + JSON.stringify(eintrag.nach_zustimmung))
        await browser.close()
      }
    }
  }
  fs.writeFileSync(`${aus}/sicht.json`, JSON.stringify(ergebnis, null, 1))
})().catch((err) => {
  console.error('ABBRUCH ' + String(err))
  process.exit(1)
})
