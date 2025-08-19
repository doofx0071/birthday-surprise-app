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
        'py-16 md:py-24 bg-gradient-to-br from-accent/5 to-primary/10',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Memory Gallery */}
        <MemoryGallery
          initialViewMode="grid"
          showFilters={true}
          showSearch={true}
          className="w-full"
        />
      </div>
    </section>
  )
}
