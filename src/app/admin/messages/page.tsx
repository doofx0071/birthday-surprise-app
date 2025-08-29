'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageTabs } from '@/components/admin/message-tabs'
import { MessageStats } from '@/components/admin/message-stats'

export default function AdminMessagesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20"
      >
        <h1 className="font-display text-2xl font-bold text-charcoal-black mb-2">
          Message Management
        </h1>
        <p className="text-charcoal-black/70">
          Review, approve, and manage birthday messages from family and friends.
        </p>
      </motion.div>

      {/* Message Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MessageStats refreshTrigger={refreshTrigger} />
      </motion.div>

      {/* Message Tabs Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MessageTabs
          refreshTrigger={refreshTrigger}
          onMessageUpdate={handleRefresh}
        />
      </motion.div>
    </div>
  )
}
