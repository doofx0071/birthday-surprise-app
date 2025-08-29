'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface MediaLightboxProps {
  media: {
    url: string
    type: 'image' | 'video'
    title?: string
  } | null
  onClose: () => void
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ media, onClose }) => {
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

  return (
    <AnimatePresence>
      {media && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
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

        {/* Title */}
        {media.title && (
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-white text-lg font-semibold">
              {media.title}
            </h3>
          </div>
        )}

        {/* Media Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {media.type === 'image' ? (
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <Image
                src={media.url}
                alt={media.title || 'Media'}
                width={1200}
                height={800}
                className="object-contain max-w-full max-h-full"
                priority
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={media.url}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh] rounded-lg"
              onLoadedData={() => {
                // Auto-play when loaded
                if (videoRef.current) {
                  videoRef.current.play().catch(console.error)
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </motion.div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <p className="text-white/70 text-sm text-center">
            Press ESC or click outside to close
          </p>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
