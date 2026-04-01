'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/lib/api-client'
import { ArrowLeft, ShieldCheck, Mail, User, CheckCircle2, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AdminDrawData {
  draw: {
    id: string;
    numbers: number[];
    prize_pool_total: number;
    type: string;
    status: string;
    published_at: string;
    created_at: string;
    tier_5_pool: number;
    tier_4_pool: number;
    tier_3_pool: number;
  };
  winners: Array<{
    id: string;
    profiles: {
      full_name: string;
      email: string;
    };
    match_count: number;
    prize_amount: number;
    status: string;
  }>;
}

export default function AdminDrawDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data, loading, error } = useApi<AdminDrawData>(`/admin/draws/${params.id}`)

  if (loading) return (
    <div className="space-y-12 animate-pulse p-10">
      <div className="h-10 w-48 bg-[#f4f3f1] rounded-xl" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-[400px] bg-[#f4f3f1] rounded-[2.5rem]" />
        <div className="h-[400px] bg-[#f4f3f1] rounded-[2.5rem]" />
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="p-20 text-center space-y-6">
      <p className="text-red-400 font-bold">Failed to synchronize governance nodes.</p>
      <button onClick={() => router.back()} className="btn-primary px-8">Return to Governance</button>
    </div>
  )

  const { draw, winners } = data

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#c81e51] transition-colors">
              <ArrowLeft size={14} /> Back to Governance
           </button>
           <h1 className="display-sm text-[#0a1628]">Epoch Ledger <span className="serif-i text-[#c81e51] font-black">#{draw.id.slice(0, 8)}</span></h1>
           <div className="flex items-center gap-4 text-[12px] font-bold text-[#94a3b8]">
             <span>Status: {draw.status.toUpperCase()}</span>
             <span>•</span>
             <span>Created: {new Date(draw.created_at).toLocaleString()}</span>
           </div>
        </div>
        <div className="card-lumina p-6 bg-white border border-[#f4f3f1] min-w-[300px] flex justify-between items-center rounded-3xl shadow-xl">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Total Pool Yield</p>
              <p className="text-3xl font-black text-[#0a1628] leading-none">{formatCurrency(draw.prize_pool_total)}</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] flex items-center justify-center">
              <DollarSign size={24} className="text-[#c81e51]" />
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Seed Nodes */}
           <div className="card-lumina p-10 bg-white border border-[#f4f3f1] rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform pointer-events-none">
                 <ShieldCheck size={160} />
              </div>
              <h3 className="text-lg font-bold text-[#0a1628] mb-8">Synchronized Node Set</h3>
              <div className="flex flex-wrap gap-4 relative z-10">
                 {draw.numbers.map((num, i) => (
                   <div key={i} className="w-16 h-16 rounded-2xl bg-[#0a1628] text-white flex items-center justify-center text-xl font-black shadow-xl shadow-[#0a1628]/20 transition-all hover:scale-110">
                      {num < 10 ? `0${num}` : num}
                   </div>
                 ))}
              </div>
           </div>

           {/* Full Governance Leaderboard */}
           <section className="space-y-6">
              <div className="flex items-center justify-between pb-2">
                 <h2 className="text-xl font-black text-[#0a1628]">Verified Distribution List</h2>
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{winners.length} Qualified Members</span>
              </div>
              <div className="card-lumina bg-white border border-[#f4f3f1] rounded-[3rem] overflow-hidden shadow-2xl">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-[#f4f3f1] bg-[#fafafc]">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Member Identity</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Match Count</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Winnings</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f3f1]">
                       {winners.map((w, i) => (
                         <tr key={i} className="hover:bg-[#fafafc] transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#f4f3f1] flex items-center justify-center">
                                     <User size={18} className="text-[#94a3b8]" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-[#0a1628] leading-none mb-1">{w.profiles?.full_name || 'Anonymous'}</p>
                                     <p className="text-[11px] font-medium text-[#94a3b8] flex items-center gap-1"><Mail size={10}/> {w.profiles?.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="px-4 py-1.5 bg-[#f4f3f1] text-[#0a1628] rounded-full text-[11px] font-black">{w.match_count} Match Nodes</span>
                            </td>
                            <td className="px-8 py-6 font-black text-lg text-[#c81e51]">
                               {formatCurrency(w.prize_amount)}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <span className={`px-4 py-1.5 uppercase text-[9px] font-black rounded-full tracking-widest shadow-sm ${
                                  w.status === 'paid' ? 'bg-[#dcfce7] text-[#15803d]' : 
                                  w.status === 'rejected' ? 'bg-[#fee2e2] text-[#c81e51]' : 
                                  'bg-[#fafafc] text-[#0a1628] border border-[#f4f3f1]'
                               }`}>
                                  {w.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                       {winners.length === 0 && (
                         <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-[#94a3b8] font-bold">
                               No qualifying nodes found for this cycle. All funds rolled to jackpot.
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </section>
        </div>

        <div className="space-y-10">
           {/* Tier Distribution Yield */}
           <div className="card-lumina p-8 bg-white border border-[#f4f3f1] rounded-[2.5rem] shadow-xl space-y-6">
              <h3 className="text-lg font-black text-[#0a1628]">Tier Distribution Logic</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-3 border-b border-[#f4f3f1]">
                    <div>
                       <p className="text-[10px] font-black uppercase text-[#94a3b8]">Tier 1 (5 Match)</p>
                       <p className="text-[15px] font-black text-[#0a1628]">Jackpot Pool (40%)</p>
                    </div>
                    <p className="text-lg font-black text-[#c81e51]">{formatCurrency(draw.tier_5_pool)}</p>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-[#f4f3f1]">
                    <div>
                       <p className="text-[10px] font-black uppercase text-[#94a3b8]">Tier 2 (4 Match)</p>
                       <p className="text-[15px] font-black text-[#0a1628]">Strategy Allocation (35%)</p>
                    </div>
                    <p className="text-lg font-black text-[#0a1628]">{formatCurrency(draw.tier_4_pool)}</p>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-[#f4f3f1]">
                    <div>
                       <p className="text-[10px] font-black uppercase text-[#94a3b8]">Tier 3 (3 Match)</p>
                       <p className="text-[15px] font-black text-[#0a1628]">Community Yield (25%)</p>
                    </div>
                    <p className="text-lg font-black text-[#0a1628]">{formatCurrency(draw.tier_3_pool)}</p>
                 </div>
              </div>
           </div>

           <div className="card-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c81e51]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-[#c81e51]" />
                 </div>
                 <h3 className="text-lg text-white font-bold">Governance Integrity</h3>
                 <p className="text-[12px] leading-relaxed text-white/50 font-medium pb-4">
                   This epoch is verified and archived. ALL associated participation nodes have been systemic reset to ensure next cycle integrity.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
