'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { MemoryGallery } from '@/components/gallery/memory-gallery'

interface GallerySectionProps {
  className?: string
}

export const GallerySection: React.FC<GallerySectionProps> = ({ className }) => {
  return (
    <section
      id="gallery"
      className={cn(
        'py-16 md:py-24',
        className
      )}
    >
      {/* Header at 70% width - responsive */}
      <div className="w-[95%] sm:w-[85%] md:w-[75%] lg:w-[70%] mx-auto mb-6">
        <MemoryGallery className="w-full" headerOnly />
      </div>

      {/* Cards at 90% width - responsive */}
      <div className="w-[95%] sm:w-[92%] md:w-[90%] mx-auto">
        <MemoryGallery className="w-full" cardsOnly />
      </div>
    </section>
  )
}
