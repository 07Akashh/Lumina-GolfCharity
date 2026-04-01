'use client'

import React from 'react'

export function HandicapProgress() {
  return (
    <div className="card-lumina p-10 bg-white border border-[#f4f3f1] rounded-[2.5rem]">
       <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-[#0a1628]">Handicap Progress</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#c81e51]" />
             <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em]">Global Avg.</span>
          </div>
       </div>
       
       <div className="aspect-[2.5/1] w-full relative group">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="gradient-handicap" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#c81e51" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="#c81e51" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0 130 Q125 120 250 80 T500 40" fill="none" stroke="url(#gradient-handicap)" strokeWidth="4" strokeLinecap="round" className="drop-shadow-2xl" />
            <circle cx="500" cy="40" r="8" fill="#c81e51" className="animate-pulse" />
          </svg>
       </div>
       
       <div className="grid grid-cols-4 pt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#94a3b8] border-t border-[#f4f3f1] mt-8">
          <span>JAN</span>
          <span>MAR</span>
          <span>MAY</span>
          <span>JUL</span>
       </div>
       
       <div className="flex gap-10 mt-8">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">CURRENT INDEX</p>
            <p className="text-2xl font-black text-[#0a1628]">8.4 <span className="text-[12px] text-[#c81e51] font-bold">▼ 1.2</span></p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">TOURNAMENT RANK</p>
            <p className="text-2xl font-black text-[#0a1628]">#142</p>
          </div>
       </div>
    </div>
  )
}
