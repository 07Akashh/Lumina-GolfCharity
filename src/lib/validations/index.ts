import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  charityId: z.string().min(1),
  countryId: z.string().min(1),
  region: z.string().min(2),
  contributionPercentage: z.string().optional().or(z.literal('')),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const scoreSchema = z.object({
  value: z.number().int().min(1).max(45),
  date: z.string().min(1),
})

export const charitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
})

export const drawTypeSchema = z.enum(['random', 'algorithmic'])
