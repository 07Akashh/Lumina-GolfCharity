'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { resetPassword } from '@/modules/auth/actions'
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (fd: FormData) => {
    setPending(true)
    setError(null)
    
    const pw = fd.get('password') as string
    const cpw = fd.get('confirmPassword') as string

    if (pw !== cpw) {
      setError("Security keys do not match.")
      setPending(false)
      return
    }

    const res = await resetPassword(fd)
    if (res?.error) { 
      setError(res.error)
      setPending(false) 
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex relative">
      {/* Cinematic Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0a1628] flex-col justify-between p-20 relative overflow-hidden">
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
               Secret <br />
               <span className="serif-i text-[#c81e51] italic">Regeneration.</span>
             </h2>
             <p className="text-white/40 text-lg leading-relaxed max-w-sm font-medium">
               Establish a new security key to re-authorize your presence in the foundation network.
             </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
           <ShieldCheck size={20} className="text-[#c81e51]" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Encryption Active</p>
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
               <h1 className="display-md text-[#0a1628] leading-tight">Reset <span className="serif-i text-[#c81e51]">Key</span></h1>
               <p className="text-[#8a8f9e] text-sm font-medium">Establish a robust security key for future authorizations.</p>
             </div>
          </header>

          <form action={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60 ml-1">New Security Key</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a8f9e] group-focus-within:text-[#c81e51] transition-colors"><Lock size={18} /></div>
                   <input
                     name="password" type={showPw ? 'text' : 'password'} required
                     placeholder="Min. 8 characters"
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

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3d4151] opacity-60 ml-1">Confirm Security Key</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a8f9e] group-focus-within:text-[#c81e51] transition-colors"><Lock size={18} /></div>
                   <input
                     name="confirmPassword" type={showPw ? 'text' : 'password'} required
                     placeholder="••••••••"
                     disabled={pending}
                     className="input-lumina py-4 bg-[#fcfbf9] border-[#f4f3f1] hover:border-[#eceae7] focus:border-[#c81e51] disabled:opacity-50"
                   />
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
               Establish New Key <ArrowRight size={16} />
             </LoadingButton>
          </form>

          <footer className="pt-8 border-t border-[#f4f3f1] text-center">
             <p className="text-xs font-medium text-[#8a8f9e]">
               Remembered your key?{' '}
               <Link href="/login" className="text-[#0a1628] font-bold underline decoration-[#c81e51] underline-offset-4 hover:text-[#c81e51] transition-colors">
                 Back to Sign in
               </Link>
             </p>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
