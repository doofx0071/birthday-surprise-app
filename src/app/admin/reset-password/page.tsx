'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token')
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setTokenError('Invalid or missing reset token')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/admin/login?from=reset')
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reset password')
      }
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-pink/20 via-white to-soft-pink/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-soft-pink/20"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-charcoal-black mb-4">
              Invalid Reset Link
            </h1>
            
            <p className="text-charcoal-black/70 mb-8">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>

            <div className="space-y-3">
              <Link href="/admin/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>

              <Link href="/admin/login?from=reset">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-pink/20 via-white to-soft-pink/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-soft-pink/20"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-charcoal-black mb-4">
              Password Reset Successful
            </h1>
            
            <p className="text-charcoal-black/70 mb-8">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>

            <Link href="/admin/login?from=reset">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-pink/20 via-white to-soft-pink/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-soft-pink/20"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-soft-pink/10 rounded-full flex items-center justify-center mb-6">
            <LockClosedIcon className="w-8 h-8 text-soft-pink" />
          </div>
          
          <h1 className="text-2xl font-bold text-charcoal-black mb-2">
            Reset Your Password
          </h1>
          
          <p className="text-charcoal-black/70">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-2">
              New Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="w-full pl-10 pr-12 py-3 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/40 hover:text-charcoal-black"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-12 py-3 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/40 hover:text-charcoal-black"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <LockClosedIcon className="w-4 h-4" />
                <span>Reset Password</span>
              </>
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/admin/login?from=reset"
              className="text-soft-pink hover:text-soft-pink/80 text-sm font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
