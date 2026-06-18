'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

// ─── Password strength ───────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Débil', color: 'bg-brand-error' }
  if (score <= 4) return { score, label: 'Moderada', color: 'bg-brand-gold' }
  return { score, label: 'Fuerte', color: 'bg-brand-success' }
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!password) return null
  const filled = Math.min(4, Math.ceil((strength.score / 6) * 4))

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= filled ? strength.color : 'bg-brand-border'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs font-medium',
        strength.score <= 2 ? 'text-brand-error' :
        strength.score <= 4 ? 'text-brand-gold' :
        'text-brand-success'
      )}>
        {strength.label}
      </p>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  const passwordValue = watch('password', '')

  async function onSubmit(data: RegisterInput) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(body.error ?? 'Error al crear la cuenta')
        return
      }

      // Auto-login
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.success('Cuenta creada. Inicia sesión para continuar.')
        router.push('/login')
        return
      }

      toast.success('¡Cuenta creada! Bienvenido a SNEAKERSMON.')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Error inesperado. Intenta de nuevo.')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">
            Crear cuenta
          </h1>
          <p className="text-brand-muted text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              href={`/login${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="text-brand-accent font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Name */}
          <Input
            {...register('name')}
            label="Nombre completo"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            error={errors.name?.message}
            leftIcon={<User className="w-4 h-4" />}
          />

          {/* Email */}
          <Input
            {...register('email')}
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Contraseña</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className={cn(
                  'w-full rounded-lg bg-brand-surface border border-brand-border pl-10 pr-10 py-3 text-white placeholder:text-brand-muted',
                  'focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent',
                  'transition-colors duration-200',
                  errors.password && 'border-brand-error focus:border-brand-error focus:ring-brand-error'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-sm text-brand-error">{errors.password.message}</p>
            ) : (
              <PasswordStrengthBar password={passwordValue} />
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Confirmar contraseña</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className={cn(
                  'w-full rounded-lg bg-brand-surface border border-brand-border pl-10 pr-10 py-3 text-white placeholder:text-brand-muted',
                  'focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent',
                  'transition-colors duration-200',
                  errors.confirmPassword && 'border-brand-error focus:border-brand-error focus:ring-brand-error'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-brand-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Crear cuenta
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-brand-muted mt-6">
        Al registrarte aceptas nuestros{' '}
        <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-2">
          Términos de servicio
        </Link>{' '}
        y{' '}
        <Link href="/privacy" className="hover:text-white transition-colors underline underline-offset-2">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-brand-elevated rounded-2xl animate-pulse" />}>
      <RegisterForm />
    </Suspense>
  )
}
