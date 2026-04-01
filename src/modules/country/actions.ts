'use server'

import { createClient } from '@/lib/supabase/server'
import { Country } from '@/types'

export async function getCountries() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data || data.length === 0) {
    console.warn('⚠️ Fetching countries from Supabase failed or table is empty. Returning mock regions for preview.')
    return [
      { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', name: 'United Kingdom', is_active: true },
      { id: 'b2c3d4e5-f6a7-4b5c-8d9e-1f2a3b4c5d6e', name: 'United States', is_active: true },
      { id: 'c3d4e5f6-a7b8-4c5d-8e9f-2a3b4c5d6e7f', name: 'Europe', is_active: true },
      { id: 'd4e5f6a7-b8c9-4d5e-8f9a-3b4c5d6e7f8a', name: 'India', is_active: true },
      { id: 'e5f6a7b8-c9d0-4e5f-9a0b-4c5d6e7f8a9b', name: 'International', is_active: true },
    ] as Country[]
  }

  return data as Country[]
}
