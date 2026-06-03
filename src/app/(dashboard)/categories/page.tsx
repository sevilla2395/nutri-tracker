import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getFoodCategories } from '@/lib/db/foods'
import { CategoriesClient } from '@/components/categories/CategoriesClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Administra las categorías de alimentos',
}

export default async function CategoriesPage() {
  const categories = await getFoodCategories()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesClient initialCategories={categories} />
      </Suspense>
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48 mb-6" />
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}
