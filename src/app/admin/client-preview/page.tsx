'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminPreview } from '@/hooks/useCountdownStatus'
import { ClientPreviewFrame } from '@/components/admin/client-preview-frame'
import { PreviewStats } from '@/components/admin/preview-stats'
import { PreviewControls } from '@/components/admin/preview-controls'

type PreviewMode = 'current' | 'post-countdown'

export default function ClientPreviewPage() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('current')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { current, simulated, isLoading } = useAdminPreview()

  const activePreview = previewMode === 'current' ? current : simulated

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <div className="text-gray-600">Loading preview...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20"
      >
        <h1 className="font-display text-2xl font-bold text-charcoal-black mb-2">
          Client Preview Dashboard
        </h1>
        <p className="text-charcoal-black/70">
          See exactly what visitors experience on the public website, both now and after the countdown ends.
        </p>
      </motion.div>

      {/* Preview Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PreviewControls
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          isFullscreen={isFullscreen}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          countdownStatus={activePreview.status}
        />
      </motion.div>

      {/* Preview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PreviewStats previewMode={previewMode} />
      </motion.div>

      {/* Main Preview Frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={previewMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ClientPreviewFrame
              previewMode={previewMode}
              isFullscreen={isFullscreen}
              onFullscreenExit={() => setIsFullscreen(false)}
              forceRevealContent={previewMode === 'post-countdown'}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Additional Information */}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Current State Info */}
          <div className="neuro-card p-6">
            <h3 className="font-display text-xl font-bold text-charcoal-black mb-4">
              Current Client Experience
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Countdown Status:</span>
                <span className={`font-medium ${current.status.isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                  {current.status.isComplete ? 'Complete' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Gallery Visible:</span>
                <span className={`font-medium ${current.shouldRevealContent ? 'text-green-600' : 'text-red-600'}`}>
                  {current.shouldRevealContent ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Map Visible:</span>
                <span className={`font-medium ${current.shouldRevealContent ? 'text-green-600' : 'text-red-600'}`}>
                  {current.shouldRevealContent ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Message Form:</span>
                <span className="font-medium text-green-600">Always Available</span>
              </div>
            </div>
          </div>

          {/* Post-Countdown State Info */}
          <div className="neuro-card p-6">
            <h3 className="font-display text-xl font-bold text-charcoal-black mb-4">
              Post-Countdown Experience
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Countdown Display:</span>
                <span className="font-medium text-green-600">Birthday Celebration</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Gallery Visible:</span>
                <span className="font-medium text-green-600">Yes (Approved Only)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Map Visible:</span>
                <span className="font-medium text-green-600">Yes (Approved Only)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-black/70">Message Form:</span>
                <span className="font-medium text-green-600">Still Available</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
