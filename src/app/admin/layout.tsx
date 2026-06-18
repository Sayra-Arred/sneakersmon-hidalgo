// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | Admin — SNEAKERSMON HIDALGO', default: 'Admin — SNEAKERSMON HIDALGO' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect('/login?callbackUrl=/admin/dashboard')
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') redirect('/')

  return (
    <div className="flex h-dvh bg-brand-black overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
