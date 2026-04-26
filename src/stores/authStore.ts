import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User { email: string; role: string }

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setSession: (access: string, refresh: string, user: any) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (access, refresh, user) => set({ accessToken: access, refreshToken: refresh, user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'client-auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)
