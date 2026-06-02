'use client'

import { usePathname } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TopBarProps {
  user: User
  profile: { full_name: string | null; role: string } | null
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Mi Día', subtitle: 'Registro diario de intercambios' },
  '/foods': { title: 'Biblioteca de Alimentos', subtitle: 'Gestiona tus intercambios por categoría' },
  '/plans': { title: 'Mis Planes', subtitle: 'Crea y gestiona tus planes de alimentación' },
  '/settings': { title: 'Configuración', subtitle: 'Ajusta tu perfil y preferencias' },
}

export function TopBar({ user, profile }: TopBarProps) {
  const pathname = usePathname()

  // Find the matching page entry
  const pageKey = Object.keys(pageTitles).find(
    (k) => pathname === k || (k !== '/dashboard' && pathname.startsWith(k))
  )
  const page = pageKey ? pageTitles[pageKey] : { title: 'NutriTracker', subtitle: '' }

  const initials = (profile?.full_name || user.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-lg font-bold leading-tight">{page.title}</h1>
        {page.subtitle && (
          <p className="text-xs text-muted-foreground">{page.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium leading-none">
            {profile?.full_name || user.email?.split('@')[0]}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        <Avatar className="h-9 w-9 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
