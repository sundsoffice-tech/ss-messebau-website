import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Initialize Eruda if injected by the Spark platform but not yet initialized
if ('eruda' in window) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as Record<string, any>).eruda.init();
  } catch {
    // Already initialized or unavailable — safe to ignore
  }
}

if (import.meta.env.DEV) {
  import('./lib/validate-sections')
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
