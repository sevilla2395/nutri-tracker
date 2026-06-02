import type { Metadata } from 'next'
import { getUserPlans } from '@/lib/db/plans'
import { PlansClient } from '@/components/plans/PlansClient'

export const metadata: Metadata = {
  title: 'Mis Planes',
  description: 'Gestiona tus planes de alimentación por intercambios',
}

export default async function PlansPage() {
  const plans = await getUserPlans()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PlansClient initialPlans={plans} />
    </div>
  )
}
