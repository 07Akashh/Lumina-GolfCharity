'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyKYC(userId: string, status: 'verified' | 'rejected', reason?: string) {
  const supabase = createClient()
  const { data: { user: admin } } = await supabase.auth.getUser()

  if (!admin) {
    console.error('VerifyKYC failed: No authenticated user session.')
    throw new Error('Unauthorized')
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', admin.id).single()
  
  if (profileError || profile?.role !== 'ADMIN') {
    console.error('VerifyKYC failed: Administrative clearance rejected.', {
      adminId: admin.id,
      role: profile?.role,
      error: profileError
    })
    throw new Error('Administrative clearance required.')
  }

  console.log(`VerifyKYC success: Authorizing node ${userId} as ${status}`)

  // 1. Update KYC Record
  const { error: kycError } = await supabase
    .from('kyc_records')
    .update({ 
      status, 
      rejection_reason: reason
    })
    .eq('user_id', userId)

  if (kycError) {
    console.error('VerifyKYC failed to update kyc_records:', kycError)
    throw new Error(`Failed to update KYC node: ${kycError.message}`)
  }

  // 2. Sync Profile
  const { error: profileSyncError } = await supabase
    .from('profiles')
    .update({ 
      kyc_status: status
    })
    .eq('id', userId)

  if (profileSyncError) {
    console.error('VerifyKYC failed to sync profile:', profileSyncError)
    throw new Error(`Failed to sync identity profile: ${profileSyncError.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/user')
  return { success: true }
}

export async function processClaim(claimId: string, status: 'approved' | 'rejected' | 'paid', notes?: string) {
  const supabase = createClient()
  const { data: { user: admin } } = await supabase.auth.getUser()

  if (!admin) throw new Error('Unauthorized')

  // 1. Fetch Claim details
  const { data: claim } = await supabase
    .from('claims')
    .select('*, winners(prize_amount)')
    .eq('id', claimId)
    .single()

  if (!claim) throw new Error('Claim node not found.')

  // 2. Update Claim Node
  const updateData: { status: 'approved' | 'rejected' | 'paid'; admin_notes?: string; processed_at?: string } = { 
    status, 
    admin_notes: notes 
  }
  
  if (status === 'paid') {
    updateData.processed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('claims')
    .update(updateData)
    .eq('id', claimId)

  if (updateError) {
    console.error('ProcessClaim update error:', updateError)
    throw new Error(`Failed to update claim state: ${updateError.message} (${updateError.code})`)
  }

  // 3. IF APPROVED: Reflect in user balance (Actual Logic)
  // This is a simplified version; in production use a DB Transaction or RPC
  if (status === 'approved') {
    const { data: userProfile } = await supabase.from('profiles').select('balance').eq('id', claim.user_id).single()
    const newBalance = (Number(userProfile?.balance || 0)) + (Number(claim.amount))
    
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', claim.user_id)
    
    // Also update the winner record to PAID (linked)
    await supabase.from('winners').update({ status: 'paid' }).eq('id', claim.winner_id)
  }

  revalidatePath('/admin')
  revalidatePath('/user')
  return { success: true }
}
