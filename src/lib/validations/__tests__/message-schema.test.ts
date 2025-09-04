import { messageFormSchema, type MessageFormData, defaultFormValues } from '../message-schema'

describe('Message Schema Validation', () => {
  describe('Valid data', () => {
    it('should validate correct message data', () => {
      const validData: MessageFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        location: 'New York, USA',
        message: 'Happy birthday! Hope you have an amazing day.',
        wantsReminders: true,
      }

      const result = messageFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate minimal required data', () => {
      const minimalData: MessageFormData = {
        name: 'Jo',
        email: 'j@a.co',
        message: 'Happy bday!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })

    it('should handle optional fields', () => {
      const dataWithoutLocation: MessageFormData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Wishing you all the best on your special day!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(dataWithoutLocation)
      expect(result.success).toBe(true)
    })
  })

  describe('Name validation', () => {
    it('should reject names that are too short', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        message: 'Happy birthday!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject names that are too long', () => {
      const data = {
        name: 'A'.repeat(51),
        email: 'john@example.com',
        message: 'Happy birthday!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 50 characters')
      }
    })

    it('should reject empty names', () => {
      const data = {
        name: '',
        email: 'john@example.com',
        message: 'Happy birthday!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Email validation', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ]

      validEmails.forEach(email => {
        const data = {
          name: 'John Doe',
          email,
          message: 'Happy birthday!',
          wantsReminders: false,
        }

        const result = messageFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example',
      ]

      invalidEmails.forEach(email => {
        const data = {
          name: 'John Doe',
          email,
          message: 'Happy birthday!',
          wantsReminders: false,
        }

        const result = messageFormSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toContain('valid email')
        }
      })
    })
  })

  describe('Message validation', () => {
    it('should reject messages that are too short', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hi!',
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 10 characters')
      }
    })

    it('should accept long messages', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'A'.repeat(1000), // Test with a very long message
        wantsReminders: false,
      }

      const result = messageFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept messages at the boundary limits', () => {
      const minMessage = 'A'.repeat(10)
      const maxMessage = 'A'.repeat(500)

      const dataMin = {
        name: 'John Doe',
        email: 'john@example.com',
        message: minMessage,
        wantsReminders: false,
      }

      const dataMax = {
        name: 'John Doe',
        email: 'john@example.com',
        message: maxMessage,
        wantsReminders: false,
      }

      expect(messageFormSchema.safeParse(dataMin).success).toBe(true)
      expect(messageFormSchema.safeParse(dataMax).success).toBe(true)
    })
  })

  describe('Location validation', () => {
    it('should accept valid locations', () => {
      const validLocations = [
        'New York, USA',
        'London, UK',
        'Tokyo, Japan',
        'São Paulo, Brazil',
        undefined,
        '',
      ]

      validLocations.forEach(location => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Happy birthday!',
          location,
          wantsReminders: false,
        }

        const result = messageFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Default values', () => {
    it('should have correct default values', () => {
      expect(defaultFormValues).toEqual({
        name: '',
        email: '',
        location: '',
        message: '',
        wantsReminders: false,
      })
    })
  })
})
