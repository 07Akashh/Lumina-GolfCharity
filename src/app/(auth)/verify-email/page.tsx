'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LoadingButton } from '@/components/common/LoadingButton'

export default function VerifyEmailPage() {
  const [pending, setPending] = React.useState(false)

  const handleResend = async () => {
    setPending(true)
    // resend logic here
    await new Promise(resolve => setTimeout(resolve, 2000))
    setPending(false)
    alert('Verification node re-synchronized. Check your inbox.')
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 text-center space-y-10"
      >
        <div className="w-24 h-24 bg-[#fee2e2]/50 border border-[#fee2e2] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-lg shadow-[#c81e51]/5">
          <Mail size={48} className="text-[#c81e51]" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-4">
          <h1 className="display-md text-[#0a1628] leading-tight">Verify your <span className="serif-i text-[#c81e51]">Identity</span></h1>
          <p className="text-[#8a8f9e] text-sm font-medium leading-relaxed">
            We&apos;ve dispatched a secure verification link to your email address. Please follow the instructions to authorize your membership node.
          </p>
        </div>

        <div className="pt-10 border-t border-[#f4f3f1] space-y-8 flex flex-col items-center">
          <div className="space-y-4 w-full">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Didn&apos;t receive the transmission?</p>
            <LoadingButton 
              onClick={handleResend} 
              loading={pending}
              variant="outline"
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.25em] border-[#eceae7] hover:bg-[#fafafc] rounded-2xl"
            >
              Request New Link
            </LoadingButton>
          </div>
          
          <Link href="/login" className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0a1628] hover:text-[#c81e51] transition-all group ${pending ? 'pointer-events-none opacity-50' : ''}`}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
