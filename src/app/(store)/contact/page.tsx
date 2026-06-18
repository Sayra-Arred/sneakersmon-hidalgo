'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Clock, Phone, MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const SUBJECTS = [
  'Consulta sobre pedido',
  'Información de producto',
  'Devolución o cambio',
  'Pago y facturación',
  'Envío y entrega',
  'Otro',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>()

  async function onSubmit(data: ContactForm) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok || res.status === 200) {
        setSubmitted(true)
        reset()
        toast.success('Mensaje enviado correctamente')
      } else {
        toast.error('Error al enviar el mensaje. Intenta de nuevo.')
      }
    } catch {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <div className="relative py-20 border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="font-display font-black text-4xl sm:text-5xl mb-4">Contáctanos</h1>
          <p className="text-brand-muted text-lg max-w-xl mx-auto">
            Estamos aquí para ayudarte. Escríbenos, llámanos o visítanos en tienda.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/527717000000?text=Hola,%20me%20interesa%20un%20producto%20de%20SNEAKERSMON%20HIDALGO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-5 hover:bg-[#25D366]/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold">WhatsApp</p>
                <p className="text-brand-muted text-sm">+52 771 700 0000</p>
                <p className="text-[#25D366] text-xs mt-0.5 font-medium group-hover:underline">
                  Chatea con nosotros →
                </p>
              </div>
            </a>

            {/* Store info */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 space-y-4">
              <h2 className="font-bold text-lg">Nuestra tienda</h2>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Dirección</p>
                  <p className="text-brand-muted text-sm">
                    Av. Juárez 123, Col. Centro<br />
                    Pachuca de Soto, Hidalgo<br />
                    C.P. 42000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Horario</p>
                  <div className="text-brand-muted text-sm space-y-0.5">
                    <p>Lunes – Viernes: 10:00 – 20:00</p>
                    <p>Sábado: 10:00 – 19:00</p>
                    <p>Domingo: 11:00 – 17:00</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Teléfono</p>
                  <a href="tel:+527717000000" className="text-brand-muted text-sm hover:text-brand-accent transition-colors">
                    +52 771 700 0000
                  </a>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden h-52 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-elevated" />
              <div className="relative text-center z-10">
                <MapPin className="w-8 h-8 text-brand-accent mx-auto mb-2" />
                <p className="text-brand-muted text-sm">Pachuca de Soto, Hidalgo</p>
                <a
                  href="https://maps.google.com/?q=Pachuca+de+Soto+Hidalgo+Mexico"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-brand-accent text-xs hover:underline"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-success/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-brand-success" />
                  </div>
                  <h2 className="font-display font-black text-2xl mb-2">¡Mensaje enviado!</h2>
                  <p className="text-brand-muted max-w-sm">
                    Recibimos tu mensaje. Te responderemos a la brevedad posible, generalmente en menos de 24 horas.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-black text-2xl mb-6">Envíanos un mensaje</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-brand-muted mb-1.5">Nombre completo *</label>
                        <input
                          {...register('name', { required: 'Campo requerido' })}
                          className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
                          placeholder="Tu nombre"
                        />
                        {errors.name && <p className="text-brand-error text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-brand-muted mb-1.5">Email *</label>
                        <input
                          {...register('email', {
                            required: 'Campo requerido',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                          })}
                          type="email"
                          className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
                          placeholder="tu@email.com"
                        />
                        {errors.email && <p className="text-brand-error text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-brand-muted mb-1.5">Asunto *</label>
                      <select
                        {...register('subject', { required: 'Selecciona un asunto' })}
                        className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors text-white"
                      >
                        <option value="" className="bg-brand-elevated">Selecciona un asunto</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s} className="bg-brand-elevated">{s}</option>
                        ))}
                      </select>
                      {errors.subject && <p className="text-brand-error text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-brand-muted mb-1.5">Mensaje *</label>
                      <textarea
                        {...register('message', {
                          required: 'Campo requerido',
                          minLength: { value: 20, message: 'El mensaje debe tener al menos 20 caracteres' },
                        })}
                        rows={5}
                        className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted resize-none"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                      {errors.message && <p className="text-brand-error text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
                      <Send className="w-4 h-4" />
                      {isLoading ? 'Enviando...' : 'Enviar mensaje'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
