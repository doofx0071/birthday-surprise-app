'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Portal } from '@/components/ui/portal'
import { useToast } from '@/hooks/use-toast'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { useNotifications } from '@/contexts/notification-context'

export function AdminHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const { signOut, user, clearAllSessions } = useAdminAuth()
  const { notifications, unreadCount, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 })
  // Show only recent notifications in dropdown (limit to 5)
  const recentNotifications = notifications.slice(0, 5)

  const handleNotificationClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setNotificationPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    })
    setShowNotifications(!showNotifications)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setShowNotifications(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setShowUserMenu(false)

    try {
      toast({
        title: 'Logging Out',
        description: 'Please wait...',
      })

      await signOut()

      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Logout Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleClearAllSessions = async () => {
    setIsLoggingOut(true)
    setShowUserMenu(false)

    try {
      toast({
        title: 'Clearing All Sessions',
        description: 'Removing all stored session data...',
      })

      await clearAllSessions()

      toast({
        title: 'Sessions Cleared',
        description: 'All session data has been cleared. Please login again.',
      })
    } catch (error) {
      console.error('Clear sessions error:', error)
      toast({
        title: 'Clear Sessions Error',
        description: 'Failed to clear sessions. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleViewSite = () => {
    window.open('/', '_blank')
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-soft-pink/20 px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <Image
            src="/assets/icons/svg/logo.svg"
            alt="Birthday Surprise Logo"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal-black">
              Admin Dashboard
            </h2>
            <p className="text-sm text-charcoal-black/60">
              Manage your birthday surprise application
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* View Site Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSite}
            className="flex items-center space-x-2"
          >
            <EyeIcon className="w-4 h-4" />
            <span>View Site</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNotificationClick}
              className="relative p-2 text-charcoal-black/60 hover:text-charcoal-black transition-colors rounded-lg hover:bg-soft-pink/10"
            >
              <BellIcon className="w-6 h-6" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-soft-pink rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </motion.button>
          </div>

          {/* User Menu */}
          <div className="relative z-[100000]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setMenuPosition({
                  top: rect.bottom + 8,
                  right: window.innerWidth - rect.right
                })
                setShowUserMenu(!showUserMenu)
              }}
              className="flex items-center space-x-2 p-2 text-charcoal-black/60 hover:text-charcoal-black transition-colors rounded-lg hover:bg-soft-pink/10"
            >
              <UserCircleIcon className="w-8 h-8" />
              <span className="text-sm font-medium">Admin</span>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <Portal>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed w-48 bg-white rounded-lg shadow-xl border border-soft-pink/20 py-2 z-[99999] backdrop-blur-sm"
                    style={{
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      top: `${menuPosition.top}px`,
                      right: `${menuPosition.right}px`
                    }}
                  >
                    <div className="px-4 py-2 border-b border-soft-pink/10">
                      <p className="text-sm font-medium text-charcoal-black">Admin User</p>
                      <p className="text-xs text-charcoal-black/60">Administrator</p>
                    </div>

                    <button
                      onClick={handleClearAllSessions}
                      disabled={isLoggingOut}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-charcoal-black/70 hover:text-charcoal-black hover:bg-soft-pink/10 transition-colors disabled:opacity-50 cursor-pointer border-b border-soft-pink/10"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>Clear All Sessions</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-charcoal-black/70 hover:text-charcoal-black hover:bg-soft-pink/10 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[99999] w-96 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-soft-pink/20"
              style={{
                top: notificationPosition.top,
                right: notificationPosition.right,
                boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-soft-pink/20">
                <h3 className="font-display font-bold text-charcoal-black">Notifications</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="px-3 py-1 text-sm font-medium text-soft-pink hover:text-white hover:bg-soft-pink rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-soft-pink/30 hover:border-soft-pink"
                  >
                    Mark all read
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soft-pink mx-auto mb-4"></div>
                    <p className="text-sm text-charcoal-black/60">Loading notifications...</p>
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellIcon className="w-12 h-12 text-charcoal-black/20 mx-auto mb-4" />
                    <p className="text-sm text-charcoal-black/60">No recent notifications</p>
                    <p className="text-xs text-charcoal-black/40 mt-1">
                      New messages and system events will appear here
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-soft-pink/10 hover:bg-soft-pink/5 transition-all duration-200 cursor-pointer ${
                        notification.unread ? 'bg-soft-pink/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          notification.unread ? 'bg-soft-pink shadow-sm' : 'bg-charcoal-black/10'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal-black">
                            {notification.title}
                          </p>
                          <p className="text-sm text-charcoal-black/70 mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-charcoal-black/50">
                              {notification.time}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              notification.type === 'message' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                              notification.type === 'upload' ? 'bg-green-50 text-green-600 border border-green-200' :
                              notification.type === 'system' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                              notification.type === 'email' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                              'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t-2 border-soft-pink/20 bg-soft-pink/5">
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    router.push('/admin/notifications')
                  }}
                  className="w-full py-2 px-4 text-center text-sm font-medium text-soft-pink hover:text-white hover:bg-soft-pink rounded-lg transition-all duration-200 border border-soft-pink/30 hover:border-soft-pink"
                >
                  View all notifications
                </button>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Click outside to close menus */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-[99998]"
          onClick={() => setShowUserMenu(false)}
        />
      )}
      {showNotifications && (
        <div
          className="fixed inset-0 z-[99998]"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
}
