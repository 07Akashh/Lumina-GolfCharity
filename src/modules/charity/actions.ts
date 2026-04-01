'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const charitySchema = z.object({
  name: z.string().min(2, 'Name is required to exceed 2 characters.'),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function getCharities() {
  const supabase = createClient()
  const { data, error } = await supabase.from('charities').select('*').order('name')
  
  if (error || !data || data.length === 0) {
     console.warn('⚠️ Fetching charities failed or table is empty. Returning mock network.')
     return [
       { id: 'f1a2b3c4-d5e6-4f5a-bc9d-1234567890ab', name: 'World Wide Life Fund', is_active: true, country_id: 'e5f6a7b8-c9d0-4e5f-9a0b-4c5d6e7f8a9b' },
       { id: 'a2b3c4d5-e6f7-4a5b-8c9d-1234567890bc', name: 'UNICEF (Global)', is_active: true, country_id: 'e5f6a7b8-c9d0-4e5f-9a0b-4c5d6e7f8a9b' },
       { id: 'b3c4d5e6-f7a8-4b5c-9d0e-1234567890cd', name: 'International Red Cross', is_active: true, country_id: 'e5f6a7b8-c9d0-4e5f-9a0b-4c5d6e7f8a9b' },
     ]
  }

  return data
}

export async function createCharity(formData: FormData) {
  const supabase = createClient()
  const validated = charitySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    websiteUrl: formData.get('websiteUrl') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Invalid charity properties.' }
  }

  const { name, description, websiteUrl, imageUrl } = validated.data

  const { error } = await supabase.from('charities').insert({
    name,
    description,
    website_url: websiteUrl,
    image_url: imageUrl,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/charities')
}

export async function toggleCharityStatus(id: string, currentStatus: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('charities').update({ is_active: !currentStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/admin/charities')
}

export async function deleteCharity(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('charities').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/admin/charities')
}
