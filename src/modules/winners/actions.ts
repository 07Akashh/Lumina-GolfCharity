'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWinnerProof(winnerId: string, proofUrl: string) {
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

    // Status 'pending' means the draw engine created the win but proof isn't uploaded yet.
    if (!winner || winner.status !== 'pending') {
        return { error: 'Invalid claim state. This prize may have already been claimed or verified.' }
    }

    const { error } = await supabase
        .from('winners')
        .update({ 
            status: 'claimed', // Transition to claimed status for admin review
            proof_url: proofUrl
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
