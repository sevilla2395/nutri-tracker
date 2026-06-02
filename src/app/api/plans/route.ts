import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlans, createPlan } from '@/lib/db/plans'
import { planTemplateSchema } from '@/lib/validations/plan.schema'
import { apiSuccess, apiError } from '@/lib/utils'

/** GET /api/plans — List all user plans */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const plans = await getUserPlans()
    return apiSuccess(plans)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}

/** POST /api/plans — Create a new plan */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const body = await request.json()
    const parsed = planTemplateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422)

    const plan = await createPlan(parsed.data)
    return apiSuccess(plan, 201)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
