import React from 'react'
import { NotificationsPageClient } from '@/components/admin/notifications-page-client'

export const metadata = {
  title: 'Notifications - Admin Dashboard',
  description: 'View and manage system notifications',
}

export default function NotificationsPage() {
  return <NotificationsPageClient />
}
