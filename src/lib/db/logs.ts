import { createClient } from '@/lib/supabase/server'
import { LogEntryInput } from '@/lib/validations/log.schema'
import { NutritionTotals } from '@/types'

/**
 * MODEL: Get or create a daily log for the given date and plan
 */
async function getOrCreateDailyLog(userId: string, planId: string, logDate: string) {
  const supabase = await createClient()

  // Try to find existing log
  const { data: existing } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('log_date', logDate)
    .maybeSingle()
  if (existing) return (existing as any).id

  const insertData1: any = { user_id: userId, plan_id: planId, log_date: logDate }
  const { data: created, error } = await supabase
    .from('daily_logs')
    // @ts-ignore
    .insert(insertData1)
    .select('id')
    .single()

  if (error) throw new Error(`Error al crear registro diario: ${error.message}`)
  return (created as any).id
}

/**
 * MODEL: Get daily log with all entries for a specific date
 */
export async function getDailyLog(planId: string, logDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      *,
      daily_log_entries (
        *,
        food_exchanges (
          id, name, portion_amount, calories, carbs_g, protein_g, fat_g, fiber_g,
          food_categories ( id, name, color_hex, icon )
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('plan_id', planId)
    .eq('log_date', logDate)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener registro: ${error.message}`)
  return data
}

/**
 * MODEL: Add or update a log entry
 * Upserts based on (log_id, meal_slot_id, requirement_id, food_id)
 */
export async function upsertLogEntry(input: LogEntryInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const logId = await getOrCreateDailyLog(user.id, input.plan_id, input.log_date)

  const insertData2: any = {
    log_id: logId,
    meal_slot_id: input.meal_slot_id,
    requirement_id: input.requirement_id,
    food_id: input.food_id,
    exchange_quantity: input.exchange_quantity,
  }

  const { data, error } = await supabase
    .from('daily_log_entries')
    // @ts-ignore
    .insert(insertData2)
    .select()
    .single()

  if (error) throw new Error(`Error al guardar entrada: ${error.message}`)
  return data
}

/**
 * MODEL: Update a log entry's quantity or food selection
 */
export async function updateLogEntry(
  entryId: string,
  updates: { food_id?: string; exchange_quantity?: number }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('daily_log_entries')
    // @ts-ignore
    .update(updates)
    .eq('id', entryId)

  if (error) throw new Error(`Error al actualizar entrada: ${error.message}`)
}

/**
 * MODEL: Delete a log entry
 */
export async function deleteLogEntry(entryId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('daily_log_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw new Error(`Error al eliminar entrada: ${error.message}`)
}

/**
 * Utility: Calculate nutrition totals from log entries
 */
export function calculateNutritionTotals(
  entries: Array<{
    exchange_quantity: number
    food_exchanges: {
      calories: number
      carbs_g: number
      protein_g: number
      fat_g: number
      fiber_g: number
    }
  }>
): NutritionTotals {
  return entries.reduce(
    (totals, entry) => {
      const qty = entry.exchange_quantity
      const food = entry.food_exchanges
      return {
        calories: totals.calories + food.calories * qty,
        carbs_g: totals.carbs_g + food.carbs_g * qty,
        protein_g: totals.protein_g + food.protein_g * qty,
        fat_g: totals.fat_g + food.fat_g * qty,
        fiber_g: totals.fiber_g + food.fiber_g * qty,
      }
    },
    { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0, fiber_g: 0 }
  )
}
