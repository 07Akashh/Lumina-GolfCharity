'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitKYC(formData: {
  fullName: string;
  phone: string;
  dob?: string;
  id_number?: string;
  address: string;
  id_front_url: string;
  w9_form_url: string;
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Authentication required.')

  // 1. Create KYC record
  const { error: kycError } = await supabase
    .from('kyc_records')
    .upsert({
      user_id: user.id,
      full_name: formData.fullName,
      phone: formData.phone,
      dob: formData.dob || null,
      id_number: formData.id_number || null,
      address: formData.address,
      id_front_url: formData.id_front_url,
      w9_form_url: formData.w9_form_url,
      status: 'pending'
    }, { onConflict: 'user_id' })

  if (kycError) {
    console.error('KYC Error:', kycError)
    throw new Error('Failed to submit KYC records.')
  }

  // 2. Update profile status
  await supabase
    .from('profiles')
    .update({ kyc_status: 'pending' })
    .eq('id', user.id)

  revalidatePath('/user')
  revalidatePath('/claims', 'layout')
  return { success: true }
}
