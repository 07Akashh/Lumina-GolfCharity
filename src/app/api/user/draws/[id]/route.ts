import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [
      { data: draw },
      { data: winners }
    ] = await Promise.all([
      supabase.from('draws').select('*').eq('id', id).single(),
      supabase.from('winners')
        .select('*, profiles(full_name, email)')
        .eq('draw_id', id)
        .order('match_count', { ascending: false })
    ])

    if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })

    // Anonymize winners for the leaderboard
    const leaderboard = (winners || []).map(w => ({
      name: (w.profiles as any)?.full_name 
          ? ((w.profiles as any).full_name.split(' ')[0] + ' ' + (w.profiles as any).full_name.split(' ')[1]?.charAt(0) + '.')
          : 'Anonymous Node',
      match_count: w.match_count,
      prize_amount: w.prize_amount,
      status: w.status
    }))

    return NextResponse.json({
      draw: {
        id: draw.id,
        numbers: draw.numbers,
        prize_pool: draw.prize_pool_total,
        type: draw.type,
        published_at: draw.published_at
      },
      leaderboard
    })
  } catch (err) {
    console.error('Draw Details API Error:', err)
    return NextResponse.json({ error: 'Failed to synchronize draw nodes' }, { status: 500 })
  }
}
