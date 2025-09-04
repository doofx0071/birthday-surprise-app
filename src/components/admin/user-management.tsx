'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserPlusIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type PasswordFormData = z.infer<typeof passwordSchema>
type EmailFormData = z.infer<typeof emailSchema>
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function UserManagement() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string; email?: string } | null>(null)
  const { toast } = useToast()

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    reset: resetForgotPassword,
    formState: { errors: forgotPasswordErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/admin/current-user')
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      } else {
        // Fallback to placeholder data
        setCurrentUser({
          username: 'admin',
          email: 'admin@doofio.site'
        })
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Fallback to placeholder data
      setCurrentUser({
        username: 'admin',
        email: 'admin@doofio.site'
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully',
        })
        resetPassword()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsUpdatingEmail(true)
    try {
      const response = await fetch('/api/admin/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        toast({
          title: 'Email Updated',
          description: 'Your email address has been updated successfully',
        })
        resetEmail()
        fetchCurrentUser()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update email')
      }
    } catch (error) {
      toast({
        title: 'Email Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update email',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setIsSendingReset(true)
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        toast({
          title: 'Reset Link Sent',
          description: 'If an account with that email exists, a password reset link has been sent.',
        })
        resetForgotPassword()
        setShowForgotPassword(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description: error instanceof Error ? error.message : 'Failed to send reset link',
        variant: 'destructive',
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-charcoal-black">User Management</h3>
        <p className="text-sm text-charcoal-black/60">
          Manage admin user accounts and security settings
        </p>
      </div>

      {/* Current Admin Info */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <ShieldCheckIcon className="w-5 h-5" />
          <span>Current Admin User</span>
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-black/70">Username:</span>
            <span className="font-medium text-charcoal-black">{currentUser?.username || 'admin'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-black/70">Email:</span>
            <span className="font-medium text-charcoal-black">{currentUser?.email || 'admin@doofio.site'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-black/70">Role:</span>
            <span className="font-medium text-charcoal-black">Administrator</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-black/70">Status:</span>
            <span className="flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Update Email Address */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <EnvelopeIcon className="w-5 h-5" />
          <span>Update Email Address</span>
        </h4>

        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
              <input
                {...registerEmail('email')}
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder={currentUser?.email || 'Enter your email address'}
                defaultValue={currentUser?.email || ''}
              />
            </div>
            {emailErrors.email && (
              <p className="text-red-500 text-sm mt-1">{emailErrors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isUpdatingEmail}
            className="flex items-center space-x-2"
          >
            <EnvelopeIcon className="w-4 h-4" />
            <span>{isUpdatingEmail ? 'Updating...' : 'Update Email'}</span>
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Updating your email address will change the email used for password reset notifications.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <KeyIcon className="w-5 h-5" />
          <span>Change Password</span>
        </h4>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/60 hover:text-charcoal-black"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/60 hover:text-charcoal-black"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...registerPassword('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/60 hover:text-charcoal-black"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center space-x-2"
          >
            <KeyIcon className="w-4 h-4" />
            <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
          </Button>
        </form>
      </div>

      {/* Password Reset Testing */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <KeyIcon className="w-5 h-5" />
          <span>Password Reset</span>
        </h4>

        <div className="space-y-4">
          <p className="text-sm text-charcoal-black/70">
            Test the password reset functionality or send yourself a password reset email.
          </p>

          <form onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Email Address for Reset
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
                <input
                  {...registerForgotPassword('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder={currentUser?.email || 'Enter email address'}
                  defaultValue={currentUser?.email || ''}
                />
              </div>
              {forgotPasswordErrors.email && (
                <p className="text-red-500 text-sm mt-1">{forgotPasswordErrors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSendingReset}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>{isSendingReset ? 'Sending...' : 'Send Password Reset Email'}</span>
            </Button>
          </form>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Testing:</strong> This will send a real password reset email to the specified address.
              Use this to test the forgot password functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>Security Recommendations</span>
        </h4>

        <div className="space-y-3 text-sm text-charcoal-black/70">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Change your password regularly, especially if you suspect it may have been compromised</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Never share your admin credentials with anyone</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Always log out when finished using the admin panel</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-soft-pink rounded-full mt-2"></div>
            <p>Monitor system logs for any suspicious activity</p>
          </div>
        </div>
      </div>

      {/* Future Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <UserPlusIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Future Enhancement</h4>
            <p className="text-sm text-blue-700 mt-1">
              Multi-user support with role-based access control is planned for future releases. 
              This will allow you to create additional admin users with different permission levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
