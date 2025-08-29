'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaPopupProps {
  media: {
    url: string
    type: 'image' | 'video'
    title?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function MediaPopup({ media, isOpen, onClose }: MediaPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleDownload = async () => {
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

  if (!isOpen || !mounted) return null

  const popupContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Popup Container */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-lg max-h-[70vh] overflow-hidden mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          transform: 'none',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {media.title || 'Media Preview'}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Content */}
        <div className="p-3">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.title || 'Media'}
              className="w-full h-auto max-h-[50vh] object-contain rounded"
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
              className="w-full h-auto max-h-[50vh] object-contain rounded"
              onLoadedData={() => {
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
        </div>

        {/* Footer */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 text-center">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  )

  // Use portal to render outside the component tree
  return createPortal(popupContent, document.body)
}
