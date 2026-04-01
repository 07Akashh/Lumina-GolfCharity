'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { scoreSchema } from '@/lib/validations'

export async function addScore(value: number) {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()

  if (!user.user) throw new Error('Not authenticated')

  // Validation
  const validated = scoreSchema.safeParse(value)
  if (!validated.success) return { error: 'Value must be between 1 and 45.' }

  // Call the PL/pgSQL function that handles rotation
  const { error } = await supabase.rpc('add_score', {
    score_val: value,
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
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.warn('⚠️ Recent scores fetch failed (check table existence). Returning [].')
    return []
  }
  return data || []
}
