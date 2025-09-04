'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  TrashIcon,
  CircleStackIcon,
  FolderIcon,
  DocumentIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface DataCounts {
  messages: number
  mediaFiles: number
  emailTracking: number
  emailBatches: number
  emailTemplates: number
  systemLogs: number
  notificationReadStates: number
  emailEvents: number
  storageFiles: number
  tempFiles: number
}

interface ResetConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText: string
  warningItems: string[]
  isLoading: boolean
}

const ResetConfirmationModal: React.FC<ResetConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  warningItems,
  isLoading
}) => {
  const [confirmationText, setConfirmationText] = useState('')
  const isConfirmed = confirmationText === confirmText

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-600 mb-4">{description}</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-800 mb-2">The following data will be permanently deleted:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {warningItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "{confirmText}" to confirm:
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={confirmText}
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!isConfirmed || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Resetting...' : 'Reset Data'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export function DatabaseReset() {
  const [dataCounts, setDataCounts] = useState<DataCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetLoading, setResetLoading] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: string
    title: string
    description: string
    confirmText: string
    warningItems: string[]
  }>({
    isOpen: false,
    type: '',
    title: '',
    description: '',
    confirmText: '',
    warningItems: []
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchDataCounts()
  }, [])

  const fetchDataCounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reset/data-counts')
      if (response.ok) {
        const data = await response.json()
        setDataCounts(data)
      } else {
        throw new Error('Failed to fetch data counts')
      }
    } catch (error) {
      console.error('Error fetching data counts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data counts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetConfirm = async () => {
    if (!confirmModal.type) return

    try {
      setResetLoading(confirmModal.type)
      const response = await fetch(`/api/admin/reset/${confirmModal.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message || 'Reset completed successfully',
        })
        // Refresh data counts
        await fetchDataCounts()
      } else {
        throw new Error(result.error || 'Reset failed')
      }
    } catch (error) {
      console.error('Reset error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Reset failed',
        variant: 'destructive',
      })
    } finally {
      setResetLoading(null)
      setConfirmModal({ ...confirmModal, isOpen: false })
    }
  }

  const openConfirmModal = (type: string, title: string, description: string, confirmText: string, warningItems: string[]) => {
    setConfirmModal({
      isOpen: true,
      type,
      title,
      description,
      confirmText,
      warningItems
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-red-100 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-red-50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
        </div>
        <p className="text-red-700">
          These actions will permanently delete data from your database and storage. 
          This action cannot be undone. Use with extreme caution.
        </p>
      </div>

      {/* Database Reset Options */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-red-200">
        <div className="p-6 border-b border-red-200">
          <div className="flex items-center space-x-3">
            <CircleStackIcon className="w-6 h-6 text-red-600" />
            <h4 className="text-lg font-semibold text-gray-900">Database Reset Options</h4>
          </div>
          <p className="text-gray-600 mt-2">Reset specific parts of your database while preserving critical system data.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Reset Messages Only */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-red-600" />
                <span>Reset Messages Only</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Delete all birthday messages and their media files. Preserves system configuration and admin accounts.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Will delete: {dataCounts?.messages || 0} messages, {dataCounts?.mediaFiles || 0} media files
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'messages',
                'Reset All Messages',
                'This will permanently delete all birthday messages and their associated media files.',
                'RESET MESSAGES',
                [
                  `${dataCounts?.messages || 0} birthday messages`,
                  `${dataCounts?.mediaFiles || 0} media files`,
                  'All message attachments from storage'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
            >
              {resetLoading === 'messages' ? 'Resetting...' : 'Reset Messages'}
            </Button>
          </div>

          {/* Reset User Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5 text-red-600" />
                <span>Reset User Data</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Delete all user-generated content including messages, email tracking, and notifications. Preserves admin accounts and system settings.
              </p>
              <p className="text-sm text-red-600 mt-1">
                Will delete: {dataCounts?.messages || 0} messages, {dataCounts?.emailTracking || 0} email records, {dataCounts?.notificationReadStates || 0} notifications
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'user-data',
                'Reset All User Data',
                'This will permanently delete all user-generated content while preserving admin accounts and system configuration.',
                'RESET USER DATA',
                [
                  `${dataCounts?.messages || 0} birthday messages`,
                  `${dataCounts?.mediaFiles || 0} media files`,
                  `${dataCounts?.emailTracking || 0} email tracking records`,
                  `${dataCounts?.emailBatches || 0} email batches`,
                  `${dataCounts?.notificationReadStates || 0} notification states`,
                  `${dataCounts?.emailEvents || 0} email events`,
                  'All user-uploaded files from storage'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
            >
              {resetLoading === 'user-data' ? 'Resetting...' : 'Reset User Data'}
            </Button>
          </div>

          {/* Full Database Reset */}
          <div className="flex items-center justify-between p-4 border border-red-300 rounded-lg bg-red-100/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <CircleStackIcon className="w-5 h-5 text-red-700" />
                <span>Full Database Reset</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                <strong>EXTREME CAUTION:</strong> Reset everything except admin authentication. This will delete all data including system logs and email templates.
              </p>
              <p className="text-sm text-red-700 mt-1 font-medium">
                Will delete ALL data except admin accounts and system configuration
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'full-database',
                'Full Database Reset',
                'This will permanently delete ALL data except admin authentication and system configuration. This action is irreversible.',
                'FULL DATABASE RESET',
                [
                  `${dataCounts?.messages || 0} birthday messages`,
                  `${dataCounts?.mediaFiles || 0} media files`,
                  `${dataCounts?.emailTracking || 0} email tracking records`,
                  `${dataCounts?.emailBatches || 0} email batches`,
                  `${dataCounts?.emailTemplates || 0} email templates`,
                  `${dataCounts?.systemLogs || 0} system logs`,
                  `${dataCounts?.notificationReadStates || 0} notification states`,
                  `${dataCounts?.emailEvents || 0} email events`,
                  'All files from storage',
                  'All application data (except admin accounts)'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-red-700 hover:bg-red-800 text-white ml-4"
            >
              {resetLoading === 'full-database' ? 'Resetting...' : 'Full Reset'}
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Reset Options */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200">
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center space-x-3">
            <FolderIcon className="w-6 h-6 text-orange-600" />
            <h4 className="text-lg font-semibold text-gray-900">Storage Reset Options</h4>
          </div>
          <p className="text-gray-600 mt-2">Clear files and media from your storage bucket.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Clear Uploaded Files */}
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <DocumentIcon className="w-5 h-5 text-orange-600" />
                <span>Clear Uploaded Files</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Delete all user-uploaded images and media files from storage. Database records will remain.
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Will delete: {dataCounts?.storageFiles || 0} files from storage
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'storage-files',
                'Clear All Uploaded Files',
                'This will permanently delete all user-uploaded files from storage.',
                'CLEAR STORAGE',
                [
                  `${dataCounts?.storageFiles || 0} uploaded files`,
                  'All images and media from storage bucket',
                  'Files cannot be recovered after deletion'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
            >
              {resetLoading === 'storage-files' ? 'Clearing...' : 'Clear Files'}
            </Button>
          </div>

          {/* Clear Temporary Files */}
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <TrashIcon className="w-5 h-5 text-orange-600" />
                <span>Clear Temporary Files</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Delete temporary files and incomplete uploads from storage.
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Will delete: {dataCounts?.tempFiles || 0} temporary files
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'temp-files',
                'Clear Temporary Files',
                'This will delete all temporary files and incomplete uploads.',
                'CLEAR TEMP FILES',
                [
                  `${dataCounts?.tempFiles || 0} temporary files`,
                  'All incomplete uploads',
                  'Orphaned temporary data'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
            >
              {resetLoading === 'temp-files' ? 'Clearing...' : 'Clear Temp Files'}
            </Button>
          </div>

          {/* Clear All Storage */}
          <div className="flex items-center justify-between p-4 border border-orange-300 rounded-lg bg-orange-100/50">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <FolderIcon className="w-5 h-5 text-orange-700" />
                <span>Clear All Storage</span>
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Delete everything from the storage bucket including all files and folders.
              </p>
              <p className="text-sm text-orange-700 mt-1 font-medium">
                Will delete ALL files: {(dataCounts?.storageFiles || 0) + (dataCounts?.tempFiles || 0)} total files
              </p>
            </div>
            <Button
              onClick={() => openConfirmModal(
                'all-storage',
                'Clear All Storage',
                'This will permanently delete ALL files from storage including uploads and temporary files.',
                'CLEAR ALL STORAGE',
                [
                  `${dataCounts?.storageFiles || 0} uploaded files`,
                  `${dataCounts?.tempFiles || 0} temporary files`,
                  'All folders and directories',
                  'Complete storage bucket cleanup'
                ]
              )}
              disabled={!!resetLoading}
              className="bg-orange-700 hover:bg-orange-800 text-white ml-4"
            >
              {resetLoading === 'all-storage' ? 'Clearing...' : 'Clear All Storage'}
            </Button>
          </div>
        </div>
      </div>

      <ResetConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleResetConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        warningItems={confirmModal.warningItems}
        isLoading={!!resetLoading}
      />
    </div>
  )
}
