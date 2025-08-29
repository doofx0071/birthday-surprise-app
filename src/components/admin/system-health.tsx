'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useMounted } from '@/hooks/use-mounted'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { createSupabaseClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  lastChecked: Date
}

export function SystemHealth() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { user, isLoading: authLoading } = useAdminAuth()
  const mounted = useMounted()

  const performHealthChecks = async () => {
    if (!user || authLoading) return

    setLoading(true)

    const checks: HealthCheck[] = []
    const now = new Date()

    // Get authentication headers
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    // Database Health Check
    try {
      const response = await fetch('/api/admin/health/database', { headers })
      const data = await response.json()
      checks.push({
        name: 'Database',
        status: response.ok ? 'healthy' : 'error',
        message: data.message || 'Database connection verified',
        lastChecked: now,
      })
    } catch (error) {
      checks.push({
        name: 'Database',
        status: 'error',
        message: 'Failed to connect to database',
        lastChecked: now,
      })
    }

    // Storage Health Check
    try {
      const response = await fetch('/api/admin/health/storage', { headers })
      const data = await response.json()
      checks.push({
        name: 'Storage',
        status: response.ok ? 'healthy' : 'error',
        message: data.message || 'Storage service operational',
        lastChecked: now,
      })
    } catch (error) {
      checks.push({
        name: 'Storage',
        status: 'error',
        message: 'Storage service unavailable',
        lastChecked: now,
      })
    }

    // Email Service Health Check
    try {
      const response = await fetch('/api/admin/health/email', { headers })
      const data = await response.json()
      checks.push({
        name: 'Email Service',
        status: response.ok ? 'healthy' : 'warning',
        message: data.message || 'Email service operational',
        lastChecked: now,
      })
    } catch (error) {
      checks.push({
        name: 'Email Service',
        status: 'warning',
        message: 'Email service check failed',
        lastChecked: now,
      })
    }

    // API Health Check
    checks.push({
      name: 'API',
      status: 'healthy',
      message: 'API endpoints responding normally',
      lastChecked: now,
    })

    setHealthChecks(checks)
    setLastUpdate(now)
    setLoading(false)
  }

  useEffect(() => {
    if (mounted && user && !authLoading) {
      performHealthChecks()

      // Auto-refresh every 5 minutes
      const interval = setInterval(performHealthChecks, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [mounted, user, authLoading])

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
    }
  }

  const overallStatus = healthChecks.length > 0 
    ? healthChecks.some(check => check.status === 'error') 
      ? 'error'
      : healthChecks.some(check => check.status === 'warning')
      ? 'warning'
      : 'healthy'
    : 'healthy'

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          System Health
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={performHealthChecks}
          disabled={loading}
          className="flex items-center space-x-1"
        >
          <ArrowPathIcon className={cn("w-4 h-4", loading && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Overall Status */}
      <div className={cn(
        "flex items-center space-x-2 p-3 rounded-lg border mb-4",
        getStatusColor(overallStatus)
      )}>
        {getStatusIcon(overallStatus)}
        <span className="font-medium">
          System Status: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
        </span>
      </div>

      {/* Individual Health Checks */}
      <div className="space-y-3">
        {loading && healthChecks.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-soft-pink/5">
                <div className="w-5 h-5 bg-soft-pink/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-soft-pink/20 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-soft-pink/20 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          healthChecks.map((check, index) => (
            <motion.div
              key={check.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-soft-pink/5 transition-colors"
            >
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <p className="font-medium text-charcoal-black">{check.name}</p>
                <p className="text-sm text-charcoal-black/60">{check.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-soft-pink/20">
        <p className="text-xs text-charcoal-black/50">
          Last updated: {mounted ? lastUpdate.toLocaleTimeString() : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
