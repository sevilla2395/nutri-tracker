'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, User, Shield } from 'lucide-react'
import { z } from 'zod'
import type { User as SupabaseUser } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const profileSchema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido').max(100).trim(),
})
type ProfileInput = z.infer<typeof profileSchema>

interface SettingsClientProps {
  user: SupabaseUser
  profile: { full_name: string | null; username: string | null; role: string } | null
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  const saveProfile = async (data: ProfileInput) => {
    setSaving(true)
    const supabase = createClient()
    const updateData: any = { full_name: data.full_name }
    const { error } = await supabase
      .from('profiles')
      // @ts-ignore
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar perfil')
    } else {
      toast.success('Perfil actualizado')
    }
    setSaving(false)
  }

  const username = profile?.username || user.email?.split('@')[0] || 'U'
  const displayName = profile?.full_name || username
  const initials = username
    .split(/[_\s]/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-muted-foreground text-sm mt-1">Gestiona tu perfil y cuenta</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border bg-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{displayName}</p>
            <p className="text-muted-foreground text-sm font-mono">@{username}</p>
            <Badge variant="outline" className="mt-1 text-xs gap-1">
              {profile?.role === 'admin' ? (
                <><Shield className="w-3 h-3" /> Administrador</>
              ) : (
                <><User className="w-3 h-3" /> Usuario</>
              )}
            </Badge>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-username">Nombre de usuario</Label>
            <Input
              id="settings-username"
              value={`@${username}`}
              disabled
              className="bg-muted font-mono"
            />
            <p className="text-xs text-muted-foreground">El nombre de usuario no puede cambiarse</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-name">Nombre para mostrar (opcional)</Label>
            <Input
              id="settings-name"
              {...register('full_name')}
              placeholder="Tu nombre real"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="brand-gradient text-white hover:opacity-90"
            disabled={saving}
            id="save-profile-btn"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar cambios
          </Button>
        </form>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <h3 className="font-semibold">Información de cuenta</h3>
        <div className="text-sm space-y-2 text-muted-foreground">
          <div className="flex justify-between">
            <span>Nombre de usuario</span>
            <span className="font-mono text-foreground">@{username}</span>
          </div>
          <div className="flex justify-between">
            <span>Rol</span>
            <span className="capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
          </div>
          <div className="flex justify-between">
            <span>ID de cuenta</span>
            <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
