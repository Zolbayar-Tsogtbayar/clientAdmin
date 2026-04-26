'use client'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
    useProjectStore.persist.rehydrate()
  }, [])
  return (
    <>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontSize: 13 } }} />
    </>
  )
}
