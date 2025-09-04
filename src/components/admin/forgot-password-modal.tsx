'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: 'Reset Link Sent',
          description: 'If an account with that email exists, a password reset link has been sent.',
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset link',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-md border border-soft-pink/20"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-charcoal-black/60 hover:text-charcoal-black rounded-lg hover:bg-soft-pink/10 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-soft-pink/10 rounded-full flex items-center justify-center mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-soft-pink" />
                </div>
                
                <h2 className="text-xl font-bold text-charcoal-black mb-2">
                  Forgot Password?
                </h2>
                
                <p className="text-charcoal-black/70 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none bg-white/50"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                
                <h2 className="text-xl font-bold text-charcoal-black mb-2">
                  Reset Link Sent!
                </h2>
                
                <p className="text-charcoal-black/70 text-sm mb-6">
                  If an account with that email exists, we've sent you a password reset link. 
                  Please check your email and follow the instructions.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Didn't receive the email?</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Check your spam/junk folder</li>
                        <li>Make sure you entered the correct email address</li>
                        <li>The link expires in 1 hour</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
