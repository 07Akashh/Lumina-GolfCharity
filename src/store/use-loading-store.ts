import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  loadingMessage: string | null
  setIsLoading: (loading: boolean, message?: string | null) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingMessage: null,
  setIsLoading: (loading, message = null) => set({ isLoading: loading, loadingMessage: message }),
}))
