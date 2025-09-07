'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  EnvelopeIcon,
  CogIcon,
  HeartIcon,
  EyeIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: ChatBubbleLeftRightIcon,
    badge: 3, // This would be dynamic in real implementation
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Client Preview',
    href: '/admin/client-preview',
    icon: EyeIcon,
  },
  {
    name: 'Emails',
    href: '/admin/emails',
    icon: EnvelopeIcon,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
  },
  // Debug page (only in development)
  ...(process.env.NODE_ENV === 'development' ? [{
    name: 'Debug Session',
    href: '/admin/debug-session',
    icon: BugAntIcon,
  }] : []),
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-soft-pink/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-soft-pink/20">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-soft-pink to-rose-gold rounded-lg flex items-center justify-center">
            <HeartIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-charcoal-black">
              Admin Panel
            </h1>
            <p className="text-xs text-charcoal-black/60">
              Birthday Surprise
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href as any}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group',
                  isActive
                    ? 'bg-gradient-to-r from-soft-pink/20 to-rose-gold/20 text-charcoal-black border border-soft-pink/30'
                    : 'text-charcoal-black/70 hover:bg-soft-pink/10 hover:text-charcoal-black'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive
                        ? 'text-soft-pink'
                        : 'text-charcoal-black/50 group-hover:text-charcoal-black/70'
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-soft-pink text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
                  >
                    {item.badge}
                  </motion.div>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-soft-pink/20">
        <div className="text-center">
          <p className="text-xs text-charcoal-black/50">
            Birthday Surprise Admin
          </p>
          <p className="text-xs text-charcoal-black/40">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
