import { createClient } from '@/lib/supabase/server'
import {
  PlanTemplateInput,
  MealSlotInput,
  MealSlotRequirementInput,
} from '@/lib/validations/plan.schema'

/**
 * MODEL: Get all plans for the current user
 */
export async function getUserPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('plan_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Error al obtener planes: ${error.message}`)
  return data
}

/**
 * MODEL: Get a single plan with all meal slots and their requirements
 */
export async function getPlanWithSlots(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('plan_templates')
    .select(`
      *,
      meal_slots (
        *,
        meal_slot_requirements (
          *,
          food_categories ( id, name, color_hex, icon, sort_order )
        )
      )
    `)
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (error) throw new Error(`Error al obtener plan: ${error.message}`)

  // Normalize and sort meal slots by display_order
  if ((data as any)?.meal_slots != null) {
    if (!Array.isArray((data as any).meal_slots)) {
      (data as any).meal_slots = [(data as any).meal_slots]
    }
    (data as any).meal_slots.sort((a: any, b: any) => a.display_order - b.display_order)
  }

  return data
}

/**
 * MODEL: Get the currently active plan for the user
 */
export async function getActivePlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('plan_templates')
    .select(`
      *,
      meal_slots (
        *,
        meal_slot_requirements (
          *,
          food_categories ( id, name, color_hex, icon, sort_order )
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener plan activo: ${error.message}`)

  if ((data as any)?.meal_slots != null) {
    // Normalize to array (Supabase may return a single object for one-item relations)
    if (!Array.isArray((data as any).meal_slots)) {
      (data as any).meal_slots = [(data as any).meal_slots]
    }
    (data as any).meal_slots.sort((a: any, b: any) => a.display_order - b.display_order)
    ;(data as any).meal_slots.forEach((slot: any) => {
      if (slot.meal_slot_requirements != null) {
        if (!Array.isArray(slot.meal_slot_requirements)) {
          slot.meal_slot_requirements = [slot.meal_slot_requirements]
        }
        slot.meal_slot_requirements.sort((a: any, b: any) =>
          (a.food_categories?.sort_order ?? 0) - (b.food_categories?.sort_order ?? 0)
        )
      }
    })
  }

  return data
}

/**
 * MODEL: Create Plan
 */
export async function createPlan(input: PlanTemplateInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const insertData1: any = { ...input, user_id: user.id }
  const { data, error } = await supabase
    .from('plan_templates')
    // @ts-ignore
    .insert(insertData1)
    .select()
    .single()

  if (error) throw new Error(`Error al crear plan: ${error.message}`)
  return data
}

/**
 * MODEL: Update Plan
 */
export async function updatePlan(planId: string, input: Partial<PlanTemplateInput> & { is_active?: boolean }) {
  const supabase = await createClient()
  const updateData1: any = input
  const { error } = await supabase
    .from('plan_templates')
    // @ts-ignore
    .update(updateData1)
    .eq('id', planId)

  if (error) throw new Error(`Error al actualizar plan: ${error.message}`)
}

/**
 * MODEL: Set Active Plan
 * Deactivates all user plans, then activates the selected one.
 * Uses two queries (Supabase doesn't support conditional updates in one go with RLS).
 */
export async function setActivePlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Deactivate all plans
  const updateData2: any = { is_active: false }
  const { error: deactivateError } = await supabase
    .from('plan_templates')
    // @ts-ignore
    .update(updateData2)
    .eq('user_id', user.id)

  if (deactivateError) throw new Error(`Error al desactivar planes: ${deactivateError.message}`)

  // Activate selected plan
  const updateData3: any = { is_active: true }
  const { error: activateError } = await supabase
    .from('plan_templates')
    // @ts-ignore
    .update(updateData3)
    .eq('id', planId)
    .eq('user_id', user.id)

  if (activateError) throw new Error(`Error al activar plan: ${activateError.message}`)
}

/**
 * MODEL: Delete Plan
 */
export async function deletePlan(planId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('plan_templates')
    .delete()
    .eq('id', planId)

  if (error) throw new Error(`Error al eliminar plan: ${error.message}`)
}

// =====================================================
// MEAL SLOTS
// =====================================================

export async function createMealSlot(planId: string, input: MealSlotInput) {
  const supabase = await createClient()

  // Get current max order
  const { data: existing } = await supabase
    .from('meal_slots')
    .select('display_order')
    .eq('plan_id', planId)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? (existing as any)[0].display_order + 1 : 0

  const insertData2: any = { ...input, plan_id: planId, display_order: input.display_order ?? nextOrder }
  const { data, error } = await supabase
    .from('meal_slots')
    // @ts-ignore
    .insert(insertData2)
    .select()
    .single()

  if (error) throw new Error(`Error al crear tiempo de comida: ${error.message}`)
  return data
}

export async function updateMealSlot(slotId: string, input: Partial<MealSlotInput>) {
  const supabase = await createClient()
  const updateData4: any = input
  const { error } = await supabase
    .from('meal_slots')
    // @ts-ignore
    .update(updateData4)
    .eq('id', slotId)

  if (error) throw new Error(`Error al actualizar tiempo de comida: ${error.message}`)
}

export async function deleteMealSlot(slotId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('meal_slots')
    .delete()
    .eq('id', slotId)

  if (error) throw new Error(`Error al eliminar tiempo de comida: ${error.message}`)
}

// =====================================================
// MEAL SLOT REQUIREMENTS
// =====================================================

export async function upsertRequirement(slotId: string, input: MealSlotRequirementInput) {
  const supabase = await createClient()

  const upsertData1: any = { meal_slot_id: slotId, category_id: input.category_id, exchange_count: input.exchange_count }
  const { data, error } = await supabase
    .from('meal_slot_requirements')
    // @ts-ignore
    .upsert(upsertData1, { onConflict: 'meal_slot_id,category_id' })
    .select()
    .single()

  if (error) throw new Error(`Error al guardar requerimiento: ${error.message}`)
  return data
}

export async function deleteRequirement(requirementId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('meal_slot_requirements')
    .delete()
    .eq('id', requirementId)

  if (error) throw new Error(`Error al eliminar requerimiento: ${error.message}`)
}
