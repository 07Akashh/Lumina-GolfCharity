'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { scoreSchema } from '@/lib/validations'
import { getLimits } from '@/lib/plan-limits'

export async function addScore(value: number, date: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Validation
  const validated = scoreSchema.safeParse({ value, date })
  if (!validated.success) return { error: 'Invalid score or date format. Value must be 1-45.' }

  // 1. Fetch user subscription plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub || sub.status !== 'active') {
    return { error: 'Active subscription required to add draw nodes.' }
  }

  // 2. Enforce per-plan node limit
  const limits = getLimits(sub.plan)
  const { count: currentNodeCount } = await supabase
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((currentNodeCount ?? 0) >= limits.maxScoreNodes) {
    return {
      error: `Node limit reached. Your ${limits.label} plan allows ${limits.maxScoreNodes} active score nodes. Upgrade to add more.`
    }
  }

  // 3. Call the PL/pgSQL function that handles rotation
  const { error } = await supabase.rpc('add_score', {
    score_val: value,
    score_date: date,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/user')
  return { success: true }
}

export async function getRecentScores() {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) return []

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.user.id)
    .order('score_date', { ascending: false })
    .limit(5)

  if (error) {
    console.warn('⚠️ Recent scores fetch failed (check table existence). Returning [].')
    return []
  }
  return data || []
}
