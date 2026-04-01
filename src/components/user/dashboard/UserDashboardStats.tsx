import React from 'react'
import { Activity, Heart, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function UserDashboardStats({ totalWon }: { totalWon: number }) {
  // Simulate network latency if needed
  // await new Promise(resolve => setTimeout(resolve, 800))

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {/* Status card */}
      <div className="card-lumina p-6 space-y-3">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-xl bg-[#fee2e2] flex items-center justify-center">
            <Activity size={18} className="text-[#c81e51]" />
          </div>
          <span className="pill-active">Active</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e] mb-1">Status</p>
          <p className="display-sm text-[#0a1628]">Founders Circle</p>
        </div>
      </div>

      {/* Total impact */}
      <div className="card-emerald p-6 space-y-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <Heart size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Impact</p>
          <p className="display-sm text-white">{formatCurrency(totalWon)}</p>
        </div>
      </div>

      {/* Next draw */}
      <div className="card-lumina p-6 space-y-3">
        <div className="w-9 h-9 rounded-xl bg-[#f4f3f1] flex items-center justify-center">
          <Calendar size={18} className="text-[#3d4151]" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e] mb-1">Upcoming Draw</p>
          <p className="display-sm text-[#0a1628]">August 24, 2024</p>
        </div>
      </div>
    </div>
  )
}
