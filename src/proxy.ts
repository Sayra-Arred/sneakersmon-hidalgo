import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login?callbackUrl=/admin/dashboard', req.url))
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  const protectedPaths = ['/account', '/orders', '/checkout', '/wishlist']
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    if (!session) return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
