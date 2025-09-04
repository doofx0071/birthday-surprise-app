'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SystemConfiguration } from '@/components/admin/system-configuration'
import { BackupRestore } from '@/components/admin/backup-restore'
import { SystemLogs } from '@/components/admin/system-logs'
import { UserManagement } from '@/components/admin/user-management'
import { DatabaseReset } from '@/components/admin/database-reset'

type TabType = 'system' | 'backup' | 'logs' | 'users' | 'reset'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('system')

  const tabs = [
    { id: 'system', label: 'System Configuration', icon: '⚙️' },
    { id: 'backup', label: 'Backup & Restore', icon: '💾' },
    { id: 'logs', label: 'System Logs', icon: '📋' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'reset', label: 'Reset', icon: '🗑️' },
  ] as const

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <SystemConfiguration />
      case 'backup':
        return <BackupRestore />
      case 'logs':
        return <SystemLogs />
      case 'users':
        return <UserManagement />
      case 'reset':
        return <DatabaseReset />
      default:
        return <SystemConfiguration />
    }
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
          System Settings
        </h1>
        <p className="text-charcoal-black/70">
          Configure system preferences, application settings, and manage system operations.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20"
      >
        <div className="flex border-b border-soft-pink/20 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? tab.id === 'reset'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-soft-pink border-b-2 border-soft-pink bg-soft-pink/5'
                  : tab.id === 'reset'
                    ? 'text-red-500/70 hover:text-red-600 hover:bg-red-50'
                    : 'text-charcoal-black/70 hover:text-charcoal-black hover:bg-soft-pink/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
