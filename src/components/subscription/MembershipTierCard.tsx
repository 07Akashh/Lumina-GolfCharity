'use client'

import React from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { LoadingButton } from '@/components/common/LoadingButton'
import { createCheckoutSession } from '@/modules/subscription/actions'

interface TierProps {
  tier: {
    id: string
    title: string
    price: number
    description: string
    features: string[]
    priceId: string | null
    icon: React.ReactNode
    highlighted?: boolean
  }
  isCurrent: boolean
  isGuest?: boolean
}

export function MembershipTierCard({ tier, isCurrent, isGuest }: TierProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSelect = async () => {
    if (!tier.priceId) return
    setLoading(true)
    setError(null)
    try {
      const result = await createCheckoutSession(tier.priceId)
      // If we get here without redirect, it means an error was returned
      if (result && 'error' in result) {
        setError(result.error)
        setLoading(false)
      }
      // If redirect() was called, execution stops — no need to handle success
    } catch {
      // NEXT_REDIRECT is thrown as a special error — do not catch it
      // Any real unexpected error:
      setError('Unexpected error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className={`rounded-[1.5rem] p-10 space-y-8 relative transition-all ${
        tier.highlighted
          ? 'bg-white shadow-[0_20px_60px_rgba(200,30,81,0.1)] scale-[1.04] z-10'
          : 'bg-[#f4f3f1]'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c81e51] text-white text-[10px] font-black uppercase tracking-wider px-5 py-1.5 rounded-full">
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#fee2e2] flex items-center justify-center">
          {tier.icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8a8f9e]">{tier.title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#0a1628] serif-i">${tier.price}</span>
            <span className="text-[11px] text-[#8a8f9e]">/ mo</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#3d4151] leading-relaxed">{tier.description}</p>

      <ul className="space-y-3.5">
        {tier.features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-sm font-medium text-[#3d4151]">
            <Check size={14} className="text-[#c81e51] shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="w-full py-3.5 rounded-full text-center text-sm font-bold bg-[#dcfce7] text-[#15803d]">
          ✓ Your Current Plan
        </div>
      ) : tier.priceId ? (
        <div className="space-y-2">
          <LoadingButton
            loading={loading}
            onClick={handleSelect}
            className={`w-full py-3.5 rounded-full text-sm font-bold transition-all ${
              tier.highlighted
                ? 'bg-[#c81e51] text-white'
                : 'bg-[#0a1628] text-white'
            }`}
          >
            {isGuest ? 'Sign up to Join' : (tier.highlighted ? `Join ${tier.title}` : 'Select Tier')} <ArrowRight size={15} className="inline ml-1" />
          </LoadingButton>
          {error && (
            <p className="text-[10px] font-bold text-red-600 text-center pt-1">{error}</p>
          )}
        </div>
      ) : (
        <a
          href="mailto:concierge@lumina.co"
          className="block w-full py-3.5 rounded-full text-sm font-bold text-center border border-[#e3e2e0] text-[#0a1628] hover:border-[#c81e51] transition-all"
        >
          Contact Architecture Team
        </a>
      )}
    </div>
  )
}
