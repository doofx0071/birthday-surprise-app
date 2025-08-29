'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'

export function SecuritySettings() {
  const securityInfo = [
    {
      label: 'Admin Authentication',
      value: 'Password Protected',
      status: 'secure',
      icon: KeyIcon,
    },
    {
      label: 'Session Duration',
      value: '24 hours',
      status: 'secure',
      icon: ClockIcon,
    },
    {
      label: 'Route Protection',
      value: 'Middleware Active',
      status: 'secure',
      icon: ShieldCheckIcon,
    },
    {
      label: 'Environment',
      value: process.env.NODE_ENV || 'development',
      status: process.env.NODE_ENV === 'production' ? 'secure' : 'warning',
      icon: ComputerDesktopIcon,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'secure':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center space-x-2 mb-6">
        <ShieldCheckIcon className="w-5 h-5 text-soft-pink" />
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          Security & Access Control
        </h3>
      </div>

      <div className="space-y-4">
        {securityInfo.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg bg-white/40 border border-soft-pink/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-pink to-rose-gold rounded-lg flex items-center justify-center">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-charcoal-black">{item.label}</p>
                <p className="text-sm text-charcoal-black/60">{item.value}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusDot(item.status)}`}></div>
              <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                {item.status === 'secure' ? 'Secure' : item.status === 'warning' ? 'Warning' : 'Error'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-soft-pink/20">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Security Recommendations</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Change the default admin password in production</li>
            <li>• Use HTTPS in production environment</li>
            <li>• Regularly monitor access logs</li>
            <li>• Keep dependencies updated</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
