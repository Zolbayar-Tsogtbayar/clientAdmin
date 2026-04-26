'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import ClientDashboard from '@/components/ClientDashboard'

export default function DashboardPage() {
  const router = useRouter()
  const accessToken = useAuthStore(s => s.accessToken)

  useEffect(() => {
    if (!accessToken) router.replace('/login')
  }, [accessToken, router])

  if (!accessToken) return null
  return <ClientDashboard />
}
