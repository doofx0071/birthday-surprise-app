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
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface LogEntry {
  id: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  category?: string
  details?: any
  user_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

interface LogStats {
  total: number
  last24h: number
  byLevel: {
    info: number
    warning: number
    error: number
    debug: number
  }
}

interface LogsResponse {
  logs: LogEntry[]
  stats: LogStats
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
  }
}

export function SystemLogs() {
  const [logsData, setLogsData] = useState<LogsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'debug'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [filter, categoryFilter])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, filter, categoryFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('level', filter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      params.append('limit', '50')

      const response = await fetch(`/api/admin/system-logs?${params}`)
      if (response.ok) {
        const data: LogsResponse = await response.json()
        setLogsData(data)
      } else {
        throw new Error('Failed to fetch logs')
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch system logs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const clearOldLogs = async () => {
    try {
      const response = await fetch('/api/admin/system-logs?days=30', {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: `Cleared ${data.deletedCount} old log entries`,
        })
        fetchLogs()
      } else {
        throw new Error('Failed to clear logs')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear old logs',
        variant: 'destructive',
      })
    }
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
      case 'debug':
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
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
      case 'debug':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const categories = ['all', 'auth', 'email', 'messages', 'system', 'api', 'database']
  const levels = ['all', 'info', 'warning', 'error', 'debug']

  const logs = logsData?.logs || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-charcoal-black">System Logs</h3>
          <p className="text-sm text-charcoal-black/60">
            View system activity, errors, and audit trail
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={clearOldLogs}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear Old Logs</span>
          </Button>
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
                        {log.category?.toUpperCase() || 'SYSTEM'}
                      </span>
                      <span className="text-sm text-charcoal-black/60">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.level === 'error' ? 'bg-red-100 text-red-700' :
                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      log.level === 'debug' ? 'bg-gray-100 text-gray-700' :
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
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {(log.user_id || log.ip_address) && (
                    <div className="mt-2 flex items-center space-x-4 text-xs text-charcoal-black/60">
                      {log.user_id && (
                        <span>User: {log.user_id}</span>
                      )}
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
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
      {logsData?.stats && (
        <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-charcoal-black">Log Statistics</h4>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-charcoal-black/70">Auto-refresh</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {logsData.stats.byLevel.info}
              </div>
              <div className="text-charcoal-black/60">Info</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {logsData.stats.byLevel.debug}
              </div>
              <div className="text-charcoal-black/60">Debug</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {logsData.stats.byLevel.warning}
              </div>
              <div className="text-charcoal-black/60">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {logsData.stats.byLevel.error}
              </div>
              <div className="text-charcoal-black/60">Error</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-soft-pink/20">
            <div className="flex justify-between text-sm text-charcoal-black/60">
              <span>Total logs: {logsData.stats.total}</span>
              <span>Last 24h: {logsData.stats.last24h}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
