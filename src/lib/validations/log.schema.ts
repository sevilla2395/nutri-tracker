import { z } from 'zod'

export const logEntrySchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  plan_id: z.string().uuid('Plan inválido'),
  meal_slot_id: z.string().uuid('Tiempo de comida inválido'),
  requirement_id: z.string().uuid('Requerimiento inválido'),
  food_id: z.string().uuid('Alimento inválido'),
  exchange_quantity: z
    .number()
    .positive('Debe ser mayor a 0')
    .max(10, 'Máximo 10 intercambios por entrada'),
})

export const deleteLogEntrySchema = z.object({
  entry_id: z.string().uuid('Entrada inválida'),
})

export type LogEntryInput = z.infer<typeof logEntrySchema>
export type DeleteLogEntryInput = z.infer<typeof deleteLogEntrySchema>
