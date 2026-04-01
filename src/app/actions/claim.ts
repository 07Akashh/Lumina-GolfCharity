'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitClaim(winnerId: string, formData: {
  amount: number;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  charityId: string;
  contribution: number;
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Authentication required.')

  // 1. Verify KYC Record Node directly (Source of Truth)
  const { data: kycRecord } = await supabase
    .from('kyc_records')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (kycRecord?.status !== 'verified') {
    throw new Error(`Identity verification state is '${kycRecord?.status || 'not initialized'}'. Documentation must be 'verified' by an Admin.`)
  }

  // Check if a claim already exists for this winner
  const { data: existingClaim } = await supabase
    .from('claims')
    .select('id')
    .eq('winner_id', winnerId)
    .maybeSingle()

  const payload = {
    winner_id: winnerId,
    user_id: user.id,
    amount: formData.amount,
    account_details: {
      bank_name: formData.bankName,
      account_number: formData.accountNumber,
      routing_number: formData.routingNumber
    },
    charity_id: formData.charityId,
    contribution_percentage: formData.contribution,
    status: 'pending'
  }

  // 2. Insert or Update Independent Claim Node
  let claimId;
  if (existingClaim) {
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .update(payload)
      .eq('id', existingClaim.id)
      .select()
      .single()
    if (claimError) throw new Error('Failed to update claim.')
    claimId = claim.id
  } else {
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert(payload)
      .select()
      .single()
    if (claimError) throw new Error('Failed to persist redistribution claim Node.')
    claimId = claim.id
  }

  // 3. Update Winner record to 'under_review'
  await supabase
    .from('winners')
    .update({ status: 'claimed' })
    .eq('id', winnerId)

  revalidatePath('/user')
  revalidatePath('/admin')
  
  return { success: true, claimId }
}

export async function saveClaimChunk(winnerId: string, chunkData: {
  banking?: { bankName: string; accountNumber: string; routingNumber: string; amount: number };
  impact?: { charityId: string; contribution: number };
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  const { data: existingClaim } = await supabase
    .from('claims')
    .select('*')
    .eq('winner_id', winnerId)
    .maybeSingle()
    
  // 1. Fetch Profile for contribution default
  const { data: profile } = await supabase
    .from('profiles')
    .select('contribution_percentage')
    .eq('id', user.id)
    .single()

  const payload: {
    user_id: string;
    winner_id: string;
    status: string;
    contribution_percentage?: number;
    account_details?: {
      bank_name: string;
      account_number: string;
      routing_number: string;
    };
    amount?: number;
    charity_id?: string;
  } = {
    user_id: user.id,
    winner_id: winnerId,
    status: existingClaim ? existingClaim.status : 'draft',
    contribution_percentage: existingClaim?.contribution_percentage || profile?.contribution_percentage || 10
  }
  
  if (chunkData.banking) {
    payload.account_details = {
       bank_name: chunkData.banking.bankName,
       account_number: chunkData.banking.accountNumber,
       routing_number: chunkData.banking.routingNumber
    }
    payload.amount = chunkData.banking.amount
  }
  
  if (chunkData.impact) {
    payload.charity_id = chunkData.impact.charityId
    payload.contribution_percentage = chunkData.impact.contribution
  }

  if (existingClaim) {
    const { error } = await supabase.from('claims').update(payload).eq('id', existingClaim.id)
    if (error) throw new Error(`Persistence Error: ${error.message}`)
  } else {
    const { error } = await supabase.from('claims').insert(payload)
    if (error) throw new Error(`Draft Creation Error: ${error.message}`)
  }
  
  revalidatePath('/claims', 'layout')
  return { success: true }
}
