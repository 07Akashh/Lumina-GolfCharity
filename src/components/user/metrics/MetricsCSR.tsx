'use client'

import { TrendingUp, Globe, Award, ShieldCheck, Filter, Users, RotateCw } from 'lucide-react'
import { useApi } from '@/lib/api-client'
import { LoadingButton } from '@/components/common/LoadingButton'
import { StatsSkeleton, ChartSkeleton, ImpactGridSkeleton } from '@/components/user/dashboard/DashboardSkeletons'
import { formatCurrency } from '@/lib/utils'

import { DashboardData } from '@/types/dashboard'

export function MetricsCSR() {
  const { data, loading, error } = useApi<DashboardData>('/user/dashboard')

  if (loading) {
    return (
      <div className="space-y-12">
        <StatsSkeleton />
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="space-y-6">
            <ImpactGridSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-lumina p-12 text-center space-y-4">
        <p className="text-red-500 font-bold">Failed to synchronize impact metrics.</p>
        <LoadingButton 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-[#c81e51] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#c81e51]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <RotateCw size={14} /> Retry Sync
        </LoadingButton>
      </div>
    )
  }

  const totalWon = data?.stats?.totalWon || 0
  const livesImpacted = data?.stats?.totalLivesImpacted || 0

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex justify-between items-start">
         <div className="space-y-4 max-w-2xl">
            <h1 className="display-xl text-[#0a1628] leading-tight">
               Humanitarian Reach <br />
               & <span className="serif-i text-[#c81e51] italic">Historical Growth</span>
            </h1>
            <p className="text-[13px] font-medium text-[#94a3b8] leading-relaxed">
               Every swing creates a ripple. Monitor the tangible humanitarian change fueled by your membership and network contributions.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="card-lumina p-6 bg-[#f4f3f1]/50 border-white/5 rounded-[2rem] min-w-[170px]">
               <p className="text-[9px] font-black uppercase tracking-widest text-[#8a8f9e] mb-2 leading-none">TOTAL LIVES <br /> IMPACTED</p>
               <p className="text-2xl font-black text-[#0a1628] leading-none">{livesImpacted}</p>
            </div>
            <div className="card-lumina p-6 !bg-[#003731] border-white/10 rounded-[2rem] min-w-[190px] text-white">
               <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-2 leading-none">GLOBAL <br /> GRANTS</p>
               <p className="text-2xl font-black text-white leading-none">{formatCurrency(totalWon)}</p>
            </div>
         </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 card-lumina p-10 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] space-y-8">
            <div className="flex justify-between items-center">
               <div>
                  <h3 className="text-lg font-bold text-[#0a1628] flex items-center gap-3">
                     Historical Impact Growth
                  </h3>
                  <p className="text-[11px] font-medium text-[#94a3b8] mt-1.5">Measuring systemic change across five years of operation.</p>
               </div>
               <span className="text-[9px] uppercase font-black text-[#c81e51] bg-[#fee2e2]/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#c81e51]" />
                  SYSTEMIC IMPACT
               </span>
            </div>

            <div className="flex h-56 gap-4 pt-4">
               {(data?.chartData || [
                 { year: '2019', val: '20%' },
                 { year: '2020', val: '25%' },
                 { year: '2021', val: '40%' },
                 { year: '2022', val: '65%' },
                 { year: '2023', val: '80%' },
                 { year: '2024', val: '100%', active: true },
               ]).map(bar => (
                 <div key={bar.year} className="flex-1 flex flex-col justify-end h-full text-center group cursor-pointer gap-3">
                    <div className="w-full flex-1 flex flex-col justify-end">
                       <div className={`w-full rounded-2xl relative overflow-hidden transition-all duration-700 ${bar.active ? 'bg-[#c81e51] shadow-lg shadow-[#c81e51]/20' : 'bg-[#0a1628]/10 group-hover:bg-[#0a1628]/20'}`} style={{ height: bar.val }}>
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-[#94a3b8] shrink-0">{bar.year}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="card-emerald p-8 text-white rounded-[2.5rem] space-y-8 flex flex-col">
            <h3 className="text-lg font-bold">Sector Distribution</h3>
            <p className="text-[11px] font-medium text-white/40">Strategic allocation of humanitarian resources.</p>
            
            <div className="space-y-6 flex-1">
               {[
                 { label: 'CLEAN WATER', val: 45 },
                 { label: 'MEDICAL SUPPLIES', val: 30 },
                 { label: 'EDUCATION', val: 25 },
               ].map(sector => (
                  <div key={sector.label} className="space-y-3">
                     <div className="flex justify-between text-[10px] font-black tracking-widest text-white/60">
                        <span>{sector.label}</span>
                        <span>{sector.val}%</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${sector.val}%` }} />
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-4 bg-black/10 rounded-2xl flex items-center gap-4 group">
               <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#2dd4bf] group-hover:scale-110 transition-transform">
                  <ShieldCheck size={16} />
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest leading-loose text-white/60">
                  Certified Impact: Audited by global compliance partners.
               </p>
            </div>
         </div>
      </div>

      {/* Global Recognition */}
      <div className="space-y-8">
         <div className="flex items-end justify-between border-b border-[#f4f3f1] pb-6">
            <div className="space-y-3">
               <h2 className="display-sm text-[#0a1628]">Global Recognition</h2>
               <p className="text-[12px] font-medium text-[#94a3b8] max-w-sm">Leading ethereal standards in giving recognition.</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-[#c81e51] hover:underline underline-offset-8">View Milestones →</button>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'UN GLOBAL COMPACT', icon: <Award size={20} /> },
              { label: 'ECOVADIS PLATINUM', icon: <Globe size={20} /> },
              { label: 'HUMANITY AWARD \'23', icon: <Users size={20} /> },
              { label: 'ETHICAL DONOR GRADE A', icon: <TrendingUp size={20} /> },
            ].map(milestone => (
               <div key={milestone.label} className="card-lumina p-6 bg-white border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4 text-center group hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-[#0a1628] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                     {milestone.icon}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0a1628] leading-relaxed">{milestone.label}</p>
               </div>
            ))}
         </div>
      </div>

      {/* Grant Impact Table */}
      <div className="card-lumina p-10 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.03)] rounded-[3rem] space-y-8">
         <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-[#0a1628]">Recent Grant Impact</h3>
            <button className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#0a1628] transition-colors">
               <Filter size={14} />
               Filter by Region
            </button>
         </div>

         <div className="space-y-4">
            <div className="grid grid-cols-4 text-[9px] font-black uppercase tracking-widest text-[#94a3b8] pb-6 border-b border-[#f4f3f1] px-2">
               <span>Project Name</span>
               <span>Region</span>
               <span>Lives Improved</span>
               <span className="text-right">Funding Status</span>
            </div>
            
            {data?.grants && data.grants.length > 0 ? (
               data.grants.map((grant) => (
                  <div key={grant.id} className="grid grid-cols-4 items-center py-6 border-b border-[#f4f3f1] last:border-0 hover:bg-[#fafafc] transition-colors -mx-4 px-6 rounded-2xl group cursor-pointer">
                     <span className="text-[13px] font-bold text-[#0a1628] group-hover:text-[#c81e51] transition-colors">{grant.name}</span>
                     <span className="text-[13px] font-medium text-[#94a3b8]">{grant.region}</span>
                     <span className="text-[13px] font-black text-[#0a1628]">{grant.lives_impacted}</span>
                     <div className="flex justify-end">
                        <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full border ${
                           grant.status === 'COMPLETED' ? 'bg-[#2dd4bf]/10 text-[#0f766e] border-[#2dd4bf]/20' :
                           grant.status === 'ACTIVE' ? 'bg-[#c81e51]/10 text-[#c81e51] border-[#c81e51]/20' :
                           'bg-[#4f46e5]/10 text-[#4338ca] border-[#4f46e5]/20'
                        }`}>
                           {grant.status}
                        </span>
                     </div>
                  </div>
               ))
            ) : [
               { name: 'Sustainable Wells Sub-Saharan', region: 'Kenya, Uganda', lives: '12,400', status: 'COMPLETED' },
               { name: 'Mobile Medical Units', region: 'South East Asia', lives: '8,900', status: 'ACTIVE' },
            ].map((grant, i) => (
               <div key={i} className="grid grid-cols-4 items-center py-6 border-b border-[#f4f3f1] last:border-0 hover:bg-[#fafafc] transition-colors -mx-4 px-6 rounded-2xl group cursor-pointer">
                  <span className="text-[13px] font-bold text-[#0a1628] group-hover:text-[#c81e51] transition-colors">{grant.name}</span>
                  <span className="text-[13px] font-medium text-[#94a3b8]">{grant.region}</span>
                  <span className="text-[13px] font-black text-[#0a1628]">{grant.lives}</span>
                  <div className="flex justify-end">
                     <span className={`text-[8px] font-black tracking-widest px-3 py-1 rounded-full border ${
                        grant.status === 'COMPLETED' ? 'bg-[#2dd4bf]/10 text-[#0f766e] border-[#2dd4bf]/20' :
                        'bg-[#c81e51]/10 text-[#c81e51] border-[#c81e51]/20'
                     }`}>
                        {grant.status}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
