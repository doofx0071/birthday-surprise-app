'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image as ImageIcon, Film, Plus } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FilePreview } from './FilePreview'
import { ProgressBar } from './ProgressBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesUploaded?: (files: Array<{ url: string; thumbnailUrl?: string }>) => void
  onTempFilesReady?: (tempFiles: Array<{ tempPath: string; fileInfo: any; thumbnailUrl?: string }>) => void
  messageId?: string
  disabled?: boolean
  variant?: 'compact' | 'full'
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  onTempFilesReady,
  messageId,
  disabled = false,
  variant = 'full',
  className
}) => {
  const {
    files,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps,
    removeFile,
    clearFiles,
    uploadFiles,
    finalizeFileUploads,
    cancelUploads,
    isUploading,
    uploadProgress
  } = useFileUpload()

  const handleUpload = async () => {
    if (!messageId) {
      console.error('Temporary ID is required for file upload')
      return
    }

    try {
      // Upload to temporary storage
      await uploadFiles(messageId)

      // Notify parent component of successful uploads
      const uploadedFiles = files
        .filter(f => f.status === 'complete')
        .map(f => ({
          url: f.uploadedUrl!,
          thumbnailUrl: f.thumbnailUrl
        }))

      // Prepare temp file data for finalization
      const tempFileData = files
        .filter(f => f.status === 'complete' && f.tempPath && f.fileInfo)
        .map(f => ({
          tempPath: f.tempPath!,
          fileInfo: f.fileInfo!,
          thumbnailUrl: f.thumbnailUrl
        }))

      if (uploadedFiles.length > 0) {
        onFilesUploaded?.(uploadedFiles)
      }

      if (tempFileData.length > 0) {
        onTempFilesReady?.(tempFileData)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const hasFiles = files.length > 0
  const hasUploadableFiles = pendingFiles.length > 0

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Compact upload button */}
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
            isDragActive
              ? isDragAccept
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} disabled={disabled} />
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Add files'}
            </span>
          </div>
        </div>

        {/* File list */}
        <AnimatePresence>
          {hasFiles && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {files.map(file => (
                <FilePreview
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                  variant="list"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload controls */}
        {hasUploadableFiles && (
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || !messageId}
              size="sm"
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : `Upload ${pendingFiles.length} file${pendingFiles.length !== 1 ? 's' : ''}`}
            </Button>
            <Button
              onClick={clearFiles}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Overall progress */}
        {isUploading && (
          <ProgressBar
            progress={uploadProgress}
            status="uploading"
            size="sm"
          />
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? isDragAccept
              ? 'border-green-500 bg-green-50 scale-105'
              : 'border-red-500 bg-red-50'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={disabled} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Upload icon */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragAccept ? 'text-green-600' : 
              isDragReject ? 'text-red-600' : 
              'text-primary'
            )} />
          </div>

          {/* Upload text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive
                ? isDragAccept
                  ? 'Drop your files here'
                  : 'Some files are not supported'
                : 'Upload your photos and videos'
              }
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isDragActive
                ? isDragAccept
                  ? 'Release to upload your files'
                  : 'Please check file types and sizes'
                : 'Drag and drop your files here, or click to browse. Supports images (JPG, PNG, WebP, GIF) up to 5MB and videos (MP4, WebM, MOV) up to 50MB.'
              }
            </p>
          </div>

          {/* Supported formats */}
          {!isDragActive && (
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>Images</span>
              </div>
              <div className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                <span>Videos</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Max 50MB</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* File previews */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Selected Files ({files.length})
              </h4>
              <Button
                onClick={clearFiles}
                variant="ghost"
                size="sm"
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map(file => (
                <FilePreview
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                  variant="grid"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload controls */}
      {hasUploadableFiles && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={handleUpload}
            disabled={isUploading || !messageId}
            className="flex-1"
            size="lg"
          >
            {isUploading 
              ? `Uploading ${files.filter(f => f.status === 'uploading').length} files...`
              : `Upload ${pendingFiles.length} file${pendingFiles.length !== 1 ? 's' : ''}`
            }
          </Button>
        </motion.div>
      )}

      {/* Overall progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressBar
            progress={uploadProgress}
            status="uploading"
            size="lg"
          />
        </motion.div>
      )}
    </div>
  )
}
