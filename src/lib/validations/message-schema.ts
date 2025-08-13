import { z } from 'zod'

/**
 * Validation schema for birthday message submission form
 * Based on Task 06 requirements with comprehensive validation rules
 */

// Location schema for optional location data
const locationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).optional()

// Main message form validation schema
export const messageFormSchema = z.object({
  // Name: Required, 2-50 characters
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  // Email: Required, valid email format
  email: z.string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),

  // Location: Optional string for manual entry
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  // Message: Required, 10-500 characters
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters")
    .refine(
      (msg) => msg.trim().length >= 10,
      "Message must contain at least 10 meaningful characters"
    ),

  // Notifications: Optional checkbox for birthday reminders
  wantsReminders: z.boolean().default(false),

  // Auto-detected location data (separate from manual location input)
  detectedLocation: locationSchema,
})

// Type inference for TypeScript
export type MessageFormData = z.infer<typeof messageFormSchema>

// Validation schema for individual fields (for real-time validation)
export const fieldValidationSchemas = {
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  
  email: z.string()
    .email("Please enter a valid email address"),
  
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
}

// Helper function to validate individual fields
export const validateField = (fieldName: keyof typeof fieldValidationSchemas, value: string) => {
  try {
    fieldValidationSchemas[fieldName].parse(value)
    return { isValid: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid input' }
    }
    return { isValid: false, error: 'Validation error' }
  }
}

// Default form values
export const defaultFormValues: Partial<MessageFormData> = {
  name: '',
  email: '',
  location: '',
  message: '',
  wantsReminders: false,
  detectedLocation: undefined,
}

// Form submission response schema
export const messageSubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    submittedAt: z.string(),
  }).optional(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
})

export type MessageSubmissionResponse = z.infer<typeof messageSubmissionResponseSchema>
