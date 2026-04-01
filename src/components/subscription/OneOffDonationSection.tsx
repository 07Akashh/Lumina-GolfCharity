'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'
import { createDonationSession } from '@/modules/subscription/actions'

export function OneOffDonationSection() {
  const [loadingAmt, setLoadingAmt] = React.useState<number | null>(null)

  const handleDonate = async (amt: number) => {
    setLoadingAmt(amt)
    try {
      await createDonationSession(amt)
    } catch (error) {
      console.error(error)
      setLoadingAmt(null)
    }
  }

  return (
    <section className="py-20 px-8">
      <div className="max-w-2xl mx-auto bg-[#0a1628] rounded-[2rem] p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c81e51]/10 blur-3xl -mr-10 -mt-10" />
        
        <div className="w-12 h-12 rounded-2xl bg-[#c81e51]/20 flex items-center justify-center mx-auto">
          <Heart size={22} className="text-[#c81e51]" />
        </div>
        <h2 className="display-sm text-white font-black">Direct Philanthropic Injection</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
          100% of your contribution is directed to active partner nodes. No platform overhead is applied to direct injections.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {[25, 50, 100, 250].map((amt) => (
            <LoadingButton 
              key={amt} 
              loading={loadingAmt === amt}
              onClick={() => handleDonate(amt)}
              className="bg-white/5 border border-white/10 hover:border-[#c81e51] text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-white/10"
            >
              Donate ${amt}
            </LoadingButton>
          ))}
        </div>
      </div>
    </section>
  )
}
