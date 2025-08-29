'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function EmailSettings() {
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailConfig, setEmailConfig] = useState<Array<{
    label: string
    value: string
    status: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch email configuration from API to avoid hydration mismatch
    const fetchEmailConfig = async () => {
      try {
        const response = await fetch('/api/admin/email-config')
        if (response.ok) {
          const data = await response.json()
          setEmailConfig([
            {
              label: 'SMTP Host',
              value: data.host || 'Not configured',
              status: data.host ? 'configured' : 'missing',
            },
            {
              label: 'SMTP Port',
              value: data.port || 'Not configured',
              status: data.port ? 'configured' : 'missing',
            },
            {
              label: 'From Email',
              value: data.from || 'Not configured',
              status: data.from ? 'configured' : 'missing',
            },
            {
              label: 'API Token',
              value: data.hasApiToken ? 'Configured' : 'Not configured',
              status: data.hasApiToken ? 'configured' : 'missing',
            },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch email config:', error)
        // Fallback configuration
        setEmailConfig([
          { label: 'SMTP Host', value: 'Not configured', status: 'missing' },
          { label: 'SMTP Port', value: 'Not configured', status: 'missing' },
          { label: 'From Email', value: 'Not configured', status: 'missing' },
          { label: 'API Token', value: 'Not configured', status: 'missing' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchEmailConfig()
  }, [])

  const handleTestEmail = async () => {
    setTestingEmail(true)
    
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: process.env.EMAIL_FROM || 'admin@example.com',
          subject: 'Admin Dashboard Test Email',
        }),
      })

      if (response.ok) {
        toast({
          title: 'Test Email Sent',
          description: 'Check your inbox for the test email.',
        })
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      console.error('Test email error:', error)
      toast({
        title: 'Test Email Failed',
        description: 'Failed to send test email. Check your email configuration.',
        variant: 'destructive',
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'configured' ? (
      <CheckCircleIcon className="w-4 h-4 text-green-500" />
    ) : (
      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <EnvelopeIcon className="w-5 h-5 text-soft-pink" />
          <h3 className="font-display text-lg font-semibold text-charcoal-black">
            Email Configuration
          </h3>
        </div>
        <Button
          size="sm"
          onClick={handleTestEmail}
          disabled={testingEmail}
          className="flex items-center space-x-2"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          <span>{testingEmail ? 'Sending...' : 'Test Email'}</span>
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/40 border border-soft-pink/10">
                <div className="w-4 h-4 bg-soft-pink/20 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-soft-pink/20 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-soft-pink/20 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          emailConfig.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/40 border border-soft-pink/10"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-medium text-charcoal-black">{item.label}</p>
                  <p className="text-sm text-charcoal-black/60">{item.value}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-soft-pink/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-charcoal-black">Email Service Status</h4>
            <p className="text-sm text-charcoal-black/60">
              {emailConfig.every(c => c.status === 'configured') 
                ? 'All email settings configured' 
                : 'Some email settings missing'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              emailConfig.every(c => c.status === 'configured') 
                ? 'bg-green-500' 
                : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              emailConfig.every(c => c.status === 'configured') 
                ? 'text-green-600' 
                : 'text-yellow-600'
            }`}>
              {emailConfig.every(c => c.status === 'configured') ? 'Ready' : 'Needs Setup'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
