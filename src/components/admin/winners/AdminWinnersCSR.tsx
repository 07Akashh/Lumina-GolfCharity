'use client'

import React from 'react'
import { RefreshCw, Trophy, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useApi } from '@/lib/api-client'
import { AdminTableSkeleton } from '@/components/admin/dashboard/AdminSkeletons'
import { formatCurrency } from '@/lib/utils'

export function AdminWinnersCSR() {
  const { data, loading, error } = useApi<any>('/admin/dashboard')

  const refreshData = () => window.location.reload()

  if (loading) {
    return (
      <div className="space-y-8">
        <AdminTableSkeleton />
        <AdminTableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-lumina p-12 text-center space-y-4 bg-red-500/10 border-red-500/20">
        <p className="text-red-400 font-bold">Failed to synchronize prize settlement data.</p>
        <button onClick={refreshData} className="btn-primary px-6 py-2">Retry Syncing Node</button>
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end -mb-4">
        <button 
          onClick={refreshData}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#c81e51] transition-colors group"
        >
          <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
          Synchronize Ledger
        </button>
      </div>

      <div className="card-lumina p-10 space-y-8 bg-[#0d1c31] border-white/5">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-white/80">
              <Trophy size={20} className="text-[#d97706]" />
              <h2 className="font-bold">Prize Distribution Ledger</h2>
           </div>
           <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Awaiting Verification — 4 Nodes</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 pb-4 border-b border-white/5">
            <span className="col-span-2">Authorized Member</span>
            <span>Settlement Amount</span>
            <span>Verification Node</span>
            <span>Evidence</span>
            <span className="text-right">Settlement State</span>
          </div>
          
          {stats.recentWinners?.map((w: any) => {
             const p = (w.profiles as any)
             return (
              <div key={w.id} className="grid grid-cols-6 items-center py-6 border-b border-white/5 last:border-0 text-white/60 hover:text-white transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xs text-white/20">{p?.full_name?.slice(0,2).toUpperCase()}</div>
                   <div>
                      <p className="text-xs font-bold text-white">{p?.full_name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e] mt-1">ID: {w.user_id.slice(0, 8)}</p>
                   </div>
                </div>
                <span className="text-[13px] font-black text-white">{formatCurrency(w.prize_amount)}</span>
                <span className="text-[11px] font-medium tracking-widest">{w.match_count} Matches</span>
                <div>
                   {w.proof_url ? (
                     <a href={w.proof_url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-[#c81e51] hover:underline decoration-dotted underline-offset-4">VIEW ARTIFACT</a>
                   ) : (
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">MISSING</span>
                   )}
                </div>
                <div className="flex justify-end">
                   {w.status === 'paid' ? (
                     <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#15803d]/10 text-[#15803d] border border-[#15803d]/20">SETTLED</span>
                   ) : (
                     <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#d97706] border border-[#d97706]/20">AWAITING REVIEW</span>
                   )}
                </div>
              </div>
             )
          })}
        </div>
      </div>
    </div>
  )
}
