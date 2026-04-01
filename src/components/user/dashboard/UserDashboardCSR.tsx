'use client'

import React from 'react'
import { useApiQuery } from '@/lib/api-client'
import { StatsSkeleton, ChartSkeleton, RightPanelSkeleton } from './DashboardSkeletons'

// Modular Components
import { DashboardHeader } from './modules/DashboardHeader'
import { HeroStats } from './modules/HeroStats'
import { WinnerNotification } from './modules/WinnerNotification'
import { HandicapProgress } from './modules/HandicapProgress'
import { NodeConsole } from './modules/NodeConsole'
import { ImpactMatrix } from './modules/ImpactMatrix'
import { TopWinnersLeaderboard } from './modules/TopWinnersLeaderboard'
import { ImpactStories } from './modules/ImpactStories'

interface DashboardData {
  totalWon?: number;
  profile?: {
    full_name?: string;
    charity_id?: string;
    contribution_percentage?: number;
  };
  stats?: {
    total_lives_impacted?: number;
  };
  winnings?: Array<{
    id: string;
    status: string;
    prize_amount: number;
    draws?: {
      type: string;
    };
  }>;
  stories?: Array<{
    category?: string;
    image_url?: string;
    title?: string;
  }>;
  scores?: Array<{ value: number; id: string }>;
  charities?: Array<{
    id: string;
    name: string;
    description?: string;
    image_url?: string;
  }>;
  topWinners?: Array<{
    name: string;
    amount: number;
    type: string;
    date: string;
  }>;
}

import { motion, AnimatePresence } from 'framer-motion'

import { useUserStore } from '@/store/use-user-store'

export function UserDashboardCSR() {
  const { data, isLoading: loading, error } = useApiQuery<DashboardData>('/user/dashboard')
  const setUserMeta = useUserStore(s => s.setUserMeta)

  React.useEffect(() => {
    if (data?.profile) {
      setUserMeta({
        name: data.profile.full_name || 'Philanthropist',
        role: 'MEMBER',
        avatar: (data.profile as { avatar_url?: string }).avatar_url,
        isActive: true, // If they are in the dashboard, they're active
        livesImpacted: data.stats?.total_lives_impacted
      })
    }
  }, [data, setUserMeta])

  if (loading) {
    return (
      <div className="space-y-12">
        <StatsSkeleton />
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
             <ChartSkeleton />
             <div className="card-lumina h-80 bg-[#f4f3f1] animate-pulse" />
          </div>
          <div className="space-y-8">
             <RightPanelSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-lumina p-12 text-center space-y-4 border-red-500/10">
        <p className="text-red-500 font-bold">Failed to synchronize impact nodes.</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-8">Retry Sync</button>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-10"
      >
        {/* 1. Header & Claims Portal Hub */}
        <DashboardHeader 
          userName={data?.profile?.full_name} 
          livesImpacted={data?.stats?.total_lives_impacted}
          activeWinnings={data?.winnings}
        />
        
        {/* 2. Hero Summary Matrix */}
        <HeroStats totalWon={data?.totalWon} />

        {/* 3. Global Award Notifications */}
        <WinnerNotification activeWinnings={data?.winnings} />

        {/* 4. Core Operational Matrix */}
        <div className="grid lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-10">
              {/* Performance Node Graph */}
              {/* <HandicapProgress /> */}

              {/* Verified Network Yields */}
              <TopWinnersLeaderboard winners={data?.topWinners} />
           </div>

           <div className="space-y-10">
              {/* Participation Node Control */}
              <NodeConsole scores={data?.scores} />

              {/* Impact & Philanthropy Selection */}
              <ImpactMatrix 
                charityId={data?.profile?.charity_id}
                charityName={data?.charities?.find(c => c.id === data?.profile?.charity_id)?.name}
                percentage={data?.profile?.contribution_percentage}
                charities={data?.charities}
              />
           </div>
        </div>

        {/* 5. Humanitarian Visual Feed */}
        <ImpactStories stories={data?.stories} />
      </motion.div>
    </AnimatePresence>
  )
}
