'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Salad,
  ClipboardList,
  Settings,
  Leaf,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SidebarNavProps {
  user: User
  profile: { full_name: string | null; role: string } | null
}

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/foods', label: 'Alimentos', icon: Salad },
  { href: '/plans', label: 'Mis Planes', icon: ClipboardList },
  { href: '/categories', label: 'Categorías', icon: Tags },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function SidebarNav({ user, profile }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full transition-all duration-300 ease-in-out shrink-0',
        'bg-sidebar border-r border-sidebar-border',
        collapsed ? 'w-[68px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl brand-gradient shadow-md shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sidebar-foreground font-bold text-lg leading-none">
            NutriTracker
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          'absolute -right-3 top-[70px] z-10',
          'flex items-center justify-center w-6 h-6 rounded-full',
          'bg-sidebar-border text-sidebar-foreground',
          'hover:bg-primary hover:text-primary-foreground transition-colors shadow'
        )}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                'text-sm font-medium',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
        {!collapsed && (
          <div className="px-2 py-1">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {profile?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-sidebar-foreground/50 text-xs truncate">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm',
            'text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive',
            'transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
