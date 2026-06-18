import type { Metadata } from 'next'
import { Zap, Heart, Award, MapPin, Users, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce la historia de SNEAKERSMON HIDALGO, la tienda definitiva de sneakers premium en Hidalgo y el centro de México.',
}

const VALUES = [
  {
    icon: Award,
    title: 'Autenticidad garantizada',
    desc: 'Cada par pasa por un riguroso proceso de verificación. Cero fakes, cero compromisos.',
  },
  {
    icon: Heart,
    title: 'Pasión por la cultura',
    desc: 'Somos sneakerheads antes que vendedores. Vivimos y respiramos la cultura del calzado.',
  },
  {
    icon: TrendingUp,
    title: 'Drops exclusivos',
    desc: 'Acceso anticipado a los lanzamientos más esperados. Siempre los primeros en Hidalgo.',
  },
  {
    icon: MapPin,
    title: 'Raíces locales',
    desc: 'Nacimos en Pachuca con el sueño de traer lo mejor del streetwear a nuestra región.',
  },
]

const TEAM = [
  { name: 'Andrés Montoya', role: 'Fundador & CEO', initials: 'AM' },
  { name: 'Karla Ríos', role: 'Directora de Compras', initials: 'KR' },
  { name: 'Diego Luna', role: 'Brand & Marketing', initials: 'DL' },
  { name: 'Sofía Herrera', role: 'Atención al Cliente', initials: 'SH' },
]

const COVERAGE = [
  { city: 'Pachuca de Soto', zone: 'Hidalgo', delivery: '1-2 días' },
  { city: 'Tulancingo', zone: 'Hidalgo', delivery: '2-3 días' },
  { city: 'Ciudad de México', zone: 'CDMX', delivery: '1-2 días' },
  { city: 'Querétaro', zone: 'QRO', delivery: '2-3 días' },
  { city: 'Tizayuca', zone: 'Hidalgo', delivery: '2-3 días' },
  { city: 'Actopan', zone: 'Hidalgo', delivery: '3-4 días' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero editorial */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-brand-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-brand-gold/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 rounded-full px-4 py-1.5 text-brand-accent text-sm font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Desde 2019 en Hidalgo
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
            MÁS QUE UNA<br />
            <span className="text-brand-accent">TIENDA.</span>
          </h1>
          <p className="text-brand-muted text-xl max-w-2xl mx-auto leading-relaxed">
            SNEAKERSMON HIDALGO nació de una obsesión: llevar los mejores sneakers del mundo
            a las calles de Pachuca. Hoy somos el destino #1 de sneakers premium en el centro de México.
          </p>
        </div>
      </section>

      {/* Brand story */}
      <section className="py-20 border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display font-black text-4xl mb-6">
                Nuestra historia
              </h2>
              <div className="space-y-4 text-brand-muted leading-relaxed">
                <p>
                  Todo comenzó en 2019 cuando Andrés Montoya, fanático de los sneakers desde adolescente,
                  se dio cuenta de que en Hidalgo no existía una tienda especializada donde los verdaderos
                  entusiastas pudieran encontrar pares auténticos de alta gama.
                </p>
                <p>
                  Lo que empezó como una pequeña operación desde casa, con tres pares de Jordan 1 y
                  un perfil de Instagram, rápidamente se convirtió en la tienda más reconocida del estado.
                </p>
                <p>
                  Hoy contamos con showroom físico en el centro de Pachuca, más de 5,000 clientes satisfechos
                  y cobertura de entrega en tres estados. Pero seguimos siendo los mismos apasionados del día uno.
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '5,000+', label: 'Clientes felices' },
                { value: '200+', label: 'Modelos disponibles' },
                { value: '100%', label: 'Garantía de autenticidad' },
                { value: '3', label: 'Estados con cobertura' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-brand-surface border border-brand-border rounded-2xl p-6 text-center"
                >
                  <p className="font-display font-black text-3xl text-brand-accent">{stat.value}</p>
                  <p className="text-brand-muted text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-4xl mb-6">Nuestra misión</h2>
          <blockquote className="text-2xl sm:text-3xl font-bold text-brand-muted leading-relaxed max-w-3xl mx-auto">
            &ldquo;Democratizar el acceso a sneakers auténticos y premium para todos los
            <span className="text-white"> apasionados de la cultura</span> en el centro de México.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-black text-4xl text-center mb-12">Nuestros valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val) => {
              const Icon = val.icon
              return (
                <div
                  key={val.title}
                  className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-accent transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-accent" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{val.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{val.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Users className="w-6 h-6 text-brand-accent" />
            <h2 className="font-display font-black text-4xl text-center">El equipo</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-accent/10 border border-brand-border flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-black text-xl text-brand-accent">{member.initials}</span>
                </div>
                <p className="font-semibold text-sm">{member.name}</p>
                <p className="text-brand-muted text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-brand-accent" />
            <h2 className="font-display font-black text-4xl">Zonas de cobertura</h2>
          </div>
          <p className="text-brand-muted text-center mb-12 max-w-xl mx-auto">
            Llevamos tus sneakers hasta la puerta de tu casa en toda nuestra zona de cobertura.
            Envíos rápidos y seguros.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COVERAGE.map((zone) => (
              <div
                key={zone.city}
                className="bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{zone.city}</p>
                    <p className="text-brand-muted text-xs">{zone.zone}</p>
                    <p className="text-brand-accent text-xs mt-1 font-medium">{zone.delivery}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-brand-muted text-sm mt-6">
            ¿Tu ciudad no aparece?{' '}
            <a href="/contact" className="text-brand-accent hover:underline font-semibold">
              Contáctanos
            </a>
            {' '}para verificar disponibilidad.
          </p>
        </div>
      </section>
    </div>
  )
}
