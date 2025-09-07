'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/admin-auth-context'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAdminAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/admin/login' as any)
      } else {
        // Authenticated, allow access
        setIsChecking(false)
      }
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pure-white to-soft-pink/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-pink mx-auto mb-4"></div>
          <p className="text-charcoal-black/70">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
