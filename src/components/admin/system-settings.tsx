'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useMounted } from '@/hooks/use-mounted'

export function SystemSettings() {
  const mounted = useMounted()
  const [systemInfo, setSystemInfo] = useState([
    { label: 'Birthday Date', value: 'Loading...', icon: CalendarIcon },
    { label: 'Birthday Person', value: 'Loading...', icon: UserIcon },
    { label: 'Timezone', value: 'Loading...', icon: GlobeAltIcon },
  ])

  useEffect(() => {
    if (mounted) {
      // Set system info on client side to avoid hydration mismatch
      setSystemInfo([
        {
          label: 'Birthday Date',
          value: process.env.NEXT_PUBLIC_BIRTHDAY_DATE || 'Not configured',
          icon: CalendarIcon,
        },
        {
          label: 'Birthday Person',
          value: process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Not configured',
          icon: UserIcon,
        },
        {
          label: 'Timezone',
          value: process.env.NEXT_PUBLIC_TIMEZONE || 'UTC',
          icon: GlobeAltIcon,
        },
      ])
    }
  }, [mounted])

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center space-x-2 mb-6">
        <CogIcon className="w-5 h-5 text-soft-pink" />
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          System Configuration
        </h3>
      </div>

      <div className="space-y-4">
        {systemInfo.map((item, index) => (
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
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-soft-pink/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-charcoal-black">Application Status</h4>
            <p className="text-sm text-charcoal-black/60">System is running normally</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-600">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
