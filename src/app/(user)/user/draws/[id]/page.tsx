'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/lib/api-client'
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface DrawDetails {
  draw: {
    id: string;
    numbers: number[];
    prize_pool: number;
    type: string;
    published_at: string;
  };
  leaderboard: Array<{
    name: string;
    match_count: number;
    prize_amount: number;
    status: string;
  }>;
}

export default function DrawDetailsPage() {
  const params = useParams()
  const { data, loading, error } = useApi<DrawDetails>(`/user/draws/${params.id}`)

  if (loading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-10 w-48 bg-[#f4f3f1] rounded-xl" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 h-[400px] bg-[#f4f3f1] rounded-[2.5rem]" />
        <div className="h-[400px] bg-[#f4f3f1] rounded-[2.5rem]" />
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="card-dark p-20 text-center space-y-4">
      <p className="text-red-400 font-bold">Failed to synchronize draw results.</p>
      <Link href="/user" className="btn-primary px-8">Return to Dashboard</Link>
    </div>
  )

  const { draw, leaderboard } = data

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <Link href="/user" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#c81e51] transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
           </Link>
           <h1 className="display-md text-[#0a1628]">Cycle <span className="serif-i pulse-text">#{draw.id.slice(0, 8)}</span></h1>
           <p className="text-[13px] font-bold text-[#94a3b8]">Verified humanitarian distribution published on {new Date(draw.published_at).toLocaleDateString()}.</p>
        </div>
        <div className="card-dark p-6 text-white min-w-[280px]">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Prize Pool</p>
           <p className="display-sm text-[#c81e51] font-black serif-i">{formatCurrency(draw.prize_pool)}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Winning Numbers */}
           <div className="card-lumina p-10 bg-white border border-[#f4f3f1] rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform">
                 <ShieldCheck size={160} />
              </div>
              <h3 className="text-lg font-bold text-[#0a1628] mb-8">Verified Node Result</h3>
              <div className="flex flex-wrap gap-4 relative z-10">
                 {draw.numbers.map((num, i) => (
                   <div key={i} className="w-16 h-16 rounded-2xl bg-[#0a1628] text-white flex items-center justify-center text-xl font-black shadow-xl shadow-[#0a1628]/20 transition-all hover:scale-110">
                      {num < 10 ? `0${num}` : num}
                   </div>
                 ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#f4f3f1] flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">
                 <CheckCircle2 size={16} className="text-[#15803d]" />
                 Lumina security protocols verified this draw.
              </div>
           </div>

           {/* Full Leaderboard */}
           <section className="space-y-6">
              <div className="flex items-center justify-between pb-2">
                 <h2 className="text-xl font-black text-[#0a1628]">Distribution List</h2>
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{leaderboard.length} Qualified Nodes</span>
              </div>
              <div className="card-lumina bg-white border border-[#f4f3f1] rounded-[2.5rem] overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-[#f4f3f1] bg-[#fafafc]">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Position</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Member Node</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Match Count</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] text-right">Prize Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f3f1]">
                       {leaderboard.map((w, i) => (
                         <tr key={i} className="hover:bg-[#fafafc] transition-colors">
                            <td className="px-8 py-6">
                               <span className="w-8 h-8 rounded-lg bg-[#f4f3f1] flex items-center justify-center text-[11px] font-black text-[#0a1628]">
                                  {i + 1}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-sm font-black text-[#0a1628]">{w.name}</p>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 bg-[#f4f3f1] rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-[#c81e51] rounded-full" 
                                        style={{ width: `${(w.match_count / 5) * 100}%` }} 
                                     />
                                  </div>
                                  <span className="text-[11px] font-black text-[#c81e51]">{w.match_count} Matches</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-lg text-[#0a1628]">
                               {formatCurrency(w.prize_amount)}
                            </td>
                         </tr>
                       ))}
                       {leaderboard.length === 0 && (
                         <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-[#94a3b8] font-bold">
                               No qualifying nodes synchronized for this cycle. All funds rolled to jackpot.
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </section>
        </div>

        <div className="space-y-10">
           {/* Prizing Breakdown Card */}
           <div className="card-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c81e51]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-black text-white">Prize Logic</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[12px] font-bold">
                       <span className="text-white/50">5 Match (Jackpot)</span>
                       <span className="text-[#c81e51] font-black">40% Pool</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                       <span className="text-white/50">4 Match (Tier 2)</span>
                       <span className="text-[#c81e51] font-black">35% Pool</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                       <span className="text-white/50">3 Match (Tier 3)</span>
                       <span className="text-[#c81e51] font-black">25% Pool</span>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/10">
                    <p className="text-[11px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">
                       Lumina Protection Verified
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
