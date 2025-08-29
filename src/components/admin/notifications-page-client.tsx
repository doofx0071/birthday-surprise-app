'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  CogIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { useNotifications } from '@/contexts/notification-context'
import { useToast } from '@/hooks/use-toast'

export function NotificationsPageClient() {
  const { user } = useAdminAuth()
  const { toast } = useToast()
  const {
    notifications,
    loading,
    unreadCount,
    currentPage,
    totalPages,
    itemsPerPage,
    markAsRead,
    markAllAsRead,
    setCurrentPage,
    setItemsPerPage,
    fetchNotifications
  } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'message' | 'upload' | 'system' | 'email'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && notification.unread) ||
                         notification.type === filter

    const matchesSearch = searchTerm === '' ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)
  const totalFilteredPages = Math.ceil(filteredNotifications.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return UserIcon
      case 'upload': return PhotoIcon
      case 'system': return CogIcon
      case 'email': return EnvelopeIcon
      default: return BellIcon
    }
  }

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-100'
      case 'upload': return 'text-green-600 bg-green-100'
      case 'system': return 'text-yellow-600 bg-yellow-100'
      case 'email': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal-black mb-2">
              Notifications
            </h1>
            <p className="text-charcoal-black/70">
              Monitor system activity and recent events
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={fetchNotifications}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/60">Total</p>
              <p className="text-xl font-bold text-charcoal-black">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-soft-pink/20 rounded-lg">
              <BellIcon className="w-5 h-5 text-soft-pink" />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/60">Unread</p>
              <p className="text-xl font-bold text-charcoal-black">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/60">Filtered</p>
              <p className="text-xl font-bold text-charcoal-black">{filteredNotifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/60">Page</p>
              <p className="text-xl font-bold text-charcoal-black">
                {currentPage} of {totalFilteredPages || 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-soft-pink/20"
        style={{
          boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal-black/40" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl text-charcoal-black placeholder-charcoal-black/50 font-medium transition-all duration-200 hover:border-soft-pink/40 focus:outline-none focus:border-soft-pink focus:ring-2 focus:ring-soft-pink/20"
              style={{
                boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-4 h-4 text-charcoal-black/60" />
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none px-4 py-2 pr-8 bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl text-charcoal-black font-medium cursor-pointer transition-all duration-200 hover:border-soft-pink/40 focus:outline-none focus:border-soft-pink focus:ring-2 focus:ring-soft-pink/20"
                style={{
                  boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
                }}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="message">Messages</option>
                <option value="upload">Uploads</option>
                <option value="system">System</option>
                <option value="email">Email</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-charcoal-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20 overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-pink mx-auto mb-4"></div>
            <p className="text-charcoal-black/60">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellIcon className="w-16 h-16 text-charcoal-black/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-black mb-2">No notifications found</h3>
            <p className="text-charcoal-black/60">
              {searchTerm ? 'Try adjusting your search terms' : 'New notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-soft-pink/10">
            {paginatedNotifications.map((notification, index) => {
              const IconComponent = getNotificationIcon(notification.type)
              const colorClasses = getNotificationColor(notification.type)

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 hover:bg-soft-pink/5 transition-colors cursor-pointer ${
                    notification.unread ? 'bg-soft-pink/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal-black">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-charcoal-black/70 mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-1 text-xs text-charcoal-black/50">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{notification.time}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.type === 'message' ? 'bg-blue-100 text-blue-700' :
                              notification.type === 'upload' ? 'bg-green-100 text-green-700' :
                              notification.type === 'system' ? 'bg-yellow-100 text-yellow-700' :
                              notification.type === 'email' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>

                        {/* Unread indicator and actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-soft-pink rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 text-charcoal-black/40 hover:text-charcoal-black transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {filteredNotifications.length > itemsPerPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-soft-pink/20"
          style={{
            boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-charcoal-black/60">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredNotifications.length)} of {filteredNotifications.length} notifications
              </p>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="appearance-none px-3 py-1 pr-7 bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-lg text-sm text-charcoal-black font-medium cursor-pointer transition-all duration-200 hover:border-soft-pink/40 focus:outline-none focus:border-soft-pink focus:ring-2 focus:ring-soft-pink/20"
                  style={{
                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-3 h-3 text-charcoal-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl hover:text-soft-pink hover:border-soft-pink/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                }}
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                  let pageNumber
                  if (totalFilteredPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalFilteredPages - 2) {
                    pageNumber = totalFilteredPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-soft-pink text-white border-2 border-soft-pink shadow-lg'
                          : 'text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 hover:text-soft-pink hover:border-soft-pink/40'
                      }`}
                      style={{
                        boxShadow: currentPage === pageNumber
                          ? '2px 2px 8px rgba(0, 0, 0, 0.2)'
                          : '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalFilteredPages}
                className="px-4 py-2 text-sm font-medium text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl hover:text-soft-pink hover:border-soft-pink/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
