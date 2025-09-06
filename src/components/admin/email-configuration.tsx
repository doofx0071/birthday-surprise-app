'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CogIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const configSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required'),
  senderEmail: z.string().email('Valid email is required'),
  replyToEmail: z.string().email('Valid reply-to email is required'),
  birthdayCelebrantEmail: z.string().email('Valid birthday celebrant email is required').optional().or(z.literal('')),
  webhookUrl: z.string().url('Valid webhook URL is required').optional().or(z.literal('')),
  webhookSecret: z.string().optional(),
  testEmail: z.string().email('Valid test email is required').optional().or(z.literal('')),
})

type ConfigFormData = z.infer<typeof configSchema>

interface EmailConfig {
  id: string
  senderName: string
  senderEmail: string
  replyToEmail: string
  birthdayCelebrantEmail: string
  webhookUrl: string
  webhookSecret: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function EmailConfiguration() {
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
  })

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/email-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)

        // Reset form with fetched data
        reset({
          senderName: data.senderName || "Cela's Birthday",
          senderEmail: data.senderEmail || '',
          replyToEmail: data.replyToEmail || '',
          birthdayCelebrantEmail: data.birthdayCelebrantEmail || '',
          webhookUrl: data.webhookUrl || `${window.location.origin}/api/webhooks/mailtrap`,
          webhookSecret: data.webhookSecret || '',
          testEmail: '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error)
    }
  }

  const onSubmit = async (data: ConfigFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          replyToEmail: data.replyToEmail,
          birthdayCelebrantEmail: data.birthdayCelebrantEmail,
          webhookUrl: data.webhookUrl,
          webhookSecret: data.webhookSecret,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email configuration saved successfully',
        })
        fetchConfiguration()
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save email configuration',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async (data: ConfigFormData) => {
    if (!data.testEmail) {
      toast({
        title: 'Test Email Required',
        description: 'Please enter a test email address',
        variant: 'destructive',
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          testEmail: data.testEmail,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Test Email Sent',
          description: `Test email sent successfully to ${data.testEmail}`,
        })
        fetchConfiguration()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Test email failed')
      }
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            config?.isConfigured ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <div>
            <p className="font-medium text-charcoal-black">
              Email Configuration Status
            </p>
            <p className="text-sm text-charcoal-black/60">
              {config?.isConfigured 
                ? 'Email service is configured and ready'
                : 'Email service needs configuration'
              }
            </p>
          </div>
          {config?.lastTested && (
            <div className="ml-auto">
              <div className="flex items-center space-x-2">
                {config.testResult === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-charcoal-black/60">
                  Last tested: {new Date(config.lastTested).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h3 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <CogIcon className="w-5 h-5" />
            <span>Email Settings</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Sender Name
              </label>
              <input
                {...register('senderName')}
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Cela's Birthday"
              />
              {errors.senderName && (
                <p className="text-red-500 text-sm mt-1">{errors.senderName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Sender Email
              </label>
              <input
                {...register('senderEmail')}
                type="email"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="birthday@example.com"
              />
              {errors.senderEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.senderEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Reply-To Email
              </label>
              <input
                {...register('replyToEmail')}
                type="email"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="noreply@example.com"
              />
              {errors.replyToEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.replyToEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Birthday Celebrant Email <span className="text-charcoal-black/60">(optional)</span>
              </label>
              <input
                {...register('birthdayCelebrantEmail')}
                type="email"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="celebrant@example.com"
              />
              <p className="text-xs text-charcoal-black/50 mt-1">
                Email address to receive birthday notification emails
              </p>
              {errors.birthdayCelebrantEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdayCelebrantEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h3 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <span>🔗</span>
            <span>Webhook Configuration</span>
          </h3>
          <p className="text-sm text-charcoal-black/60 mb-4">
            Configure Mailtrap webhooks for real-time email event tracking. SMTP settings are configured via environment variables.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Webhook URL
              </label>
              <input
                {...register('webhookUrl')}
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/mailtrap`}
                readOnly
              />
              <p className="text-xs text-charcoal-black/50 mt-1">
                Use this URL in your Mailtrap webhook configuration
              </p>
              {errors.webhookUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.webhookUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Webhook Secret (Optional)
              </label>
              <input
                {...register('webhookSecret')}
                type="password"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Enter webhook secret for verification"
              />
              <p className="text-xs text-charcoal-black/50 mt-1">
                Optional secret for webhook verification
              </p>
              {errors.webhookSecret && (
                <p className="text-red-500 text-sm mt-1">{errors.webhookSecret.message}</p>
              )}
            </div>
          </div>
        </div>



        {/* Test Email */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h3 className="font-medium text-charcoal-black mb-4">Test Configuration</h3>
          
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Test Email Address <span className="text-charcoal-black/60">(optional)</span>
              </label>
              <input
                {...register('testEmail')}
                type="email"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="test@example.com"
              />
              {errors.testEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.testEmail.message}</p>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(handleTestEmail)}
              disabled={testing}
              className="flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{testing ? 'Sending...' : 'Send Test'}</span>
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  )
}
