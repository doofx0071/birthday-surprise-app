'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AdminAuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  checkAdminStatus: () => Promise<boolean>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Check if user is admin
  const checkAdminStatus = async (userToCheck?: User | null): Promise<boolean> => {
    const targetUser = userToCheck || user
    if (!targetUser) return false

    // Check user metadata for admin role
    const adminStatus = targetUser.user_metadata?.role === 'admin' || targetUser.app_metadata?.role === 'admin'
    setIsAdmin(adminStatus)
    return adminStatus
  }

  // Sign in with username (we'll use email field for username)
  const signIn = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // For username-based auth, we'll use a custom email format
      const email = `${username}@admin.local`
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Check admin status directly from the user object
        const adminStatus = data.user.user_metadata?.role === 'admin' || data.user.app_metadata?.role === 'admin'

        if (!adminStatus) {
          await supabase.auth.signOut()
          return { success: false, error: 'Access denied. Admin privileges required.' }
        }

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
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await checkAdminStatus(session.user)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await checkAdminStatus(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAdmin(false)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAdmin,
    signIn,
    signOut,
    checkAdminStatus,
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
