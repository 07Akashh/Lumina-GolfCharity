import { createClient } from './server'
import { cache } from 'react'
import { redirect } from 'next/navigation'

/**
 * Cached version of getUser to avoid redundant database calls 
 * within the same request lifecycle (e.g., layout + page).
 */
export const getAuthUser = cache(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/**
 * Essential check for protected routes.
 * Case-insensitive role check to prevent infinite redirect loops.
 */
export const requireAuth = async (targetRole?: 'USER' | 'ADMIN') => {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login')
  }

  if (targetRole) {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role?.toUpperCase()
    
    if (userRole !== targetRole) {
      // If attempting to access admin as a standard user...
      if (targetRole === 'ADMIN') {
        redirect('/user')
      }
      // If attempting to access user as an admin...
      if (targetRole === 'USER' && userRole === 'ADMIN') {
        // We actually might want to allow admins to see user metrics,
        // but if strict separation is desired:
        redirect('/admin')
      }
    }
  }

  return user
}

/**
 * Get user profile with caching.
 */
export const getAuthProfile = cache(async () => {
  const user = await getAuthUser()
  if (!user) return null

  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, charities(*), countries(*)')
    .eq('id', user.id)
    .single()

  return profile
})

/**
 * Ensures user has an active subscription for core protected features.
 */
export const requireSubscription = async () => {
  const user = await requireAuth('USER')
  const supabase = createClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()
    
  if (!sub || sub.status !== 'active') {
    redirect('/register')
  }
  return user
}
