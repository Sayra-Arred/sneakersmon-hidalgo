// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'SNEAKERSMON HIDALGO <noreply@sneakersmon.mx>',
    to,
    subject,
    html,
  })
}

const BASE_STYLE = `
  body { margin: 0; padding: 0; background: #000; font-family: Inter, Arial, sans-serif; color: #fff; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .logo { font-size: 20px; font-weight: 900; color: #FF5A1F; letter-spacing: 2px; margin-bottom: 32px; }
  .title { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 16px; }
  .text { font-size: 16px; color: #8E8E93; line-height: 1.6; margin-bottom: 16px; }
  .accent { color: #FF5A1F; font-weight: 600; }
  .btn { display: inline-block; background: #FF5A1F; color: #fff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 24px 0; }
  .divider { border: none; border-top: 1px solid #1c1c1e; margin: 24px 0; }
  .footer { font-size: 12px; color: #48484a; margin-top: 40px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 12px; border-bottom: 1px solid #1c1c1e; font-size: 14px; }
  .price { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; }
`

export function orderConfirmationEmail(order: {
  orderNumber: string
  total: number
  items: Array<{ name: string; size: string; quantity: number; price: number }>
}): string {
  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="color:#fff">${item.name}</td>
          <td style="color:#8E8E93">T. ${item.size} × ${item.quantity}</td>
          <td class="price" style="text-align:right">$${(item.price * item.quantity).toLocaleString('es-MX')}</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html><html><head><style>${BASE_STYLE}</style></head><body>
    <div class="container">
      <div class="logo">SNEAKERSMON HIDALGO</div>
      <div class="title">¡Pedido confirmado!</div>
      <p class="text">Tu pedido <span class="accent">${order.orderNumber}</span> ha sido recibido y está siendo procesado.</p>
      <table>${rows}</table>
      <hr class="divider"/>
      <p style="text-align:right;font-size:18px;font-weight:700">Total: <span class="price">$${order.total.toLocaleString('es-MX')} MXN</span></p>
      <div class="footer">© 2026 SneakersMon Hidalgo. Todos los derechos reservados.</div>
    </div>
  </body></html>`
}

export function restockAlertEmail(product: {
  name: string
  size: string
  url: string
}): string {
  return `<!DOCTYPE html><html><head><style>${BASE_STYLE}</style></head><body>
    <div class="container">
      <div class="logo">SNEAKERSMON HIDALGO</div>
      <div class="title">¡De vuelta en stock!</div>
      <p class="text"><span class="accent">${product.name}</span> en talla <span class="accent">${product.size}</span> está disponible nuevamente.</p>
      <a href="${product.url}" class="btn">Comprar ahora</a>
      <div class="footer">© 2026 SneakersMon Hidalgo. Todos los derechos reservados.</div>
    </div>
  </body></html>`
}

export function dropReminderEmail(drop: {
  name: string
  releaseDate: Date
  url: string
}): string {
  const date = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' }).format(
    new Date(drop.releaseDate)
  )
  return `<!DOCTYPE html><html><head><style>${BASE_STYLE}</style></head><body>
    <div class="container">
      <div class="logo">SNEAKERSMON HIDALGO</div>
      <div class="title">Drop mañana: ${drop.name}</div>
      <p class="text">El lanzamiento de <span class="accent">${drop.name}</span> es el <span class="accent">${date}</span>. Prepárate.</p>
      <a href="${drop.url}" class="btn">Ver Drop</a>
      <div class="footer">© 2026 SneakersMon Hidalgo. Todos los derechos reservados.</div>
    </div>
  </body></html>`
}

export function passwordResetEmail(resetUrl: string): string {
  return `<!DOCTYPE html><html><head><style>${BASE_STYLE}</style></head><body>
    <div class="container">
      <div class="logo">SNEAKERSMON HIDALGO</div>
      <div class="title">Restablecer contraseña</div>
      <p class="text">Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
      <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
      <p class="text" style="font-size:13px">Si no solicitaste esto, ignora este correo.</p>
      <div class="footer">© 2026 SneakersMon Hidalgo. Todos los derechos reservados.</div>
    </div>
  </body></html>`
}
