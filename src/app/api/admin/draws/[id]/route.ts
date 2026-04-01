import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

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

    return NextResponse.json({
      draw,
      winners: winners || []
    })
  } catch (err) {
    console.error('Admin Draw Details API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
