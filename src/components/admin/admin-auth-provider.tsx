'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { motion } from 'framer-motion'
import { LockClosedIcon } from '@heroicons/react/24/outline'

interface AdminAuthProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that handles admin authentication and route protection
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and not on a public route
        const loginUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
        setShouldRender(false)
      } else if (isAuthenticated && pathname === '/admin/login') {
        // Check if user came from password reset (don't auto-redirect)
        const urlParams = new URLSearchParams(window.location.search)
        const fromReset = urlParams.get('from') === 'reset'

        if (!fromReset) {
          // Redirect to dashboard if authenticated and on login page (but not from password reset)
          router.push('/admin')
          setShouldRender(false)
        } else {
          // Allow rendering login page if coming from password reset
          setShouldRender(true)
        }
      } else {
        // Allow rendering
        setShouldRender(true)
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading || !shouldRender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-soft-pink/20 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-soft-pink to-rose-gold rounded-full flex items-center justify-center mb-4">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal-black mb-2">
            {isLoading ? 'Checking Authentication...' : 'Redirecting...'}
          </h2>
          <p className="text-charcoal-black/70">
            Please wait while we verify your access.
          </p>
          
          {/* Loading spinner */}
          <div className="mt-6 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-soft-pink/30 border-t-soft-pink rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // Render children if authentication check passed
  return <>{children}</>
}

/**
 * Higher-order component for protecting individual admin pages
 */
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAdminAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const loginUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      }
    }, [isAuthenticated, isLoading, pathname, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-soft-pink/30 border-t-soft-pink rounded-full"
          />
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }

  AuthenticatedComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name})`

  return AuthenticatedComponent
}
