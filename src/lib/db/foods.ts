import { createClient } from '@/lib/supabase/server'
import { FoodExchangeInput } from '@/lib/validations/food.schema'

/**
 * MODEL: Food Categories
 * Fetch all food categories sorted by sort_order
 */
export async function getFoodCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('food_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Error al obtener categorías: ${error.message}`)
  return data
}

/**
 * MODEL: Food Exchanges
 * Get all foods visible to the current user (global + own),
 * with their category and user preference (is_active override).
 */
export async function getFoodsForUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('food_exchanges')
    .select(`
      *,
      food_categories ( id, name, color_hex, icon ),
      user_food_preferences ( is_active )
    `)
    .order('name', { ascending: true })

  if (error) throw new Error(`Error al obtener alimentos: ${error.message}`)
  return data
}

/**
 * MODEL: Active Foods by Category
 * Returns only foods the user has not deactivated, filtered by category.
 * Used by the Daily Tracker food selection modal.
 */
export async function getActiveFoodsByCategory(categoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Get all foods for this category
  const { data: foods, error } = await supabase
    .from('food_exchanges')
    .select(`
      *,
      food_categories ( id, name, color_hex, icon ),
      user_food_preferences ( is_active )
    `)
    .eq('category_id', categoryId)
    .order('name', { ascending: true })

  if (error) throw new Error(`Error al obtener alimentos: ${error.message}`)

  // Filter: include food only if user hasn't explicitly deactivated it
  return (foods as any[]).filter((food) => {
    const pref = food.user_food_preferences?.[0]
    // If no preference row, default to active (true)
    return pref ? pref.is_active : true
  })
}

/**
 * MODEL: Create Food Exchange
 */
export async function createFoodExchange(input: FoodExchangeInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const insertData: any = {
    ...input,
    created_by: user.id,
    is_global: false,
    portion_grams: input.portion_grams ?? null,
  }

  const { data, error } = await supabase
    .from('food_exchanges')
    // @ts-ignore
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(`Error al crear alimento: ${error.message}`)
  return data
}

/**
 * MODEL: Delete Food Exchange (own only)
 */
export async function deleteFoodExchange(foodId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('food_exchanges')
    .delete()
    .eq('id', foodId)

  if (error) throw new Error(`Error al eliminar alimento: ${error.message}`)
}

/**
 * MODEL: Toggle Food Preference
 * Upserts a user_food_preferences row to activate/deactivate a food.
 */
export async function toggleFoodPreference(foodId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const upsertData: any = { user_id: user.id, food_id: foodId, is_active: isActive }

  const { error } = await supabase
    .from('user_food_preferences')
    // @ts-ignore
    .upsert(upsertData, { onConflict: 'user_id,food_id' })

  if (error) throw new Error(`Error al actualizar preferencia: ${error.message}`)
}
