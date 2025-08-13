import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { useAutoSave } from '../use-auto-save'
import { MessageFormData } from '@/lib/validations/message-schema'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
}

Object.defineProperty(console, 'log', {
  value: mockConsole.log,
  writable: true,
})

Object.defineProperty(console, 'error', {
  value: mockConsole.error,
  writable: true,
})

describe('useAutoSave Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  const setupHook = (options = {}) => {
    const { result: formResult } = renderHook(() =>
      useForm<MessageFormData>({
        defaultValues: {
          name: '',
          email: '',
          location: '',
          message: '',
          wantsReminders: false,
        },
      })
    )

    const { result: autoSaveResult } = renderHook(() =>
      useAutoSave({
        watch: formResult.current.watch,
        enabled: true,
        delay: 1000,
        ...options,
      })
    )

    return {
      form: formResult.current,
      autoSave: autoSaveResult.current,
    }
  }

  describe('Draft saving', () => {
    it('should save draft to localStorage when form data changes', () => {
      const onSave = jest.fn()
      const { form } = setupHook({ onSave })

      act(() => {
        form.setValue('name', 'John Doe')
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'birthday-message-draft',
        expect.stringContaining('John Doe')
      )
      expect(onSave).toHaveBeenCalled()
    })

    it('should not save draft when enabled is false', () => {
      const { form } = setupHook({ enabled: false })

      act(() => {
        form.setValue('name', 'John Doe')
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should not save draft when no meaningful content exists', () => {
      const { form } = setupHook()

      act(() => {
        form.setValue('wantsReminders', true)
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should debounce multiple rapid changes', () => {
      const { form } = setupHook()

      act(() => {
        form.setValue('name', 'J')
        form.setValue('name', 'Jo')
        form.setValue('name', 'John')
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('Draft loading', () => {
    it('should load draft from localStorage', () => {
      const draftData = {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Happy birthday!',
          wantsReminders: false,
        },
        timestamp: Date.now(),
        id: 'test-draft-id',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(draftData))

      const { autoSave } = setupHook()

      const loadedDraft = autoSave.loadDraft()
      expect(loadedDraft).toEqual(draftData)
    })

    it('should return null when no draft exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { autoSave } = setupHook()

      const loadedDraft = autoSave.loadDraft()
      expect(loadedDraft).toBeNull()
    })

    it('should return null and clear storage for expired drafts', () => {
      const expiredDraft = {
        data: { name: 'John Doe' },
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        id: 'expired-draft',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredDraft))

      const { autoSave } = setupHook()

      const loadedDraft = autoSave.loadDraft()
      expect(loadedDraft).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('birthday-message-draft')
    })

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')

      const { autoSave } = setupHook()

      const loadedDraft = autoSave.loadDraft()
      expect(loadedDraft).toBeNull()
      expect(mockConsole.error).toHaveBeenCalled()
    })
  })

  describe('Draft restoration', () => {
    it('should restore draft data and call onRestore callback', () => {
      const draftData = {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Happy birthday!',
          wantsReminders: true,
        },
        timestamp: Date.now(),
        id: 'test-draft-id',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(draftData))

      const onRestore = jest.fn()
      const { autoSave } = setupHook({ onRestore })

      const restoredData = autoSave.restoreDraft()
      expect(restoredData).toEqual(draftData.data)
      expect(onRestore).toHaveBeenCalledWith(draftData.data)
    })

    it('should return null when no draft to restore', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { autoSave } = setupHook()

      const restoredData = autoSave.restoreDraft()
      expect(restoredData).toBeNull()
    })
  })

  describe('Draft management', () => {
    it('should clear draft from localStorage', () => {
      const { autoSave } = setupHook()

      autoSave.clearDraft()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('birthday-message-draft')
    })

    it('should check if draft exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: { name: 'John' },
        timestamp: Date.now(),
        id: 'test-id',
      }))

      const { autoSave } = setupHook()

      expect(autoSave.hasDraft()).toBe(true)

      mockLocalStorage.getItem.mockReturnValue(null)
      expect(autoSave.hasDraft()).toBe(false)
    })

    it('should get draft info', () => {
      const draftData = {
        data: { name: 'John' },
        timestamp: 1234567890,
        id: 'test-draft-id',
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(draftData))

      const { autoSave } = setupHook()

      // Call hasDraft first to trigger the internal state
      autoSave.hasDraft()

      const draftInfo = autoSave.getDraftInfo()
      expect(draftInfo).toEqual({
        timestamp: 1234567890,
        id: 'test-draft-id',
      })
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const { form } = setupHook()

      act(() => {
        form.setValue('name', 'John Doe')
      })

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Failed to save draft:',
        expect.any(Error)
      )
    })
  })
})
