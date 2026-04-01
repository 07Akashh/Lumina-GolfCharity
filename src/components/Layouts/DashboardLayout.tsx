'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  HandHeart, 
  BarChart3, 
  Settings, 
  Bell, 
  Plus,
  LogOut,
  Trophy
} from 'lucide-react'
import Image from 'next/image'
import { logout } from '@/modules/auth/actions'
import { DrawCountdown } from '@/components/user/dashboard/DrawCountdown'

export const DEFAULT_CHARITY_COVER = "https://images.unsplash.com/photo-1599461149326-2e9dd1113a02?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

const NAV = [
  { label: 'Dashboard',       icon: LayoutDashboard, href: '/user' },
  { label: 'Giving Portfolio', icon: HandHeart,       href: '/user/portfolio' },
  { label: 'Impact Metrics',   icon: BarChart3,       href: '/user/metrics' },
  { label: 'Claim Portal',     icon: Trophy,          href: '/claims' },
  { label: 'Settings',         icon: Settings,        href: '/user/settings' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: { name: string; role: string; avatar?: string } | null
  nextDraw?: string
}

export default function DashboardLayout({ children, user, nextDraw }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="h-screen bg-[#faf9f7] flex overflow-hidden">
      {/* ── Sidebar (Refined & Lightweight) ── */}
      <aside className="w-[240px] shrink-0 bg-white flex flex-col py-8 px-5 border-r border-[#eceae7]/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">
        {/* Logo */}
        <div className="px-4 mb-12">
          <Link href="/" className="serif-i text-2xl font-black text-[#0a1628] hover:text-[#c81e51] transition-colors leading-none tracking-tight">
            Lumina
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {NAV.map(({ label, icon: Icon, href }) => {
            const active = pathname === href
            return (
              <Link
                key={label + href}
                href={href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[12px] font-bold transition-all relative group ${
                  active 
                    ? 'bg-[#f4f3f1] text-[#c81e51]' 
                    : 'text-[#94a3b8] hover:text-[#0a1628] hover:bg-[#fafafc]'
                }`}
              >
                <Icon size={18} className={active ? 'text-[#c81e51]' : 'text-[#94a3b8] group-hover:text-[#0a1628]'} />
                <span className="tracking-tight">{label}</span>
                {active && <div className="absolute right-3 w-1 h-1 rounded-full bg-[#c81e51]" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        {user && (
          <div className="mt-auto space-y-6 pt-6 border-t border-[#f4f3f1]">
            {/* User card: More compact */}
            <div className="flex items-center gap-3 px-2 group">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f4f3f1] ring-2 ring-white shadow-lg relative shrink-0">
                  {user.avatar ? (
                    <Image fill src={user.avatar} alt={user.name} className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#8a8f9e]">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-[#0a1628] truncate leading-none mb-1">{user.name}</p>
                  <p className="text-[9px] text-[#94a3b8] uppercase font-black tracking-widest">{user.role || 'Member'}</p>
               </div>
               <form action={logout}>
                <button type="submit" className="p-2 hover:bg-[#fee2e2] rounded-lg transition-colors group/logout" title="Authorize Departure">
                  <LogOut size={16} className="text-[#94a3b8] group-hover/logout:text-[#c81e51] transition-colors" />
                </button>
               </form>
            </div>

            <button className="w-full bg-[#c81e51] hover:bg-[#b01a47] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#c81e51]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              Contribution
            </button>
          </div>
        )}
      </aside>

      {/* ── Main View ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
        {/* Header: More minimal */}
        <header className="h-[72px] shrink-0 flex items-center justify-end gap-8 px-10 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#f4f3f1]/50">
          <button className="group text-[#94a3b8] hover:text-[#0a1628] transition-all relative">
            <Bell size={20} strokeWidth={2.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#c81e51] rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center gap-4 text-right">
             <div className="w-px h-8 bg-[#f4f3f1]" />
             <div>
                <p className="text-[9px] uppercase tracking-widest text-[#94a3b8] mb-0.5 font-black">Legacy Yield</p>
                <DrawCountdown targetDate={nextDraw} />
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-10">
            {children}
          </div>
          
          <footer className="mt-auto py-8 border-t border-[#f4f3f1] flex justify-between items-center text-[11px] font-bold text-[#94a3b8]">
             <div className="flex items-center gap-6">
                <span className="text-[#0a1628] serif-i text-base font-black tracking-tight">Lumina Ethereal</span>
                <span className="opacity-60">© 2024 Secure Philanthropy.</span>
             </div>
             <div className="flex gap-8 uppercase tracking-widest font-black opacity-60">
                <Link href="/privacy" className="hover:text-[#c81e51] transition-colors">Privacy</Link>
                <Link href="/impact" className="hover:text-[#c81e51] transition-colors">Impact</Link>
             </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
