'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const configSchema = z.object({
  birthdayDate: z.string().min(1, 'Birthday date is required'),
  birthdayPersonName: z.string().min(1, 'Birthday person name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  countdownStartDate: z.string().optional(),
  enableCountdown: z.boolean(),
  enableEmailNotifications: z.boolean(),
  enableMessageApproval: z.boolean(),
})

type ConfigFormData = z.infer<typeof configSchema>

interface SystemConfig {
  birthdayDate: string
  birthdayPersonName: string
  timezone: string
  countdownStartDate: string | null
  enableCountdown: boolean
  enableEmailNotifications: boolean
  enableMessageApproval: boolean
  lastUpdated: string | null
}

const timezones = [
  { value: 'Asia/Manila', label: 'Asia/Manila (Philippine Time)' },
  { value: 'America/New_York', label: 'America/New_York (Eastern Time)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Time)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
]

export function SystemConfiguration() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
  })

  const watchEnableCountdown = watch('enableCountdown')

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        
        // Reset form with fetched data
        reset({
          birthdayDate: data.birthdayDate || '',
          birthdayPersonName: data.birthdayPersonName || '',
          timezone: data.timezone || 'Asia/Manila',
          countdownStartDate: data.countdownStartDate || '',
          enableCountdown: data.enableCountdown ?? true,
          enableEmailNotifications: data.enableEmailNotifications ?? true,
          enableMessageApproval: data.enableMessageApproval ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error)
      toast({
        title: 'Error',
        description: 'Failed to load system configuration',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ConfigFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'System configuration saved successfully',
        })
        fetchConfiguration()
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save system configuration',
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-soft-pink/20 rounded"></div>
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
          <h3 className="font-medium text-charcoal-black">System Configuration</h3>
          <p className="text-sm text-charcoal-black/60">
            Configure core system settings and birthday information
          </p>
        </div>
        {config?.lastUpdated && (
          <div className="text-sm text-charcoal-black/60">
            Last updated: {new Date(config.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Birthday Information */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Birthday Information</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Birthday Date
              </label>
              <input
                {...register('birthdayDate')}
                type="date"
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
              />
              {errors.birthdayDate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdayDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Birthday Person Name
              </label>
              <input
                {...register('birthdayPersonName')}
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Enter the birthday person's name"
              />
              {errors.birthdayPersonName && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdayPersonName.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5" />
            <span>System Settings</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Timezone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {errors.timezone && (
                <p className="text-red-500 text-sm mt-1">{errors.timezone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Settings */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <ClockIcon className="w-5 h-5" />
            <span>Countdown Settings</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableCountdown')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable countdown timer</span>
              </label>
            </div>

            {watchEnableCountdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Countdown Start Date (Optional)
                </label>
                <input
                  {...register('countdownStartDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
                <p className="text-xs text-charcoal-black/60 mt-1">
                  Leave empty to start countdown from today
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Application Features */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Application Features</span>
          </h4>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableEmailNotifications')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Enable email notifications</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('enableMessageApproval')}
                  type="checkbox"
                  className="rounded border-soft-pink/30 text-soft-pink focus:ring-soft-pink"
                />
                <span className="text-sm text-charcoal-black">Require message approval</span>
              </label>
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
                <span>Save Configuration</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
