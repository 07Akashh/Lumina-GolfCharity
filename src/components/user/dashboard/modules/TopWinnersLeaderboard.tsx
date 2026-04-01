'use client'

import React from 'react'
import { Trophy } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TopWinnersProps {
  winners?: Array<{
    name: string;
    amount: number;
    type: string;
    date: string;
  }>;
}

export function TopWinnersLeaderboard({ winners }: TopWinnersProps) {
  return (
    <div className="card-dark p-10 text-white rounded-[2.5rem] relative overflow-hidden group h-full">
       <div className="absolute top-0 right-0 w-64 h-64 bg-[#c81e51] blur-[120px] opacity-20 -mr-32 -mt-32" />
       <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-2xl font-black mb-1">Impact Leaderboard</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">Verified Network Yields</p>
             </div>
             <Trophy size={28} className="text-[#c81e51]" />
          </div>

          <div className="space-y-6">
             {winners && winners.length > 0 ? (
               winners.slice(0, 5).map((w, i) => (
                 <div key={i} className="flex items-center justify-between p-7 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item">
                    <div className="flex items-center gap-6">
                       <span className="text-2xl font-black text-[#c81e51] w-12 opacity-80">#{i+1}</span>
                       <div>
                          <p className="text-[15px] font-black tracking-tight text-white group-hover/item:text-[#c81e51] transition-colors">{w.name}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{w.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-white">{formatCurrency(w.amount)}</p>
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <Trophy size={32} className="text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white/40">Network Synchronizing...</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Awaiting Historic Prize Nodes</p>
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  )
}
