import React from 'react'
import { Trophy, ArrowLeft, ShieldCheck, Bell } from 'lucide-react'
import Link from 'next/link'

export default function ClaimsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#faf9f7] text-[#0a1628] font-inter overflow-hidden">
      {/* Global Claims Header - Matches DashboardLayout aesthetic */}
      <header className="h-[72px] shrink-0 flex items-center justify-between px-10 bg-white border-b border-[#f4f3f1]/50 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/user" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#c81e51] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
          <div className="h-8 w-px bg-[#f4f3f1]" />
          <div className="flex items-center gap-3">
             <Trophy size={18} className="text-[#c81e51]" />
             <span className="serif-i text-xl font-black text-[#0a1628]">Claim <span className="text-[#c81e51]">Portal</span></span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-4 px-5 py-2.5 bg-[#fafafc] rounded-xl border border-[#eceae7]">
              <ShieldCheck size={14} className="text-[#15803d]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Verified Node Clearance</span>
           </div>
           
           <div className="w-px h-8 bg-[#f4f3f1]" />
           
           <button className="text-[#94a3b8] hover:text-[#0a1628] transition-all relative">
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#c81e51] rounded-full border-2 border-white" />
           </button>
        </div>
      </header>

      {/* Main View Area - Full height, scrollable if needed in sub-layouts */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
