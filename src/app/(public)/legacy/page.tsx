import React from 'react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { Trophy, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

async function getLegacyData() {
  const supabase = createClient()
  
  // Recent published draws
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  // Total won by all participants
  const { data: winners } = await supabase
    .from('winners')
    .select('prize_amount')
    .eq('status', 'paid')

  const totalWon = winners?.reduce((acc, w) => acc + Number(w.prize_amount), 0) || 0

  return { draws, totalWon }
}

export default async function LegacyPage() {
  const data = await getLegacyData()

  return (
      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c81e51]">The Historical Ledger</p>
            <h1 className="display-xl text-[#0a1628]">The collective <span className="serif-i text-[#c81e51]">legacy.</span></h1>
            <p className="text-lg text-[#3d4151] leading-relaxed">
              Every draw cycle creates a new set of winners and a fresh wave of philanthropic impact. Our ledger records the history of luck meeting generosity.
            </p>
          </div>
          <div className="card-dark p-10 text-white flex flex-col justify-end space-y-4 md:min-w-[400px]">
             <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Total Prizes Claimed</p>
             <p className="display-md text-[#c81e51] font-black serif-i">{formatCurrency(data.totalWon)}</p>
             <p className="text-[11px] opacity-40">Verified prize settlements across 12 countries.</p>
          </div>
        </header>

        {/* Draw history grid */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-[#f4f3f1] pb-6">
            <h2 className="display-sm text-[#0a1628]">Recent Draw Cycles</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8a8f9e]">
                 <div className="w-2 h-2 rounded-full bg-[#15803d]" /> Published
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8a8f9e]">
                 <div className="w-2 h-2 rounded-full bg-[#3d4151]" /> Verified
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {data.draws?.map((draw) => (
              <div key={draw.id} className="card-lumina p-10 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8a8f9e]">{String(draw.published_at).split('T')[0]}</p>
                     <h3 className="text-xl font-bold text-[#0a1628]">Cycle #{draw.id.slice(0, 8)}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#f4f3f1] flex items-center justify-center text-[#c81e51] group-hover:bg-[#c81e51] group-hover:text-white transition-all">
                     <Trophy size={16} />
                  </div>
                </div>

                <div className="flex gap-3 mb-10">
                   {(draw.numbers as number[]).map((num, i) => (
                     <div key={i} className="draw-ball w-12 h-12 text-sm font-bold border-[#eceae7]">
                       {num}
                     </div>
                   ))}
                </div>

                <div className="flex items-end justify-between pt-8 border-t border-[#f4f3f1]">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8a8f9e]">Prize Pool Delivered</p>
                      <p className="text-2xl font-black text-[#0a1628] mt-1">{formatCurrency(draw.prize_pool_total)}</p>
                   </div>
                   <button className="text-[11px] font-bold uppercase tracking-widest text-[#c81e51] hover:underline flex items-center gap-2">
                     Audit details <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Impact CTA */}
        <section className="mt-32 card-lumina bg-[#faf9f7] border-2 border-[#f4f3f1] p-16 text-center space-y-8 overflow-hidden relative">
           <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="display-md text-[#0a1628]">Join the legacy today.</h2>
              <p className="text-lg text-[#3d4151] opacity-70">
                Participation in Lumina is more than a game. It is a commitment to collective philanthropy.
              </p>
              <div className="pt-6 flex justify-center gap-4">
                 <a href="/memberships" className="btn-primary px-10 py-4 text-sm font-bold shadow-xl shadow-[#c81e51]/20">Establish Legacy</a>
                 <a href="/impact" className="btn-secondary px-10 py-4 text-sm font-bold">Explore Impact</a>
              </div>
           </div>
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#c81e51]/5 rounded-full blur-[80px]" />
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-[80px]" />
        </section>
      </main>
  )
}
