// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(20).max(2000),
})

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { name, email, subject, message } = body.data

  await sendEmail({
    to: process.env.CONTACT_EMAIL ?? 'hola@sneakersmon.mx',
    subject: `[Contacto] ${subject} — ${name}`,
    html: `<!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:Inter,Arial,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto">
      <div style="font-size:20px;font-weight:900;color:#FF5A1F;letter-spacing:2px;margin-bottom:24px">SNEAKERSMON HIDALGO</div>
      <h2 style="color:#fff;margin-bottom:8px">Nuevo mensaje de contacto</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#8E8E93;border-bottom:1px solid #1c1c1e;width:120px">Nombre</td><td style="padding:8px 0;border-bottom:1px solid #1c1c1e">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#8E8E93;border-bottom:1px solid #1c1c1e">Email</td><td style="padding:8px 0;border-bottom:1px solid #1c1c1e"><a href="mailto:${email}" style="color:#FF5A1F">${email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#8E8E93;border-bottom:1px solid #1c1c1e">Asunto</td><td style="padding:8px 0;border-bottom:1px solid #1c1c1e">${subject}</td></tr>
      </table>
      <div style="background:#121212;border:1px solid #1c1c1e;border-radius:8px;padding:16px;line-height:1.6;white-space:pre-wrap">${message}</div>
      <p style="color:#48484a;font-size:12px;margin-top:32px">© 2026 SneakersMon Hidalgo</p>
    </body></html>`,
  })

  return NextResponse.json({ success: true })
}
