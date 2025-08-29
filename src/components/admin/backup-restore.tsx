'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function BackupRestore() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const { toast } = useToast()

  const handleCreateBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `birthday-app-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Backup Created',
          description: 'System backup has been downloaded successfully',
        })
      } else {
        throw new Error('Backup failed')
      }
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create system backup',
        variant: 'destructive',
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('Are you sure you want to restore from this backup? This will overwrite all current data.')) {
      return
    }

    setIsRestoring(true)
    try {
      const formData = new FormData()
      formData.append('backup', file)

      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast({
          title: 'Restore Successful',
          description: 'System has been restored from backup',
        })
      } else {
        throw new Error('Restore failed')
      }
    } catch (error) {
      toast({
        title: 'Restore Failed',
        description: 'Failed to restore from backup',
        variant: 'destructive',
      })
    } finally {
      setIsRestoring(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-charcoal-black">Backup & Restore</h3>
        <p className="text-sm text-charcoal-black/60">
          Create backups of your system data and restore from previous backups
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Backup and restore operations affect all system data including messages, media files, 
              and configuration settings. Always create a backup before making significant changes.
            </p>
          </div>
        </div>
      </div>

      {/* Create Backup */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-charcoal-black flex items-center space-x-2">
              <CloudArrowDownIcon className="w-5 h-5" />
              <span>Create Backup</span>
            </h4>
            <p className="text-sm text-charcoal-black/60 mt-1">
              Download a complete backup of your system data
            </p>
          </div>
          <Button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>{isBackingUp ? 'Creating...' : 'Create Backup'}</span>
          </Button>
        </div>

        <div className="mt-4 text-sm text-charcoal-black/60">
          <p>The backup will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>All messages and their approval status</li>
            <li>Media files and attachments</li>
            <li>System configuration settings</li>
            <li>Email templates and campaigns</li>
            <li>User preferences and settings</li>
          </ul>
        </div>
      </div>

      {/* Restore from Backup */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-charcoal-black flex items-center space-x-2">
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-sm text-charcoal-black/60 mt-1">
              Upload and restore from a previous backup file
            </p>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={isRestoring}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button
              disabled={isRestoring}
              className="flex items-center space-x-2"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              <span>{isRestoring ? 'Restoring...' : 'Upload Backup'}</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-800">Restore Warning</h5>
              <p className="text-sm text-red-700 mt-1">
                Restoring from a backup will completely replace all current data. 
                This action cannot be undone. Make sure to create a current backup first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Best Practices */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black flex items-center space-x-2 mb-4">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Backup Best Practices</span>
        </h4>

        <div className="space-y-3 text-sm text-charcoal-black/70">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Create regular backups, especially before major updates or changes</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Store backup files in a secure location separate from your server</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Test restore procedures periodically to ensure backups are working</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Keep multiple backup versions for different time periods</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Document your backup and restore procedures for your team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
