'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface UseAdminAuthReturn extends AuthState {
  login: (password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

/**
 * Custom hook for admin authentication management
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          isAuthenticated: data.authenticated || false,
          isLoading: false,
          error: null,
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      })
    }
  }, [])

  /**
   * Login function
   */
  const login = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        return { success: true }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: data.message || 'Login failed',
        })
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'An unexpected error occurred during login'
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Logout function
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      // Call logout API
      const response = await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include',
      })

      // Always update state to logged out, even if API call fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      // Redirect to login page
      router.push('/admin/login')

      // Force a page reload to clear any cached data
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
      
      // Still log out locally even if API call fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      
      // Force redirect to login
      window.location.href = '/admin/login'
    }
  }, [router])

  /**
   * Check authentication on mount
   */
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  }
}

/**
 * Hook to protect admin routes on the client side
 */
export function useAdminRouteProtection() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}
