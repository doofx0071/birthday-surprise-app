'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  ChartBarIcon,
  EnvelopeIcon,
  CogIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  color: string
  external?: boolean
}

export function QuickActions() {
  const handleExportData = () => {
    // This would trigger a data export
    console.log('Exporting data...')
  }

  const handleViewSite = () => {
    window.open('/', '_blank')
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Approve Messages',
      description: 'Review and approve pending birthday messages',
      icon: CheckCircleIcon,
      href: '/admin/messages',
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Check engagement metrics and statistics',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Send Emails',
      description: 'Manage email campaigns and notifications',
      icon: EnvelopeIcon,
      href: '/admin/emails',
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      icon: CogIcon,
      href: '/admin/settings',
      color: 'from-gray-400 to-gray-600',
    },
    {
      title: 'View Live Site',
      description: 'Open the public birthday surprise site',
      icon: EyeIcon,
      onClick: handleViewSite,
      color: 'from-soft-pink to-rose-gold',
      external: true,
    },
    {
      title: 'Export Data',
      description: 'Download all messages and media files',
      icon: ArrowDownTrayIcon,
      onClick: handleExportData,
      color: 'from-orange-400 to-orange-600',
    },
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const ActionComponent = action.href ? Link : 'button'
          const actionProps = action.href
            ? { href: action.href as any }
            : { onClick: action.onClick }

          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ActionComponent
                {...actionProps}
                className="block w-full text-left"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-lg border border-soft-pink/20 hover:border-soft-pink/40 transition-all duration-200 cursor-pointer group bg-white/40 hover:bg-white/60"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-charcoal-black group-hover:text-soft-pink transition-colors">
                        {action.title}
                        {action.external && (
                          <span className="ml-1 text-xs">↗</span>
                        )}
                      </h4>
                      <p className="text-sm text-charcoal-black/60 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ActionComponent>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
