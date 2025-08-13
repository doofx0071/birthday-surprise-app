'use client'

import React from 'react'
import { Plus, Minus, RotateCcw, Maximize } from 'lucide-react'
import type { MapControlsProps } from '@/types/map'

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  className = ''
}) => {
  const buttonClass = `
    w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 
    rounded-lg shadow-sm flex items-center justify-center 
    transition-all duration-200 hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
  `

  return (
    <div className={`map-controls flex flex-col space-y-2 ${className}`}>
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className={buttonClass}
        title="Zoom In"
        aria-label="Zoom in on the map"
      >
        <Plus className="w-5 h-5 text-gray-600" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className={buttonClass}
        title="Zoom Out"
        aria-label="Zoom out on the map"
      >
        <Minus className="w-5 h-5 text-gray-600" />
      </button>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className={buttonClass}
        title="Reset View"
        aria-label="Reset map to world view"
      >
        <RotateCcw className="w-5 h-5 text-gray-600" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className={buttonClass}
        title="Toggle Fullscreen"
        aria-label="Toggle fullscreen mode"
      >
        <Maximize className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  )
}
