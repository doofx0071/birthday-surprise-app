'use client'

import React from 'react'
import { MemoryMap } from '@/components/map/MemoryMap'
import { ArrowLeft, MapPin, Heart } from 'lucide-react'
import Link from 'next/link'

export default function MemoryMapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Birthday Surprise</span>
            </Link>

            {/* Title */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-pink-500" />
              <h1 className="text-xl font-semibold text-gray-900">Memory Map</h1>
            </div>

            {/* Spacer for centering */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <MemoryMap
            height="600px"
            className="w-full"
            showFilters={true}
            onPinClick={(event) => {
              console.log('Pin clicked:', event.pin)
            }}
            onLoad={(event) => {
              console.log('Map loaded:', event.map)
            }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-pink-500 mr-2" />
            How to Use the Memory Map
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-pink-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Click on Heart Pins</h4>
                  <p className="text-gray-600 text-sm">
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
                  <h4 className="font-medium text-gray-900">Filter Messages</h4>
                  <p className="text-gray-600 text-sm">
                    Use the filters on the left to show text-only or media messages
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
              href="/"
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
