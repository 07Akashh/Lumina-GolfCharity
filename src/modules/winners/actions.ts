'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimPrize(winnerId: string, proofUrl: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify ownership and status
    const { data: winner } = await supabase
        .from('winners')
        .select('*')
        .eq('id', winnerId)
        .eq('user_id', user.id)
        .single()

    if (!winner || winner.status !== 'won') {
        return { error: 'Invalid claim state.' }
    }

    const { error } = await supabase
        .from('winners')
        .update({ 
            status: 'pending', // Awaiting verification
            proof_url: proofUrl,
            claimed_at: new Date().toISOString()
        })
        .eq('id', winnerId)

    if (error) return { error: error.message }

    revalidatePath('/user')
    revalidatePath(`/user/claims/${winnerId}`)
    return { success: true }
}

export async function getWinnerDetails(winnerId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('winners')
        .select('*, draws(*)')
        .eq('id', winnerId)
        .eq('user_id', user.id)
        .single()

    if (error) return null
    return data
}
