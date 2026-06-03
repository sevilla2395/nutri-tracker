import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/utils'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(2),
  icon: z.string().min(1),
  color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return apiError('No autenticado', 401)

    const resolvedParams = await params
    const categoryId = resolvedParams.id
    if (!categoryId) return apiError('ID requerido', 400)

    const body = await request.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Datos inválidos', 422)
    }

    const { data, error } = await supabase
      .from('food_categories')
      // @ts-ignore
      .update({
        name: parsed.data.name,
        icon: parsed.data.icon,
        color_hex: parsed.data.color_hex,
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) {
      return apiError(`Error al actualizar categoría: ${error.message}`, 500)
    }

    return apiSuccess(data)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Error del servidor', 500)
  }
}
