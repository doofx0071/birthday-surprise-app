'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { UseFormWatch } from 'react-hook-form'
import { MessageFormData } from '@/lib/validations/message-schema'

interface UseAutoSaveOptions {
  watch: UseFormWatch<MessageFormData>
  delay?: number // Auto-save delay in milliseconds
  enabled?: boolean
  onSave?: (data: Partial<MessageFormData>) => void
  onRestore?: (data: Partial<MessageFormData>) => void
}

interface DraftData {
  data: Partial<MessageFormData>
  timestamp: number
  id: string
}

const STORAGE_KEY = 'birthday-message-draft'
const AUTO_SAVE_DELAY = 2000 // 2 seconds

// Helper function to check if we're in the browser
const isClient = () => typeof window !== 'undefined'

export const useAutoSave = ({
  watch,
  delay = AUTO_SAVE_DELAY,
  enabled = true,
  onSave,
  onRestore
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')
  const draftIdRef = useRef<string>('')
  const [isClientSide, setIsClientSide] = useState(false)

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClientSide(true)
  }, [])

  // Generate unique draft ID
  const generateDraftId = useCallback(() => {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Save draft to localStorage
  const saveDraft = useCallback((data: Partial<MessageFormData>) => {
    // Triple check for client-side environment
    if (!enabled || typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      const draftData: DraftData = {
        data,
        timestamp: Date.now(),
        id: draftIdRef.current || generateDraftId()
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData))
      draftIdRef.current = draftData.id
      lastSavedRef.current = JSON.stringify(data)

      onSave?.(data)

      console.log('Draft saved:', draftData.id)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }, [enabled, onSave, generateDraftId])

  // Load draft from localStorage
  const loadDraft = useCallback((): DraftData | null => {
    // Triple check for client-side environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const draftData: DraftData = JSON.parse(stored)

      // Check if draft is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      if (Date.now() - draftData.timestamp > maxAge) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return draftData
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }, [])

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    // Triple check for client-side environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(STORAGE_KEY)
      draftIdRef.current = ''
      lastSavedRef.current = ''
      console.log('Draft cleared')
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }, [])

  // Check if there's a draft available
  const hasDraft = useCallback((): boolean => {
    const draft = loadDraft()
    return draft !== null
  }, [loadDraft])

  // Restore draft data
  const restoreDraft = useCallback((): Partial<MessageFormData> | null => {
    const draft = loadDraft()
    if (!draft) return null

    draftIdRef.current = draft.id
    onRestore?.(draft.data)
    
    return draft.data
  }, [loadDraft, onRestore])

  // Get draft info
  const getDraftInfo = useCallback((): { timestamp: number; id: string } | null => {
    const draft = loadDraft()
    return draft ? { timestamp: draft.timestamp, id: draft.id } : null
  }, [loadDraft])

  // Watch form data and auto-save
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const subscription = watch((data) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Check if data has actually changed
      const currentData = JSON.stringify(data)
      if (currentData === lastSavedRef.current) {
        return
      }

      // Only save if there's meaningful content
      const hasContent = data.name || data.email || data.message || data.location
      if (!hasContent) {
        return
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        saveDraft(data)
      }, delay)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [watch, enabled, delay, saveDraft])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    restoreDraft,
    getDraftInfo,
    draftId: draftIdRef.current
  }
}
