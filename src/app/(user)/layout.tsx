import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

import { getUserMetaServer } from '@/lib/user-meta'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // COOKIE-FIRST: Get metadata for instant UI and access check
  let meta = await getUserMetaServer()
  let isActive = meta?.isActive ?? false

  // FALLBACK/SYNC: If meta is missing OR user is inactive, sync with DB to check for recent upgrades
  if (!meta || !isActive) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, subscriptions(status, plan)')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      isActive = (profile.subscriptions as { status: string } | null)?.status === 'active'
      meta = {
        name: profile.full_name || 'Philanthropist',
        role: profile.role || 'MEMBER',
        avatar: profile.avatar_url || undefined,
        isActive
      }
      // Note: We don't SET the cookie here to keep the Layout lean, 
      // but the Hydrator/Actions will handle persistence.
    }
  }

  const role = meta?.role || 'USER'

  // ADMINS: Exempt from subscription gate
  // MEMBER ACCESS GUARD
  if (role !== 'ADMIN' && !isActive) {
    redirect('/purchase')
  }

  const userData = {
    name: meta?.name || 'Philanthropist',
    role: meta?.role || 'MEMBER',
    avatar: meta?.avatar,
  }

  const { data: nextDraw } = await supabase
    .from('draws')
    .select('scheduled_at')
    .in('status', ['scheduled', 'simulated'])
    .gt('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  // DashboardLayout handles the sidebar and navigation shell
  return (
    <DashboardLayout user={userData} nextDraw={nextDraw?.scheduled_at}>
      {children}
    </DashboardLayout>
  )
}
