'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, MessageCircle, Package, CreditCard, Truck, RotateCcw, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    items: [
      {
        q: '¿Cómo realizo un pedido?',
        a: 'Navega por nuestro catálogo, elige el producto y la talla, agrégalo al carrito y procede al checkout. Necesitas una cuenta registrada para completar la compra.',
      },
      {
        q: '¿Puedo modificar mi pedido después de realizarlo?',
        a: 'Puedes solicitar modificaciones mientras el pedido esté en estado "Pendiente". Una vez confirmado o procesado, no es posible modificarlo. Contáctanos de inmediato si necesitas hacer cambios.',
      },
      {
        q: '¿Cómo cancelo mi pedido?',
        a: 'Los pedidos pueden cancelarse dentro de las primeras 2 horas después de realizarlos, siempre que no hayan pasado a estado "Procesando". Escríbenos por WhatsApp o email para gestionar la cancelación.',
      },
      {
        q: '¿Recibiré un comprobante de mi pedido?',
        a: 'Sí, recibirás un correo de confirmación con el resumen de tu pedido. Puedes ver el estado en cualquier momento desde "Mis pedidos" en tu cuenta.',
      },
      {
        q: '¿Qué pasa si un producto se agota después de mi pedido?',
        a: 'En caso de que un producto no esté disponible después de que realizaste tu pedido, te contactaremos para ofrecerte una alternativa o proceder con el reembolso completo.',
      },
    ],
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: CreditCard,
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) mediante Stripe, Mercado Pago (con meses sin intereses disponibles) y transferencias SPEI.',
      },
      {
        q: '¿Mis datos bancarios están seguros?',
        a: 'Absolutamente. No almacenamos datos de tarjetas. Los pagos con tarjeta se procesan a través de Stripe con encriptación SSL. Los datos nunca pasan directamente por nuestros servidores.',
      },
      {
        q: '¿Cómo funciona el pago por SPEI?',
        a: 'Al elegir SPEI, recibirás una CLABE interbancaria única, una referencia y el monto exacto a transferir. Tienes 72 horas para realizar la transferencia. Una vez recibida (puede tardar hasta 1 hora), tu pedido se confirma automáticamente.',
      },
      {
        q: '¿Hay meses sin intereses?',
        a: 'Sí, disponibles con Mercado Pago para compras con tarjetas participantes. Las condiciones pueden variar según tu banco emisor. Consulta las opciones disponibles al momento del pago.',
      },
      {
        q: '¿Puedo pagar en efectivo?',
        a: 'Actualmente no ofrecemos pago en efectivo en línea. Sin embargo, si visitas nuestra tienda física en Pachuca, puedes pagar en efectivo directamente.',
      },
    ],
  },
  {
    id: 'envios',
    label: 'Envíos',
    icon: Truck,
    items: [
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El envío es GRATIS en compras mayores a $3,000 MXN. Para pedidos entre $1,500 y $2,999 MXN el envío cuesta $99 MXN. Pedidos menores a $1,500 MXN tienen un costo de $149 MXN.',
      },
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: 'Depende del monto y tu ubicación: 1-2 días hábiles en compras +$3,000, 2-3 días para $1,500-$2,999, y 3-5 días para pedidos menores. Los envíos se procesan en días hábiles.',
      },
      {
        q: '¿A qué estados envían?',
        a: 'Hacemos envíos a todo México. Contamos con cobertura especial de entrega rápida en Hidalgo, CDMX y Querétaro. Para otros estados, el tiempo puede variar entre 3-7 días hábiles.',
      },
      {
        q: '¿Cómo rastro mi pedido?',
        a: 'Una vez que tu pedido sea enviado, recibirás un número de rastreo por correo. También puedes verlo en la sección "Mis pedidos" de tu cuenta.',
      },
      {
        q: '¿Qué paquetería utilizan?',
        a: 'Trabajamos con las principales paqueterías de México: FedEx, DHL y Estafeta, eligiendo siempre la opción más rápida y segura para tu zona.',
      },
    ],
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones',
    icon: RotateCcw,
    items: [
      {
        q: '¿Cuál es su política de devoluciones?',
        a: 'Aceptamos devoluciones dentro de los 7 días naturales posteriores a la recepción del producto, siempre que el artículo esté sin usar, en su caja original y con todas las etiquetas.',
      },
      {
        q: '¿Cómo inicio una devolución?',
        a: 'Contáctanos por WhatsApp o email con tu número de pedido y el motivo de devolución. Te guiaremos en el proceso y te proporcionaremos la guía de envío de regreso.',
      },
      {
        q: '¿El envío de devolución tiene costo?',
        a: 'Si el producto presenta un defecto de fabricación o enviamos el artículo incorrecto, cubrimos el costo de envío de regreso. Para cambios por talla u otros motivos, el envío corre por cuenta del cliente.',
      },
      {
        q: '¿Cuánto tarda el reembolso?',
        a: 'Una vez recibido y verificado el producto devuelto (3-5 días hábiles), procesamos el reembolso. El tiempo en reflejarse depende de tu banco: 3-10 días hábiles para tarjetas, inmediato para saldo MP.',
      },
      {
        q: '¿Puedo cambiar por otra talla?',
        a: 'Sí, hacemos cambios de talla sujeto a disponibilidad. Si la talla deseada no está disponible, procederemos con el reembolso o podrás elegir otro modelo.',
      },
    ],
  },
  {
    id: 'tallas',
    label: 'Tallas',
    icon: Ruler,
    items: [
      {
        q: '¿Cómo sé qué talla elegir?',
        a: 'Cada producto cuenta con una guía de tallas en su ficha. En general, recomendamos elegir tu talla habitual. Algunos modelos como los Air Force 1 tienden a ser amplios, en cuyo caso se indica en la descripción.',
      },
      {
        q: '¿Sus tallas son en sistema americano, europeo o mexicano?',
        a: 'Manejamos principalmente tallas en sistema americano (US) para hombre y mujer. En la ficha de cada producto encontrarás una tabla de conversión a tallas europeas y mexicanas.',
      },
      {
        q: '¿Qué hago si estoy entre dos tallas?',
        a: 'Generalmente recomendamos ir con la talla mayor si estás entre dos opciones, especialmente en calzado de running. Para sneakers de estilo, puedes quedarte con tu talla habitual. ¡No dudes en preguntarnos!',
      },
      {
        q: '¿Los productos para mujer tienen tallas diferentes?',
        a: 'Sí. Para productos unisex en tallas de mujer, generalmente se recomienda bajar 1.5 tallas respecto a la talla masculina. Cada producto lo especifica claramente.',
      },
      {
        q: '¿Puedo cambiar la talla si me quedó chica o grande?',
        a: 'Sí, dentro de los 7 días y siempre que el producto no haya sido usado. El proceso es el mismo que una devolución normal. Contáctanos para coordinarlo.',
      },
    ],
  },
]

function FaqItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('border border-brand-border rounded-xl overflow-hidden transition-colors', open && 'border-brand-accent/40')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-4 sm:p-5 text-left hover:bg-brand-elevated transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-sm sm:text-base leading-snug">{item.q}</span>
        <ChevronDown className={cn('w-5 h-5 text-brand-muted flex-shrink-0 mt-0.5 transition-transform duration-200', open && 'rotate-180 text-brand-accent')} />
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-brand-border">
          <p className="text-brand-muted text-sm leading-relaxed pt-4">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const query = search.toLowerCase()
  const filtered = FAQ_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
    ),
  })).filter((s) => s.items.length > 0)

  const sectionsToShow = search ? filtered : (
    activeSection
      ? FAQ_SECTIONS.filter((s) => s.id === activeSection)
      : FAQ_SECTIONS
  )

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <div className="relative py-20 border-b border-brand-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="font-display font-black text-4xl sm:text-5xl mb-4">Centro de ayuda</h1>
          <p className="text-brand-muted text-lg mb-8">
            Encuentra respuestas rápidas a las preguntas más frecuentes.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveSection(null) }}
              placeholder="Buscar en el FAQ..."
              className="w-full bg-brand-surface border border-brand-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section tabs */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveSection(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                !activeSection
                  ? 'bg-brand-accent border-brand-accent text-white'
                  : 'border-brand-border text-brand-muted hover:text-white hover:border-brand-accent'
              )}
            >
              Todos
            </button>
            {FAQ_SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id === activeSection ? null : s.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                    activeSection === s.id
                      ? 'bg-brand-accent border-brand-accent text-white'
                      : 'border-brand-border text-brand-muted hover:text-white hover:border-brand-accent'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              )
            })}
          </div>
        )}

        {/* FAQ sections */}
        <div className="space-y-10">
          {sectionsToShow.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-brand-muted mx-auto mb-3" />
              <p className="font-semibold text-lg mb-1">Sin resultados</p>
              <p className="text-brand-muted text-sm">No encontramos nada para &ldquo;{search}&rdquo;. Intenta con otras palabras.</p>
            </div>
          ) : (
            sectionsToShow.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-brand-accent" />
                    </div>
                    <h2 className="font-display font-bold text-xl">{section.label}</h2>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <FaqItem key={item.q} item={item} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-brand-surface border border-brand-border rounded-2xl p-8 text-center">
          <MessageCircle className="w-10 h-10 text-brand-accent mx-auto mb-3" />
          <h2 className="font-display font-black text-2xl mb-2">¿No encontraste tu respuesta?</h2>
          <p className="text-brand-muted mb-6 max-w-md mx-auto">
            Nuestro equipo está disponible para ayudarte. Escríbenos y te respondemos a la brevedad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/527717000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1aab4e] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chatear por WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-brand-border text-white px-6 py-3 rounded-xl font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              Enviar mensaje
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
