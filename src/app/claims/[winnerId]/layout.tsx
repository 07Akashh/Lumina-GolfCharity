'use client'

import React from 'react'
import { Fingerprint, FileText, Landmark, Sparkles, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'

const STEPS = [
  { id: 'identity', label: 'Identity', icon: Fingerprint },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'impact', label: 'Impact', icon: Sparkles },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
]

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  // const params = useParams()
  const pathname = usePathname()

  return (
    <div className="flex relative items-start">
      {/* Portal Sidebar - Sticky relative to the global layout scroll */}
      <aside className="w-[280px] bg-white border-r border-[#eceae7] flex flex-col py-10 px-8 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c81e51]">In Progress</p>
          <h2 className="text-xl font-black text-[#0a1628] leading-tight serif-i mt-1">Verification</h2>
        </div>

        <nav className="space-y-2 flex-1">
          {STEPS.map((step, idx) => {
            const activeIndex = pathname.includes('documents') ? 1 :
                                pathname.includes('banking') ? 2 :
                                pathname.includes('impact') ? 3 :
                                pathname.includes('review') ? 4 : 0;
            const isActive = idx === activeIndex;
            const isDone = idx < activeIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-[#0a1628] text-white shadow-xl shadow-[#0a1628]/10' 
                    : isDone 
                      ? 'bg-[#f8fafc] text-[#15803d]' 
                      : 'text-[#94a3b8] opacity-60'
                }`}
              >
                {isDone ? <ShieldCheck size={18} strokeWidth={2.5} /> : <step.icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">{step.label}</span>
              </div>
            )
          })}
        </nav>

        <div className="mt-auto space-y-6 pt-10 border-t border-[#f4f3f1]">
           <div className="flex items-center gap-3 text-[#94a3b8]">
             <ShieldCheck size={16} className="text-[#15803d]" />
             <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Secure 256-Bit<br/>Encryption Active</span>
           </div>
           <button className="w-full py-4 bg-[#fafafc] border border-[#eceae7] text-[#c81e51] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#fee2e2]/30 transition-all">
             Secure Logout
           </button>
        </div>
      </aside>

      {/* Portal Content Area */}
      <main className="flex-1 px-16 py-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
