'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveWinner(winnerId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Role verification
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized access')

    // State verification
    const { data: winner } = await supabase.from('winners').select('*').eq('id', winnerId).single()
    if (!winner || winner.status !== 'pending' || !winner.proof_url) {
        return { error: 'Invalid verification state or missing proof.' }
    }

    const { error } = await supabase
        .from('winners')
        .update({ 
            status: 'paid', 
            verified_by: user.id, 
            verified_at: new Date().toISOString() 
        })
        .eq('id', winnerId)

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/winners')
    return { success: true }
}

export async function rejectWinner(winnerId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Role verification
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized access')

    const { error } = await supabase
        .from('winners')
        .update({ status: 'rejected' })
        .eq('id', winnerId)

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/winners')
    return { success: true }
}

export async function markWinnerPaid(winnerId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized access')

    const { error } = await supabase
        .from('winners')
        .update({ status: 'dispensed' })
        .eq('id', winnerId)

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/winners')
    return { success: true }
}

export async function updateUserRole(targetUserId: string, newRole: 'USER' | 'ADMIN' | 'SUSPENDED') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized access')

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true }
}
