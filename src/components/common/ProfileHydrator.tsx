'use client'

import React from 'react'
import { useUserStore } from '@/store/use-user-store'
import { Profile } from '@/types'
import { UserMeta } from '@/lib/user-meta'

export default function ProfileHydrator({ 
  profile, 
  meta 
}: { 
  profile?: Profile | null; 
  meta?: UserMeta | null 
}) {
  const setProfile = useUserStore((state) => state.setProfile)
  const setUserMeta = useUserStore((state) => state.setUserMeta)
  const setLoading = useUserStore((state) => state.setLoading)

  React.useEffect(() => {
    if (meta) {
      setUserMeta(meta)
    }
    if (profile) {
      setProfile(profile)
    }
    setLoading(false)
  }, [profile, meta, setProfile, setUserMeta, setLoading])

  return null
}
