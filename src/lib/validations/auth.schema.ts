import { z } from 'zod'

// Username must be alphanumeric + underscores, 3-30 chars
const usernameRule = z
  .string()
  .min(3, 'El usuario debe tener al menos 3 caracteres')
  .max(30, 'El usuario es muy largo (máx. 30 caracteres)')
  .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos (_)')
  .trim()

export const loginSchema = z.object({
  username: usernameRule,
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
  .object({
    username: usernameRule,
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña es muy larga'),
    confirm_password: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

/** Converts a username to the internal fake email used with Supabase Auth */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@nutritracker.app`
}
