import { z } from 'zod'

/**
 * Schema used by the client-side form (react-hook-form).
 * All fields are explicit types — no coercion needed because
 * the form sends proper JS values (numbers from defaultValues,
 * null for empty portion_grams).
 */
export const foodExchangeSchema = z.object({
  category_id: z.string().uuid('Categoría inválida'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').trim(),
  portion_amount: z
    .string()
    .min(1, 'La porción es requerida')
    .max(50, 'Descripción de porción muy larga')
    .trim(),
  portion_grams: z.number().positive('El peso debe ser mayor que 0').nullable(),
  calories: z.number().min(0),
  carbs_g: z.number().min(0),
  protein_g: z.number().min(0),
  fat_g: z.number().min(0),
  fiber_g: z.number().min(0),
})

export type FoodExchangeInput = z.infer<typeof foodExchangeSchema>

/**
 * Schema used by the API routes to parse the incoming JSON body.
 * Uses z.coerce so that numbers that arrive as strings are accepted,
 * and portion_grams can be null or a positive number.
 */
export const foodExchangeApiSchema = z.object({
  category_id: z.string().uuid('Categoría inválida'),
  name: z.string().min(1, 'El nombre es requerido').max(100).trim(),
  portion_amount: z.string().min(1, 'La porción es requerida').max(50).trim(),
  portion_grams: z.coerce
    .number()
    .positive('El peso debe ser mayor que 0')
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  calories: z.coerce.number().min(0).default(0),
  carbs_g: z.coerce.number().min(0).default(0),
  protein_g: z.coerce.number().min(0).default(0),
  fat_g: z.coerce.number().min(0).default(0),
  fiber_g: z.coerce.number().min(0).default(0),
})
