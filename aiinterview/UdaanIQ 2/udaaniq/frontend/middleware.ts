import { NextResponse, NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/favicon.ico',
]

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  // Allow Next.js internals and static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) return true
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Check for client-accessible auth cookie set after login
  const token = req.cookies.get('client_token')?.value
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api).*)'],
}


