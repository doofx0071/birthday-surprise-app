'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const settingsSchema = z.object({
  enableMessageApproval: z.boolean(),
  enableEmailReminders: z.boolean(),
  enableFileUploads: z.boolean(),
  maxFileSize: z.number().min(1).max(100),
  allowedFileTypes: z.string(),
  enableMaintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  enableAnalytics: z.boolean(),
  enableRealTimeUpdates: z.boolean(),
  sessionTimeout: z.number().min(15).max(1440),
  maxMessagesPerUser: z.number().min(1).max(100),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface AppSettings {
  enableMessageApproval: boolean
  enableEmailReminders: boolean
  enableFileUploads: boolean
  maxFileSize: number
  allowedFileTypes: string
  enableMaintenanceMode: boolean
  maintenanceMessage: string | null
  enableAnalytics: boolean
  enableRealTimeUpdates: boolean
  sessionTimeout: number
  maxMessagesPerUser: number
  lastUpdated: string | null
}

export function ApplicationSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  const watchMaintenanceMode = watch('enableMaintenanceMode')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/app-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        reset({
          enableMessageApproval: data.enableMessageApproval ?? true,
          enableEmailReminders: data.enableEmailReminders ?? true,
          enableFileUploads: data.enableFileUploads ?? true,
          maxFileSize: data.maxFileSize ?? 10,
          allowedFileTypes: data.allowedFileTypes ?? 'image/*,video/*',
          enableMaintenanceMode: data.enableMaintenanceMode ?? false,
          maintenanceMessage: data.maintenanceMessage ?? '',
          enableAnalytics: data.enableAnalytics ?? true,
          enableRealTimeUpdates: data.enableRealTimeUpdates ?? true,
          sessionTimeout: data.sessionTimeout ?? 60,
          maxMessagesPerUser: data.maxMessagesPerUser ?? 5,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load application settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/app-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application settings saved successfully',
        })
        fetchSettings()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save application settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-soft-pink/20 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-soft-pink/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-charcoal-black">Application Settings</h3>
          <p className="text-sm text-charcoal-black/60">
            Configure application behavior and user experience settings
          </p>
        </div>
        {settings?.lastUpdated && (
          <div className="text-sm text-charcoal-black/60">
            Last updated: {new Date(settings.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Message Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <BellIcon className="w-5 h-5" />
            <span>Message Settings</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableMessageApproval')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Require message approval</span>
              </label>
              <p className="text-xs text-charcoal-black/60 ml-6">
                When enabled, all messages must be approved before being displayed
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableEmailReminders')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable email reminders</span>
              </label>
              <p className="text-xs text-charcoal-black/60 ml-6">
                Send reminder emails to users who opted in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Maximum messages per user
              </label>
              <input
                {...register('maxMessagesPerUser', { valueAsNumber: true })}
                type="number"
                min="1"
                max="100"
                className="w-32 px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
              />
              {errors.maxMessagesPerUser && (
                <p className="text-red-500 text-sm mt-1">{errors.maxMessagesPerUser.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <CogIcon className="w-5 h-5" />
            <span>File Upload Settings</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableFileUploads')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable file uploads</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Maximum file size (MB)
                </label>
                <input
                  {...register('maxFileSize', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
                {errors.maxFileSize && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxFileSize.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Allowed file types
                </label>
                <input
                  {...register('allowedFileTypes')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder="image/*,video/*"
                />
                {errors.allowedFileTypes && (
                  <p className="text-red-500 text-sm mt-1">{errors.allowedFileTypes.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>System Settings</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableMaintenanceMode')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable maintenance mode</span>
              </label>
            </div>

            {watchMaintenanceMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Maintenance message
                </label>
                <textarea
                  {...register('maintenanceMessage')}
                  rows={3}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder="The site is currently under maintenance. Please check back later."
                />
              </motion.div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableAnalytics')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable analytics tracking</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableRealTimeUpdates')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable real-time updates</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Session timeout (minutes)
              </label>
              <input
                {...register('sessionTimeout', { valueAsNumber: true })}
                type="number"
                min="15"
                max="1440"
                className="w-32 px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
              />
              {errors.sessionTimeout && (
                <p className="text-red-500 text-sm mt-1">{errors.sessionTimeout.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={saving || !isDirty}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <>
                <ClockIcon className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
