'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/modules/admin/audit'

export async function adminUpdateScore(scoreId: string, newValue: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Auth check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()
    
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized')

    // Get current value for audit
    const { data: current } = await supabase.from('scores').select('*').eq('id', scoreId).single()

    const { error } = await supabase
        .from('scores')
        .update({ value: newValue })
        .eq('id', scoreId)

    if (error) return { error: error.message }

    await logAuditAction('UPDATE_SCORE', 'scores', scoreId, { old_val: current.value, new_val: newValue })
    revalidatePath('/admin')
    return { success: true }
}

export async function adminDeleteScore(scoreId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', scoreId)

    if (error) return { error: error.message }

    await logAuditAction('DELETE_SCORE', 'scores', scoreId)
    revalidatePath('/admin')
    return { success: true }
}
