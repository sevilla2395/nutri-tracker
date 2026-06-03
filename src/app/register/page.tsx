'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Leaf, Eye, EyeOff, User, CheckCircle2 } from 'lucide-react'

import { registerSchema, type RegisterInput, usernameToEmail } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    const supabase = createClient()

    // Convert username to fake internal email for Supabase Auth
    const fakeEmail = usernameToEmail(data.username)

    const { error } = await supabase.auth.signUp({
      email: fakeEmail,
      password: data.password,
      options: {
        // Store username in metadata so the trigger can use it
        data: { username: data.username },
        // No email confirmation redirect needed
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')) {
        toast.error('Ese nombre de usuario ya está en uso. Elige otro.')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-10 shadow-2xl text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Cuenta creada!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl brand-gradient text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-5/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient mb-4 shadow-lg shadow-primary/30">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">NutriTracker</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sistema de Intercambios Alimentarios</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-black/10">
          <h2 className="text-xl font-semibold mb-1">Crear cuenta</h2>
          <p className="text-sm text-muted-foreground mb-6">Elige un nombre de usuario y contraseña</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="mi_usuario"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  {...register('username')}
                  className={`pl-9 ${errors.username ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.username ? (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Letras, números y guiones bajos. Ej: maria_garcia</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar contraseña</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                {...register('confirm_password')}
                className={errors.confirm_password ? 'border-destructive' : ''}
              />
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full brand-gradient text-white font-semibold shadow-md shadow-primary/30 hover:opacity-90 transition-opacity mt-2"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta gratuita'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
