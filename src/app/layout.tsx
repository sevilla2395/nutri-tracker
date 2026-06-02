import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'NutriTracker — Sistema de Intercambios',
    template: '%s | NutriTracker',
  },
  description:
    'Seguimiento nutricional basado en el Sistema de Intercambios. Gestiona tus alimentos, crea planes personalizados y lleva un registro diario de tu alimentación.',
  keywords: ['nutrición', 'intercambios', 'dieta', 'alimentos', 'calorías', 'macros'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
