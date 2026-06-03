'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Ocurrió un error inesperado. Mensaje de error:
        </p>
        <pre className="text-xs bg-muted rounded-lg p-4 text-left overflow-auto max-h-48 text-destructive border border-destructive/20 mb-2">
          {error.message}
        </pre>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg brand-gradient text-white text-sm font-medium shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
          >
            Ir a Mis Planes
          </Link>
        </div>
      </div>
    </div>
  )
}
