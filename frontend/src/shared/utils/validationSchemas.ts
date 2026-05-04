import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address (e.g. user@example.com)'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address (e.g. user@example.com)'),
  contactNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6–9')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 20 characters')
    .regex(/(?=.*[a-z])/, 'Must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain at least one number')
    .regex(/(?=.*[@$!%*?&])/, 'Must contain at least one special character (@$!%*?&)'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  otp: z
    .string()
    .min(4, 'OTP must be at least 4 characters')
    .max(8, 'OTP too long'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 20 characters')
    .regex(/(?=.*[a-z])/, 'Must contain a lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain an uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain a number')
    .regex(/(?=.*[@$!%*?&])/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  contactNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile number')
    .optional()
    .or(z.literal('')),
});

export const operatorSchema = z.object({
  name: z
    .string()
    .min(2, 'Operator name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
});

export const planSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(1, 'Amount must be at least ₹1'),
  validity: z.string().min(1, 'Validity is required'),
  description: z.string().min(1, 'Description is required'),
  operatorId: z.number().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type OperatorFormData = z.infer<typeof operatorSchema>;
export type PlanFormData = z.infer<typeof planSchema>;
