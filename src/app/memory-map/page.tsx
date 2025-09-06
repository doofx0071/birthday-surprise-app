'use client'

import React, { useCallback } from 'react'
import { MemoryMap } from '@/components/map/MemoryMap'
import { ArrowLeft, MapPin, Heart } from 'lucide-react'
import Link from 'next/link'
import { useContentReveal } from '@/hooks/useCountdownStatus'
import { useRouter } from 'next/navigation'

export default function MemoryMapPage() {
  const { shouldRevealContent, isLoading } = useContentReveal()
  const router = useRouter()

  // Memoize callback functions to prevent unnecessary re-renders
  const handlePinClick = useCallback((event: any) => {
    console.log('Pin clicked:', event.pin)
  }, [])

  const handleMapLoad = useCallback((event: any) => {
    console.log('Map loaded:', event.map)
  }, [])

  // Note: Removed redirect logic to allow access to Memory Map
  // The countdown has completed, so content should always be accessible

  // Show loading while checking countdown status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // Note: Removed conditional rendering - Memory Map is now always accessible
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
      {/* Header */}
      <div className="neuro-card border-b-0 shadow-none relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors font-body"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Birthday Surprise</span>
            </Link>

            {/* Title */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl font-semibold text-gray-900 font-body">Memory Map</h1>
            </div>

            {/* Spacer for centering */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Description */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              Messages from Around the World
            </h2>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the beautiful birthday messages sent from friends and family across the globe. 
            Click on the heart pins to read the heartfelt wishes and see where love travels from.
          </p>
        </div>

        {/* Map container */}
        <div className="neuro-card overflow-hidden">
          <MemoryMap
            height="600px"
            className="w-full"
            showFilters={false}
            onPinClick={handlePinClick}
            onLoad={handleMapLoad}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 neuro-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center font-body">
            <MapPin className="w-5 h-5 text-pink-500 mr-2" />
            How to Use the Memory Map
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 neuro-icon-container rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-body">Click on Heart Pins</h4>
                  <p className="text-gray-600 text-sm font-body">
                    Click on any pink heart pin to see messages from that location
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Explore Messages</h4>
                  <p className="text-gray-600 text-sm">
                    Read message previews and see who sent birthday wishes
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Use Map Controls</h4>
                  <p className="text-gray-600 text-sm">
                    Zoom, pan, and reset the view using the controls on the right
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Explore Freely</h4>
                  <p className="text-gray-600 text-sm">
                    All birthday messages are displayed - explore and discover love from around the world
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Want to Add Your Message?</h3>
            <p className="mb-4 opacity-90">
              Join friends and family from around the world in celebrating this special day!
            </p>
            <Link
              href="/#messages"
              className="inline-flex items-center px-6 py-3 bg-white text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-colors"
            >
              <Heart className="w-5 h-5 mr-2" />
              Add Your Birthday Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
