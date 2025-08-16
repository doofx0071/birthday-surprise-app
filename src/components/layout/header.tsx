'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedHeartIcon, AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'
import { BirthdayButton } from '@/components/birthday-button'

interface HeaderProps {
  className?: string
}

const navigationItems = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'messages', label: 'Add Message', href: '#messages' },
  { id: 'contribute', label: 'Contribute', href: '#contribute' },
  { id: 'memory-map', label: 'Memory Map', href: '/memory-map', external: true },
  { id: 'gallery', label: 'Gallery', href: '#gallery' },
]

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string, external?: boolean) => {
    if (external) {
      // Navigate to external page
      window.location.href = href
    } else {
      // Scroll to section on current page
      const targetId = href.replace('#', '')
      const element = document.getElementById(targetId)

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }

    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-primary/10'
          : 'bg-transparent',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <AnimatedHeartIcon size="md" color="pink" intensity="subtle" />
            <h1 className="font-display text-xl md:text-2xl font-bold text-charcoal-black">
              Birthday Surprise
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href, (item as any).external)}
                className={cn(
                  'font-body text-sm lg:text-base font-medium transition-all duration-200',
                  'hover:text-primary hover:scale-105',
                  activeSection === item.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-charcoal-black/70'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <BirthdayButton
              onClick={() => handleNavClick('#messages')}
              variant="primary"
              size="sm"
            >
              Add Message
            </BirthdayButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={cn(
                  'block w-5 h-0.5 bg-charcoal-black transition-all duration-300',
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-charcoal-black transition-all duration-300 mt-1',
                  isMobileMenuOpen ? 'opacity-0' : ''
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-charcoal-black transition-all duration-300 mt-1',
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary/10 bg-white/95 backdrop-blur-md">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href, (item as any).external)}
                  className={cn(
                    'block w-full text-left px-4 py-3 font-body text-base font-medium',
                    'transition-all duration-200 hover:bg-primary/10 hover:text-primary',
                    activeSection === item.id
                      ? 'text-primary bg-primary/5 border-l-4 border-primary'
                      : 'text-charcoal-black/70'
                  )}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile CTA */}
              <div className="px-4 pt-4">
                <BirthdayButton
                  onClick={() => handleNavClick('#messages')}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Add Message
                </BirthdayButton>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
