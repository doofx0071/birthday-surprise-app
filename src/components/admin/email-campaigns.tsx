'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PlusIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  templateId: z.string().min(1, 'Template is required'),
  scheduledDate: z.string().optional(),
  recipientType: z.enum(['all', 'approved', 'pending']),
  customRecipients: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface EmailCampaign {
  id: string
  name: string
  templateId: string
  templateName: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  recipientType: 'all' | 'approved' | 'pending'
  recipientCount: number
  sentCount: number
  scheduledDate: string | null
  createdAt: string
  sentAt: string | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
}

export function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      recipientType: 'all',
    },
  })

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/email-campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const onSubmit = async (data: CampaignFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email campaign created successfully',
        })
        fetchCampaigns()
        setShowCreateForm(false)
        reset()
      } else {
        throw new Error('Failed to create campaign')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create email campaign',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return

    try {
      const response = await fetch(`/api/admin/email-campaigns/${campaignId}/send`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email campaign started successfully',
        })
        fetchCampaigns()
      } else {
        throw new Error('Failed to send campaign')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email campaign',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'sending':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'scheduled':
        return <CalendarIcon className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100'
      case 'sending':
        return 'text-blue-600 bg-blue-100'
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-charcoal-black">Email Campaigns</h3>
          <p className="text-sm text-charcoal-black/60">
            Create and manage email campaigns for birthday notifications
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Campaign</span>
        </Button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 rounded-lg p-6 border border-soft-pink/20"
        >
          <h4 className="font-medium text-charcoal-black mb-4">Create New Campaign</h4>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Campaign Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder="Birthday Notification Campaign"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Email Template
                </label>
                <select
                  {...register('templateId')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </option>
                  ))}
                </select>
                {errors.templateId && (
                  <p className="text-red-500 text-sm mt-1">{errors.templateId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Recipients
                </label>
                <select
                  {...register('recipientType')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                >
                  <option value="all">All message senders</option>
                  <option value="approved">Approved messages only</option>
                  <option value="pending">Pending messages only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Schedule Date (Optional)
                </label>
                <input
                  {...register('scheduledDate')}
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  reset()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-8 bg-white/40 rounded-lg border border-soft-pink/20">
            <PaperAirplaneIcon className="w-12 h-12 text-charcoal-black/30 mx-auto mb-3" />
            <p className="text-charcoal-black/60">No email campaigns yet</p>
            <p className="text-sm text-charcoal-black/40">Create your first campaign to get started</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 rounded-lg p-6 border border-soft-pink/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(campaign.status)}
                    <h4 className="font-medium text-charcoal-black">{campaign.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-charcoal-black/60">
                    <div>
                      <span className="font-medium">Template:</span> {campaign.templateName}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {campaign.recipientCount}
                    </div>
                    <div>
                      <span className="font-medium">Sent:</span> {campaign.sentCount}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {campaign.scheduledDate && (
                    <div className="mt-2 text-sm text-charcoal-black/60">
                      <span className="font-medium">Scheduled:</span> {new Date(campaign.scheduledDate).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {campaign.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSendCampaign(campaign.id)}
                      className="flex items-center space-x-1"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Send Now</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
