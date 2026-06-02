export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          role?: 'user' | 'admin'
          updated_at?: string
        }
      }
      food_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color_hex: string
          icon: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color_hex?: string
          icon?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color_hex?: string
          icon?: string
          sort_order?: number
        }
      }
      food_exchanges: {
        Row: {
          id: string
          category_id: string
          created_by: string | null
          name: string
          portion_amount: string
          portion_grams: number | null
          calories: number
          carbs_g: number
          protein_g: number
          fat_g: number
          fiber_g: number
          is_global: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          created_by?: string | null
          name: string
          portion_amount: string
          portion_grams?: number | null
          calories?: number
          carbs_g?: number
          protein_g?: number
          fat_g?: number
          fiber_g?: number
          is_global?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          name?: string
          portion_amount?: string
          portion_grams?: number | null
          calories?: number
          carbs_g?: number
          protein_g?: number
          fat_g?: number
          fiber_g?: number
          is_global?: boolean
          updated_at?: string
        }
      }
      user_food_preferences: {
        Row: {
          user_id: string
          food_id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          food_id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          is_active?: boolean
          updated_at?: string
        }
      }
      plan_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      meal_slots: {
        Row: {
          id: string
          plan_id: string
          name: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          name: string
          display_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          display_order?: number
        }
      }
      meal_slot_requirements: {
        Row: {
          id: string
          meal_slot_id: string
          category_id: string
          exchange_count: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_slot_id: string
          category_id: string
          exchange_count?: number
          created_at?: string
        }
        Update: {
          exchange_count?: number
        }
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          log_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          log_date?: string
          created_at?: string
        }
        Update: {
          plan_id?: string
          log_date?: string
        }
      }
      daily_log_entries: {
        Row: {
          id: string
          log_id: string
          meal_slot_id: string
          requirement_id: string
          food_id: string
          exchange_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          log_id: string
          meal_slot_id: string
          requirement_id: string
          food_id: string
          exchange_quantity?: number
          created_at?: string
        }
        Update: {
          food_id?: string
          exchange_quantity?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
