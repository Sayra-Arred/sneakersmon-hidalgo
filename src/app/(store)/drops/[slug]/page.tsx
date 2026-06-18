// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { DropCountdown } from '@/components/store/drop-countdown'
import { DropRegistrationForm } from '@/components/store/drop-registration-form'
import { formatDate, formatPrice } from '@/lib/utils'
import { CalendarDays, Users, Lock, Tag, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'
interface Props {
  params: Promise<{ slug: string }>
}

async function getDrop(slug: string) {
  const drop = await db.drop.findUnique({
    where: { slug },
    include: {
      _count: { select: { registrations: true } },
    },
  })
  return drop
}

async function getDropProducts(productIds: string[]) {
  if (!productIds.length) return []
  return db.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      brand: { select: { name: true, slug: true } },
    },
    take: 12,
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const drop = await getDrop(slug)
  if (!drop) return { title: 'Drop no encontrado' }
  return {
    title: drop.name,
    description: drop.description.substring(0, 160),
    openGraph: {
      title: `${drop.name} | SNEAKERSMON HIDALGO`,
      description: drop.description.substring(0, 160),
      images: drop.coverImage ? [{ url: drop.coverImage }] : [],
    },
  }
}

export default async function DropDetailPage({ params }: Props) {
  const { slug } = await params
  const drop = await getDrop(slug)

  if (!drop) notFound()

  const products = await getDropProducts(drop.productIds)
  const isLive = drop.status === 'LIVE'
  const isEnded = drop.status === 'ENDED'
  const isUpcoming = drop.status === 'UPCOMING'

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero cover */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden bg-brand-surface">
        {drop.coverImage ? (
          <Image
            src={drop.coverImage}
            alt={drop.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-border to-brand-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />

        {/* Back link */}
        <div className="absolute top-6 left-6">
          <Link
            href="/drops"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Todos los drops
          </Link>
        </div>

        {/* Status badges */}
        <div className="absolute top-6 right-6 flex gap-2">
          {isLive && <Badge variant="accent" className="animate-pulse text-sm px-3 py-1">LIVE</Badge>}
          {isEnded && <Badge variant="default" className="text-sm px-3 py-1">FINALIZADO</Badge>}
          {isUpcoming && <Badge variant="outline" className="border-brand-accent text-brand-accent text-sm px-3 py-1">PRÓXIMO</Badge>}
          {drop.isExclusive && (
            <Badge variant="gold" className="flex items-center gap-1 text-sm px-3 py-1">
              <Lock className="w-3 h-3" />
              EXCLUSIVO
            </Badge>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-brand-muted text-sm mb-3">
            <CalendarDays className="w-4 h-4" />
            {formatDate(drop.releaseDate, { dateStyle: 'full', timeStyle: 'short' })}
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg">
            {drop.name}
          </h1>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div>
              <h2 className="font-display font-black text-2xl tracking-tight mb-4">Acerca de este drop</h2>
              <p className="text-brand-muted leading-relaxed text-lg whitespace-pre-line">
                {drop.description}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-brand-accent mx-auto mb-2" />
                <p className="font-mono font-semibold text-xl text-white">{drop._count.registrations}</p>
                <p className="text-xs text-brand-muted mt-0.5">Registrados</p>
              </div>
              {drop.price && (
                <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 text-center">
                  <Tag className="w-5 h-5 text-brand-accent mx-auto mb-2" />
                  <p className="font-mono font-semibold text-xl text-white">
                    {formatPrice(Number(drop.price))}
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">Precio estimado</p>
                </div>
              )}
              {drop.maxPerUser && (
                <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 text-center">
                  <Lock className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                  <p className="font-mono font-semibold text-xl text-white">{drop.maxPerUser}</p>
                  <p className="text-xs text-brand-muted mt-0.5">Máx por usuario</p>
                </div>
              )}
              <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 text-center">
                <CalendarDays className="w-5 h-5 text-brand-muted mx-auto mb-2" />
                <p className="font-mono font-semibold text-sm text-white">
                  {formatDate(drop.releaseDate)}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">Fecha de lanzamiento</p>
              </div>
            </div>

            {/* Products in this drop */}
            {products.length > 0 && (
              <div>
                <h2 className="font-display font-black text-2xl tracking-tight mb-6">
                  Productos en este drop
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const primaryImage = product.images[0]?.url ?? null
                    return (
                      <Link
                        key={product.id}
                        href={`/catalog/${product.slug}`}
                        className="group bg-brand-elevated border border-brand-border rounded-xl overflow-hidden hover:border-brand-accent/40 transition-colors"
                      >
                        <div className="relative aspect-square overflow-hidden bg-brand-surface">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(min-width: 640px) 33vw, 50vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-brand-border/30" />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-brand-muted">{product.brand.name}</p>
                          <p className="font-semibold text-sm line-clamp-1 mt-0.5 group-hover:text-brand-accent transition-colors">
                            {product.name}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Countdown + Registration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              {/* Countdown card */}
              {!isEnded && (
                <div className="bg-brand-elevated border border-brand-border rounded-2xl p-6 mb-6">
                  <p className="text-xs font-semibold tracking-widest text-brand-muted uppercase mb-4">
                    {isLive ? 'Disponible ahora' : 'Disponible en'}
                  </p>
                  <DropCountdown releaseDate={drop.releaseDate} />
                </div>
              )}

              {/* Registration form */}
              {!isEnded ? (
                <div className="bg-brand-elevated border border-brand-border rounded-2xl p-6">
                  <h3 className="font-display font-black text-lg tracking-tight mb-1">
                    {isLive ? 'Compra ahora' : 'Regístrate para el drop'}
                  </h3>
                  <p className="text-brand-muted text-sm mb-6">
                    {isLive
                      ? 'El drop está activo. Asegura tu par antes de que se agote.'
                      : 'Recibe notificación cuando abra el drop. ¡Los cupos son limitados!'}
                  </p>
                  <DropRegistrationForm dropId={drop.id} isLive={isLive} />
                </div>
              ) : (
                <div className="bg-brand-elevated border border-brand-border rounded-2xl p-6 text-center">
                  <p className="text-brand-muted font-semibold mb-2">Este drop ha finalizado</p>
                  <p className="text-brand-muted/60 text-sm mb-4">
                    Mantente al tanto de próximos lanzamientos.
                  </p>
                  <Link
                    href="/drops"
                    className="text-brand-accent text-sm font-semibold hover:underline"
                  >
                    Ver próximos drops
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
