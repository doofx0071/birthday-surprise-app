'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminMediaLightboxProps {
  media: {
    url: string
    type: 'image' | 'video'
    title?: string
  } | null
  onClose: () => void
}

export const AdminMediaLightbox: React.FC<AdminMediaLightboxProps> = ({ media, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (media) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [media, onClose])

  // Handle download
  const handleDownload = async () => {
    if (!media) return

    try {
      const response = await fetch(media.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.title || `media-${Date.now()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (!media) return null

  return (
    <AnimatePresence>
      <motion.div
        key="admin-lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Controls - positioned above the modal */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Media Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative z-10 bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.title || 'Media'}
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <video
              ref={videoRef}
              src={media.url}
              controls
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              onLoadedData={() => {
                // Auto-play when loaded
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {
                    // Auto-play failed, user will need to click play manually
                  })
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </motion.div>

        {/* Instructions - positioned below the modal */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <p className="text-white/70 text-sm text-center bg-black/30 rounded px-3 py-1 backdrop-blur-sm">
            Press ESC or click outside to close
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
