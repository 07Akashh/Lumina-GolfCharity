'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { login } from '@/modules/auth/actions'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (fd: FormData) => {
    setPending(true)
    setError(null)
    const res = await login(fd)
    if (res?.error) { setError(res.error); setPending(false) }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex relative">
      {/* Cinematic Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0a1628] flex-col justify-between p-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c81e51]/10 blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#003731]/20 blur-[120px] translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 transition-transform duration-700 hover:scale-[1.02]">
          <Link href="/" className="serif-i text-3xl font-black text-white tracking-tight">Lumina</Link>
          <div className="h-px w-12 bg-[#c81e51] mt-4" />
        </div>

        <div className="relative z-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
             <h2 className="display-lg text-white leading-[1.1] tracking-tight">
               Welcome back,<br />
               <span className="serif-i text-[#c81e51] italic">Foundation Lead.</span>
             </h2>
             <p className="text-white/40 text-lg leading-relaxed max-w-sm font-medium">
               Your contribution node is verified. Access your impact metrics and manage your foundation legacy.
             </p>
          </motion.div>

          {/* Animated Stats Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="glass-crystal p-8 rounded-3xl border-white/5 space-y-6 bg-white/5"
          >
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c81e51] mb-1">Impact Network</p>
                 <p className="text-3xl font-black text-white">48,209</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Active Ledger</p>
                 <p className="text-xl font-bold text-white/80">Live</p>
              </div>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-sm font-bold text-white/90">$1.94M</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Impact</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">12,401</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Subscribers</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Editorial / Autumn 2024</p>
        </div>
      </div>

      {/* Modern High-End Form */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white lg:rounded-l-[3rem] shadow-2xl shadow-black/5 z-20 overflow-y-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           className="w-full max-w-md space-y-12"
        >
          <header className="space-y-4">
             <div className="w-12 h-1 bg-[#c81e51] rounded-full" />
             <div className="space-y-1">
               <h1 className="display-md text-[#0a1628] leading-tight">Access your <span className="serif-i text-[#c81e51]">Portfolio</span></h1>
               <p className="text-[#8a8f9e] text-sm font-medium">Verify your credentials to enter the impact network.</p>
             </div>
          </header>

          <form action={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60 ml-1">Identity</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a8f9e] group-focus-within:text-[#c81e51] transition-colors"><Mail size={18} /></div>
                   <input
                     name="email" type="email" required
                     placeholder="you@philanthropy.com"
                     disabled={pending}
                     className="input-lumina py-4 bg-[#fcfbf9] border-[#f4f3f1] hover:border-[#eceae7] focus:border-[#c81e51] disabled:opacity-50"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60">Security Key</label>
                   <Link href="/forgot-password" className={`text-[10px] font-black uppercase tracking-widest text-[#c81e51] hover:underline transition-all ${pending ? 'pointer-events-none opacity-50' : ''}`}>Forgot Key?</Link>
                </div>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a8f9e] group-focus-within:text-[#c81e51] transition-colors"><Lock size={18} /></div>
                   <input
                     name="password" type={showPw ? 'text' : 'password'} required
                     placeholder="••••••••"
                     disabled={pending}
                     className="input-lumina pr-14 py-4 bg-[#fcfbf9] border-[#f4f3f1] hover:border-[#eceae7] focus:border-[#c81e51] disabled:opacity-50"
                   />
                   <button 
                     type="button" 
                     onClick={() => setShowPw(!showPw)} 
                     disabled={pending}
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8a8f9e] hover:text-[#0a1628] transition-colors p-1 disabled:opacity-50"
                   >
                     {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
             </div>

             {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-[#fee2e2]/30 border border-[#fee2e2] rounded-2xl p-4 text-center"
                >
                  <p className="text-xs font-bold text-[#c81e51]">{error}</p>
                </motion.div>
             )}

             <LoadingButton
               type="submit"
               loading={pending}
               className="w-full py-4 text-sm font-bold shadow-xl shadow-[#c81e51]/20"
             >
               Authorize Access <ArrowRight size={16} />
             </LoadingButton>
          </form>

          <footer className="pt-8 border-t border-[#f4f3f1] text-center space-y-4">
             <p className="text-xs font-medium text-[#8a8f9e]">
               New to the network?{' '}
               <Link href="/register" className="text-[#0a1628] font-bold underline decoration-[#c81e51] underline-offset-4 hover:text-[#c81e51] transition-colors">
                 Submit membership application
               </Link>
             </p>
             <div className="flex justify-center gap-6 pt-2">
                <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e] hover:text-[#3d4151]">Privacy</Link>
                <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e] hover:text-[#3d4151]">Security Ledger</Link>
             </div>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
