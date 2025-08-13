'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  status?: 'uploading' | 'complete' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status = 'uploading',
  size = 'md',
  showPercentage = true,
  className
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const statusColors = {
    uploading: 'bg-blue-500',
    complete: 'bg-green-500',
    error: 'bg-red-500'
  }

  const backgroundColors = {
    uploading: 'bg-blue-100',
    complete: 'bg-green-100',
    error: 'bg-red-100'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div className={cn(
        'relative overflow-hidden rounded-full',
        sizeClasses[size],
        backgroundColors[status]
      )}>
        {/* Progress fill */}
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors duration-200',
            statusColors[status]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
        />
        
        {/* Animated shimmer effect for uploading */}
        {status === 'uploading' && progress > 0 && progress < 100 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </div>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="mt-1 flex justify-between items-center text-xs">
          <span className={cn(
            'font-medium',
            status === 'error' ? 'text-red-600' : 
            status === 'complete' ? 'text-green-600' : 
            'text-blue-600'
          )}>
            {status === 'complete' ? 'Complete' : 
             status === 'error' ? 'Failed' : 
             'Uploading...'}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Circular progress variant
interface CircularProgressProps {
  progress: number
  status?: 'uploading' | 'complete' | 'error'
  size?: number
  strokeWidth?: number
  className?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  status = 'uploading',
  size = 40,
  strokeWidth = 3,
  className
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const statusColors = {
    uploading: '#3b82f6', // blue-500
    complete: '#10b981',  // green-500
    error: '#ef4444'      // red-500
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={statusColors[status]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {status === 'complete' ? (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : status === 'error' ? (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  )
}
