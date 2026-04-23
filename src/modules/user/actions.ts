'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContributionPercentage(percentage: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized Operation Access.')

  if (percentage < 10) return { error: 'Node Constraint Failure: Minimum contribution is 10%.' }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ contribution_percentage: percentage })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Percentage Update Failure:', error)
      return { error: 'Systemic synchronization failure during ratio update.' }
    }

    revalidatePath('/user')
    return { success: true }
  } catch (err) {
    console.error('❌ Critical Action Crash (Percentage):', err)
    return { error: 'Critical system failure encountered.' }
  }
}

export async function updateSelectedCharity(charityId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized Operation Access.')

  try {
    // Update charity_id to match database schema
    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Charity Selection Failure:', error)
      return { error: 'Failed to synchronize philanthropic node selection.' }
    }

    revalidatePath('/user')
    return { success: true }
  } catch (err) {
    console.error('❌ Critical Action Crash (Charity):', err)
    return { error: 'Critical connection loss during node selection.' }
  }
}
