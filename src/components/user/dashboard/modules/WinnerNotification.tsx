'use client'

import React from 'react'
import { Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface WinnerRecord {
  id: string;
  status: string;
  prize_amount: number | string;
}

interface WinnerNotificationProps {
  activeWinnings?: WinnerRecord[];
}

export function WinnerNotification({ activeWinnings }: WinnerNotificationProps) {
  const pendingWin = activeWinnings?.find(w => w.status === 'pending')
  if (!pendingWin) return null

  return (
    <div className="mb-10 card-black p-8 bg-[#c81e51] text-white rounded-[2.5rem] shadow-2xl shadow-[#c81e51]/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-700">
       <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
             <Trophy size={32} />
          </div>
          <div className="space-y-1 text-center md:text-left">
             <h2 className="text-2xl font-black">Epoch Distribution Active</h2>
             <p className="text-white/70 text-sm font-medium">Lumina security protocols have verified your node as a recipient.</p>
          </div>
       </div>
       <Link 
         href={`/claims/${pendingWin.id}`}
         className="px-8 py-4 bg-white text-[#c81e51] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#fafafc] transition-all shadow-xl font-bold"
       >
         Authorize Claim Portal <ArrowRight size={14} className="ml-2 inline" />
       </Link>
    </div>
  )
}
