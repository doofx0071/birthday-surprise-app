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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Memory Gallery */}
        <MemoryGallery className="w-full" />
      </div>
    </section>
  )
}
