import { z } from 'zod'

export const foodExchangeSchema = z.object({
  category_id: z.string().uuid('Categoría inválida'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre es muy largo')
    .trim(),
  portion_amount: z
    .string()
    .min(1, 'La porción es requerida')
    .max(50, 'Descripción de porción muy larga')
    .trim(),
  // null = no ingresado; number > 0 = peso válido
  portion_grams: z
    .number({ error: 'El peso debe ser un número' })
    .positive('El peso debe ser mayor que 0')
    .nullable(),
  calories: z.number().min(0),
  carbs_g: z.number().min(0),
  protein_g: z.number().min(0),
  fat_g: z.number().min(0),
  fiber_g: z.number().min(0),
})

export type FoodExchangeInput = z.infer<typeof foodExchangeSchema>
