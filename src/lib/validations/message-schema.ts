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
  // Name: Required, 2-100 characters (updated to match database constraint)
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  // Email: Required, valid email format
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),

  // Location: Optional string for manual entry (legacy field)
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  // New location fields for better structure
  locationCity: z.string()
    .max(100, "City must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  locationCountry: z.string()
    .max(100, "Country must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  // Coordinates for precise location
  latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),

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
  locationCity: '',
  locationCountry: '',
  latitude: undefined,
  longitude: undefined,
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
