import { Database } from '@/types/database.types'

// =====================================================
// Convenience type aliases
// =====================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type FoodCategory = Database['public']['Tables']['food_categories']['Row']
export type FoodExchange = Database['public']['Tables']['food_exchanges']['Row']
export type UserFoodPreference = Database['public']['Tables']['user_food_preferences']['Row']
export type PlanTemplate = Database['public']['Tables']['plan_templates']['Row']
export type MealSlot = Database['public']['Tables']['meal_slots']['Row']
export type MealSlotRequirement = Database['public']['Tables']['meal_slot_requirements']['Row']
export type DailyLog = Database['public']['Tables']['daily_logs']['Row']
export type DailyLogEntry = Database['public']['Tables']['daily_log_entries']['Row']

// =====================================================
// Rich joined types (for UI consumption)
// =====================================================

export type FoodExchangeWithCategory = FoodExchange & {
  food_categories: FoodCategory
  /** User's personal activation override (null = not set, uses default is_active=true) */
  user_food_preferences?: { is_active: boolean } | null
}

export type MealSlotRequirementWithCategory = MealSlotRequirement & {
  food_categories: FoodCategory
}

export type MealSlotWithRequirements = MealSlot & {
  meal_slot_requirements: MealSlotRequirementWithCategory[]
}

export type PlanTemplateWithSlots = PlanTemplate & {
  meal_slots: MealSlotWithRequirements[]
}

export type DailyLogEntryWithFood = DailyLogEntry & {
  food_exchanges: FoodExchange & { food_categories: FoodCategory }
}

export type DailyLogWithEntries = DailyLog & {
  daily_log_entries: DailyLogEntryWithFood[]
}

// =====================================================
// Computed nutrition totals
// =====================================================
export interface NutritionTotals {
  calories: number
  carbs_g: number
  protein_g: number
  fat_g: number
  fiber_g: number
}
