'use client'

import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { BirthdayCard } from '@/components/birthday-card'

export default function DebugSessionPage() {
  const { user, isAdmin, isLoading, signOut, clearAllSessions } = useAdminAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [storageData, setStorageData] = useState<any>({})
  const [adminUsers, setAdminUsers] = useState<any>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionData({ session, error })
    }

    const checkStorage = () => {
      if (typeof window !== 'undefined') {
        const localStorage: Record<string, string | null> = {}
        const sessionStorage: Record<string, string | null> = {}

        // Check localStorage
        Object.keys(window.localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage[key] = window.localStorage.getItem(key)
          }
        })

        // Check sessionStorage
        Object.keys(window.sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            sessionStorage[key] = window.sessionStorage.getItem(key)
          }
        })

        setStorageData({ localStorage, sessionStorage })
      }
    }

    const checkAdminUsers = async () => {
      try {
        const response = await fetch('/api/admin/check-users')
        const data = await response.json()
        setAdminUsers(data)
      } catch (error) {
        console.error('Error fetching admin users:', error)
        setAdminUsers({ error: 'Failed to fetch admin users' })
      }
    }

    checkSession()
    checkStorage()
    checkAdminUsers()
  }, [supabase])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal-black">Session Debug</h1>
        <div className="space-x-4">
          <Button onClick={handleRefresh} variant="outline">
            Refresh Page
          </Button>
          <Button onClick={clearAllSessions} variant="destructive">
            Clear All Sessions
          </Button>
          <Button onClick={signOut} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auth Context State */}
        <BirthdayCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>User:</strong> {user ? user.email : 'None'}</div>
            <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
            <div><strong>User ID:</strong> {user?.id || 'None'}</div>
            <div><strong>User Role (metadata):</strong> {user?.user_metadata?.role || 'None'}</div>
            <div><strong>User Role (app_metadata):</strong> {user?.app_metadata?.role || 'None'}</div>
          </div>
        </BirthdayCard>

        {/* Admin Users in Database */}
        <BirthdayCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Users in Database</h2>
          <div className="text-sm">
            {adminUsers ? (
              adminUsers.error ? (
                <div className="text-red-600">{adminUsers.error}</div>
              ) : (
                <div className="space-y-4">
                  {/* admin_users table */}
                  <div>
                    <h3 className="font-semibold text-base mb-2">admin_users Table</h3>
                    {adminUsers.adminUsersTable?.exists ? (
                      <div className="space-y-2">
                        <div><strong>Count:</strong> {adminUsers.adminUsersTable.count}</div>
                        {adminUsers.adminUsersTable.data?.map((admin: any, index: number) => (
                          <div key={admin.id} className="border-l-2 border-pink-300 pl-3 ml-2">
                            <div><strong>Admin {index + 1}:</strong></div>
                            <div className="ml-4 space-y-1">
                              <div><strong>Email:</strong> {admin.email}</div>
                              <div><strong>Username:</strong> {admin.username || 'N/A'}</div>
                              <div><strong>Created:</strong> {admin.created_at ? new Date(admin.created_at).toLocaleString() : 'N/A'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">admin_users table does not exist or is empty</div>
                    )}
                  </div>

                  {/* Supabase Auth */}
                  <div>
                    <h3 className="font-semibold text-base mb-2">Supabase Auth Users</h3>
                    <div className="space-y-2">
                      <div><strong>Total Users:</strong> {adminUsers.supabaseAuth?.totalUsers}</div>
                      <div><strong>Admin Users:</strong> {adminUsers.supabaseAuth?.totalAdminUsers}</div>
                      {adminUsers.supabaseAuth?.adminUsers?.map((admin: any, index: number) => (
                        <div key={admin.id} className="border-l-2 border-blue-300 pl-3 ml-2">
                          <div><strong>Admin {index + 1}:</strong></div>
                          <div className="ml-4 space-y-1">
                            <div><strong>Email:</strong> {admin.email}</div>
                            <div><strong>Username:</strong> {admin.username || 'N/A'}</div>
                            <div><strong>Role:</strong> {admin.role}</div>
                            <div><strong>Last Sign In:</strong> {admin.last_sign_in_at ? new Date(admin.last_sign_in_at).toLocaleString() : 'Never'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div>Loading admin users...</div>
            )}
          </div>
        </BirthdayCard>

        {/* Supabase Session */}
        <BirthdayCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Supabase Session</h2>
          <div className="text-sm">
            {sessionData ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            ) : (
              <div>Loading session data...</div>
            )}
          </div>
        </BirthdayCard>

        {/* Local Storage */}
        <BirthdayCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Local Storage (Supabase keys)</h2>
          <div className="text-sm">
            {Object.keys(storageData.localStorage || {}).length > 0 ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(storageData.localStorage, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">No Supabase data in localStorage</div>
            )}
          </div>
        </BirthdayCard>

        {/* Session Storage */}
        <BirthdayCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Session Storage (Supabase keys)</h2>
          <div className="text-sm">
            {Object.keys(storageData.sessionStorage || {}).length > 0 ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(storageData.sessionStorage, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">No Supabase data in sessionStorage</div>
            )}
          </div>
        </BirthdayCard>
      </div>

      {/* Instructions */}
      <BirthdayCard className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Instructions</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. If you see session data above, that's why you're automatically logged in</p>
          <p>2. Click "Clear All Sessions" to remove all stored authentication data</p>
          <p>3. Click "Logout" to sign out normally</p>
          <p>4. After clearing sessions, navigate to /admin to test if auto-login is fixed</p>
          <p>5. You should be redirected to the login page instead of being automatically logged in</p>
        </div>
      </BirthdayCard>
    </div>
  )
}
