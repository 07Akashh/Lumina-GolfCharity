import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'No user' })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ 
    user: user.email, 
    id: user.id,
    subscription: sub || 'None found' 
  })
}
