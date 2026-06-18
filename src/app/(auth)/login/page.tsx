'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Correo o contraseña incorrectos')
      return
    }

    toast.success('¡Bienvenido de vuelta!')
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      toast.error('Error al iniciar sesión con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">
            Iniciar sesión
          </h1>
          <p className="text-brand-muted text-sm">
            ¿No tienes cuenta?{' '}
            <Link
              href={`/register${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="text-brand-accent font-semibold hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full mb-6"
          isLoading={googleLoading}
          onClick={handleGoogle}
          leftIcon={!googleLoading && <Globe className="w-4 h-4" />}
        >
          Continuar con Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-xs text-brand-muted font-medium">O con correo</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            {...register('email')}
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white">Contraseña</label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-muted hover:text-brand-accent transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña"
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
            {errors.password && (
              <p className="text-sm text-brand-error">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Iniciar sesión
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-brand-muted mt-6">
        Al iniciar sesión aceptas nuestros{' '}
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
