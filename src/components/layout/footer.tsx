'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AnimatedHeartIcon, AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'

interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear()
  const girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME?.replace(/"/g, '') || "Your Special Someone"

  return (
    <footer
      className={cn(
        'bg-gradient-to-r from-primary/5 to-accent/5 border-t border-primary/10',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <AnimatedHeartIcon size="md" color="pink" intensity="subtle" />
              <h3 className="font-display text-xl font-bold text-charcoal-black">
                Birthday Surprise
              </h3>
            </div>
            <p className="font-body text-sm text-charcoal-black/70 max-w-xs mx-auto md:mx-0">
              A magical collection of love, memories, and birthday wishes for {girlfriendName}.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-display text-lg font-semibold text-charcoal-black mb-4">
              Quick Links
            </h4>
            <nav className="space-y-2">
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Contribute', href: '#contribute' },
                { label: 'Memory Map', href: '#memory-map' },
                { label: 'Gallery', href: '#gallery' },
              ].map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    const element = document.getElementById(link.href.replace('#', ''))
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="block font-body text-sm text-charcoal-black/70 hover:text-primary transition-colors duration-200 mx-auto"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Special Message */}
          <div className="text-center md:text-right">
            <h4 className="font-display text-lg font-semibold text-charcoal-black mb-4">
              With Love
            </h4>
            <div className="space-y-2">
              <p className="font-body text-sm text-charcoal-black/70">
                Made with endless love and care
              </p>
              <p className="font-body text-sm text-charcoal-black/70">
                for the most amazing person ✨
              </p>
              <div className="flex items-center justify-center md:justify-end space-x-1 mt-4">
                <AnimatedSparkleIcon size="xs" color="pink" intensity="subtle" />
                <AnimatedHeartIcon size="xs" color="roseGold" intensity="subtle" />
                <AnimatedSparkleIcon size="xs" color="pink" intensity="subtle" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="font-body text-xs text-charcoal-black/50 text-center md:text-left">
              © {currentYear} Birthday Surprise. Created with 💕 for {girlfriendName}.
            </p>
            
            <div className="flex items-center space-x-4">
              <p className="font-body text-xs text-charcoal-black/50">
                Every moment matters
              </p>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <AnimatedHeartIcon
                    key={i}
                    size="xs"
                    color="pink"
                    intensity="subtle"
                    className="opacity-60"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
