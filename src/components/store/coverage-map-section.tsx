'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useEffect, useRef } from 'react'
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react'

const COVERAGE_ZONES = [
  {
    name: 'Hidalgo',
    icon: '🏔️',
    eta: '1-2 días hábiles',
    highlight: true,
    description: 'Cobertura completa del estado',
  },
  {
    name: 'CDMX',
    icon: '🏙️',
    eta: '1 día hábil',
    highlight: false,
    description: 'Todas las alcaldías',
  },
  {
    name: 'Querétaro',
    icon: '🌿',
    eta: '2-3 días hábiles',
    highlight: false,
    description: 'Zona metropolitana',
  },
]

const SHIPPING_TIERS = [
  { label: 'Compras +$3,000 MXN', value: 'GRATIS', accent: true },
  { label: 'Compras $1,500–$2,999', value: '$99 MXN', accent: false },
  { label: 'Compras menores a $1,500', value: '$149 MXN', accent: false },
]

// Coverage polygon coordinates (simplified, approximate centers)
const COVERAGE_FEATURES = [
  {
    id: 'hidalgo',
    name: 'Hidalgo',
    center: [-98.7, 20.1] as [number, number],
    color: '#FF5A1F',
    opacity: 0.35,
    // Very simplified bounding polygon
    coordinates: [
      [-99.3, 20.6],
      [-98.0, 20.6],
      [-97.8, 20.0],
      [-98.0, 19.6],
      [-99.0, 19.6],
      [-99.3, 20.0],
      [-99.3, 20.6],
    ],
  },
  {
    id: 'cdmx',
    name: 'CDMX',
    center: [-99.13, 19.43] as [number, number],
    color: '#D4AF37',
    opacity: 0.4,
    coordinates: [
      [-99.36, 19.6],
      [-98.94, 19.6],
      [-98.94, 19.18],
      [-99.36, 19.18],
      [-99.36, 19.6],
    ],
  },
  {
    id: 'queretaro',
    name: 'Querétaro',
    center: [-100.39, 20.6] as [number, number],
    color: '#8E8E93',
    opacity: 0.3,
    coordinates: [
      [-100.9, 21.1],
      [-99.7, 21.1],
      [-99.5, 20.1],
      [-100.3, 19.9],
      [-100.9, 20.4],
      [-100.9, 21.1],
    ],
  },
]

function MapboxMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled || !mapRef.current) return

      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-99.2, 20.1],
        zoom: 6.2,
        interactive: true,
        attributionControl: false,
      })

      mapInstanceRef.current = map

      map.on('load', () => {
        COVERAGE_FEATURES.forEach((zone) => {
          // Add source
          map.addSource(zone.id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [zone.coordinates],
              },
              properties: { name: zone.name },
            },
          })

          // Fill layer
          map.addLayer({
            id: `${zone.id}-fill`,
            type: 'fill',
            source: zone.id,
            paint: {
              'fill-color': zone.color,
              'fill-opacity': zone.opacity,
            },
          })

          // Outline layer
          map.addLayer({
            id: `${zone.id}-outline`,
            type: 'line',
            source: zone.id,
            paint: {
              'line-color': zone.color,
              'line-width': 2,
              'line-opacity': 0.8,
            },
          })

          // Marker at center
          const el = document.createElement('div')
          el.className = 'mapbox-marker'
          el.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${zone.color};
            border: 2px solid white;
            box-shadow: 0 0 0 4px ${zone.color}40;
          `
          new mapboxgl.Marker({ element: el }).setLngLat(zone.center).addTo(map)
        })
      })
    }).catch(() => {
      // Silently fail if mapbox-gl fails to load
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        const m = mapInstanceRef.current as { remove: () => void }
        m.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-[var(--radius-lg)] overflow-hidden"
      aria-label="Mapa de cobertura de entrega"
    />
  )
}

export function CoverageMapSection() {
  return (
    <section className="py-16 sm:py-24 bg-brand-surface border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-brand-accent" />
                <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">
                  Logística propia
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                ENTREGA PREMIUM<br />DIRECTA
              </h2>
              <p className="mt-4 text-brand-muted text-sm leading-relaxed max-w-md">
                Manejamos nuestra propia red de entrega para garantizar que tus sneakers lleguen en perfectas condiciones, sin intermediarios y con seguimiento en tiempo real.
              </p>
            </div>

            {/* Coverage zones */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold tracking-widest uppercase text-brand-muted flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Zonas cubiertas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COVERAGE_ZONES.map((zone) => (
                  <div
                    key={zone.name}
                    className={`flex flex-col gap-1.5 p-3 rounded-[var(--radius-md)] border ${
                      zone.highlight
                        ? 'border-brand-accent bg-brand-accent/5'
                        : 'border-brand-border bg-brand-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden="true">{zone.icon}</span>
                      <span
                        className={`text-sm font-bold ${
                          zone.highlight ? 'text-brand-accent' : 'text-white'
                        }`}
                      >
                        {zone.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-muted">{zone.description}</p>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-brand-gold">
                      <Clock className="w-3 h-3" />
                      {zone.eta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping tiers */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold tracking-widest uppercase text-brand-muted flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" />
                Costo de envío
              </h3>
              <div className="flex flex-col gap-2">
                {SHIPPING_TIERS.map((tier) => (
                  <div
                    key={tier.label}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-brand-elevated border border-brand-border"
                  >
                    <span className="text-sm text-brand-muted">{tier.label}</span>
                    <span
                      className={`text-sm font-bold ${
                        tier.accent ? 'text-brand-success' : 'text-white'
                      }`}
                    >
                      {tier.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div className="flex flex-col gap-2">
              {[
                'Empaque premium con caja de zapatos sellada',
                'Fotos del estado del producto antes de enviar',
                'Seguimiento en tiempo real por WhatsApp',
              ].map((perk) => (
                <div key={perk} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-brand-muted">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Map */}
          <div
            className="w-full rounded-[var(--radius-xl)] overflow-hidden border border-brand-border"
            style={{ height: '480px', background: '#0a0a0a' }}
          >
            <MapboxMap />
          </div>
        </div>
      </div>
    </section>
  )
}
