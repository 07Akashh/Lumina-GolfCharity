'use server'

import { createClient } from '@/lib/supabase/server'
import { Draw } from '@/types'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/resend'

/**
 * Perform a weighted selection of 5 unique numbers based on frequency of user scores.
 */
function weightedSelection(counts: Record<number, number>, mode: 'most_frequent' | 'least_frequent' = 'most_frequent'): number[] {
  const numbers: number[] = []
  
  // Calculate max frequency for inverse weighting
  const maxFreq = Math.max(...Object.values(counts), 1)

  const candidates = Object.entries(counts).map(([num, freq]) => ({
    num: parseInt(num),
    weight: mode === 'most_frequent' ? (freq + 1) : (maxFreq - freq + 1)
  }))

  while (numbers.length < 5 && candidates.length > 0) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < candidates.length; i++) {
        random -= candidates[i].weight
        if (random <= 0) {
            numbers.push(candidates[i].num)
            candidates.splice(i, 1)
            break
        }
    }
  }

  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n)
  }

  return numbers
}

export async function simulateDraw(type: 'random' | 'algorithmic', mode: 'most_frequent' | 'least_frequent' = 'most_frequent') {
  const supabase = createClient()
  const cutoff = new Date().toISOString()

  let numbers: number[] = []
  if (type === 'random') {
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
  } else {
    const { data: scores } = await supabase
      .from('scores')
      .select('value, profiles!inner(role)')
      .eq('profiles.role', 'USER')
      .lte('created_at', cutoff)
    if (!scores || scores.length < 5) {
      while (numbers.length < 5) {
        const n = Math.floor(Math.random() * 45) + 1
        if (!numbers.includes(n)) numbers.push(n)
      }
    } else {
        const counts: Record<number, number> = {}
        scores.forEach(s => counts[s.value] = (counts[s.value] || 0) + 1)
        numbers = weightedSelection(counts, mode)
    }
  }

  const { count: existingSim } = await supabase.from('draws').select('*', { count: 'exact', head: true }).eq('status', 'simulated')
  if ((existingSim || 0) > 0) return { error: 'A draw is already simulated. Publish or delete it first.' }

  // Handle Rollover from LAST PUBLISHED DRAW
  const { data: lastDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let rollover = 0
  if (lastDraw && !lastDraw.tier_5_rolled_over && (lastDraw.winner_count_tier_5 || 0) === 0) {
    rollover = Number(lastDraw.tier_5_pool)
  }

  // PRD: total_pool = total_active_subscriptions * subscription_fee
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('status', 'active')

  const TIER_PRICES: Record<string, number> = {
    'ethereal': 99,
    'apex': 499,
    'luminary': 1999,
  }

  const monthlyRevenue = (activeSubs || []).reduce((acc, sub) => acc + (TIER_PRICES[sub.plan || 'ethereal'] || 0), 0)
  const prizePoolContribution = monthlyRevenue * 0.85
  const totalPool = prizePoolContribution + rollover
  
  const draw: Partial<Draw> = {
    type: mode === 'least_frequent' ? 'algorithmic' : type, // Keep track of the logic used
    numbers,
    prize_pool_total: totalPool,
    tier_5_pool: totalPool * 0.40, // Tier 5 (5-match): 40%
    tier_4_pool: totalPool * 0.35, // Tier 4 (4-match): 35%
    tier_3_pool: totalPool * 0.25, // Tier 3 (3-match): 25%
    status: 'simulated',
    score_cutoff_at: new Date().toISOString()
  }

  // Mark previous one as rolled over if we are consuming it
  if (lastDraw && rollover > 0) {
      await supabase.from('draws').update({ tier_5_rolled_over: true }).eq('id', lastDraw.id)
  }

  // Mark previous one as rolled over if we are consuming it
  if (lastDraw && rollover > 0) {
      await supabase.from('draws').update({ tier_5_rolled_over: true }).eq('id', lastDraw.id)
  }

  const { data, error } = await supabase
    .from('draws')
    .insert(draw)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return data
}

export async function publishDraw(drawId: string) {
    const supabase = createClient()
    
    // Call atomic RPC
    const { error: rpcError } = await supabase.rpc('publish_draw', { p_draw_id: drawId })
    if (rpcError) return { error: rpcError.message }

    // After atomic publish, send emails to winners
    const { data: winners } = await supabase
        .from('winners')
        .select('*, user_id!inner(email, full_name)')
        .eq('draw_id', drawId)
    
    for (const w of (winners || [])) {
        const userProfile = w.user_id as unknown as { email: string, full_name: string }
        await sendEmail({
            to: userProfile.email,
            subject: '🏆 You matched numbers in the latest draw!',
            html: `<h1>Congrats ${userProfile.full_name}!</h1><p>You matched ${w.match_count} numbers and won $${w.prize_amount}. Please upload your proof of win on the dashboard to collect your prize.</p>`
        })
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteDraw(drawId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('draws').delete().eq('id', drawId)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}
