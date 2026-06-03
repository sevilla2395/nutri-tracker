import type { Metadata } from 'next'
import { getActivePlan } from '@/lib/db/plans'
import { DashboardClient } from '@/components/tracker/DashboardClient'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mi Día — Tracker',
  description: 'Registra tus intercambios del día y visualiza tus macros',
}

export default async function DashboardPage() {
  let activePlan: Awaited<ReturnType<typeof getActivePlan>> | null = null
  let fetchError: string | null = null

  try {
    activePlan = await getActivePlan()
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-destructive">Error al cargar el plan</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Ocurrió un error al obtener tu plan activo. Contacta al administrador con el siguiente mensaje:
          </p>
          <pre className="text-xs bg-muted rounded-lg p-4 text-left overflow-auto max-h-48 text-destructive border border-destructive/20">
            {fetchError}
          </pre>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg brand-gradient text-white text-sm font-medium shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" />
            Ir a Mis Planes
          </Link>
        </div>
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🥗</div>
          <h2 className="text-2xl font-bold mb-2">Sin plan activo</h2>
          <p className="text-muted-foreground mb-6">
            Crea un plan de alimentación y actívalo para empezar a registrar tu día.
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg brand-gradient text-white text-sm font-medium shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" />
            Ir a Mis Planes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <DashboardClient plan={activePlan as any} />
    </div>
  )
}
