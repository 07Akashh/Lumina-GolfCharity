'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, ArrowRight, LogOut, Check } from 'lucide-react'
import { createCheckoutSession } from '@/modules/subscription/actions'
import { LoadingButton } from '@/components/common/LoadingButton'
import { logout } from '@/modules/auth/actions'

function PurchaseContent() {
  const searchParams = useSearchParams()
  const preferredPlanId = searchParams?.get('plan')
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null)
  const [purchaseError, setPurchaseError] = React.useState<string | null>(null)

  const TIERS = [
    {
      id: 'ethereal',
      title: 'Ethereal',
      price: 99,
      description: 'Elite draw access and community insights.',
      priceId: process.env.NEXT_PUBLIC_STRIPE_ETHEREAL_PRICE_ID!,
      color: '#c81e51'
    },
    {
      id: 'apex',
      title: 'Apex',
      price: 499,
      description: 'Dedicated high-volume node architecture.',
      priceId: process.env.NEXT_PUBLIC_STRIPE_APEX_PRICE_ID!,
      highlighted: true,
      color: '#c81e51'
    },
    {
      id: 'luminary',
      title: 'Luminary',
      price: 1999,
      description: 'Enterprise-grade philanthropic advisory.',
      priceId: process.env.NEXT_PUBLIC_STRIPE_LUMINARY_PRICE_ID!,
      color: '#0a1628'
    }
  ]

  const handlePurchase = async (priceId: string) => {
    setLoadingPlan(priceId)
    setPurchaseError(null)
    try {
      const result = await createCheckoutSession(priceId)
      if (result && 'error' in result) {
        setPurchaseError(result.error)
        setLoadingPlan(null)
      }
    } catch {
      // NEXT_REDIRECT throws — that means it succeeded
      // Any real error:
      setPurchaseError('Unexpected error. Please try again.')
      setLoadingPlan(null)
    }
  }

  // Find preferred tier
  const preferredTier = TIERS.find(t => t.priceId === preferredPlanId)

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full py-20">
      <div className="text-center space-y-4 mb-16">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c81e51]/5 rounded-full border border-[#c81e51]/10 mb-2">
            <Shield size={14} className="text-[#c81e51]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#c81e51]">Network Access Restricted</span>
         </div>
         <h1 className="display-md text-[#0a1628]">Authorize your <span className="serif-i text-[#c81e51]">membership.</span></h1>
         <p className="text-[#94a3b8] font-medium max-w-lg mx-auto">To access the collective intelligence and draw nodes, you must activate a verified membership tier.</p>
      </div>

      {preferredTier ? (
         <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
           <div className="card-lumina p-10 bg-white border-2 border-[#c81e51] shadow-2xl shadow-[#c81e51]/10 rounded-[3rem] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c81e51]/5 blur-3xl -mr-10 -mt-10" />
              
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Selected Node</p>
                    <h2 className="text-3xl font-black text-[#0a1628]">{preferredTier.title}</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-[#c81e51] serif-i">${preferredTier.price}</p>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">PER MONTH</p>
                 </div>
              </div>

              <div className="p-6 bg-[#fafafc] rounded-2xl border border-[#f4f3f1] space-y-3">
                 <div className="flex items-center gap-3 text-sm font-bold text-[#0a1628]">
                    <Check size={16} className="text-[#15803d]" /> All draw entry rights
                 </div>
                 <div className="flex items-center gap-3 text-sm font-bold text-[#0a1628]">
                    <Check size={16} className="text-[#15803d]" /> Real-time impact ledger
                 </div>
              </div>

              <LoadingButton 
                 loading={loadingPlan === preferredTier.priceId}
                 onClick={() => handlePurchase(preferredTier.priceId!)}
                 className="w-full py-5 text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#c81e51]/20 rounded-2xl"
              >
                 Finalize Membership <ArrowRight size={16} />
              </LoadingButton>
              {purchaseError && (
                <p className="text-[10px] font-bold text-red-600 text-center">{purchaseError}</p>
              )}

              <button 
                onClick={() => window.location.href = '/purchase'}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#0a1628] pt-2"
              >
                View alternative tiers
              </button>
           </div>
         </div>
      ) : (
         <div className="grid md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
           {TIERS.filter(t => t.priceId).map(tier => (
              <div key={tier.id} className="card-lumina p-10 bg-white border border-[#f4f3f1] hover:border-[#c81e51]/30 transition-all rounded-[3rem] space-y-8 relative group">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-2xl font-black text-[#0a1628]">{tier.title}</h3>
                       <p className="text-[11px] font-medium text-[#94a3b8] mt-1">{tier.description}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-[#0a1628] serif-i">${tier.price}</span>
                    </div>
                 </div>

                 <LoadingButton 
                    loading={loadingPlan === tier.priceId}
                    onClick={() => handlePurchase(tier.priceId!)}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:shadow-indigo-500/10 rounded-2xl"
                    variant={tier.highlighted ? 'primary' : 'outline'}
                 >
                    Select {tier.title} Node
                 </LoadingButton>
              </div>
           ))}
         </div>
      )}
    </main>
)
}

export default function PurchasePage() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col">
      {/* Mini Nav */}
      <nav className="p-8 flex justify-between items-center bg-white border-b border-[#f4f3f1]">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center text-white font-black italic serif-i">L</div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0a1628]">Membership Gateway</span>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#c81e51] transition-colors"
        >
          <LogOut size={14} /> Disconnect Node
        </button>
      </nav>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] animate-pulse">Establishing Session Node...</p>
        </div>
      }>
        <PurchaseContent />
      </Suspense>

      <footer className="p-12 text-center border-t border-[#f4f3f1] bg-white">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#94a3b8]">Authorized Philanthropic Network • 2026</p>
      </footer>
    </div>
  )
}
