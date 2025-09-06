'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  username: string
  email: string | null
  role: 'admin'
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  checkAdminStatus: () => Promise<boolean>
  clearAllSessions: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Check if user is admin
  const checkAdminStatus = async (userToCheck?: AdminUser | null): Promise<boolean> => {
    const targetUser = userToCheck || user
    if (!targetUser) return false

    // Admin users from admin_users table are always admin
    const adminStatus = targetUser.role === 'admin'
    setIsAdmin(adminStatus)
    return adminStatus
  }

  // Sign in with username using admin_users table
  const signIn = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }

      if (data.user) {
        setUser(data.user)
        setIsAdmin(true)
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Clear all auth state first
      setUser(null)
      setIsAdmin(false)

      // Call logout API to clear session cookie
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })

      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all sessions (useful for debugging)
  const clearAllSessions = async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Clear all auth state
      setUser(null)
      setIsAdmin(false)

      // Call logout API to clear session cookie
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })

      // Clear any remaining browser storage
      if (typeof window !== 'undefined') {
        // Clear all localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('admin-') || key.startsWith('auth-')) {
            localStorage.removeItem(key)
          }
        })

        // Clear all sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('admin-') || key.startsWith('auth-')) {
            sessionStorage.removeItem(key)
          }
        })

        // Clear admin session cookie manually
        document.cookie = 'admin-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }
    } catch (error) {
      console.error('Clear sessions error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a valid session
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            console.log('Found existing session for user:', data.user.email || data.user.username)
            setUser(data.user)
            await checkAdminStatus(data.user)
          } else {
            console.log('No valid session found')
          }
        } else {
          console.log('Session verification failed')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAdmin,
    signIn,
    signOut,
    checkAdminStatus,
    clearAllSessions,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Hook for protecting admin routes
export function useAdminRouteProtection() {
  const { user, isLoading, isAdmin } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAdmin) {
        router.push('/admin/login')
      }
    }
  }, [user, isLoading, isAdmin, router])

  return { isAuthenticated: user && isAdmin, isLoading }
}
