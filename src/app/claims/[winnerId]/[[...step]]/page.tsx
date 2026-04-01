import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClaimPortalCSR from '@/components/user/claims/ClaimPortalCSR'
import { ShieldAlert } from 'lucide-react'

export default async function ClaimPage({ params }: { params: Promise<{ winnerId: string }> }) {
  const { winnerId } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Profile + KYC Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/user?error=profile_not_found')
  }

  const isAdmin = profile.role === 'ADMIN'

  // 2. Fetch KYC Record Node
  const { data: kycRecord } = await supabase
    .from('kyc_records')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // 3. Fetch Winner Record (The award node)
  const { data: winner, error: winnerError } = await supabase
    .from('winners')
    .select('*')
    .eq('id', winnerId)
    .single()

  // 4. Fetch Active Charities (Real nodes)
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)

  // 5. Fetch previous Claim Details (for account reuse)
  const { data: lastClaim } = await supabase
    .from('claims')
    .select('account_details')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 6. Fetch Draft Claim for current workflow
  const { data: draftClaim } = await supabase
    .from('claims')
    .select('*')
    .eq('winner_id', winnerId)
    .maybeSingle()

  // Gate check
  if (winnerError || !winner || (!isAdmin && winner.user_id !== user.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-[#fee2e2] rounded-full flex items-center justify-center text-[#c81e51]">
          <ShieldAlert size={40} />
        </div>
        <h2 className="display-md text-[#0a1628]">Claim Node Restricted</h2>
        <p className="text-[#94a3b8] max-w-md mx-auto mt-2">Invalid or unauthorized distribution channel.</p>
        <a href="/user" className="btn-primary py-3 px-8">Return to Portfolio</a>
      </div>
    )
  }

  if (['paid', 'dispensed'].includes(winner.status)) {
     redirect('/user?error=claim_locked')
  }

  return (
    <ClaimPortalCSR 
      winnerId={winner.id} 
      winnerAmount={winner.prize_amount} 
      profile={profile}
      kycRecord={kycRecord}
      charities={charities || []}
      prevAccountDetails={lastClaim?.account_details}
      draftClaim={draftClaim}
    />
  )
}
