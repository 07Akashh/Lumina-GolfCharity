'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Heart, Zap, Star } from 'lucide-react'
import Image from 'next/image'
import { MembershipTierCard } from '@/components/subscription/MembershipTierCard'
import { OneOffDonationSection } from '@/components/subscription/OneOffDonationSection'
import { useQuery } from '@tanstack/react-query'
import { useLoadingStore } from '@/store/use-loading-store'

interface Charity {
  id: string
  name: string
  image_url?: string | null
  website_url?: string | null
  description?: string | null
}

async function getMembershipData() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let currentPlan: string | null = null
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle()
    if (sub?.status === 'active') currentPlan = sub.plan
  }

  const { data: charities } = await supabase.from('charities').select('*').order('name')

  return { user, currentPlan, charities: charities || [] }
}

export default function Memberships() {
  const setIsLoading = useLoadingStore((state) => state.setIsLoading)

  const { data, isLoading } = useQuery({
    queryKey: ['membership-page-data'],
    queryFn: getMembershipData,
  })

  useEffect(() => {
    setIsLoading(isLoading, 'Configuring membership layers...')
  }, [isLoading, setIsLoading])

  const user = data?.user
  const currentPlan = data?.currentPlan
  const charities = data?.charities || []

  const TIERS = [
    {
      id: 'ethereal',
      title: 'Ethereal',
      price: 99,
      description: 'Begin your philanthropic journey with elite draw access and community insights.',
      features: [
        '5 Monthly Foundation Nodes',
        'Legacy Impact Report',
        'Community Portfolio Access',
        'Standard Draw Participation',
        'Charity Selection',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_ETHEREAL_PRICE_ID!,
      icon: <Heart size={20} className="text-[#c81e51]" />,
    },
    {
      id: 'apex',
      title: 'Apex',
      price: 499,
      description: 'Our most impactful tier. Designed for the dedicated, high-volume contributor.',
      features: [
        '25 Monthly Foundation Nodes',
        'Quarterly Concierge Ledger',
        'VIP Invitational Access',
        'Priority Legacy Rights',
        'Dedicated Impact Advisor',
        'Tax Efficiency Reports',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_APEX_PRICE_ID!,
      highlighted: true,
      icon: <Star size={20} className="text-[#c81e51]" />,
    },
    {
      id: 'luminary',
      title: 'Luminary',
      price: 1999,
      description: 'Enterprise-grade philanthropy. Custom foundation nodes and board-level advisory.',
      features: [
        '100 Monthly Foundation Nodes',
        'Custom Foundation Hub',
        'Advisory Board Appointment',
        'Public Foundation Badge',
        'Dedicated Architecture Team',
        'White-glove Verification',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_LUMINARY_PRICE_ID!,
      icon: <Zap size={20} className="text-[#c81e51]" />,
    },
  ]

  return (
      <main className="pt-24 pb-12">
        {/* Hero */}
        <section className="bg-[#0a1628] py-24 px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#c81e51]/5 blur-[120px] translate-y-1/2" />
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
              <Shield size={13} className="text-[#c81e51]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Membership Protocol</span>
            </div>
            <h1 className="display-xl text-white">
              Choose your{' '}
              <span className="serif-i text-[#c81e51]">legacy.</span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Every tier unlocks draw entries, impact tracking, and direct contributions to partner charities. Verified by blockchain ledger.
            </p>
          </div>
        </section>

        {/* Pricing Grid */}
        <div className="py-20 px-8 max-w-7xl mx-auto -mt-20 relative z-20">
           <div className="grid lg:grid-cols-3 gap-8 items-end min-h-[400px]">
              {data ? TIERS.map(tier => (
                 <MembershipTierCard 
                    key={tier.id} 
                    tier={tier} 
                    isCurrent={currentPlan === tier.id} 
                    isGuest={!user}
                 />
              )) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="card-lumina p-10 animate-pulse bg-white/50 h-[500px]" />
                ))
              )}
           </div>
        </div>

        {/* Charity beneficiaries */}
        <section className="py-24 px-8 bg-[#f4f3f1]/50 border-y border-[#f4f3f1]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="display-md text-[#0a1628]">Beneficiary Network Nodes</h2>
              <p className="text-sm text-[#94a3b8] font-medium max-w-lg mx-auto">Your contribution is autonomously directed to these high-impact organizations.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[300px]">
              {charities.length > 0 ? (charities as Charity[]).map((ch) => (
                <div key={ch.id} className="card-lumina p-8 text-center space-y-4 group hover:-translate-y-1 transition-all duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-[#fafafc] border border-[#f4f3f1] flex items-center justify-center mx-auto transition-all group-hover:scale-105 group-hover:border-[#c81e51]/20 overflow-hidden relative">
                    {ch.image_url ? (
                      <Image src={ch.image_url} alt={ch.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <Heart size={20} className="text-[#c81e51]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0a1628]">{ch.name}</p>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mt-1">Verified Node</p>
                  </div>
                  {ch.website_url && (
                    <a href={ch.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[#c81e51] hover:underline underline-offset-4">Learn more</a>
                  )}
                </div>
              )) : (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-lumina p-8 animate-pulse bg-white/50 h-56" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* One-off donation */}
        <OneOffDonationSection />

        {/* FAQs */}
        <section className="py-24 px-8 max-w-3xl mx-auto space-y-10">
          <header className="text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c81e51] mb-2">Protocol FAQ</p>
             <h2 className="display-sm text-[#0a1628]">Network Clarifications</h2>
          </header>
          
          <div className="space-y-6">
            {[
              { q: 'How are winners selected?', a: 'Our Stochastic Weighted Probability engine selects draw numbers based on member score frequency. The more consistent your contributions, the more influence your numbers carry.' },
              { q: 'Can I change my charity?', a: 'Yes. You can update your beneficiary selection from your Portfolio dashboard at any time. Changes apply to the next draw cycle.' },
              { q: 'Is my subscription tax-deductible?', a: 'The charity portion of your contribution may be tax-deductible depending on your jurisdiction. We provide an annual tax ledger report for all members.' },
              { q: 'What happens if no one matches the top tier?', a: 'Unclaimed tier-5 prize pools roll over to the next draw cycle, scaling the prize for all participants.' },
            ].map(({ q, a }) => (
              <div key={q} className="card-lumina p-8 bg-white border border-[#f4f3f1] space-y-4 hover:border-[#c81e51]/20 transition-all">
                <h3 className="font-black text-[#0a1628] flex gap-3"><span className="text-[#c81e51]">Q:</span> {q}</h3>
                <div className="h-px w-8 bg-[#f4f3f1]" />
                <p className="text-sm text-[#8a8f9e] leading-relaxed font-medium"><span className="text-[#0a1628] font-bold mr-2">A:</span> {a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
  )
}
