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
    .number()
    .positive('El peso debe ser positivo')
    .nullable()
    .optional(),
  calories: nonNegativeNumber('Calorías'),
  carbs_g: nonNegativeNumber('Carbohidratos'),
  protein_g: nonNegativeNumber('Proteínas'),
  fat_g: nonNegativeNumber('Grasas'),
  fiber_g: nonNegativeNumber('Fibra'),
})

export type FoodExchangeInput = z.infer<typeof foodExchangeSchema>
