import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const rateLimitMap = new Map<string, { count: number, reset: number }>()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function proxy(request: NextRequest) {
  // 1. Rate Limiting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const now = Date.now()
  const windowMs = 60000 
  const maxReq = 60 
  
  const current = rateLimitMap.get(ip) || { count: 0, reset: now + windowMs }
  if (now > current.reset) {
    current.count = 1
    current.reset = now + windowMs
  } else {
    current.count++
  }
  rateLimitMap.set(ip, current)

  if (current.count > maxReq && request.nextUrl.pathname.startsWith('/api')) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // 2. Session Update & Auth Logic
  let response = await updateSession(request)

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Routing & Protection Logic
  const isUserRoute = request.nextUrl.pathname.startsWith('/user')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isClaimsRoute = request.nextUrl.pathname.startsWith('/claims')
  const isPurchasePage = request.nextUrl.pathname.startsWith('/purchase')

  console.log(`📡 [Proxy Entry] Path: ${request.nextUrl.pathname} | User: ${user?.email || 'Guest'}`)

  // Auth Protection (Basic Existence)
  if (!user && (isUserRoute || isAdminRoute || isPurchasePage || isClaimsRoute)) {
    console.log(`🔒 Guest attempted restricted path: ${request.nextUrl.pathname}. Redirecting to /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // NOTE: Role and Subscription checks are now handled in the respective Layouts (Server Components)
  // for better performance and caching.

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
