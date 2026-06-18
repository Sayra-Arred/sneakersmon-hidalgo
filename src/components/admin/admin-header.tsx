'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { signOut } from 'next-auth/react'
import { LogOut, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface AdminHeaderProps {
  user: { name?: string | null; email: string; role: string }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-14 bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 shrink-0">
      <div />

      <div className="flex items-center gap-3">
        <button
          aria-label="Notificaciones"
          className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white text-xs font-bold"
            aria-hidden="true"
          >
            {getInitials(user.name ?? user.email)}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white leading-none">{user.name ?? user.email}</div>
            <div className="text-[11px] text-brand-muted mt-0.5">{user.role}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Cerrar sesión"
          className="p-2 text-brand-muted hover:text-brand-error transition-colors rounded-lg hover:bg-brand-elevated"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
