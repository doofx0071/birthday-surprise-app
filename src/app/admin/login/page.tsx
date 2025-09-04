'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { BirthdayCard } from '@/components/birthday-card'
import { useToast } from '@/hooks/use-toast'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { ForgotPasswordModal } from '@/components/admin/forgot-password-modal'

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, user, isAdmin, isLoading: authLoading } = useAdminAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const redirectPath = searchParams.get('redirect') || '/admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push(redirectPath)
    }
  }, [user, isAdmin, authLoading, router, redirectPath])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn(data.username, data.password)

      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard!',
        })
        router.push(redirectPath)
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/10 flex items-center justify-center p-4">
      {/* Background Hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-soft-pink/20 text-2xl animate-float">♥</div>
        <div className="absolute top-40 right-20 text-rose-gold/20 text-xl animate-float" style={{ animationDelay: '1s' }}>♥</div>
        <div className="absolute bottom-32 left-1/4 text-soft-pink/15 text-lg animate-float" style={{ animationDelay: '2s' }}>♥</div>
        <div className="absolute bottom-20 right-1/3 text-rose-gold/15 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>♥</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <BirthdayCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-soft-pink to-rose-gold rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-charcoal-black mb-2">
              Admin Dashboard
            </h1>
            <p className="text-charcoal-black/70">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal-black mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  {...register('username')}
                  type="text"
                  id="username"
                  className="w-full px-4 py-3 pl-10 border-2 border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none transition-colors bg-white/50"
                  placeholder="Enter username"
                  disabled={isLoading}
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/50" />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 pl-10 pr-10 border-2 border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none transition-colors bg-white/50"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-black/50 hover:text-charcoal-black transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-sm text-soft-pink hover:text-soft-pink/80 font-medium cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-charcoal-black/50">
              Birthday Surprise Admin Panel
            </p>
          </div>
        </BirthdayCard>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}
