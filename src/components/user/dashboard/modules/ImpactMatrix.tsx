'use client'

import React from 'react'
import { Heart, ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import { updateContributionPercentage, updateSelectedCharity } from '@/modules/user/actions'
import { useQueryClient } from '@tanstack/react-query'

import { CharityNode } from '@/types/dashboard'

interface ImpactMatrixProps {
  charityId?: string;
  charityName?: string;
  percentage?: number;
  charities?: CharityNode[];
}

export function ImpactMatrix({ charityId, charityName, percentage, charities }: ImpactMatrixProps) {
  const [isCharityModalOpen, setIsCharityModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const queryClient = useQueryClient()

  const handleUpdatePercentage = async (p: number) => {
    setIsSubmitting(true)
    const result = await updateContributionPercentage(p)
    if (result && 'error' in result) {
       alert(result.error)
    } else {
       queryClient.invalidateQueries({ queryKey: ['/user/dashboard'] })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="card-lumina p-8 bg-white border border-[#f4f3f1] rounded-[2.5rem] space-y-6">
       <CharityModal 
          isOpen={isCharityModalOpen} 
          onClose={() => setIsCharityModalOpen(false)} 
          charities={charities || []}
          selectedId={charityId}
       />

       <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#0a1628]">Impact Matrix</h3>
          <div className="w-8 h-8 rounded-xl bg-[#ccfbf1] flex items-center justify-center text-[#003731]">
             <Heart size={16} />
          </div>
       </div>
       
       <div className="space-y-4">
          <div 
             className="p-5 bg-[#fafafc] rounded-2xl border border-[#f4f3f1] group cursor-pointer hover:border-[#c81e51] transition-all" 
             onClick={() => setIsCharityModalOpen(true)}
          >
             <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">SELECTED CHARITY</p>
             <p className="font-black text-[#0a1628] leading-tight">{charityName || 'None Selected'}</p>
             <p className="text-[10px] font-bold text-[#c81e51] mt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Change Node <ArrowRight size={10} /></p>
          </div>

          <div className="p-5 bg-[#fafafc] rounded-2xl border border-[#f4f3f1]">
             <div className="flex justify-between items-end mb-4">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">CONTRIBUTION RATIO</p>
                   <p className="text-2xl font-black text-[#0a1628]">{percentage || 10}%</p>
                </div>
                <button 
                   disabled={isSubmitting}
                   onClick={() => {
                      const next = (percentage || 10) + 5
                      if(next <= 100) handleUpdatePercentage(next)
                   }}
                   className="px-4 py-2 bg-white border border-[#eceae7] rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-[#c81e51] transition-all disabled:opacity-50"
                >
                   Increase
                </button>
             </div>
             <div className="w-full h-1.5 bg-[#eceae7] rounded-full overflow-hidden">
                <div 
                   className="h-full bg-[#c81e51] rounded-full transition-all duration-1000" 
                   style={{ width: `${percentage || 10}%` }}
                />
             </div>
             <p className="text-[10px] font-medium text-[#94a3b8] mt-4">Min. 10% compliance active.</p>
          </div>
       </div>
    </div>
  )
}

import { DEFAULT_CHARITY_COVER } from '@/components/Layouts/DashboardLayout'

function CharityModal({ isOpen, onClose, charities, selectedId }: {
  isOpen: boolean; 
  onClose: () => void; 
  charities: CharityNode[]; 
  selectedId?: string;
}) {
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const queryClient = useQueryClient()

  if (!isOpen) return null

  const handleSelect = async (id: string) => {
    setLoadingId(id)
    const result = await updateSelectedCharity(id)
    if (result && 'error' in result) {
       alert(result.error)
    } else {
       queryClient.invalidateQueries({ queryKey: ['/user/dashboard'] })
       onClose()
    }
    setLoadingId(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0a1628]/40 backdrop-blur-md" onClick={onClose} />
      <div className="card-lumina w-full max-w-2xl bg-white relative z-10 overflow-hidden flex flex-col max-h-[80vh] rounded-[3rem] animate-in zoom-in-95 duration-500">
         <header className="p-10 border-b border-[#f4f3f1] bg-[#fafafc]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c81e51] mb-2">Network Node</p>
            <h2 className="text-2xl font-black text-[#0a1628]">Select Impact Partner</h2>
            <p className="text-[13px] font-medium text-[#8a8f9e] mt-1">Direct your contribution ratio to a verified philanthropic entry.</p>
         </header>

         <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
            {charities.map((ch) => (
               <div 
                  key={ch.id} 
                  onClick={() => !loadingId && handleSelect(ch.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedId === ch.id ? 'border-[#c81e51] bg-[#fee2e2]/10' : 'border-[#f4f3f1] bg-white hover:border-[#eceae7]'
                  }`}
               >
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-xl bg-[#fafafc] border border-[#f4f3f1] flex items-center justify-center transition-all overflow-hidden relative">
                        <Image src={ch.image_url || DEFAULT_CHARITY_COVER} alt={ch.name} fill className="object-cover" />
                     </div>
                     <div>
                        <h4 className="font-black text-[#0a1628]">{ch.name}</h4>
                        <p className="text-[11px] font-medium text-[#94a3b8] line-clamp-1">{ch.description}</p>
                     </div>
                  </div>
                  {loadingId === ch.id ? (
                     <div className="w-6 h-6 border-2 border-[#c81e51] border-t-transparent rounded-full animate-spin" />
                  ) : selectedId === ch.id ? (
                     <Check className="text-[#c81e51]" size={20} />
                  ) : (
                     <ArrowRight className="text-[#eceae7] group-hover:text-[#0a1628] transition-colors" size={20} />
                  )}
               </div>
            ))}
         </div>
         
         <footer className="p-10 border-t border-[#f4f3f1] text-right bg-[#fafafc]">
            <button onClick={onClose} className="px-10 py-4 text-[11px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#0a1628] transition-colors font-bold">Close Console</button>
         </footer>
      </div>
    </div>
  )
}
