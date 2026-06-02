import { z } from 'zod'

export const planTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(80, 'El nombre es muy largo')
    .trim(),
  description: z.string().max(300, 'La descripción es muy larga').trim().optional(),
})

export const mealSlotSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(60, 'El nombre es muy largo')
    .trim(),
  display_order: z.number().int().min(0).optional(),
})

export const mealSlotRequirementSchema = z.object({
  category_id: z.string().uuid('Categoría inválida'),
  exchange_count: z
    .number()
    .positive('Debe ser mayor a 0')
    .max(20, 'Máximo 20 intercambios'),
})

export type PlanTemplateInput = z.infer<typeof planTemplateSchema>
export type MealSlotInput = z.infer<typeof mealSlotSchema>
export type MealSlotRequirementInput = z.infer<typeof mealSlotRequirementSchema>
