'use client'

import React from 'react'
import { Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardHeaderProps {
  userName?: string;
  livesImpacted?: number;
  activeWinnings?: any[];
}

export function DashboardHeader({ userName, livesImpacted, activeWinnings }: DashboardHeaderProps) {
  const firstName = userName?.split(' ')[0] || 'Member'
  const pendingWin = activeWinnings?.find(w => w.status === 'pending' || w.status === 'approved')

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
      <div>
         <h1 className="display-lg text-[#0a1628] mb-1">Impact Overview</h1>
         <p className="text-[13px] font-bold text-[#94a3b8]">
           Welcome back, {firstName}. Your contributions impact <span className="text-[#c81e51] font-black">{livesImpacted || '0'}</span> individuals.
         </p>
      </div>
      
      {pendingWin && (
        <Link 
          href={`/claims/${pendingWin.id}`}
          className="flex items-center gap-3 px-6 py-3.5 bg-[#c81e51] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#c81e51]/20 hover:scale-105 active:scale-95 transition-all group"
        >
          <Trophy size={16} className="group-hover:rotate-12 transition-transform" />
          Claim Active Prize
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
