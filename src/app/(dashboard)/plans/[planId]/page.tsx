import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlanWithSlots } from '@/lib/db/plans'
import { getFoodCategories } from '@/lib/db/foods'
import { PlanBuilderClient } from '@/components/plans/PlanBuilderClient'

export const metadata: Metadata = {
  title: 'Editor de Plan',
}

type Props = { params: Promise<{ planId: string }> }

export default async function PlanDetailPage({ params }: Props) {
  const { planId } = await params
  const [plan, categories] = await Promise.all([
    getPlanWithSlots(planId).catch(() => null),
    getFoodCategories(),
  ])

  if (!plan) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PlanBuilderClient plan={plan as any} categories={categories} />
    </div>
  )
}
