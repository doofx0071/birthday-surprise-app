/**
 * Upload Progress Indicator Component
 * Shows detailed progress for individual files and overall upload status
 */

'use client'

import React from 'react'
import { AsyncUploadFile } from '@/hooks/useAsyncFileUpload'
import { QueueStats } from '@/lib/upload/uploadQueue'
import { formatFileSize } from '@/lib/upload/compression'

interface UploadProgressIndicatorProps {
  files: AsyncUploadFile[]
  queueStats: QueueStats
  onPauseFile?: (fileId: string) => void
  onResumeFile?: (fileId: string) => void
  onCancelFile?: (fileId: string) => void
  onRetryFailed?: () => void
  onClearCompleted?: () => void
  className?: string
}

export function UploadProgressIndicator({
  files,
  queueStats,
  onPauseFile,
  onResumeFile,
  onCancelFile,
  onRetryFailed,
  onClearCompleted,
  className = ''
}: UploadProgressIndicatorProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`
    if (bytesPerSecond < 1024 * 1024) return `${Math.round(bytesPerSecond / 1024)} KB/s`
    return `${Math.round(bytesPerSecond / (1024 * 1024))} MB/s`
  }

  const getStatusIcon = (status: AsyncUploadFile['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'compressing':
        return '📁' // Changed from 📦 to indicate file preparation instead of compression
      case 'uploading':
        return '📤'
      case 'complete':
        return '✅'
      case 'error':
        return '❌'
      case 'paused':
        return '⏸️'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: AsyncUploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500'
      case 'compressing':
        return 'text-blue-500'
      case 'uploading':
        return 'text-blue-600'
      case 'complete':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'paused':
        return 'text-yellow-600'
      default:
        return 'text-gray-500'
    }
  }

  const activeFiles = files.filter(f => f.status !== 'complete')
  const completedFiles = files.filter(f => f.status === 'complete')
  const failedFiles = files.filter(f => f.status === 'error')

  if (files.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-pink-200 p-4 ${className}`}>
      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload Progress
          </h3>
          <div className="text-sm text-gray-600">
            {queueStats.completedFiles}/{queueStats.totalFiles} files
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${queueStats.overallProgress}%` }}
          />
        </div>
        
        {/* Overall Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {formatFileSize(queueStats.uploadedSize)} / {formatFileSize(queueStats.totalSize)}
          </span>
          <div className="flex items-center gap-4">
            {queueStats.averageSpeed > 0 && (
              <span>📊 {formatSpeed(queueStats.averageSpeed)}</span>
            )}
            {queueStats.estimatedTimeRemaining > 0 && (
              <span>⏱️ {formatTime(queueStats.estimatedTimeRemaining)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(failedFiles.length > 0 || completedFiles.length > 0) && (
        <div className="flex gap-2 mb-4">
          {failedFiles.length > 0 && onRetryFailed && (
            <button
              onClick={onRetryFailed}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
            >
              🔄 Retry Failed ({failedFiles.length})
            </button>
          )}
          {completedFiles.length > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
            >
              🗑️ Clear Completed ({completedFiles.length})
            </button>
          )}
        </div>
      )}

      {/* Individual File Progress */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activeFiles.map((file) => (
          <div key={file.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg">{getStatusIcon(file.status)}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800 truncate">
                    {file.file.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(file.originalSize)}
                    {file.compressedSize && file.compressedSize !== file.originalSize && (
                      <span className="text-green-600 ml-1">
                        → {formatFileSize(file.compressedSize)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* File Actions */}
              <div className="flex items-center gap-1">
                {file.status === 'uploading' && onPauseFile && (
                  <button
                    onClick={() => onPauseFile(file.id)}
                    className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                    title="Pause"
                  >
                    ⏸️
                  </button>
                )}
                {file.status === 'paused' && onResumeFile && (
                  <button
                    onClick={() => onResumeFile(file.id)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Resume"
                  >
                    ▶️
                  </button>
                )}
                {(file.status === 'pending' || file.status === 'paused' || file.status === 'error') && onCancelFile && (
                  <button
                    onClick={() => onCancelFile(file.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Cancel"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
            
            {/* File Progress Bar */}
            {file.status !== 'pending' && (
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      file.status === 'error' 
                        ? 'bg-red-500' 
                        : file.status === 'complete'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* File Status and Details */}
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${getStatusColor(file.status)}`}>
                {file.status === 'compressing' ? 'Preparing' : file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                {file.progress > 0 && file.status !== 'complete' && ` (${file.progress}%)`}
              </span>
              
              <div className="flex items-center gap-3 text-gray-500">
                {file.uploadSpeed && file.uploadSpeed > 0 && (
                  <span>📊 {formatSpeed(file.uploadSpeed)}</span>
                )}
                {file.estimatedTimeRemaining && file.estimatedTimeRemaining > 0 && (
                  <span>⏱️ {formatTime(file.estimatedTimeRemaining)}</span>
                )}
              </div>
            </div>
            
            {/* Error Message */}
            {file.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {file.error}
              </div>
            )}
          </div>
        ))}
        
        {/* Completed Files Summary */}
        {completedFiles.length > 0 && (
          <div className="border border-green-200 rounded-lg p-3 bg-green-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div className="flex-1">
                <div className="font-medium text-green-800">
                  {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''} uploaded successfully
                </div>
                <div className="text-sm text-green-600">
                  {formatFileSize(completedFiles.reduce((sum, f) => sum + f.originalSize, 0))} total
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Failed Files Summary */}
        {failedFiles.length > 0 && (
          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <div className="flex-1">
                <div className="font-medium text-red-800">
                  {failedFiles.length} file{failedFiles.length !== 1 ? 's' : ''} failed to upload
                </div>
                <div className="text-sm text-red-600">
                  Click "Retry Failed" to try again
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
