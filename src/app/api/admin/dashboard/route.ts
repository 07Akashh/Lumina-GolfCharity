import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCharities } from '@/modules/charity/actions'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [
      { count: totalSubs },
      { count: activeSubs },
      { data: draws },
      { data: winners },
      charities,
      { data: profiles },
      { data: allSubscriptions }
    ] = await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('winners').select('*, profiles(full_name, email), draws(type, prize_pool_total)').order('created_at', { ascending: false }),
      getCharities(),
      supabase.from('profiles').select('*, scores(value, created_at)').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
    ])

    return NextResponse.json({
      stats: { totalSubs, activeSubs, draws: draws || [], recentWinners: winners?.slice(0, 10) || [] },
      charities: charities || [],
      profiles: profiles || [],
      winners: winners || [],
      subscriptions: allSubscriptions || []
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin dashboard' }, { status: 500 })
  }
}
