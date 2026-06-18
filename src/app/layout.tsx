import type { Metadata } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  weight: ['600', '700', '800', '900'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://sneakersmon.mx'),
  title: {
    template: '%s | SNEAKERSMON HIDALGO',
    default: 'SNEAKERSMON HIDALGO — Sneakers Premium',
  },
  description:
    'La tienda definitiva de sneakers premium en Hidalgo, CDMX y Querétaro. Drops exclusivos, ediciones limitadas y entrega directa.',
  keywords: ['sneakers', 'tenis', 'premium', 'Nike', 'Jordan', 'Adidas', 'Hidalgo', 'México'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'SNEAKERSMON HIDALGO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sneakersmon',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-brand-black text-brand-white antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#121212',
                color: '#fff',
                border: '1px solid #1c1c1e',
                borderRadius: '10px',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
