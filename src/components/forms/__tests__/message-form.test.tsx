import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageForm } from '../message-form'

// Mock the auto-save hook
jest.mock('@/hooks/use-auto-save', () => ({
  useAutoSave: () => ({
    hasDraft: () => false,
    getDraftInfo: () => null,
    restoreDraft: () => null,
    clearDraft: jest.fn(),
    saveDraft: jest.fn(),
  }),
}))

// Mock the geolocation hook
jest.mock('@/hooks/use-geolocation', () => ({
  useGeolocation: () => ({
    location: null,
    error: null,
    loading: false,
    getCurrentLocation: jest.fn(),
    supported: true,
  }),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('MessageForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Message submitted successfully!',
        data: { id: 'test-id', submittedAt: new Date().toISOString() },
      }),
    })
  })

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/your name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(
      screen.getByLabelText(/your message/i),
      'Happy birthday! Hope you have an amazing day filled with joy and laughter!'
    )
  }

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<MessageForm />)

      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/your message/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/birthday reminders/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit message/i })).toBeInTheDocument()
    })

    it('should render form title and description', () => {
      render(<MessageForm />)

      expect(screen.getByText(/add your birthday wish/i)).toBeInTheDocument()
      expect(screen.getByText(/share a heartfelt message/i)).toBeInTheDocument()
    })

    it('should show character count for message field', () => {
      render(<MessageForm />)

      expect(screen.getByText(/0 \/ 500/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate name length', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const nameInput = screen.getByLabelText(/your name/i)
      await user.type(nameInput, 'J')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should validate message length', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const messageInput = screen.getByLabelText(/your message/i)
      await user.type(messageInput, 'Short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('should update character count as user types', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const messageInput = screen.getByLabelText(/your message/i)
      await user.type(messageInput, 'Hello world!')

      expect(screen.getByText(/12 \/ 500/)).toBeInTheDocument()
    })

    it('should prevent submission when form is invalid', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<MessageForm onSubmit={onSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      expect(onSubmit).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            location: '',
            message: 'Happy birthday! Hope you have an amazing day filled with joy and laughter!',
            wantsReminders: false,
          }),
        })
      })
    })

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/message submitted successfully/i)).toBeInTheDocument()
      })
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).not.toBeInTheDocument()
        expect(screen.getByDisplayValue('john@example.com')).not.toBeInTheDocument()
      })
    })

    it('should call custom onSubmit handler when provided', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<MessageForm onSubmit={onSubmit} />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          location: '',
          message: 'Happy birthday! Hope you have an amazing day filled with joy and laughter!',
          wantsReminders: false,
        })
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<MessageForm />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should handle submission errors', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Server error occurred',
        }),
      })

      render(<MessageForm />)

      await fillForm(user)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/server error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<MessageForm />)

      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/your message/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/birthday reminders/i)).toBeInTheDocument()
    })

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<MessageForm />)

      const submitButton = screen.getByRole('button', { name: /submit message/i })
      await user.click(submitButton)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/your name/i)
        const errorMessage = screen.getByText(/name must be at least 2 characters/i)
        
        expect(nameInput).toHaveAttribute('aria-describedby')
        expect(errorMessage).toHaveAttribute('id')
      })
    })
  })
})
