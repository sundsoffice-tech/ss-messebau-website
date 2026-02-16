import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"

if (import.meta.env.DEV) {
  import('./lib/validate-sections')
}

const rootElement = document.getElementById('root')

const renderFatalError = (message: string) => {
  document.body.innerHTML = `
    <main style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 2rem; max-width: 48rem; margin: 0 auto;">
      <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Anwendung konnte nicht geladen werden</h1>
      <p style="margin-bottom: 0.5rem;">${message}</p>
      <p>Bitte laden Sie die Seite neu. Falls der Fehler bleibt, kontaktieren Sie uns.</p>
    </main>
  `
}

if (!rootElement) {
  console.error('Root-Element #root wurde nicht gefunden. Prüfen Sie index.html und Deployment-Konfiguration.')
  renderFatalError('Das Root-Element (#root) fehlt in der ausgelieferten index.html.')
} else {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
  })

  window.addEventListener('error', (event) => {
    console.error('Global runtime error:', event.error ?? event.message)
  })

  createRoot(rootElement).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  )
}
