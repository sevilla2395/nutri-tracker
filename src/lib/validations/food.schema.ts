import { z } from 'zod'

const nonNegativeNumber = (label: string) =>
  z
    .number({ message: `${label} debe ser un número` })
    .min(0, { message: `${label} no puede ser negativo` })

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
  portion_grams: z
    .number({ invalid_type_error: 'El peso debe ser un número' })
    .positive('El peso debe ser mayor que 0')
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  calories: z.number(),
  carbs_g: z.number(),
  protein_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number(),
})

export type FoodExchangeInput = z.infer<typeof foodExchangeSchema>
