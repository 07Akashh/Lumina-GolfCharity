'use client'

import React from 'react'
import { ShieldCheck, Heart, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface HeroStatsProps {
  totalWon?: number;
}

export function HeroStats({ totalWon }: HeroStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
       <div className="card-lumina p-8 bg-white border-white/5 shadow-2xl shadow-black/5 rounded-[2.5rem] flex flex-col justify-between h-[200px] group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center">
             <div className="w-10 h-10 rounded-2xl bg-[#c81e51] flex items-center justify-center text-white shadow-lg shadow-[#c81e51]/20">
                <ShieldCheck size={20} />
             </div>
             <span className="text-[9px] uppercase font-black tracking-[0.2em] text-[#c81e51] bg-[#fee2e2]/30 px-3 py-1.5 rounded-full">ACTIVE</span>
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Network Tier</p>
             <p className="text-xl font-black text-[#0a1628] leading-tight serif-i">Founders Circle</p>
          </div>
       </div>

       <div className="card-lumina p-8 !bg-[#003731] border-white/10 shadow-2xl shadow-black/10 rounded-[2.5rem] flex flex-col justify-between h-[200px] text-white group hover:scale-[1.02] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner text-[#c81e51]">
             <Heart size={20} fill="currentColor" />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] font-black uppercase tracking-widest !text-white/50 mb-1">TOTAL IMPACT</p>
             <p className="text-3xl font-black leading-tight !text-white">{formatCurrency(totalWon || 0)}</p>
          </div>
       </div>

       <div className="card-lumina p-8 bg-white border-white/5 shadow-2xl shadow-black/5 rounded-[2.5rem] flex flex-col justify-between h-[200px] group hover:scale-[1.02] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f3f1] flex items-center justify-center text-[#94a3b8]">
             <Calendar size={20} />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">UPCOMING DRAW</p>
             <p className="text-xl font-black text-[#0a1628] leading-tight serif-i">Aug 24, 2024</p>
          </div>
       </div>
    </div>
  )
}
