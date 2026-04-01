import React from 'react'
import { Users, DollarSign, Heart, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function AdminStatsSkeleton() {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-[1.25rem] p-6 h-32 bg-white/5 border border-white/5" />
      ))}
    </div>
  )
}

export function AdminTableSkeleton() {
  return (
    <div className="card-lumina p-7 space-y-5 bg-[#0d1c31] border-white/5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 bg-white/10 rounded" />
        <div className="h-4 w-20 bg-white/10 rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-full bg-white/5 rounded" />
        ))}
      </div>
    </div>
  )
}
