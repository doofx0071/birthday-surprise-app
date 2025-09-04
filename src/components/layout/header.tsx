'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

import { BirthdayButton } from '@/components/birthday-button'

interface HeaderProps {
  className?: string
}

const navigationItems = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'gallery', label: 'Gallery', href: '#gallery' },
  { id: 'memory-map', label: 'Memory Map', href: '/memory-map', external: true },
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
          ? 'neuro-header-scrolled'
          : 'bg-transparent',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/icons/svg/logo.svg"
                alt="Cela's Birthday Logo"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
                priority
              />
              <h1 className={cn(
                "font-body text-xl md:text-2xl font-bold transition-colors duration-300",
                isScrolled ? "text-primary" : "text-white"
              )}>
                Cela's Birthday
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href, (item as any).external)}
                className={cn(
                  'font-body text-sm lg:text-base font-medium transition-all duration-300',
                  'px-4 py-2 rounded-lg cursor-pointer hover:cursor-pointer',
                  activeSection === item.id
                    ? 'neuro-button text-primary'
                    : 'text-charcoal-black/70 hover:text-primary hover:neuro-button-hover'
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
            className="md:hidden p-2 neuro-button cursor-pointer hover:cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={cn(
                  'block w-5 h-0.5 bg-primary transition-all duration-300',
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-primary transition-all duration-300 mt-1',
                  isMobileMenuOpen ? 'opacity-0' : ''
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-primary transition-all duration-300 mt-1',
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden neuro-card mt-2 mx-4 mb-4">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href, (item as any).external)}
                  className={cn(
                    'block w-full text-left px-4 py-3 font-body text-base font-medium',
                    'transition-all duration-300 cursor-pointer hover:cursor-pointer',
                    'mx-2 rounded-lg',
                    activeSection === item.id
                      ? 'neuro-button text-primary'
                      : 'text-charcoal-black/70 hover:text-primary hover:neuro-button-hover'
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
