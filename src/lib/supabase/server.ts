import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'

export const createClient = () => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component context
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Component context
          }
        },
      },
    }
  )
}

// Admin client that bypasses RLS for background tasks like webhooks
export const createAdminClient = () => {
  return createSupabaseClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
