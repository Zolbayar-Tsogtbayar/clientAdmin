'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function Root() {
  const router = useRouter()
  const accessToken = useAuthStore(s => s.accessToken)

  useEffect(() => {
    router.replace(accessToken ? '/dashboard' : '/login')
  }, [accessToken, router])

  return null
}
