import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFoodsForUser, createFoodExchange, deleteFoodExchange, toggleFoodPreference } from '@/lib/db/foods'
import { foodExchangeApiSchema } from '@/lib/validations/food.schema'
import { apiSuccess, apiError } from '@/lib/utils'

/**
 * GET /api/foods
 * Returns all foods visible to the current user with category and preference data.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const foods = await getFoodsForUser()
    return apiSuccess(foods)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * POST /api/foods
 * Creates a new custom food exchange for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const body = await request.json()
    const parsed = foodExchangeApiSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422)
    }

    const food = await createFoodExchange(parsed.data)
    return apiSuccess(food, 201)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * DELETE /api/foods?id=<foodId>
 * Deletes a user's own food exchange.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const foodId = request.nextUrl.searchParams.get('id')
    if (!foodId) return apiError('ID de alimento requerido', 400)

    await deleteFoodExchange(foodId)
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * PATCH /api/foods
 * Toggles the is_active preference for a food for the current user.
 * Body: { food_id: string, is_active: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const body = await request.json()
    const { food_id, is_active } = body
    if (!food_id || typeof is_active !== 'boolean') {
      return apiError('food_id e is_active son requeridos', 400)
    }

    await toggleFoodPreference(food_id, is_active)
    return apiSuccess({ toggled: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
