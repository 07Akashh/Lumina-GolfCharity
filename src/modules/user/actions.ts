'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContributionPercentage(percentage: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  if (percentage < 10) return { error: 'Minimum contribution is 10%.' }

  const { error } = await supabase
    .from('profiles')
    .update({ contribution_percentage: percentage })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/user')
  return { success: true }
}

export async function updateSelectedCharity(charityId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ charity_id: charityId })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/user')
  return { success: true }
}
