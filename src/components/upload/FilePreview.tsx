'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Film, Image as ImageIcon } from 'lucide-react'
import { UploadFile } from '@/types/upload'
import { formatFileSize, getFileTypeCategory } from '@/lib/fileValidation'
import { ProgressBar, CircularProgress } from './ProgressBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilePreviewProps {
  file: UploadFile
  onRemove: (id: string) => void
  variant?: 'grid' | 'list'
  className?: string
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  variant = 'grid',
  className
}) => {
  const fileType = getFileTypeCategory(file.file)
  
  const handleRemove = () => {
    onRemove(file.id)
  }

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-3 p-3 bg-background border rounded-lg',
          className
        )}
      >
        {/* File icon/preview */}
        <div className="flex-shrink-0">
          {fileType === 'image' && file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-12 h-12 object-cover rounded border"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
              {fileType === 'image' ? (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              ) : fileType === 'video' ? (
                <Film className="w-6 h-6 text-muted-foreground" />
              ) : (
                <FileText className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.file.size)}
          </p>
          
          {/* Progress bar */}
          {(file.status === 'uploading' || file.status === 'complete' || file.status === 'error') && (
            <div className="mt-2">
              <ProgressBar
                progress={file.progress}
                status={file.status}
                size="sm"
                showPercentage={false}
              />
            </div>
          )}
          
          {/* Error message */}
          {file.status === 'error' && file.error && (
            <p className="text-xs text-red-600 mt-1">{file.error}</p>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          {file.status === 'uploading' ? (
            <CircularProgress
              progress={file.progress}
              status="uploading"
              size={24}
              strokeWidth={2}
            />
          ) : file.status === 'complete' ? (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : file.status === 'error' ? (
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          ) : null}
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    )
  }

  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative group bg-background border rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </Button>

      {/* File preview */}
      <div className="aspect-square relative">
        {fileType === 'image' && file.preview ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {fileType === 'image' ? (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            ) : fileType === 'video' ? (
              <Film className="w-8 h-8 text-muted-foreground" />
            ) : (
              <FileText className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Upload overlay */}
        {file.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <CircularProgress
              progress={file.progress}
              status="uploading"
              size={40}
              strokeWidth={3}
            />
          </div>
        )}

        {/* Status overlay */}
        {file.status === 'complete' && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {file.status === 'error' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <p className="text-xs">Failed</p>
            </div>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{file.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>
        
        {/* Error message */}
        {file.status === 'error' && file.error && (
          <p className="text-xs text-red-600 mt-1">{file.error}</p>
        )}
      </div>
    </motion.div>
  )
}
