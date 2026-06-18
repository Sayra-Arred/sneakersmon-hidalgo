'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DropCountdownProps {
  releaseDate: Date
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function calculateTimeLeft(releaseDate: Date): TimeLeft {
  const now = Date.now()
  const target = releaseDate.getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isExpired: false }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

interface TimeUnitProps {
  value: number
  label: string
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="bg-brand-elevated border border-brand-border rounded-lg px-3 py-2 min-w-[64px] text-center">
        <span className="font-mono text-3xl font-semibold text-brand-accent tabular-nums">
          {pad(value)}
        </span>
      </div>
      <span className="text-[10px] font-semibold tracking-widest text-brand-muted uppercase">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <div className="flex flex-col items-center gap-1.5 self-start pt-3">
      <span className="font-mono text-2xl font-bold text-brand-muted select-none">:</span>
    </div>
  )
}

export function DropCountdown({ releaseDate, className }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(releaseDate))

  useEffect(() => {
    if (timeLeft.isExpired) return

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(releaseDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [releaseDate, timeLeft.isExpired])

  if (timeLeft.isExpired) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success" />
        </span>
        <span className="font-display font-black text-xl tracking-widest text-brand-success">
          LIVE NOW
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TimeUnit value={timeLeft.days} label="Días" />
      <Separator />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <Separator />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <Separator />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  )
}
