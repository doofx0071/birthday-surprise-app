'use client'

import React, { useState, useEffect } from 'react'
import { Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface LogoUploadProps {
  className?: string
}

interface LogoStatus {
  exists: boolean
  publicUrl?: string
  message: string
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ className = '' }) => {
  const [logoStatus, setLogoStatus] = useState<LogoStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check logo status on component mount
  useEffect(() => {
    checkLogoStatus()
  }, [])

  const checkLogoStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/setup/upload-logo')
      const data = await response.json()
      
      if (data.success) {
        setLogoStatus({
          exists: data.logoExists,
          publicUrl: data.publicUrl,
          message: data.message
        })
      } else {
        setError(data.message || 'Failed to check logo status')
      }
    } catch (err) {
      setError('Failed to check logo status')
      console.error('Logo status check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadLogo = async () => {
    try {
      setIsUploading(true)
      setError(null)
      
      const response = await fetch('/api/admin/setup/upload-logo', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLogoStatus({
          exists: true,
          publicUrl: data.data.publicUrl,
          message: data.message
        })
      } else {
        setError(data.message || 'Failed to upload logo')
      }
    } catch (err) {
      setError('Failed to upload logo')
      console.error('Logo upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`neuro-card p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 neuro-icon-container rounded-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-bright-pink animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-charcoal-black">
              Email Logo Setup
            </h3>
            <p className="font-body text-sm text-charcoal-black/70">
              Checking logo status...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`neuro-card p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 neuro-icon-container rounded-full flex items-center justify-center">
            {logoStatus?.exists ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <ImageIcon className="w-4 h-4 text-bright-pink" />
            )}
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-charcoal-black">
              Email Logo Setup
            </h3>
            <p className="font-body text-sm text-charcoal-black/70">
              {logoStatus?.message || 'Configure logo for email templates'}
            </p>
          </div>
        </div>

        {!logoStatus?.exists && (
          <button
            onClick={uploadLogo}
            disabled={isUploading}
            className="neuro-button px-4 py-2 font-body text-sm font-medium text-bright-pink hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 animate-pulse" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Logo</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Logo Preview */}
      {logoStatus?.exists && logoStatus.publicUrl && (
        <div className="mt-4 p-4 bg-soft-pink/20 rounded-lg border border-soft-pink/30">
          <div className="flex items-center space-x-4">
            <img
              src={logoStatus.publicUrl}
              alt="Email Logo Preview"
              className="w-16 h-16 object-contain rounded-lg border border-soft-pink/30"
            />
            <div>
              <p className="font-body text-sm font-medium text-charcoal-black">
                Logo Active
              </p>
              <p className="font-body text-xs text-charcoal-black/60">
                This logo will appear in all email templates
              </p>
              <button
                onClick={checkLogoStatus}
                className="font-body text-xs text-bright-pink hover:underline mt-1"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="font-body text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={checkLogoStatus}
            className="font-body text-xs text-red-600 hover:underline mt-1"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="font-body text-xs text-blue-700">
          <strong>Note:</strong> The logo is stored in a dedicated "frontend" storage bucket 
          and won't be affected by database resets. This ensures email templates always 
          have access to the logo.
        </p>
      </div>
    </div>
  )
}
