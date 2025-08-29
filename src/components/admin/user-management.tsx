'use client'

import React, { useState } from 'react'
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

type PasswordFormData = z.infer<typeof passwordSchema>

export function UserManagement() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
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
        reset()
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
            <span className="font-medium text-charcoal-black">admin</span>
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

      {/* Change Password */}
      <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
        <h4 className="font-medium text-charcoal-black mb-4 flex items-center space-x-2">
          <KeyIcon className="w-5 h-5" />
          <span>Change Password</span>
        </h4>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                {...register('currentPassword')}
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
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
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
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
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
