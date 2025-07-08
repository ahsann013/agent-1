import * as z from "zod"

// Login validation schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, "Username or email is required")
    .max(100, "Username or email cannot exceed 100 characters"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

// Signup validation schema
export const signupSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),
  
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]*$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
})

// Type inference
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema> 