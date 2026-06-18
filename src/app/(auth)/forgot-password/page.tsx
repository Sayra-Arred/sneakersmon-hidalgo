'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const forgotSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
})

type ForgotInput = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotInput) {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error ?? 'Error al enviar el correo')
        return
      }

      setSentEmail(data.email)
      setSent(true)
    } catch {
      toast.error('Error inesperado. Intenta de nuevo.')
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
          <div className="w-20 h-20 rounded-full bg-brand-success/10 border border-brand-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-brand-success" />
          </div>

          <h1 className="font-display font-black text-2xl tracking-tight mb-3">
            Revisa tu correo
          </h1>

          <p className="text-brand-muted text-sm leading-relaxed mb-2">
            Si <span className="text-white font-medium">{sentEmail}</span> está registrado,
            recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>

          <p className="text-brand-muted/60 text-xs mb-8">
            El enlace expira en 1 hora. Revisa también tu carpeta de spam.
          </p>

          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setSent(false)
                setSentEmail('')
              }}
            >
              Reenviar correo
            </Button>

            <Link href="/login">
              <Button variant="ghost" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-brand-muted text-sm leading-relaxed">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
          >
            Enviar enlace de restablecimiento
          </Button>
        </form>

        <p className="text-xs text-brand-muted text-center mt-6">
          ¿Recuerdas tu contraseña?{' '}
          <Link href="/login" className="text-brand-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
