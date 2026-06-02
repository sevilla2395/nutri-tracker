import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMealSlot, updateMealSlot, deleteMealSlot, upsertRequirement, deleteRequirement } from '@/lib/db/plans'
import { mealSlotSchema, mealSlotRequirementSchema } from '@/lib/validations/plan.schema'
import { apiSuccess, apiError } from '@/lib/utils'

type Params = { params: Promise<{ planId: string }> }

/**
 * POST /api/plans/[planId]/slots — Create a meal slot
 * Body: { name: string, display_order?: number }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { planId } = await params
    const body = await request.json()
    const parsed = mealSlotSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    const slot = await createMealSlot(planId, parsed.data)
    return apiSuccess(slot, 201)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
