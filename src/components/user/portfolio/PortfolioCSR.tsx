'use client'

import React from 'react'
import { Sparkles, ArrowUpRight, Zap, Target, Globe, ChevronRight } from 'lucide-react'
import { useApi } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

import { DashboardData } from '@/types/dashboard'

export function PortfolioCSR() {
   const { data, loading, error } = useApi<DashboardData>('/user/dashboard')

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-40 bg-[#f4f3f1] rounded-[2.5rem]" />
        <div className="grid md:grid-cols-2 gap-8">
           <div className="h-64 bg-[#f4f3f1] rounded-[2.5rem]" />
           <div className="h-64 bg-[#f4f3f1] rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (error) return <p className="p-8 text-center text-red-500 font-bold">Failed to synchronize contribution ledger.</p>

  // Robust data mapping from the new API structure
  const totalWon = data?.stats?.totalWon || 0
  const livesImpacted = data?.stats?.totalLivesImpacted || 0

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* ... prev content ... */}
      <div className="max-w-2xl">
         <h1 className="display-xl text-[#0a1628] leading-tight">
            Philanthropy <br />
            Through <span className="serif-i italic">Purpose.</span>
         </h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
         {/* Strategic Impact Hub */}
         <div className="lg:col-span-2 card-lumina p-8 !bg-[#003731] text-white shadow-2xl shadow-black/10 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-6 right-8 text-[#2dd4bf] opacity-30 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700">
               <Sparkles size={32} strokeWidth={1} />
            </div>
            <div className="relative z-10 space-y-8">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">GLOBAL IMPACT SCORE</p>
                  <p className="text-5xl font-black serif-i text-white leading-none">842</p>
               </div>
               <p className="text-[11px] font-medium leading-relaxed text-white/60">
                  Top 2% of contributors worldwide. Legacy growing across 4 continents.
               </p>
               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2dd4bf] hover:gap-4 transition-all">
                  Analyze Network <ArrowUpRight size={14} />
               </button>
            </div>
         </div>

         {/* Distribution Pillars */}
         <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
            <PillarCard icon={Zap} label="Response Speed" val="4.2h" desc="Average time from draw to humanitarian deployment." />
            <PillarCard icon={Target} label="Allocation Accuracy" val="99.4%" desc="Direct-to-cause efficiency audited via ledger nodes." />
            <PillarCard icon={Globe} label="Regional Diversity" val="14" desc="Countries currently receiving Luminary aid." />
            <div className="p-6 bg-[#f4f3f1]/30 border border-white/5 shadow-inner rounded-[2rem] flex flex-col justify-center gap-3">
               <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Verified by</p>
               <h4 className="text-[13px] font-black text-[#0a1628] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Ethereal Transparency Protocol
               </h4>
            </div>
         </div>
      </div>

      {/* Contribution Ledger */}
      <div className="card-lumina p-10 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.03)] rounded-[3rem] space-y-10">
         <div className="flex justify-between items-end">
            <div>
               <h3 className="text-xl font-bold text-[#0a1628]">Giving Ledger</h3>
               <p className="text-[12px] font-medium text-[#94a3b8] mt-1">Immutable record of your philanthropic yield.</p>
            </div>
            <div className="flex items-center gap-6">
               <span className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">Current Yield: <span className="text-[#0a1628] font-black underline underline-offset-4 decoration-[#c81e51] decoration-2">{formatCurrency(totalWon)}</span></span>
            </div>
         </div>

         <div className="space-y-4">
            <div className="grid grid-cols-5 text-[9px] font-black uppercase tracking-widest text-[#94a3b8] pb-6 border-b border-[#f4f3f1] px-2 opacity-60">
               <span>Impact Partner</span>
               <span>Ledger Date</span>
               <span>Yield Amount</span>
               <span>Allocation Node</span>
               <span className="text-right pr-2">Status</span>
            </div>
            
               <div className="space-y-3 pt-6">
                  {data?.ledger && data.ledger.length > 0 ? (
                    data.ledger.map((item, i) => (
                      <HistoryRow 
                        key={i}
                        partner={item.partner_name || 'N/A'} 
                        date={String(item.created_at || new Date().toISOString()).split('T')[0]} 
                        amount={formatCurrency(item.amount || 0)} 
                        allocation={item.allocation_type || 'General Fund'} 
                        status={item.status || 'PENDING'} 
                        color={item.status === 'COMPLETED' ? '#10b981' : '#f59e0b'} 
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center text-[11px] font-black uppercase tracking-widest text-[#94a3b8] bg-white border border-dashed border-[#eceae7] rounded-2xl">
                       No transactions yet recorded in the ledger.
                    </div>
                  )}
               </div>
         </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8 px-4 pt-10 border-t border-[#f4f3f1]">
         {[
           { label: 'TOTAL CONTRIBUTED', val: formatCurrency(totalWon) },
           { label: 'TAX DEDUCTIBLE', val: formatCurrency(totalWon * 0.8) },
           { label: 'LIVES IMPACTED', val: `~${livesImpacted}` },
           { label: 'NEXT GRANT CYCLE', val: 'Calculating...', highlight: true },
         ].map(stat => (
            <div key={stat.label}>
               <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 leading-none ${stat.highlight ? 'text-[#c81e51]' : 'text-[#94a3b8]'}`}>{stat.label}</p>
               <p className={`text-2xl font-black leading-none ${stat.highlight ? 'text-[#c81e51]' : 'text-[#0a1628]'}`}>{stat.val}</p>
            </div>
         ))}
      </div>
    </div>
  )
}

interface PillarCardProps {
  icon: React.ElementType;
  label: string;
  val: string;
  desc: string;
}

function PillarCard({ icon: Icon, label, val, desc }: PillarCardProps) {
   return (
      <div className="p-6 bg-white border border-[#f4f3f1] rounded-[2rem] hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all group cursor-pointer">
         <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#0a1628]/5 flex items-center justify-center text-[#0a1628] group-hover:bg-[#c81e51] group-hover:text-white transition-all">
               <Icon size={18} />
            </div>
            <span className="text-[12px] font-black text-[#0a1628]">{val}</span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-widest text-[#0a1628] mb-1.5">{label}</p>
         <p className="text-[10px] font-medium text-[#94a3b8] leading-relaxed">{desc}</p>
      </div>
   )
}

interface HistoryRowProps {
  partner: string;
  date: string;
  amount: string;
  allocation: string;
  status: string;
  color: string;
}

function HistoryRow({ partner, date, amount, allocation, status, color }: HistoryRowProps) {
   return (
      <div className="grid grid-cols-5 items-center py-5 transition-all hover:bg-[#fafafc] px-4 rounded-2xl group cursor-pointer">
         <p className="text-[13px] font-bold text-[#0a1628] group-hover:text-[#c81e51] transition-colors">{partner}</p>
         <p className="text-[13px] font-medium text-[#94a3b8]">{date}</p>
         <p className="text-[13px] font-black text-[#0a1628]">{amount}</p>
         <p className="text-[13px] font-medium text-[#94a3b8] truncate pr-4">{allocation}</p>
         <div className="flex justify-end items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[8px] font-black tracking-widest uppercase" style={{ color }}>{status}</span>
            <ChevronRight size={12} className="text-[#94a3b8] ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
         </div>
      </div>
   )
}
