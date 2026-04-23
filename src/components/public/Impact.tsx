'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Globe, TrendingUp, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useLoadingStore } from '@/store/use-loading-store'

interface Charity {
  id: string
  name: string
  image_url?: string | null
  description?: string | null
}

async function getImpactStats() {
  const supabase = createClient()
  
  // Total distributed across all draws
  const { data: draws } = await supabase
    .from('draws')
    .select('prize_pool_total')
    .eq('status', 'published')

  const totalDistributed = draws?.reduce((acc, d) => acc + Number(d.prize_pool_total), 0) || 0
  const charityImpact = totalDistributed * 0.45 // 45% goes to charity model

  // Count active members
  const { count: activeMembers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Count charities
  const { count: charityCount } = await supabase
    .from('charities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return { totalDistributed, charityImpact, activeMembers, charityCount }
}

async function getCharities() {
  const supabase = createClient()
  const { data } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .limit(8)
  return data
}

export default function Impact() {
  const setIsLoading = useLoadingStore((state) => state.setIsLoading)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['impact-stats'],
    queryFn: getImpactStats,
  })

  const { data: charities, isLoading: charitiesLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: getCharities,
  })

  const isLoading = statsLoading || charitiesLoading

  useEffect(() => {
    setIsLoading(isLoading, 'Analysing foundation contributions...')
  }, [isLoading, setIsLoading])

  return (
    <main className="pt-32 pb-24">
      <section className="px-8 max-w-7xl mx-auto mb-20">
        <div className="max-w-3xl space-y-6">
          <h1 className="display-xl text-[#0a1628]">
            Our collective <span className="serif-i text-[#c81e51]">impact.</span>
          </h1>
          <p className="text-lg text-[#3d4151] leading-relaxed">
            Lumina is built on the principle of distributed philanthropy. Every
            contribution, every draw, and every winner fuels a global network of
            verified foundations.
          </p>
        </div>
      </section>

      {/* Dynamic Stats Grid */}
      <section className="px-8 max-w-7xl mx-auto mb-20 grid md:grid-cols-4 gap-6 min-h-[200px]">
        {stats ? (
          <>
            <ImpactMetric
              label="Charity Distribution"
              value={formatCurrency(stats.charityImpact)}
              icon={<Heart className="text-[#c81e51]" />}
              description="Total funds delivered to partner foundations."
            />
            <ImpactMetric
              label="Total Prize Pools"
              value={formatCurrency(stats.totalDistributed)}
              icon={<TrendingUp className="text-[#3b82f6]" />}
              description="Collective value of all Lumina draw cycles."
            />
            <ImpactMetric
              label="Active Philanthropists"
              value={(stats.activeMembers || 0).toLocaleString()}
              icon={<Users className="text-[#15803d]" />}
              description="Members currently contributing to the legacy."
            />
            <ImpactMetric
              label="Verified Foundations"
              value={(stats.charityCount || 0).toString()}
              icon={<Globe className="text-[#6366f1]" />}
              description="Global partners receiving Lumina support."
            />
          </>
        ) : (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card-lumina p-8 animate-pulse bg-[#f4f3f1] h-40" />
          ))
        )}
      </section>

      {/* Charities section */}
      <section className="bg-[#f4f3f1] py-24">
        <div className="px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="display-md text-[#0a1628]">Partner Foundations</h2>
            <p className="text-[#8a8f9e] max-w-lg mx-auto">
              We partner with verified, high-impact organisations across
              environmental, social, and cultural sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 min-h-[400px]">
            {charities ? (
              (charities as Charity[]).map((ch) => (
                <div
                  key={ch.id}
                  className="card-lumina p-8 text-center space-y-4 hover:translate-y-1 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#eceae7] flex items-center justify-center mx-auto shadow-sm overflow-hidden relative">
                    {ch.image_url ? (
                      <Image
                        src={ch.image_url}
                        alt={ch.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 150px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <Heart size={24} className="text-[#c81e51]/20" />
                    )}
                  </div>
                  <h3 className="font-bold text-[#0a1628]">{ch.name}</h3>
                  <p className="text-[11px] text-[#8a8f9e] line-clamp-2">
                    {ch.description}
                  </p>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="card-lumina p-8 animate-pulse bg-white/50 h-56" />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function ImpactMetric({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="card-lumina p-8 space-y-4 border-l-4 border-[#c81e51]/10">
      <div className="w-10 h-10 rounded-xl bg-[#f4f3f1] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8a8f9e]">
          {label}
        </p>
        <p className="text-3xl font-black text-[#0a1628] mt-1">{value}</p>
      </div>
      <p className="text-[11px] text-[#3d4151] leading-relaxed opacity-60">
        {description}
      </p>
    </div>
  );
}
