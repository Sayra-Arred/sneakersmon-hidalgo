'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useEffect, useRef, useState } from 'react'
import { MapPin, Truck, Clock, CheckCircle2, XCircle, HelpCircle, ChevronDown, Package, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Coverage data ───────────────────────────────────────────────────────────

const COVERAGE_ZONES = [
  {
    id: 'hidalgo',
    name: 'Hidalgo',
    color: '#FF5A1F',
    cities: ['Pachuca', 'Tulancingo', 'Tizayuca', 'Ixmiquilpan', 'Actopan', 'Mineral de la Reforma'],
    deliveryTime: '1–2 días hábiles',
    cost: 'GRATIS en compras +$2,500',
    costBasic: '$99',
    center: [-98.7329, 20.1011] as [number, number],
    zoom: 8,
  },
  {
    id: 'cdmx',
    name: 'Ciudad de México',
    color: '#D4AF37',
    cities: ['Toda la CDMX', 'Zona Metropolitana'],
    deliveryTime: '2–3 días hábiles',
    cost: 'GRATIS en compras +$3,000',
    costBasic: '$149',
    center: [-99.1332, 19.4326] as [number, number],
    zoom: 10,
  },
  {
    id: 'queretaro',
    name: 'Querétaro',
    color: '#34C759',
    cities: ['Querétaro', 'San Juan del Río', 'El Marqués', 'Corregidora'],
    deliveryTime: '2–4 días hábiles',
    cost: 'GRATIS en compras +$3,500',
    costBasic: '$149',
    center: [-100.3899, 20.5888] as [number, number],
    zoom: 9,
  },
]

const COVERED_POSTAL_CODES: Record<string, string> = {
  '42': 'Hidalgo',
  '43': 'Hidalgo',
  '06': 'Ciudad de México',
  '07': 'Ciudad de México',
  '08': 'Ciudad de México',
  '09': 'Ciudad de México',
  '10': 'Ciudad de México',
  '11': 'Ciudad de México',
  '12': 'Ciudad de México',
  '13': 'Ciudad de México',
  '14': 'Ciudad de México',
  '15': 'Ciudad de México',
  '16': 'Ciudad de México',
  '76': 'Querétaro',
  '77': 'Querétaro',
}

const FAQ = [
  {
    q: '¿Cuánto tarda mi pedido en llegar?',
    a: 'El tiempo de entrega varía según tu zona. Hidalgo: 1–2 días hábiles. CDMX y Querétaro: 2–4 días hábiles. Recibirás un número de seguimiento por correo cuando tu pedido sea enviado.',
  },
  {
    q: '¿Cómo funciona el envío gratis?',
    a: 'El envío es gratis automáticamente cuando tu pedido supera el monto mínimo de tu zona. Hidalgo: +$2,500 MXN, CDMX: +$3,000 MXN, Querétaro: +$3,500 MXN.',
  },
  {
    q: '¿Puedo rastrear mi pedido?',
    a: 'Sí. Una vez que tu pedido sea enviado recibirás un correo electrónico con el número de guía y el enlace para rastrear tu envío en tiempo real.',
  },
  {
    q: '¿Hacen entregas a domicilio o solo a sucursal?',
    a: 'Realizamos entrega directa a tu domicilio dentro de las zonas de cobertura. No necesitas ir a ninguna sucursal.',
  },
  {
    q: '¿Qué pasa si no estoy en casa al momento de la entrega?',
    a: 'El paquetero dejará un aviso. Puedes contactar a la paquetería para reprogramar la entrega o recoger en su centro de distribución más cercano.',
  },
  {
    q: '¿Envían a toda la República Mexicana?',
    a: 'Actualmente nuestro servicio de entrega directa cubre Hidalgo, CDMX y Querétaro. Estamos expandiendo nuestra cobertura. ¡Síguenos en redes para enterarte primero!',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-brand-border last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-base text-white pr-4">{q}</span>
        <ChevronDown
          className={cn('w-5 h-5 text-brand-muted shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-96 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-brand-muted leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

function MapPlaceholder({ activeZone }: { activeZone: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-brand-elevated">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-brand-border flex items-center justify-center">
          <MapPin className="w-12 h-12 text-brand-accent" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-success animate-ping" />
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-success" />
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-white text-lg">
          {activeZone === 'all' ? 'Zonas de Cobertura' : COVERAGE_ZONES.find(z => z.id === activeZone)?.name ?? ''}
        </p>
        <p className="text-brand-muted text-sm mt-1">
          Hidalgo · CDMX · Querétaro
        </p>
      </div>
      <p className="text-xs text-brand-muted/60 font-mono px-6 text-center">
        Configura NEXT_PUBLIC_MAPBOX_TOKEN<br />para activar el mapa interactivo
      </p>
    </div>
  )
}

export default function DeliveryPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const [activeZone, setActiveZone] = useState('all')
  const [postalCode, setPostalCode] = useState('')
  const [postalResult, setPostalResult] = useState<null | { covered: boolean; zone?: string }>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Try to load Mapbox
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !mapContainerRef.current) return

    let map: { remove: () => void; flyTo: (opts: unknown) => void } | null = null

    import('mapbox-gl').then((mapboxgl) => {
      const Mapbox = mapboxgl.default
      Mapbox.accessToken = token

      map = new Mapbox.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-99.5, 20.2],
        zoom: 6.5,
        attributionControl: false,
      }) as typeof map

      ;(map as unknown as { on: (event: string, cb: () => void) => void }).on('load', () => {
        setMapLoaded(true)
        mapRef.current = map
      })
    }).catch(() => {
      // Mapbox not available, show placeholder
    })

    return () => {
      map?.remove()
    }
  }, [])

  function handleZoneClick(zoneId: string) {
    setActiveZone(zoneId)
    const zone = COVERAGE_ZONES.find(z => z.id === zoneId)
    if (zone && mapRef.current) {
      (mapRef.current as { flyTo: (opts: unknown) => void }).flyTo({
        center: zone.center,
        zoom: zone.zoom,
        duration: 1200,
        essential: true,
      })
    }
  }

  function checkPostalCode() {
    const cp = postalCode.trim()
    if (cp.length !== 5) return
    const prefix = cp.substring(0, 2)
    const zone = COVERED_POSTAL_CODES[prefix]
    setPostalResult(zone ? { covered: true, zone } : { covered: false })
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <section className="relative border-b border-brand-border bg-brand-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,90,31,0.06)_0%,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <p className="text-brand-accent font-mono text-xs tracking-[0.3em] mb-4 uppercase">
            Entrega directa
          </p>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight mb-6">
            COBERTURA
          </h1>
          <p className="text-brand-muted text-lg max-w-xl">
            Llevamos tus sneakers directamente a la puerta de tu casa en Hidalgo, CDMX y Querétaro.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Map + Zone selector */}
        <section className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-brand-border bg-brand-elevated" style={{ minHeight: 420 }}>
            <div ref={mapContainerRef} className="absolute inset-0" />
            {!mapLoaded && <MapPlaceholder activeZone={activeZone} />}
          </div>

          {/* Zones list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display font-black text-2xl tracking-tight mb-5">Zonas cubiertas</h2>
            {COVERAGE_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={cn(
                  'w-full text-left bg-brand-elevated border rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]',
                  activeZone === zone.id ? 'border-brand-accent/60 shadow-[0_0_24px_rgba(255,90,31,0.1)]' : 'border-brand-border'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="font-display font-black text-lg tracking-tight">{zone.name}</span>
                </div>
                <div className="space-y-1.5 ml-6">
                  <div className="flex items-center gap-2 text-sm text-brand-muted">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {zone.deliveryTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-muted">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    {zone.cost}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {zone.cities.slice(0, 3).map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border text-brand-muted font-mono">
                        {c}
                      </span>
                    ))}
                    {zone.cities.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border text-brand-muted font-mono">
                        +{zone.cities.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Coverage table */}
        <section>
          <h2 className="font-display font-black text-3xl tracking-tight mb-8">Detalles de envío</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-elevated">
                  <th className="text-left px-6 py-4 font-semibold text-brand-muted tracking-wide uppercase text-xs">Zona</th>
                  <th className="text-left px-6 py-4 font-semibold text-brand-muted tracking-wide uppercase text-xs">Ciudades</th>
                  <th className="text-left px-6 py-4 font-semibold text-brand-muted tracking-wide uppercase text-xs">Tiempo</th>
                  <th className="text-left px-6 py-4 font-semibold text-brand-muted tracking-wide uppercase text-xs">Costo base</th>
                  <th className="text-left px-6 py-4 font-semibold text-brand-muted tracking-wide uppercase text-xs">Envío gratis</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE_ZONES.map((zone, i) => (
                  <tr
                    key={zone.id}
                    className={cn('border-b border-brand-border last:border-0', i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-elevated')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                        <span className="font-semibold text-white">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      {zone.cities.join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-white">{zone.deliveryTime}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold" style={{ color: zone.color }}>{zone.costBasic}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-success font-semibold text-xs">
                      {zone.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Postal code checker */}
        <section className="bg-brand-elevated border border-brand-border rounded-2xl p-8 md:p-12">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-brand-accent" />
              <h2 className="font-display font-black text-2xl tracking-tight">Verificar cobertura</h2>
            </div>
            <p className="text-brand-muted mb-8">
              Ingresa tu código postal para saber si llegamos a tu domicilio.
            </p>

            <div className="flex gap-3">
              <Input
                label="Código postal"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="Ej: 42000"
                value={postalCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setPostalCode(val)
                  if (postalResult) setPostalResult(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && checkPostalCode()}
                className="flex-1"
              />
              <Button
                type="button"
                variant="primary"
                onClick={checkPostalCode}
                disabled={postalCode.length !== 5}
                className="mt-[26px] shrink-0"
              >
                Verificar
              </Button>
            </div>

            {postalResult && (
              <div
                className={cn(
                  'mt-5 flex items-start gap-3 p-4 rounded-xl border',
                  postalResult.covered
                    ? 'bg-brand-success/10 border-brand-success/30 text-brand-success'
                    : 'bg-brand-error/10 border-brand-error/30 text-brand-error'
                )}
              >
                {postalResult.covered ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  {postalResult.covered ? (
                    <>
                      <p className="font-semibold">¡Cubierto!</p>
                      <p className="text-sm opacity-80 mt-0.5">
                        Tu código postal cae en la zona de{' '}
                        <strong>{postalResult.zone}</strong>. Podemos entregarte ahí.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Fuera de cobertura por ahora</p>
                      <p className="text-sm opacity-80 mt-0.5">
                        Estamos expandiéndonos. Síguenos en redes para saber cuándo llegamos a tu zona.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features grid */}
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Package className="w-6 h-6 text-brand-accent" />,
              title: 'Empaque seguro',
              desc: 'Cada par llega en caja original con empaque adicional de protección para evitar daños.',
            },
            {
              icon: <Shield className="w-6 h-6 text-brand-gold" />,
              title: 'Garantía de autenticidad',
              desc: 'Todos los productos son 100% auténticos. Incluimos certificado de autenticidad.',
            },
            {
              icon: <Truck className="w-6 h-6 text-brand-success" />,
              title: 'Seguimiento en tiempo real',
              desc: 'Recibe actualizaciones por email y SMS en cada paso del proceso de envío.',
            },
          ].map((feat) => (
            <div key={feat.title} className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-display font-bold text-base tracking-tight">{feat.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-6 h-6 text-brand-muted" />
            <h2 className="font-display font-black text-3xl tracking-tight">Preguntas frecuentes</h2>
          </div>

          <div className="bg-brand-elevated border border-brand-border rounded-2xl px-6 md:px-8 divide-y-0">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
