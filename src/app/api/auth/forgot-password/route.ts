// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { sendEmail, passwordResetEmail } from '@/lib/email'
import { absoluteUrl } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null

    if (!email) {
      return NextResponse.json({ error: 'Correo electrónico requerido' }, { status: 400 })
    }

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return NextResponse.json({ success: true })
    }

    // Invalidate previous tokens
    await db.passwordResetToken.deleteMany({ where: { email } })

    const token = nanoid(48)
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await db.passwordResetToken.create({
      data: { email, token, expires },
    })

    const resetUrl = absoluteUrl(`/reset-password?token=${token}`)

    await sendEmail({
      to: email,
      subject: 'Restablecer contraseña — SNEAKERSMON HIDALGO',
      html: passwordResetEmail(resetUrl),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
