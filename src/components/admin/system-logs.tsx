'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: string
  message: string
  details?: string
  userId?: string
  ipAddress?: string
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [filter, categoryFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('level', filter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`/api/admin/logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const categories = ['all', 'auth', 'email', 'messages', 'system', 'api', 'database']
  const levels = ['all', 'info', 'warning', 'error', 'success']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-charcoal-black">System Logs</h3>
          <p className="text-sm text-charcoal-black/60">
            View system activity, errors, and audit trail
          </p>
        </div>
        <Button
          onClick={fetchLogs}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-charcoal-black/60" />
            <span className="text-sm font-medium text-charcoal-black">Filters:</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-charcoal-black/60">Level:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-2 py-1 border border-soft-pink/30 rounded text-sm focus:border-soft-pink focus:outline-none"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-charcoal-black/60">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 border border-soft-pink/30 rounded text-sm focus:border-soft-pink focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-soft-pink/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 bg-white/40 rounded-lg border border-soft-pink/20">
            <DocumentTextIcon className="w-12 h-12 text-charcoal-black/30 mx-auto mb-3" />
            <p className="text-charcoal-black/60">No logs found</p>
            <p className="text-sm text-charcoal-black/40">Try adjusting your filters</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`rounded-lg border p-4 ${getLogColor(log.level)}`}
            >
              <div className="flex items-start space-x-3">
                {getLogIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-charcoal-black">
                        {log.category.toUpperCase()}
                      </span>
                      <span className="text-sm text-charcoal-black/60">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.level === 'error' ? 'bg-red-100 text-red-700' :
                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      log.level === 'success' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-charcoal-black mt-1">{log.message}</p>
                  
                  {log.details && (
                    <details className="mt-2">
                      <summary className="text-sm text-charcoal-black/60 cursor-pointer hover:text-charcoal-black">
                        Show details
                      </summary>
                      <pre className="mt-2 text-xs bg-white/60 p-2 rounded border overflow-x-auto">
                        {log.details}
                      </pre>
                    </details>
                  )}
                  
                  {(log.userId || log.ipAddress) && (
                    <div className="mt-2 flex items-center space-x-4 text-xs text-charcoal-black/60">
                      {log.userId && (
                        <span>User: {log.userId}</span>
                      )}
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Log Statistics */}
      <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-3">Log Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {logs.filter(l => l.level === 'info').length}
            </div>
            <div className="text-charcoal-black/60">Info</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {logs.filter(l => l.level === 'success').length}
            </div>
            <div className="text-charcoal-black/60">Success</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {logs.filter(l => l.level === 'warning').length}
            </div>
            <div className="text-charcoal-black/60">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {logs.filter(l => l.level === 'error').length}
            </div>
            <div className="text-charcoal-black/60">Error</div>
          </div>
        </div>
      </div>
    </div>
  )
}
