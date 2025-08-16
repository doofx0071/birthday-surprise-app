'use client'

import React from 'react'
import { X, MapPin, Users, MessageCircle, Image, Video } from 'lucide-react'
import { getCountryFlag } from '@/lib/geocoding'
import type { LocationPopupProps } from '@/types/map'

export const LocationPopup: React.FC<LocationPopupProps> = ({
  pin,
  onClose,
  onViewAll
}) => {
  const countryFlag = getCountryFlag(pin.country)
  
  // Sort contributors by submission date (newest first)
  const sortedContributors = [...pin.contributors].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )

  // Show max 3 contributors in popup
  const displayedContributors = sortedContributors.slice(0, 3)
  const remainingCount = Math.max(0, pin.messageCount - 3)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-lg">
                  {countryFlag} {pin.city}
                </h3>
                <p className="text-pink-100 text-sm">{pin.country}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 mt-3 text-pink-100">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">
                {pin.messageCount} message{pin.messageCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {pin.contributors.length} contributor{pin.contributors.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {displayedContributors.map((contributor, index) => (
              <div key={contributor.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                {/* Contributor info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {contributor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(contributor.submittedAt)}</p>
                    </div>
                  </div>
                  
                  {/* Media indicator */}
                  {contributor.hasMedia && (
                    <div className="flex items-center space-x-1 text-pink-500">
                      <Image className="w-4 h-4" />
                      <span className="text-xs">Media</span>
                    </div>
                  )}
                </div>

                {/* Message preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{contributor.messagePreview}"
                  </p>
                  {contributor.message.length > 100 && (
                    <button
                      onClick={() => onViewAll(pin)}
                      className="text-pink-500 text-xs mt-1 hover:text-pink-600 transition-colors"
                    >
                      Read more...
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Show remaining count */}
            {remainingCount > 0 && (
              <div className="text-center py-3 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  + {remainingCount} more message{remainingCount !== 1 ? 's' : ''} from this location
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Click and drag to explore the map
            </div>
            
            {pin.messageCount > 3 && (
              <button
                onClick={() => onViewAll(pin)}
                className="px-3 py-1 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600 transition-colors"
              >
                View All Messages
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
