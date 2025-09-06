'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CountdownStatus } from '@/hooks/useCountdownStatus'
import { cn } from '@/lib/utils'

interface PreviewControlsProps {
  previewMode: 'current' | 'post-countdown'
  onPreviewModeChange: (mode: 'current' | 'post-countdown') => void
  isFullscreen: boolean
  onFullscreenToggle: () => void
  countdownStatus: CountdownStatus
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  previewMode,
  onPreviewModeChange,
  isFullscreen,
  onFullscreenToggle,
  countdownStatus,
}) => {
  return (
    <div className="neuro-card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Preview Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-charcoal-black">Preview Mode:</span>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onPreviewModeChange('current')}
              className={cn(
                'px-4 py-2 rounded-md font-medium transition-all duration-200',
                previewMode === 'current'
                  ? 'bg-white text-charcoal-black shadow-sm'
                  : 'text-charcoal-black/60 hover:text-charcoal-black'
              )}
            >
              Current Client View
            </button>
            <button
              onClick={() => onPreviewModeChange('post-countdown')}
              className={cn(
                'px-4 py-2 rounded-md font-medium transition-all duration-200',
                previewMode === 'post-countdown'
                  ? 'bg-white text-charcoal-black shadow-sm'
                  : 'text-charcoal-black/60 hover:text-charcoal-black'
              )}
            >
              Post-Countdown View
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Countdown Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              countdownStatus.isComplete ? 'bg-green-500' : 'bg-orange-500'
            )} />
            <span className="text-sm text-charcoal-black/70">
              {countdownStatus.isComplete ? 'Countdown Complete' : 'Countdown Active'}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onFullscreenToggle}
            className="flex items-center gap-2 px-4 py-2 bg-soft-pink/10 hover:bg-soft-pink/20 rounded-lg border border-soft-pink/20 transition-colors"
          >
            <span className="text-lg">
              {isFullscreen ? '🗗' : '⛶'}
            </span>
            <span className="font-medium text-charcoal-black">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Current Status Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal-black">
              {countdownStatus.timeRemaining.days}
            </div>
            <div className="text-sm text-charcoal-black/70">Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal-black">
              {countdownStatus.timeRemaining.hours}
            </div>
            <div className="text-sm text-charcoal-black/70">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal-black">
              {countdownStatus.timeRemaining.minutes}
            </div>
            <div className="text-sm text-charcoal-black/70">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal-black">
              {countdownStatus.timeRemaining.seconds}
            </div>
            <div className="text-sm text-charcoal-black/70">Seconds</div>
          </div>
        </div>
      </div>

      {/* Mode Description */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">
            {previewMode === 'current' ? '👁️' : '🎉'}
          </span>
          <div>
            <div className="font-medium text-charcoal-black mb-1">
              {previewMode === 'current' ? 'Current Client View' : 'Post-Countdown View'}
            </div>
            <div className="text-sm text-charcoal-black/70">
              {previewMode === 'current' 
                ? 'Shows exactly what visitors see right now on the public website.'
                : 'Simulates what visitors will see after the countdown reaches zero on September 8, 2025.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
