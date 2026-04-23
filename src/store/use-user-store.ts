import { create } from 'zustand'
import { Profile } from '@/types/dashboard'
import { UserMeta } from '@/lib/user-meta'

interface UserState {
  profile: Profile | null;
  meta: UserMeta | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setUserMeta: (meta: UserMeta | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  meta: null, 
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setUserMeta: (meta) => set({ meta, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
