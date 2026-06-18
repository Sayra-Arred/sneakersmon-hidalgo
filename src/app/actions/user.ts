// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { addressSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import bcryptjs from 'bcryptjs'
import type { ActionResult } from '@/types'

export async function updateProfile(data: { name: string; phone?: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: data.name, phone: data.phone },
  })

  revalidatePath('/account')
  return { success: true }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { success: false, error: 'Cuenta OAuth — no tiene contraseña' }

  const valid = await bcryptjs.compare(data.currentPassword, user.password)
  if (!valid) return { success: false, error: 'Contraseña actual incorrecta' }

  const hashed = await bcryptjs.hash(data.newPassword, 12)
  await db.user.update({ where: { id: session.user.id }, data: { password: hashed } })
  return { success: true }
}

export async function createAddress(data: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const parsed = addressSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const address = await db.address.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  revalidatePath('/account/addresses')
  return { success: true, data: address }
}

export async function updateAddress(id: string, data: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const parsed = addressSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return { success: false, error: 'Dirección no encontrada' }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false },
    })
  }

  await db.address.update({ where: { id }, data: parsed.data })
  revalidatePath('/account/addresses')
  return { success: true }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return { success: false, error: 'Dirección no encontrada' }

  await db.address.delete({ where: { id } })
  revalidatePath('/account/addresses')
  return { success: true }
}

export async function registerForDrop(
  dropId: string,
  options: { notifyEmail: boolean; notifyWhatsapp: boolean }
): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const existing = await db.dropRegistration.findUnique({
    where: { dropId_userId: { dropId, userId: session.user.id } },
  })
  if (existing) return { success: false, error: 'Ya estás registrado para este drop' }

  await db.dropRegistration.create({
    data: {
      dropId,
      userId: session.user.id,
      email: session.user.email,
      notifyEmail: options.notifyEmail,
      notifyWhatsapp: options.notifyWhatsapp,
    },
  })

  return { success: true }
}
