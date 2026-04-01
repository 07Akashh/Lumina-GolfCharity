'use client'

import React from 'react'
import { RefreshCw, Camera, Shield, MoreVertical } from 'lucide-react'
import { useApiQuery } from '@/lib/api-client'
import { TableSkeleton } from '@/components/user/dashboard/DashboardSkeletons'

export function ProfileCSR() {
  const { data, isLoading: loading, error } = useApiQuery<unknown>('/user/dashboard')

  if (loading) return <TableSkeleton />

  if (error) return <p className="text-red-500 font-bold p-8 text-center">Failed to synchronize profile node.</p>

  const { profile } = data as any // profile structure is loosely defined in this CSR component

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 space-y-12">
      <div className="relative h-48 rounded-3xl bg-gradient-to-r from-[#0a1628] to-[#1a2b4b] overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=70')] bg-cover" />
      </div>

      <div className="px-10 -mt-24 space-y-10">
         <div className="flex items-end justify-between">
            <div className="relative group">
               <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl">
                  <div className="w-full h-full rounded-2xl bg-[#f4f3f1] flex items-center justify-center text-4xl font-black text-[#0a1628]">
                     {profile?.full_name?.slice(0,1) || 'U'}
                  </div>
               </div>
               <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#c81e51] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
               </button>
            </div>
            
            <div className="pb-2 space-x-3">
               <button className="btn-secondary px-6">Edit Identity</button>
               <button className="p-3.5 rounded-xl border border-[#eceae7] hover:bg-[#faf9f7] transition-colors"><MoreVertical size={16} /></button>
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-12 pt-4">
            <div className="lg:col-span-2 space-y-10">
               <div className="space-y-2">
                  <h1 className="text-3xl font-black text-[#0a1628]">{profile?.full_name || 'Philanthropist Node'}</h1>
                  <p className="text-[#8a8f9e] font-medium flex items-center gap-2">
                     <Shield size={14} className="text-[#c81e51]" />
                     Verified Member since {new Date(profile?.created_at).getFullYear()}
                  </p>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8a8f9e]">Philanthropic Mission</h3>
                  <p className="text-sm leading-relaxed text-[#0a1628] font-medium">
                     Providing liquidity to foundational impact nodes with a specific focus on environmental stability and educational stochastic distributions.
                  </p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="card-lumina p-7 space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8a8f9e]">Node Verified</h3>
                  <div className="flex flex-wrap gap-2">
                     {['Founders Circle', 'Eco Guardian', 'Well Donor'].map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#0a1628]/5 text-[#0a1628] border border-[#0a1628]/10">{tag}</span>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
