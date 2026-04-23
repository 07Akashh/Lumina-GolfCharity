import React from 'react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { Trophy, ArrowRight, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function ClaimsGatewayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: winnings } = await supabase
    .from('winners')
    .select('*, draws(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-12 py-16 scroll-smooth">
      <div className="space-y-12 max-w-5xl mx-auto">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c81e51]/10 flex items-center justify-center text-[#c81e51]">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="display-md text-[#0a1628]">Claim <span className="serif-i text-[#c81e51]">Hub</span></h1>
            <p className="text-[13px] font-bold text-[#94a3b8]">Secure verification and philanthropic distribution gateway.</p>
          </div>
        </div>
      </header>

      {!winnings || winnings.length === 0 ? (
        <div className="card-lumina p-20 text-center space-y-6 bg-white border border-[#f4f3f1] rounded-[3rem] shadow-2xl">
          <div className="w-20 h-20 bg-[#fafafc] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#f4f3f1]">
            <ShieldCheck size={40} className="text-[#94a3b8] opacity-20" />
          </div>
          <h2 className="text-2xl font-black text-[#0a1628]">No Active Distributions</h2>
          <p className="text-[#94a3b8] text-sm max-w-md mx-auto leading-relaxed font-medium">
            Your node state is currently synchronized. When you are allocated a prize pool distribution, it will appear here for identity and banking verification.
          </p>
          <div className="pt-6">
            <Link href="/user" className="btn-primary px-8 py-4 inline-flex items-center gap-2">
              Return to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {winnings.map((w) => (
            <div key={w.id} className="card-lumina p-8 bg-white border border-[#f4f3f1] rounded-[2.5rem] shadow-2xl hover:scale-[1.01] transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform pointer-events-none">
                 <Trophy size={160} />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${
                    w.status === 'paid' ? 'bg-[#dcfce7] text-[#15803d]' : 
                    w.status === 'rejected' ? 'bg-[#fee2e2] text-[#c81e51]' : 
                    'bg-[#f4f3f1] text-[#0a1628]'
                  }`}>
                    {w.status === 'paid' ? <CheckCircle2 size={32} /> : 
                     w.status === 'rejected' ? <XCircle size={32} /> : 
                     <Clock size={32} className="animate-pulse" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0a1628] leading-tight mb-1">{formatCurrency(w.prize_amount)}</h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">
                      {(w.draws as { type?: string })?.type || 'Distribution'} Node • <span suppressHydrationWarning>{new Date(w.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Status</p>
                     <p className={`text-[12px] font-black uppercase tracking-widest ${
                       w.status === 'paid' ? 'text-[#15803d]' : 
                       w.status === 'rejected' ? 'text-[#c81e51]' : 
                       'text-[#c81e51]'
                     }`}>
                       {w.status?.toUpperCase() || 'SYNCHRONIZING'}
                     </p>
                   </div>
                   
                   {(w.status === 'pending' || w.status === 'approved') ? (
                     <Link 
                       href={`/claims/${w.id}`}
                       className="btn-primary px-8 py-4 flex items-center gap-2 shadow-xl shadow-[#c81e51]/20 active:scale-95 transition-all"
                     >
                       Begin Verification <ArrowRight size={16} />
                     </Link>
                    ) : (
                     <div className="px-8 py-4 bg-[#f4f3f1] text-[#94a3b8] rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-default">
                       {w.status === 'paid' ? 'Claim Settled' : 'Claim Blocked'}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-dark p-8 text-white rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c81e51]/20 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-white/40">Philanthropic Standard</p>
            <h4 className="text-xl font-bold">15% Legacy Allocation Built-in</h4>
            <p className="text-sm text-white/50 max-w-md">All prize distributions include an automated 15% contribution to your designated impact partner, verified on-chain.</p>
          </div>
          <ShieldCheck size={48} className="text-white/20" />
        </div>
      </div>
      </div>
    </div>
  )
}
