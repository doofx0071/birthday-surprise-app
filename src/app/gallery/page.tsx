import React from 'react'
import { Metadata } from 'next'
import { MemoryGallery } from '@/components/gallery/memory-gallery'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Memory Gallery | Birthday Surprise',
  description: 'A beautiful collection of birthday messages, photos, and memories from friends and family around the world.',
  keywords: ['birthday', 'memories', 'gallery', 'photos', 'messages', 'celebration'],
  openGraph: {
    title: 'Memory Gallery | Birthday Surprise',
    description: 'A beautiful collection of birthday messages, photos, and memories from friends and family around the world.',
    type: 'website',
  },
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-black mb-4">
              Memory Gallery
            </h1>
            <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto">
              A beautiful collection of birthday messages, photos, and memories from friends and family around the world
            </p>
          </div>

          {/* Memory Gallery */}
          <MemoryGallery 
            initialViewMode="grid"
            showFilters={true}
            showSearch={true}
            className="w-full"
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
