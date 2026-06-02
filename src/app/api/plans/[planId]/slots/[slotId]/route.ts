import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateMealSlot, deleteMealSlot, upsertRequirement, deleteRequirement } from '@/lib/db/plans'
import { mealSlotSchema, mealSlotRequirementSchema } from '@/lib/validations/plan.schema'
import { apiSuccess, apiError } from '@/lib/utils'

type Params = { params: Promise<{ planId: string; slotId: string }> }

/** PATCH /api/plans/[planId]/slots/[slotId] — Update slot name or order */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { slotId } = await params
    const body = await request.json()
    const parsed = mealSlotSchema.partial().safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    await updateMealSlot(slotId, parsed.data)
    return apiSuccess({ updated: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/** DELETE /api/plans/[planId]/slots/[slotId] — Delete a meal slot */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { slotId } = await params
    await deleteMealSlot(slotId)
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/**
 * POST /api/plans/[planId]/slots/[slotId] — Add/update a requirement on a slot
 * Body: { category_id: string, exchange_count: number }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { slotId } = await params
    const body = await request.json()

    // If deleting a requirement
    if (body.delete_requirement_id) {
      await deleteRequirement(body.delete_requirement_id)
      return apiSuccess({ deleted: true })
    }

    const parsed = mealSlotRequirementSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    const req = await upsertRequirement(slotId, parsed.data)
    return apiSuccess(req, 201)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
