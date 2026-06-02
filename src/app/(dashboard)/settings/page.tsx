import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/settings/SettingsClient'

export const metadata: Metadata = {
  title: 'Configuración',
  description: 'Gestiona tu perfil y preferencias de NutriTracker',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <SettingsClient user={user} profile={profile} />
    </div>
  )
}
