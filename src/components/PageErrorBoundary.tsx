import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertTitle, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from 'lucide-react'
import type { ReactNode } from 'react'

function PageErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  if (import.meta.env.DEV) throw error

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Seite konnte nicht geladen werden</AlertTitle>
          <AlertDescription>
            Beim Laden dieser Seite ist ein Fehler aufgetreten. Sie können es erneut versuchen oder zur Startseite zurückkehren.
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Fehlerdetails:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>

        <div className="flex gap-3">
          <Button onClick={resetErrorBoundary} variant="outline" className="flex-1">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
          <Button
            onClick={() => { window.location.hash = '/'; window.location.reload() }}
            className="flex-1"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Zur Startseite
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={PageErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}
