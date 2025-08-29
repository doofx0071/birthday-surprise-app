'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface AnalyticsExportProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
}

export function AnalyticsExport({ dateRange, customDateRange }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)

    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          dateRange,
          customDateRange: dateRange === 'custom' ? customDateRange : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-report-${dateRange}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Export Successful',
        description: `Analytics report exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          <TableCellsIcon className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex items-center space-x-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          <span>Export PDF</span>
        </Button>
      </motion.div>

      {isExporting && (
        <div className="flex items-center space-x-2 text-sm text-charcoal-black/60">
          <ArrowDownTrayIcon className="w-4 h-4 animate-bounce" />
          <span>Exporting...</span>
        </div>
      )}
    </div>
  )
}
