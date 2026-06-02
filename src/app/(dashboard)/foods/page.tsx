import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getFoodsForUser } from '@/lib/db/foods'
import { getFoodCategories } from '@/lib/db/foods'
import { FoodsClient } from '@/components/foods/FoodsClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Alimentos',
  description: 'Gestiona tu biblioteca de alimentos e intercambios',
}

export default async function FoodsPage() {
  const [foods, categories] = await Promise.all([
    getFoodsForUser(),
    getFoodCategories(),
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Suspense fallback={<FoodsPageSkeleton />}>
        <FoodsClient initialFoods={foods as any} categories={categories} />
      </Suspense>
    </div>
  )
}

function FoodsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
