import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { 
  DashboardData, 
  WinnerRecord, 
  LeaderboardEntry, 
  Profile 
} from '@/types/dashboard'
import { getLimits, resolvePlan } from '@/lib/plan-limits'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()

  try {
    // 1. Concurrent System Sync
    const [
      { data: profileRaw },
      { data: subscription },
      { data: personalWinnings },
      { data: charities },
      { data: scores },
      { data: participantsHistory },
      { data: nextDraw },
      { data: authUser }
    ] = await Promise.all([
      supabase.from('profiles').select('*, charities:charity_id(*)').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('winners').select('*, draws(*)').eq('user_id', user.id),
      supabase.from('charities').select('*').eq('is_active', true).limit(5),
      supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
      supabase.from('draw_participants').select('*, draws(numbers, published_at)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('draws').select('published_at').eq('status', 'scheduled').order('published_at', { ascending: true }).limit(1).maybeSingle(),
      adminClient.auth.admin.getUserById(user.id)
    ])

    // 2. Profile Normalization (Identity Fallback for Bio/Phone/Comms)
    // full_name fallback: DB → Auth metadata → email prefix
    const profile = {
      ...profileRaw,
      full_name: profileRaw?.full_name 
        || authUser?.user?.user_metadata?.full_name 
        || authUser?.user?.email?.split('@')[0] 
        || null,
      bio: profileRaw?.bio || authUser?.user?.user_metadata?.bio || '',
      phone: profileRaw?.phone || authUser?.user?.user_metadata?.phone || '',
      comm_alerts: profileRaw?.comm_alerts ?? true,
      comm_weekly: profileRaw?.comm_weekly ?? true,
      comm_network: profileRaw?.comm_network ?? false
    } as Profile

    // 3. Narrative & Strategic Assets
    const impactStories = (charities || []).map(ch => ({
      id: ch.id,
      title: ch.name || 'Impact Partner',
      category: 'Verified Partner',
      description: ch.description || 'Global humanitarian node.'
    }))

    // 4. Global Leaderboard Assembly (Excluding Admins)
    const { data: communityProfiles } = await adminClient
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'USER')
      .limit(10)

    const { data: allWinners } = await adminClient.from('winners').select('user_id, prize_amount')
    const { data: allScores } = await adminClient.from('scores').select('user_id, value')

    const topWinners: LeaderboardEntry[] = (communityProfiles || []).map(p => {
      const pWins = (allWinners || []).filter(w => w.user_id === p.id)
      const pScores = (allScores || []).filter(s => s.user_id === p.id)
      const totalAmount = pWins.reduce((acc, w) => acc + Number(w.prize_amount || 0), 0)
      const avgScore = pScores.length > 0 
        ? (pScores.reduce((acc, s) => acc + Number(s.value || 0), 0) / pScores.length) 
        : 0
      
      const firstName = p.full_name?.split(' ')[0] || 'Member'
      const lastName = p.full_name?.split(' ')[1] || ''

      return {
        name: lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName,
        amount: totalAmount,
        type: totalAmount > 0 
          ? `${pWins.length} Wins • ${avgScore.toFixed(1)} Avg` 
          : `Active Node • ${avgScore.toFixed(1)} Score`,
        date: p.created_at
      }
    }).sort((a, b) => b.amount - a.amount)

    // 5. Impact Metrics Construction
    const winHistory = (personalWinnings || []) as WinnerRecord[]
    const totalWon = winHistory.reduce((acc, w) => acc + (w.status === 'paid' ? Number(w.prize_amount) : 0), 0)
    const donatedAmount = (totalWon * (profile?.contribution_percentage || 10)) / 100
    const totalLivesImpacted = Math.floor(donatedAmount * 1.42)

    // 6. Unified Payload Assembly
    const payload: DashboardData = {
      profile,
      subscription,
      stats: {
        totalWon,
        totalDonated: donatedAmount,
        totalLivesImpacted,
        activeSubs: 1,
        charityName: profile?.charities?.name || 'Global Humanitarian Fund',
        selectedCharity: profile?.charities || null
      },
      scores: (scores || []).map(s => ({ value: s.value, id: s.id })),
      scoreDates: (scores || []).map(s => s.score_date),
      winnings: winHistory.map(w => ({
        id: w.id,
        prize_amount: Number(w.prize_amount),
        status: w.status,
        created_at: w.created_at,
        type: w.draws?.type
      })),
      history: (participantsHistory || []).map(h => ({
        id: h.id,
        draw_numbers: h.draws?.numbers || [],
        user_numbers: h.numbers,
        date: h.draws?.published_at
      })),
      ledger: winHistory.map(w => ({
        partner_name: 'Lumina Pool Distribution',
        created_at: w.created_at,
        amount: Number(w.prize_amount),
        allocation_type: w.draws?.type || 'Distribution',
        status: w.status.toUpperCase() || 'PAID'
      })),
      topWinners,
      nextDraw: nextDraw?.published_at || null,
      charities: (charities || []),
      stories: impactStories.map(s => ({
        ...s,
        image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80'
      })),
      planLimits: getLimits(subscription?.plan),
      planId: resolvePlan(subscription?.plan),
    }

    return NextResponse.json(payload)

  } catch (error) {
    console.error('❌ Dashboard API Error:', error)
    return NextResponse.json({ error: 'Critical system synchronization failure.' }, { status: 500 })
  }
}
