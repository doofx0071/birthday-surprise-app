'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AuthGuard } from '@/components/admin/auth-guard'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  
  // Don't apply auth guard to login page
  const isLoginPage = pathname === '/admin/login'
  
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/5">
        {children}
      </div>
    )
  }
  
  // Apply auth guard to all other admin pages
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/5">
        <div className="flex h-screen">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <AdminHeader />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
