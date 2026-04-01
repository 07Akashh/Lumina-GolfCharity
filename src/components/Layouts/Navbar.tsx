'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { useUserStore } from '@/store/use-user-store'
import { logout } from '@/modules/auth/actions'

export default function Navbar() {
  const profile = useUserStore((s) => s.profile)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  // Hide navbar on dashboard, admin, and auth pages — they have their own specific layouts
  const isAppPage = pathname?.startsWith('/user') || 
                    pathname?.startsWith('/admin') || 
                    pathname?.startsWith('/login') || 
                    pathname?.startsWith('/register') ||
                    pathname?.startsWith('/verify-email') ||
                    pathname?.startsWith('/profile') ||
                    pathname?.startsWith('/settings') ||
                    pathname?.startsWith('/portfolio') ||
                    pathname?.startsWith('/metrics')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (isAppPage) return null

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 glass-crystal ${
        scrolled ? 'shadow-sm border-b' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-8 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="serif-i text-2xl font-bold text-[#0a1628] hover:text-[#c81e51] transition-colors">
          Lumina
        </Link>

        {/* Centre Nav */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Memberships', href: '/memberships' },
            { label: 'Impact',      href: '/impact' },
            { label: 'Legacy',      href: '/legacy' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-[#3d4151] hover:text-[#0a1628] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-[#c81e51] rounded group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {profile ? (
            <div className="flex items-center gap-3">
              <Link
                href="/user"
                className="text-[11px] font-bold uppercase tracking-widest text-[#3d4151] hover:text-[#0a1628] transition-colors"
              >
                Dashboard
              </Link>
              <div className="w-px h-4 bg-[#e3e2e0]" />
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full overflow-hidden bg-[#f4f3f1] border-2 border-white shadow-sm hover:border-[#c81e51] transition-all"
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-[#8a8f9e]" /></div>
                )}
              </Link>
              <button
                onClick={() => logout()}
                className="w-8 h-8 rounded-full bg-[#f4f3f1] flex items-center justify-center text-[#8a8f9e] hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
               <Link href="/login" className="text-sm font-bold text-[#3d4151] hover:text-[#0a1628] transition-colors">
                  Login
               </Link>
               <Link href="/memberships" className="btn-primary text-sm px-6 py-2.5">
                  Support Impact
               </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
