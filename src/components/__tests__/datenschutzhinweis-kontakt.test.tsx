import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { installBrowserShims } from '@/test/browser-shims'
import { I18nContext, getTranslation, type Language } from '@/lib/i18n'
import { KontaktPage } from '@/components/pages/KontaktPage'

/**
 * Art. 13 DSGVO verlangt den Hinweis „zum Zeitpunkt der Erhebung": am
 * Kontaktformular und am Eingabefeld des KI-Chats auf /kontakt steht je ein
 * Satz mit Verweis auf die Datenschutzerklärung (Auflage 10 der Rechtsprüfung
 * vom 10.11.2026). Gesendet wird hier nichts.
 */

function mitSprache(lang: Language, kind: ReactNode) {
  return (
    <I18nContext.Provider value={{ lang, setLang: () => {}, t: getTranslation(lang) }}>
      {kind}
    </I18nContext.Provider>
  )
}

beforeAll(() => {
  installBrowserShims()
})

beforeEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

describe('Datenschutzhinweise auf /kontakt', () => {
  it('unter dem Chat-Eingabefeld steht, dass die Frage an OpenAI geht, mit Verweis auf /datenschutz', () => {
    render(mitSprache('de', <KontaktPage />))
    // Vor dem Öffnen gibt es kein Eingabefeld und keinen Hinweis
    expect(screen.queryByText('Ihre Frage wird zur Beantwortung an OpenAI übertragen.')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Chat starten/ }))

    const eingabe = screen.getByPlaceholderText('Ihre Frage eingeben...')
    const hinweis = screen.getByText('Ihre Frage wird zur Beantwortung an OpenAI übertragen.')
    expect(eingabe.compareDocumentPosition(hinweis) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(hinweis).getByRole('link', { name: 'Mehr in der Datenschutzerklärung.' })).toHaveAttribute(
      'href',
      '/datenschutz',
    )
  })

  it('englisch steht derselbe Hinweis am Eingabefeld', () => {
    render(mitSprache('en', <KontaktPage />))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(getTranslation('en')('kontakt.ai.start')) }))

    const hinweis = screen.getByText('Your question is sent to OpenAI so that it can be answered.')
    expect(within(hinweis).getByRole('link', { name: 'More in the privacy policy.' })).toHaveAttribute(
      'href',
      '/datenschutz',
    )
  })

  it('am Kontaktformular führt ein Verweis zur Datenschutzerklärung', () => {
    const { container } = render(mitSprache('de', <KontaktPage />))
    const formular = container.querySelector('#kontaktformular form') as HTMLFormElement

    const hinweis = within(formular).getByText('Wir nutzen Ihre Daten zur Bearbeitung Ihrer Anfrage.')
    expect(within(hinweis).getByRole('link', { name: 'Datenschutzerklärung' })).toHaveAttribute('href', '/datenschutz')
  })
})
