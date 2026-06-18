// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { DropCountdown } from '@/components/store/drop-countdown'
import { formatDate } from '@/lib/utils'
import { CalendarDays, ChevronRight, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Drops',
  description: 'Próximos lanzamientos exclusivos y drops pasados de SNEAKERSMON HIDALGO.',
}

async function getDrops() {
  const now = new Date()

  const [upcoming, past] = await Promise.all([
    db.drop.findMany({
      where: { status: { in: ['UPCOMING', 'LIVE'] } },
      orderBy: { releaseDate: 'asc' },
      include: {
        _count: { select: { registrations: true } },
      },
    }),
    db.drop.findMany({
      where: { OR: [{ status: 'ENDED' }, { releaseDate: { lte: now }, status: 'LIVE' }] },
      orderBy: { releaseDate: 'desc' },
      take: 12,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
  ])

  return { upcoming, past }
}

export default async function DropsPage() {
  const { upcoming, past } = await getDrops()

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <section className="relative border-b border-brand-border bg-brand-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,31,0.08)_0%,transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <p className="text-brand-accent font-mono text-xs tracking-[0.3em] mb-4 uppercase">
            Lanzamientos Exclusivos
          </p>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight mb-6">
            DROPS
          </h1>
          <p className="text-brand-muted text-lg max-w-xl">
            Los lanzamientos más esperados directo a ti. Regístrate para asegurar tu par antes que nadie.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Upcoming Drops */}
        <section>
          <div className="flex items-baseline gap-4 mb-10">
            <h2 className="font-display font-black text-3xl tracking-tight">PRÓXIMOS DROPS</h2>
            {upcoming.length > 0 && (
              <span className="text-brand-muted font-mono text-sm">{upcoming.length} próximos</span>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-brand-elevated border border-brand-border rounded-2xl p-16 text-center">
              <CalendarDays className="w-12 h-12 text-brand-muted mx-auto mb-4" />
              <p className="text-brand-muted text-lg">No hay drops anunciados por ahora.</p>
              <p className="text-brand-muted/60 text-sm mt-1">Vuelve pronto para nuevos lanzamientos.</p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {upcoming.map((drop, index) => (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.slug}`}
                  className="group relative bg-brand-elevated border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,90,31,0.1)]"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-brand-surface">
                    {drop.coverImage ? (
                      <Image
                        src={drop.coverImage}
                        alt={drop.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-border to-brand-surface flex items-center justify-center">
                        <span className="font-display font-black text-4xl text-brand-border/60 tracking-widest">
                          DROP
                        </span>
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {drop.status === 'LIVE' && (
                        <Badge variant="accent" className="animate-pulse">LIVE</Badge>
                      )}
                      {drop.isExclusive && (
                        <Badge variant="gold" className="flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          EXCLUSIVO
                        </Badge>
                      )}
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-elevated via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-display font-black text-xl tracking-tight group-hover:text-brand-accent transition-colors line-clamp-1">
                        {drop.name}
                      </h3>
                      <p className="text-brand-muted text-sm mt-1 line-clamp-2">{drop.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-brand-muted">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{formatDate(drop.releaseDate, { dateStyle: 'full', timeStyle: 'short' })}</span>
                    </div>

                    <DropCountdown releaseDate={drop.releaseDate} />

                    <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                      <span className="text-xs text-brand-muted">
                        {drop._count.registrations} registrados
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-brand-accent group-hover:gap-2 transition-all">
                        Ver drop <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Past Drops */}
        {past.length > 0 && (
          <section>
            <div className="flex items-baseline gap-4 mb-10">
              <h2 className="font-display font-black text-3xl tracking-tight text-brand-muted">
                DROPS PASADOS
              </h2>
              <span className="text-brand-muted/60 font-mono text-sm">{past.length} registros</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {past.map((drop) => (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.slug}`}
                  className="group relative bg-brand-elevated border border-brand-border rounded-xl overflow-hidden hover:border-brand-border/80 transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden bg-brand-surface">
                    {drop.coverImage ? (
                      <Image
                        src={drop.coverImage}
                        alt={drop.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-border to-brand-surface" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <Badge variant="default" className="text-[10px]">ENDED</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm line-clamp-1 text-brand-muted group-hover:text-white transition-colors">
                      {drop.name}
                    </p>
                    <p className="text-xs text-brand-muted/60 mt-0.5">
                      {formatDate(drop.releaseDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
