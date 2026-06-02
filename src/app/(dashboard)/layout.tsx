import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav } from '@/components/shared/SidebarNav'
import { TopBar } from '@/components/shared/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <SidebarNav user={user} profile={profile} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto gradient-mesh">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
