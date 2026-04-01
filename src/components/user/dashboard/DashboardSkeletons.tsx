import React from 'react'

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-lumina p-6 h-32 bg-[#eceae7]/20 border-[#eceae7]/30 animate-pulse" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card-lumina p-8 h-80 bg-[#eceae7]/20 border-[#eceae7]/30 animate-pulse space-y-4">
      <div className="h-6 w-1/3 bg-[#eceae7]/40 rounded" />
      <div className="h-full w-full bg-[#eceae7]/10 rounded-2xl" />
    </div>
  )
}

export function ImpactGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[3/4] bg-[#eceae7]/20 rounded-2xl" />
      ))}
    </div>
  )
}

export function RightPanelSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card-lumina p-7 h-48 bg-[#eceae7]/20 rounded-3xl" />
      <div className="card-lumina p-7 h-32 bg-[#eceae7]/20 rounded-3xl" />
      <div className="card-lumina p-7 h-40 bg-[#eceae7]/20 rounded-3xl" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="card-lumina p-8 space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-[#eceae7]/40 rounded" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full bg-[#eceae7]/10 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-10 w-1/2 bg-[#eceae7]/40 rounded" />
        <div className="h-4 w-3/4 bg-[#eceae7]/20 rounded" />
      </div>
      <div className="card-lumina p-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-[#eceae7]/30 rounded" />
            <div className="h-12 w-full bg-[#eceae7]/10 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
