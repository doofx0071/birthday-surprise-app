'use client'

import { useState, useEffect } from 'react'
import { AdminLayoutClient } from '@/components/admin/admin-layout-client'

interface CountdownStatus {
  currentDate: string
  birthdayDate: string
  birthdayPersonName: string
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  isComplete: boolean
  emailsSent: boolean
  nextCronRunIn: string
  isOriginalDate: boolean
}

export default function TestCountdownPage() {
  const [status, setStatus] = useState<CountdownStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/test-countdown')
      const data = await response.json()
      if (data.success) {
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  // Set test countdown
  const setTestCountdown = async (minutesFromNow: number) => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/test-countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutesFromNow }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(data.message)
        await fetchStatus()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
    setLoading(false)
  }

  // Reset to original date
  const resetToOriginal = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/test-countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToOriginal: true }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(data.message)
        await fetchStatus()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
    setLoading(false)
  }

  // Reset email status
  const resetEmailStatus = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/test-countdown', {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setMessage(data.message)
        await fetchStatus()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
    setLoading(false)
  }

  // Manual cron trigger
  const triggerCron = async (force = false) => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/trigger-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceEmailSending: force }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(`Cron triggered successfully! ${data.results.emailProcessing}`)
        await fetchStatus()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <AdminLayoutClient>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Countdown & Email System</h1>

        {/* Current Status */}
        {status && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Birthday Person:</strong> {status.birthdayPersonName}</p>
                <p><strong>Birthday Date:</strong> {new Date(status.birthdayDate).toLocaleString()}</p>
                <p><strong>Is Original Date:</strong> {status.isOriginalDate ? '✅ Yes' : '❌ Test Date'}</p>
              </div>
              <div>
                <p><strong>Countdown Complete:</strong> {status.isComplete ? '🎉 YES' : '⏰ No'}</p>
                <p><strong>Emails Sent:</strong> {status.emailsSent ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Next Cron Run:</strong> {status.nextCronRunIn}</p>
              </div>
            </div>
            
            {!status.isComplete && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-lg font-mono">
                  ⏰ {status.timeRemaining.days}d {status.timeRemaining.hours}h {status.timeRemaining.minutes}m {status.timeRemaining.seconds}s
                </p>
              </div>
            )}

            {status.isComplete && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-800">🎂 Countdown Complete!</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Quick Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setTestCountdown(2)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              2 Minutes
            </button>
            <button
              onClick={() => setTestCountdown(5)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              5 Minutes
            </button>
            <button
              onClick={() => setTestCountdown(10)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              10 Minutes
            </button>
            <button
              onClick={() => setTestCountdown(15)}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              15 Minutes
            </button>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎛️ Manual Controls</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => triggerCron(false)}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                🔄 Trigger Cron (Normal)
              </button>
              <button
                onClick={() => triggerCron(true)}
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                🔥 Force Send Emails
              </button>
              <button
                onClick={resetEmailStatus}
                disabled={loading}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                🔄 Reset Email Status
              </button>
              <button
                onClick={resetToOriginal}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                🏠 Reset to Original Date
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">📋 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Set Test Countdown:</strong> Click a time button to set countdown completion in X minutes</li>
            <li><strong>Wait for Completion:</strong> Watch the countdown reach zero</li>
            <li><strong>Check Email Trigger:</strong> Emails should trigger automatically via countdown or cron</li>
            <li><strong>Manual Testing:</strong> Use "Force Send Emails" to test email system directly</li>
            <li><strong>Reset for Re-testing:</strong> Use "Reset Email Status" to test again</li>
            <li><strong>Return to Normal:</strong> Use "Reset to Original Date" when done testing</li>
          </ol>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded">
            ⏳ Processing...
          </div>
        )}
      </div>
    </AdminLayoutClient>
  )
}
