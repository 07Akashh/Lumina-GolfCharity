'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Settings, Heart, Trophy, CreditCard, LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MENU = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'All Users', icon: Users, href: '/admin/users' },
  { label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
  { label: 'Draw Engine', icon: Settings, href: '/admin/draws' },
  { label: 'Claims & Payouts', icon: Trophy, href: '/admin/winners' },
  { label: 'Charity Network', icon: Heart, href: '/admin/charities' },
]

export function AdminSidebarMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      alert('Failed to terminate secure instance.')
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      <nav className="space-y-1.5 flex-1 mt-8">
        {MENU.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-5 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#fafafc] text-[#0a1628] border border-[#eceae7] shadow-[0_2px_12px_rgba(0,0,0,0.02)]' 
                  : 'text-[#94a3b8] hover:text-[#0a1628] hover:bg-[#fafafc] border border-transparent'
              }`}
            >
              <item.icon size={16} className={isActive ? 'text-[#c81e51]' : 'opacity-40'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 mt-4 px-5 py-4 bg-[#fee2e2]/50 hover:bg-[#fee2e2] text-[#c81e51] rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors mb-2 disabled:opacity-50"
      >
        {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        Terminate Session
      </button>
    </div>
  )
}
