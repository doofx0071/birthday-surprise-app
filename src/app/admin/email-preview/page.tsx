'use client'

import React, { useState, useEffect } from 'react'
import { render } from '@react-email/render'
import PasswordResetEmail from '@/components/emails/password-reset'

export default function EmailPreviewPage() {
  const [emailHtml, setEmailHtml] = useState<string>('')
  const resetLink = 'https://doofio.site/admin/reset-password?token=sample-reset-token-123'

  useEffect(() => {
    const generateEmailHtml = async () => {
      const html = await render(PasswordResetEmail({
        adminName: 'Admin',
        resetLink,
        expirationTime: '1 hour'
      }))
      setEmailHtml(html)
    }

    generateEmailHtml()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Password Reset Email Template Preview
          </h1>
          <p className="text-gray-600 mb-4">
            This is how the password reset email will look when sent to admin users.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a preview page for development purposes. 
              The actual email will be sent via Mailtrap when a password reset is requested.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Email Preview</h2>
          </div>
          <div className="p-6">
            {emailHtml ? (
              <iframe
                srcDoc={emailHtml}
                className="w-full h-[800px] border border-gray-200 rounded-lg"
                title="Email Preview"
              />
            ) : (
              <div className="w-full h-[800px] border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading email preview...</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Design Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Professional pink/white branding</li>
                <li>• Responsive design for all devices</li>
                <li>• Clear call-to-action button</li>
                <li>• Birthday Surprise logo and branding</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Security Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• One-time use reset links</li>
                <li>• 1-hour expiration time</li>
                <li>• Clear security warnings</li>
                <li>• Professional security notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
