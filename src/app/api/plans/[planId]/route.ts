import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanWithSlots, updatePlan, setActivePlan, deletePlan } from '@/lib/db/plans'
import { planTemplateSchema } from '@/lib/validations/plan.schema'
import { apiSuccess, apiError } from '@/lib/utils'

type Params = { params: Promise<{ planId: string }> }

/** GET /api/plans/[planId] — Get plan with all slots and requirements */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { planId } = await params
    const plan = await getPlanWithSlots(planId)
    return apiSuccess(plan)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/** PATCH /api/plans/[planId] — Update plan name/description or set as active */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { planId } = await params
    const body = await request.json()

    // If setting as active plan
    if (body.set_active === true) {
      await setActivePlan(planId)
      return apiSuccess({ activated: true })
    }

    // Otherwise update plan metadata
    const parsed = planTemplateSchema.partial().safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    await updatePlan(planId, parsed.data)
    return apiSuccess({ updated: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/** DELETE /api/plans/[planId] — Delete a plan */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const { planId } = await params
    await deletePlan(planId)
    return apiSuccess({ deleted: true })
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
