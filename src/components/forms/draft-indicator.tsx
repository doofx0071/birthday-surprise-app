'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'

interface DraftIndicatorProps {
  hasDraft: boolean
  draftTimestamp?: number
  onRestoreDraft: () => void
  onClearDraft: () => void
  isAutoSaving?: boolean
  lastSaved?: number
  className?: string
}

export const DraftIndicator: React.FC<DraftIndicatorProps> = ({
  hasDraft,
  draftTimestamp,
  onRestoreDraft,
  onClearDraft,
  isAutoSaving = false,
  lastSaved,
  className
}) => {
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [timeAgo, setTimeAgo] = useState('')

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'just now'
  }

  // Update time ago periodically
  useEffect(() => {
    if (!draftTimestamp && !lastSaved) return

    const updateTimeAgo = () => {
      const timestamp = draftTimestamp || lastSaved
      if (timestamp) {
        setTimeAgo(formatTimeAgo(timestamp))
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [draftTimestamp, lastSaved])

  // Show draft prompt when draft is detected
  useEffect(() => {
    if (hasDraft && draftTimestamp) {
      setShowDraftPrompt(true)
    }
  }, [hasDraft, draftTimestamp])

  const handleRestoreDraft = () => {
    onRestoreDraft()
    setShowDraftPrompt(false)
  }

  const handleDismissDraft = () => {
    setShowDraftPrompt(false)
  }

  const handleClearDraft = () => {
    onClearDraft()
    setShowDraftPrompt(false)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Draft Restoration Prompt */}
      <AnimatePresence>
        {showDraftPrompt && hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <AnimatedSparkleIcon size="sm" color="current" intensity="normal" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Draft Found
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  We found a draft message from {timeAgo}. Would you like to restore it?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreDraft}
                    className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                  >
                    Restore Draft
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissDraft}
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                  >
                    Continue Without Draft
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDraft}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete Draft
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save Status */}
      <AnimatePresence>
        {(isAutoSaving || lastSaved) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between text-xs text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              {isAutoSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <AnimatedSparkleIcon size="xs" color="current" animate={false} />
                  </motion.div>
                  <span>Saving draft...</span>
                </>
              ) : lastSaved ? (
                <>
                  <span className="text-green-600">✓</span>
                  <span>Draft saved {timeAgo}</span>
                </>
              ) : null}
            </div>

            {hasDraft && !showDraftPrompt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDraftPrompt(true)}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                Restore Draft
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
