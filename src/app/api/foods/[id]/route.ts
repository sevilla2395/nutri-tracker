import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { foodExchangeApiSchema } from '@/lib/validations/food.schema'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const resolvedParams = await params
    const foodId = resolvedParams.id
    if (!foodId) return apiError('ID requerido', 400)

    const body = await request.json()
    const parsed = foodExchangeApiSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422)
    }

    const { data, error } = await supabase
      .from('food_exchanges')
      // @ts-ignore
      .update({
        name: parsed.data.name,
        category_id: parsed.data.category_id,
        portion_amount: parsed.data.portion_amount,
        portion_grams: parsed.data.portion_grams ?? null,
        calories: parsed.data.calories ?? 0,
        carbs_g: parsed.data.carbs_g ?? 0,
        protein_g: parsed.data.protein_g ?? 0,
        fat_g: parsed.data.fat_g ?? 0,
        fiber_g: parsed.data.fiber_g ?? 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', foodId)
      .select()
      .single()

    if (error) {
      return apiError(`Error al actualizar alimento: ${error.message}`, 500)
    }

    return apiSuccess(data)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
