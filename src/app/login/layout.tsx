import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Ingresa a tu cuenta de NutriTracker',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
