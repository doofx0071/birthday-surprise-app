import type { Metadata } from 'next'
import { AdminLayoutClient } from '@/components/admin/admin-layout-client'
import { AdminAuthProvider } from '@/contexts/admin-auth-context'
import { NotificationProvider } from '@/contexts/notification-context'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Birthday Surprise',
  description: 'Admin dashboard for managing the birthday surprise application',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <NotificationProvider>
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </NotificationProvider>
    </AdminAuthProvider>
  )
}
