'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EmailTemplateEditor } from '@/components/admin/email-template-editor'
import { EmailConfiguration } from '@/components/admin/email-configuration'
import { EmailCampaigns } from '@/components/admin/email-campaigns'
import { EmailDeliveryStats } from '@/components/admin/email-delivery-stats'

type TabType = 'templates' | 'configuration' | 'campaigns' | 'statistics'

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('templates')

  const tabs = [
    { id: 'templates', label: 'Email Templates', icon: '📧' },
    { id: 'configuration', label: 'Configuration', icon: '⚙️' },
    { id: 'campaigns', label: 'Campaigns', icon: '📢' },
    { id: 'statistics', label: 'Statistics', icon: '📊' },
  ] as const

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return <EmailTemplateEditor />
      case 'configuration':
        return <EmailConfiguration />
      case 'campaigns':
        return <EmailCampaigns />
      case 'statistics':
        return <EmailDeliveryStats />
      default:
        return <EmailTemplateEditor />
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
          Email Management
        </h1>
        <p className="text-charcoal-black/70">
          Manage email templates, configure settings, and track email campaign performance.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20"
      >
        <div className="flex border-b border-soft-pink/20">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-soft-pink border-b-2 border-soft-pink bg-soft-pink/5'
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
