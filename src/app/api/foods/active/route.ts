import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveFoodsByCategory } from '@/lib/db/foods'
import { apiSuccess, apiError } from '@/lib/utils'

/**
 * GET /api/foods/active?categoryId=<uuid>
 * Returns active (non-deactivated) foods for the current user filtered by category.
 * Used by the Daily Tracker food selection modal.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const categoryId = request.nextUrl.searchParams.get('categoryId')
    if (!categoryId) return apiError('categoryId es requerido', 400)

    const foods = await getActiveFoodsByCategory(categoryId)
    return apiSuccess(foods)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
